import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacadeService } from '@shared/services/facade.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { ZahlstelleSuchenParamDTO } from '@dtos/zahlstelleSuchenParamDTO';

@Component({
    selector: 'avam-zahlstellen-suchen-form',
    templateUrl: './zahlstellen-suchen-form.component.html'
})
export class ZahlstellenSuchenFormComponent implements OnInit, AfterViewInit {
    static readonly stateKey = 'zahlstellen-search';
    @Output() restoreCache: EventEmitter<void> = new EventEmitter();

    searchForm: FormGroup;

    statusDropdownLabels: any[];
    alkStatusDropdownLabels = [
        { value: 'all', labelDe: 'Alle', labelFr: 'Tous', labelIt: 'Tutti' },
        { value: 'public', labelDe: 'Öffentliche', labelFr: 'Publiques', labelIt: 'Pubblico' },
        { value: 'private', labelDe: 'Private', labelFr: 'Privées', labelIt: 'Privati' }
    ];

    readonly defaultStatus = 'all';
    readonly channel = 'zahlstellenSuchenChannel';

    constructor(
        private fb: FormBuilder,
        private facadeService: FacadeService,
        private stesDataRestService: StesDataRestService,
        private searchSession: SearchSessionStorageService
    ) {}

    ngOnInit(): void {
        this.generateForm();
    }

    ngAfterViewInit() {
        this.getInitialData();
    }

    mapToDTO(): ZahlstelleSuchenParamDTO {
        return {
            gueltigkeit: this.searchForm.controls.gueltigkeit.value,
            alkStatus: this.searchForm.controls.alkStatus.value,
            alkNr: this.searchForm.controls.alkNr.value,
            kurzname: this.searchForm.controls.kurzName.value,
            standStrasse: this.searchForm.controls.strasseNr.value,
            plzSearch: this.searchForm.controls.postleitzahl.value
        };
    }

    storeState(): void {
        const storage: any = {
            gueltigkeit: this.searchForm.controls.gueltigkeit.value,
            alkStatus: this.searchForm.controls.alkStatus.value,
            alkNr: this.searchForm.controls.alkNr.value,
            kurzName: this.searchForm.controls.kurzName.value,
            strasseNr: this.searchForm.controls.strasseNr.value,
            postleitzahl: this.searchForm.controls.postleitzahl.value,
            ort: this.searchForm.controls.ort.value
        };
        this.searchSession.storeFieldsByKey(ZahlstellenSuchenFormComponent.stateKey, storage);
    }

    reset(): void {
        this.searchSession.clearStorageByKey(ZahlstellenSuchenFormComponent.stateKey);
        this.getInitialData();
    }

    public getInitialData(): void {
        this.facadeService.spinnerService.activate(this.channel);
        const dropdownStatusObservable = this.stesDataRestService.getCode(DomainEnum.STES_STATUS);
        const dropdownStatusAllObservable = this.stesDataRestService.getFixedCode(DomainEnum.COMMON_STATUS_ALL_OPTION);

        forkJoin<CodeDTO[]>(dropdownStatusObservable, dropdownStatusAllObservable)
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
            .subscribe(([status, statusAll]) => {
                this.statusDropdownLabels = [...status, ...statusAll].map(this.customPropertyMapper);
                this.searchForm.controls.gueltigkeit.setValue(this.defaultStatus);
                this.searchForm.controls.alkStatus.setValue(this.defaultStatus);
                const state = this.searchSession.restoreStateByKey(ZahlstellenSuchenFormComponent.stateKey);
                if (state) {
                    this.restoreStateAndSearch(state);
                }
            });
    }

    private generateForm(): void {
        this.searchForm = this.fb.group({
            gueltigkeit: null,
            alkStatus: null,
            alkNr: null,
            kurzName: null,
            strasseNr: null,
            postleitzahl: null,
            ort: null
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
