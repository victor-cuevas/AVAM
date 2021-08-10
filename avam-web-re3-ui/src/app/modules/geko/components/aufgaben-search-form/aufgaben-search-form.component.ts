import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { Unsubscribable } from 'oblique-reactive';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { AvamBenutzerstelleAutosuggestComponent, SortByPipe } from '@app/shared';
import { DateValidator } from '@shared/validators/date-validator';
import { emptyFormValidator } from '@shared/validators/empty-form.validator';
import { GekoSearchHelper } from '@modules/geko/utils/geko-search.helper';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { GekoAufgabenSearchRequest, GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { GeKoAufgabeSuchenDTO } from '@dtos/geKoAufgabeSuchenDTO';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { takeUntil } from 'rxjs/operators';
import { UserValidator } from '@shared/validators/autosuggest-validator';
import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { FacadeService } from '@shared/services/facade.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-aufgaben-search-form',
    templateUrl: './aufgaben-search-form.component.html',
    providers: [SearchSessionStorageService, ObliqueHelperService]
})
export class AufgabenSearchFormComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    static readonly CACHE_STATE_KEY = 'geko-aufgaben-search-cache-state-key';
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('benutzerVerantwortlich') benutzerVerantwortlich: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('benutzerstelle') benutzerstelle: AvamBenutzerstelleAutosuggestComponent;
    searchFormGroup: FormGroup;
    statusDropdownLabels: any[] = [];
    geschaeftsArtDropdownLabels: any[] = [];
    benutzerstelleSuchenTokens: any = {};
    benutzerSuchenTokens: any = {};
    benutzerstelleSucheParams: BenutzerstelleSucheParamsModel;
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    private static readonly noSearchCriteria = 'geko.error.noSearchCriteria';
    private static readonly val201 = 'i18n.validation.val201';
    private static readonly searchValidationMessage = { suc0805013emptySearch: { valid: false, value: null } };

    constructor(
        private formBuilder: FormBuilder,
        public gekoSearchHelper: GekoSearchHelper,
        private gekoAufgabenService: GekoAufgabenService,
        private sortByPipe: SortByPipe,
        private facade: FacadeService,
        private obliqueHelperService: ObliqueHelperService,
        private searchSessionStorageService: SearchSessionStorageService
    ) {
        super();
    }

    set status(value: Array<CodeDTO>) {
        this.statusDropdownLabels = value.map(AufgabenSearchFormComponent.statusMapper());
    }

    set geschaeftsarten(value: Array<CodeDTO>) {
        this.geschaeftsArtDropdownLabels = this.sortByPipe.transform(value.map(AufgabenSearchFormComponent.geschaeftsartMapper()), 'label', false, true);
    }

    ngOnInit(): void {
        this.initForm();
        this.initBenutzerstelleSucheParams();
        this.initTokens();
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.onLangChange());
    }

    ngAfterViewInit(): void {
        const state = this.searchSessionStorageService.restoreStateByKey(AufgabenSearchFormComponent.CACHE_STATE_KEY);
        if (state) {
            this.checkBenutzerVerantwortlichPatch(state.fields);
            this.searchFormGroup.patchValue(state.fields);
            this.patchDateValues(state.fields);
        } else {
            this.initFormData();
        }
    }

    submit(spinnerChannel: string): void {
        this.gekoAufgabenService.clearMessages();
        if (this.searchFormGroup.invalid) {
            this.gekoAufgabenService.showMessage(this.getErrorMessage(), 'danger');
        } else {
            this.storeState();

            const req: GekoAufgabenSearchRequest = {
                request: this.getRequest(),
                statusDropdownLabels: this.statusDropdownLabels,
                geschaeftsArtDropdownLabels: this.geschaeftsArtDropdownLabels,
                searchFormGroup: this.searchFormGroup
            };
            this.gekoAufgabenService.search(req, spinnerChannel);
        }
    }

    reset(): void {
        this.searchFormGroup.reset();
        this.initFormData();
    }

    private static statusMapper(): any {
        return (code: CodeDTO) => {
            return {
                value: code.code,
                labelFr: code.textFr,
                labelIt: code.textIt,
                labelDe: code.textDe
            };
        };
    }

    private static geschaeftsartMapper(): any {
        return (code: CodeDTO) => {
            return {
                value: code.codeId,
                labelFr: code.textFr,
                labelIt: code.textIt,
                labelDe: code.textDe
            };
        };
    }

    private storeState(): void {
        const storage: any = {
            status: this.get('status'),
            geschaeftsart: this.get('geschaeftsart'),
            aufgabenText: this.get('aufgabenText'),
            benutzerstellenId: this.getControlObjectValue(this.searchFormGroup.controls['benutzerstellenId'], 'benutzerstelleObject'),
            benutzerVerantwortlich: this.getControlObjectValue(this.searchFormGroup.controls['benutzerVerantwortlich'], 'benutzerObject'),
            benutzerInitialisiert: this.getControlObjectValue(this.searchFormGroup.controls['benutzerInitialisiert'], 'benutzerObject'),
            datumVon: this.get('datumVon'),
            datumBis: this.get('datumBis')
        };
        this.searchSessionStorageService.storeFieldsByKey(AufgabenSearchFormComponent.CACHE_STATE_KEY, storage);
    }

    private getControlObjectValue(control: AbstractControl, object: string): any {
        if (control.value) {
            return control[object];
        }
        return null;
    }

    private getRequest(): GeKoAufgabeSuchenDTO {
        const request: GeKoAufgabeSuchenDTO = {
            benutzerInitialisiertId: this.gekoSearchHelper.getSafeId(this.searchFormGroup.controls['benutzerInitialisiert']['benutzerObject'].benutzerDetailId),
            benutzerVerantwortlichId: this.gekoSearchHelper.getSafeId(this.searchFormGroup.controls['benutzerVerantwortlich']['benutzerObject'].benutzerDetailId),
            benutzerstelleVerantwortlichId: this.gekoSearchHelper.getSafeId(this.searchFormGroup.controls['benutzerstellenId']['benutzerstelleObject'].benutzerstelleId),
            geschaeftsartId: this.get('geschaeftsart'),
            meldungsText: this.get('aufgabenText'),
            meldungenVon: this.facade.formUtilsService.parseDate(this.get('datumVon')),
            meldungenBis: this.facade.formUtilsService.parseDate(this.get('datumBis')),
            statusCode: this.get('status'),
            orBenutzerVerknuepfung: false,
            language: this.facade.translateService.currentLang
        } as GeKoAufgabeSuchenDTO;
        return request;
    }

    private get(key: string): any {
        return this.searchFormGroup.get(key).value;
    }

    private initForm(): void {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.searchFormGroup = this.formBuilder.group(
            {
                status: null,
                geschaeftsart: null,
                aufgabenText: null,
                benutzerstellenId: [null, UserValidator.val214frontend],
                benutzerVerantwortlich: [null, UserValidator.val213frontend],
                benutzerInitialisiert: [null, UserValidator.val213frontend],
                datumVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                datumBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: [DateValidator.rangeBetweenDates('datumVon', 'datumBis', 'val201'), emptyFormValidator([], AufgabenSearchFormComponent.searchValidationMessage)]
            }
        );
    }

    private initBenutzerstelleSucheParams(): void {
        this.benutzerstelleSucheParams = {
            benutzerstellentyp: null,
            vollzugsregiontyp: null,
            status: StatusEnum.AKTIV,
            kanton: null
        };
    }

    private initTokens(): void {
        if (this.gekoSearchHelper.isUserLogged()) {
            this.benutzerstelleSuchenTokens = this.gekoSearchHelper.getBenutzerstelleSuchenTokens();
            this.benutzerSuchenTokens = this.gekoSearchHelper.getBenutzerSuchenTokens();
        }
    }

    private initFormData(): void {
        this.benutzerVerantwortlich.appendCurrentUser();
    }

    private onLangChange() {
        // if sorting pipe is used in the HTML, it won't react on language change properly ;(
        this.geschaeftsArtDropdownLabels = this.sortByPipe.transform(this.geschaeftsArtDropdownLabels, 'label', false, true);
    }

    private getErrorMessage(): string {
        if (this.searchFormGroup.errors) {
            return this.searchFormGroup.errors.suc0805013emptySearch ? AufgabenSearchFormComponent.noSearchCriteria : AufgabenSearchFormComponent.val201;
        } else {
            return null;
        }
    }

    private patchDateValues(fields: any) {
        if (fields.datumVon) {
            this.searchFormGroup.controls.datumVon.setValue(new Date(fields.datumVon));
        }
        if (fields.datumBis) {
            this.searchFormGroup.controls.datumBis.setValue(new Date(fields.datumBis));
        }
    }

    private checkBenutzerVerantwortlichPatch(fields: any) {
        if (!fields.benutzerVerantwortlich) {
            delete fields.benutzerVerantwortlich;
        }
    }

    onInputBenutzerVerantwortlich(event: any) {
        // for IE - onKeyup, for other browsers - onInput
        const value = event && event.target ? event.target.value : event;
        if (value === '') {
            // workaround for the "undefined undefined" displaying if the state is loaded from cache
            this.searchFormGroup.controls['benutzerVerantwortlich'].reset();
            return;
        }
    }
}
