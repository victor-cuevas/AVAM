import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { EnvironmentDTO } from '@shared/models/dtos-generated/environmentDTO';

@Injectable()
export class EnvironmentRestService {
    constructor(private http: HttpClient) {}

    getEnvironmentInfo(): Observable<EnvironmentDTO> {
        return this.http.get<EnvironmentDTO>(setBaseUrl(`/rest/common/env`)).pipe(catchError(handleError));
    }
}
