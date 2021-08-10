import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { Subscription } from 'rxjs';
import { ToolboxService } from '@app/shared';
import { ActivatedRoute } from '@angular/router';
import { FacadeService } from '@shared/services/facade.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GeschaeftMeldungDTO } from '@dtos/geschaeftMeldungDTO';
import { GekoMeldungService } from '@modules/geko/services/geko-meldung.service';
import { NotificationService } from 'oblique-reactive';
import { AbstractMeldungenResultForm } from '@shared/classes/abstract-meldungen-result-form';
import { GekoMeldungRestService } from '@core/http/geko-meldung-rest.service';

@Component({
    selector: 'avam-meldungen',
    templateUrl: './meldungen.component.html'
})
export class MeldungenComponent extends AbstractMeldungenResultForm implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;

    unternehmenId: number;
    permissions: typeof Permissions = Permissions;
    resultsData: GeschaeftMeldungDTO[];
    readonly stateKey = 'unternehmenMeldungenAnzeigen';
    readonly channel = 'unternehmen-meldungen-channel';
    private observePrint: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private facadeService: FacadeService,
        private infopanelService: AmmInfopanelService,
        protected modalService: NgbModal,
        protected gekoMeldungService: GekoMeldungService,
        protected gekoMeldungRestService: GekoMeldungRestService,
        protected readonly notificationService: NotificationService
    ) {
        super(modalService, gekoMeldungService, gekoMeldungRestService, notificationService);
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.activatedRoute.parent.params.subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
            this.initToolbox(this.unternehmenId);
            this.loadTableData();
        });
        this.observePrintAction();
    }

    ngOnDestroy(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.facadeService.toolboxService.sendConfiguration([]);
        this.observePrint.unsubscribe();
        super.ngOnDestroy();
    }

    isNameIncluded(): boolean {
        return false;
    }

    loadTableData() {
        this.subscribeToData();
        this.gekoMeldungService.callGetUnternehmenMeldungen(this.unternehmenId, this.geschaeftsbereichCode, this.channel);
    }

    subscribeToData() {
        this.gekoMeldungService.subject.pipe(takeUntil(this.unsubscribe)).subscribe((dtos: GeschaeftMeldungDTO[]) => {
            this.resultsData = dtos ? dtos : [];
            this.infopanelService.updateInformation({ subtitle: 'geko.pfad.meldungen.uebersicht', tableCount: this.resultsData.length });
        });
    }

    private initToolbox(unternehmenId: number): void {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getMeldungenConfig(), this.channel, ToolboxDataHelper.createByUnternehmenId(unternehmenId));
    }

    private observePrintAction(): void {
        this.observePrint = this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .subscribe(() => this.modalService.open(this.modalPrint, AbstractMeldungenResultForm.MODAL_PRINT_OPTIONS));
    }
}
