import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { UserValidator } from '@shared/validators/autosuggest-validator';
import { BenutzerDetailDTO } from '@dtos/benutzerDetailDTO';
import { StesTerminTeilnehmerExternDTO } from '@dtos/stesTerminTeilnehmerExternDTO';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { Permissions } from '@shared/enums/permissions.enum';
import { AuthenticationService } from '@core/services/authentication.service';
import { UserDto } from '@dtos/userDto';
import { DomainEnum } from '@shared/enums/domain.enum';
import { GenericConfirmComponent } from '@app/shared';

@Component({
    selector: 'app-teilnehmer-form',
    templateUrl: './teilnehmer-form.component.html'
})
export class TeilnehmerFormComponent implements OnInit, OnDestroy {
    participantsForm: FormGroup;
    kontaktperson: boolean[] = [];
    userList: any[] = [];
    indexErase = null;
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    benutzerSuchenTokens: {} = {};
    @Input() typ: string;
    @Input() intern: boolean;
    @Input() label: string;
    @Input() onInitTeilnehmerNumber: number;
    @ViewChild('displayOnInit') displayOnInit: boolean;
    @ViewChildren(AvamPersonalberaterAutosuggestComponent)
    users: QueryList<AvamPersonalberaterAutosuggestComponent>;
    @Output() teilnehmerSelectedEvent: EventEmitter<boolean> = new EventEmitter();
    private modalWindowOpts: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' };

    constructor(private formBuilder: FormBuilder, private readonly modalService: NgbModal, private authenticationService: AuthenticationService) {}

    ngOnInit(): void {
        this.initForm();
    }

    ngOnDestroy(): void {
        this.userList = [];
        this.users.reset([]);
        this.teilnehmer.reset([]);
    }

    initForm(): void {
        this.participantsForm = this.formBuilder.group({ participants: this.formBuilder.array([]) });
        if (!this.intern) {
            this.addTeilnehmer();
        }
        this.benutzerSuchenTokens = this.getBenutzerSuchenTokens();
    }

    get teilnehmer() {
        return this.participantsForm.controls.participants as FormArray;
    }

    setInternTeilnehmer(user: BenutzerDetailDTO, isKontaktPerson: boolean, index: number): void {
        this.setPersonalBerater(user, index);
        this.selectedTeilnehmer(isKontaktPerson, index);
        this.teilnehmer.push(this.builInternParticipant(this.userList[index]));
    }

    setPersonalBerater(user: BenutzerDetailDTO, index: number): void {
        this.userList[index] = user;
    }

    selectedTeilnehmer(isKontaktPerson: boolean, index: number): void {
        index < this.kontaktperson.length ? (this.kontaktperson[index] = isKontaktPerson) : this.kontaktperson.push(isKontaktPerson);
    }

    setExternTeilnehmer(stesTerminTeilnehmerExternDTO: StesTerminTeilnehmerExternDTO, isKontaktPerson: boolean, index: number): void {
        this.selectedTeilnehmer(isKontaktPerson, index);
        if (index >= this.teilnehmer.length) {
            this.teilnehmer.push(this.buildExternParticipant(stesTerminTeilnehmerExternDTO.name, stesTerminTeilnehmerExternDTO.vorname, stesTerminTeilnehmerExternDTO.stelle));
        } else {
            this.teilnehmer.controls[index].setValue({
                name: stesTerminTeilnehmerExternDTO.name,
                vorname: stesTerminTeilnehmerExternDTO.vorname,
                stelle: stesTerminTeilnehmerExternDTO.stelle
            });
        }
    }

    /**
     * interner or externer
     */
    addTeilnehmer(): void {
        this.kontaktperson.push(false);
        this.teilnehmer.push(this.buildParticipant());
        this.setPersonalBerater(null, null);
    }

    builInternParticipant(value): FormGroup {
        return this.formBuilder.group({ personalberater: [value, [UserValidator.val212, UserValidator.val052]] });
    }

    // RE2: one field with text is sufficient / empty rows are removed without warning
    buildExternParticipant(nameParam: string, vornameParam: string, stelleParam: string): FormGroup {
        return this.formBuilder.group(
            { name: nameParam, vorname: vornameParam, stelle: stelleParam },
            { validators: UserValidator.requiredGroupWhenFieldFilled(this.kontaktperson.length - 1, this.kontaktperson) }
        );
    }

