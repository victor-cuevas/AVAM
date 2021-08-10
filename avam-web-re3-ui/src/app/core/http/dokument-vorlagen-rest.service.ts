import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListDokumentVorlagenDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListDokumentVorlagenDTOWarningMessages';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { DokumentVorlagenRequestDTO } from '@shared/models/dtos-generated/dokumentVorlagenRequestDTO';
import { DokumentVorlageActionDTO } from '@shared/models/dtos-generated/dokumentVorlageActionDTO';
import { BaseResponseWrapperStringWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperStringWarningMessages';

@Injectable()
export class DokumentVorlagenRestService {
    constructor(private http: HttpClient) {}

    getDokumentVorlagen(request: DokumentVorlagenRequestDTO): Observable<BaseResponseWrapperListDokumentVorlagenDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListDokumentVorlagenDTOWarningMessages>(setBaseUrl('/rest/common/dokument-vorlagen/'), request).pipe(catchError(handleError));
    }

    openDocument(request: DokumentVorlageActionDTO): Observable<HttpResponse<Blob>> {
        return this.http
            .post<Blob>(setBaseUrl(`/rest/common/dokument-vorlagen/open`), request, {
                observe: 'response',
                responseType: 'blob' as 'json'
            })
            .pipe(catchError(handleError));
    }

    saveDocument(request: DokumentVorlageActionDTO): Observable<BaseResponseWrapperStringWarningMessages> {
        return this.http.post<BaseResponseWrapperStringWarningMessages>(setBaseUrl(`/rest/common/dokument-vorlagen/save`), request).pipe(catchError(handleError));
    }
}
