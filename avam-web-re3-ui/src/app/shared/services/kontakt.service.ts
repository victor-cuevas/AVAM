import { ElementRef, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RedirectService } from '@shared/services/redirect.service';
import { AmmInfopanelService, InfobarData } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { NavigationService } from '@shared/services/navigation-service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { UnternehmenTerminRestService } from '@core/http/unternehmen-termin-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { Observable, Subject, Subscription } from 'rxjs';
import { UnternehmenTerminViewDTO } from '@dtos/unternehmenTerminViewDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { BaseResponseWrapperListUnternehmenTerminViewDTOWarningMessages } from '@dtos/baseResponseWrapperListUnternehmenTerminViewDTOWarningMessages';
import { SpinnerService } from 'oblique-reactive';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { UnternehmenTerminDTO } from '@dtos/unternehmenTerminDTO';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { SchlagwortDTO } from '@dtos/schlagwortDTO';
import { AuthenticationService } from '@core/services/authentication.service';
import { UserDto } from '@dtos/userDto';
import { BaseResponseWrapperUnternehmenTerminDTOWarningMessages } from '@dtos/baseResponseWrapperUnternehmenTerminDTOWarningMessages';
import { SchlagworteRestService } from '@core/http/schlagworte-rest.service';
import { HttpResponse } from '@angular/common/http';
import { TerminUebertragenComponent } from '@shared/components/termin-uebertragen/termin-uebertragen.component';

@Injectable({
    providedIn: 'root'
})
export class KontaktService {
    kontakteListSubject: Subject<Array<UnternehmenTerminViewDTO>> = new Subject<Array<UnternehmenTerminViewDTO>>();
    kontaktSubject: Subject<UnternehmenTerminDTO> = new Subject<UnternehmenTerminDTO>();
    closeErfassenNavItemSubscription: Subscription;
    closeBearbeitenNavItemSubscription: Subscription;
    private readonly bigModalOpts: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' };
    private readonly modalOpts: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' };
    private readonly terminUebetragenOpts: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', windowClass: 'modal-md', centered: true, backdrop: 'static' };

    constructor(
        private fehlermeldungenService: FehlermeldungenService,
        private redirectService: RedirectService,
        private infopanelService: AmmInfopanelService,
        private navigationService: NavigationService,
        private readonly spinnerService: SpinnerService,
        private unternehmenTerminRestService: UnternehmenTerminRestService,
        private schlagworteRestService: SchlagworteRestService,
        private dataService: StesDataRestService,
        private modalService: NgbModal,
        private authenticationService: AuthenticationService
    ) {}

    getKontakteByUnternehmenId(unternehmenId: number, spinnerChannel: string): void {
        this.spinnerService.activate(spinnerChannel);
        this.unternehmenTerminRestService.getByUnternehmenId(unternehmenId).subscribe(
            (response: BaseResponseWrapperListUnternehmenTerminViewDTOWarningMessages) => {
                this.spinnerService.deactivate(spinnerChannel);
                this.kontakteListSubject.next(response.data);
                this.infopanelService.updateInformation({ tableCount: response.data.length });
            },
            () => this.spinnerService.deactivate(spinnerChannel)
        );
    }

    getKontakt(kontaktId: number, spinnerChannel: string) {
        this.spinnerService.activate(spinnerChannel);
        this.unternehmenTerminRestService.getByUnternehmenTerminId(kontaktId).subscribe(
            (response: BaseResponseWrapperUnternehmenTerminDTOWarningMessages) => {
                this.spinnerService.deactivate(spinnerChannel);
                this.kontaktSubject.next(response.data);
            },
            () => this.spinnerService.deactivate(spinnerChannel)
        );
    }

    updateKontakt(kontakt: UnternehmenTerminDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.unternehmenTerminRestService.updateKontakt(kontakt);
    }

    createKontakt(kontakt: UnternehmenTerminDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.unternehmenTerminRestService.createKontakt(kontakt);
    }

    deleteKontakt(unternehmenTerminId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.unternehmenTerminRestService.deleteKontakt(unternehmenTerminId);
    }

    getICSfile(unternehmenId: number, unternehmenTerminId: number): Observable<HttpResponse<Blob>> {
        return this.unternehmenTerminRestService.getICSfile(unternehmenId, unternehmenTerminId);
    }

    navigateToKontakte(route: ActivatedRoute): void {
        this.createNavigationDto(`../`, route);
    }

    navigateToKontaktBearbeiten(kontaktId: number, route: ActivatedRoute): void {
        this.createNavigationDto(`./bearbeiten`, route, kontaktId);
    }

    navigateToKontaktErfassen(route: ActivatedRoute): void {
        this.createNavigationDto(`./erfassen`, route);
    }

    navigateToKontaktBearbeitenAfterCreate(unternehmenId: number, kontaktId: number, route: ActivatedRoute): void {
        this.createNavigationDto(`../../../${unternehmenId}/kontakte/bearbeiten`, route, kontaktId);
    }

    updateInformation(data: InfobarData): void {
        this.infopanelService.updateInformation(data);
    }

    showNavigationTreeRoute(path: string, queryParams?: any): void {
        if (queryParams) {
            this.navigationService.showNavigationTreeRoute(path, queryParams);
        } else {
            this.navigationService.showNavigationTreeRoute(path);
        }
    }

    closeMessage(): void {
        this.fehlermeldungenService.closeMessage();
    }

    getCode(domain: DomainEnum): Observable<Array<CodeDTO>> {
        return this.dataService.getCode(String(domain));
    }

    getAktivSchlagworte(): Observable<Array<SchlagwortDTO>> {
        return this.schlagworteRestService.getForUnternehmentermin(StatusEnum.AKTIV);
    }

    openBigModal(modalPrint: ElementRef | any): NgbModalRef {
        return this.modalService.open(modalPrint, this.bigModalOpts);
    }

    openModal(content: NgbModalRef | any): NgbModalRef {
        this.closeMessage();
        return this.modalService.open(content, this.modalOpts);
    }

    openEmailformModal(content: TerminUebertragenComponent): void {
        this.modalService.open(content, this.terminUebetragenOpts);
    }

    getLoggedUser(): UserDto {
        return this.authenticationService.getLoggedUser();
    }

    hasAnyPermission(permissions: any[], userPermissions: Array<string>): boolean {
        return this.authenticationService.hasAnyPermission(permissions, userPermissions);
    }

    resetCloseErfassenSubscription() {
        if (this.closeErfassenNavItemSubscription) {
            this.closeErfassenNavItemSubscription.unsubscribe();
            this.closeErfassenNavItemSubscription = null;
        }
    }

    resetCloseBearbeitenSubscription() {
        if (this.closeBearbeitenNavItemSubscription) {
            this.closeBearbeitenNavItemSubscription.unsubscribe();
            this.closeBearbeitenNavItemSubscription = null;
        }
    }

    private createNavigationDto(commands: any, route: ActivatedRoute, kontaktId?: number): void {
        const navigationDto: NavigationDto = {
            commands: [commands],
            extras: {
                relativeTo: route,
                queryParams: { kontaktId: kontaktId ? String(kontaktId) : null }
            }
        };
        this.redirectService.navigate(navigationDto);
    }
}
