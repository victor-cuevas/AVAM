import { Injectable } from '@angular/core';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListBetriebsabteilungDTOWarningMessages } from '@dtos/baseResponseWrapperListBetriebsabteilungDTOWarningMessages';
import { BetriebsabteilungDTO } from '@dtos/betriebsabteilungDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';

@Injectable({
    providedIn: 'root'
})
export class BetriebsabteilungService {
    constructor(protected unternehmenRestService: UnternehmenRestService, public dataService: StesDataRestService) {}

    getBetriebsAbteilungen(unternehmenId: number): Observable<BaseResponseWrapperListBetriebsabteilungDTOWarningMessages> {
        return this.unternehmenRestService.getBetriebsabteilungen(unternehmenId);
    }

    saveBetriebsabteilungen(unternehmenId: number, betriebsabteilungen: BetriebsabteilungDTO[]): Observable<BaseResponseWrapperListBetriebsabteilungDTOWarningMessages> {
        return this.unternehmenRestService.saveBetriebsabteilungen(unternehmenId, betriebsabteilungen);
    }
}
