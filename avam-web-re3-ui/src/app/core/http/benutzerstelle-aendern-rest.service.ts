import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { BaseResponseWrapperJwtDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperJwtDTOWarningMessages';

@Injectable()
export class BenutzerstelleAendernRestService {
    constructor(private http: HttpClient) {}

    changeBenutzerstelle(benutzerDetailId: string, language: string): Observable<BaseResponseWrapperJwtDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperJwtDTOWarningMessages>(setBaseUrl(`/rest/myavam/benutzerstelleaendern/${benutzerDetailId}/${language}`))
            .pipe(catchError(handleError));
    }
}
