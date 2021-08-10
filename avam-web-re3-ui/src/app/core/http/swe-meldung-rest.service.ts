import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListMeldungSweDTOWarningMessages } from '@dtos/baseResponseWrapperListMeldungSweDTOWarningMessages';
import { BaseResponseWrapperListMeldungSweOverviewListDTOWarningMessages } from '@dtos/baseResponseWrapperListMeldungSweOverviewListDTOWarningMessages';
import { MeldungSweSuchenParamDTO } from '@dtos/meldungSweSuchenParamDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { MeldungSweDTO } from '@dtos/meldungSweDTO';
import { BaseResponseWrapperMeldungSweDTOWarningMessages } from '@dtos/baseResponseWrapperMeldungSweDTOWarningMessages';
import { RestClient } from '@core/http/rest-client';
import { BaseResponseWrapperZahlstelleDTOWarningMessages } from '@dtos/baseResponseWrapperZahlstelleDTOWarningMessages';

@Injectable()
export class SweMeldungRestService {
    private readonly rest: RestClient;

    constructor(private http: HttpClient) {
        this.rest = new RestClient(http, '/rest/common/swe-meldung');
    }

    search(searchDTO: MeldungSweSuchenParamDTO): Observable<BaseResponseWrapperListMeldungSweOverviewListDTOWarningMessages> {
        return this.rest.post('/suchen', searchDTO);
    }

    searchByUnternehmen(unternehmenId: number): Observable<BaseResponseWrapperListMeldungSweDTOWarningMessages> {
        return this.rest.get(`/${unternehmenId}`);
    }

    createMeldungSwe(dto: MeldungSweDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.rest.post('/create', dto);
    }

    getNextFreeEntscheidNr(): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.rest.get('/entscheidnr');
    }

    getBySweMeldungId(sweMeldungId: number): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.rest.get(`/sweMeldungId/${sweMeldungId}`);
    }

    updateMeldungSwe(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.rest.post('/update', dto);
    }

    getInitialZahlstelle(betriebsabteilungId: number, ausfallDatum: Date): Observable<BaseResponseWrapperZahlstelleDTOWarningMessages> {
        return this.rest.get(`/zahlstelle?betriebsabteilungId=${betriebsabteilungId}&year=${ausfallDatum.getFullYear()}&month=${ausfallDatum.getMonth() + 1}`);
    }

    widerrufen(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.rest.post('/widerrufen', dto);
    }

    freigeben(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.rest.post('/freigeben', dto);
    }

    deleteMeldung(meldungSweId: number): Observable<void> {
        return this.rest.delete<void>(`/${meldungSweId}`);
    }

    ueberarbeiten(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.rest.post('/ueberarbeiten', dto);
    }

    zuruecknehmen(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.rest.post('/zuruecknehmen', dto);
    }

    ersetzen(meldung: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.rest.post('/ersetzen', meldung);
    }
}
