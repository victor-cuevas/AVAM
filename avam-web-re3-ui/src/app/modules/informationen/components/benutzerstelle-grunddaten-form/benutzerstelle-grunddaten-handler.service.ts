import { Injectable } from '@angular/core';
import { FacadeService } from '@shared/services/facade.service';
import { AbstractControl, FormGroup } from '@angular/forms';
import { BenutzerstelleGrunddatenReactiveFormsService } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten-reactive-forms.service';
import { BenutzerstelleObjectDTO } from '@dtos/benutzerstelleObjectDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { PlzDTO } from '@dtos/plzDTO';

@Injectable()
export class BenutzerstelleGrunddatenHandlerService {
    constructor(public reactiveForms: BenutzerstelleGrunddatenReactiveFormsService, private facade: FacadeService) {}

    mapPlzToForm(plz: PlzDTO) {
        return {
            postleitzahl: plz,
            ort: plz
        };
    }

    mapToForm(dto: BenutzerstelleObjectDTO): any {
        return {
            benutzerstelleId: dto.code,
            benutzerstelleTyp: dto.typeId,
            benutzerstellePostD: dto.postNameDe,
            benutzerstellePostF: dto.postNameFr,
            benutzerstellePostI: dto.postNameIt,
            postadresseD: {
                strasse: dto.postStrasseDe,
                strasseNr: dto.postStrasseNr,
                plz: this.mapPlzToForm(dto.postPlzObject),
                postfach: dto.postPostfach
            },
            postadresseF: {
                strasse: dto.postStrasseFr,
                strasseNr: dto.postStrasseNr,
                plz: this.mapPlzToForm(dto.postPlzObject),
                postfach: dto.postPostfach
            },
            postadresseI: {
                strasse: dto.postStrasseIt,
                strasseNr: dto.postStrasseNr,
                plz: this.mapPlzToForm(dto.postPlzObject),
                postfach: dto.postPostfach
            },
            benutzerstelleStandortD: dto.nameDe,
            benutzerstelleStandortF: dto.nameFr,
            benutzerstelleStandortI: dto.nameIt,
            standortadresseD: {
                strasse: dto.strasseDe,
                strasseNr: dto.strasseNr,
                plz: this.mapPlzToForm(dto.plzObject)
            },
            standortadresseF: {
                strasse: dto.strasseFr,
                strasseNr: dto.strasseNr,
                plz: this.mapPlzToForm(dto.plzObject)
            },
            standortadresseI: {
                strasse: dto.strasseIt,
                strasseNr: dto.strasseNr,
                plz: this.mapPlzToForm(dto.plzObject)
            },
            telefon: dto.telefonNr,
            fax: dto.telefaxNr,
            email: dto.email
        };
    }

    mapToDto(dto: BenutzerstelleObjectDTO): BenutzerstelleObjectDTO {
        const controls: { [key: string]: AbstractControl } = this.reactiveForms.form.controls;
        const postPlz = this.getPlzObject(controls, 'postadresse');
        let standortPlz = this.getPlzObject(controls, 'standortadresse');
        if (!standortPlz.plzId || +standortPlz.plzId === -1) {
            standortPlz = postPlz;
        }
        return {
            ...dto,
            code: controls.benutzerstelleId.value,
            typeId: controls.benutzerstelleTyp.value,
            postPlzId: postPlz ? postPlz.plzId : undefined,
            postPlzObject: postPlz,
            plzId: standortPlz ? standortPlz.plzId : undefined,
            plzObject: standortPlz,
            postNameDe: controls.benutzerstellePostD.value,
            postNameFr: controls.benutzerstellePostF.value,
            postNameIt: controls.benutzerstellePostI.value,
            nameDe: controls.benutzerstelleStandortD.value,
            nameFr: controls.benutzerstelleStandortF.value,
            nameIt: controls.benutzerstelleStandortI.value,
            postStrasseDe: (controls.postadresseD as FormGroup).controls.strasse.value,
            postStrasseFr: (controls.postadresseF as FormGroup).controls.strasse.value,
            postStrasseIt: (controls.postadresseI as FormGroup).controls.strasse.value,
            postStrasseNr: (controls.postadresseD as FormGroup).controls.strasseNr.value,
            postPostfach: (controls.postadresseD as FormGroup).controls.postfach.value,
            strasseDe: (controls.standortadresseD as FormGroup).controls.strasse.value,
            strasseFr: (controls.standortadresseF as FormGroup).controls.strasse.value,
            strasseIt: (controls.standortadresseI as FormGroup).controls.strasse.value,
            strasseNr: (controls.standortadresseD as FormGroup).controls.strasseNr.value,
            telefonNr: controls.telefon.value,
            telefaxNr: controls.fax.value,
            email: controls.email.value
        };
    }

    private getPlzObject(controls: { [key: string]: AbstractControl }, addresse: string): any {
        // the avam-plz-autosuggest component is not (always) properly setting the plzWohnAdresseObject on reset
        // therefore we use any valid object from one of the language groups
        let obj = (controls[`${addresse}D`] as FormGroup).controls.plz['plzWohnAdresseObject'];
        if (!obj.plzId || +obj.plzId === -1) {
            obj = (controls[`${addresse}F`] as FormGroup).controls.plz['plzWohnAdresseObject'];
            if (!obj.plzId || +obj.plzId === -1) {
                obj = (controls[`${addresse}I`] as FormGroup).controls.plz['plzWohnAdresseObject'];
            }
        }
        return obj;
    }
}
