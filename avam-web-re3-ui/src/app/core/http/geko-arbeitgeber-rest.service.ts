import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeKoGeschaeftSuchenInitDTO } from '@dtos/geKoGeschaeftSuchenInitDTO';
import { RestClient } from '@core/http/rest-client';
import { CodeDTO } from '@dtos/codeDTO';
import { GeKoGeschaeftSuchenDTO } from '@dtos/geKoGeschaeftSuchenDTO';
import { BaseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages';
import { BaseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages';

@Injectable()
export class GekoArbeitgeberRestService {
    private readonly rest: RestClient;

    constructor(private http: HttpClient) {
        this.rest = new RestClient(http, '/rest/geko');
    }

    initRequest(): Observable<GeKoGeschaeftSuchenInitDTO> {
        return this.rest.get('/searchGeschaeftArbeitgeber/init-request');
    }

    loadSachstaende(geschaeftsartId: number): Observable<CodeDTO[]> {
        return this.rest.get(`/searchGeschaeftArbeitgeber/geschaeftsart/${geschaeftsartId}/sachstaende`);
    }

    search(geKoGeschaeftSuchenDTO: GeKoGeschaeftSuchenDTO): Observable<BaseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages> {
        return this.rest.post('/searchGeschaeftArbeitgeber', geKoGeschaeftSuchenDTO);
    }

    searchGeschaeftArbeitgeber(unternehmenId: string): Observable<BaseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages> {
        return this.rest.get(`/searchGeschaeftArbeitgeber/${unternehmenId}`);
    }

    initAnbieterRequest(): Observable<GeKoGeschaeftSuchenInitDTO> {
        return this.rest.get('/searchGeschaeftAnbieter/init-request');
    }

    searchForAnbieter(geKoGeschaeftSuchenDTO: GeKoGeschaeftSuchenDTO): Observable<BaseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages> {
        return this.rest.post('/searchGeschaeftAnbieter', geKoGeschaeftSuchenDTO);
    }

    searchGeschaeftAnbieter(unternehmenId: string): Observable<BaseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages> {
        return this.rest.get(`/searchGeschaeftAnbieter/${unternehmenId}`);
    }
}
