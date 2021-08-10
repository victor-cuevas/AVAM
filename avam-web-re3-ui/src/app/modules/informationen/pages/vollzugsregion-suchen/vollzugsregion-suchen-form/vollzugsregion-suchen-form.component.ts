import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacadeService } from '@shared/services/facade.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { forkJoin } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { VollzugsregionSuchenParamDTO } from '@dtos/vollzugsregionSuchenParamDTO';
import { KantonDTO } from '@dtos/kantonDTO';
import { StatusEnum } from '@shared/classes/fixed-codes';

@Component({
    selector: 'avam-vollzugsregion-suchen-form',
    templateUrl: './vollzugsregion-suchen-form.component.html',
    styleUrls: ['./vollzugsregion-suchen.component.scss']
})
export class VollzugsregionSuchenFormComponent extends Unsubscribable implements OnInit, AfterViewInit {
    static readonly stateKey = 'vollzugsregion-search';
    @Output() restoreCache: EventEmitter<void> = new EventEmitter();

    public benutzerstelleSucheParams = {
        status: StatusEnum.AKTIV
    };
    searchForm: FormGroup;
    readonly channel = 'vollzugsregionSuchenChannel';
    vollzugsregionenTypDropdown: any[] = [];
    kantonDropdown: any[] = [];
    public benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.DEFAULT;

    constructor(
        private fb: FormBuilder,
        private facadeService: FacadeService,
        private stesDataRestService: StesDataRestService,
        private searchSession: SearchSessionStorageService
    ) {
        super();
    }

    ngOnInit() {
        this.generateForm();
        this.setSubscriptions();
    }

    ngAfterViewInit() {
        this.getInitialData();
    }

    mapToDTO(): VollzugsregionSuchenParamDTO {
        return {
            suchtext: this.searchForm.controls.bezeichnung.value,
            vollzugsregionTypeCode: this.searchForm.controls.vollzugsregionenTyp.value,
            code: this.searchForm.controls.vollzugsregion.value,
            kantonsKuerzel: this.searchForm.controls.kanton.value,
            benutzerstelleDTO: this.searchForm.controls.benutzerstelle['benutzerstelleObject'],
            gemeindeDTO: this.searchForm.controls.gemeinde['customGemeindeObj']
        };
    }

    storeState(): void {
        const storage: any = {
            bezeichnung: this.searchForm.controls.bezeichnung.value,
            vollzugsregionenTyp: this.searchForm.controls.vollzugsregionenTyp.value,
            gemeinde: this.searchForm.controls.gemeinde['gemeindeObj']
                ? this.searchForm.controls.gemeinde['gemeindeObj']
                : {
                      gemeindeBaseInfo: {
                          bfsNummer: '',
                          gemeindeId: -1,
                          nameDe: this.searchForm.controls.gemeinde.value,
                          nameFr: this.searchForm.controls.gemeinde.value,
                          nameIt: this.searchForm.controls.gemeinde.value
                      },
                      kanton: '',
                      plz: '',
                      ortschaftsbezeichnung: '',
                      value: this.searchForm.controls.gemeinde.value
                  },
            kanton: this.searchForm.controls.kanton.value,
            benutzerstelle: this.searchForm.controls.benutzerstelle['benutzerstelleObject'] ? this.searchForm.controls.benutzerstelle['benutzerstelleObject'] : null,
            vollzugsregion: this.searchForm.controls.vollzugsregion.value
        };
        this.searchSession.storeFieldsByKey(VollzugsregionSuchenFormComponent.stateKey, storage);
    }

    getInitialData() {
        this.facadeService.spinnerService.activate(this.channel);
        forkJoin<CodeDTO[]>([this.stesDataRestService.getCode(DomainEnum.VOLLZUGSREGIONTYP), this.stesDataRestService.getAllKantone()]).subscribe(
            ([vollzugsregionenTyp, kantonen]) => {
                this.vollzugsregionenTypDropdown = vollzugsregionenTyp.map(this.customPropertyMapper);
                this.kantonDropdown = kantonen.map(this.kantonMapper).sort((s1, s2) => this.compareByLanguages(s1, s2));
                const state = this.searchSession.restoreStateByKey(VollzugsregionSuchenFormComponent.stateKey);
                if (state) {
                    this.restoreStateAndSearch(state);
                }
            }
        );
    }

    private generateForm(): void {
        this.searchForm = this.fb.group({
            bezeichnung: null,
            vollzugsregionenTyp: null,
            gemeinde: null,
            kanton: null,
            benutzerstelle: null,
            vollzugsregion: null
        });
    }

    private customPropertyMapper = (element: CodeDTO) => {
        return {
            value: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    };
    private kantonMapper = (element: KantonDTO) => {
        return {
            value: element.kantonsKuerzel,
            labelFr: element.nameFr,
            labelIt: element.nameIt,
            labelDe: element.nameDe
        };
    };

    private setSubscriptions() {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.kantonDropdown.sort((s1, s2) => this.compareByLanguages(s1, s2));
        });
    }

    private restoreStateAndSearch(state) {
        this.searchForm.patchValue({
            bezeichnung: state.fields.bezeichnung,
            vollzugsregionenTyp: state.fields.vollzugsregionenTyp,
            kanton: state.fields.kanton,
            vollzugsregion: state.fields.vollzugsregion
        });
        this.updateBenutzerstelle(state.fields.benutzerstelle);
        this.updateGemeindeSuche(state.fields.gemeinde);
        this.restoreCache.emit();
    }

    private compareByLanguages(val1: any, val2: any): any {
        const currentLang = this.facadeService.dbTranslateService.getCurrentLang();
        const toSearch = currentLang.substring(0, 1).toUpperCase() + currentLang.substring(1);
        return val1[`label${toSearch}`].localeCompare(val2[`label${toSearch}`]);
    }

    private updateGemeindeSuche(gemeindeState: any): void {
        if (gemeindeState && gemeindeState.value) {
            this.searchForm.controls.gemeinde.setValue(gemeindeState);
        }
    }

    private updateBenutzerstelle(benutzerstelle: any) {
        if (benutzerstelle && benutzerstelle.code !== null) {
            this.searchForm.controls.benutzerstelle.setValue(benutzerstelle);
        }
    }

    openBenutzerstelleSuche(benutzerstellenSuche: any): void {
        this.facadeService.openModalFensterService.openXLModal(benutzerstellenSuche);
    }

    updateBenutzerstelleSuche(event: any): void {
        if (event) {
            if (event.benutzerstelleObj) {
                this.searchForm.controls.benutzerstelle.setValue({
                    code: event.id,
                    benutzerstelleId: event.benutzerstelleObj.benutzerstelleId
                });
            } else {
                this.searchForm.controls.benutzerstelle.setValue(event);
            }
        }
    }
}
