import { TeilnehmerDTO } from '@app/shared/models/dtos-generated/teilnehmerDTO';
import { FormUtilsService } from '@app/shared';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

export class TeilnehmerWartelisteData {
    kanton: string;
    platz: string;
    teilnehmer: string;
    personenNr: string;
    bearbeitung: string;
    buchungsdatum: string;
    von: string;
    bis: string;
    abbruch: string;
    entscheidart: string;
    status: string;

    constructor(teilnehmerDTO: TeilnehmerDTO, private formUtils: FormUtilsService, private dbTranslateSerivce: DbTranslateService) {
        this.kanton = teilnehmerDTO.kanton;
        this.platz = teilnehmerDTO.buchungPlatz ? teilnehmerDTO.buchungPlatz : '';
        this.teilnehmer = `${teilnehmerDTO.stesName}, ${teilnehmerDTO.stesVorname}`;
        this.personenNr = teilnehmerDTO.personenNr;
        this.bearbeitung = `${teilnehmerDTO.benutzerLogin} ${teilnehmerDTO.benutzerNachname}, ${teilnehmerDTO.benutzerVorname} ${teilnehmerDTO.benutzerstelleId}`;
        this.buchungsdatum = this.formUtils.formatDateNgx(teilnehmerDTO.buchungDatum, 'DD.MM.YYYY');
        this.von = this.formUtils.formatDateNgx(teilnehmerDTO.buchungVon, 'DD.MM.YYYY');
        this.bis = this.formUtils.formatDateNgx(teilnehmerDTO.buchungBis, 'DD.MM.YYYY');
        this.abbruch = teilnehmerDTO.buchungAbbruch ? this.formUtils.formatDateNgx(teilnehmerDTO.buchungAbbruch, 'DD.MM.YYYY') : '';
        this.entscheidart = this.dbTranslateSerivce.translate(teilnehmerDTO.entscheidArt, 'kurzText');
        this.status = this.dbTranslateSerivce.translate(teilnehmerDTO.entscheidStatus, 'kurzText');
    }
}
