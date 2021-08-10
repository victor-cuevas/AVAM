import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { StesTerminDetailsDTO } from '@shared/models/dtos-generated/stesTerminDetailsDTO';
import { TerminEmailDTO } from '@dtos/terminEmailDTO';
import { BaseResponseWrapperTerminEmailDTOWarningMessages } from '@dtos/baseResponseWrapperTerminEmailDTOWarningMessages';

@Injectable()
export class StesTerminRestService {
    constructor(private http: HttpClient) {}

    getTermine(id: string, language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/termin/${language}`)).pipe(catchError(handleError));
    }

    getTerminById(id: string, language: string, terminId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/termin/${language}/${terminId}`)).pipe(catchError(handleError));
    }

    deleteTermin(id: string, language: string, terminId: string): Observable<StesTerminDetailsDTO> {
        return this.http.delete<StesTerminDetailsDTO>(setBaseUrl(`/rest/stes/${id}/termin/${language}/${terminId}`)).pipe(catchError(handleError));
    }

    updateTermin(id: string, language: string, params: any): Observable<any> {
        return this.http.post<StesTerminDetailsDTO>(setBaseUrl(`/rest/stes/${id}/termin/${language}`), params).pipe(catchError(handleError));
    }

    insertTermin(id: string, language: string, params: any): Observable<any> {
        return this.http.post<StesTerminDetailsDTO>(setBaseUrl(`/rest/stes/${id}/termin/${language}/create`), params).pipe(catchError(handleError));
    }

    getStesTerminCalendar(id: string, terminId: string): Observable<HttpResponse<Blob>> {
        return this.http.get<Blob>(setBaseUrl(`/rest/stes/${id}/terminuebertragen/${terminId}/ics`), {
            observe: 'response',
            responseType: 'blob' as 'json'
        });
    }

    getStesTerminEmail(id: string, terminId: string): Observable<BaseResponseWrapperTerminEmailDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/terminuebertragen/${terminId}/mail`)).pipe(catchError(handleError));
    }

    sendTerminEmail(id: string, terminId: string, dto: TerminEmailDTO): Observable<BaseResponseWrapperTerminEmailDTOWarningMessages> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${id}/terminuebertragen/${terminId}`), dto).pipe(catchError(handleError));
    }
}
