import { DomainEnum } from '@shared/enums/domain.enum';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateValidator } from '@shared/validators/date-validator';
import { GekoStesService } from '@shared/services/geko-stes.service';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { UserDto } from '@dtos/userDto';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { GeKoGeschaeftSuchenDTO } from '@dtos/geKoGeschaeftSuchenDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import {
    AvamBenutzerstelleAutosuggestComponent,
    BenutzerstelleAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { TranslateService } from '@ngx-translate/core';
import { SortByPipe } from '@app/shared';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { UserValidator } from '@shared/validators/autosuggest-validator';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { StesSearchResultComponent } from '@modules/geko/components/stes-search-result/stes-search-result.component';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-geko-stes-search-form',
    templateUrl: './stes-search-form.component.html',
    providers: [SearchSessionStorageService]
})
export class StesSearchFormComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static readonly CACHE_STATE_KEY = 'geko-stes-search-cache';

    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('fallbearbeiter') fallbearbeiter: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('benutzerstelle') benutzerstelle: AvamBenutzerstelleAutosuggestComponent;
    gekoStesSearchFormGroup: FormGroup;
    geschaeftsartenOptions: any[] = [];
    sachstaendeOptions: any[] = [];
    benutzerstelleSuchenTokens: any = {};
    benutzerstelleSucheParams: BenutzerstelleSucheParamsModel;
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    private currentUser: UserDto;
    private selectedFallbearbeiter: any;

    constructor(
        private formBuilder: FormBuilder,
        private translateService: TranslateService,
        private gekoStesService: GekoStesService,
        private sortByPipe: SortByPipe,
        private obliqueHelper: ObliqueHelperService,
        private searchSessionStorageService: SearchSessionStorageService
    ) {
        super();
    }

    set geschaeftsarten(value: CodeDTO[]) {
        this.geschaeftsartenOptions = this.sortByPipe.transform(value.map(StesSearchFormComponent.codeMapper()), 'label', false, true);
    }

    set sachstaende(value: CodeDTO[]) {
        this.sachstaendeOptions = value.map(StesSearchFormComponent.codeMapper());
    }

    ngOnInit(): void {
        this.initCurrentUser();
        this.initForm();
        this.initTokens();
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.onLangChange());
    }

    ngAfterViewInit(): void {
        const state = this.searchSessionStorageService.restoreStateByKey(StesSearchFormComponent.CACHE_STATE_KEY);
        if (state) {
            this.gekoStesSearchFormGroup.patchValue(state.fields);
            this.patchDateValues(state.fields);
        } else {
            this.initFormData();
        }
    }

    submit(spinnerChannel: string): void {
        const request = this.getRequest();
        if (this.gekoStesSearchFormGroup.valid) {
            this.storeState();
            this.gekoStesService.searchGeschaeftStes(
                {
                    request,
                    gekoStesSearchFormGroup: this.gekoStesSearchFormGroup,
                    geschaeftsartenOptions: this.geschaeftsartenOptions,
                    sachstaendeOptions: this.sachstaendeOptions,
                    selectedFallbearbeiter: this.selectedFallbearbeiter
                },
                spinnerChannel
            );
        }
    }

    reset(): void {
        this.gekoStesSearchFormGroup.reset();
        this.initFormData();
        this.gekoStesService.reset();
    }

    updateBenutzerstelleSuche(event: any): void {
        this.gekoStesSearchFormGroup.controls.benutzerstellenId.setValue({
            code: event.id,
            benutzerstelleId: event.benutzerstelleObj ? event.benutzerstelleObj.benutzerstelleId : -1
        });
    }

    openBenutzerstelleSuche(benutzerstellenSuche: any): void {
        this.gekoStesService.openModal(benutzerstellenSuche);
    }

    getRequest(): GeKoGeschaeftSuchenDTO {
        const request: GeKoGeschaeftSuchenDTO = {} as GeKoGeschaeftSuchenDTO;
        this.setValue(request, 'geschaeftsartId');
        this.setValue(request, 'sachstandId');
        this.setValueWith(request, 'isBerater', 'istBerater');
        this.setValueWith(request, 'isBearbeiter', 'istBearbeiter');
        this.setValueWith(request, 'isFreigeber', 'istFreigeber');
        this.setValueWith(request, 'isFallbearbeiterLeer', 'istFallbearbeiterLeer');
        this.setValueWith(request, 'dateFrom', 'geschaeftsterminVon');
        this.setValueWith(request, 'dateUntil', 'geschaeftsterminBis');
        this.setValueWith(request, 'dateErfasstFrom', 'erstelltAmVon');
        this.setValueWith(request, 'dateErfasstUntil', 'erstelltAmBis');
        request.benutzerId = this.setValueFallbearb();
        request.benutzerstelleId = this.setValueBenutzerStelleId();
        return request;
    }

    onFallbearbeiterLeer(): void {
        if (this.gekoStesSearchFormGroup.controls.istFallbearbeiterLeer.value) {
            this.checkboxChecking(false);
            this.gekoStesSearchFormGroup.controls.fallbearbeiterId.setValue(null);
            this.selectedFallbearbeiter = null;
            this.fallbearbeiter.isDisabled = true;
        } else if (this.fallbearbeiter.isDisabled) {
            this.fallbearbeiter.isDisabled = false;
        }
    }

    onFilterChange(value: boolean): void {
        if (value && this.gekoStesSearchFormGroup.controls.istFallbearbeiterLeer.value) {
            this.gekoStesSearchFormGroup.controls.istFallbearbeiterLeer.setValue(false);
            this.fallbearbeiter.isDisabled = false;
        }
    }

    onChangeGeschaeftsartId(geschaeftsartId): void {
        this.gekoStesService
            .searchSachstaende(geschaeftsartId || -1)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((sachstaende: CodeDTO[]) => {
                this.sachstaende = sachstaende;
            });
        if (this.gekoStesSearchFormGroup.controls.sachstandId.value !== '') {
            this.gekoStesSearchFormGroup.controls.sachstandId.setValue('');
        }
    }

    onSelectFallbearbeiter(value: any): void {
        this.selectedFallbearbeiter = value;
        if (value === '') {
            // workaround for the "undefined undefined" displaying if the state is loaded from cache
            this.gekoStesSearchFormGroup.controls['fallbearbeiterId'].reset();
            return;
        }
        if (!!value) {
            this.checkboxChecking(true);
        }
    }

    onChangeFallbearbeiterInput(event: any): void {
        // for IE - onKeyup, for other browsers - onInput
        const value = event && event.target ? event.target.value : event;
        if (value === '') {
            // workaround for the "undefined undefined" displaying if the state is loaded from cache
            this.gekoStesSearchFormGroup.controls['fallbearbeiterId'].reset();
            return;
        }
        if (!value) {
            this.selectedFallbearbeiter = null;
            this.checkboxChecking(false);
            if (this.fallbearbeiter) {
                this.fallbearbeiter.benutzerDetail = null;
            }
            if (!this.gekoStesSearchFormGroup.controls.istFallbearbeiterLeer.value) {
                this.gekoStesSearchFormGroup.controls.benutzerstellenId.setValue(null);
            }
        } else if (value.benuStelleCode) {
            this.selectedFallbearbeiter = value;
            this.checkboxChecking(true);
        }
    }

    isEmpty(): boolean {
        if (this.isChecked()) {
            return false;
        } else {
            const isNotEmpty: boolean =
                this.gekoStesSearchFormGroup.controls.geschaeftsartId.value ||
                this.gekoStesSearchFormGroup.controls.sachstandId.value ||
                this.gekoStesSearchFormGroup.controls.geschaeftsterminVon.value ||
                this.gekoStesSearchFormGroup.controls.geschaeftsterminBis.value ||
                this.gekoStesSearchFormGroup.controls.erstelltAmVon.value ||
                this.gekoStesSearchFormGroup.controls.erstelltAmBis.value ||
                this.gekoStesSearchFormGroup.controls.benutzerstellenId.value ||
                (this.gekoStesSearchFormGroup.controls.fallbearbeiterId.value && this.gekoStesSearchFormGroup.controls.fallbearbeiterId.value !== '');
            return !isNotEmpty;
        }
    }

    public initFormData(): void {
        this.fallbearbeiter.appendCurrentUser();
        this.checkboxChecking(true);
    }

    private static codeMapper(): any {
        return (code: CodeDTO) => {
            return {
                value: code.codeId,
                labelFr: code.textFr,
                labelIt: code.textIt,
                labelDe: code.textDe
            };
        };
    }

    private isChecked(): boolean {
        return (
            this.gekoStesSearchFormGroup.controls.istBerater.value ||
            this.gekoStesSearchFormGroup.controls.istBearbeiter.value ||
            this.gekoStesSearchFormGroup.controls.istFreigeber.value
        );
    }

    private setValue(obj: any, key: string): void {
        const value = this.gekoStesSearchFormGroup.controls[key].value;
        if (value) {
            obj[key] = value;
        }
    }

    private setValueWith(obj: any, key: string, controlName: string, field?: string): void {
        const control = this.gekoStesSearchFormGroup.controls[controlName];
        if (field && control && control.value) {
            obj[key] = control.value[field];
        } else if (control) {
            obj[key] = control.value;
        }
    }

    private setValueFallbearb() {
        const benutzerObject = this.gekoStesSearchFormGroup.controls['fallbearbeiterId']['benutzerObject'];
        if (benutzerObject && benutzerObject.benutzerDetailId && +benutzerObject.benutzerDetailId > 0) {
            return +benutzerObject.benutzerDetailId;
        } else {
            return null;
        }
    }

    private setValueBenutzerStelleId() {
        const benutzerstelleObject = this.gekoStesSearchFormGroup.controls['benutzerstellenId']['benutzerstelleObject'];
        if (benutzerstelleObject && benutzerstelleObject.benutzerstelleId && benutzerstelleObject.benutzerstelleId > 0) {
            return benutzerstelleObject.benutzerstelleId;
        } else {
            return null;
        }
    }

    private initCurrentUser(): void {
        const currentUserLocalStored: JwtDTO = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUserLocalStored) {
            this.currentUser = currentUserLocalStored.userDto;
        }
    }

    private initForm(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.gekoStesSearchFormGroup = this.formBuilder.group(
            {
                geschaeftsartId: null,
                sachstandId: null,
                geschaeftsterminVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                geschaeftsterminBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                erstelltAmVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                erstelltAmBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                fallbearbeiterId: [null, UserValidator.val213frontend],
                istBerater: false,
                istBearbeiter: false,
                istFreigeber: false,
                benutzerstellenId: [null, UserValidator.val214frontend],
                istFallbearbeiterLeer: false
            },
            {
                validators: [
                    DateValidator.rangeBetweenDates('geschaeftsterminVon', 'geschaeftsterminBis', 'val201'),
                    DateValidator.rangeBetweenDates('erstelltAmVon', 'erstelltAmBis', 'val201')
                ]
            }
        );
        this.benutzerstelleSucheParams = {
            benutzerstellentyp: null,
            vollzugsregiontyp: null,
            status: StatusEnum.AKTIV,
            kanton: null
        };
    }

    private initTokens(): void {
        this.benutzerstelleSuchenTokens = {
            benutzerstelleId: `${this.gekoStesService.getLoggedUserBenutzerstelleId()}`,
            vollzugsregionTyp: DomainEnum.STES
        };
    }

    private checkboxChecking(check: boolean): void {
        this.gekoStesSearchFormGroup.controls.istBerater.setValue(check);
        this.gekoStesSearchFormGroup.controls.istBearbeiter.setValue(check);
        this.gekoStesSearchFormGroup.controls.istFreigeber.setValue(check);
    }

    private onLangChange() {
        // if sorting pipe is used in the HTML, it won't react on language change properly ;(
        this.geschaeftsartenOptions = this.sortByPipe.transform(this.geschaeftsartenOptions, 'label', false, true);
    }

    private storeState() {
        const storage: any = {
            geschaeftsartId: this.gekoStesSearchFormGroup.controls.geschaeftsartId.value,
            sachstandId: this.gekoStesSearchFormGroup.controls.sachstandId.value,
            geschaeftsterminVon: this.gekoStesSearchFormGroup.controls.geschaeftsterminVon.value,
            geschaeftsterminBis: this.gekoStesSearchFormGroup.controls.geschaeftsterminBis.value,
            erstelltAmVon: this.gekoStesSearchFormGroup.controls.erstelltAmVon.value,
            erstelltAmBis: this.gekoStesSearchFormGroup.controls.erstelltAmBis.value,
            fallbearbeiterId: this.getPersonalberaterValue(this.gekoStesSearchFormGroup.controls['fallbearbeiterId']),
            istBerater: this.gekoStesSearchFormGroup.controls.istBerater.value,
            istBearbeiter: this.gekoStesSearchFormGroup.controls.istBearbeiter.value,
            istFreigeber: this.gekoStesSearchFormGroup.controls.istFreigeber.value,
            benutzerstellenId: {
                code: this.gekoStesSearchFormGroup.controls['benutzerstellenId']['benutzerstelleObject'].code,
                benutzerstelleId: this.gekoStesSearchFormGroup.controls['benutzerstellenId']['benutzerstelleObject'].benutzerstelleId
            },
            istFallbearbeiterLeer: this.gekoStesSearchFormGroup.controls.istFallbearbeiterLeer.value
        };
        this.searchSessionStorageService.storeFieldsByKey(StesSearchFormComponent.CACHE_STATE_KEY, storage);
    }

    private getPersonalberaterValue(control: AbstractControl): any {
        if (control.value) {
            return control['benutzerObject'];
        }
        return null;
    }

    private patchDateValues(fields: any) {
        if (fields.geschaeftsterminVon) {
            this.gekoStesSearchFormGroup.controls.geschaeftsterminVon.setValue(new Date(fields.geschaeftsterminVon));
        }
        if (fields.geschaeftsterminBis) {
            this.gekoStesSearchFormGroup.controls.geschaeftsterminBis.setValue(new Date(fields.geschaeftsterminBis));
        }
        if (fields.erstelltAmVon) {
            this.gekoStesSearchFormGroup.controls.erstelltAmVon.setValue(new Date(fields.erstelltAmVon));
        }
        if (fields.erstelltAmBis) {
            this.gekoStesSearchFormGroup.controls.erstelltAmBis.setValue(new Date(fields.erstelltAmBis));
        }
    }
}
