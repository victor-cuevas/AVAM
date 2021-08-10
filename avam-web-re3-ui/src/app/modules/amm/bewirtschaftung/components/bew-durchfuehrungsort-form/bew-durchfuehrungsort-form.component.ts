import { FacadeService } from '@shared/services/facade.service';
import { Component, OnInit, Input, OnDestroy, SimpleChanges, OnChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BewDurchfuehrungsortHandlerService } from './bew-durchfuehrungsort-handler.service';
import { BewDurchfuehrungsortFormModeService } from './bew-durchfuehrungsort-form-mode.service';
import { BewDurchfuehrungsortReactiveFormsService } from './bew-durchfuehrungsort-reactive-forms.service';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { ActivatedRoute } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DurchfuehrungsortDTO } from '@dtos/durchfuehrungsortDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { KontakteViewDTO } from '@dtos/kontakteViewDTO';

@Component({
    selector: 'avam-bew-durchfuehrungsort-form',
    templateUrl: './bew-durchfuehrungsort-form.component.html',
    providers: [BewDurchfuehrungsortHandlerService, BewDurchfuehrungsortReactiveFormsService, BewDurchfuehrungsortFormModeService, ObliqueHelperService]
})
export class BewDurchfuehrungsortFormComponent implements OnInit, OnDestroy, OnChanges {
    @Input('durchfuehrungsortData') durchfuehrungsortData = null;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Output('onKpersonSelected') onKpersonSelected: EventEmitter<KontakteViewDTO> = new EventEmitter<KontakteViewDTO>();

    formGroup: FormGroup;
    modeSubscription: Subscription;
    currentFormMode: FormModeEnum;
    unternehmenId: number;
    durchfuehrungsortDTO: DurchfuehrungsortDTO;
    isKontakpersonCleared: boolean;
    kontaktPersonObject: KontakteViewDTO;
    isKontaktpersonSelected: boolean;
    isReadonlyIndividuell: boolean;

