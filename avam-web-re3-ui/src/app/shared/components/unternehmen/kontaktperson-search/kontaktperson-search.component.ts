import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { Permissions } from '@shared/enums/permissions.enum';
import { DomainEnum } from '@shared/enums/domain.enum';
import { Unsubscribable } from 'oblique-reactive';
import { CodeDTO } from '@dtos/codeDTO';
import { KontaktpersonService } from '@app/shared';
import { KontaktpersonStatusCode } from '@shared/enums/domain-code/kontakptperson-status-code.enum';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { KontaktpersonSearchParamDTO } from '@dtos/kontaktpersonSearchParamDTO';
import { BaseResponseWrapperListKontakteViewDTOWarningMessages } from '@dtos/baseResponseWrapperListKontakteViewDTOWarningMessages';
import { UserValidator } from '@shared/validators/autosuggest-validator';
import { KontaktpersonSearchResultComponent } from '@shared/components/unternehmen/kontaktperson-search/kontaktperson-search-result/kontaktperson-search-result.component';
import { takeUntil } from 'rxjs/operators';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { KontaktpersonSearchUnternehmenPlaceholderEnum } from '@shared/components/unternehmen/kontaktperson-search/kontaktperson-search-unternehmen-placeholder.enum';
import { FacadeService } from '@shared/services/facade.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Router } from '@angular/router';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';

@Component({
    selector: 'avam-kontaktperson-search',
    templateUrl: './kontaktperson-search.component.html'
})
export class KontaktpersonSearchComponent extends Unsubscribable implements OnInit {
    static readonly SEARCH_SPINNER_CHANNEL = 'avamKontaktpersonSearchChannel';
    static readonly RESULT_SPINNER_CHANNEL = 'avamKontaktpersonResultChannel';
    static readonly STATE_KEY = 'kontaktperson-search-cache';
    @Input() unternehmenPlaceholder: KontaktpersonSearchUnternehmenPlaceholderEnum;
    @ViewChild('searchResult') searchResult: KontaktpersonSearchResultComponent;
    permissions: typeof Permissions = Permissions;
    statusDropdownLabels: any[] = [];
    searchForm: FormGroup;
    benutzerstelleSucheParams: BenutzerstelleSucheParamsModel = {
        benutzerstellentyp: null,
        vollzugsregiontyp: null,
        status: StatusEnum.AKTIV,
        kanton: null
    };
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.DEFAULT;
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    benutzerSuchenTokens: any = {};
    private benutzerstelleEvent: any;
    private unternehmenEvent: any;
    private personalberaterEvent: any;

    constructor(
        private fb: FormBuilder,
        private facadeService: FacadeService,
        private kontaktpersonService: KontaktpersonService,
        private searchSession: SearchSessionStorageService,
        private router: Router
    ) {
        super();
    }

    ngOnInit(): void {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.generateForm();
        this.restoreState();
        this.getTokens();
    }

    public reset(): void {
        this.searchForm.reset();
        this.setDefaultStatus();
        this.benutzerstelleEvent = null;
        this.unternehmenEvent = null;
        this.personalberaterEvent = null;
        this.searchResult.onReset();
        this.searchSession.clearStorageByKey(KontaktpersonSearchComponent.STATE_KEY);
    }

