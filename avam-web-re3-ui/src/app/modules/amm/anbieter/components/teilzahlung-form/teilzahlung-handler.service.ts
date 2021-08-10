import { CodeDTO } from '@dtos/codeDTO';
import { TeilzahlungDTO } from '@dtos/teilzahlungDTO';
import { FacadeService } from '@shared/services/facade.service';
import { Injectable } from '@angular/core';
import { TeilzahlungReactiveFormsService } from './teilzahlung-reactive-forms.service';
import { TeilzahlungBearbeitenParameterDTO } from '@dtos/teilzahlungBearbeitenParameterDTO';

@Injectable()
export class TeilzahlungFormHandlerService {
    constructor(public reactiveForms: TeilzahlungReactiveFormsService, private facade: FacadeService) {}

    /**
     * Map the DTO in the form
     * @param TeilzahlungBearbeitenParameterDTO tzParamDto
     * @memberof TeilzahlungFormHandlerService
     */
    mapToForm(tzParamDto: TeilzahlungBearbeitenParameterDTO) {
        const tz = tzParamDto.teilzahlung;

        return {
            titel: tz.titel,
            bemerkung: tz.bemerkung,
            ausfuehrungsdatum: tz.ausfuehrungsdatum ? this.facade.formUtilsService.parseDate(tz.ausfuehrungsdatum) : '',
            bearbeitungDurch: tz.bearbeitungDurchDetailObject,
            teilzahlungsNr: tz.teilzahlungNr ? tz.teilzahlungNr : '',
            status: tz.statusObject ? tz.statusObject.codeId : tzParamDto.enabledStati[0].codeId,
            freigabeDurch: tz.freigabeDurchDetailObject,
            freigabedatum: tz.freigabeAm ? this.facade.formUtilsService.parseDate(tz.freigabeAm) : ''
        };
    }

    /**
     * Map the form in a DTO
     * @param TeilzahlungBearbeitenParameterDTO tzParamDto
     * @memberof TeilzahlungFormHandlerService
     */
    mapToDTO(tzParamDto: TeilzahlungBearbeitenParameterDTO): TeilzahlungBearbeitenParameterDTO {
        const tzParamDtoToSave: TeilzahlungBearbeitenParameterDTO = { ...tzParamDto };
        const teilzahlungObj: TeilzahlungDTO = tzParamDto.teilzahlung;

        const controls = this.reactiveForms.tzform.controls;

        teilzahlungObj.titel = controls.titel.value;
        teilzahlungObj.bemerkung = controls.bemerkung.value;
        teilzahlungObj.ausfuehrungsdatum = this.facade.formUtilsService.parseDate(controls.ausfuehrungsdatum.value);
        teilzahlungObj.bearbeitungDurchDetailObject = controls.bearbeitungDurch.value ? controls.bearbeitungDurch['benutzerObject'] : null;
        teilzahlungObj.teilzahlungNr = controls.teilzahlungsNr.value;
        teilzahlungObj.statusObject = tzParamDto.enabledStati.find(option => option.codeId === +controls.status.value) as CodeDTO;
        teilzahlungObj.freigabeDurchDetailObject = controls.freigabeDurch.value ? controls.freigabeDurch['benutzerObject'] : null;
        teilzahlungObj.freigabeAm = this.facade.formUtilsService.parseDate(controls.freigabedatum.value);

        return tzParamDtoToSave;
    }
}
