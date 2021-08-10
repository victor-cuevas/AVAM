import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { GekoArbeitgeberService } from '@shared/services/geko-arbeitgeber.service';
import { Unsubscribable } from 'oblique-reactive';
import { ArbeitgeberSearchFormComponent } from '@modules/geko/components/arbeitgeber-search-form/arbeitgeber-search-form.component';
import { GeschaeftArbeitgeberSuchenAction, GeschaeftArbeitgeberSuchenData } from '@modules/geko/components/arbeitgeber-search-form/geschaeft-arbeitgeber-suchen.data';
import { VerlaufGeKoArbeitgeberDTO } from '@dtos/verlaufGeKoArbeitgeberDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { Router } from '@angular/router';
import { ToolboxService } from '@app/shared';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { CodeDTO } from '@dtos/codeDTO';
import { AbstractControl } from '@angular/forms';
import { CallbackDTO } from '@dtos/callbackDTO';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ArbeitgeberSearchState, ArbeitgeberSearchStateFields } from '@modules/geko/components/arbeitgeber-search/arbeitgeber-search.state';
import { GeKoGeschaeftSuchenInitDTO } from '@dtos/geKoGeschaeftSuchenInitDTO';
import { GeKoGeschaeftSuchenDTO } from '@dtos/geKoGeschaeftSuchenDTO';
import { filter, map, takeUntil } from 'rxjs/operators';
import { BaseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { BaseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages';
import { VerlaufGeKoAmmDTO } from '@dtos/verlaufGeKoAmmDTO';
import { Observable } from 'rxjs';

@Component({
    selector: 'avam-geko-arbeitgeber-search',
    templateUrl: './arbeitgeber-search.component.html',
    providers: [GekoArbeitgeberService]
})
export class ArbeitgeberSearchComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    channel: string;
    resultChannel: string;
    tableStateKey: string;
    isAmm: boolean;
    @ViewChild('formComponent') formComponent: ArbeitgeberSearchFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @Input() cacheStateKey: string;
    @Input() set amm(amm: boolean) {
        this.isAmm = amm;
        const key: string = this.isAmm ? 'anbieter' : 'arbeitgeber';
        this.tableStateKey = `geko-${key}-search-table`;
        this.resultChannel = `geko-${key}-result-channel`;
        this.channel = `geko-${key}-search-channel`;
    }

    data: GeschaeftArbeitgeberSuchenData;
    dataSource: VerlaufGeKoArbeitgeberDTO[] | VerlaufGeKoAmmDTO[];
    permissions: typeof Permissions = Permissions;
    private static readonly NO_SEARCH_CRITERIA = 'geko.error.noSearchCriteria';

    constructor(private service: GekoArbeitgeberService, private router: Router) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngAfterViewInit(): void {
        this.service.facade.spinnerService.activate(this.channel);
        const cache = this.restoreState();
        this.initRequest(cache);
        this.initToolbox();
        this.observePrintAction();
    }

    ngOnDestroy(): void {
        this.service.facade.toolboxService.resetConfiguration();
        ToolboxService.GESPEICHERTEN_LISTE_URL = '/geko/arbeitgeber/search';
        super.ngOnDestroy();
    }

    onSearch(): void {
        this.service.facade.fehlermeldungenService.closeMessage();

        if (!this.formComponent.reactiveForms.isSearchCriteriaGiven()) {
            this.service.facade.fehlermeldungenService.showMessage(ArbeitgeberSearchComponent.NO_SEARCH_CRITERIA, 'danger');
            return;
        }

        if (this.formComponent.reactiveForms.searchForm.invalid) {
            this.formComponent.ngForm.onSubmit(undefined);
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.search();
    }

    onChangeGeschaeftsartId(geschaeftsartId: number): void {
        this.service.rest.loadSachstaende(geschaeftsartId || -1).subscribe((sachstandOptions: CodeDTO[]) => {
            this.data = { ...this.data, sachstandOptions };
            delete this.data.action;
        });
        const sachstandIdControl: AbstractControl = this.formComponent.searchFormGroup.get('sachstandId');
        if (sachstandIdControl.value !== '') {
            sachstandIdControl.setValue('');
        }
    }

    openCallback(callback: CallbackDTO): void {
        if (this.service.callbackHelper.isCallable(callback)) {
            const navigationPath = this.service.callbackResolver.resolve(callback);
            this.service.redirect.navigate(navigationPath);
        }
    }

    private initToolbox(): void {
        this.service.facade.toolboxService.sendConfiguration(ToolboxConfig.getGeKoArbeitgeberSearchConfig(), this.channel);
    }

    private restoreState(): ArbeitgeberSearchState {
        return this.service.storage.restoreStateByKey(this.cacheStateKey);
    }

    private initRequest(cache: ArbeitgeberSearchState): void {
        const initRequest: Observable<GeKoGeschaeftSuchenInitDTO> = this.isAmm ? this.service.rest.initAnbieterRequest() : this.service.rest.initRequest();
        initRequest.subscribe(
            (request: GeKoGeschaeftSuchenInitDTO) => {
                this.initData(request, cache);
                this.service.facade.spinnerService.deactivate(this.channel);
                setTimeout(() => this.search(), 100);
            },
            () => this.service.facade.spinnerService.deactivate(this.channel)
        );
    }

    private initData(request: GeKoGeschaeftSuchenInitDTO, cache: ArbeitgeberSearchState): void {
        this.data = {
            dto: null,
            geschaeftsartOptions: request.geschaeftarten,
            sachstandOptions: request.sachstaende,
            action: GeschaeftArbeitgeberSuchenAction.INIT
        } as GeschaeftArbeitgeberSuchenData;

        if (cache) {
            this.data = { ...this.data, dto: cache.fields.dto, action: GeschaeftArbeitgeberSuchenAction.CACHE, cache };
        }
    }

    private storeFields(request: GeKoGeschaeftSuchenDTO): void {
        this.service.storage.storeFieldsByKey(this.cacheStateKey, {
            dto: request,
            fallbearbeiterId: this.getFallbearbeiterId(),
            benutzerstellenId: this.getBenutzerstellenId()
        } as ArbeitgeberSearchStateFields);
    }

    private getBenutzerstellenId(): any {
        return this.formComponent.reactiveForms.searchForm.get('benutzerstellenId')['benutzerstelleObject'].benutzerstelleId !== -1
            ? this.formComponent.reactiveForms.searchForm.get('benutzerstellenId')['benutzerstelleObject']
            : null;
    }

    private getFallbearbeiterId(): any {
        return this.formComponent.reactiveForms.searchForm.get('fallbearbeiterId')['benutzerObject'].benutzerId !== -1
            ? this.formComponent.reactiveForms.searchForm.get('fallbearbeiterId')['benutzerObject']
            : null;
    }

    private search(): void {
        this.service.facade.spinnerService.activate(this.resultChannel);
        const request: GeKoGeschaeftSuchenDTO = this.formComponent.handler.mapToDTO();
        if (this.isAmm) {
            this.service.rest
                .searchForAnbieter(request)
                .pipe(map((response: BaseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages) => response.data))
                .subscribe((data: VerlaufGeKoAmmDTO[]) => this.setData(request, data), () => this.service.facade.spinnerService.deactivate(this.resultChannel));
        } else {
            this.service.rest
                .search(request)
                .pipe(map((response: BaseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages) => response.data))
                .subscribe((data: VerlaufGeKoArbeitgeberDTO[]) => this.setData(request, data), () => this.service.facade.spinnerService.deactivate(this.resultChannel));
        }
    }

    private setData(request: GeKoGeschaeftSuchenDTO, data: VerlaufGeKoArbeitgeberDTO[] | VerlaufGeKoAmmDTO[]): void {
        this.storeFields(request);
        this.dataSource = data || [];
        this.service.facade.spinnerService.deactivate(this.resultChannel);
    }

    private observePrintAction(): void {
        this.service.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => this.service.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource));
    }
}
