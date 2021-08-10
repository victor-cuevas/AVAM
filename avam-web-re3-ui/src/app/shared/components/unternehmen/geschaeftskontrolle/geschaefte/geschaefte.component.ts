import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VerlaufGeKoAmmDTO } from '@dtos/verlaufGeKoAmmDTO';
import { VerlaufGeKoArbeitgeberDTO } from '@dtos/verlaufGeKoArbeitgeberDTO';
import { ActivatedRoute } from '@angular/router';
import { GekoArbeitgeberService } from '@shared/services/geko-arbeitgeber.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxService } from '@app/shared';
import { CallbackDTO } from '@dtos/callbackDTO';
import { UnternehmenTypes } from '@shared/enums/unternehmen.enum';
import { BaseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages';
import { BaseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages } from '@dtos/baseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-geko-geschaefte',
    templateUrl: './geschaefte.component.html'
})
export class GeschaefteComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    isAmm = false;
    dataSource: VerlaufGeKoAmmDTO[] | VerlaufGeKoArbeitgeberDTO[] = [];
    readonly channel = 'avam-geschaefte-page.channel';
    private unternehmenId: string;
    private type: string;

    constructor(private activatedRoute: ActivatedRoute, private service: GekoArbeitgeberService, private infopanelService: AmmInfopanelService) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.initHeader();
        this.type = this.activatedRoute.parent.snapshot.data['type'];
        this.observeUnternehmenId(() => this.getDataByType());
    }

    ngOnDestroy(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.service.facade.toolboxService.resetConfiguration();
        super.ngOnDestroy();
    }

    openCallback(callback: CallbackDTO): void {
        if (this.service.callbackHelper.isCallable(callback)) {
            const navigationPath = this.service.callbackResolver.resolve(callback);
            this.service.redirect.navigate(navigationPath);
        }
    }

    getStateKey(): string {
        return `avam-geschaefte-page.state-key+${this.isAmm}`;
    }

    private getDataByType(): void {
        if (this.type === UnternehmenTypes.ANBIETER) {
            this.anbieterInit();
        } else {
            this.arbeitgeberInit();
        }
    }

    private observeUnternehmenId(getData: any): void {
        this.service.facade.spinnerService.activate(this.channel);
        this.activatedRoute.parent.params.subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
                getData();
            }
        });
    }

    private anbieterInit(): void {
        this.isAmm = true;
        this.service.rest
            .searchGeschaeftAnbieter(this.unternehmenId)
            .subscribe((response: BaseResponseWrapperListVerlaufGeKoAmmDTOWarningMessages) => this.setData(response.data), () => this.deactivateSpinnerAndScrollTop());
    }

    private arbeitgeberInit(): void {
        this.isAmm = false;
        this.service.rest
            .searchGeschaeftArbeitgeber(this.unternehmenId)
            .subscribe((response: BaseResponseWrapperListVerlaufGeKoArbeitgeberDTOWarningMessages) => this.setData(response.data), () => this.deactivateSpinnerAndScrollTop());
    }

    private setData(data: VerlaufGeKoAmmDTO[] | VerlaufGeKoArbeitgeberDTO[]): void {
        if (data) {
            this.dataSource = data;
            this.infopanelService.updateInformation({ tableCount: this.dataSource.length });
        }
        this.deactivateSpinnerAndScrollTop();
    }

    private deactivateSpinnerAndScrollTop(): void {
        OrColumnLayoutUtils.scrollTop();
        this.service.facade.spinnerService.deactivate(this.channel);
    }

    private initHeader(): void {
        this.infopanelService.updateInformation({ subtitle: 'geko.subnavmenuitem.geschaefte' });
        this.service.facade.toolboxService.sendConfiguration(ToolboxConfig.getGeKoArbeitgeberConfig(), this.channel);
        this.service.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => this.service.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource));
    }
}
