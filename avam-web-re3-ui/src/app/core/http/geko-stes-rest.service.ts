import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { CodeDTO } from '@dtos/codeDTO';
import { GeKoGeschaeftSuchenInitDTO } from '@dtos/geKoGeschaeftSuchenInitDTO';
import { GeKoGeschaeftSuchenDTO } from '@dtos/geKoGeschaeftSuchenDTO';
import { BaseResponseWrapperListVerlaufGeKoStesDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoStesDTOWarningMessages';
import { BaseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages';

@Injectable()
export class GekoStesRestService {
    private static readonly BASE_URL = '/rest/geko';

    constructor(private http: HttpClient) {}

    initRequest(): Observable<GeKoGeschaeftSuchenInitDTO> {
        return this.http.get<GeKoGeschaeftSuchenInitDTO>(setBaseUrl(`${GekoStesRestService.BASE_URL}/searchGeschaeftStes/init-request`)).pipe(catchError(handleError));
    }

    searchSachstaende(geschaeftsartId: string): Observable<CodeDTO[]> {
        return this.http
            .get<CodeDTO[]>(setBaseUrl(`${GekoStesRestService.BASE_URL}/searchGeschaeftStes/geschaeftsart/${geschaeftsartId}/sachstaende`))
            .pipe(catchError(handleError));
    }

    searchGeschaeftStes(requestDTO: GeKoGeschaeftSuchenDTO): Observable<BaseResponseWrapperListVerlaufGeKoStesDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListVerlaufGeKoStesDTOWarningMessages>(setBaseUrl(`${GekoStesRestService.BASE_URL}/searchGeschaeftStes`), requestDTO)
            .pipe(catchError(handleError));
    }

    searchGeschaeftStesByStesId(stesId: string): Observable<BaseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages>(setBaseUrl(`${GekoStesRestService.BASE_URL}/searchGeschaeftStes/${stesId}/geschaefte`))
            .pipe(catchError(handleError));
    }
}
