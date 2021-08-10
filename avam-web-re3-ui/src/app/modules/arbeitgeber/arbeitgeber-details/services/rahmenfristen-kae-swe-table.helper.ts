import { TableHelperBase } from '@shared/helpers/table.helper';
import { RahmenfristKaeSweDTO } from '@dtos/rahmenfristKaeSweDTO';
import { Injectable } from '@angular/core';
import { DbTranslateService } from '@shared/services/db-translate.service';

@Injectable({
    providedIn: 'root'
})
export class RahmenfristenKaeSweTableHelper extends TableHelperBase<RahmenfristKaeSweDTO> {
    readonly actionOeffnen = 0;
    readonly actionRahmenfristZahlungen = 1;
    readonly actionDetailsProRahmenfrist = 2;

    readonly key = 'rahmenfristen-kae-swe-table';
    readonly dateFormat = 'dd.MM.yyyy';
    readonly actionColWidth = '150px';
    readonly abteilungName = 'abteilungName';
    readonly abteilungNameLabel = 'kaeswe.label.betriebsabteilung';
    readonly abteilungNr = 'abteilungNr';
    readonly abteilungNrLabel = 'kaeswe.label.nr';
    readonly rahmenfristNr = 'rahmenfristNr';
    readonly rahmenfristNrLabel = 'kaeswe.label.rahmenfristnr';
    readonly rahmenfristBeginn = 'rahmenfristBeginn';
    readonly rahmenfristBeginnLabel = 'kaeswe.label.rfbeginn';
    readonly rahmenfristEnde = 'rahmenfristEnde';
    readonly rahmenfristEndeLabel = 'kaeswe.label.rfende';
    readonly alkzahlstelle = 'alkzahlstelle';
    readonly alkzahlstelleField = 'alkZahlstelle';
    readonly alkzahlstelleLabel = 'kaeswe.label.alkzahlstelle';
    readonly rahmenfristZahlungenLabel = 'kaeswe.label.rahmenfristZahlungen';
    readonly rahmenfristDetailsLabel = 'kaeswe.label.rahmenfristDetails';

    constructor(protected dbTranslateService: DbTranslateService) {
        super(dbTranslateService);
    }

    readonly getAbteilungName = (dto: RahmenfristKaeSweDTO) => (dto.betriebsabteilungObject ? dto.betriebsabteilungObject.abteilungName : '');
    readonly getAbteilungNr = (dto: RahmenfristKaeSweDTO) =>
        dto.betriebsabteilungObject && dto.betriebsabteilungObject.abteilungNr > 0 ? `${dto.betriebsabteilungObject.abteilungNr}` : '';
    readonly getRahmenfristNr = (dto: RahmenfristKaeSweDTO) => (dto.rahmenfristNr ? `${dto.rahmenfristNr}` : '');
    readonly getRahmenfristBeginn = (dto: RahmenfristKaeSweDTO) => dto.rahmenfristBeginn;
    readonly getRahmenfristEnde = (dto: RahmenfristKaeSweDTO) => dto.rahmenfristEnde;
    readonly getRahmenfrist = (dto: RahmenfristKaeSweDTO) => dto;

    readonly getActions = (row: any) => `${row.actions}`;
}
