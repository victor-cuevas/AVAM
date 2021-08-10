import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Permissions } from '@shared/enums/permissions.enum';
import { FachberatungsangebotService } from '@app/shared';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeDTO } from '@dtos/codeDTO';
import { NumberValidator } from '@shared/validators/number-validator';
import { forkJoin } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { FbStatusCodeEnum } from '@shared/enums/domain-code/fb-status-code.enum';
import { ZustaendigkeitsbereichCodeEnum } from '@shared/enums/domain-code/zustaendigkeitsbereich-code.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { FachberatungSuchenParamDTO } from '@dtos/fachberatungSuchenParamDTO';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-fachberatungsangebote-form',
    templateUrl: './fachberatungsangebote-form.component.html'
})
export class FachberatungsangeboteFormComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly STATE_KEY = 'fachberatungsangebote-form-state-key';
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('angebotsverantwortung') angebotsverantwortungComponent: AvamPersonalberaterAutosuggestComponent;
    @Output() onResetEvent: EventEmitter<void> = new EventEmitter();
    permissions: typeof Permissions = Permissions;
    form: FormGroup;
    beratungsbereichOptionsLabels = [];
    zustaendigkeitsbereichOptionsLabels = [];
    statusDropdownLabels: any;
    state: any;
    angebotsverantwortungDisabled = false;
    readonly channel = 'fachberatungsangebote-form-channel';
    readonly angebotsverantwortungType = BenutzerAutosuggestType.BENUTZER_ALLE;
    private aktivStatus: number;
    private eigeneVollzugsregion: any;
    private fachberatungsstelleEvent: any;
    private angebotsverantwortungEvent: any;

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private searchSession: SearchSessionStorageService,
        private fachberatungsangebotService: FachberatungsangebotService,
        private facadeService: FacadeService
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.state = this.searchSession.restoreStateByKey(FachberatungsangeboteFormComponent.STATE_KEY);
        this.loadFormData();
    }

    ngAfterViewInit(): void {
        if (this.state) {
            this.form.patchValue(this.state.fields);
            this.updateFachberatungsstelleSuche(this.state.fields.events.fachberatungsstelle);
            this.updateAngebotsverantwortungSuche(this.state.fields.events.angebotsverantwortung);
            this.initFormData(() => this.search());
            this.deactivateSpinnerAndScrollToTop();
        }
    }

    ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
    }

    reset(): void {
        this.onResetEvent.emit();
        this.resetData();
    }

    resetData(): void {
        this.form.reset();
        this.form.patchValue({ zustaendigkeitsBereichId: this.eigeneVollzugsregion, status: this.aktivStatus });
        this.clearFachberatungsstelleSuche();
        this.clearEmptyAngebotsverantwortungSuche(null);
    }

    search(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (!this.form.valid) {
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            return;
        } else {
            this.searchFachberatungsangebote();
            this.storeState();
        }
    }

    isSubmitDisabled(): boolean {
        return !this.form || this.form.invalid;
    }

    updateAngebotsverantwortungSuche(event: any): void {
        if (event === '' || event === null) {
            // workaround for the "undefined undefined" displaying if the state is loaded from cache
            this.form.controls['angebotsverantwortung'].reset();
            this.angebotsverantwortungEvent = null;
            this.form.controls.angebotsverantwortung['benutzerObject'] = null;
            return;
        }
        if (event) {
            this.angebotsverantwortungEvent = event;
            this.form.controls.angebotsverantwortung.setValue(event);
        }
    }

    clearEmptyAngebotsverantwortungSuche(event: any): void {
        const value = event && event.target ? event.target.value : event;
        if (typeof value === 'string' || value instanceof String) {
            this.angebotsverantwortungEvent = null;
            this.form.controls.angebotsverantwortung['benutzerObject'] = null;
        }
        if (value === '') {
            // workaround for the "undefined undefined" displaying if the state is loaded from cache
            this.form.controls['angebotsverantwortung'].reset();
            return;
        }
        FachberatungsangeboteFormComponent.isEmpty(
            event,
            () => {
                this.angebotsverantwortungEvent = null;
                this.form.controls.angebotsverantwortung['benutzerObject'] = null;
            },
            () => (this.angebotsverantwortungEvent = event)
        );
    }

    updateFachberatungsstelleSuche(event: any): void {
        if (event) {
            this.fachberatungsstelleEvent = event;
            this.form.controls.fachberatungsstelle.setValue(event);
        }
    }

    clearFachberatungsstelleSuche(): void {
        this.fachberatungsstelleEvent = null;
        this.form.controls.fachberatungsstelle['unternehmenAutosuggestObject'] = null;
    }

    onChangeStatus(): void {
        const value = this.form.controls.status.value;
        if (value && this.statusDropdownLabels) {
            this.angebotsverantwortungDisabled = this.fachberatungsangebotService.isStatusInaktiv(this.statusDropdownLabels, value);
        }
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

    private searchFachberatungsangebote() {
        const searchParam: FachberatungSuchenParamDTO = {
            beratungsBereichId: this.form.controls.beratungsBereichId.value,
            bezeichnung: this.form.controls.bezeichnung.value,
            angebotsNr: this.form.controls.angebotsNr.value,
            statusId: this.form.controls.status.value,
            zustaendigkeitsBereichId: this.form.controls.zustaendigkeitsBereichId.value,
            benutzerDetailId: null,
            benutzerLogin: null,
            unternehmenId: null
        } as FachberatungSuchenParamDTO;
        const untObject = this.form.controls.fachberatungsstelle['unternehmenAutosuggestObject'];
        if (!this.angebotsverantwortungDisabled && untObject && untObject.unternehmenId > 0) {
            searchParam.unternehmenId = untObject.unternehmenId;
        }
        const bObject = this.form.controls.angebotsverantwortung['benutzerObject'];
        if (bObject && bObject.benutzerDetailId > 0) {
            searchParam.benutzerDetailId = bObject.benutzerDetailId;
            searchParam.benutzerLogin = bObject.benutzerLogin;
        } else {
            if (this.form.controls.angebotsverantwortung.value) {
                searchParam.benutzerLogin = this.form.controls.angebotsverantwortung.value;
            }
        }
        this.fachberatungsangebotService.search(searchParam);
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facadeService.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private storeState(): void {
        const storage: any = {
            beratungsBereichId: this.form.controls.beratungsBereichId.value,
            bezeichnung: this.form.controls.bezeichnung.value,
            angebotsNr: this.form.controls.angebotsNr.value,
            zustaendigkeitsBereichId: this.form.controls.zustaendigkeitsBereichId.value,
            status: this.form.controls.status.value,
            events: {
                fachberatungsstelle: this.fachberatungsstelleEvent,
                angebotsverantwortung: this.angebotsverantwortungEvent
            },
            angebotsverantwortungStatus: this.angebotsverantwortungComponent.filterDropdown.nativeElement.value
        };
        this.searchSession.storeFieldsByKey(FachberatungsangeboteFormComponent.STATE_KEY, storage);
    }

    private initForm(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.form = this.formBuilder.group({
            beratungsBereichId: [''],
            bezeichnung: [''],
            angebotsNr: ['', NumberValidator.isPositiveInteger],
            zustaendigkeitsBereichId: ['', Validators.required],
            fachberatungsstelle: null,
            angebotsverantwortung: null,
            status: null
        });
    }

    private loadFormData(): void {
        this.facadeService.spinnerService.activate(this.channel);
        if (!this.state) {
            this.initFormData(() => this.initDefaultFormData());
        }
    }

    private initFormData(callback?: () => void): void {
        forkJoin<CodeDTO[], CodeDTO[], CodeDTO, CodeDTO[]>([
            this.fachberatungsangebotService.getCode(DomainEnum.BERATUNGSBEREICH),
            this.fachberatungsangebotService.getCode(DomainEnum.ZUSTAENDIGKEITSREGION),
            this.fachberatungsangebotService.codeSearch(DomainEnum.STATUS_FB, FbStatusCodeEnum.FB_STATUS_AKTIV),
            this.fachberatungsangebotService.getActiveCodeByDomain(DomainEnum.STATUS_FB)
        ]).subscribe(
            ([beratungsbereich, zustaendigkeitsbereich, aktivStatus, status]) => {
                this.beratungsbereichOptionsLabels = this.facadeService.formUtilsService.mapDropdownKurztext(beratungsbereich);
                this.zustaendigkeitsbereichOptionsLabels = this.facadeService.formUtilsService.mapDropdownKurztext(zustaendigkeitsbereich);
                this.aktivStatus = aktivStatus.codeId;
                this.statusDropdownLabels = this.facadeService.formUtilsService.mapDropdownKurztext(status);
                this.eigeneVollzugsregion = this.facadeService.formUtilsService.getCodeIdByCode(zustaendigkeitsbereich, ZustaendigkeitsbereichCodeEnum.EIGENE_VOLLZUGSREGION);
                if (callback) {
                    callback();
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            () => this.deactivateSpinnerAndScrollToTop()
        );
    }

    private initDefaultFormData(): void {
        this.form.patchValue({ zustaendigkeitsBereichId: this.eigeneVollzugsregion, status: this.aktivStatus });
    }
}
