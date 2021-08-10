import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GekoStesRestService } from '@core/http/geko-stes-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { GeKoGeschaeftSuchenInitDTO } from '@dtos/geKoGeschaeftSuchenInitDTO';
import { BaseResponseWrapperListVerlaufGeKoStesDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoStesDTOWarningMessages';
import { BaseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages';
import { GeKoGeschaeftSuchenDTO } from '@dtos/geKoGeschaeftSuchenDTO';
import { CallbackDTO } from '@dtos/callbackDTO';
import { Router } from '@angular/router';
import { GekoVerlaufCallbackResolverService } from '@shared/services/geko-verlauf-callback-resolver.service';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { VerlaufGeKoStesDTO } from '@dtos/verlaufGeKoStesDTO';
import { FormGroup } from '@angular/forms';
import { RedirectService } from '@shared/services/redirect.service';
import { CallbackHelperService } from '@shared/services/callback-helper.service';
import { FacadeService } from '@shared/services/facade.service';

@Injectable({
    providedIn: 'root'
})
export class GekoStesService {
    public searchGeschaeftStesSubject: Subject<VerlaufGeKoStesDTO[]> = new Subject();
    private localSearchGeschaeftStesResponse: VerlaufGeKoStesDTO[];

    constructor(
        private gekoStesRestService: GekoStesRestService,
        private router: Router,
        private callbackResolverService: GekoVerlaufCallbackResolverService,
        private redirectService: RedirectService,
        private facade: FacadeService,
        public callbackHelper: CallbackHelperService
    ) {}

    navigate(navigationDto: NavigationDto, spinnerChannel?: string): void {
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    createNavigationPath(dto: CallbackDTO): NavigationDto {
        return this.callbackResolverService.resolve(dto);
    }

    getLoggedUserBenutzerstelleId(): number {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        return currentUser.benutzerstelleId;
    }

    initRequest(): Observable<GeKoGeschaeftSuchenInitDTO> {
        return this.gekoStesRestService.initRequest();
    }

    searchSachstaende(geschaeftsartId: string): Observable<CodeDTO[]> {
        return this.gekoStesRestService.searchSachstaende(geschaeftsartId);
    }

    searchGeschaeftStes(
        search: {
            request: GeKoGeschaeftSuchenDTO;
            gekoStesSearchFormGroup: FormGroup;
            geschaeftsartenOptions: any[];
            sachstaendeOptions: any[];
            selectedFallbearbeiter: any;
        },
        spinnerChannel: string
    ): void {
        this.facade.spinnerService.activate(spinnerChannel);
        this.gekoStesRestService.searchGeschaeftStes(search.request).subscribe(
            (response: BaseResponseWrapperListVerlaufGeKoStesDTOWarningMessages) => {
                this.searchGeschaeftStesResponse = response.data as VerlaufGeKoStesDTO[];
                this.facade.spinnerService.deactivate(spinnerChannel);
            },
            () => {
                this.localSearchGeschaeftStesResponse = null;
                this.searchGeschaeftStesSubject.next(this.localSearchGeschaeftStesResponse);
                this.facade.spinnerService.deactivate(spinnerChannel);
            }
        );
    }

    set searchGeschaeftStesResponse(value: VerlaufGeKoStesDTO[]) {
        this.localSearchGeschaeftStesResponse = value;
        this.searchGeschaeftStesSubject.next(value);
    }

    searchGeschaeftStesByStesId(stesId: string): Observable<BaseResponseWrapperListVerlaufGeKoAnbieterDTOWarningMessages> {
        return this.gekoStesRestService.searchGeschaeftStesByStesId(stesId);
    }

    reset(): void {
        this.searchGeschaeftStesSubject.next([]);
    }

    clearMessages(): void {
        this.facade.fehlermeldungenService.closeMessage();
    }

    showMessage(message: string, type: string): void {
        this.facade.fehlermeldungenService.showMessage(message, type);
    }

    openModal(content: any): void {
        this.facade.openModalFensterService.openXLModal(content);
    }

    openPrintModal(content: any, stateKey: string, printStateKey: string, dataSource: any): void {
        GekoStesService.storePrintState(stateKey, printStateKey);
        this.facade.openModalFensterService.openPrintModal(content, dataSource);
    }

    removeFromStorage(stateKey: string, stateKeyPrint: string): void {
        sessionStorage.removeItem(stateKey);
        sessionStorage.removeItem(stateKeyPrint);
    }

    private static storePrintState(stateKey: string, printStateKey: string) {
        const stateString = sessionStorage.getItem(stateKey);
        if (stateString) {
            const state: any = JSON.parse(stateString);
            if (state.columnWidths) {
                state.columnWidths = state.columnWidths.slice(0, 4);
            }
            sessionStorage.setItem(printStateKey, JSON.stringify(state));
        }
    }
}
