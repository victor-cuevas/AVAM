import { formatNumber } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { AbrechnungswertKostenReactiveFormsService } from './abrechnungswert-kosten-reactive-forms.service';

@Injectable()
export class AbrechnungswertKostenHandlerService {
    constructor(private reactiveForms: AbrechnungswertKostenReactiveFormsService, private formUtils: FormUtilsService) {}

    mapToForm(abrechnungswert: AbrechnungswertDTO) {
        return {
            gesamtKosten: abrechnungswert.gesamtKosten || 0,
            nichtAnrechenbareKosten: abrechnungswert.nichtAnrechenbareKosten,
            projektrelKosten: abrechnungswert.projektrelevanteKosten,
            umsatz: abrechnungswert.umsatz,
            anrechenbareKosten: abrechnungswert.anrechenbareKosten,
            awAnzahlTeilnehmer: abrechnungswert.anzahlTeilnehmer || 0,
            awAnzahlTeilnehmerTage: abrechnungswert.anzahlTeilnehmertage || 0,
            anzahlDfe: formatNumber(abrechnungswert.anzahlDurchfuehrungseinheiten, LocaleEnum.SWITZERLAND),
            alvRelevant: abrechnungswert.alvRelevanteKosten,
            summeTeilzahlungswerte: abrechnungswert.summeTeilzahlungswerte,
            saldoALV: abrechnungswert.saldoALV,
            faelligAm: this.formUtils.parseDate(abrechnungswert.faelligkeitDatum) || ''
        };
    }

    mapToDTO(abrechnungswert: AbrechnungswertDTO): AbrechnungswertDTO {
        const controls = this.reactiveForms.kostenForm.controls;
        return {
            ...abrechnungswert,
            gesamtKosten: controls.gesamtKosten.value,
            nichtAnrechenbareKosten: controls.nichtAnrechenbareKosten.value,
            umsatz: controls.umsatz.value,
            faelligkeitDatum: this.formUtils.parseDate(controls.faelligAm.value)
        };
    }
}
