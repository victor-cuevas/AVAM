import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { Observable } from 'rxjs';
import { ZahlungenSuchenParameterDTO } from '@app/shared/models/dtos-generated/zahlungenSuchenParameterDTO';
import { BaseResponseWrapperListTeilzahlungsListeViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListTeilzahlungsListeViewDTOWarningMessages';
import { handleError } from '@app/shared/services/handle-error.function';

@Injectable()
export class TeilzahlungenRestService {
    constructor(private http: HttpClient) {}

    searchTeilzahlungen(zahlungenSuchenParameterDTO: ZahlungenSuchenParameterDTO): Observable<BaseResponseWrapperListTeilzahlungsListeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListTeilzahlungsListeViewDTOWarningMessages>(setBaseUrl(`/rest/amm/teilzahlungen/suchen`), zahlungenSuchenParameterDTO)
            .pipe(catchError(handleError));
    }
}
