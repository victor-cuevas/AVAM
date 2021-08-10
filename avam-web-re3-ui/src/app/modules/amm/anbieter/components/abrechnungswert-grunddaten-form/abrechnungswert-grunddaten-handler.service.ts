import { AbrechnungswertGrunddatenReactiveFormsService } from './abrechnungswert-grunddaten-reactive-forms.service';
import { Injectable } from '@angular/core';
import { AbrechnungswertBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungswertBearbeitenParameterDTO';
import { JaNeinCodeEnum } from '@app/shared/enums/domain-code/amm-ja-nein-code.enum';
import { DatePipe } from '@angular/common';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { AbrechnungDTO } from '@app/shared/models/dtos-generated/abrechnungDTO';

@Injectable()
export class AbrechnungswertGrunddatenHandlerService {
    constructor(private reactiveForms: AbrechnungswertGrunddatenReactiveFormsService, private facade: FacadeService, private datePipe: DatePipe) {}

    mapToForm(param: AbrechnungswertBearbeitenParameterDTO) {
        const abrechnungswert = param.abrechnungswert;
        return {
            gueltig: abrechnungswert.gueltigB ? JaNeinCodeEnum.JA : JaNeinCodeEnum.NEIN,
            eingangam: abrechnungswert.datumEingangAbrechnung ? new Date(abrechnungswert.datumEingangAbrechnung) : '',
            geprueft: abrechnungswert.datumPruefungAbrechnung ? new Date(abrechnungswert.datumPruefungAbrechnung) : '',
            pruefungDurch: abrechnungswert.geprueftDurchDetailObject,
            bemerkung: abrechnungswert.bemerkung || '',
            abrechnungswertNr: abrechnungswert.abrechnungswertNr || '',
            transferAlk: this.getTransferAlk(abrechnungswert.transferAlkAm),
            abrechnungNr: param.abrechnung ? param.abrechnung.abrechnungNr : null,
            status: param.abrechnung ? this.facade.dbTranslateService.translate(param.abrechnung.statusObject, 'kurzText') : '',
            abrechnung: param.abrechnung
        };
    }

    mapToFormAbrechnung(abrechnung: AbrechnungDTO) {
        return {
            abrechnungNr: abrechnung ? abrechnung.abrechnungNr : null,
            status: abrechnung ? this.facade.dbTranslateService.translate(abrechnung.statusObject, 'kurzText') : null,
            abrechnung
        };
    }

    mapToDTO(abrechnungswert: AbrechnungswertDTO): AbrechnungswertDTO {
        const controls = this.reactiveForms.grunddatenForm.controls;
        return {
            ...abrechnungswert,
            gueltigB: controls.gueltig.value === JaNeinCodeEnum.JA,
            datumEingangAbrechnung: this.facade.formUtilsService.parseDate(controls.eingangam.value),
            datumPruefungAbrechnung: this.facade.formUtilsService.parseDate(controls.geprueft.value),
            geprueftDurchDetailObject: controls.pruefungDurch['benutzerObject'],
            bemerkung: controls.bemerkung.value,
            abrechnungen: controls.abrechnungNr.value ? [controls.abrechnung.value] : null
        };
    }

    getTransferAlk(transferAlkAm: Date) {
        return transferAlkAm
            ? `${this.facade.translateService.instant('amm.zahlungen.message.datenuebermittelt')} ${this.datePipe.transform(transferAlkAm, 'dd.MM.yyyy')}`
            : this.facade.translateService.instant('amm.zahlungen.message.keinedatenuebermittelt');
    }
}
