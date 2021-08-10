import { Injectable } from '@angular/core';
import { AnbieterAbrechnungReactiveFormsService } from './anbieter-abrechnung-reactive-forms.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { AbrechnungDTO } from '@app/shared/models/dtos-generated/abrechnungDTO';
import { FormUtilsService } from '@app/shared';
import { AbrechnungBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungBearbeitenParameterDTO';

@Injectable()
export class AnbieterAbrechnungHandlerService {
    constructor(private reactiveForms: AnbieterAbrechnungReactiveFormsService, private formUtils: FormUtilsService) {}

    mapToForm(param: AbrechnungBearbeitenParameterDTO) {
        const abrechnung = param.abrechnung;
        return {
            titel: abrechnung.titel,
            bemerkung: abrechnung.bemerkung,
            ausfuehrungsdatum: abrechnung.ausfuehrungsdatum ? this.formUtils.parseDate(abrechnung.ausfuehrungsdatum) : '',
            bearbeitungDurch: abrechnung.bearbeitungDurchDetailObject,
            abrechnungNr: abrechnung.abrechnungNr ? abrechnung.abrechnungNr : '',
            status: abrechnung.statusObject ? abrechnung.statusObject.codeId : param.enabledStati[0].codeId,
            freigabeDurch: abrechnung.freigabeDurchDetailObject,
            freigabedatum: abrechnung.freigabeAm ? this.formUtils.parseDate(abrechnung.freigabeAm) : ''
        };
    }

    mapToDTO(abrechnungParam: AbrechnungBearbeitenParameterDTO): AbrechnungBearbeitenParameterDTO {
        const status = abrechnungParam.enabledStati.find(option => option.codeId === +this.reactiveForms.abrechnungForm.controls.status.value) as CodeDTO;
        const controls = this.reactiveForms.abrechnungForm.controls;
        return {
            ...abrechnungParam,
            abrechnung: {
                ...abrechnungParam.abrechnung,
                statusObject: status,
                titel: controls.titel.value,
                bemerkung: controls.bemerkung.value,
                ausfuehrungsdatum: this.formUtils.parseDate(controls.ausfuehrungsdatum.value),
                bearbeitungDurchDetailObject: controls.bearbeitungDurch['benutzerObject'],
                freigabeDurchDetailObject: controls.freigabeDurch['benutzerObject'],
                freigabeAm: this.formUtils.parseDate(controls.freigabedatum.value)
            },
            action: 'speichern'
        };
    }
}