    buildParticipant(): FormGroup {
        return this.intern ? this.builInternParticipant(null) : this.buildExternParticipant(null, null, null);
    }

    getTeilnehmerArray() {
        return this.teilnehmer.controls;
    }

    showRemoveKontaktPersonMessage(index: number): void {
        this.indexErase = index;
        const modalRef = this.modalService.open(GenericConfirmComponent, this.modalWindowOpts);
        modalRef.result.then(result => {
            if (result) {
                this.removeTeilnehmer(this.indexErase);
            }
        });
        modalRef.componentInstance.titleLabel = '';
        modalRef.componentInstance.promptLabel = 'common.message.loeschenbestaetigen';
        modalRef.componentInstance.primaryButton = 'common.button.ok';
        modalRef.componentInstance.secondaryButton = 'common.button.abbrechen';
    }

    /**
     * interner or externer
     */
    removeTeilnehmer(index: number): void {
        if (this.teilnehmer.length > 1) {
            if (this.intern) {
                this.userList.splice(index, 1);
            }
            this.teilnehmer.removeAt(index);
            this.kontaktperson.splice(index, 1);
        } else {
            if (this.intern) {
                this.userList[index] = [];
            }
            this.teilnehmer.removeAt(index);
            this.kontaktperson = [];
            this.addTeilnehmer();
        }
        this.participantsForm.markAsDirty();
    }

    cancelTeilnehmerSelected(): void {
        for (let i = 0; i < this.kontaktperson.length; i++) {
            this.kontaktperson[i] = false;
            const participant = this.participantsForm.controls.participants.get(i.toString());
            const existingPersonalBerater = participant.get('personalberater');
            const existingExternalTeilnehmerVorname = participant.get('vorname');
            const existingExternalTeilnehmerName = participant.get('name');
            const existingExternalTeilnehmerStelle = participant.get('stelle');
            if (existingPersonalBerater && !existingPersonalBerater.value) {
                existingPersonalBerater.setValidators([UserValidator.val212, UserValidator.val052]);
                existingPersonalBerater.updateValueAndValidity();
                participant.setValidators([UserValidator.val212, UserValidator.val052]);
                participant.updateValueAndValidity();
            }
            if (
                existingExternalTeilnehmerVorname &&
                TeilnehmerFormComponent.checkEmptyFormFields({
                    existingExternalTeilnehmerVorname,
                    existingExternalTeilnehmerName,
                    existingExternalTeilnehmerStelle
                })
            ) {
                existingExternalTeilnehmerVorname.setValidators(null);
                existingExternalTeilnehmerVorname.updateValueAndValidity();
                existingExternalTeilnehmerName.setValidators(null);
                existingExternalTeilnehmerName.updateValueAndValidity();
                existingExternalTeilnehmerStelle.setValidators(null);
                existingExternalTeilnehmerStelle.updateValueAndValidity();
            }
        }
    }

    updateTeilnehmerSelected(index: number): void {
        this.cancelTeilnehmerSelected();
        this.kontaktperson[index] = true;
        this.teilnehmerSelectedEvent.emit();
    }

    resetForm(): void {
        this.userList = [];
        this.users.reset([]);
        this.teilnehmer.reset([]);
        this.kontaktperson = [];
        this.initForm();
    }

    private static checkEmptyFormFields(participant: Participant): boolean {
        const leerVorname = !participant.existingExternalTeilnehmerVorname.value;
        const leerName = !participant.existingExternalTeilnehmerName.value;
        const leerStelle = !participant.existingExternalTeilnehmerStelle.value;
        return leerVorname && leerName && leerStelle;
    }

    private getBenutzerSuchenTokens() {
        const loggedUser: UserDto = this.authenticationService.getLoggedUser();
        return !loggedUser
            ? null
            : {
                  berechtigung: Permissions.STES_SUCHEN_SICHTEN,
                  myBenutzerstelleId: loggedUser.benutzerstelleId,
                  myVollzugsregionTyp: DomainEnum.STES,
                  stati: DomainEnum.BENUTZER_STATUS_AKTIV
              };
    }
}

export interface Participant {
    existingExternalTeilnehmerVorname: AbstractControl;
    existingExternalTeilnehmerName: AbstractControl;
    existingExternalTeilnehmerStelle: AbstractControl;
}
