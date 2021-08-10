import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GeschaeftsregelFormComponent } from '@modules/geko/components/geschaeftsregel-form/geschaeftsregel-form.component';
import { RegelGeKoDTO } from '@dtos/regelGeKoDTO';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { GekoRegelService } from '@shared/services/geko-regel.service';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum, ToolboxEvent } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { Unsubscribable } from 'oblique-reactive';
import { FacadeService } from '@shared/services/facade.service';
import { GeschaeftsregelnMainContainerComponent } from '@modules/geko/components/geschaeftsregeln-main-container/geschaeftsregeln-main-container.component';

@Component({
    selector: 'avam-geschaeftsregel-erfassen',
    templateUrl: './geschaeftsregel-erfassen.component.html'
})
export class GeschaeftsregelErfassenComponent extends Unsubscribable implements OnDestroy, OnInit, DeactivationGuarded {
    @ViewChild('form')
    form: GeschaeftsregelFormComponent;

    channel: string;

    constructor(
        private regelService: GekoRegelService,
        private toolboxService: ToolboxService,
        private infopanelService: AmmInfopanelService,
        private gekoRegelService: GekoRegelService,
        private facadeService: FacadeService
    ) {
        super();
        ToolboxService.CHANNEL = GeschaeftsregelnMainContainerComponent.CHANNEL;
        this.channel = GeschaeftsregelnMainContainerComponent.CHANNEL;
        this.facadeService.navigationService.showNavigationTreeRoute('./erfassen');
    }

    ngOnInit() {
        this.initHeader();
        this.configureToolboxHeader();
    }

    abbrechen() {
        this.form.abbrechen();
    }

    zuerecksetzen() {
        this.form.zuruecksetzen();
    }

    save() {
        if (this.form.form.valid) {
            this.facadeService.fehlermeldungenService.closeMessage();
            this.facadeService.spinnerService.activate(this.channel);
            this.regelService
                .create(this.form.mapFormToDTO())
                .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
                .subscribe(response => {
                    if (response.data) {
                        this.facadeService.notificationService.success('common.message.datengespeichert');
                        this.form.form.markAsPristine();
                        this.gekoRegelService.navigateToGeschaeftsregelBearbeiten(response.data.regelId);
                    }
                });
        } else {
            this.form.showError();
        }
    }

    canDeactivate(): boolean {
        return this.form.isDirty();
    }

    private configureToolboxHeader() {
        this.gekoRegelService.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: { channel: any; message: ToolboxEvent }) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
        this.toolboxService.sendConfiguration(ToolboxConfig.getGeschaeftsregelnErfassenConfig());
    }

    private initHeader() {
        this.gekoRegelService.dispatchHeader({ title: 'geko.subnavmenuitem.geschaeftsregelErfassen' });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.toolboxService.resetConfiguration();
        this.facadeService.navigationService.hideNavigationTreeRoute('./erfassen');
        this.facadeService.fehlermeldungenService.closeMessage();
    }
}
