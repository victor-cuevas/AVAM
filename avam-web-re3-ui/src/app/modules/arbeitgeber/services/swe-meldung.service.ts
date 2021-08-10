import { Injectable } from '@angular/core';
import { SweMeldungRestService } from '@core/http/swe-meldung-rest.service';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListMeldungSweDTOWarningMessages } from '@dtos/baseResponseWrapperListMeldungSweDTOWarningMessages';
import { MeldungSweSuchenParamDTO } from '@dtos/meldungSweSuchenParamDTO';
import { BaseResponseWrapperListMeldungSweOverviewListDTOWarningMessages } from '@dtos/baseResponseWrapperListMeldungSweOverviewListDTOWarningMessages';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { KaeSweService } from '@modules/arbeitgeber/shared/services/kaeswe.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { RedirectService } from '@shared/services/redirect.service';
import { ActivatedRoute, Params } from '@angular/router';
import { FacadeService } from '@shared/services/facade.service';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { MeldungSweDTO } from '@dtos/meldungSweDTO';
import { BaseResponseWrapperMeldungSweDTOWarningMessages } from '@dtos/baseResponseWrapperMeldungSweDTOWarningMessages';
import { BaseResponseWrapperZahlstelleDTOWarningMessages } from '@dtos/baseResponseWrapperZahlstelleDTOWarningMessages';

@Injectable({
    providedIn: 'root'
})
export class SweMeldungService extends KaeSweService {
    constructor(
        private restService: SweMeldungRestService,
        protected stesRestService: StesDataRestService,
        protected unternehmenRestService: UnternehmenRestService,
        protected infopanelService: AmmInfopanelService,
        protected facadeService: FacadeService,
        private redirectService: RedirectService
    ) {
        super(stesRestService, unternehmenRestService, infopanelService, facadeService);
    }

    search(searchDTO: MeldungSweSuchenParamDTO): Observable<BaseResponseWrapperListMeldungSweOverviewListDTOWarningMessages> {
        return this.restService.search(searchDTO);
    }

    searchByUnternehmen(unternehmenId: number): Observable<BaseResponseWrapperListMeldungSweDTOWarningMessages> {
        return this.restService.searchByUnternehmen(unternehmenId);
    }

    redirectToSuchen(): void {
        this.redirect(`arbeitgeber/schlechtwetter/swe-meldung/suchen`);
    }

    redirectToSweMmeldungenFromSearch(unternehmenId: number, relativeTo: ActivatedRoute): void {
        this.redirect(`../../../details/${unternehmenId}/schlechtwetter/meldungen`, relativeTo);
    }

    getNextFreeEntscheidNr(): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.restService.getNextFreeEntscheidNr();
    }

    createMeldungSwe(dto: MeldungSweDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.restService.createMeldungSwe(dto);
    }

    updateMeldungSwe(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.restService.updateMeldungSwe(dto);
    }

    widerrufen(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.restService.widerrufen(dto);
    }

    zuruecknehmen(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.restService.zuruecknehmen(dto);
    }

    redirect(commands: any, relativeTo?: ActivatedRoute, id?: number): void {
        const navigationDto: NavigationDto = {
            commands: [commands],
            extras: {
                relativeTo,
                queryParams: { sweMeldungId: id ? String(id) : null } as Params
            }
        } as NavigationDto;
        this.redirectService.navigate(navigationDto);
    }

    getBySweMeldungId(sweMeldungId: number): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.restService.getBySweMeldungId(sweMeldungId);
    }

    getInitialZahlstelle(betriebsabteilungId: number, ausfallDatum: Date): Observable<BaseResponseWrapperZahlstelleDTOWarningMessages> {
        return this.restService.getInitialZahlstelle(betriebsabteilungId, ausfallDatum);
    }

    freigeben(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.restService.freigeben(dto);
    }

    deleteMeldung(meldungSweId: number): Observable<void> {
        return this.restService.deleteMeldung(meldungSweId);
    }

    redirectToSweMeldung(relativeTo: ActivatedRoute, meldungId: number): void {
        this.redirect(`./`, relativeTo, meldungId);
    }

    ersetzen(meldung: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.restService.ersetzen(meldung);
    }

    ueberarbeiten(dto: MeldungSweDTO): Observable<BaseResponseWrapperMeldungSweDTOWarningMessages> {
        return this.restService.ueberarbeiten(dto);
    }
}
