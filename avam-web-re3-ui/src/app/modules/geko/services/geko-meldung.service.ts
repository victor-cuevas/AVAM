import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { SortOrderEnum } from '@shared/enums/sort-order.enum';
import { GeschaeftMeldungDTO } from '@shared/models/dtos-generated/geschaeftMeldungDTO';
import { GekoMeldungRestService } from '@core/http/geko-meldung-rest.service';
import { GeschaeftsMeldungenRequestDTO } from '@shared/models/dtos-generated/geschaeftsMeldungenRequestDTO';
import { BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListGeschaeftMeldungDTOWarningMessages';
import { SortEvent } from '@shared/directives/table.sortable.header.directive';
import { CallbackDTO } from '@dtos/callbackDTO';
import { GekoMeldungCallbackResolverService } from '@shared/services/geko-meldung-callback-resolver.service';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { RedirectService } from '@shared/services/redirect.service';
import { CallbackHelperService } from '@shared/services/callback-helper.service';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';
import { Permissions } from '@shared/enums/permissions.enum';
import { FacadeService } from '@shared/services/facade.service';

@Injectable({
    providedIn: 'root'
})
export class GekoMeldungService {
    public subject: Subject<GeschaeftMeldungDTO[]> = new Subject();
    printStateSuffix = '_forPrint';
    sortEvent: SortEvent = { column: 'erstelltAm', direction: SortOrderEnum.DESCENDING };
    private _stesCache: any;
    private _responseDTOs: GeschaeftMeldungDTO[];
    private _searchDTOParam: GeschaeftsMeldungenRequestDTO;
    private _form: FormGroup;
    private _spinnerChannel: string;
    private _gelesenIcon: HTMLElement;
    private stesId: number;
    private unternehmenData = {
        id: null,
        geschaeftsbereich: null
    };

    constructor(
        private gekoMeldungRestService: GekoMeldungRestService,
        private redirectService: RedirectService,
        private callbackResolverService: GekoMeldungCallbackResolverService,
        private facade: FacadeService,
        public callbackHelper: CallbackHelperService
    ) {
        this.gelesenIcon = document.createElement('i');
        this.gelesenIcon.className = 'pa-2 full-centered fa fa-envelope-open-o';
    }

    callSearchMeldungen(searchDTOParam: GeschaeftsMeldungenRequestDTO, form: FormGroup, spinnerChannel?: string) {
        this._searchDTOParam = searchDTOParam;
        this._form = form;
        this.activateSpinner(spinnerChannel);
        this.gekoMeldungRestService.searchMeldungen(searchDTOParam).subscribe(
            (response: BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages) => {
                this.hanldeMeldungenSuccess(response, spinnerChannel);
            },
            () => {
                this.handleMeldungenError(spinnerChannel);
            }
        );
    }

    callGetStesMeldungen(stesId: number, spinnerChannel?: string) {
        this.stesId = stesId;
        this.activateSpinner(spinnerChannel);
        this.gekoMeldungRestService.getStesMeldungen(stesId).subscribe(
            (response: BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages) => {
                this.hanldeMeldungenSuccess(response, spinnerChannel);
            },
            () => {
                this.handleMeldungenError(spinnerChannel);
            }
        );
    }

    callGetUnternehmenMeldungen(unternehmenId: number, geschaeftsbereichCode: string, spinnerChannel?: string) {
        this.unternehmenData = {
            id: unternehmenId,
            geschaeftsbereich: geschaeftsbereichCode
        };
        this.activateSpinner(spinnerChannel);
        this.gekoMeldungRestService.getUnternehmenMeldungen(unternehmenId, geschaeftsbereichCode).subscribe(
            (response: BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages) => {
                this.hanldeMeldungenSuccess(response, spinnerChannel);
            },
            () => {
                this.handleMeldungenError(spinnerChannel);
            }
        );
    }

    resetSearchParams() {
        this._searchDTOParam = null;
        this._form = null;
        this.stesId = null;
        this.unternehmenData = null;
    }

    refreshSearchResults() {
        if (this._searchDTOParam) {
            this.callSearchMeldungen(this._searchDTOParam, this._form, this._spinnerChannel);
        } else if (this.stesId && this.stesId > 0) {
            this.callGetStesMeldungen(this.stesId, this._spinnerChannel);
        } else if (this.unternehmenData && this.unternehmenData.id && this.unternehmenData.geschaeftsbereich) {
            this.callGetUnternehmenMeldungen(this.unternehmenData.id, this.unternehmenData.geschaeftsbereich, this._spinnerChannel);
        }
    }

    resetSearchResults() {
        this.subject.next([]);
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

    mapDtoToTable(data: GeschaeftMeldungDTO[]) {
        return data ? data.map(d => ({ ...{ allowOpen: this.allowOpen(d), displayName: this.getName(d) }, ...d })) : [];
    }

    getZustandig(meldung: GeschaeftMeldungDTO): string {
        return `${meldung.zustBenutzerLogin} ${meldung.zustBenutzerNachname} ${meldung.zustBenutzerVorname}`;
    }

    getName(meldung: GeschaeftMeldungDTO) {
        const arts = ['A2', 'A3', 'A4', 'A5', 'AGF2', 'G5', 'G6', 'M2'];
        return arts.indexOf(meldung.geschaeftsart.code) >= 0 ? this.getUnternehmenName(meldung) : this.getNameVorname(meldung);
    }

    getUnternehmenName(meldung: GeschaeftMeldungDTO): string {
        return meldung.unternehmenName1 ? meldung.unternehmenName1 : '';
    }

    getNameVorname(meldung: GeschaeftMeldungDTO): string {
        const name = meldung.stesName ? `${meldung.stesName} ` : '';
        const vorname = meldung.stesVorname ? `${meldung.stesVorname}` : '';
        return `${name}${vorname}`;
    }

    clearResponseDTOs() {
        this._responseDTOs = null;
    }

    set responseDTOs(value: GeschaeftMeldungDTO[]) {
        this._responseDTOs = value;
        this.subject.next(value);
    }

    get stesCache(): any {
        return this._stesCache;
    }

    set stesCache(value: any) {
        this._stesCache = value;
    }

    get gelesenIcon(): HTMLElement {
        return this._gelesenIcon;
    }

    set gelesenIcon(value: HTMLElement) {
        this._gelesenIcon = value;
    }

    get spinnerChannel(): string {
        return this._spinnerChannel;
    }

    set spinnerChannel(value: string) {
        this._spinnerChannel = value;
    }

    set searchDTOParam(value: GeschaeftsMeldungenRequestDTO) {
        this._searchDTOParam = value;
    }

    get form(): FormGroup {
        return this._form;
    }

    set form(value: FormGroup) {
        this._form = value;
    }

    createNavigationPath(dto: CallbackDTO, geschaeftsbereichCode: GekobereichCodeEnum): NavigationDto {
        return this.callbackResolverService.resolve(dto, geschaeftsbereichCode);
    }

    navigate(navigationDto: NavigationDto): void {
        this.redirectService.navigate(navigationDto, this._spinnerChannel);
    }

    clearMessages(): void {
        this.facade.fehlermeldungenService.closeMessage();
    }

    showMessage(message: string, type: string): void {
        this.facade.fehlermeldungenService.showMessage(message, type);
    }

    private allowOpen(meldung: GeschaeftMeldungDTO): boolean {
        const f33 = this.facade.authenticationService.hasAnyPermission([Permissions.FEATURE_33]);
        const f34 = this.facade.authenticationService.hasAnyPermission([Permissions.FEATURE_34]);
        return (
            meldung &&
            meldung.geschaeftsart &&
            meldung.geschaeftsart.code &&
            (meldung.geschaeftsart.code.startsWith('S') ||
                (f33 && (meldung.geschaeftsart.code === 'AGF2' || meldung.geschaeftsart.code.startsWith('G'))) ||
                (f34 && (meldung.geschaeftsart.code.startsWith('A') || meldung.geschaeftsart.code.startsWith('M'))))
        );
    }

    private activateSpinner(spinnerChannel: string) {
        this._spinnerChannel = spinnerChannel;
        if (spinnerChannel) {
            this.facade.spinnerService.activate(spinnerChannel);
        }
    }

    private hanldeMeldungenSuccess(response: BaseResponseWrapperListGeschaeftMeldungDTOWarningMessages, spinnerChannel: string) {
        this.responseDTOs = response.data as GeschaeftMeldungDTO[];
        if (spinnerChannel) {
            this.facade.spinnerService.deactivate(spinnerChannel);
        }
    }

    private handleMeldungenError(spinnerChannel: string) {
        this.clearResponseDTOs();
        this.subject.next(this._responseDTOs);
        if (spinnerChannel) {
            this.facade.spinnerService.deactivate(spinnerChannel);
        }
    }
}
