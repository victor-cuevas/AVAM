import { Injectable } from '@angular/core';
import { RestClient } from '@core/http/rest-client';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BenutzerMeldungSuchenParamDTO } from '@dtos/benutzerMeldungSuchenParamDTO';
import { BaseResponseWrapperListBenutzerMeldungViewDTOWarningMessages } from '@dtos/baseResponseWrapperListBenutzerMeldungViewDTOWarningMessages';

@Injectable()
export class BenutzermeldungRestService {
    private readonly rest: RestClient;

    constructor(private http: HttpClient) {
        this.rest = new RestClient(http, '/rest/benutzerverwaltung/meldungen');
    }

    search(dto: BenutzerMeldungSuchenParamDTO): Observable<BaseResponseWrapperListBenutzerMeldungViewDTOWarningMessages> {
        return this.rest.post('/suchen', dto);
    }
}
