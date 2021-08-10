import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';

export class RestClient {
    constructor(private readonly http: HttpClient, private readonly baseUrl: string) {}

    post<T>(url: string, dto: any): Observable<T> {
        return this.http.post<T>(setBaseUrl(this.baseUrl + url), dto).pipe(catchError(handleError));
    }

    put<T>(url: string, dto: any): Observable<T> {
        return this.http.put<T>(setBaseUrl(this.baseUrl + url), dto).pipe(catchError(handleError));
    }

    get<T>(url: string): Observable<T> {
        return this.http.get<T>(setBaseUrl(this.baseUrl + url)).pipe(catchError(handleError));
    }

    delete<T>(url: string): Observable<T> {
        return this.http.delete<T>(setBaseUrl(this.baseUrl + url)).pipe(catchError(handleError));
    }
}
