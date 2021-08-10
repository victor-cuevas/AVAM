import { ElementRef, Injectable, TemplateRef } from '@angular/core';
import { KontaktpersonSearchParamDTO } from '@dtos/kontaktpersonSearchParamDTO';
import { Observable, Subject, Subscription } from 'rxjs';
import { BaseResponseWrapperListKontakteViewDTOWarningMessages } from '@dtos/baseResponseWrapperListKontakteViewDTOWarningMessages';
import { KontaktpersonRestService } from '@core/http/kontaktperson-rest.service';
import { KontakteViewDTO } from '@dtos/kontakteViewDTO';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { RedirectService } from '@shared/services/redirect.service';
import { KontaktpersonDTO } from '@dtos/kontaktpersonDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { AuthenticationService } from '@core/services/authentication.service';
import { UserDto } from '@dtos/userDto';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { ActivatedRoute } from '@angular/router';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { KontaktRestService } from '@core/http/kontakt-rest.service';
import { KontaktDTO } from '@dtos/kontaktDTO';
import { SpinnerService } from 'oblique-reactive';

@Injectable({
    providedIn: 'root'
})
export class KontaktpersonService {
    kontaktpersonListSubject: Subject<Array<KontakteViewDTO>> = new Subject<Array<KontakteViewDTO>>();
    savedKontaktpersonSubject: Subject<number> = new Subject<number>();
    closeBearbeitenNavItemSubscription: Subscription;
    closeErfassenNavItemSubscription: Subscription;
    private readonly bigModalOpts: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' };
    private readonly modalOpts: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' };
    private readonly modalMdOpts: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', windowClass: 'modal-md', backdrop: 'static' };

    constructor(
        private restService: KontaktpersonRestService,
        private kontaktRestService: KontaktRestService,
        private redirectService: RedirectService,
        private authenticationService: AuthenticationService,
        private stesDataRestService: StesDataRestService,
        private fehlermeldungenService: FehlermeldungenService,
        private modalService: NgbModal,
        private infopanelService: AmmInfopanelService,
        private readonly spinnerService: SpinnerService
    ) {}

    searchKontaktpersonen(kontaktpersonSearchParam: KontaktpersonSearchParamDTO): Observable<BaseResponseWrapperListKontakteViewDTOWarningMessages> {
        return this.restService.searchKontaktpersonen(kontaktpersonSearchParam);
    }

    getKontaktpersonenByUnternehmenId(unternehmenId: number): void {
        this.restService.getKontaktpersonenByUnternehmenId(unternehmenId).subscribe((response: BaseResponseWrapperListKontakteViewDTOWarningMessages) => {
            this.kontaktpersonListSubject.next(response.data);
            this.infopanelService.updateInformation({ tableCount: response.data.length });
        });
    }

    createKontaktperson(kontaktperson: KontaktpersonDTO, spinnerChannel: string): void {
        this.spinnerService.activate(spinnerChannel);
        this.restService.createKontaktperson(kontaktperson).subscribe(
            (response: BaseResponseWrapperLongWarningMessages) => {
                this.spinnerService.deactivate(spinnerChannel);
                this.savedKontaktpersonSubject.next(response.data);
            },
            () => {
                this.spinnerService.deactivate(spinnerChannel);
            }
        );
    }

    deleteKontaktpersonByKontaktId(kontaktId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.restService.deleteKontaktpersonByKontaktId(kontaktId);
    }

    getKontakteByKontaktpersonId(kontaktpersonId: number) {
        return this.restService.getKontakteByKontaktpersonId(kontaktpersonId);
    }

    getByKontaktId(kontaktId: number) {
        return this.kontaktRestService.getByKontaktId(kontaktId);
    }

    updateKontaktperson(kontakt: KontaktDTO) {
        return this.kontaktRestService.updateKontaktperson(kontakt);
    }

    getLoggedUser(): UserDto {
        return this.authenticationService.getLoggedUser();
    }

    getCode(domain: string): Observable<Array<CodeDTO>> {
        return this.stesDataRestService.getCode(domain);
    }

    navigateToKontaktpersonen(route: ActivatedRoute): void {
        this.createNavigationDto(`../`, route);
    }

    navigateToKontaktpersonBearbeiten(unternehmenId: number, kontaktpersonId: number, route: ActivatedRoute): void {
        this.createNavigationDto(`../../${unternehmenId}/kontaktpersonen/bearbeiten`, route, kontaktpersonId);
    }

    navigateToKontaktpersonBearbeitenAfterCreate(unternehmenId: number, kontaktpersonId: number, route: ActivatedRoute): void {
        this.createNavigationDto(`../../../${unternehmenId}/kontaktpersonen/bearbeiten`, route, kontaktpersonId);
    }

    navigateToKontaktpersonenErfassen(unternehmenId: number, route: ActivatedRoute): void {
        this.createNavigationDto(`./erfassen`, route);
    }

    closeMessage(): void {
        this.fehlermeldungenService.closeMessage();
    }

    openModal(content: NgbModalRef | any): NgbModalRef {
        this.closeMessage();
        return this.modalService.open(content, this.modalOpts);
    }

    openMdModal(content: TemplateRef<any> | any): NgbModalRef {
        return this.modalService.open(content, this.modalMdOpts);
    }

    openBigModal(modalPrint: ElementRef | any): NgbModalRef {
        return this.modalService.open(modalPrint, this.bigModalOpts);
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

    private createNavigationDto(commands: any, route: ActivatedRoute, kontaktpersonId?: number): void {
        const navigationDto: NavigationDto = {
            commands: [commands],
            extras: {
                relativeTo: route,
                queryParams: { kontaktpersonId: kontaktpersonId ? String(kontaktpersonId) : null }
            }
        };
        this.redirectService.navigate(navigationDto);
    }
}
