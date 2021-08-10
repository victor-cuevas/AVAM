import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseResponseWrapperListUnternehmenTerminViewDTOWarningMessages } from '@dtos/baseResponseWrapperListUnternehmenTerminViewDTOWarningMessages';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { UnternehmenTerminDTO } from '@dtos/unternehmenTerminDTO';
import { BaseResponseWrapperUnternehmenTerminDTOWarningMessages } from '@dtos/baseResponseWrapperUnternehmenTerminDTOWarningMessages';
import { TerminEmailDTO } from '@dtos/terminEmailDTO';
import { BaseResponseWrapperTerminEmailDTOWarningMessages } from '@dtos/baseResponseWrapperTerminEmailDTOWarningMessages';

@Injectable()
export class UnternehmenTerminRestService {
    private static readonly BASE_URL = '/rest/common/unternehmentermin';
    private static readonly BASE_UEBERTRAGEN_URL = '/rest/common/unternehmentermin-uebertragen';

    constructor(private http: HttpClient) {}

    getByUnternehmenId(unternehmenId: number): Observable<BaseResponseWrapperListUnternehmenTerminViewDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListUnternehmenTerminViewDTOWarningMessages>(setBaseUrl(`${UnternehmenTerminRestService.BASE_URL}/${unternehmenId}`))
            .pipe(catchError(handleError));
    }

    getByUnternehmenTerminId(unternehmenTerminId: number): Observable<BaseResponseWrapperUnternehmenTerminDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperUnternehmenTerminDTOWarningMessages>(UnternehmenTerminRestService.setTerminUrl(unternehmenTerminId)).pipe(catchError(handleError));
    }

    updateKontakt(unternehmenTermin: UnternehmenTerminDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http
            .post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`${UnternehmenTerminRestService.BASE_URL}/update`), unternehmenTermin)
            .pipe(catchError(handleError));
    }

    createKontakt(unternehmenTermin: UnternehmenTerminDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http
            .post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`${UnternehmenTerminRestService.BASE_URL}/create`), unternehmenTermin)
            .pipe(catchError(handleError));
    }

    deleteKontakt(unternehmenTerminId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.delete<BaseResponseWrapperLongWarningMessages>(UnternehmenTerminRestService.setTerminUrl(unternehmenTerminId)).pipe(catchError(handleError));
    }

    getICSfile(unternehmenId: number, unternehmenTerminId: number): Observable<HttpResponse<Blob>> {
        return this.http.get<Blob>(setBaseUrl(`${UnternehmenTerminRestService.BASE_UEBERTRAGEN_URL}/${unternehmenId}/${unternehmenTerminId}/ics`), {
            observe: 'response',
            responseType: 'blob' as 'json'
        });
    }

    getEmailData(unternehmenId: string, unternehmenTerminId: string): Observable<BaseResponseWrapperTerminEmailDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`${UnternehmenTerminRestService.BASE_UEBERTRAGEN_URL}/${unternehmenId}/${unternehmenTerminId}/mail`)).pipe(catchError(handleError));
    }

    sendEmail(dto: TerminEmailDTO): Observable<any> {
        return this.http.post<any>(setBaseUrl(`${UnternehmenTerminRestService.BASE_UEBERTRAGEN_URL}`), dto).pipe(catchError(handleError));
    }

    private static setTerminUrl(unternehmenTerminId: number): string {
        return setBaseUrl(`${UnternehmenTerminRestService.BASE_URL}/${unternehmenTerminId}/termin`);
    }
}
