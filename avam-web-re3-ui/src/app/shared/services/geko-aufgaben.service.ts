import { ElementRef, Injectable, TemplateRef } from '@angular/core';
import { GekoAufgabenRestService } from '@core/http/geko-aufgaben-rest.service';
import { GeKoAufgabeSuchenDTO } from '@dtos/geKoAufgabeSuchenDTO';
import { BaseResponseWrapperListGeKoAufgabeDTOWarningMessages } from '@dtos/baseResponseWrapperListGeKoAufgabeDTOWarningMessages';
import { GeKoAufgabeDTO } from '@dtos/geKoAufgabeDTO';
import { forkJoin, Observable, Subject } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { GekoAufgabenCodes } from '@shared/models/geko-aufgaben-codes.model';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { buildAnbieterPath, buildArbeitgeberPath, buildFachberatungPath, buildStesPath } from '@shared/services/build-route-path.function';
import { RedirectService } from '@shared/services/redirect.service';
import { GeKoAufgabeDetailsDTO } from '@dtos/geKoAufgabeDetailsDTO';
import { BaseResponseWrapperGeKoAufgabeDetailsDTOWarningMessages } from '@dtos/baseResponseWrapperGeKoAufgabeDetailsDTOWarningMessages';
import { BaseResponseWrapperStringWarningMessages } from '@dtos/baseResponseWrapperStringWarningMessages';
import { FormGroup } from '@angular/forms';
import { StesAufgabenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { ActivatedRoute } from '@angular/router';
import { SearchSessionStorageService } from './search-session-storage.service';
import { FacadeService } from '@shared/services/facade.service';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';
import { AmmInfopanelService, InfobarData } from '@shared/components/amm-infopanel/amm-infopanel.service';

@Injectable({
    providedIn: 'root'
})
export class GekoAufgabenService {
    public codesSubject: Subject<GekoAufgabenCodes> = new Subject<GekoAufgabenCodes>();
    public aufgabenSubject: Subject<Array<GeKoAufgabeDTO>> = new Subject<Array<GeKoAufgabeDTO>>();
    public erfassteAufgabeSubject: Subject<GeKoAufgabeDetailsDTO> = new Subject<GeKoAufgabeDetailsDTO>();
    public aufgabeLoadedSubject: Subject<GeKoAufgabeDetailsDTO> = new Subject<GeKoAufgabeDetailsDTO>();
    printStateSuffix = '_forPrint';
    private localAufgaben: Array<GeKoAufgabeDTO>;
    private localCodes: GekoAufgabenCodes;
    private request: GekoAufgabenSearchRequest;
    private stesId: string;
    private spinnerChannel: string;
    private localStesCache: any;

    constructor(
        public facade: FacadeService,
        private gekoAufgabenRestService: GekoAufgabenRestService,
        private stesDataRestService: StesDataRestService,
        private redirectService: RedirectService,
        private stateService: SearchSessionStorageService,
        protected infopanelService: AmmInfopanelService
    ) {}

    get stesCache(): any {
        return this.localStesCache;
    }

    set stesCache(value: any) {
        this.localStesCache = value;
    }

    loadCodes(spinnerChannel: string): void {
        this.clearMessages();
        this.facade.spinnerService.activate(spinnerChannel);
        forkJoin<Array<CodeDTO>, Array<CodeDTO>>([this.stesDataRestService.getCode(DomainEnum.GEKO_STATUS_AUFGABE), this.gekoAufgabenRestService.loadGeschaeftsarten()]).subscribe(
            ([status, geschaeftsarten]) => {
                this.codes = { geschaeftsarten, status } as GekoAufgabenCodes;
                this.facade.spinnerService.deactivate(spinnerChannel);
            },
            () => {
                this.localCodes = null;
                this.codesSubject.next(this.localCodes);
                this.facade.spinnerService.deactivate(spinnerChannel);
            }
        );
    }

    loadErfassenCodes(spinnerChannel: string, isBearbeiten: boolean, bereich?: GekobereichCodeEnum): void {
        this.clearMessages();
        this.facade.spinnerService.activate(spinnerChannel);
        forkJoin<Array<CodeDTO>, Array<CodeDTO>, Array<CodeDTO>>([
            this.stesDataRestService.getCode(DomainEnum.GEKO_PRIORITAET_AUFGABE),
            this.gekoAufgabenRestService.loadGeschaeftsarten(bereich),
            this.stesDataRestService.getCode(DomainEnum.GEKO_STATUS_AUFGABE)
        ]).subscribe(
            ([priorities, geschaeftsarten, status]) => {
                this.codes = { geschaeftsarten, priorities, status } as GekoAufgabenCodes;
                if (!isBearbeiten) {
                    this.facade.spinnerService.deactivate(spinnerChannel);
                }
            },
            () => {
                this.facade.spinnerService.deactivate(spinnerChannel);
            }
        );
    }

    getAufgabeById(aufgabeId: number, spinnerChannel: string): void {
        this.clearMessages();
        this.gekoAufgabenRestService.getByAufgabeId(aufgabeId, 'de').subscribe(
            response => {
                this.aufgabeLoaded = response;
                this.facade.spinnerService.deactivate(spinnerChannel);
            },
            () => {
                this.facade.spinnerService.deactivate(spinnerChannel);
            }
        );
    }

    set aufgabeLoaded(dto: GeKoAufgabeDetailsDTO) {
        this.aufgabeLoadedSubject.next(dto);
    }

    set codes(value: GekoAufgabenCodes) {
        this.localCodes = value;
        this.codesSubject.next(value);
    }

    search(search: GekoAufgabenSearchRequest, spinnerChannel: string): void {
        this.facade.spinnerService.activate(spinnerChannel);
        this.request = search;
        this.spinnerChannel = spinnerChannel;
        this.aufgabenCallback(this.gekoAufgabenRestService.search(search.request), this.spinnerChannel);
    }

    searchBy(stesId: string, spinnerChannel: string): void {
        this.facade.spinnerService.activate(spinnerChannel);
        this.stesId = stesId;
        this.spinnerChannel = spinnerChannel;
        this.aufgabenCallback(this.gekoAufgabenRestService.searchBy(stesId), this.spinnerChannel, Number(stesId));
    }

    getArbeitgeberAufgaben(unternehmenId: number, spinnerChannel: string): void {
        this.facade.spinnerService.activate(spinnerChannel);
        this.aufgabenCallback(this.gekoAufgabenRestService.getArbeitgeberAufgaben(unternehmenId), spinnerChannel);
    }

    getAnbieterAufgaben(unternehmenId: number, spinnerChannel: string): void {
        this.facade.spinnerService.activate(spinnerChannel);
        this.aufgabenCallback(this.gekoAufgabenRestService.getAnbieterAufgaben(unternehmenId), spinnerChannel);
    }

    getFachberatungAufgaben(unternehmenId: number, spinnerChannel: string): void {
        this.facade.spinnerService.activate(spinnerChannel);
        this.aufgabenCallback(this.gekoAufgabenRestService.getFachberatungAufgaben(unternehmenId), spinnerChannel);
    }

    delete(aufgageIds: number[]): Observable<BaseResponseWrapperStringWarningMessages> {
        return this.gekoAufgabenRestService.delete(aufgageIds);
    }

    set aufgaben(value: Array<GeKoAufgabeDTO>) {
        this.localAufgaben = value;
        this.aufgabenSubject.next(value);
    }

    clearMessages(): void {
        this.facade.fehlermeldungenService.closeMessage();
    }

    showMessage(errorMessage: string, danger: string): void {
        this.facade.fehlermeldungenService.showMessage(errorMessage, danger);
    }

    navigateToAufgabeBearbeitenFromSearch(aufgabe: GeKoAufgabeDTO, spinnerChannel?: string): void {
        let path: string;
        if (this.isStesAufgabe(aufgabe)) {
            path = buildStesPath(String(aufgabe.stesId), StesAufgabenPaths.AUFGABEN_BEARBEITEN);
        } else if (this.isArbeitgeberAufgabe(aufgabe) || this.isKontaktpersonAufgabe(aufgabe)) {
            path = buildArbeitgeberPath(String(aufgabe.unternehmenId), StesAufgabenPaths.AUFGABEN_BEARBEITEN);
        } else if (this.isFachberatungAufgabe(aufgabe)) {
            path = buildFachberatungPath(String(aufgabe.unternehmenId), StesAufgabenPaths.AUFGABEN_BEARBEITEN);
        } else if (this.isAnbieterAufgabe(aufgabe)) {
            path = buildAnbieterPath(String(aufgabe.unternehmenId), StesAufgabenPaths.AUFGABEN_BEARBEITEN);
        }
        if (path) {
            const navigationDto: NavigationDto = {
                commands: [path],
                extras: { queryParams: { aufgabeId: String(aufgabe.aufgabeId) } }
            };
            this.redirectService.navigate(navigationDto, spinnerChannel);
        }
    }

    navigateToUnternehmenAufgabeBearbeiten(bereich: GekobereichCodeEnum, unternehmenId: number, aufgabeId: number, spinnerChannel?: string): void {
        const unternehmenIdStr = String(unternehmenId);
        let path: string;
        switch (bereich) {
            case GekobereichCodeEnum.GESCHAEFTSBEREICH_FACHBERATUNG:
                path = buildFachberatungPath(unternehmenIdStr, StesAufgabenPaths.AUFGABEN_BEARBEITEN);
                break;
            case GekobereichCodeEnum.GESCHAEFTSBEREICH_ARBEITGEBER:
                path = buildArbeitgeberPath(unternehmenIdStr, StesAufgabenPaths.AUFGABEN_BEARBEITEN);
                break;
            case GekobereichCodeEnum.GESCHAEFTSBEREICH_ANBIETER:
                path = buildAnbieterPath(unternehmenIdStr, StesAufgabenPaths.AUFGABEN_BEARBEITEN);
                break;
            case GekobereichCodeEnum.GESCHAEFTSBEREICH_STES:
            case GekobereichCodeEnum.GESCHAEFTSBEREICH_GEKO:
            default:
                path = null;
                break;
        }
        if (path) {
            const navigationDto: NavigationDto = {
                commands: [path],
                extras: { queryParams: { aufgabeId: String(aufgabeId) } }
            };
            this.redirectService.navigate(navigationDto, spinnerChannel);
        }
    }

    navigateToAufgabenAnzeigen(stesId: string, spinnerChannel?: string): void {
        const navigationDto: NavigationDto = { commands: [buildStesPath(stesId, StesAufgabenPaths.AUFGABEN)] };
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    navigateToParent(relativeTo: ActivatedRoute, spinnerChannel?: string): void {
        const navigationDto: NavigationDto = {
            commands: ['../'],
            extras: { relativeTo }
        } as NavigationDto;
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    navigateToArbeitgeberAufgabenErfassen(unternehmenId: string, spinnerChannel?: string): void {
        const navigationDto: NavigationDto = { commands: [buildArbeitgeberPath(unternehmenId, StesAufgabenPaths.AUFGABEN_ERFASSEN)] };
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    navigateToArbeitgeberAufgabenBearbeiten(unternehmenId: string, aufgabeId: number, spinnerChannel: string): void {
        const navigationDto: NavigationDto = {
            commands: [buildArbeitgeberPath(unternehmenId, `${StesAufgabenPaths.AUFGABEN_BEARBEITEN}`)],
            extras: { queryParams: { aufgabeId: String(aufgabeId) } }
        };
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    navigateToFachberatungAufgabenErfassen(unternehmenId: string, spinnerChannel?: string): void {
        const navigationDto: NavigationDto = { commands: [buildFachberatungPath(unternehmenId, StesAufgabenPaths.AUFGABEN_ERFASSEN)] };
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    navigateToFachberatungAufgabenBearbeiten(unternehmenId: string, aufgabeId: number, spinnerChannel?: string): void {
        const navigationDto: NavigationDto = {
            commands: [buildFachberatungPath(unternehmenId, `${StesAufgabenPaths.AUFGABEN_BEARBEITEN}`)],
            extras: { queryParams: { aufgabeId: String(aufgabeId) } }
        };
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    navigateToAnbieterAufgabenBearbeiten(unternehmenId: string, aufgabeId: number, spinnerChannel?: string): void {
        const navigationDto: NavigationDto = {
            commands: [buildAnbieterPath(unternehmenId, `${StesAufgabenPaths.AUFGABEN_BEARBEITEN}`)],
            extras: { queryParams: { aufgabeId: String(aufgabeId) } }
        };
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    navigateToAnbieterAufgabenErfassen(unternehmenId: string, spinnerChannel?: string): void {
        const navigationDto: NavigationDto = { commands: [buildAnbieterPath(unternehmenId, StesAufgabenPaths.AUFGABEN_ERFASSEN)] };
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    navigateToStesAufgabenBearbeiten(stesId: string, aufgabeId: number, spinnerChannel?: string): void {
        const navigationDto: NavigationDto = {
            commands: [buildStesPath(stesId, `${StesAufgabenPaths.AUFGABEN_BEARBEITEN}`)],
            extras: { queryParams: { aufgabeId: String(aufgabeId) } }
        };
        this.redirectService.navigate(navigationDto, spinnerChannel);
    }

    openBig(modalPrint: ElementRef | TemplateRef<any>): void {
        this.facade.openModalFensterService.openXLModal(modalPrint);
    }

    open(modalPrint: ElementRef | TemplateRef<any>): void {
        this.facade.openModalFensterService.openModal(modalPrint);
    }

    set aufgabeErfasst(dto: GeKoAufgabeDetailsDTO) {
        this.erfassteAufgabeSubject.next(dto);
    }

    save(request: GeKoAufgabeDetailsDTO, spinnerChannel: string): void {
        this.clearMessages();
        this.facade.spinnerService.activate(spinnerChannel);
        this.gekoAufgabenRestService.save(request).subscribe(
            (response: BaseResponseWrapperGeKoAufgabeDetailsDTOWarningMessages) => {
                this.aufgabeErfasst = response.data;
                this.facade.spinnerService.deactivate(spinnerChannel);
                if (!response.warning) {
                    this.success(this.facade.translateService.instant('common.message.datengespeichert'));
                }
            },
            () => {
                this.facade.spinnerService.deactivate(spinnerChannel);
            }
        );
    }

    success(msg: string): void {
        this.facade.notificationService.success(msg);
    }

    refreshResults(): void {
        if (this.request) {
            this.search(this.request, this.spinnerChannel);
        } else if (this.stesId) {
            this.searchBy(this.stesId, this.spinnerChannel);
        }
    }

    reset(): void {
        this.request = null;
        this.stesId = null;
        this.spinnerChannel = null;
    }

    storePrintState(stateKey: string) {
        const stateString = sessionStorage.getItem(stateKey);
        if (stateString) {
            const state: any = JSON.parse(stateString);
            if (state.columnWidths) {
                state.columnWidths = state.columnWidths.slice(1, -1);
            }
            sessionStorage.setItem(stateKey + this.printStateSuffix, JSON.stringify(state));
        }
    }

    updateTitle(data: InfobarData): void {
        this.infopanelService.updateInformation(data);
    }

    private isKontaktpersonAufgabe(aufgabe: GeKoAufgabeDTO) {
        return aufgabe.geschaeftsartCode === 'AGF2';
    }

    private isStesAufgabe(aufgabe: GeKoAufgabeDTO) {
        return aufgabe.geschaeftsartCode.startsWith('S');
    }

    private isArbeitgeberAufgabe(aufgabe: GeKoAufgabeDTO) {
        return aufgabe.geschaeftsartCode.startsWith('G');
    }

    private isFachberatungAufgabe(aufgabe: GeKoAufgabeDTO) {
        return aufgabe.geschaeftsartCode.startsWith('F');
    }

    private isAnbieterAufgabe(aufgabe: GeKoAufgabeDTO) {
        return aufgabe.geschaeftsartCode.startsWith('A') && !this.isKontaktpersonAufgabe(aufgabe);
    }

    private aufgabenCallback(getAufgabenObservable: Observable<BaseResponseWrapperListGeKoAufgabeDTOWarningMessages>, spinnerChannel: string, stesId?: number): void {
        getAufgabenObservable.subscribe(
            (response: BaseResponseWrapperListGeKoAufgabeDTOWarningMessages) => {
                if (stesId) {
                    this.storeBy(stesId, response);
                }
                this.facade.spinnerService.deactivate(spinnerChannel);
                this.aufgaben = response.data;
            },
            () => {
                this.localAufgaben = null;
                this.aufgabenSubject.next(this.localAufgaben);
                this.facade.spinnerService.deactivate(spinnerChannel);
            }
        );
    }

    private storeBy(stesId: number, response: BaseResponseWrapperListGeKoAufgabeDTOWarningMessages): void {
        this.stateService.storeFieldsByKey(stesId.toString(), {
            stesId,
            call: 'GekoAufgabenService.searchByStesId',
            data: response.data
        });
    }
}

export interface GekoAufgabenSearchRequest {
    request: GeKoAufgabeSuchenDTO;
    statusDropdownLabels?: any[];
    geschaeftsArtDropdownLabels?: any[];
    searchFormGroup?: FormGroup;
}
