import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { ZahlstelleDTO } from '@dtos/zahlstelleDTO';
import { Observable } from 'rxjs';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { BaseResponseWrapperZahlstelleDTOWarningMessages } from '@dtos/baseResponseWrapperZahlstelleDTOWarningMessages';
import { ZahlstelleSuchenParamDTO } from '@dtos/zahlstelleSuchenParamDTO';
import { BaseResponseWrapperListZahlstelleDTOWarningMessages } from '@dtos/baseResponseWrapperListZahlstelleDTOWarningMessages';

@Injectable({
    providedIn: 'root'
})
export class ZahlstelleRestService {
    constructor(private http: HttpClient) {}

    createZahlstelle(zahlstelleDto: ZahlstelleDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/zahlstelle`), zahlstelleDto).pipe(catchError(handleError));
    }

    getZahlstelleById(id: any): Observable<BaseResponseWrapperZahlstelleDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperZahlstelleDTOWarningMessages>(setBaseUrl(`/rest/zahlstelle/${id}`)).pipe(catchError(handleError));
    }

    updateZahlstelle(zahlstelleDto: ZahlstelleDTO): Observable<BaseResponseWrapperZahlstelleDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperZahlstelleDTOWarningMessages>(setBaseUrl(`/rest/zahlstelle`), zahlstelleDto).pipe(catchError(handleError));
    }

    searchZahlstelleByParams(searchDTO: ZahlstelleSuchenParamDTO): Observable<BaseResponseWrapperListZahlstelleDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListZahlstelleDTOWarningMessages>(setBaseUrl(`/rest/zahlstelle/alk-suchen`), searchDTO).pipe(catchError(handleError));
    }
}
