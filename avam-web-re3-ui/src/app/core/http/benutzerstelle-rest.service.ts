import { Injectable } from '@angular/core';
import { RestClient } from '@core/http/rest-client';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BenutzerstelleObjectDTO } from '@dtos/benutzerstelleObjectDTO';
// prettier-ignore
import { BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages }
    from '@dtos/baseResponseWrapperBenutzerstelleObjectDTOWarningMessages';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';

@Injectable()
export class BenutzerstelleRestService {
    private readonly rest: RestClient;

    constructor(private http: HttpClient) {
        this.rest = new RestClient(http, '/rest/common/benutzerstelle');
    }

    get(id: number): Observable<BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages> {
        return this.rest.get(`/${id}`);
    }

    create(dto: BenutzerstelleObjectDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.rest.post('/create', dto);
    }

    validate(dto: BenutzerstelleObjectDTO): Observable<BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages> {
        return this.rest.post('/validate', dto);
    }

    update(dto: BenutzerstelleObjectDTO): Observable<BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages> {
        return this.rest.post('/update', dto);
    }
}
