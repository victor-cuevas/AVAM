import { formatNumber } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { VertragswertDTO } from '@app/shared/models/dtos-generated/vertragswertDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { VertragswerteUebersichtTableRow } from './bew-vertragswerte-uebersicht-table.component';

export enum VWButtonsEnum {
    CREATE = 'create',
    DELETE = 'delete',
    NONE = 'none'
}

@Injectable()
export class BewVertragswerteUebersichtTableHandlerService {
    constructor(private dbTranslateService: DbTranslateService, private formUtils: FormUtilsService) {}

    createRow(responseDTO: VertragswertDTO, authorized?: boolean): VertragswerteUebersichtTableRow {
        return {
            vertragswertId: responseDTO.vertragswertId,
            vertragswertNr: responseDTO.vertragswertNr,
            vertragswerttyp: this.dbTranslateService.translate(responseDTO.typ, 'kurzText') || '',
            profilNr: responseDTO.profilNr || '',
            gueltigVon: this.formUtils.parseDate(responseDTO.gueltigVon) || '',
            gueltigBis: this.formUtils.parseDate(responseDTO.gueltigBis) || '',
            preismodell: this.dbTranslateService.translate(responseDTO.preismodell, 'kurzText') || '--',
            gueltig: responseDTO.gueltigB ? 'common.label.ja' : 'common.label.nein',
            chf: formatNumber(-Math.round(-responseDTO.wertTripelObject.chfBetrag), LocaleEnum.SWITZERLAND),
            tnTage: responseDTO.wertTripelObject.teilnehmerTage || '',
            tn: responseDTO.wertTripelObject.teilnehmer || '',
            leistungsvereinbarungId: responseDTO.leistungsvereinbarungObject ? responseDTO.leistungsvereinbarungObject.leistungsvereinbarungId : null,
            button: this.showButtons(responseDTO, authorized)
        };
    }

    showButtons(vw: VertragswertDTO, authorized?: boolean): string {
        if (!authorized) {
            return VWButtonsEnum.NONE;
        }

        const vwType = vw.typ != null ? vw.typ.code.trim() : '';

        if (vwType === VertragswertTypCodeEnum.MASSNAHME) {
            return VWButtonsEnum.DELETE;
        }

        if (vwType === VertragswertTypCodeEnum.KURS && vw.gueltigB) {
            return VWButtonsEnum.NONE;
        }

        return VWButtonsEnum.CREATE;
    }
}
