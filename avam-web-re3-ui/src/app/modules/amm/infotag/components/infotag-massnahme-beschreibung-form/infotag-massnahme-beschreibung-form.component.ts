import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { InfotagMassnahmeBeschreibungHandlerService } from './infotag-massnahme-beschreibung-handler.service';
import { InfotagMassnahmeBeschreibungModeService } from './infotag-massnahme-beschreibung-mode.service';
import { InfotagMassnahmeBeschreibungReactiveFormsService } from './infotag-massnahme-beschreibung-reactive-forms.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

export interface InfotagMassnahmeBeschreibungData {
    dto?: MassnahmeDTO | SessionDTO;
    spracheOptions?: CodeDTO[];
    form?: any;
    markFormDirty?: boolean;
}

@Component({
    selector: 'avam-infotag-massnahme-beschreibung-form',
    templateUrl: './infotag-massnahme-beschreibung-form.component.html',
    styleUrls: ['./infotag-massnahme-beschreibung-form.component.scss'],
    providers: [InfotagMassnahmeBeschreibungModeService, InfotagMassnahmeBeschreibungHandlerService, InfotagMassnahmeBeschreibungReactiveFormsService]
})
export class InfotagMassnahmeBeschreibungFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input('beschreibungData') beschreibungData: InfotagMassnahmeBeschreibungData;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public formGroup: FormGroup;

    dto: MassnahmeDTO | SessionDTO;
    modeSubscription: Subscription;
    currentFormMode: FormModeEnum;
    formValue: any;
    spracheEnum = SpracheEnum;
    spracheOptions: any[];
    unternehmenId: number;
    isKontaktpersonSelected = false;
    isKontakpersonCleared = false;
    hasBookings = false;

    constructor(
        private handler: InfotagMassnahmeBeschreibungHandlerService,
        public formMode: InfotagMassnahmeBeschreibungModeService,
        private fehlermeldungenService: FehlermeldungenService,
        private obliqueHelper: ObliqueHelperService,
        private resetDialogService: ResetDialogService,
        private router: ActivatedRoute
    ) {
        this.formGroup = handler.reactiveForms.beschreibungForm;

        this.modeSubscription = this.formMode.mode$.subscribe(currentMode => {
            this.currentFormMode = currentMode;
        });
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;

        this.router.data.subscribe(data => {
            this.formMode.changeMode(data.mode);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.beschreibungData.currentValue) {
            this.dto = this.beschreibungData.dto;
            this.formValue = this.beschreibungData.form;
            this.spracheOptions = this.handler.mapOptions(this.beschreibungData.spracheOptions);

            switch (this.currentFormMode) {
                case FormModeEnum.CREATE:
                    this.initCreate(this.dto, this.formValue);
                    break;
                case FormModeEnum.EDIT:
                    this.initEdit(this.dto);
                    this.setHasBookings(this.dto);
                    if (this.beschreibungData.markFormDirty) {
                        this.formGroup.markAsDirty();
                    }
                    break;
                default:
                    break;
            }
        }
    }

    initEdit(dto: MassnahmeDTO | SessionDTO) {
        this.formGroup.reset(this.handler.mapToForm(dto));

        if (dto && dto.durchfuehrungsortObject) {
            this.unternehmenId = dto.durchfuehrungsortObject.unternehmenObject ? dto.durchfuehrungsortObject.unternehmenObject.unternehmenId : undefined;
            this.isKontaktpersonSelected = dto.durchfuehrungsortObject.ammKontaktpersonObject && dto.durchfuehrungsortObject.ammKontaktpersonObject.kontaktId ? true : false;
        }
        this.isKontakpersonCleared = false;
    }

    setHasBookings(dto: SessionDTO) {
        this.hasBookings = dto.anzahlBuchungen && dto.anzahlBuchungen > 0;
    }

    initCreate(dto: MassnahmeDTO | SessionDTO, form?: any) {
        form ? this.formGroup.reset(form) : this.formGroup.reset(this.handler.mapToForm(dto));
        this.unternehmenId =
            dto && dto.durchfuehrungsortObject && dto.durchfuehrungsortObject.unternehmenObject ? dto.durchfuehrungsortObject.unternehmenObject.unternehmenId : undefined;

        if ((form && form.kontaktId) || this.formGroup.controls.kontaktId.value) {
            this.isKontaktpersonSelected = true;
        }
        this.isKontakpersonCleared = false;
    }

    mapOptions(options: CodeDTO[]) {
        this.spracheOptions = this.handler.mapOptions(options);
    }

    reset() {
        this.resetDialogService.reset(() => {
            switch (this.currentFormMode) {
                case FormModeEnum.CREATE:
                    this.fehlermeldungenService.closeMessage();
                    this.initCreate(this.dto, this.formValue);
                    break;
                case FormModeEnum.EDIT:
                    this.initEdit(this.dto);
                    break;
                default:
                    break;
            }
        });
    }

    kontaktpersonSelected(kontaktperson: KontakteViewDTO) {
        this.isKontaktpersonSelected = true;
        this.formGroup.markAsDirty();

        this.formGroup.patchValue({
            kontaktperson: this.handler.setKontaktPerson(kontaktperson),
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            telefon: kontaktperson.telefonNr,
            mobile: kontaktperson.mobileNr,
            fax: kontaktperson.telefaxNr,
            email: kontaktperson.email,
            kontaktId: kontaktperson.kontaktId,
            kontaktPersonObject: kontaktperson
        });
    }

    onKontaktpersonClear() {
        this.isKontaktpersonSelected = false;
        this.isKontakpersonCleared = true;

        this.formGroup.patchValue({
            kontaktperson: null,
            name: null,
            vorname: null,
            telefon: null,
            mobile: null,
            fax: null,
            email: null,
            kontaktId: null,
            kontaktPersonObject: null
        });
    }

    mapToDto(): MassnahmeDTO | SessionDTO {
        return this.handler.mapToDto(this.dto, this.isKontakpersonCleared);
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
    }
}
