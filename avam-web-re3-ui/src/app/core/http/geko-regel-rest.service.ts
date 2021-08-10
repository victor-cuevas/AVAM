import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestClient } from '@core/http/rest-client';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListRegelGeKoDTOWarningMessages } from '@dtos/baseResponseWrapperListRegelGeKoDTOWarningMessages';
import { CodeDTO } from '@dtos/codeDTO';
import { RegelGeKoDTO } from '@dtos/regelGeKoDTO';
import { BaseResponseWrapperRegelGeKoDTOWarningMessages } from '@dtos/baseResponseWrapperRegelGeKoDTOWarningMessages';
import { BaseResponseWrapperBooleanWarningMessages } from '@dtos/baseResponseWrapperBooleanWarningMessages';

@Injectable()
export class GekoRegelRestService {
    private readonly rest: RestClient;

    constructor(private http: HttpClient) {
        this.rest = new RestClient(http, '/rest/geko');
    }

    search(): Observable<BaseResponseWrapperListRegelGeKoDTOWarningMessages> {
        return this.rest.get('/searchGeschaeftsRegel');
    }

    loadGeschaeftartenForBereich(geschaeftBereich: string): Observable<CodeDTO[]> {
        return this.rest.get('/geschaeftbereich/' + geschaeftBereich);
    }

    create(dto: RegelGeKoDTO): Observable<BaseResponseWrapperRegelGeKoDTOWarningMessages> {
        return this.rest.post('/createGeschaeftsRegel', dto);
    }

    loadGeschaeft(regelId: number): Observable<BaseResponseWrapperRegelGeKoDTOWarningMessages> {
        return this.rest.get(`/geschaeftsregel/${regelId}`);
    }

    update(regelGeKoDTO: RegelGeKoDTO): Observable<BaseResponseWrapperRegelGeKoDTOWarningMessages> {
        return this.rest.put(`/geschaeftsregel/${regelGeKoDTO.regelId}`, regelGeKoDTO);
    }

    delete(regelId: number): Observable<BaseResponseWrapperBooleanWarningMessages> {
        return this.rest.delete(`/geschaeftsregel/${regelId}`);
    }
}
