import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { filter, takeUntil } from 'rxjs/operators';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
// prettier-ignore
import {
    StellenAngeboteTableComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/vermittlung/stellen-angebote-table/stellen-angebote-table.component';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxService } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permissions } from '@shared/enums/permissions.enum';

@Component({
    selector: 'avam-stellenangebote',
    templateUrl: './stellenangebote.component.html'
})
export class StellenangeboteComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    @ViewChild('stellenAngeboteTable') stellenAngeboteTable: StellenAngeboteTableComponent;
    @ViewChild('stellenAngeboteTableModal') stellenAngeboteTableModal: StellenAngeboteTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    stellenangeboteChannel = 'stellenangebote';
    stellenangeboteData: any;
    unternehmenId: string;
    statusList: CodeDTO[];
    permissions: typeof Permissions = Permissions;
    private channel = 'stellenangebote-channel';

    constructor(
        protected route: ActivatedRoute,
        private router: Router,
        protected spinnerService: SpinnerService,
        protected stesDataRestService: OsteDataRestService,
        private infopanelService: AmmInfopanelService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private dataService: StesDataRestService,
        private translateService: TranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService
    ) {
        super();
    }

    ngAfterViewInit() {
        this.infopanelService.updateInformation({ subtitle: UnternehmenSideNavLabels.STELLENANGEBOTE });
        this.createSubscriptions();
        this.initToolBox();
        this.getData();
    }

    ngOnDestroy(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    getData() {
        this.spinnerService.activate(this.stellenangeboteChannel);
        forkJoin([this.dataService.getCode(DomainEnum.STATUS_OSTE), this.stesDataRestService.getOsteByUnternehmenId(this.unternehmenId)])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([statusList, responseData]) => {
                    this.statusList = statusList || [];
                    if (responseData.data) {
                        this.stellenangeboteData = responseData.data;
                        this.stellenAngeboteTable.setData(this.stellenangeboteData, this.statusList);
                        this.infopanelService.updateInformation({ tableCount: responseData.data.length });
                    }
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.stellenangeboteChannel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.stellenangeboteChannel);
                }
            );
    }

    umteilen(ids: Map<string, number>) {
        this.spinnerService.activate(this.stellenangeboteChannel);
        this.stesDataRestService
            .osteUmteilen(ids.get('osteId'), ids.get('unternehmenId'))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                () => {
                    this.router.navigate([`/arbeitgeber/details/${ids.get('unternehmenId')}/stellenangebote`]).then(() => this.getData());
                    this.notificationService.success('arbeitgeber.oste.message.stelleumgeteilt2');
                },
                () => this.spinnerService.deactivate(this.stellenangeboteChannel)
            );
    }

    private createSubscriptions() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            if (params['unternehmenId']) {
                this.unternehmenId = params['unternehmenId'];
            }
        });

        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.stellenAngeboteTable.setData(this.stellenangeboteData, this.statusList);
        });

        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.modalService.open(this.modalPrint, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' }));
    }

    private initToolBox(): void {
        this.toolboxService.sendConfiguration(ToolboxConfig.getStellenAngeboteConfig(), this.channel, ToolboxDataHelper.createForArbeitgeberllenangebot(+this.unternehmenId));
    }

    private stellenAngeboterfassen() {
        this.router.navigate(['./erfassen'], { relativeTo: this.route });
    }
}
