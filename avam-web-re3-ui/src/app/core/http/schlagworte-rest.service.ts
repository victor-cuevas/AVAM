import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { HttpClient } from '@angular/common/http';
import { SchlagwortDTO } from '@dtos/schlagwortDTO';

@Injectable()
export class SchlagworteRestService {
    private static readonly BASE_URL = '/rest/common/schlagworte';

    constructor(private http: HttpClient) {}

    getForUnternehmentermin(gueltigkeit: string): Observable<SchlagwortDTO[]> {
        return this.http.get<any>(setBaseUrl(`${SchlagworteRestService.BASE_URL}/unternehmentermin/${gueltigkeit}`)).pipe(catchError(handleError));
    }
}
