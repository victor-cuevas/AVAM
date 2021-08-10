import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { GeschaeftsMeldungenRequestDTO } from '@shared/models/dtos-generated/geschaeftsMeldungenRequestDTO';
import { BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListGeschaeftMeldungDTOWarningMessages';
import { CodeDTO } from '@dtos/codeDTO';
import { BaseResponseWrapperStringWarningMessages } from '@dtos/baseResponseWrapperStringWarningMessages';

@Injectable()
export class GekoMeldungRestService {
    constructor(private http: HttpClient) {}

    searchMeldungen(paramsToSearch: GeschaeftsMeldungenRequestDTO): Observable<BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages>(setBaseUrl(`/rest/geko/searchGeschaeftMeldungen`), paramsToSearch)
            .pipe(catchError(handleError));
    }

    getStesMeldungen(stesId: number): Observable<BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages>(setBaseUrl(`/rest/geko/getStesMeldungen/${stesId}`)).pipe(catchError(handleError));
    }

    getUnternehmenMeldungen(unternehmenId: number, geschaeftsbereichCode: string): Observable<BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages>(setBaseUrl(`/rest/geko/getUnternehmenMeldungen/${unternehmenId}/${geschaeftsbereichCode}`))
            .pipe(catchError(handleError));
    }

    loadGeschaeftsarte(): Observable<CodeDTO[]> {
        return this.http.get<CodeDTO[]>(setBaseUrl(`/rest/geko/searchGeschaeftMeldungen/geschaeftsarten`)).pipe(catchError(handleError));
    }

    markMeldungenRead(ids: number[]) {
        return this.http.post<BaseResponseWrapperStringWarningMessages>(setBaseUrl(`/rest/geko/markMeldungenRead`), ids).pipe(catchError(handleError));
    }

    markMeldungenNotRead(ids: number[]) {
        return this.http.post<BaseResponseWrapperStringWarningMessages>(setBaseUrl(`/rest/geko/markMeldungenNotRead`), ids).pipe(catchError(handleError));
    }

    markMeldungenDeleted(ids: number[]) {
        return this.http.post<BaseResponseWrapperStringWarningMessages>(setBaseUrl(`/rest/geko/markMeldungenDeleted`), ids).pipe(catchError(handleError));
    }
}
