import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { StesVermittlungsfaehigkeits } from '@shared/enums/stes-navigation-paths.enum';
import { InfoleistePanelService } from '@shared/services/infoleiste-panel.service';
import { Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { SachverhaltFormComponent } from '@stes/pages/vermittlungsfaehigkeit/sachverhalt-form/sachverhalt-form.component';
import { Permissions } from '@shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { SachverhaltStatusCodeEnum } from '@shared/enums/domain-code/sachverhaltstatus-code.enum';
import { first, takeUntil } from 'rxjs/operators';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { StesVermittlungsfaehigkeitService } from '@stes/services/stes-vermittlungsfaehigkeit.service';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FormUtilsService } from '@app/shared';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { VermittlungsfaehigkeitDTO } from '@dtos/vermittlungsfaehigkeitDTO';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { PermissionContextService } from '@shared/services/permission.context.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stes-sachverhalt',
    templateUrl: './stes-sachverhalt.component.html',
    styleUrls: ['./stes-sachverhalt.component.scss'],
    providers: [PermissionContextService]
})
export class StesSachverhaltComponent implements OnInit, OnDestroy, DeactivationGuarded {
    static stesVmfSachverhaltChannel = 'stesVmfSachverhaltChannel';
    @ViewChild('sachverhaltForm') sachverhaltForm: SachverhaltFormComponent;
    @ViewChild('actionColumnTemplate') actionColumnTemplate: TemplateRef<any>;
    stesId: string;
    sachverhaltId: string;
    isBearbeiten: boolean;
    sachverhaltChannel = 'sachverhaltChannel';
    sachverhaltToolboxId = 'sachverhalt-table';
    treeArray: TreeNodeInterface[] = [];
    treeOptions: TreeOptionInterface;
    permissions: typeof Permissions = Permissions;

    BSP21 = true;
    BSP22 = false;
    BSP23 = false;
    BSP24 = false;
    BSP25 = false;
    BSP26 = false;
    BSP27 = false;
    BSP29 = false;
    BSP4 = false;
    status: any;

    private unsubscribe$ = new Subject();
    private observeClickActionSub: Subscription;

    constructor(
        private infoleistePanelService: InfoleistePanelService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private previousRouteService: PreviousRouteService,
        private stesVermittlungsfaehigkeitService: StesVermittlungsfaehigkeitService,
        private dataService: StesDataRestService,
        private stesInfobarService: AvamStesInfoBarService,
        private interactionService: StesComponentInteractionService,
        private permissionContextService: PermissionContextService,
        private facade: FacadeService
    ) {
        ToolboxService.CHANNEL = StesSachverhaltComponent.stesVmfSachverhaltChannel;
        this.setRouteParams();
    }

