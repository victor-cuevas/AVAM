import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RahmenfristKaeSweService } from '@modules/arbeitgeber/services/rahmenfrist-kae-swe.service';
import { BaseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages } from '@dtos/baseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages';
import { FacadeService } from '@shared/services/facade.service';
import { RahmenfristKaeSweDetailDTO } from '@dtos/rahmenfristKaeSweDetailDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Unsubscribable } from 'oblique-reactive';
import { filter, takeUntil } from 'rxjs/operators';
import { RahmenfristKaeSweFormComponent } from '@modules/arbeitgeber/arbeitgeber-details/components/rahmenfrist-kae-swe-form/rahmenfrist-kae-swe-form.component';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxService } from '@app/shared';
import { ToolboxAction, ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';

@Component({
    selector: 'avam-rahmenfrist-kae-swe',
    templateUrl: './rahmenfrist-kae-swe.component.html'
})
export class RahmenfristKaeSweComponent extends Unsubscribable implements OnInit, OnDestroy {
    data: {
        dto: RahmenfristKaeSweDetailDTO;
    } = null;
    readonly rahmenfirstChannel = 'rahmenfrist-channel';
    @ViewChild('zahlungenModal') zahlungenModal: ElementRef;
    @ViewChild('formComponent') formComponent: RahmenfristKaeSweFormComponent;
    private static readonly SIDE_NAVI_ITEM_PATH = './rahmenfristen/anzeigen';
    private rahmenfristId: number;

    constructor(private route: ActivatedRoute, private rahmenfirstService: RahmenfristKaeSweService, private facadeService: FacadeService) {
        super();
    }

    ngOnInit(): void {
        this.observeRouteParameters();
        this.observePrintAction();
        this.observeLangChange();
        this.observeNavItemClose();
    }

    ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.resetConfiguration();
        super.ngOnDestroy();
    }

    onOpenRahmenfristDetails(): void {
        this.facadeService.openModalFensterService.openXLModal(this.zahlungenModal);
    }

    cancel(): void {
        this.hideNavigationTreeRoute();
        this.rahmenfirstService.redirectToParent(this.route);
    }

    zahlungenKaeSwe(): void {
        this.hideNavigationTreeRoute();
        this.rahmenfirstService.redirectToSibling(this.route, '../zahlungen', this.rahmenfristId);
    }

    private observeNavItemClose(): void {
        this.facadeService.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((message: { type: string; data: any }) => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.cancel();
                }
            });
    }

    private hideNavigationTreeRoute(): void {
        this.facadeService.navigationService.hideNavigationTreeRoute(RahmenfristKaeSweComponent.SIDE_NAVI_ITEM_PATH, this.getQueryParams());
    }

    private observeRouteParameters(): void {
        this.route.parent.params.subscribe((params: ParamMap) => {
            this.facadeService.toolboxService.sendConfiguration(
                ToolboxConfig.getRahmenfristKaeSweConfig(),
                this.rahmenfirstChannel,
                ToolboxDataHelper.createByUnternehmenId(+params['unternehmenId'])
            );
        });
        this.route.queryParamMap.subscribe((params: ParamMap) => {
            this.rahmenfristId = +params.get('rahmenfristId');
            this.facadeService.navigationService.showNavigationTreeRoute(RahmenfristKaeSweComponent.SIDE_NAVI_ITEM_PATH, this.getQueryParams());
            this.getData();
        });
    }

    private getQueryParams(): { rahmenfristId: number } {
        return { rahmenfristId: this.rahmenfristId };
    }

    private observeLangChange(): void {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.formComponent.mapToForm());
    }

    private getData(): void {
        this.rahmenfirstService.getRahmenfrist(this.rahmenfristId).subscribe(
            (response: BaseResponseWrapperRahmenfristKaeSweDetailDTOWarningMessages) => {
                this.data = {
                    dto: response.data
                };
                this.initHeader(response.data.rahmenfristNr);
                OrColumnLayoutUtils.scrollTop();
                this.facadeService.spinnerService.deactivate(this.rahmenfirstChannel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facadeService.spinnerService.deactivate(this.rahmenfirstChannel);
            }
        );
    }

    private initHeader(rahmenfristNr: number): void {
        const rahmenfristLabel = this.facadeService.translateService.instant('kaeswe.label.rahmenfristnr');
        this.rahmenfirstService.infopanelService.updateInformation({ subtitle: `${rahmenfristLabel}${rahmenfristNr}` });
    }

    private observePrintAction(): void {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter((action: ToolboxAction) => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => PrintHelper.print());
    }
}
