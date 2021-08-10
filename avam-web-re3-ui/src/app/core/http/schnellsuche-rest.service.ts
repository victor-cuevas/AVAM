import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '../../shared/services/handle-error.function';
import { setBaseUrl } from '../../shared/services/setBaseUrl.function';
import { BaseResponseWrapperListSchnellsucheStesDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListSchnellsucheStesDTOWarningMessages';
import { BaseResponseWrapperListSchnellsucheUnternehmenDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListSchnellsucheUnternehmenDTOWarningMessages';

@Injectable()
export class SchnellsucheRestService {
    constructor(private http: HttpClient) {}

    searchForStes(_language: string, _searchText: string): Observable<BaseResponseWrapperListSchnellsucheStesDTOWarningMessages> {
        let serviceUrl = setBaseUrl(`/rest/common/schnellsuche/stes`);
        return this.http
            .post<BaseResponseWrapperListSchnellsucheStesDTOWarningMessages>(serviceUrl, { language: _language, searchText: _searchText })
            .pipe(catchError(handleError));
    }
    
    searchForArbeitgeber(_language: string, _searchText: string): Observable<BaseResponseWrapperListSchnellsucheUnternehmenDTOWarningMessages> {
        let serviceUrl = setBaseUrl(`/rest/common/schnellsuche/arbeitgeber`);
        return this.http
            .post<BaseResponseWrapperListSchnellsucheStesDTOWarningMessages>(serviceUrl, { language: _language, searchText: _searchText })
            .pipe(catchError(handleError));
    }
    
    searchForAnbieter(_language: string, _searchText: string): Observable<BaseResponseWrapperListSchnellsucheUnternehmenDTOWarningMessages> {
        let serviceUrl = setBaseUrl(`/rest/common/schnellsuche/anbieter`);
        return this.http
            .post<BaseResponseWrapperListSchnellsucheUnternehmenDTOWarningMessages>(serviceUrl, { language: _language, searchText: _searchText })
            .pipe(catchError(handleError));
    }
    
    searchForFachberatung(_language: string, _searchText: string): Observable<BaseResponseWrapperListSchnellsucheUnternehmenDTOWarningMessages> {
        let serviceUrl = setBaseUrl(`/rest/common/schnellsuche/fachberatung`);
        return this.http
            .post<BaseResponseWrapperListSchnellsucheUnternehmenDTOWarningMessages>(serviceUrl, { language: _language, searchText: _searchText })
            .pipe(catchError(handleError));
    }
}
