import { Injectable } from '@angular/core';
import { BenutzermeldungenSuchenReactiveFormsService } from '@modules/informationen/components/benutzermeldungen-suchen-form/benutzermeldungen-suchen-reactive-forms.service';
import { KantonDTO } from '@dtos/kantonDTO';
import { BenutzerMeldungSuchenParamDTO } from '@dtos/benutzerMeldungSuchenParamDTO';
import { AbstractControl } from '@angular/forms';

@Injectable()
export class BenutzermeldungenSuchenHandlerService {
    constructor(public reactiveForm: BenutzermeldungenSuchenReactiveFormsService) {}

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

    mapToDto(): BenutzerMeldungSuchenParamDTO {
        const controls = this.reactiveForm.searchForm.controls;
        return {
            nachname: controls.name.value,
            vorname: controls.vorname.value,
            benutzerstelleCodeVon: this.getBenutzerstellenASValue(controls.benutzerstellenVon.value),
            benutzerstelleCodeBis: this.getBenutzerstellenASValue(controls.benutzerstellenBis.value),
            selectedStati: this.getMultiselection(controls.status),
            selectedMeldTyp: this.getMultiselection(controls.meldungstyp),
            kantonsKuerzel: controls.kanton.value,
            gemeldetVon: controls.gemeldetVon.value,
            gemeldetBis: controls.gemeldetBis.value
        };
    }

    private getMultiselection(control: AbstractControl): number[] {
        return control.value.filter(val => val.value).map(val => val.id);
    }

    private getBenutzerstellenASValue(value: any): string {
        if (value && value.hasOwnProperty('code')) {
            return value.code;
        }
        return value;
    }
}
