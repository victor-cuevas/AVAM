import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacadeService } from '@shared/services/facade.service';
import { Unsubscribable } from 'oblique-reactive';
import { DateValidator } from '@shared/validators/date-validator';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { PersonenNrValidator } from '@shared/validators/personenNr-validator';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { JobroomSuchenParamDTO } from '@dtos/jobroomSuchenParamDTO';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';

@Component({
    selector: 'avam-jobroom-meldungen-search-form',
    templateUrl: './jobroom-meldungen-search-form.component.html'
})
export class JobroomMeldungenSearchFormComponent extends Unsubscribable implements OnInit, OnDestroy {
    static STATE_KEY_CACHE = 'joobroom-meldungen-suchen-cache';
    static STATE_KEY_RESTORE = 'jobroom-meldungen-table';
    @Output() onSearch = new EventEmitter<JobroomSuchenParamDTO>();
    public searchForm: FormGroup;
    public channel = 'jobroom-search-form';
    public set meldeartOptions(options: CodeDTO[]) {
        this.meldeartCodeOptions = options;
        const state = this.searchSession.restoreStateByKey(JobroomMeldungenSearchFormComponent.STATE_KEY_CACHE);
        if (state) {
            this.restoreStateAndSearch(state);
        }
    }
    public verarbeitungsstandOptions = [
        { value: 0, labelDe: 'ausstehend', labelFr: 'en cours', labelIt: 'in sospeso' },
        { value: 1, labelDe: 'abgelehnt', labelFr: 'refusé', labelIt: 'rifiutato' }
    ];
    public benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.DEFAULT;
    public meldeartCodeOptions: CodeDTO[];

    constructor(private fb: FormBuilder, private dataService: StesDataRestService, private facadeService: FacadeService, private searchSession: SearchSessionStorageService) {
        super();
    }

    ngOnInit() {
        this.searchForm = this.createForm();
        this.setDefaultBenutzerstellen();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    search(saveState = true, deleteMessages = true) {
        if (saveState) {
            this.storeState();
        }
        if (deleteMessages) {
            this.facadeService.fehlermeldungenService.closeMessage();
        }
        this.onSearch.emit(this.mapToDto());
    }

    reset() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.searchForm.reset({
            meldeart: null,
            verarbeitungsstand: '0',
            stellenbezeichnung: null,
            meldedatumVon: null,
            meldedatumBis: null,
            benutzerstellenIdVon: null,
            benutzerstellenIdBis: null,
            jobroomNr: null,
            name: null,
            strasse: null,
            plz: {
                postleitzahl: null,
                ort: null
            },
            burNr: null
        });
        this.setDefaultBenutzerstellen();
        this.searchSession.restoreDefaultValues(JobroomMeldungenSearchFormComponent.STATE_KEY_RESTORE);
        this.searchSession.clearStorageByKey(JobroomMeldungenSearchFormComponent.STATE_KEY_CACHE);
    }

    mapToDto(): JobroomSuchenParamDTO {
        const formGroup = this.searchForm.controls;
        if (formGroup.jobroomNr.value) {
            return {
                jobroomNummer: formGroup.jobroomNr.value
            };
        } else {
            return {
                stellenBezeichnung: this.checkValueOrNull(formGroup.stellenbezeichnung.value),
                unternehmenName: this.checkValueOrNull(formGroup.name.value),
                strasse: this.checkValueOrNull(formGroup.strasse.value),
                ort: formGroup.plz['plzWohnAdresseObject'] ? this.checkValueOrNull(formGroup.plz['plzWohnAdresseObject'].ort) : null,
                plz: formGroup.plz['plzWohnAdresseObject'] ? this.checkValueOrNull(formGroup.plz['plzWohnAdresseObject'].postleitzahl) : null,
                meldeart: formGroup.meldeart.value,
                meldedatumVon: formGroup.meldedatumVon.value ? new Date(formGroup.meldedatumVon.value) : null,
                meldedatumBis: formGroup.meldedatumBis.value ? new Date(formGroup.meldedatumBis.value) : null,
                benutzerstelleVon: formGroup.benutzerstellenIdVon['benutzerstelleObject']
                    ? this.checkValueOrNull(formGroup.benutzerstellenIdVon['benutzerstelleObject'].code)
                    : null,
                benutzerstelleBis: formGroup.benutzerstellenIdBis['benutzerstelleObject']
                    ? this.checkValueOrNull(formGroup.benutzerstellenIdBis['benutzerstelleObject'].code)
                    : null,
                burNummer: this.checkValueOrNull(formGroup.burNr.value),
                jobroomNummer: this.checkValueOrNull(formGroup.jobroomNr.value),
                abgelehnte: !!+formGroup.verarbeitungsstand.value
            };
        }
    }