    public search(): void {
        this.storeState();
        this.searchResult.searchDone = false;
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.spinnerService.activate(KontaktpersonSearchComponent.RESULT_SPINNER_CHANNEL);
        this.kontaktpersonService
            .searchKontaktpersonen(this.getSearchParam())
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperListKontakteViewDTOWarningMessages) => {
                    this.searchResult.resultsData = response.data;
                    this.searchResult.searchDone = true;
                    this.facadeService.spinnerService.deactivate(KontaktpersonSearchComponent.RESULT_SPINNER_CHANNEL);
                },
                () => {
                    this.facadeService.spinnerService.deactivate(KontaktpersonSearchComponent.RESULT_SPINNER_CHANNEL);
                    this.searchResult.searchDone = true;
                }
            );
    }

    openBenutzerstelleSuche(benutzerstellenSuche: any): void {
        this.facadeService.openModalFensterService.openXLModal(benutzerstellenSuche);
    }

    updateBenutzerstelleSuche(event: any): void {
        if (event) {
            this.benutzerstelleEvent = event;
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

    updateUnternehmenSuche(event: any): void {
        if (event) {
            this.unternehmenEvent = event;
            this.searchForm.controls.arbeitgeber.setValue(event);
        }
    }

    updatePersonalberaterSuche(event: any): void {
        if (event) {
            this.personalberaterEvent = event;
            this.searchForm.controls.kundenberatung.setValue(event);
        }
    }

    clearUnternehmenSuche(): void {
        this.unternehmenEvent = null;
        this.searchForm.controls.arbeitgeber['unternehmenAutosuggestObject'] = null;
    }

    clearEmptyBenutzerstelleSuche(event: any): void {
        KontaktpersonSearchComponent.isEmpty(
            event,
            () => {
                this.benutzerstelleEvent = null;
                this.searchForm.controls.benutzerstelle['benutzerstelleObject'] = null;
            },
            () => (this.benutzerstelleEvent = event)
        );
    }

    clearEmptyPersonalberaterSuche(event: any): void {
        KontaktpersonSearchComponent.isEmpty(
            event,
            () => {
                this.personalberaterEvent = null;
                this.searchForm.controls.kundenberatung['benutzerObject'] = null;
            },
            () => (this.personalberaterEvent = event)
        );
    }

    private static isEmpty(event: any, fctToCallIfEmpty: any, fctToCallOtherwise: any): void {
        const isNullObject = typeof event === 'object' && event === null;
        const isEmptyString = typeof event === 'string' && event === '';
        if (isNullObject || isEmptyString) {
            fctToCallIfEmpty();
        } else {
            fctToCallOtherwise();
        }
    }

    private static isSearchFormEmpty(c: AbstractControl): boolean {
        const name = c.get('name').value;
        const vorname = c.get('vorname').value;
        const telefon = c.get('telefon').value;
        const funktion = c.get('funktion').value;
        const arbeitgeber = c.get('arbeitgeber').value;
        const kundenberatung = c.get('kundenberatung').value;
        const benutzerstelle = c.get('benutzerstelle').value;

        return !(name || vorname || telefon || funktion || arbeitgeber || kundenberatung || benutzerstelle);
    }

    private restoreState(): void {
        const state = this.searchSession.restoreStateByKey(KontaktpersonSearchComponent.STATE_KEY);
        if (state) {
            this.searchForm.patchValue(state.fields);
            this.updateBenutzerstelleSuche(state.fields.events.benutzerstelle);
            this.updateUnternehmenSuche(state.fields.events.unternehmen);
            this.updatePersonalberaterSuche(state.fields.events.personalberater);
            this.initDropdownLabels(() => this.search());
        } else {
            this.initDropdownLabels(() => this.setDefaultStatus());
        }
    }

    private storeState(): void {
        const storage: any = {
            status: this.searchForm.controls.status.value,
            name: this.searchForm.controls.name.value,
            vorname: this.searchForm.controls.vorname.value,
            telefon: this.searchForm.controls.telefon.value,
            funktion: this.searchForm.controls.funktion.value,
            events: {
                benutzerstelle: this.benutzerstelleEvent,
                unternehmen: this.unternehmenEvent,
                personalberater: this.personalberaterEvent
            }
        };
        this.searchSession.storeFieldsByKey(KontaktpersonSearchComponent.STATE_KEY, storage);
    }

    private getSearchParam(): KontaktpersonSearchParamDTO {
        const dto: KontaktpersonSearchParamDTO = {
            kontaktpersonStatusId: 0,
            kontaktpersonName: null,
            kontaktpersonVorname: null,
            telefon: null,
            email: null,
            funktion: null,
            arbeitgeber: null,
            kundenberatung: null,
            benutzerstelle: null
        };
        dto.kontaktpersonStatusId = this.searchForm.controls.status.value;
        dto.kontaktpersonName = this.stringIfAny(this.searchForm.controls.name.value);
        dto.kontaktpersonVorname = this.stringIfAny(this.searchForm.controls.vorname.value);
        dto.telefon = this.stringIfAny(this.searchForm.controls.telefon.value);
        dto.funktion = this.stringIfAny(this.searchForm.controls.funktion.value);

        const untObject = this.searchForm.controls.arbeitgeber['unternehmenAutosuggestObject'];
        if (untObject && untObject.unternehmenId > 0) {
            dto.arbeitgeber = { unternehmenId: untObject.unternehmenId };
        }
        const bObject = this.searchForm.controls.kundenberatung['benutzerObject'];
        if (bObject && bObject.benutzerDetailId > 0) {
            dto.kundenberatung = { benutzerDetailId: bObject.benutzerDetailId, benutzerLogin: bObject.benutzerLogin };
        }
        const bsObject = this.searchForm.controls.benutzerstelle['benutzerstelleObject'];
        if (bsObject && bsObject.code) {
            dto.benutzerstelle = { benutzerstelleCode: bsObject.code };
        }
        return dto;
    }

    private getTokens(): void {
        const currentUser = this.kontaktpersonService.getLoggedUser();
        if (currentUser) {
            this.benutzerSuchenTokens = {
                myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    private initDropdownLabels(callback?: any): void {
        this.facadeService.spinnerService.activate(KontaktpersonSearchComponent.SEARCH_SPINNER_CHANNEL);
        this.kontaktpersonService
            .getCode(DomainEnum.KONTAKTPERSON_STATUS)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (status: any) => {
                    this.statusDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(status);
                    this.facadeService.spinnerService.deactivate(KontaktpersonSearchComponent.SEARCH_SPINNER_CHANNEL);
                    if (callback) {
                        callback();
                    }
                },
                () => this.facadeService.spinnerService.deactivate(KontaktpersonSearchComponent.SEARCH_SPINNER_CHANNEL)
            );
    }

    private setDefaultStatus(): void {
        const defaultStatusId = this.facadeService.formUtilsService.getCodeIdByCode(this.statusDropdownLabels, KontaktpersonStatusCode.ACTIVE);
        if (defaultStatusId) {
            this.searchForm.controls.status.setValue(defaultStatusId);
        }
    }

    private generateForm(): void {
        this.searchForm = this.fb.group(
            {
                status: null,
                name: [null, TwoFieldsAutosuggestValidator.inputMinLength(2)],
                vorname: [null, TwoFieldsAutosuggestValidator.inputMinLength(2)],
                telefon: [null, TwoFieldsAutosuggestValidator.inputMinLength(2)],
                funktion: [null, TwoFieldsAutosuggestValidator.inputMinLength(2)],
                arbeitgeber: null,
                kundenberatung: [null, UserValidator.val213frontend],
                benutzerstelle: null
            },
            {
                validators: [this.validateSearch]
            }
        );
    }

    private validateSearch: ValidatorFn = (c: AbstractControl): { [key: string]: any } => {
        return KontaktpersonSearchComponent.isSearchFormEmpty(c) ? { ...c.errors, valid: false } : null;
    };

    private stringIfAny = (s: string): string => {
        return s ? s : null;
    };
}
