import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { HttpClient } from '@angular/common/http';
import { BaseResponseWrapperKundenberaterDTOWarningMessages } from '@dtos/baseResponseWrapperKundenberaterDTOWarningMessages';
import { KundenberaterDTO } from '@dtos/kundenberaterDTO';

@Injectable()
export class KundenberaterRestService {
    private static readonly BASE_URL = '/rest/common/kundenberater';

    constructor(private http: HttpClient) {}

    load(unternehmenId: number): Observable<BaseResponseWrapperKundenberaterDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperKundenberaterDTOWarningMessages>(setBaseUrl(`${KundenberaterRestService.BASE_URL}/${unternehmenId}`)).pipe(catchError(handleError));
    }

    save(kundenberaterDTO: KundenberaterDTO): Observable<BaseResponseWrapperKundenberaterDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperKundenberaterDTOWarningMessages>(setBaseUrl(`${KundenberaterRestService.BASE_URL}/save`), kundenberaterDTO)
            .pipe(catchError(handleError));
    }
}
