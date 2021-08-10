import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmAnbieterDTO } from '@app/shared/models/dtos-generated/ammAnbieterDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnbieterZertifikateFormComponent, AnbieterZertifikateFormData } from '../../../components/anbieter-zertifikate-form/anbieter-zertifikate-form.component';

@Component({
    selector: 'avam-anbieter-zertifikate',
    templateUrl: './anbieter-zertifikate.component.html',
    styleUrls: ['./anbieter-zertifikate.component.scss'],
    providers: [PermissionContextService]
})
export class AnbieterZertifikateComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('zertifikateForm') zertifikateForm: AnbieterZertifikateFormComponent;

    channel = 'amm-anbieter-zertifikate';
    unternehmenId: number;
    zertifikateFormData: AnbieterZertifikateFormData;
    permissions: typeof Permissions = Permissions;

    constructor(
        private infopanelService: AmmInfopanelService,
        private route: ActivatedRoute,
        private ammRest: AmmRestService,
        private spinnerService: SpinnerService,
        private stesRest: StesDataRestService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private permissionContextService: PermissionContextService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getUnternehmenId();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.getData();
    }

    getUnternehmenId() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            this.unternehmenId = data['unternehmenId'];
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { UNTERNEHMEN_ID: this.unternehmenId }
        };
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal(this.unternehmenId.toString());
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.unternehmenId.toString());
                }
            });
    }

    openDmsCopyModal(id: string) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;
        comp.context = DmsMetadatenContext.DMS_CONTEXT_AMM_ANBIETER;
        comp.id = id;
    }

    openHistoryModal(objId: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.type = AvamCommonValueObjectsEnum.T_AMM_ANBIETER;
        comp.id = objId;
    }

    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin(this.ammRest.getAnbieter(this.unternehmenId), this.stesRest.getCode(DomainEnum.ZERTIFIZIERUNG_ANBIETER)).subscribe(
            ([anbieter, options]) => {
                this.zertifikateFormData = {
                    anbieterDto: { ...anbieter.data },
                    zertifikateOptions: [...options]
                };
                this.permissionContextService.getContextPermissions(this.zertifikateFormData.anbieterDto.ownerId);
                this.updateInfopanel(this.zertifikateFormData.anbieterDto);

                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    updateInfopanel(dto: AmmAnbieterDTO) {
        this.infopanelService.updateInformation({
            subtitle: 'amm.anbieter.label.zertifikate',
            hideInfobar: false
        });
        this.infopanelService.sendLastUpdate(dto);
    }

    reset() {
        this.zertifikateForm.reset();
    }

    onSave() {
        this.fehlermeldungenService.closeMessage();

        if (!this.zertifikateForm.getValidState()) {
            this.zertifikateForm.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.update();
    }

    update() {
        this.spinnerService.activate(this.channel);

        this.ammRest.updateAnbieterZertifikate(this.zertifikateForm.mapToDto()).subscribe(
            res => {
                if (res.data) {
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.zertifikateFormData = { ...this.zertifikateFormData, anbieterDto: res.data };
                    this.updateInfopanel(this.zertifikateFormData.anbieterDto);
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    canDeactivate() {
        return this.zertifikateForm.getDirtyState();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.sendLastUpdate({}, true);
    }
}
