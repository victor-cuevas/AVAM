import { PlanwertSuchenParameterDTO } from '@dtos/planwertSuchenParameterDTO';
import { BaseResponseWrapperLongWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperLongWarningMessages';
import { TeilzahlungswertListeViewDTO } from '@app/shared/models/dtos-generated/teilzahlungswertListeViewDTO';
import { TeilzahlungBearbeitenParameterDTO } from '@dtos/teilzahlungBearbeitenParameterDTO';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
// prettier-ignore
import { BaseResponseWrapperTeilzahlungUebersichtParameterDTOWarningMessages } from '@dtos/baseResponseWrapperTeilzahlungUebersichtParameterDTOWarningMessages';
import { TeilzahlungenSuchenParameterDTO } from '@app/shared/models/dtos-generated/teilzahlungenSuchenParameterDTO';
import { BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages } from '@dtos/baseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages';
import { AbrechnungBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungBearbeitenParameterDTO';
import { AbrechnungswertListeViewDTO } from '@app/shared/models/dtos-generated/abrechnungswertListeViewDTO';
import { AbrechnungDTO } from '@app/shared/models/dtos-generated/abrechnungDTO';
// prettier-ignore
import { BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages } 
    from '@app/shared/models/dtos-generated/baseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages';
import { BaseResponseWrapperListAbrechnungswertListeViewDTOWarningMessages } from '@dtos/baseResponseWrapperListAbrechnungswertListeViewDTOWarningMessages';
import { LeistungsvereinbarungDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungDTO';
import { BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperLeistungsvereinbarungDTOWarningMessages';
import { BaseResponseWrapperListAmmAuszahlungZurAbrechnungXDTOWarningMessages } from '@dtos/baseResponseWrapperListAmmAuszahlungZurAbrechnungXDTOWarningMessages';
import { alertChannelParam } from '@app/shared/components/alert/alert-channel-query-param';
import { BaseResponseWrapperCollectionIntegerWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionIntegerWarningMessages';
import { LeistungsvereinbarungSuchenParamDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungSuchenParamDTO';
import { BaseResponseWrapperListLeistungsvereinbarungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListLeistungsvereinbarungDTOWarningMessages';
// prettier-ignore
import { BaseResponseWrapperListTeilzahlungswertListeViewDTOWarningMessages } 
    from '@app/shared/models/dtos-generated/baseResponseWrapperListTeilzahlungswertListeViewDTOWarningMessages';
import { AbrechnungSuchenParamDTO } from '@app/shared/models/dtos-generated/abrechnungSuchenParamDTO';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { BaseResponseWrapperListAbrechnungsListeViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListAbrechnungsListeViewDTOWarningMessages';
import { BaseResponseWrapperAbrechnungswertSuchenParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAbrechnungswertSuchenParamDTOWarningMessages';
import { AbrechnungswertSuchenParamDTO } from '@app/shared/models/dtos-generated/abrechnungswertSuchenParamDTO';
import { BaseResponseWrapperAbrechnungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAbrechnungDTOWarningMessages';
import { BaseResponseWrapperListAmmAuszahlungZurTeilzahlungXDTOWarningMessages } from '@dtos/baseResponseWrapperListAmmAuszahlungZurTeilzahlungXDTOWarningMessages';
import { BaseResponseWrapperListAuszahlungZurLeistungsvereinbarungXDTOWarningMessages } from '@dtos/baseResponseWrapperListAuszahlungZurLeistungsvereinbarungXDTOWarningMessages';
import { ZahlungenSuchenParameterDTO } from '@app/shared/models/dtos-generated/zahlungenSuchenParameterDTO';
import { BaseResponseWrapperTeilzahlungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperTeilzahlungDTOWarningMessages';
import { TeilzahlungswertDTO } from '@app/shared/models/dtos-generated/teilzahlungswertDTO';
import { BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages } from '@dtos/baseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { BaseResponseWrapperListTeilzahlungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListTeilzahlungDTOWarningMessages';
import { BaseResponseWrapperListAbrechnungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListAbrechnungDTOWarningMessages';
// prettier-ignore
import { BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages } 
from '@app/shared/models/dtos-generated/baseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages';
import { AufteilungBudgetjahrDTO } from '@app/shared/models/dtos-generated/aufteilungBudgetjahrDTO';
import { BaseResponseWrapperStrukturElementDTOWarningMessages } from '@dtos/baseResponseWrapperStrukturElementDTOWarningMessages';

@Injectable()
export class AnbieterRestService {
    constructor(private http: HttpClient) {}

    getTeilzahlungenUebersicht(param: TeilzahlungenSuchenParameterDTO): Observable<BaseResponseWrapperTeilzahlungUebersichtParameterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperTeilzahlungUebersichtParameterDTOWarningMessages>(setBaseUrl('/rest/amm/teilzahlungen/uebersicht'), param)
            .pipe(catchError(handleError));
    }

    initAbrechnungParam(anbieterId: number): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/${anbieterId}/abrechnung/new`))
            .pipe(catchError(handleError));
    }

    initAbrechnungParamByAbrechnungswertId(abrechnungswertIds: number[]): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/new`), abrechnungswertIds)
            .pipe(catchError(handleError));
    }

    getAbrechnungParam(abrechnungId: number): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/${abrechnungId}`))
            .pipe(catchError(handleError));
    }

    saveAbrechnung(param: AbrechnungBearbeitenParameterDTO): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl('/rest/amm/anbieter/abrechnung'), param).pipe(catchError(handleError));
    }

    abrechnungErsetzen(abrechnungId: number): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/${abrechnungId}/ersetzen`), null)
            .pipe(catchError(handleError));
    }

    abrechnungUeberarbeiten(abrechnungId: number): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/${abrechnungId}/ueberarbeiten`), null)
            .pipe(catchError(handleError));
    }

    abrechnungZuruecknehmen(abrechnungId: number): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/${abrechnungId}/zuruecknehmen`), null)
            .pipe(catchError(handleError));
    }

    abrechnungFreigeben(abrechnung: AbrechnungDTO): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/freigeben`), abrechnung)
            .pipe(catchError(handleError));
    }

    deleteAbrechnung(abrechnungId: number): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .delete<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/${abrechnungId}`))
            .pipe(catchError(handleError));
    }

    abrechnungswertSearch(abrechnungId: number, channel?: string): Observable<BaseResponseWrapperListAbrechnungswertListeViewDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListAbrechnungswertListeViewDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/${abrechnungId}/abrechnungswert/search`), {
                params: alertChannelParam(channel)
            })
            .pipe(catchError(handleError));
    }

    assignAbrechnungswerte(abrechnungId: number, abrechnungswerte: AbrechnungswertListeViewDTO[]): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(
                setBaseUrl(`/rest/amm/anbieter/abrechnung/${abrechnungId}/abrechnungswert/zuordnen`),
                abrechnungswerte
            )
            .pipe(catchError(handleError));
    }

    removeAbrechnungswert(abrechnungId: number, abrechnungswerte: AbrechnungswertListeViewDTO[]): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/${abrechnungId}/abrechnungswert`), abrechnungswerte)
            .pipe(catchError(handleError));
    }

    searchAbrechnungen(param: AbrechnungSuchenParamDTO): Observable<BaseResponseWrapperListAbrechnungsListeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListAbrechnungsListeViewDTOWarningMessages>(setBaseUrl('/rest/amm/anbieter/abrechnung/search'), param)
            .pipe(catchError(handleError));
    }

    getAbrechnungswertSuchenParam(): Observable<BaseResponseWrapperAbrechnungswertSuchenParamDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAbrechnungswertSuchenParamDTOWarningMessages>(setBaseUrl('/rest/amm/abrechnungswert/search/param')).pipe(catchError(handleError));
    }

    searchAbrechnungswerte(param: AbrechnungswertSuchenParamDTO): Observable<BaseResponseWrapperAbrechnungswertSuchenParamDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAbrechnungswertSuchenParamDTOWarningMessages>(setBaseUrl('/rest/amm/abrechnungswert/search'), param).pipe(catchError(handleError));
    }

    validateAbrechnungswerte(abrechnungswerteIds: number[]): Observable<BaseResponseWrapperAbrechnungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAbrechnungDTOWarningMessages>(setBaseUrl('/rest/amm/anbieter/abrechnung/new/abrechnungswerte/validate'), abrechnungswerteIds)
            .pipe(catchError(handleError));
    }

    initAbrechnungswertParam(vertragswertId: number): Observable<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/vertragswert/${vertragswertId}/abrechnungswert`))
            .pipe(catchError(handleError));
    }

    getAbrechnungswertParam(abrechnungswertId: number): Observable<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/abrechnungswert/${abrechnungswertId}`))
            .pipe(catchError(handleError));
    }

    saveAbrechnungswert(abrechnungswert: AbrechnungswertDTO): Observable<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages>(setBaseUrl('/rest/amm/abrechnungswert'), abrechnungswert)
            .pipe(catchError(handleError));
    }

    updateAbrechnungswert(abrechnungswert: AbrechnungswertDTO): Observable<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages>(setBaseUrl('/rest/amm/abrechnungswert'), abrechnungswert)
            .pipe(catchError(handleError));
    }

    calculateAbrechnungswert(abrechnungswert: AbrechnungswertDTO): Observable<any> {
        return this.http.put<any>(setBaseUrl('/rest/amm/abrechnungswert/calculate'), abrechnungswert).pipe(catchError(handleError));
    }

    deleteAbrechnungswert(abrechnungswertId: number): Observable<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages> {
        return this.http
            .delete<BaseResponseWrapperAbrechnungswertBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/abrechnungswert/${abrechnungswertId}`))
            .pipe(catchError(handleError));
    }

    getAbrechnungswertKostenaufteilung(abrechnungswertId: number): Observable<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages>(setBaseUrl(`/rest/amm/abrechnungswert/${abrechnungswertId}/kostenaufteilung`))
            .pipe(catchError(handleError));
    }

    deleteAbrechnungswertGeldgeberAufteilung(abrechnungswertId: number, geldgeberId: number): Observable<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages> {
        return this.http
            .delete<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages>(setBaseUrl(`/rest/amm/abrechnungswert/${abrechnungswertId}/geldgeber/${geldgeberId}`))
            .pipe(catchError(handleError));
    }

    calculateAbrechnungswertKostenaufteilung(
        abrechnungswertId: number,
        kostenverteilschluesselCode: string,
        aufteilungBudgetjahr: AufteilungBudgetjahrDTO[]
    ): Observable<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages>(
                setBaseUrl(`/rest/amm/abrechnungswert/${abrechnungswertId}/kostenverteilschluessel/${kostenverteilschluesselCode}/kostenaufteilung/calculate`),
                aufteilungBudgetjahr
            )
            .pipe(catchError(handleError));
    }

    updateAbrechnungswertKostenaufteilung(
        abrechnungswertId: number,
        kostenverteilschluesselCode: string,
        aufteilungBudgetjahr: AufteilungBudgetjahrDTO[]
    ): Observable<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages>(
                setBaseUrl(`/rest/amm/abrechnungswert/${abrechnungswertId}/kostenverteilschluessel/${kostenverteilschluesselCode}/kostenaufteilung`),
                aufteilungBudgetjahr
            )
            .pipe(catchError(handleError));
    }

    uebernehmenAbrechnungswertKostenaufteilung(abrechnungswertId: number): Observable<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages>(setBaseUrl(`/rest/amm/abrechnungswert/${abrechnungswertId}/kostenaufteilung/uebernehmen`))
            .pipe(catchError(handleError));
    }

    getAuszahlungenZurAbrechnung(abrechnungId: number, channel?: string): Observable<BaseResponseWrapperListAmmAuszahlungZurAbrechnungXDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListAmmAuszahlungZurAbrechnungXDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/abrechnung/${abrechnungId}/auszahlungen`), {
                params: alertChannelParam(channel)
            })
            .pipe(catchError(handleError));
    }

    getTeilzahlungParamByAnbieterId(anbieterId: number): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/anbieter/${anbieterId}`))
            .pipe(catchError(handleError));
    }

    getTeilzahlungParamByTzId(tzId: number): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/${tzId}`)).pipe(catchError(handleError));
    }

    deleteTeilzahlung(param: TeilzahlungBearbeitenParameterDTO): Observable<any> {
        const body = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: param
        };

        return this.http.delete<any>(setBaseUrl(`/rest/amm/teilzahlungen`), body).pipe(catchError(handleError));
    }

    searchTeilzahlungswert(tzId: number, anbieterId: number, teilzahlungswerteIds: number[]): Observable<BaseResponseWrapperListTeilzahlungswertListeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListTeilzahlungswertListeViewDTOWarningMessages>(
                setBaseUrl(`/rest/amm/teilzahlungen/${tzId}/anbieter/${anbieterId}/teilzahlungswert/search`),
                teilzahlungswerteIds
            )
            .pipe(catchError(handleError));
    }

    zuordnenTeilzahlungswert(tzId: number, teilzahlungswerte: TeilzahlungswertListeViewDTO[]): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/${tzId}/teilzahlungswert/zuordnen`), teilzahlungswerte)
            .pipe(catchError(handleError));
    }

    removeTeilzahlungswert(tzId: number, teilzahlungswerte: TeilzahlungswertListeViewDTO[]): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(
                setBaseUrl(`/rest/amm/teilzahlungen/teilzahlung/${tzId}/teilzahlungswert`),
                teilzahlungswerte
            )
            .pipe(catchError(handleError));
    }

    getAuszahlungenZurTeilzahlung(teilzahlungId: number): Observable<BaseResponseWrapperListAmmAuszahlungZurTeilzahlungXDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListAmmAuszahlungZurTeilzahlungXDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/${teilzahlungId}/auszahlungen`))
            .pipe(catchError(handleError));
    }

    saveTeilzahlungParam(param: TeilzahlungBearbeitenParameterDTO): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(setBaseUrl('/rest/amm/teilzahlungen'), param).pipe(catchError(handleError));
    }

    searchLeistungsvereinbarungen(param: LeistungsvereinbarungSuchenParamDTO): Observable<BaseResponseWrapperListLeistungsvereinbarungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListLeistungsvereinbarungDTOWarningMessages>(setBaseUrl('/rest/amm/akqusition/leistungsvereinbarung/uebersicht'), param)
            .pipe(catchError(handleError));
    }

    getLeistungsvereinbarungById(lvId: number): Observable<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/${lvId}`))
            .pipe(catchError(handleError));
    }

    saveLeistungsvereinbarung(param: LeistungsvereinbarungDTO, creatingNew: boolean): Observable<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages> {
        const url = creatingNew ? '/rest/amm/akqusition/leistungsvereinbarung/create' : '/rest/amm/akqusition/leistungsvereinbarung/save';
        return this.http.post<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages>(setBaseUrl(url), param).pipe(catchError(handleError));
    }

    getLeistungsvereinbarungButtons(lvId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http
            .get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/${lvId}/buttons`))
            .pipe(catchError(handleError));
    }

    getLeistungsvereinbarungStati(lvId: number): Observable<BaseResponseWrapperListCodeDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListCodeDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/${lvId}/stati`)).pipe(catchError(handleError));
    }

    deleteLeistungsvereinbarung(lvId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.delete<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/${lvId}`)).pipe(catchError(handleError));
    }

    leistungsvereinbarungZuruecknehmen(lvId: number): Observable<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/${lvId}/zuruecknehmen`), {})
            .pipe(catchError(handleError));
    }

    leistungsvereinbarungErsetzen(lvId: number, force: boolean): Observable<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/${lvId}/ersetzen/${force}`), {})
            .pipe(catchError(handleError));
    }

    leistungsvereinbarungFreigeben(lvId: number): Observable<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/${lvId}/freigeben`), {})
            .pipe(catchError(handleError));
    }

    leistungsvereinbarungUeberarbeiten(param: LeistungsvereinbarungDTO): Observable<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/ueberarbeiten`), param)
            .pipe(catchError(handleError));
    }

    leistungsvereinbarungSave(param: LeistungsvereinbarungDTO): Observable<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/save`), param)
            .pipe(catchError(handleError));
    }

    getAuszahlungenZurLeistungsvereinbarung(lvId: number, channel?: string): Observable<BaseResponseWrapperListAuszahlungZurLeistungsvereinbarungXDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListAuszahlungZurLeistungsvereinbarungXDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/leistungsvereinbarung/${lvId}/auszahlungen`), {
                params: alertChannelParam(channel)
            })
            .pipe(catchError(handleError));
    }

    freigebenTeilzahlung(tzId: number): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/${tzId}/freigeben`), {})
            .pipe(catchError(handleError));
    }

    zuruecknehmenTeilzahlung(tzId: number): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/${tzId}/zuruecknehmen`), {})
            .pipe(catchError(handleError));
    }

    ueberarbeitenTeilzahlung(tzId: number): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/${tzId}/ueberarbeiten`), {})
            .pipe(catchError(handleError));
    }

    ersetzenTeilzahlung(tzId: number): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/${tzId}/ersetzen`), {})
            .pipe(catchError(handleError));
    }

    getMassnahmeStruktur(param: PlanwertSuchenParameterDTO): Observable<BaseResponseWrapperStrukturElementDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStrukturElementDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/massnahme-struktur`), param)
            .pipe(catchError(handleError));
    }

    searchTeilzahlungswerte(params: ZahlungenSuchenParameterDTO): Observable<BaseResponseWrapperListTeilzahlungswertListeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListTeilzahlungswertListeViewDTOWarningMessages>(setBaseUrl('/rest/amm/teilzahlungen/teilzahlungswert/search'), params)
            .pipe(catchError(handleError));
    }

    validateTeilzahlungswerte(teilzahlungswerteIds: number[]): Observable<BaseResponseWrapperTeilzahlungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperTeilzahlungDTOWarningMessages>(setBaseUrl('/rest/amm/teilzahlungen/teilzahlung/new/teilzahlungswerte/validate'), teilzahlungswerteIds)
            .pipe(catchError(handleError));
    }

    getTeilzahlungParamByTeilzahlungswerte(teilzahlungswerte: TeilzahlungswertDTO[]): Observable<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperTeilzahlungBearbeitenParameterDTOWarningMessages>(setBaseUrl('/rest/amm/teilzahlungen/teilzahlungswerte'), teilzahlungswerte)
            .pipe(catchError(handleError));
    }

    getTeilzahlungenByAnbieterId(anbieterId: number, channel?: string): Observable<BaseResponseWrapperListTeilzahlungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListTeilzahlungDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/anbieter/${anbieterId}/teilzahlungen`), {
                params: alertChannelParam(channel)
            })
            .pipe(catchError(handleError));
    }

    getAbrechnungenByVertragswertId(vertragswertId: number, channel?: string): Observable<BaseResponseWrapperListAbrechnungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListAbrechnungDTOWarningMessages>(setBaseUrl(`/rest/amm/vertragswert/${vertragswertId}/abrechnungen`), {
                params: alertChannelParam(channel)
            })
            .pipe(catchError(handleError));
    }

    getTeilzahlungswerteByProfilNr(profilNr: number, channel?: string): Observable<BaseResponseWrapperListTeilzahlungswertListeViewDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListTeilzahlungswertListeViewDTOWarningMessages>(setBaseUrl(`/rest/amm/abrechnungswert/profil/${profilNr}/teilzahlungswerte`), {
                params: alertChannelParam(channel)
            })
            .pipe(catchError(handleError));
    }
}
