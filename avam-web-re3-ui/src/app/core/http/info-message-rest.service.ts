import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { InfoMessageDTO } from '@shared/models/dtos-generated/infoMessageDTO';
import { BenutzerInfoMessageDTO } from '@shared/models/dtos-generated/benutzerInfoMessageDTO';
import { InfoMessageSuchenParamDTO } from '@dtos/infoMessageSuchenParamDTO';
import { BaseResponseWrapperListInfoMessageDTOWarningMessages } from '@dtos/baseResponseWrapperListInfoMessageDTOWarningMessages';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { BaseResponseWrapperInfoMessageDTOWarningMessages } from '@dtos/baseResponseWrapperInfoMessageDTOWarningMessages';

@Injectable()
export class InfoMessageRestService {
    private static readonly BASE_URL = '/rest/common/infoMessage';

    constructor(private http: HttpClient) {}

    getInfoMessages(): Observable<InfoMessageDTO[]> {
        return this.http.get<any>(setBaseUrl(InfoMessageRestService.BASE_URL + '/getInfoMessages')).pipe(catchError(handleError));
    }

    markInfoMessageAsRead(infoMessageDTO: BenutzerInfoMessageDTO): Observable<void> {
        return this.http.put<any>(setBaseUrl(InfoMessageRestService.BASE_URL + '/markInfoMessageAsRead'), infoMessageDTO).pipe(catchError(handleError));
    }

    searchInformationsmeldungenaByParams(searchDTO: InfoMessageSuchenParamDTO): Observable<BaseResponseWrapperListInfoMessageDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListInfoMessageDTOWarningMessages>(setBaseUrl(`/rest/systemmeldung/suchen`), searchDTO).pipe(catchError(handleError));
    }

    createSystemmeldung(infoMessageDTO: InfoMessageDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/systemmeldung`), infoMessageDTO).pipe(catchError(handleError));
    }

    updateSystemmeldung(infoMessageDTO: InfoMessageDTO): Observable<BaseResponseWrapperInfoMessageDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperInfoMessageDTOWarningMessages>(setBaseUrl(`/rest/systemmeldung`), infoMessageDTO).pipe(catchError(handleError));
    }

    getById(infoMeldungId: string): Observable<BaseResponseWrapperInfoMessageDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperInfoMessageDTOWarningMessages>(setBaseUrl(`/rest/systemmeldung/${infoMeldungId}`)).pipe(catchError(handleError));
    }

    delete(infoMeldungId: string): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.delete<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/systemmeldung/${infoMeldungId}`)).pipe(catchError(handleError));
    }
}