    constructor(
        public handler: BewDurchfuehrungsortHandlerService,
        public formMode: BewDurchfuehrungsortFormModeService,
        private router: ActivatedRoute,
        private obliqueHelper: ObliqueHelperService,
        private ammHelper: AmmHelper,
        private facade: FacadeService
    ) {
        this.formGroup = handler.reactiveForms.durchfuehrungsortForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;

        this.router.data.subscribe(data => {
            this.formMode.changeMode(data.mode);
        });

        this.modeSubscription = this.formMode.mode$.subscribe(currentMode => {
            this.currentFormMode = currentMode;
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.durchfuehrungsortData.currentValue && this.durchfuehrungsortData.durchfuehrungsortDTO) {
            this.durchfuehrungsortDTO = this.durchfuehrungsortData.durchfuehrungsortDTO;
            this.unternehmenId = this.durchfuehrungsortDTO.unternehmenObject.unternehmenId;
            this.isKontaktpersonSelected = this.isKontaktPersonSelected(this.durchfuehrungsortDTO);
            this.formGroup.reset(this.mapToForm());
            this.setReadonly(this.durchfuehrungsortData);

            // The button Anbieterdaten Uebernehmen fetches the data from the BE, but does not perform save.
            // Therefore if the user intends to leave the page, before saving the fetched data, a generic confirmation modal should be shown
            if (this.durchfuehrungsortData.markFormDirty) {
                this.formGroup.markAsDirty();
            }
        }
    }

    mapToForm() {
        const ammKontaktpersonObject = this.durchfuehrungsortDTO.ammKontaktpersonObject;

        return {
            uGName1: this.durchfuehrungsortDTO.ugname1,
            uGName2: this.durchfuehrungsortDTO.ugname2,
            uGName3: this.durchfuehrungsortDTO.ugname3,
            strasse: this.durchfuehrungsortDTO.strasse,
            strasseNr: this.durchfuehrungsortDTO.hausNummer,
            raum: this.durchfuehrungsortDTO.raum,
            plz: this.setPlzToForm(),
            land: this.durchfuehrungsortDTO.landObject,
            ergaenzendeAngaben: this.durchfuehrungsortDTO.bemerkung,
            kontaktperson: this.setKontaktperson(ammKontaktpersonObject),
            name: ammKontaktpersonObject ? ammKontaktpersonObject.name : null,
            vorname: ammKontaktpersonObject ? ammKontaktpersonObject.vorname : null,
            telefon: ammKontaktpersonObject ? ammKontaktpersonObject.telefon : null,
            mobile: ammKontaktpersonObject ? ammKontaktpersonObject.mobile : null,
            fax: ammKontaktpersonObject ? ammKontaktpersonObject.fax : null,
            email: ammKontaktpersonObject ? ammKontaktpersonObject.email : null
        };
    }

    mapToDTO(): DurchfuehrungsortDTO {
        const durchfuehrungsortDtoToSave: DurchfuehrungsortDTO = { ...this.durchfuehrungsortDTO };

        durchfuehrungsortDtoToSave.ugname1 = this.formGroup.controls.uGName1.value;
        durchfuehrungsortDtoToSave.ugname2 = this.formGroup.controls.uGName2.value;
        durchfuehrungsortDtoToSave.ugname3 = this.formGroup.controls.uGName3.value;
        durchfuehrungsortDtoToSave.strasse = this.formGroup.controls.strasse.value;
        durchfuehrungsortDtoToSave.hausNummer = this.formGroup.controls.strasseNr.value;
        durchfuehrungsortDtoToSave.raum = this.formGroup.controls.raum.value;
        durchfuehrungsortDtoToSave.plzObject = this.formGroup.controls.plz['plzWohnAdresseObject'] ? this.formGroup.controls.plz['plzWohnAdresseObject'] : null;
        durchfuehrungsortDtoToSave.auslPlz = this.formGroup.controls.plz['plzWohnAdresseObject'] ? this.formGroup.controls.plz['plzWohnAdresseObject'].plzWohnadresseAusland : null;
        durchfuehrungsortDtoToSave.auslOrt = this.formGroup.controls.plz['plzWohnAdresseObject'] ? this.formGroup.controls.plz['plzWohnAdresseObject'].ortWohnadresseAusland : null;
        durchfuehrungsortDtoToSave.landObject = this.formGroup.controls.land['landAutosuggestObject'] ? this.formGroup.controls.land['landAutosuggestObject'] : null;
        durchfuehrungsortDtoToSave.bemerkung = this.formGroup.controls.ergaenzendeAngaben.value;

        durchfuehrungsortDtoToSave.ammKontaktpersonObject = this.ammHelper.initializeKperson(
            this.formGroup,
            durchfuehrungsortDtoToSave,
            this.kontaktPersonObject,
            this.isKontakpersonCleared
        );

        return durchfuehrungsortDtoToSave;
    }

    onKontaktpersonClear() {
        this.isKontaktpersonSelected = false;
        this.kontaktPersonObject = null;
        this.isKontakpersonCleared = true;
        this.onKpersonSelected.emit(null);
        this.formGroup.patchValue({
            kontaktperson: null,
            name: null,
            vorname: null,
            telefon: null,
            mobile: null,
            fax: null,
            email: null
        });
    }

    kontaktpersonSelected(kontaktperson: KontakteViewDTO) {
        this.isKontaktpersonSelected = true;
        this.formGroup.markAsDirty();
        this.kontaktPersonObject = kontaktperson;
        this.onKpersonSelected.emit(this.kontaktPersonObject);

        this.formGroup.patchValue({
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            telefon: kontaktperson.telefonNr,
            mobile: kontaktperson.mobileNr,
            fax: kontaktperson.telefaxNr,
            email: kontaktperson.email
        });
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.mapToForm());
                this.isKontaktpersonSelected = this.isKontaktPersonSelected(this.durchfuehrungsortDTO);
                this.isKontakpersonCleared = false;
            });
        }
    }

    isKontaktPersonSelected(durchfuehrungsortDTO: DurchfuehrungsortDTO): boolean {
        return durchfuehrungsortDTO.ammKontaktpersonObject && !!durchfuehrungsortDTO.ammKontaktpersonObject.kontaktId;
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
    }

    private setReadonly(durchfuehrungsortData) {
        if (durchfuehrungsortData.individuellenAMM !== undefined && this.currentFormMode === FormModeEnum.EDIT) {
            this.isReadonlyIndividuell = durchfuehrungsortData.individuellenAMM;
        }
    }

    private setPlzToForm() {
        return {
            postleitzahl: this.durchfuehrungsortDTO.plzObject ? this.durchfuehrungsortDTO.plzObject : this.durchfuehrungsortDTO.auslPlz || '',
            ort: this.durchfuehrungsortDTO.plzObject ? this.durchfuehrungsortDTO.plzObject : this.durchfuehrungsortDTO.auslOrt || ''
        };
    }

    private setKontaktperson(kontaktperson) {
        let kontaktpersonInputValue = '';

        if (kontaktperson) {
            if (kontaktperson.name) {
                kontaktpersonInputValue += kontaktperson.name;

                if (kontaktperson.vorname) {
                    kontaktpersonInputValue += `, ${kontaktperson.vorname}`;
                }
            } else if (kontaktperson.vorname) {
                kontaktpersonInputValue += kontaktperson.vorname;
            }
        }

        return kontaktpersonInputValue;
    }
}
