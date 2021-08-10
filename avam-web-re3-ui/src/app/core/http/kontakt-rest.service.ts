import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { HttpClient } from '@angular/common/http';
import { BaseResponseWrapperKontaktDTOWarningMessages } from '@dtos/baseResponseWrapperKontaktDTOWarningMessages';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { KontaktDTO } from '@dtos/kontaktDTO';

@Injectable()
export class KontaktRestService {
    private static readonly BASE_URL = '/rest/common/kontakt';

    constructor(private http: HttpClient) {}

    getByKontaktId(kontaktId: number): Observable<BaseResponseWrapperKontaktDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperKontaktDTOWarningMessages>(setBaseUrl(`${KontaktRestService.BASE_URL}/${kontaktId}`)).pipe(catchError(handleError));
    }

    updateKontaktperson(kontakt: KontaktDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`${KontaktRestService.BASE_URL}/update`), kontakt).pipe(catchError(handleError));
    }
}
