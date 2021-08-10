import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacadeService } from '@shared/services/facade.service';
import { CodeDTO } from '@dtos/codeDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { Router } from '@angular/router';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { NumberValidator } from '@shared/validators/number-validator';
import { BerufSuchenParamDTO } from '@dtos/berufSuchenParamDTO';

@Component({
    selector: 'avam-beruf-suchen-form',
    templateUrl: './beruf-suchen-form.component.html',
    styleUrls: ['./beruf-suchen-form.component.scss']
})
export class BerufSuchenFormComponent extends Unsubscribable implements OnInit, AfterViewInit {
    static readonly STATE_KEY = 'beruf-search';
    @Output() restoreCache: EventEmitter<void> = new EventEmitter();
    searchForm: FormGroup;
    statusDropdownLabels: any[];
    anerkennungsoptionsDropdownLabels: any[];
    channel = 'BerufSuchenForm';
    readonly defaultStatus = 'active';

    constructor(
        private fb: FormBuilder,
        private facadeService: FacadeService,
        private stesDataRestService: StesDataRestService,
        private searchSession: SearchSessionStorageService,
        private router: Router
    ) {
        super();
    }

    ngOnInit(): void {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.searchForm.reset());
        this.generateForm();
    }

    ngAfterViewInit(): void {
        this.getInitialData();
    }

    public getInitialData(): void {
        this.facadeService.spinnerService.activate(this.channel);
        const dropdownStatusObservable = this.stesDataRestService.getCode(DomainEnum.STES_STATUS);
        const dropdownAnerkennungsObservable = this.stesDataRestService.getCode(DomainEnum.ANERKENNUNGSFORM);
        const dropdownStatusAllObservable = this.stesDataRestService.getFixedCode(DomainEnum.COMMON_STATUS_ALL_OPTION);

        forkJoin<CodeDTO[]>(dropdownStatusObservable, dropdownStatusAllObservable, dropdownAnerkennungsObservable)
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
            .subscribe(([status, statusAll, anerkennungsform]) => {
                this.statusDropdownLabels = [...status, ...statusAll].map(this.customPropertyMapper);
                this.anerkennungsoptionsDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(anerkennungsform);
                this.searchForm.controls.gueltigkeit.setValue(this.defaultStatus);
                const state = this.searchSession.restoreStateByKey(BerufSuchenFormComponent.STATE_KEY);
                if (state) {
                    this.restoreStateAndSearch(state);
                } else {
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            });
    }

    public storeState(): void {
        const formSearchControls = this.searchForm.controls;
        const storage: any = {
            gueltigkeit: formSearchControls.gueltigkeit.value,
            beruftaetigkeit: formSearchControls.beruftaetigkeit.value,
            anerkennungsform: formSearchControls.anerkennungsform.value,
            bfsStammcode: formSearchControls.bfsStammcode.value,
            berufsgruppe: formSearchControls.berufsgruppe['berufsgruppeAutosuggestObject']
                ? formSearchControls.berufsgruppe['berufsgruppeAutosuggestObject']
                : {
                      chIscoBerufId: -1,
                      berufsArtDe: formSearchControls.berufsgruppe.value,
                      berufsArtFr: formSearchControls.berufsgruppe.value,
                      berufsArtIt: formSearchControls.berufsgruppe.value
                  }
        };
        this.searchSession.storeFieldsByKey(BerufSuchenFormComponent.STATE_KEY, storage);
    }

    mapToDTO(): BerufSuchenParamDTO {
        const formSearchControls = this.searchForm.controls;
        return {
            gueltigkeit: formSearchControls.gueltigkeit.value,
            bezeichnung: formSearchControls.beruftaetigkeit.value,
            anerkennungsformId: formSearchControls.anerkennungsform.value,
            bfsStammcode: formSearchControls.bfsStammcode.value,
            chIscoBeruf: formSearchControls.berufsgruppe['berufsgruppeAutosuggestObject']
        };
    }

    private generateForm(): void {
        this.searchForm = this.fb.group({
            gueltigkeit: null,
            beruftaetigkeit: null,
            anerkennungsform: null,
            bfsStammcode: [null, [NumberValidator.isPositiveIntegerWithMaxLength(8)]],
            berufsgruppe: null
        });
    }

    private restoreStateAndSearch(state) {
        this.searchForm.patchValue(state.fields);
        this.restoreCache.emit();
    }

    private customPropertyMapper = (element: CodeDTO) => {
        return {
            value: !!element.code ? (element.code === '1' ? 'active' : 'inactive') : 'all',
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    };
}
