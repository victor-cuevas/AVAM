import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { handleError } from '@shared/services/handle-error.function';
import { BasicUrlDTO } from '@shared/models/dtos-generated/basicUrlDTO';

@Injectable()
export class GuidedTourConfigRestService {
    constructor(private http: HttpClient) {}

    getUrls(): Observable<BasicUrlDTO> {
        return this.http.get<BasicUrlDTO>(setBaseUrl(`/rest/common/guidedtour/`)).pipe(catchError(handleError));
    }
}
