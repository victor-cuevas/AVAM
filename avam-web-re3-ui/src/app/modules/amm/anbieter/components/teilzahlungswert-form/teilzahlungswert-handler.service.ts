import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormatSwissFrancPipe } from '@app/shared';
import { JaNeinCodeEnum } from '@app/shared/enums/domain-code/amm-ja-nein-code.enum';
import { TeilzahlungswertBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/teilzahlungswertBearbeitenParameterDTO';
import { TeilzahlungswertDTO } from '@app/shared/models/dtos-generated/teilzahlungswertDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { TeilzahlungswertReactiveFormsService } from './teilzahlungswert-reactive-forms.service';
import { TeilzahlungDTO } from '@app/shared/models/dtos-generated/teilzahlungDTO';

@Injectable()
export class TeilzahlungswertFormHandlerService {
    constructor(
        public reactiveForms: TeilzahlungswertReactiveFormsService,
        private formatSwissFrancPipe: FormatSwissFrancPipe,
        private facade: FacadeService,
        private datePipe: DatePipe
    ) {}

    mapToForm(data: TeilzahlungswertBearbeitenParameterDTO) {
        return {
            vertragswertchf: this.formatSwissFrancPipe.transform(data.teilzahlungswert.vertragswertObject.wertTripelObject.chfBetrag),
            // BSP1
            chf: data.teilzahlungswert.gueltigB ? data.teilzahlungswert.betrag : 0,
            faelligAm: this.facade.formUtilsService.parseDate(data.teilzahlungswert.faelligkeitDatum),
            gueltig: data.teilzahlungswert.gueltigB ? JaNeinCodeEnum.JA : JaNeinCodeEnum.NEIN,
            bemerkung: data.teilzahlungswert.bemerkung || '',
            teilzahlungswertNr: data.teilzahlungswert.teilzahlungswertNr ? data.teilzahlungswert.teilzahlungswertNr : '',
            status: data.teilzahlungswert.teilzahlungSelected ? this.facade.dbTranslateService.translate(data.teilzahlungswert.teilzahlungSelected.statusObject, 'kurzText') : '',
            transferAlk: this.getTransferAlk(data.teilzahlungswert.transferAlkAm),
            freigegebeneAbrechnung: data.existFreigegebeneAbrechnung
                ? this.facade.translateService.instant('common.label.ja')
                : this.facade.translateService.instant('common.label.nein'),
            teilzahlungsNr: data.teilzahlungswert.teilzahlungSelected ? data.teilzahlungswert.teilzahlungSelected.teilzahlungNr : '',
            selectedTeilzahlung: data.teilzahlungswert.teilzahlungSelected
        };
    }

    getTransferAlk(transferAlkAm: Date) {
        return transferAlkAm
            ? `${this.facade.translateService.instant('amm.zahlungen.message.datenuebermittelt')} ${this.datePipe.transform(transferAlkAm, 'dd.MM.yyyy')}`
            : this.facade.translateService.instant('amm.zahlungen.message.keinedatenuebermittelt');
    }

    mapToFormTeilzahlung(teilzahlung: TeilzahlungDTO) {
        return {
            teilzahlungsNr: teilzahlung ? teilzahlung.teilzahlungNr : null,
            status: teilzahlung ? this.facade.dbTranslateService.translate(teilzahlung.statusObject, 'kurzText') : null,
            selectedTeilzahlung: teilzahlung
        };
    }

    mapToDTO(originalTeilzahlungswert: TeilzahlungswertDTO): TeilzahlungswertDTO {
        const controls = this.reactiveForms.teilzahlungswert.controls;
        const gueltig = +controls.gueltig.value;

        return {
            ...originalTeilzahlungswert,
            betrag: controls.chf.value,
            gueltigB: !!gueltig,
            faelligkeitDatum: this.facade.formUtilsService.parseDate(controls.faelligAm.value),
            bemerkung: controls.bemerkung.value,
            teilzahlungSelected: controls.selectedTeilzahlung.value
        };
    }
}