    placeholderHandler(placeholderLabel: string) {
        return !!this.searchForm.controls.jobroomNr.value ? '' : placeholderLabel;
    }

    private checkValueOrNull(value) {
        return value || null;
    }

    private createForm() {
        return this.fb.group({
            meldeart: null,
            verarbeitungsstand: '0',
            stellenbezeichnung: null,
            meldedatumVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            meldedatumBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            benutzerstellenIdVon: null,
            benutzerstellenIdBis: null,
            // TODO add validations when SUC is updated
            jobroomNr: null,
            name: [null, [TwoFieldsAutosuggestValidator.inputMinLength(2)]],
            strasse: [null, [TwoFieldsAutosuggestValidator.inputMinLength(2)]],
            plz: this.fb.group({
                postleitzahl: [null, TwoFieldsAutosuggestValidator.inputMinLength(2, 'postleitzahl')],
                ort: [null, TwoFieldsAutosuggestValidator.inputMinLength(2, 'ort')]
            }),
            burNr: [null, PersonenNrValidator.val011]
        });
    }

    private restoreStateAndSearch(state) {
        this.searchForm.patchValue({
            meldeart: state.fields.meldeart || '',
            verarbeitungsstand: state.fields.verarbeitungsstand || 0,
            stellenbezeichnung: state.fields.stellenbezeichnung || '',
            meldedatumVon: state.fields.meldedatumVon ? new Date(state.fields.meldedatumVon) : '',
            meldedatumBis: state.fields.meldedatumBis ? new Date(state.fields.meldedatumBis) : '',
            benutzerstellenIdVon: state.fields.benutzerstellenIdVon.code ? state.fields.benutzerstellenIdVon : null,
            benutzerstellenIdBis: state.fields.benutzerstellenIdBis.code ? state.fields.benutzerstellenIdBis : null,
            jobroomNr: state.fields.jobroomNr,
            name: state.fields.name,
            strasse: state.fields.strasse,
            plz: state.fields.plz,
            burNr: state.fields.burNr
        });
        this.search(false);
    }

    private setDefaultBenutzerstellen() {
        const loggedInUser = this.facadeService.authenticationService.getLoggedUser();
        const loggedInUserWithCode = { ...loggedInUser, code: loggedInUser.benutzerstelleCode };
        this.searchForm.controls.benutzerstellenIdVon.setValue(loggedInUserWithCode);
        this.searchForm.controls.benutzerstellenIdBis.setValue(loggedInUserWithCode);
    }

    private storeState(): void {
        const formSearchControls = this.searchForm.controls;
        const storage: any = {
            meldeart: formSearchControls.meldeart.value,
            verarbeitungsstand: formSearchControls.verarbeitungsstand.value,
            stellenbezeichnung: formSearchControls.stellenbezeichnung.value,
            meldedatumVon: formSearchControls.meldedatumVon.value,
            meldedatumBis: formSearchControls.meldedatumBis.value,
            benutzerstellenIdVon: formSearchControls.benutzerstellenIdVon['benutzerstelleObject'],
            benutzerstellenIdBis: formSearchControls.benutzerstellenIdBis['benutzerstelleObject'],
            jobroomNr: formSearchControls.jobroomNr.value || '',
            name: formSearchControls.name.value || '',
            strasse: formSearchControls.strasse.value || '',
            plz: formSearchControls.plz['plzWohnAdresseObject'] || '',
            burNr: formSearchControls.burNr.value || ''
        };
        this.searchSession.storeFieldsByKey(JobroomMeldungenSearchFormComponent.STATE_KEY_CACHE, storage);
    }
}
