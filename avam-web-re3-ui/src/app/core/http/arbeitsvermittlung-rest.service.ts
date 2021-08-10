import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { BaseResponseWrapperListArbeitsvermittlungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListArbeitsvermittlungDTOWarningMessages';
import { ArbeitsvermittlungDataDTO } from '@app/shared/models/dtos-generated/arbeitsvermittlungDataDTO';
import { BaseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages';

@Injectable()
export class ArbeitsvermittlungRestService {
    constructor(private http: HttpClient) {}

    searchByStes(stesId: string): Observable<BaseResponseWrapperListArbeitsvermittlungDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListArbeitsvermittlungDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/arbeitsvermittlungen`)).pipe(catchError(handleError));
    }

    getArbeitsvermittlungenView(stesId: string, locale: string): Observable<BaseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/arbeitsvermittlungen/${locale}`))
            .pipe(catchError(handleError));
    }

    getData(id: number, schnell: boolean): Observable<ArbeitsvermittlungDataDTO> {
        return this.http.get<any>(setBaseUrl(`/rest/arbeitsvermittlungen/${id}/${schnell}`)).pipe(catchError(handleError));
    }
}
