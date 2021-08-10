import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { TranslateService } from '@ngx-translate/core';
import { InfotagMassnahmeGrunddatenReactiveFormsService } from './infotag-massnahme-grunddaten-reactive-forms.service';

@Injectable()
export class InfotagMassnahmeGrunddatenHandlerService {
    constructor(public reactiveForms: InfotagMassnahmeGrunddatenReactiveFormsService, private translate: TranslateService, private formUtils: FormUtilsService) {}

    mapOptions(options: CodeDTO[]) {
        return options.map(this.languagePropertyMapper);
    }

    languagePropertyMapper(element: CodeDTO) {
        return {
            value: element.code,
            labelDe: element.kurzTextDe,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt
        };
    }

    mapToForm(dto: MassnahmeDTO) {
        return {
            erfassungssprache: this.translate.currentLang.toUpperCase(),
            titelDe: dto.titelDe,
            titelFr: dto.titelFr,
            titelIt: dto.titelIt,
            ergaenzendeAngabenDe: dto.bemerkungDe,
            ergaenzendeAngabenFr: dto.bemerkungFr,
            ergaenzendeAngabenIt: dto.bemerkungIt,
            gueltigVon: this.formUtils.parseDate(dto.gueltigVon),
            gueltigBis: this.formUtils.parseDate(dto.gueltigBis),
            anbieter: dto.ammAnbieterObject ? dto.ammAnbieterObject.unternehmen : null,
            massnahmenverantwortung: dto.verantwortlicherDetailObject,
            massnahmeNr: dto.massnahmeId ? dto.massnahmeId : ''
        };
    }

    mapToDto(dto: MassnahmeDTO): MassnahmeDTO {
        const controls = this.reactiveForms.grunddatenForm.controls;
        return {
            ...dto,
            titelDe: controls.titelDe.value,
            titelFr: controls.titelFr.value,
            titelIt: controls.titelIt.value,
            bemerkungDe: controls.ergaenzendeAngabenDe.value,
            bemerkungFr: controls.ergaenzendeAngabenFr.value,
            bemerkungIt: controls.ergaenzendeAngabenIt.value,
            gueltigVon: this.formUtils.parseDate(controls.gueltigVon.value),
            gueltigBis: this.formUtils.parseDate(controls.gueltigBis.value),
            ammAnbieterObject: {
                unternehmen: { unternehmenId: controls.anbieter['unternehmenAutosuggestObject'].unternehmenId, name1: controls.anbieter['unternehmenAutosuggestObject'].name1 }
            },
            verantwortlicherDetailObject: controls.massnahmenverantwortung['benutzerObject']
        };
    }
}
