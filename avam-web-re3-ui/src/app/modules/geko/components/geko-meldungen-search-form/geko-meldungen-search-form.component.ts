import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { forkJoin, Subscription } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { GeschaeftsMeldungenRequestDTO } from '@shared/models/dtos-generated/geschaeftsMeldungenRequestDTO';
import { GekoMeldungService } from '@modules/geko/services/geko-meldung.service';
import { AvamBenutzerstelleAutosuggestComponent, SortByPipe } from '@app/shared';
import { GekoMeldungRestService } from '@core/http/geko-meldung-rest.service';
import { DateValidator } from '@shared/validators/date-validator';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { GekoSearchHelper } from '@modules/geko/utils/geko-search.helper';
import { UserValidator } from '@shared/validators/autosuggest-validator';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-geko-meldungen-search-form',
    templateUrl: './geko-meldungen-search-form.component.html',
    providers: [SearchSessionStorageService]
})
export class GekoMeldungenSearchFormComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly CACHE_STATE_KEY = 'geko-meldungen-search-form';

    @ViewChild('benutzerVerantwortlich') benutzerVerantwortlich: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('benutzerstellenId') benutzerstellenId: AvamBenutzerstelleAutosuggestComponent;
    searchForm: FormGroup;
    requestDTO: GeschaeftsMeldungenRequestDTO;
    benutzerstelleSuchenTokens: any = {};
    benutzerSuchenTokens: any = {};
    statusDropdownLabels: any[] = [];
    geschaeftsArtDropdownLabels: any[] = [];
    dropdownsSub: Subscription;
    gekoMeldungenChannel = 'gekoMeldungenSearchResult-modal';
    benutzerstelleSucheParams: BenutzerstelleSucheParamsModel = {
        benutzerstellentyp: null,
        vollzugsregiontyp: null,
        status: StatusEnum.AKTIV,
        kanton: null
    };
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(
        private formBuilder: FormBuilder,
        private stesDataRestService: StesDataRestService,
        private gekoMeldungService: GekoMeldungService,
        private gekoMeldungRestService: GekoMeldungRestService,
        private sortByPipe: SortByPipe,
        public gekoSearchHelper: GekoSearchHelper,
        private searchSession: SearchSessionStorageService,
        private facade: FacadeService
    ) {}

    ngOnInit() {
        this.searchForm = this.createSearchForm();
        this.initTokens();
        this.initDropdownLabels();
    }

    ngAfterViewInit(): void {
        const state = this.restoreFormStateFromCache();
        if (!state) {
            this.initFormData();
            this.onSubmit();
        } else {
            this.restoreFormStateFromCacheAndSearchAgain(state);
        }
    }

    ngOnDestroy() {
        if (this.dropdownsSub) {
            this.dropdownsSub.unsubscribe();
        }
    }

    statusPropertyMapper = (element: CodeDTO) => {
        return {
            value: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    };

    onSubmit(): void {
        if (!Object.keys(this.searchForm.controls).find(c => this.searchForm.controls[c].value)) {
            this.gekoMeldungService.clearMessages();
            this.gekoMeldungService.showMessage('geko.error.noSearchCriteria', 'danger');
            return;
        }
        if (this.searchForm.valid) {
            this.storeFormInCache();
            this.gekoMeldungService.clearMessages();
            this.requestDTO = this.mapToDTO();
            this.gekoMeldungService.callSearchMeldungen(this.requestDTO, this.searchForm, this.gekoMeldungenChannel);
        }
    }

    reset(): void {
        this.searchForm.reset();
        this.initFormData();
        this.gekoMeldungService.resetSearchResults();
    }

    onLangChange(): void {
        // if sorting pipe is used in the HTML, it won't react on language change properly ;(
        this.geschaeftsArtDropdownLabels = this.sortByPipe.transform(this.geschaeftsArtDropdownLabels, 'label', false, true);
    }

    private storeFormInCache(): void {
        const formState = {
            status: this.searchForm.get('status').value,
            geschaeftsart: this.searchForm.get('geschaeftsart').value,
            datumVon: this.asTimestamp(this.searchForm.get('datumVon')),
            datumBis: this.asTimestamp(this.searchForm.get('datumBis'))
        };

        this.addBenutzerstellenIdToState(formState);
        this.addPersonalberaterValue(formState, 'benutzerVerantwortlich');
        this.addPersonalberaterValue(formState, 'benutzerInitialisiert');
        this.searchSession.storeFieldsByKey(GekoMeldungenSearchFormComponent.CACHE_STATE_KEY, formState);
    }

    private asTimestamp(control: AbstractControl) {
        if (!(control.value instanceof Date)) {
            return null;
        }

        return control.value.getTime();
    }

    private addBenutzerstellenIdToState(formState: object) {
        const benutzerstelleObject: object = this.searchForm.get('benutzerstellenId')['benutzerstelleObject'];
        if (benutzerstelleObject['benutzerstelleId'] === -1) {
            return;
        }
        formState['benutzerstellenId'] = {
            code: benutzerstelleObject['code'],
            benutzerstelleId: benutzerstelleObject['benutzerstelleId']
        };
    }

    private addPersonalberaterValue(formState: object, fieldName: string) {
        const control: AbstractControl = this.searchForm.get(fieldName);
        if (control['benutzerObject']['benutzerId'] === -1) {
            return;
        }

        formState[fieldName] = control['benutzerObject'];
    }

    private restoreFormStateFromCacheAndSearchAgain(state: object) {
        if (!state) {
            return;
        }

        const fields = state['fields'];

        this.asDate(fields, 'datumVon');
        this.asDate(fields, 'datumBis');
        this.searchForm.patchValue(fields);

        this.onSubmit();
    }

    private asDate(state: object, fieldName: string) {
        if (!state[fieldName]) {
            return;
        }

        state[fieldName] = new Date(state[fieldName]);
    }

    private initFormData(): void {
        this.gekoSearchHelper.initBenutzerVerantwortlichBenutzerstelle(this.searchForm, this.benutzerVerantwortlich, true);
    }

    private restoreFormStateFromCache() {
        return this.searchSession.restoreStateByKey(GekoMeldungenSearchFormComponent.CACHE_STATE_KEY);
    }

    private initDropdownLabels(): void {
        this.dropdownsSub = forkJoin<CodeDTO[], CodeDTO[]>([
            this.stesDataRestService.getCode(DomainEnum.GEKO_STATUS_MELDUNG),
            this.gekoMeldungRestService.loadGeschaeftsarte()
        ]).subscribe(([status, geschaeftsart]) => {
            this.statusDropdownLabels = status.map(this.statusPropertyMapper);
            this.geschaeftsArtDropdownLabels = this.sortByPipe.transform(this.facade.formUtilsService.mapDropdownKurztext(geschaeftsart), 'label', false, true);
        });
    }

    private initTokens(): void {
        if (this.gekoSearchHelper.isUserLogged()) {
            this.benutzerstelleSuchenTokens = this.gekoSearchHelper.getBenutzerstelleSuchenTokens();
            this.benutzerSuchenTokens = this.gekoSearchHelper.getBenutzerSuchenTokens();
        }
    }

    private createSearchForm() {
        return this.formBuilder.group(
            {
                status: null,
                geschaeftsart: null,
                benutzerstellenId: [null, UserValidator.val214frontend],
                benutzerVerantwortlich: [null, UserValidator.val213frontend],
                benutzerInitialisiert: [null, UserValidator.val213frontend],
                datumVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                datumBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: [DateValidator.rangeBetweenDates('datumVon', 'datumBis', 'val201')]
            }
        );
    }

    private mapToDTO(): GeschaeftsMeldungenRequestDTO {
        const dto: GeschaeftsMeldungenRequestDTO = {
            benutzerInitialisiertId: 0,
            benutzerVerantwortlichId: 0,
            benutzerstelleVerantwortlichId: 0,
            geschaeftsartId: 0,
            meldungenBis: null,
            meldungenVon: null,
            statusCode: null,
            orBenutzerVerknuepfung: true
        };
        dto.statusCode = this.searchForm.get('status').value;
        dto.geschaeftsartId = this.searchForm.get('geschaeftsart').value;
        if (this.searchForm.controls['benutzerstellenId'] && this.searchForm.controls['benutzerstellenId']['benutzerstelleObject']) {
            dto.benutzerstelleVerantwortlichId = this.gekoSearchHelper.getSafeId(this.searchForm.controls['benutzerstellenId']['benutzerstelleObject'].benutzerstelleId);
        }
        dto.benutzerVerantwortlichId = this.gekoSearchHelper.getSafeId(this.searchForm.controls['benutzerVerantwortlich']['benutzerObject'].benutzerDetailId);
        dto.benutzerInitialisiertId = this.gekoSearchHelper.getSafeId(this.searchForm.controls['benutzerInitialisiert']['benutzerObject'].benutzerDetailId);
        dto.meldungenVon = this.searchForm.get('datumVon').value;
        dto.meldungenBis = this.searchForm.get('datumBis').value;
        return dto;
    }
}
