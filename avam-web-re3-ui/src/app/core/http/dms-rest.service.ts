import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { handleError } from '@shared/services/handle-error.function';
import { DmsContextSensitiveDossierDTO } from '@shared/models/dtos-generated/dmsContextSensitiveDossierDTO';

@Injectable()
export class DmsRestService {
    constructor(private http: HttpClient) {}

    getDmsURL(request: DmsContextSensitiveDossierDTO): Observable<any> {
        return this.http.post<any>(setBaseUrl('/rest/dms/dmsdossier/contextsensitiveurl'), request).pipe(catchError(handleError));
    }
}
