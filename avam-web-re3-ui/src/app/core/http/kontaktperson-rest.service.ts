import { Injectable } from '@angular/core';
import { KontaktpersonSearchParamDTO } from '@dtos/kontaktpersonSearchParamDTO';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListKontakteViewDTOWarningMessages } from '@dtos/baseResponseWrapperListKontakteViewDTOWarningMessages';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { HttpClient } from '@angular/common/http';
import { KontaktpersonDTO } from '@dtos/kontaktpersonDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { BaseResponseWrapperListKontaktDTOWarningMessages } from '@dtos/baseResponseWrapperListKontaktDTOWarningMessages';

@Injectable()
export class KontaktpersonRestService {
    private static readonly BASE_URL = '/rest/common/kontaktperson';

    constructor(private http: HttpClient) {}

    searchKontaktpersonen(kontaktpersonSearchParam: KontaktpersonSearchParamDTO): Observable<BaseResponseWrapperListKontakteViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListKontakteViewDTOWarningMessages>(setBaseUrl(`${KontaktpersonRestService.BASE_URL}/search`), kontaktpersonSearchParam)
            .pipe(catchError(handleError));
    }

    getKontaktpersonenByUnternehmenId(unternehmenId: number): Observable<BaseResponseWrapperListKontakteViewDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListKontakteViewDTOWarningMessages>(setBaseUrl(`${KontaktpersonRestService.BASE_URL}/${unternehmenId}`))
            .pipe(catchError(handleError));
    }

    getKontakteByKontaktpersonId(kontaktpersonId: number): Observable<BaseResponseWrapperListKontaktDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListKontaktDTOWarningMessages>(setBaseUrl(`${KontaktpersonRestService.BASE_URL}/${kontaktpersonId}/contacts`))
            .pipe(catchError(handleError));
    }

    createKontaktperson(kontaktperson: KontaktpersonDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`${KontaktpersonRestService.BASE_URL}/create`), kontaktperson).pipe(catchError(handleError));
    }

    deleteKontaktpersonByKontaktId(kontaktId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.delete<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`${KontaktpersonRestService.BASE_URL}/${kontaktId}`));
    }
}
