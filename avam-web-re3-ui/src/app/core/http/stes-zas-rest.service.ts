import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { StesZasDTO } from '@shared/models/dtos-generated/stesZasDTO';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';

@Injectable()
export class StesZasRestService {
    constructor(private http: HttpClient) {}

    createZasAbgleich(stesZasDTO: StesZasDTO): Observable<BaseResponseWrapperListStesZasDTOWarningMessages> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/zas`), stesZasDTO).pipe(catchError(handleError));
    }
}
