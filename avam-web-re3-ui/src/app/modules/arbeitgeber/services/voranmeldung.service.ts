import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { VoranmeldungKaeAction, VoranmeldungKaeRestService } from '@core/http/voranmeldung-kae-rest.service';
import { VoranmeldungKaeSuchenParamDTO } from '@dtos/voranmeldungKaeSuchenParamDTO';
import { BaseResponseWrapperListVoranmeldungKaeSuchenResponseDTOWarningMessages } from '@dtos/baseResponseWrapperListVoranmeldungKaeSuchenResponseDTOWarningMessages';
import { ActivatedRoute, Params } from '@angular/router';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { RedirectService } from '@shared/services/redirect.service';
import { VoranmeldungKaeDTO } from '@dtos/voranmeldungKaeDTO';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { BaseResponseWrapperListVoranmeldungKaeDTOWarningMessages } from '@dtos/baseResponseWrapperListVoranmeldungKaeDTOWarningMessages';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { BaseResponseWrapperVoranmeldungKaeDTOWarningMessages } from '@dtos/baseResponseWrapperVoranmeldungKaeDTOWarningMessages';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { VoranmeldungKaePropertyDTO } from '@dtos/voranmeldungKaePropertyDTO';
import { KaeSweService } from '@modules/arbeitgeber/shared/services/kaeswe.service';
import { FacadeService } from '@shared/services/facade.service';

@Injectable({
    providedIn: 'root'
})
export class VoranmeldungService extends KaeSweService {
    constructor(
        private kaeRestService: VoranmeldungKaeRestService,
        private redirectService: RedirectService,
        protected stesRestService: StesDataRestService,
        protected unternehmenRestService: UnternehmenRestService,
        protected infopanelService: AmmInfopanelService,
        protected facadeService: FacadeService
    ) {
        super(stesRestService, unternehmenRestService, infopanelService, facadeService);
    }

    getNextFreeEntscheidNr(): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.kaeRestService.getNextFreeEntscheidNr();
    }

    createVoranmeldung(voranmeldung: VoranmeldungKaeDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.kaeRestService.create(voranmeldung);
    }

    search(searchDTO: VoranmeldungKaeSuchenParamDTO): Observable<BaseResponseWrapperListVoranmeldungKaeSuchenResponseDTOWarningMessages> {
        return this.kaeRestService.search(searchDTO);
    }

    getVoranmeldungById(voranmeldungKaeId: number): Observable<BaseResponseWrapperVoranmeldungKaeDTOWarningMessages> {
        return this.kaeRestService.getVoranmeldungByVoranmeldungKaeId(voranmeldungKaeId);
    }

    searchByUnternehmenId(unternehmenId: number): Observable<BaseResponseWrapperListVoranmeldungKaeDTOWarningMessages> {
        return this.kaeRestService.searchByUnternehmenId(unternehmenId);
    }

    delete(voranmeldungKaeId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.kaeRestService.delete(voranmeldungKaeId);
    }

    call(voranmeldungKae: VoranmeldungKaeDTO, action: VoranmeldungKaeAction): Observable<BaseResponseWrapperVoranmeldungKaeDTOWarningMessages> {
        return this.kaeRestService.call(voranmeldungKae, action);
    }

    redirectToSuchen(): void {
        this.redirect(`arbeitgeber/kurzarbeit/voranmeldung/suchen`);
    }

    redirectToVoranmeldungenFromSearch(unternehmenId: number, relativeTo: ActivatedRoute): void {
        this.redirect(`../../../details/${unternehmenId}/kurzarbeit/voranmeldungen`, relativeTo);
    }

    getProperty(): Observable<VoranmeldungKaePropertyDTO> {
        return this.kaeRestService.getProperty();
    }

    redirect(commands: any, relativeTo?: ActivatedRoute, id?: number): void {
        const navigationDto: NavigationDto = {
            commands: [commands],
            extras: {
                relativeTo,
                queryParams: { voranmeldungKaeId: id ? String(id) : null } as Params
            }
        } as NavigationDto;
        this.redirectService.navigate(navigationDto);
    }
}