    ngOnInit() {
        this.configureToolbox();
        this.setSideNav();
        this.treeOptions = {
            columnOrder: ['objekte', 'erfassungsdatum', 'status', 'frist', 'entscheiddatum', 'entscheid', 'zeit'],
            columnTitle: [
                'stes.vermittlungsfaehigkeit.header.objekte',
                'stes.vermittlungsfaehigkeit.header.erfassungsdatum',
                'stes.vermittlungsfaehigkeit.header.status',
                'stes.vermittlungsfaehigkeit.header.frist',
                'stes.vermittlungsfaehigkeit.header.entscheiddatum',
                'stes.vermittlungsfaehigkeit.header.entscheid',
                'stes.vermittlungsfaehigkeit.header.inderzeitvonbis'
            ],
            actions: { template: this.actionColumnTemplate }
        };

        this.infoleistePanelService.sendData({ showInfoIcon: this.isBearbeiten });
        if (this.isBearbeiten) {
            this.getData();
        } else {
            this.permissionContextService.getContextPermissionsWithStesId(+this.stesId);
            this.setInfobar(null);
        }

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.sachverhaltId, AvamCommonValueObjectsEnum.T_STES_VMF_SACHVERHALT);
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal();
            }
        });
        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent();
                }
            });
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.setInfobar(this.sachverhaltForm.savedSachverhalt);
            });
    }

    closeComponent() {
        if (this.router.url.includes(StesVermittlungsfaehigkeits.SACHVERHALT) || this.router.url.includes(StesVermittlungsfaehigkeits.SACHVERHALT_BEARBEITEN)) {
            this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit`]);
            this.hideSideNav();
        }
    }

    openDmsCopyModal() {
        this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_VMF_SACHVERHALT, this.sachverhaltId);
    }

    openHistoryModal(objId: string, objType: string) {
        this.facade.openModalFensterService.openHistoryModal(objId, objType);
    }

    setSideNav() {
        this.facade.navigationService.showNavigationTreeRoute(this.getSachverhaltPath(), { sachverhaltId: this.sachverhaltId });
    }

    hideSideNav() {
        this.facade.navigationService.hideNavigationTreeRoute(this.getSachverhaltPath(), { sachverhaltId: this.sachverhaltId });
    }

    getSachverhaltPath(): string {
        let path: string = StesVermittlungsfaehigkeits.SACHVERHALT_BEARBEITEN;
        this.activatedRoute.data.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.formNumber === StesFormNumberEnum.SACHVERHALT_ERFASSEN) {
                path = StesVermittlungsfaehigkeits.SACHVERHALT;
            }
        });
        return path;
    }

    setRouteParams() {
        this.activatedRoute.queryParamMap.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.sachverhaltId = params.get('sachverhaltId');
            this.isBearbeiten = !!this.sachverhaltId;
        });
        this.activatedRoute.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    configureToolbox() {
        let toolboxConfig = [];

        if (this.isBearbeiten) {
            const TOOLBOX_ACTIONS = [
                ToolboxActionEnum.EMAIL,
                ToolboxActionEnum.PRINT,
                ToolboxActionEnum.HELP,
                ToolboxActionEnum.DMS,
                ToolboxActionEnum.HISTORY,
                ToolboxActionEnum.COPY
            ];
            toolboxConfig = TOOLBOX_ACTIONS.map(action => new ToolboxConfiguration(action, true, true));
        } else {
            toolboxConfig = [
                // TODO: Add 'Zurück zur gespeicherten Liste' button when SUC 0765-005 is developed
                new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
            ];
        }
        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.sachverhaltToolboxId, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, +this.sachverhaltId));
    }

    ngOnDestroy(): void {
        if (!this.isBearbeiten) {
            this.hideSideNav();
        }
        this.facade.fehlermeldungenService.closeMessage();
        this.stesInfobarService.sendLastUpdate({}, true);
        this.facade.toolboxService.resetConfiguration();
        this.observeClickActionSub.unsubscribe();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public canDeactivate(): boolean {
        return this.sachverhaltForm.sachverhaltForm.dirty || this.sachverhaltForm.fallbearbeitungForm.dirty;
    }

    public generateTable(sachverhalt: VermittlungsfaehigkeitDTO): void {
        this.treeArray = this.stesVermittlungsfaehigkeitService.createTreeTableForBearbeiten(sachverhalt);
    }

    public onRowSelected(node: { model: TreeNodeInterface }) {
        const objectId = node.model.data['id'];
        const objectType: string = node.model.data['type'].toLowerCase();
        if (objectType === 'stellungnahme' || objectType === 'entscheid') {
            const parentId = node.model.data['parentId'];
            this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/${objectType}-bearbeiten`], {
                queryParams: { sachverhaltId: parentId, [`${objectType}Id`]: objectId }
            });
        } else {
            this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/sachverhalt-bearbeiten`], { queryParams: { sachverhaltId: objectId } });
        }
    }

    cancel(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.closeComponent();
        if (this.canDeactivate()) {
            this.checkConfirmationToCancel();
        } else {
            this.hideSideNav();
        }
    }

    reset(): void {
        this.sachverhaltForm.reset();
    }

    save(): void {
        this.sachverhaltForm.save();
    }

    updateFormValidation(updatedSachverhalt: VermittlungsfaehigkeitDTO) {
        if (updatedSachverhalt) {
            this.applyFormVerificationsBySachverhaltStatus(updatedSachverhalt);
        }
    }

    deleteWithConfirm() {
        const modalRef = this.facade.openModalFensterService.openDeleteModal();
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    public delete(): void {
        this.facade.spinnerService.activate(this.sachverhaltChannel);
        this.dataService
            .deleteVmfSachverhalt(this.stesId, this.sachverhaltId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                result => {
                    if (result.data == null && result.warning == null) {
                        this.markAsPristineForm();
                        this.facade.notificationService.success('common.message.datengeloescht');
                        this.hideSideNav();
                        this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit`]);
                    }
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                }
            );
    }

    markAsPristineForm(): void {
        this.sachverhaltForm.sachverhaltForm.markAsPristine();
        this.sachverhaltForm.sachverhaltForm.markAsUntouched();
        this.sachverhaltForm.fallbearbeitungForm.markAsPristine();
        this.sachverhaltForm.fallbearbeitungForm.markAsUntouched();
    }

    public retract(): void {
        this.facade.spinnerService.activate(this.sachverhaltChannel);
        this.dataService
            .zuruecknehmenSachverhalt(this.stesId, this.sachverhaltId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                result => {
                    if (result.data) {
                        this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                        this.updateFormAndApplyVerifications(result);
                    }
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                }
            );
    }

    public modify(): void {
        this.facade.fehlermeldungenService.closeMessage();
        const stesVmfSachverhaltDTO: VermittlungsfaehigkeitDTO = this.sachverhaltForm.mapToDTO();
        this.facade.spinnerService.activate(this.sachverhaltChannel);
        this.dataService
            .putSachverhaltUeberbereit(this.sachverhaltId, stesVmfSachverhaltDTO)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                response => {
                    if (response.data) {
                        this.updateFormAndApplyVerifications(response);
                    }
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                }
            );
    }

    public release(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.sachverhaltChannel);
        this.dataService
            .putVmfSachverhaltFreigegeben(this.stesId, this.sachverhaltId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                response => {
                    if (response.data) {
                        this.updateFormAndApplyVerifications(response);
                        this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    }
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                }
            );
    }

    public replace(): void {
        this.facade.spinnerService.activate(this.sachverhaltChannel);
        this.dataService
            .ersetzenVmfSachverhalt(this.stesId, this.sachverhaltId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                response => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                    if (response.data == null) {
                        return;
                    }
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.router.navigateByUrl(`stes/details/${this.stesId}/vermittlungsfaehigkeit/sachverhalt-bearbeiten`, { skipLocationChange: true }).then(() => {
                        this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/sachverhalt-bearbeiten`], { queryParams: { sachverhaltId: response.data } });
                        this.sachverhaltId = response.data;
                        this.getData();
                    });
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                }
            );
    }

    navigateTo(component: string) {
        this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/${component}`], { queryParams: { sachverhaltId: this.sachverhaltId } });
    }

    getData(): void {
        this.facade.spinnerService.activate(this.sachverhaltChannel);
        this.dataService
            .getVmfSachverhaltById(this.stesId.toString(), this.sachverhaltId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (response: { data: VermittlungsfaehigkeitDTO }) => {
                    if (!!response && !!response.data) {
                        this.sachverhaltForm.sachverhalt = response.data;
                        this.applyFormVerificationsBySachverhaltStatus(response.data);
                        this.generateTable(response.data);
                        this.setInfobar(response.data);
                        this.permissionContextService.getContextPermissions(response.data.ownerId);
                    }
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                }
            );
    }

    setInfobar(dto: VermittlungsfaehigkeitDTO): void {
        if (this.isBearbeiten) {
            const meldeDatum = this.facade.formUtilsService.formatDateNgx(dto.meldeDatum, FormUtilsService.GUI_DATE_FORMAT);
            this.stesInfobarService.sendDataToInfobar({
                title: this.facade.translateService.instant('stes.subnavmenuitem.stesvermittlungsfaehigkeit.sachverhalt-bearbeiten.infoleiste', { '0': meldeDatum })
            });
        } else {
            this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesvermittlungsfaehigkeit.sachverhalt-erfassen' });
        }

        this.isBearbeiten ? this.stesInfobarService.sendLastUpdate(dto) : this.stesInfobarService.sendLastUpdate({}, true);
    }

    applyFormVerificationsBySachverhaltStatus(responseSachVerhaltById: VermittlungsfaehigkeitDTO): void {
        //validate BSP21
        this.BSP21 = StesSachverhaltComponent.validateBSP21(responseSachVerhaltById);

        //validate BSP22
        this.BSP22 = StesSachverhaltComponent.validateBSP22(responseSachVerhaltById);

        //validate BSP23
        this.BSP23 = StesSachverhaltComponent.validateBSP23(responseSachVerhaltById);

        //validate BSP24
        this.BSP24 = StesSachverhaltComponent.validateBSP24(responseSachVerhaltById);

        //validate BSP25
        this.BSP25 = StesSachverhaltComponent.validateBSP25(responseSachVerhaltById);

        //validate BSP26
        this.BSP26 = StesSachverhaltComponent.validateBSP26(responseSachVerhaltById);

        //validate BSP27
        this.BSP27 = StesSachverhaltComponent.validateBSP27(responseSachVerhaltById);

        //validate BSP29
        this.BSP29 = StesSachverhaltComponent.validateBSP29(responseSachVerhaltById);

        //validate BSP4
        this.BSP4 = StesSachverhaltComponent.validateBSP4(responseSachVerhaltById);

        if (
            responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_FREIGABEBEREIT ||
            responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_FREIGEGEBEN ||
            responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_ERSETZT
        ) {
            this.sachverhaltForm.disableMeldedatum = true;
            this.sachverhaltForm.disableGrund = true;
            this.sachverhaltForm.disableUeberpruefung = true;
            this.sachverhaltForm.enableStatusCode(false);
            this.sachverhaltForm.disableBenutzerstellenId = true;
            this.sachverhaltForm.disableBearbeitung = true;
        } else {
            this.sachverhaltForm.disableMeldedatum = false;
            this.sachverhaltForm.disableGrund = false;
            this.sachverhaltForm.disableUeberpruefung = false;
            this.sachverhaltForm.enableStatusCode(true);
            this.sachverhaltForm.disableBenutzerstellenId = false;
            this.sachverhaltForm.disableBearbeitung = false;
        }
    }

    private static validateBSP4(responseSachVerhaltById: VermittlungsfaehigkeitDTO) {
        return !!responseSachVerhaltById.bearbeitung && !!responseSachVerhaltById.bearbeitung.benutzerstelleId;
    }

    private static validateBSP29(responseSachVerhaltById: VermittlungsfaehigkeitDTO) {
        return !!responseSachVerhaltById.alkTransferDate;
    }

    private static validateBSP27(responseSachVerhaltById: VermittlungsfaehigkeitDTO) {
        return responseSachVerhaltById.entscheidList.length > 0;
    }

    private static validateBSP26(responseSachVerhaltById: VermittlungsfaehigkeitDTO) {
        return (
            responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_ERSETZT ||
            (responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_FREIGEGEBEN &&
                responseSachVerhaltById.nachEntscheidObject &&
                !responseSachVerhaltById.ueberpruefung)
        );
    }

    private static validateBSP25(responseSachVerhaltById: VermittlungsfaehigkeitDTO) {
        const stellungnahmeListSize = responseSachVerhaltById.stellungnahmeList.length > 0;
        const entscheidListSize = responseSachVerhaltById.entscheidList.length > 0;
        return (
            (responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_FREIGEGEBEN &&
                !responseSachVerhaltById.nachEntscheidObject &&
                responseSachVerhaltById.ueberpruefung &&
                (stellungnahmeListSize || entscheidListSize)) ||
            (responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_FREIGEGEBEN &&
                responseSachVerhaltById.nachEntscheidObject &&
                responseSachVerhaltById.ueberpruefung)
        );
    }

    private static validateBSP24(responseSachVerhaltById: VermittlungsfaehigkeitDTO) {
        const stellungnahmeSize = responseSachVerhaltById.stellungnahmeList.length;
        const entscheidListSize = responseSachVerhaltById.entscheidList.length;
        return (
            responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_FREIGEGEBEN &&
            !responseSachVerhaltById.nachEntscheidObject &&
            responseSachVerhaltById.ueberpruefung &&
            stellungnahmeSize === 0 &&
            entscheidListSize === 0
        );
    }

    private static validateBSP23(responseSachVerhaltById: VermittlungsfaehigkeitDTO) {
        return (
            responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_FREIGEGEBEN &&
            !responseSachVerhaltById.nachEntscheidObject &&
            !responseSachVerhaltById.ueberpruefung
        );
    }

    private static validateBSP22(responseSachVerhaltById: VermittlungsfaehigkeitDTO) {
        return responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_FREIGABEBEREIT;
    }
    private static validateBSP21(responseSachVerhaltById: VermittlungsfaehigkeitDTO) {
        return (
            responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_PENDENT ||
            responseSachVerhaltById.statusCode.code === SachverhaltStatusCodeEnum.STATUS_UEBERARBEITUNG
        );
    }

    private updateFormAndApplyVerifications(response) {
        this.sachverhaltForm.sachverhalt = response.data;
        this.markAsPristineForm();
        this.applyFormVerificationsBySachverhaltStatus(response.data);
    }

    private checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideSideNav();
            }
        });
    }
}
