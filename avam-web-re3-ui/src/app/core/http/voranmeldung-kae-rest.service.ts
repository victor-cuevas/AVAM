import { Observable, of } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VoranmeldungKaeSuchenParamDTO } from '@dtos/voranmeldungKaeSuchenParamDTO';
import { BaseResponseWrapperListVoranmeldungKaeSuchenResponseDTOWarningMessages } from '@dtos/baseResponseWrapperListVoranmeldungKaeSuchenResponseDTOWarningMessages';
import { BaseResponseWrapperVoranmeldungKaeDTOWarningMessages } from '@dtos/baseResponseWrapperVoranmeldungKaeDTOWarningMessages';
import { BaseResponseWrapperListVoranmeldungKaeDTOWarningMessages } from '@dtos/baseResponseWrapperListVoranmeldungKaeDTOWarningMessages';
import { VoranmeldungKaeDTO } from '@dtos/voranmeldungKaeDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { VoranmeldungKaePropertyDTO } from '@dtos/voranmeldungKaePropertyDTO';

export enum VoranmeldungKaeAction {
    CREATE = 'create',
    ERSETZEN = 'ersetzen',
    FREIGEBEN = 'freigeben',
    UEBERARBEITEN = 'ueberarbeiten',
    UPDATE = 'update',
    ZURUECKNEHMEN = 'zuruecknehmen'
}

@Injectable()
export class VoranmeldungKaeRestService {
    private static readonly VORANMELDUNG_KAE_BASE_URL = '/rest/common/voranmeldung-kae';

    constructor(private http: HttpClient) {}

    search(searchDTO: VoranmeldungKaeSuchenParamDTO): Observable<BaseResponseWrapperListVoranmeldungKaeSuchenResponseDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListVoranmeldungKaeSuchenResponseDTOWarningMessages>(setBaseUrl(`/rest/common/voranmeldung-kae-suchen`), searchDTO)
            .pipe(catchError(handleError));
    }

    getVoranmeldungByVoranmeldungKaeId(voranmeldungKaeId: number): Observable<BaseResponseWrapperVoranmeldungKaeDTOWarningMessages> {
        return this.get(`/rest/common/voranmeldungen/voranmeldungKaeId/${voranmeldungKaeId}`);
    }

    searchByUnternehmenId(unternehmenId: number): Observable<BaseResponseWrapperListVoranmeldungKaeDTOWarningMessages> {
        return this.get(`/rest/common/voranmeldungen/${unternehmenId}`);
    }

    getProperty(): Observable<VoranmeldungKaePropertyDTO> {
        return this.http.get<VoranmeldungKaePropertyDTO>(setBaseUrl(`${VoranmeldungKaeRestService.VORANMELDUNG_KAE_BASE_URL}/property`)).pipe(catchError(handleError));
    }

    create(voranmeldung: VoranmeldungKaeDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http
            .post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`${VoranmeldungKaeRestService.VORANMELDUNG_KAE_BASE_URL}/create`), voranmeldung)
            .pipe(catchError(handleError));
    }

    delete(voranmeldungKaeId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http
            .delete<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`${VoranmeldungKaeRestService.VORANMELDUNG_KAE_BASE_URL}/${voranmeldungKaeId}`))
            .pipe(catchError(handleError));
    }

    call(voranmeldungKae: VoranmeldungKaeDTO, action: VoranmeldungKaeAction): Observable<BaseResponseWrapperVoranmeldungKaeDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperVoranmeldungKaeDTOWarningMessages>(setBaseUrl(`${VoranmeldungKaeRestService.VORANMELDUNG_KAE_BASE_URL}/${action}`), voranmeldungKae)
            .pipe(catchError(handleError));
    }

    getNextFreeEntscheidNr(): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http
            .get<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`${VoranmeldungKaeRestService.VORANMELDUNG_KAE_BASE_URL}/entscheidnr`))
            .pipe(catchError(handleError));
    }

    private get<T>(url: string): Observable<T> {
        return this.http.get<T>(setBaseUrl(url)).pipe(catchError(handleError));
    }
}
