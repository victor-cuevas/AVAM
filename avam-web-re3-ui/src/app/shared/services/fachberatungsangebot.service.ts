import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { RedirectService } from '@shared/services/redirect.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { FachberatungsangeboteRestService } from '@core/http/fachberatungsangebot-rest.service';
import { BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages } from '@dtos/baseResponseWrapperListFachberatungsangebotViewDTOWarningMessages';
import { FachberatungsangebotViewDTO } from '@dtos/fachberatungsangebotViewDTO';
import { AmmInfopanelService, InfobarData } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FachberatungParamDTO } from '@dtos/fachberatungParamDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { FachberatungSuchenParamDTO } from '@dtos/fachberatungSuchenParamDTO';
import { BaseResponseWrapperFachberatungParamDTOWarningMessages } from '@dtos/baseResponseWrapperFachberatungParamDTOWarningMessages';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { FbStatusCodeEnum } from '@shared/enums/domain-code/fb-status-code.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { FacadeService } from '@shared/services/facade.service';
import { finalize } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FachberatungsangebotService {
    closeBearbeitenNavItemSubscription: Subscription;
    closeErfassenNavItemSubscription: Subscription;
    readonly fachberatungsangeboteResultChannel = 'fachberatungsangebote-result-channel';
    public fachberatungsangeboteSubject: Subject<Array<FachberatungsangebotViewDTO>> = new Subject<Array<FachberatungsangebotViewDTO>>();

    constructor(
        private redirectService: RedirectService,
        private unternehmenRestService: UnternehmenRestService,
        private fachberatungsangeboteRestService: FachberatungsangeboteRestService,
        private infopanelService: AmmInfopanelService,
        private dataService: StesDataRestService,
        private facadeService: FacadeService
    ) {}

    isStatusInaktiv(statusOptions: any[], status: number): boolean {
        return this.facadeService.formUtilsService.getCodeIdByCode(statusOptions, FbStatusCodeEnum.FB_STATUS_INAKTIV) === `${status}`;
    }

    navigateToFachberatungsangebote(route: ActivatedRoute): void {
        const navigationDto = FachberatungsangebotService.createNavigationDto(`../`, route);
        this.redirectService.navigate(navigationDto);
    }

    getUnternehmen(id: string): Observable<UnternehmenDTO> {
        return this.unternehmenRestService.getUnternehmenById(id);
    }

    searchBy(unternehmenId: string, spinnerChannel: string): void {
        this.facadeService.spinnerService.activate(spinnerChannel);
        this.fachberatungsangeboteRestService.searchBy(unternehmenId).subscribe(
            (response: BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages) => {
                this.fachberatungsangeboteSubject.next(response.data);
                this.facadeService.spinnerService.deactivate(spinnerChannel);
            },
            () => this.facadeService.spinnerService.deactivate(spinnerChannel)
        );
    }

    resetInfopanel(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
    }

    updateInfoPanel(data: InfobarData): void {
        this.infopanelService.updateInformation(data);
    }

    createAngebot(fachbertaungsagebot: FachberatungParamDTO, language: string): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.fachberatungsangeboteRestService.create(fachbertaungsagebot, language);
    }

    getAngebot(unternehmenId: string, fachberatungsangebotId: number, language: string): Observable<BaseResponseWrapperFachberatungParamDTOWarningMessages> {
        return this.fachberatungsangeboteRestService.getByFachberatungsangebotId(unternehmenId, fachberatungsangebotId, language);
    }

    deleteAngebot(fachberatungsangebotId: number): Observable<any> {
        return this.fachberatungsangeboteRestService.deleteFachberatungsangebotById(fachberatungsangebotId);
    }

    navigateToFachberatungsangebotErfassen(activatedRoute: ActivatedRoute): void {
        this.navigateRelativeToActivatedRoute(`./erfassen`, activatedRoute);
    }

    navigateToFachberatungsangebotBearbeitenFromSuchen(fachberatungsangebotId: number, unternehmenId: number): void {
        this.navigate(`stes/fachberatung/${unternehmenId}/fachberatungsangebote/bearbeiten`, fachberatungsangebotId, this.fachberatungsangeboteResultChannel);
    }

    navigateToFachberatungsangebotBearbeiten(activatedRoute: ActivatedRoute, fachberatungsangebotId: number): void {
        this.navigateRelativeToActivatedRoute(`./bearbeiten`, activatedRoute, fachberatungsangebotId);
    }

    navigateToFachberatungsangebotBearbeitenAfterCreate(activatedRoute: ActivatedRoute, fachberatungsangebotId: number): void {
        this.navigateRelativeToActivatedRoute(`../bearbeiten`, activatedRoute, fachberatungsangebotId);
    }

    updateTitle(data: InfobarData): void {
        this.infopanelService.updateInformation(data);
    }

    updateAngebot(fachberatungParamDTO: FachberatungParamDTO, currentLang: string): Observable<BaseResponseWrapperFachberatungParamDTOWarningMessages> {
        return this.fachberatungsangeboteRestService.update(fachberatungParamDTO, currentLang);
    }

    search(searchParam: FachberatungSuchenParamDTO): void {
        this.facadeService.spinnerService.activate(this.fachberatungsangeboteResultChannel);
        this.fachberatungsangeboteRestService
            .search(searchParam)
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.fachberatungsangeboteResultChannel)))
            .subscribe((response: BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages) => {
                if (response.data && response.data.length) {
                    this.fachberatungsangeboteSubject.next(response.data);
                } else {
                    this.fachberatungsangeboteSubject.next([]);
                }
            });
    }

    resetCloseBearbeitenSubscription() {
        if (this.closeBearbeitenNavItemSubscription) {
            this.closeBearbeitenNavItemSubscription.unsubscribe();
            this.closeBearbeitenNavItemSubscription = null;
        }
    }

    resetCloseErfassenSubscription() {
        if (this.closeErfassenNavItemSubscription) {
            this.closeErfassenNavItemSubscription.unsubscribe();
            this.closeErfassenNavItemSubscription = null;
        }
    }

    getCode(domain: DomainEnum): Observable<any> {
        return this.dataService.getCode(domain);
    }

    codeSearch(domain: DomainEnum, code: FbStatusCodeEnum): Observable<CodeDTO> {
        return this.dataService.codeSearch(domain, code);
    }

    getActiveCodeByDomain(domain: DomainEnum): Observable<CodeDTO[]> {
        return this.dataService.getActiveCodeByDomain(domain);
    }

    private static createNavigationDto(commands: string, relativeTo?: ActivatedRoute, fachberatungsangebotId?: number): NavigationDto {
        return {
            commands: [commands],
            extras: {
                relativeTo,
                queryParams: { fachberatungsangebotId: fachberatungsangebotId ? String(fachberatungsangebotId) : null } as Params
            }
        } as NavigationDto;
    }

    private navigateRelativeToActivatedRoute(commands: string, activatedRoute: ActivatedRoute, fachberatungsangebotId?: number): void {
        const navigationDto = FachberatungsangebotService.createNavigationDto(commands, activatedRoute, fachberatungsangebotId);
        this.redirectService.navigate(navigationDto);
    }

    private navigate(url: string, fachberatungsangebotId: number, spinnerChannel: string): void {
        const navigationDto = FachberatungsangebotService.createNavigationDto(url, null, fachberatungsangebotId);
        if (spinnerChannel) {
            this.redirectService.navigate(navigationDto, spinnerChannel);
        } else {
            this.redirectService.navigate(navigationDto);
        }
    }
}
