import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListRahmenfristKaeSweDTOWarningMessages } from '@dtos/baseResponseWrapperListRahmenfristKaeSweDTOWarningMessages';
import { RahmenfristKaeSweRestService } from '@core/http/rahmenfrist-kae-swe-rest.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { RahmenfristKaeSweDTO } from '@dtos/rahmenfristKaeSweDTO';
import { ActivatedRoute } from '@angular/router';
import { RedirectService } from '@shared/services/redirect.service';
import { RahmenfristProUnternehmenDTO } from '@dtos/rahmenfristProUnternehmenDTO';
import { ZahlungProRahmenfristDTO } from '@dtos/zahlungProRahmenfristDTO';
import { BaseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages } from '@dtos/baseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { F1000OutputDTO } from '@dtos/f1000OutputDTO';

@Injectable({
    providedIn: 'root'
})
export class RahmenfristKaeSweService {
    constructor(private restService: RahmenfristKaeSweRestService, private redirectService: RedirectService, public infopanelService: AmmInfopanelService) {}

    searchByUnternehmenId(unternehmenId: number): Observable<BaseResponseWrapperListRahmenfristKaeSweDTOWarningMessages> {
        return this.restService.searchByUnternehmenId(unternehmenId);
    }

    open(relativeTo: ActivatedRoute, row: RahmenfristKaeSweDTO): void {
        this.redirectService.navigateRelativeTo('anzeigen', relativeTo, 'rahmenfristId', row.rahmenfristId);
    }

    getRahmenfristen(unternehmenId: number): Observable<RahmenfristProUnternehmenDTO[]> {
        return this.restService.getRahmenfristen(unternehmenId);
    }

    getZahlungen(rahmenfristId: number): Observable<ZahlungProRahmenfristDTO[]> {
        return this.restService.getZahlungen(rahmenfristId);
    }

    getRahmenfrist(rahmenfristId: number): Observable<BaseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages> {
        return this.restService.getRahmenfrist(rahmenfristId);
    }

    getASALZahlungen(rahmenfristId: number): Observable<F1000OutputDTO[]> {
        return this.restService.getASALZahlungen(rahmenfristId);
    }

    redirectToParent(relativeTo: ActivatedRoute): void {
        this.redirectService.navigate({
            commands: [`../`],
            extras: { relativeTo }
        } as NavigationDto);
    }

    redirectToSibling(relativeTo: ActivatedRoute, commands: string, rahmenfristId: number): void {
        this.redirectService.navigate({
            commands: [`${commands}`],
            extras: { relativeTo, queryParams: { rahmenfristId } }
        } as NavigationDto);
    }
}
