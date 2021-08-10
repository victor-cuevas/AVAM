import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseResponseWrapperListMassnahmeViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListMassnahmeViewDTOWarningMessages';
import { BaseResponseWrapperMassnahmeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperMassnahmeDTOWarningMessages';
import { BaseResponseWrapperSessionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperSessionDTOWarningMessages';
import { InfotagDurchfuehrungseinheitSuchenParamDTO } from '@app/shared/models/dtos-generated/infotagDurchfuehrungseinheitSuchenParamDTO';
import { InfotagMassnahmeSuchenParamDTO } from '@app/shared/models/dtos-generated/infotagMassnahmeSuchenParamDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { handleError } from '@app/shared/services/handle-error.function';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages } from '@dtos/baseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages';
import { BaseResponseWrapperListAmmTeilnehmerBuchungSessionViewDTOWarningMessages } from '@dtos/baseResponseWrapperListAmmTeilnehmerBuchungSessionViewDTOWarningMessages';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AmmTeilnehmerBuchungSessionViewDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerBuchungSessionViewDTO';

@Injectable()
export class AmmInfotagRestService {
    constructor(private http: HttpClient) {}

    getInfotagMassnahmenList(searchParams: InfotagMassnahmeSuchenParamDTO): Observable<BaseResponseWrapperListMassnahmeViewDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListMassnahmeViewDTOWarningMessages>(setBaseUrl('/rest/amm/infotag/massnahme/search'), searchParams).pipe(catchError(handleError));
    }

    getNewInfotagMassnahme(): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/massnahme/new`)).pipe(catchError(handleError));
    }

    getInfotagMassnahme(massnahmeId: number): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/massnahme/${massnahmeId}`)).pipe(catchError(handleError));
    }

    saveInfotagMassnahme(dto: MassnahmeDTO): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/massnahme`), dto).pipe(catchError(handleError));
    }

    deleteInfotagMassnahme(massnahmeId: number): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/massnahme/${massnahmeId}`)).pipe(catchError(handleError));
    }

    saveInfotagMassnahmeOrtBeschreibung(dto: MassnahmeDTO): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/massnahme/ortandbeschreibung`), dto).pipe(catchError(handleError));
    }

    anbieterdatenUebernehmen(massnahmeId: number): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/massnahme/${massnahmeId}/ortandbeschreibung/uebernehmen`))
            .pipe(catchError(handleError));
    }

    getInfotagDurchfuehrungseinheitList(
        searchParams: InfotagDurchfuehrungseinheitSuchenParamDTO
    ): Observable<BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages>(setBaseUrl('/rest/amm/infotag/search'), searchParams)
            .pipe(catchError(handleError));
    }

    getInfotageByMassnahme(params: InfotagDurchfuehrungseinheitSuchenParamDTO): Observable<BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/massnahme/infotag/search`), params)
            .pipe(catchError(handleError));
    }

    getNewInfotag(massnahmeId: number): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/massnahme/${massnahmeId}/infotag/new`)).pipe(catchError(handleError));
    }

    getInfotag(dfeId: number): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/${dfeId}`)).pipe(catchError(handleError));
    }

    saveInfotag(dto: SessionDTO): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag`), dto).pipe(catchError(handleError));
    }

    deleteInfotag(dfeId: number): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/${dfeId}`)).pipe(catchError(handleError));
    }

    saveInfotagOrtBeschreibung(dto: SessionDTO): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/ortandbeschreibung`), dto).pipe(catchError(handleError));
    }

    getTeilnehmerliste(dfeId: number): Observable<BaseResponseWrapperListAmmTeilnehmerBuchungSessionViewDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListAmmTeilnehmerBuchungSessionViewDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/${dfeId}/teilnehmern`))
            .pipe(catchError(handleError));
    }

    getCopyInfotag(dfeId: number): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/${dfeId}/copy`)).pipe(catchError(handleError));
    }

    updateTeilnehmerListStatus(
        dfeId: number,
        statusId: number,
        dto: AmmTeilnehmerBuchungSessionViewDTO[]
    ): Observable<BaseResponseWrapperListAmmTeilnehmerBuchungSessionViewDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperListAmmTeilnehmerBuchungSessionViewDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/${dfeId}/teilnehmern/status/${statusId}`), dto)
            .pipe(catchError(handleError));
    }

    infotagAnbieterdatenUebernehmen(dfeId: number): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/infotag/${dfeId}/ortandbeschreibung/uebernehmen`)).pipe(catchError(handleError));
    }

    getTeilnehmerExport(dfeId: number): Observable<HttpResponse<any>> {
        return this.http
            .get<any>(setBaseUrl(`/rest/amm/infotag/${dfeId}/export`), {
                observe: 'response',
                responseType: 'blob' as 'json'
            })
            .pipe(catchError(handleError));
    }
}
