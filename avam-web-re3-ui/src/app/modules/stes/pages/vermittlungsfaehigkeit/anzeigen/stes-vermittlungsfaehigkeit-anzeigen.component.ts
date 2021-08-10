import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { Subscription } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { StesVermittlungsfaehigkeitService } from '@stes/services/stes-vermittlungsfaehigkeit.service';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stes-vermittlungsfaehigkeit-anzeigen',
    templateUrl: './stes-vermittlungsfaehigkeit-anzeigen.component.html',
    styleUrls: ['./stes-vermittlungsfaehigkeit-anzeigen.component.scss']
})
export class StesVermittlungsfaehigkeitAnzeigenComponent implements OnInit, OnDestroy, AfterViewInit {
    static stesVmfChannel = 'stesVmfResult';

    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('actionColumnTemplate') actionColumnTemplate: TemplateRef<any>;

    stesId: string;
    observeClickActionToolboxSub: Subscription;
    vermittlungsfaehigkeitToolboxId = 'vermittlungsfaehigkeit-table';

    permissions: typeof Permissions = Permissions;
    vmfData: TreeNodeInterface[] = [];
    vmfTableOptions: TreeOptionInterface;
    observeTranslateServiceSub: Subscription;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private dataRestService: StesDataRestService,
        private previousRouteService: PreviousRouteService,
        private componentInteraction: StesComponentInteractionService,
        private stesVermittlungsService: StesVermittlungsfaehigkeitService,
        private stesInfobarService: AvamStesInfoBarService,
        private facade: FacadeService
    ) {
        ToolboxService.CHANNEL = StesVermittlungsfaehigkeitAnzeigenComponent.stesVmfChannel;
    }

    ngOnInit() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesvermittlungsfaehigkeitsabklaerungen' });

        this.facade.fehlermeldungenService.closeMessage();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.getData();
    }

    public ngAfterViewInit() {
        this.facade.spinnerService.activate(StesVermittlungsfaehigkeitAnzeigenComponent.stesVmfChannel);
    }

    configureToolbox() {
        this.facade.toolboxService.sendConfiguration(
            [
                new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, true)
            ],
            this.vermittlungsfaehigkeitToolboxId,
            ToolboxDataHelper.createForStellensuchende(this.stesId)
        );
    }

    subscribeToToolbox() {
        this.observeClickActionToolboxSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    openPrintModal() {
        this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.vmfTableOptions);
    }

    ngOnDestroy() {
        this.facade.toolboxService.sendConfiguration([]);
        this.observeClickActionToolboxSub.unsubscribe();
        this.componentInteraction.resetDataLengthHeaderSubject();
        this.observeTranslateServiceSub.unsubscribe();
    }

    sachverhaltErfassen() {
        this.router.navigate([`./erfassen`], { relativeTo: this.route });
    }

    getFormNr(): string {
        return StesFormNumberEnum.VERMITTLUNG_FAEHIGKEIT;
    }

    onRowSelected(node: { model: TreeNodeInterface }) {
        const data = node.model.data;
        const objectType = data['type'];
        const objectId = data['id'];
        const parentId = objectType === 'STELLUNGNAHME' || objectType === 'ENTSCHEID' ? data['parentId'] : null;

        if (objectType === 'SACHVERHALT') {
            this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/sachverhalt-bearbeiten`], { queryParams: { sachverhaltId: objectId } });
        } else if (objectType === 'ENTSCHEID') {
            this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/entscheid-bearbeiten`], { queryParams: { sachverhaltId: parentId, entscheidId: objectId } });
        } else if (objectType === 'STELLUNGNAHME') {
            this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/stellungnahme-bearbeiten`], {
                queryParams: { sachverhaltId: parentId, stellungnahmeId: objectId }
            });
        }
    }

    updateDataLengthHeader(numItems: number) {
        this.componentInteraction.updateDataLengthHeaderSubject(numItems);
    }

    private getData() {
        this.dataRestService.getVmfSachverhalte(this.stesId).subscribe(
            response => {
                this.vmfData = this.stesVermittlungsService.createVmfTreeTableList(response.data);
                this.updateDataLengthHeader(this.vmfData.length);
                this.facade.spinnerService.deactivate(StesVermittlungsfaehigkeitAnzeigenComponent.stesVmfChannel);
                this.observeTranslateServiceSub = this.facade.translateService.onLangChange.subscribe(() => {
                    this.vmfData = this.stesVermittlungsService.createVmfTreeTableList(response.data);
                    this.updateDataLengthHeader(this.vmfData.length);
                });
                this.createVmfTableOptions();
                this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesvermittlungsfaehigkeitsabklaerungen', tableCount: response.data.length });
            },
            () => this.facade.spinnerService.deactivate(StesVermittlungsfaehigkeitAnzeigenComponent.stesVmfChannel)
        );
    }

    private createVmfTableOptions() {
        this.vmfTableOptions = {
            columnOrder: ['objekte', 'erfassungsdatum', 'meldedatum', 'status', 'frist', 'entscheiddatum', 'entscheid', 'zeit', 'stesId'],
            columnTitle: [
                'stes.vermittlungsfaehigkeit.header.objekte',
                'stes.vermittlungsfaehigkeit.header.erfassungsdatum',
                'stes.vermittlungsfaehigkeit.header.meldedatum',
                'stes.vermittlungsfaehigkeit.header.status',
                'stes.vermittlungsfaehigkeit.header.frist',
                'stes.vermittlungsfaehigkeit.header.entscheiddatum',
                'stes.vermittlungsfaehigkeit.header.entscheid',
                'stes.vermittlungsfaehigkeit.header.inderzeitvonbis',
                'stes.vermittlungsfaehigkeit.header.stesId'
            ],
            actions: {
                template: this.actionColumnTemplate
            }
        };
    }
}
