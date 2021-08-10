import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';

@Injectable()
export class UrlRestService {
    constructor(private http: HttpClient) {}

    urlByParams(url: string, params: any): Observable<any> {
        return this.http.post<any>(setBaseUrl(url), params).pipe(catchError(handleError));
    }

    urlById(url: string, id: number | string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`${url}/${id}`)).pipe(catchError(handleError));
    }

    defaultUrl(url: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(url)).pipe(catchError(handleError));
    }
}

export enum DefaultUrl {
    HELP = '/rest/common/robo-help',
    DMS = '/rest/dms/dmsdossier/contextsensitiveurl'
}
