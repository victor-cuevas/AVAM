import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { handleError } from '@shared/services/handle-error.function';
import { BaseResponseWrapperDmsMetadatenDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperDmsMetadatenDTOWarningMessages';

@Injectable()
export class DmsMetadatenCopyRestService {
    private static readonly BASE_URL = '/rest/common/dms-metadaten';
    constructor(private http: HttpClient) {}

    copyStesPersonalienMetadaten(stesId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/stes/${stesId}`);
    }

    copyTerminMetadaten(terminId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/termin/${terminId}`);
    }

    copyInfotagBuchungMetadaten(geschaeftsfallId: string, language: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/infotag-buchung/${geschaeftsfallId}/${language}`);
    }

    copySchnellzuweisungMetadaten(schnellzuweisungId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/schnellzuweisung/${schnellzuweisungId}`);
    }

    copyAmmMetadaten(geschaeftsfallId: string, nr: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/amm/${geschaeftsfallId}/${nr}`);
    }

    copyLeistungsexportMetadaten(leistungsexportId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/leistungsexport/${leistungsexportId}`);
    }

    copyZuweisungFachberatungMetadaten(zuweisungFachberatungId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/zuweisungfachberatung/${zuweisungFachberatungId}`);
    }

    copyAusgangslageMetadaten(ausgangslageId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/ausgangslage/${ausgangslageId}`);
    }

    copyZuweisungMetadaten(zuweisungId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/zuweisung/${zuweisungId}`);
    }

    copyVmfSachverhaltMetadaten(vmfId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/vmf/sachverhalt/${vmfId}`);
    }

    copyVmfEntscheidMetadaten(entscheidId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/vmf/entscheid/${entscheidId}`);
    }

    copySknSachverhaltMetadaten(sanktionId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/sanktionen/sachverhalt/${sanktionId}`);
    }

    copyKontrollperiodeMetadaten(kontrollperiodeId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/kontrollperioden/${kontrollperiodeId}`);
    }

    copyElementKategorieMetadata(elementkategorieId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/elementkategorie/${elementkategorieId}`);
    }

    copyKontaktpersonMetadaten(kontaktpersonId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/kontaktperson/${kontaktpersonId}`);
    }

    copyKontaktMetadaten(unternehmenTerminId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/unternehmentermin/${unternehmenTerminId}`);
    }

    copyOsteDmsMetadaten(osteId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/oste/${osteId}`);
    }

    copyVoranmeldungKaeMetadaten(voranmeldungKaeId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/voranmeldung-kae/${voranmeldungKaeId}`);
    }

    copyInfotagMassnahmeGrunddatenMetadaten(massnahmeId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/infotag/massnahme/${massnahmeId}`);
    }

    copyProduktGrunddatenMetadaten(produktId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/produkt/${produktId}`);
    }

    copyAnbieterMetadaten(unternehmenId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/anbieter/${unternehmenId}`);
    }

    copyBudgetMetadaten(budgetId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/budget/${budgetId}`);
    }

    copyUnternehmenBearbeitenMetadaten(unternehmenId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/unternehmen/${unternehmenId}`);
    }

    copyUnternehmenArbeitgeberMetadaten(unternehmenId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/arbeitgeber/${unternehmenId}`);
    }

    copyMassnahmenMassnahmeMetadaten(massnahmeId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/massnahme/${massnahmeId}`);
    }

    copyStesFachberatungsangebotMetadaten(fachberatungsangebotId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/stesfachberatungsangebot/${fachberatungsangebotId}`);
    }

    copyInfotagBearbeitenMetadaten(dfeId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/infotag/${dfeId}`);
    }

    copyDfeKursGrunddatenMetadaten(dfeId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/dfe/kurs/${dfeId}`);
    }

    copyDfeStandortGrunddatenMetadaten(dfeId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/dfe/standort/${dfeId}`);
    }

    copyAbrechnungBearbeitenMetadaten(abrechnungNr: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/abrechnung/${abrechnungNr}`);
    }

    copyAbrechnungswertBearbeitenMetadaten(abrechnungswertNr: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/abrechnungswert/${abrechnungswertNr}`);
    }

    copyTeilzahlungBearbeitenMetadaten(tzNr: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/teilzahlung/${tzNr}`);
    }

    copyLeistungsvereinbarungBearbeitenMetadaten(lvNr: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/leistungsvereinbarung/${lvNr}`);
    }

    copySweMeldungMetadaten(sweMeldungId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/swe-meldung/${sweMeldungId}`);
    }

    copyRahmnevertragDmsMetadaten(rahmnevertragId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/rahmenvertrag/${rahmnevertragId}`);
    }

    copyTeilzahlungswertBearbeitenMetadaten(teilzahlungswertId: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/teilzahlungswert/${teilzahlungswertId}`);
    }

    copyVertragswertMetadaten(vertragswertNr: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/vertragswert/${vertragswertNr}`);
    }

    copyPlanungMetadaten(planungOrganisationsKuerzel: string, planungsJahr: number): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.get(`/planung/${planungOrganisationsKuerzel}/${planungsJahr}`);
    }

    private get(url: string): Observable<BaseResponseWrapperDmsMetadatenDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperDmsMetadatenDTOWarningMessages>(setBaseUrl(`${DmsMetadatenCopyRestService.BASE_URL}${url}`)).pipe(catchError(handleError));
    }
}
