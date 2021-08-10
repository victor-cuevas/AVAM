import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmAdministrationRestService } from '@app/modules/amm/administration/services/amm-administration-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RahmenvertragData, RahmenvertragFormComponent } from '../../../components/rahmenvertrag-form/rahmenvertrag-form.component';
import { RahmenvertragService } from '../../../services/rahmenvertrag.service';

@Component({
    selector: 'avam-rahmenvertrag-erfassen',
    templateUrl: './rahmenvertrag-erfassen.component.html',
    styleUrls: ['./rahmenvertrag-erfassen.component.scss']
})
export class RahmenvertragErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('rahmenvertragForm') rahmenvertragForm: RahmenvertragFormComponent;
    tableDataSource = [];
    rahmenvertragData: RahmenvertragData;
    channel = 'rahmenvertrag-erfassen-channel';
    unternehmenId: number;
    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum: typeof AmmButtonsTypeEnum = AmmButtonsTypeEnum;

    constructor(
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private route: ActivatedRoute,
        private router: Router,
        private vertraegeRestService: VertraegeRestService,
        private rahmenvertragService: RahmenvertragService,
        private administrationRestService: AmmAdministrationRestService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.showSideNavigation();
        this.subscribeToNavClose();
        this.configureToolbox();
        this.initInfopanel();
        this.subscribeToToolbox();
        this.getData();
        this.getUnternehmenId();
    }

    getUnternehmenId() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            this.unternehmenId = data['unternehmenId'];
        });
    }

    showSideNavigation() {
        this.facade.navigationService.showNavigationTreeRoute('./rahmenvertraege/erfassen');
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);
        const gueltigVon = new Date();

        forkJoin(
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VIERAUGENSTATUS),
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS),
            this.administrationRestService.getGesetzlicheMassnahmentypListeOhneSpez(gueltigVon),
            this.vertraegeRestService.getRahmenvertragButtons(0)
        ).subscribe(
            ([statusOptionsResponse, gueltigOptionsResponse, massnahmeOptionsResponse, buttons]) => {
                this.buttons.next(buttons.data);

                this.rahmenvertragData = { statusOptions: statusOptionsResponse, gueltigOptions: gueltigOptionsResponse, massnahmeOptions: massnahmeOptionsResponse.data };

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    canDeactivate() {
        return this.rahmenvertragForm.formGroup.dirty;
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    initInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.kopfzeile.rahmenvertragerstellen'
        });
    }

    subscribeToNavClose() {
        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.cancel();
                }
            });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.navigationService.hideNavigationTreeRoute('./rahmenvertraege/erfassen');
    }

    cancel() {
        this.router.navigate([`amm/anbieter/${this.unternehmenId}/rahmenvertraege`]);
    }

    reset() {
        this.rahmenvertragForm.reset();
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.rahmenvertragForm.formGroup.invalid) {
            this.rahmenvertragForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.facade.spinnerService.activate(this.channel);

        this.vertraegeRestService.saveRahmenvertrag(this.rahmenvertragForm.mapToDTO(this.unternehmenId)).subscribe(
            response => {
                if (response.data) {
                    this.rahmenvertragForm.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.rahmenvertragService.setNavigateToUebersicht(true);
                    this.router.navigate([`/amm/anbieter/${this.unternehmenId}/rahmenvertraege/bearbeiten`], {
                        queryParams: { rahmenvertragId: response.data.rahmenvertragId }
                    });
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }
}
