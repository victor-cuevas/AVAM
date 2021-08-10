import { Injectable } from '@angular/core';
import { AbrechnungenSuchenReactiveFormService } from './abrechnungen-suchen-reactive-form.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { AbrechnungSuchenParamDTO } from '@app/shared/models/dtos-generated/abrechnungSuchenParamDTO';
import { FormUtilsService } from '@app/shared';

@Injectable()
export class AbrechnungenSuchenHandlerService {
    constructor(public reactiveForms: AbrechnungenSuchenReactiveFormService, private formUtils: FormUtilsService) {}

    mapToForm(values: AbrechnungSuchenParamDTO) {
        return {
            ...values,
            anbieter: values.anbieterId ? { unternehmenId: values.anbieterId, name1: values.anbieterName } : null,
            ausfuehrungsdatumVon: values.ausfuehrungsdatumVon ? new Date(values.ausfuehrungsdatumVon) : null,
            ausfuehrungsdatumBis: values.ausfuehrungsdatumBis ? new Date(values.ausfuehrungsdatumBis) : null,
            status: values.statusAbrechnung
        };
    }

    mapToDTO(): AbrechnungSuchenParamDTO {
        const controls = this.reactiveForms.abrechnungSuchenForm.controls;
        const defaultValues = {
            abrechnungNr: '',
            anbieterName: '',
            anbieterId: '',
            statusAbrechnung: '',
            titel: '',
            action: 'abrechnungtrefferlisteAnzeigen',
            mitNachfolger: true,
            shouldBeValidated: true,
            inclusiveBerechtigung: true
        };

        if (controls.abrechnungNr.value) {
            return { ...defaultValues, abrechnungNr: controls.abrechnungNr.value };
        }

        const unternehmenObject = controls.anbieter['unternehmenAutosuggestObject'];
        const anbieterName = unternehmenObject && unternehmenObject.name1 ? unternehmenObject.name1 : '';
        const anbieterId = unternehmenObject && unternehmenObject.unternehmenId !== -1 ? unternehmenObject.unternehmenId : '';
        return {
            ...defaultValues,
            anbieterName,
            anbieterId,
            statusAbrechnung: controls.status.value ? controls.status.value : '',
            titel: controls.titel.value ? controls.titel.value : '',
            ausfuehrungsdatumVon: this.formUtils.parseDate(controls.ausfuehrungsdatumVon.value),
            ausfuehrungsdatumBis: this.formUtils.parseDate(controls.ausfuehrungsdatumBis.value)
        };
    }
}
