import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListRahmenfristKaeSweDTOWarningMessages } from '@dtos/baseResponseWrapperListRahmenfristKaeSweDTOWarningMessages';
import { HttpClient } from '@angular/common/http';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { RahmenfristProUnternehmenDTO } from '@dtos/rahmenfristProUnternehmenDTO';
import { ZahlungProRahmenfristDTO } from '@dtos/zahlungProRahmenfristDTO';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { BaseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages } from '@dtos/baseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages';
import { RestClient } from '@core/http/rest-client';
import { F1000OutputDTO } from '@dtos/f1000OutputDTO';

@Injectable()
export class RahmenfristKaeSweRestService {
    private static readonly BASE_URL = '/rest/common/kae-swe-rahmenfrist';

    private restClient: RestClient;

    constructor(private httpClient: HttpClient) {
        this.restClient = new RestClient(httpClient, RahmenfristKaeSweRestService.BASE_URL);
    }

    searchByUnternehmenId(unternehmenId: number): Observable<BaseResponseWrapperListRahmenfristKaeSweDTOWarningMessages> {
        return this.httpClient.get(setBaseUrl(`${RahmenfristKaeSweRestService.BASE_URL}/unternehmen/${unternehmenId}`)).pipe(catchError(handleError));
    }

    getRahmenfristen(unternehmenId: number): Observable<RahmenfristProUnternehmenDTO[]> {
        return this.httpClient
            .get<RahmenfristProUnternehmenDTO[]>(setBaseUrl(`${RahmenfristKaeSweRestService.BASE_URL}/unternehmen/${unternehmenId}/rahmenfristen`))
            .pipe(catchError(handleError));
    }

    getZahlungen(rahmenfristId: number): Observable<ZahlungProRahmenfristDTO[]> {
        return this.httpClient.get<ZahlungProRahmenfristDTO[]>(setBaseUrl(`${RahmenfristKaeSweRestService.BASE_URL}/${rahmenfristId}/zahlungen`)).pipe(catchError(handleError));
    }

    getRahmenfrist(rahmenfristId: number): Observable<BaseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages> {
        return this.httpClient
            .get<BaseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages>(setBaseUrl(`${RahmenfristKaeSweRestService.BASE_URL}/${rahmenfristId}`))
            .pipe(catchError(handleError));
    }

    getASALZahlungen(rahmenfristId: number): Observable<F1000OutputDTO[]> {
        return this.restClient.get(`/${rahmenfristId}/asal-zahlungen`);
    }
}
