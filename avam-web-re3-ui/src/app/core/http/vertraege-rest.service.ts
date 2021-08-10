import { VertragswertDTO } from '@dtos/vertragswertDTO';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { LeistungsvereinbarungSuchenParamDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungSuchenParamDTO';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListLeistungsvereinbarungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListLeistungsvereinbarungDTOWarningMessages';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { RahmenvertragSuchenParamDTO } from '@app/shared/models/dtos-generated/rahmenvertragSuchenParamDTO';
import { BaseResponseWrapperListRahmenvertragDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListRahmenvertragDTOWarningMessages';
import { VertragswertSuchenParamDTO } from '@app/shared/models/dtos-generated/vertragswertSuchenParamDTO';
import { BaseResponseWrapperListVertragswertViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListVertragswertViewDTOWarningMessages';
import { BaseResponseWrapperRahmenvertragDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperRahmenvertragDTOWarningMessages';
import { BaseResponseWrapperVertragswertContainerDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperVertragswertContainerDTOWarningMessages';
import { BaseResponseWrapperListIntegerWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListIntegerWarningMessages';
import { RahmenvertragDTO } from '@app/shared/models/dtos-generated/rahmenvertragDTO';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { PlanwertSuchenParameterDTO } from '@app/shared/models/dtos-generated/planwertSuchenParameterDTO';
import { BaseResponseWrapperListPlanwertDTOWarningMessages } from '@dtos/baseResponseWrapperListPlanwertDTOWarningMessages';
import { BaseResponseWrapperAsalDatenParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAsalDatenParamDTOWarningMessages';
import { BaseResponseWrapperTeilzahlungswertUebersichtParameterDTOWarningMessages } from '@dtos/baseResponseWrapperTeilzahlungswertUebersichtParameterDTOWarningMessages';
import { BaseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages } from '@dtos/baseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages';
import { PlanwertDTO } from '@shared/models/dtos-generated/planwertDTO';
import { BaseResponseWrapperVertragswertDTOWarningMessages } from '@dtos/baseResponseWrapperVertragswertDTOWarningMessages';
import { TeilzahlungswertDTO } from '@app/shared/models/dtos-generated/teilzahlungswertDTO';
import { BaseResponseWrapperListVertragswertDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListVertragswertDTOWarningMessages';
import { BaseResponseWrapperBooleanWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperBooleanWarningMessages';
import { BaseResponseWrapperListVertragswertMDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListVertragswertMDTOWarningMessages';
import { BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAufteilungBudgetjahrDTOWarningMessages';
import { AufteilungBudgetjahrDTO } from '@app/shared/models/dtos-generated/aufteilungBudgetjahrDTO';

@Injectable()
export class VertraegeRestService {
    constructor(private http: HttpClient) {}

    searchLeistungsvereinbarungen(param: LeistungsvereinbarungSuchenParamDTO): Observable<BaseResponseWrapperListLeistungsvereinbarungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListLeistungsvereinbarungDTOWarningMessages>(setBaseUrl('/rest/amm/akqusition/leistungsvereinbarung/search'), param)
            .pipe(catchError(handleError));
    }

    searchRahmenvertraege(param: RahmenvertragSuchenParamDTO): Observable<BaseResponseWrapperListRahmenvertragDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListRahmenvertragDTOWarningMessages>(setBaseUrl('/rest/amm/akqusition/rahmenvertrag/search'), param).pipe(catchError(handleError));
    }

    searchVertragswert(param: VertragswertSuchenParamDTO): Observable<BaseResponseWrapperListVertragswertViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListVertragswertViewDTOWarningMessages>(setBaseUrl('/rest/amm/akqusition/vertragswert/search'), param)
            .pipe(catchError(handleError));
    }

    searchPlanwerteForVertragswert(params: PlanwertSuchenParameterDTO, planwertTypClass: string): Observable<BaseResponseWrapperListPlanwertDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/planwert/${planwertTypClass}/search`), params)
            .pipe(catchError(handleError));
    }

    getVertragswertDetail(lvId: number, vertragswertTypClass: string, elementId: number, planwertDto: PlanwertDTO): Observable<BaseResponseWrapperVertragswertDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperVertragswertDTOWarningMessages>(
                setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertTypClass}/leistungsvereinbarung/${lvId}/planwert/${elementId}/detail`),
                planwertDto
            )
            .pipe(catchError(handleError));
    }

    getVertragswertDetailNoPlanwert(lvId: number, vertragswertTypClass: string, elementId: number): Observable<BaseResponseWrapperVertragswertDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperVertragswertDTOWarningMessages>(
                setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertTypClass}/leistungsvereinbarung/${lvId}/planwert/${elementId}/detail`)
            )
            .pipe(catchError(handleError));
    }

    getVertragswertDetailById(vertragswertId: number, referencedLvId: number): Observable<BaseResponseWrapperVertragswertDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperVertragswertDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertId}/leistungsvereinbarung/${referencedLvId}`))
            .pipe(catchError(handleError));
    }

    getVertragswertDetailByIdWithoutRef(vertragswertId: number): Observable<BaseResponseWrapperVertragswertDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperVertragswertDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertId}/without-ref`))
            .pipe(catchError(handleError));
    }

    berechnenVertragswertDetail(vwDto: VertragswertDTO): Observable<BaseResponseWrapperVertragswertDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperVertragswertDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/berechnen`), vwDto).pipe(catchError(handleError));
    }

    saveVertragswert(vwDto: VertragswertDTO): Observable<BaseResponseWrapperVertragswertDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperVertragswertDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert`), vwDto).pipe(catchError(handleError));
    }

    getVertragswerteUebersichtForMassnahme(massnahmeId: number): Observable<BaseResponseWrapperListVertragswertDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListVertragswertDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/uebersicht/massnahme/${massnahmeId}`))
            .pipe(catchError(handleError));
    }

    getVertragswerteUebersichtForKurs(kursId: number): Observable<BaseResponseWrapperListVertragswertDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListVertragswertDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/uebersicht/kurs/${kursId}`))
            .pipe(catchError(handleError));
    }

    getVertragswerteUebersichtForStandort(standortId: number): Observable<BaseResponseWrapperListVertragswertDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListVertragswertDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/uebersicht/standort/${standortId}`))
            .pipe(catchError(handleError));
    }

    isUserAuthorisedForVwUebersichtButtons(produktId: number): Observable<BaseResponseWrapperBooleanWarningMessages> {
        return this.http
            .get<BaseResponseWrapperBooleanWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/uebersicht/produkt/${produktId}/buttons`))
            .pipe(catchError(handleError));
    }

    detachMassnahmenVertragswertFromKurs(vwId: number, kursId: number) {
        return this.http.put<any>(setBaseUrl(`/rest/amm/akqusition/kurs/${kursId}/detach/vertragswert/${vwId}`), null).pipe(catchError(handleError));
    }

    attachMassnahmenVertragswertToKurs(vwId: number, kursId: number) {
        return this.http.put<any>(setBaseUrl(`/rest/amm/akqusition/kurs/${kursId}/attach/vertragswert/${vwId}`), null).pipe(catchError(handleError));
    }

    getRahmenvertrag(rahmenvertragId: number): Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperRahmenvertragDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/rahmenvertrag/${rahmenvertragId}`)).pipe(catchError(handleError));
    }

    getVertragswertContainerByLvId(leistungsvereinbarungId: number): Observable<BaseResponseWrapperVertragswertContainerDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperVertragswertContainerDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/lv/${leistungsvereinbarungId}`))
            .pipe(catchError(handleError));
    }

    getVertragswertAsalDaten(vertragswertId: number): Observable<BaseResponseWrapperAsalDatenParamDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAsalDatenParamDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertId}/asal`))
            .pipe(catchError(handleError));
    }

    getVertragswertAsalDatenExcelExport(vertragswertId: number): Observable<HttpResponse<any>> {
        const path = `/rest/amm/akqusition/vertragswert/${vertragswertId}/asal/export`;

        return this.http
            .get<any>(setBaseUrl(path), {
                observe: 'response',
                responseType: 'blob' as 'json'
            })
            .pipe(catchError(handleError));
    }

    getVertragswerteForZuordnen(kursId: number): Observable<BaseResponseWrapperListVertragswertMDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListVertragswertMDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/kurs/${kursId}/zuordnen/vertragswerte`))
            .pipe(catchError(handleError));
    }

    getRahmenvertragButtons(rahmenvertragId: number): Observable<BaseResponseWrapperListIntegerWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListIntegerWarningMessages>(setBaseUrl(`/rest/amm/akqusition/rahmenvertrag/${rahmenvertragId}/buttons`))
            .pipe(catchError(handleError));
    }

    saveRahmenvertrag(param: RahmenvertragDTO): Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperRahmenvertragDTOWarningMessages>(setBaseUrl('/rest/amm/akqusition/rahmenvertrag'), param).pipe(catchError(handleError));
    }

    getRahmenvertragStatusOptions(rahmenvertragId: number): Observable<BaseResponseWrapperListCodeDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListCodeDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/rahmenvertrag/${rahmenvertragId}/stati`))
            .pipe(catchError(handleError));
    }

    getRahmenvertragLeistungsvereinbarungen(rahmenvertragId: number): Observable<BaseResponseWrapperListLeistungsvereinbarungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListLeistungsvereinbarungDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/rahmenvertrag/${rahmenvertragId}/leistungsvereinbarungen`))
            .pipe(catchError(handleError));
    }

    updateRahmenvertrag(param: RahmenvertragDTO): Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperRahmenvertragDTOWarningMessages>(setBaseUrl('/rest/amm/akqusition/rahmenvertrag'), param).pipe(catchError(handleError));
    }

    deleteRahmenvertrag(rahmenvertragId: number): Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages> {
        return this.http
            .delete<BaseResponseWrapperRahmenvertragDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/rahmenvertrag/${rahmenvertragId}`))
            .pipe(catchError(handleError));
    }

    rahmenvertragZuruecknehmen(rahmenvertragId: number): Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperRahmenvertragDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/rahmenvertrag/${rahmenvertragId}/zuruecknehmen`), null)
            .pipe(catchError(handleError));
    }

    rahmenvertragFreigeben(rahmenvertragId: number): Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperRahmenvertragDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/rahmenvertrag/${rahmenvertragId}/freigeben`), null)
            .pipe(catchError(handleError));
    }

    rahmenvertragErsetzen(rahmenvertragId: number): Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperRahmenvertragDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/rahmenvertrag/${rahmenvertragId}/ersetzen`), null)
            .pipe(catchError(handleError));
    }

    rahmenvertragUeberarbeiten(rahmenvertragId: number): Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperRahmenvertragDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/rahmenvertrag/${rahmenvertragId}/ueberarbeiten`), null)
            .pipe(catchError(handleError));
    }

    getVertragswertTeilzahlungswerte(vertragswertId: number): Observable<BaseResponseWrapperTeilzahlungswertUebersichtParameterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperTeilzahlungswertUebersichtParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/vertragswert/${vertragswertId}/teilzahlungswerte`))
            .pipe(catchError(handleError));
    }

    getNewTeilzahlungswert(vertragswertId: number): Observable<BaseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages>(
                setBaseUrl(`/rest/amm/teilzahlungen/vertragswert/${vertragswertId}/teilzahlungswert/new`)
            )
            .pipe(catchError(handleError));
    }

    getTeilzahlungswert(teilzahlungswertId: number): Observable<BaseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/teilzahlungswert/${teilzahlungswertId}`))
            .pipe(catchError(handleError));
    }

    saveTeilzahlungswert(param: TeilzahlungswertDTO): Observable<BaseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages>(setBaseUrl('/rest/amm/teilzahlungen/teilzahlungswert'), param)
            .pipe(catchError(handleError));
    }

    deleteTeilzahlungswert(param: TeilzahlungswertDTO): Observable<any> {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: param
        };
        return this.http.delete<any>(setBaseUrl('/rest/amm/teilzahlungen/teilzahlungswert'), options).pipe(catchError(handleError));
    }

    updateTeilzahlungswert(param: TeilzahlungswertDTO): Observable<BaseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperTeilzahlungswertBearbeitenParameterDTOWarningMessages>(setBaseUrl('/rest/amm/teilzahlungen/teilzahlungswert'), param)
            .pipe(catchError(handleError));
    }

    deleteVertragswert(vertragswertId: number): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertId}`)).pipe(catchError(handleError));
    }

    getVertragswertControllingwerte(vertragswertId: number): Observable<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertId}/controllingwerte`))
            .pipe(catchError(handleError));
    }

    deleteVertragswertControllingwerteRow(
        vertragswertId: number,
        geldgeberId: number,
        aufteilungBudgetjahr: AufteilungBudgetjahrDTO
    ): Observable<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages> {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: aufteilungBudgetjahr
        };

        return this.http
            .delete<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages>(
                setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertId}/controllingwerte/geldgeber/${geldgeberId}`),
                options
            )
            .pipe(catchError(handleError));
    }

    calculateVertragswertControllingwerte(
        vertragswertId: number,
        kostenverteilschluessel: string,
        aufteilungBudgetjahr: AufteilungBudgetjahrDTO
    ): Observable<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages>(
                setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertId}/kostenverteilschluessel/${kostenverteilschluessel}/controllingwerte/berechnen`),
                aufteilungBudgetjahr
            )
            .pipe(catchError(handleError));
    }

    saveVertragswertControllingwerte(
        vertragswertId: number,
        kostenverteilschluessel: string,
        aufteilungBudgetjahr: AufteilungBudgetjahrDTO
    ): Observable<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages>(
                setBaseUrl(`/rest/amm/akqusition/vertragswert/${vertragswertId}/kostenverteilschluessel/${kostenverteilschluessel}/controllingwerte`),
                aufteilungBudgetjahr
            )
            .pipe(catchError(handleError));
    }
}
