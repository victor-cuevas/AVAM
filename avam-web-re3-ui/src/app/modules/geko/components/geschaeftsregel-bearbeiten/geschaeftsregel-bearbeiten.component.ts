import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Unsubscribable } from 'oblique-reactive';
import { finalize, takeUntil } from 'rxjs/operators';
import { GekoRegelService } from '@shared/services/geko-regel.service';
import { ToolboxService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';
import { GeschaeftsregelFormComponent } from '@modules/geko/components/geschaeftsregel-form/geschaeftsregel-form.component';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { CoreInfoBarPanelService } from '@app/library/core/core-info-bar/core-info-bar-panel/core-info-bar-panel.service';
import { GeschaeftsregelnMainContainerComponent } from '@modules/geko/components/geschaeftsregeln-main-container/geschaeftsregeln-main-container.component';
import { ToolboxActionEnum, ToolboxEvent } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';

@Component({
    selector: 'avam-geschaeftsregel-bearbeiten',
    templateUrl: './geschaeftsregel-bearbeiten.component.html'
})
export class GeschaeftsregelBearbeitenComponent extends Unsubscribable implements DeactivationGuarded, OnDestroy, AfterViewInit {
    @ViewChild('form')
    form: GeschaeftsregelFormComponent;

    @ViewChild('spacer')
    spacer: TemplateRef<any>;

    channel: string;
    private regelId: number;

    constructor(
        private route: ActivatedRoute,
        private gekoRegelService: GekoRegelService,
        private facadeService: FacadeService,
        private infoBarPanelService: CoreInfoBarPanelService,
        private infopanelService: AmmInfopanelService
    ) {
        super();
        ToolboxService.CHANNEL = GeschaeftsregelnMainContainerComponent.CHANNEL;
        this.channel = GeschaeftsregelnMainContainerComponent.CHANNEL;
        this.gekoRegelService.dispatchHeader({ title: 'geko.subnavmenuitem.geschaeftsregelBearbeiten' });
        this.route.queryParamMap.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.regelId = parseInt(params.get('regelId'));
            this.facadeService.navigationService.showNavigationTreeRoute('./bearbeiten', { regelId: this.regelId });
        });

        this.configureToolbox();
    }

    fillForm() {
        this.loadGeschaeftsRegel(this.regelId);
    }

    private loadGeschaeftsRegel(regelId: number) {
        this.facadeService.spinnerService.activate(this.channel);
        this.gekoRegelService
            .loadGeschaeft(regelId)
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
            .subscribe(response => {
                const dto = response.data;

                this.infoBarPanelService.sendLastUpdate(dto);
                this.form.mapDtoToForm(dto);
            });
    }

    abbrechen() {
        this.form.abbrechen();
    }

    zuerecksetzen() {
        this.form.zuruecksetzen();
    }

    canDeactivate(): boolean {
        return this.form.isDirty();
    }

    save() {
        if (this.form.form.valid) {
            this.facadeService.fehlermeldungenService.closeMessage();
            this.facadeService.spinnerService.activate(this.channel);
            this.gekoRegelService
                .update(this.form.mapFormToDTO())
                .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
                .subscribe(response => {
                    if (response.data) {
                        this.facadeService.notificationService.success('common.message.datengespeichert');
                        this.form.mapDtoToForm(response.data);
                        this.form.form.markAsPristine();
                    }
                });
        } else {
            this.form.showError();
        }
    }

    delete() {
        const modal = this.facadeService.openModalFensterService.openDeleteModal();
        modal.result.then(result => {
            if (result) {
                this.doDelete();
            }
        });

        modal.componentInstance.titleLabel = 'i18n.common.delete';
        modal.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modal.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modal.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.navigationService.hideNavigationTreeRoute('./bearbeiten', { regelId: this.regelId });
        this.infoBarPanelService.sendLastUpdate(null);
    }

    private doDelete() {
        this.facadeService.spinnerService.activate(this.channel);
        this.gekoRegelService
            .delete(this.regelId)
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
            .subscribe(response => {
                if (response.data) {
                    this.facadeService.notificationService.success('common.message.datengeloescht');
                    this.gekoRegelService.navigateToGeschaeftsregelnAnzeigen();
                } else {
                    this.facadeService.notificationService.error(this.facadeService.dbTranslateService.instant('geko.error.opFailed.regelDelete'));
                }
            });
    }

    ngAfterViewInit(): void {
        this.infopanelService.sendTemplateToInfobar(this.spacer);
    }

    private configureToolbox() {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: { channel: any; message: ToolboxEvent }) => {
                switch (action.message.action) {
                    case ToolboxActionEnum.HISTORY:
                        this.facadeService.openModalFensterService.openHistoryModal(this.regelId.toString(), AvamCommonValueObjectsEnum.T_REGELGEKO);
                        break;

                    case ToolboxActionEnum.PRINT:
                        PrintHelper.print();
                        break;
                }
            });
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getGeschaeftsregelnBearbeitenConfig());
    }
}
