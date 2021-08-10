import { Injectable } from '@angular/core';
import { BenutzerstellenSuchenReactiveFormsService } from '@modules/informationen/components/benutzerstellen-suchen-form/benutzerstellen-suchen-reactive-forms.service';
import { CodeDTO } from '@dtos/codeDTO';
import { KantonDTO } from '@dtos/kantonDTO';
import { BenutzerstellenQueryDTO } from '@dtos/benutzerstellenQueryDTO';
import { PlzDTO } from '@dtos/plzDTO';

@Injectable()
export class BenutzerstellenSuchenHandlerService {
    constructor(public reactiveForm: BenutzerstellenSuchenReactiveFormsService) {}

    propertyMapperCode = (element: CodeDTO) => {
        return {
            value: element.code,
            code: element.code,
            codeId: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    };

    kantoneMapper = (element: KantonDTO) => {
        return {
            value: element.kantonsKuerzel,
            code: element.kantonsKuerzel,
            codeId: element.kantonsKuerzel,
            labelFr: element.nameFr,
            labelIt: element.nameIt,
            labelDe: element.nameDe
        };
    };

    mapToDto(): BenutzerstellenQueryDTO {
        const controls = this.reactiveForm.searchForm.controls;
        return {
            gueltigkeit: controls.status.value,
            name: controls.benutzerstelleName.value,
            strasse: controls.strasse.value,
            nummer: controls.strasseNr.value,
            plzDTO: this.mapToPlzDTO(this.reactiveForm.searchForm['plzWohnAdresseObject']),
            kanton: controls.kanton.value,
            benutzerstelleCodeVon: this.mapBenutzerstellenASCode(controls.benutzerstellenASVon.value),
            benutzerstelleCodeBis: this.mapBenutzerstellenASCode(controls.benutzerstellenASBis.value),
            benutzerstelleTypeId: controls.benutzerstelleTyp.value,
            vollzugsregionId: controls.vollzugsregionenAS.value && controls.vollzugsregionenAS.value.id ? controls.vollzugsregionenAS.value.id : '0',
            vollzugsregionTypeId: controls.vollzugsregionType.value
        };
    }

    getFormValue(): any {
        const formValue = this.reactiveForm.searchForm.value;
        this.setASControlValue('benutzerstellenASVon', formValue);
        this.setASControlValue('benutzerstellenASBis', formValue);
        return formValue;
    }

    private setASControlValue(controlName: string, formValue: any): void {
        const controls = this.reactiveForm.searchForm.controls;
        const objName = 'benutzerstelleObject';
        if (controls[controlName][objName] && controls[controlName][objName].hasOwnProperty('code') && controls[controlName][objName]['benutzerstelleId'] > 0) {
            formValue[controlName] = controls[controlName][objName];
        } else {
            formValue[controlName] = null;
        }
    }

    private mapToPlzDTO(value: any): PlzDTO {
        if (!value || (!value.ortWohnadresseAusland && !value.plzWohnadresseAusland)) {
            return null;
        }
        const plzDTO: PlzDTO = { plzId: -1, ortDe: value.ortWohnadresseAusland, postleitzahl: value.plzWohnadresseAusland };
        return !value.plzId || value.plzId === -1 ? plzDTO : { ...plzDTO, plzId: value.plzId, ortFr: value.ortFr, ortIt: value.ortIt };
    }

    private mapBenutzerstellenASCode(value: any): string {
        if (value && value.hasOwnProperty('code')) {
            return value.code;
        }
        return value;
    }
}
