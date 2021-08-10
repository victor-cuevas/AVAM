import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { GeKoAufgabeSuchenDTO } from '@dtos/geKoAufgabeSuchenDTO';
import { BaseResponseWrapperListGeKoAufgabeDTOWarningMessages } from '@dtos/baseResponseWrapperListGeKoAufgabeDTOWarningMessages';
import { GeKoAufgabeDetailsDTO } from '@dtos/geKoAufgabeDetailsDTO';
import { BaseResponseWrapperGeKoAufgabeDetailsDTOWarningMessages } from '@dtos/baseResponseWrapperGeKoAufgabeDetailsDTOWarningMessages';
import { CodeDTO } from '@dtos/codeDTO';
import { BaseResponseWrapperStringWarningMessages } from '@dtos/baseResponseWrapperStringWarningMessages';
import { RestClient } from '@core/http/rest-client';
import { BaseResponseWrapperListGeKoAufgabeStesDTOWarningMessages } from '@dtos/baseResponseWrapperListGeKoAufgabeStesDTOWarningMessages';

@Injectable({
    providedIn: 'root'
})
export class GekoAufgabenRestService {
    private rest: RestClient;

    constructor(http: HttpClient) {
        this.rest = new RestClient(http, '/rest/geko');
    }

    loadGeschaeftsarten(geschaeftsBereich?: string): Observable<Array<CodeDTO>> {
        let url;
        if (geschaeftsBereich) {
            url = `/searchAufgaben/geschaeftsarten?geschaeftsBereich=${geschaeftsBereich}`;
        } else {
            url = '/searchAufgaben/geschaeftsarten';
        }
        return this.rest.get(url);
    }

    search(requestDTO: GeKoAufgabeSuchenDTO): Observable<BaseResponseWrapperListGeKoAufgabeDTOWarningMessages> {
        return this.rest.post(`/searchAufgaben`, requestDTO);
    }

    save(requestDTO: GeKoAufgabeDetailsDTO): Observable<BaseResponseWrapperGeKoAufgabeDetailsDTOWarningMessages> {
        return this.rest.post(`/saveAufgabe`, requestDTO);
    }

    delete(aufgageIds: number[]): Observable<BaseResponseWrapperStringWarningMessages> {
        return this.rest.post(`/markAufgabenAsDeleted`, aufgageIds);
    }

    searchBy(stesId: string): Observable<BaseResponseWrapperListGeKoAufgabeDTOWarningMessages> {
        return this.rest.get(`/getAufgaben/stes/${stesId}`);
    }

    getByAufgabeId(aufgageId: number, language: string): Observable<GeKoAufgabeDetailsDTO> {
        return this.rest.get(`/getAufgabeById/${aufgageId}/${language}`);
    }

    getArbeitgeberAufgaben(unternehmenId: number): Observable<BaseResponseWrapperListGeKoAufgabeStesDTOWarningMessages> {
        return this.rest.get(`/getAufgaben/arbeitgeber/${unternehmenId}`);
    }

    getAnbieterAufgaben(unternehmenId: number): Observable<BaseResponseWrapperListGeKoAufgabeStesDTOWarningMessages> {
        return this.rest.get(`/getAufgaben/anbieter/${unternehmenId}`);
    }

    getFachberatungAufgaben(unternehmenId: number): Observable<BaseResponseWrapperListGeKoAufgabeStesDTOWarningMessages> {
        return this.rest.get(`/getAufgaben/fachberatung/${unternehmenId}`);
    }
}
