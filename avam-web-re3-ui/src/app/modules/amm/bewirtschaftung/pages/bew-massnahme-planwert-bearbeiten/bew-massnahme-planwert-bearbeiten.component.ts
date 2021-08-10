import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmPlanwertRestService } from '@app/modules/amm/planung/services/amm-planwert-rest.service';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { PlanwerttypEnum } from '@app/shared/enums/domain-code/planwerttyp.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperPlanwertDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperPlanwertDTOWarningMessages';
import { PlanwertDTO } from '@app/shared/models/dtos-generated/planwertDTO';
import { PlanwertMDTO } from '@app/shared/models/dtos-generated/planwertMDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { BewPlanwertFormComponent } from '../../components';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { AmmPlanwertStorageService } from '../../services/bew-planwerte-storage.service';

@Component({
    selector: 'avam-bew-massnahme-planwert-bearbeiten',
    templateUrl: './bew-massnahme-planwert-bearbeiten.component.html',
    styleUrls: ['./bew-massnahme-planwert-bearbeiten.component.scss']
})
export class BewMassnahmePlanwertBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('planwertFormComponent') planwertFormComponent: BewPlanwertFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    planwertData: PlanwertMDTO;
    channel = 'massnahme-planwert-bearbeiten-channel';
    massnahmeId: number;
    planwertId: number;
    unternehmen: UnternehmenDTO;
    permissions: typeof Permissions = Permissions;
    produktId: number;

    constructor(
        private route: ActivatedRoute,
        private facade: FacadeService,
        private planwertRestService: AmmPlanwertRestService,
        private infopanelService: AmmInfopanelService,
        private bewRestService: BewirtschaftungRestService,
        private bewNavigationHelper: AmmBewirtschaftungNavigationHelper,
        private planwertStorage: AmmPlanwertStorageService,
        private router: Router,
        private ammHelper: AmmHelper
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteData();
        this.getData();
        this.configureToolbox();
        this.subscribeToToolbox();
    }

    getRouteData() {
        this.route.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
            this.planwertId = +params['planwertId'];
        });

        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.produktId = +params['produktId'];
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);
        this.planwertRestService.getPlanwert(this.planwertId, true).subscribe(
            resp => {
                this.handleResponse(resp);
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    setupInfobar(data: PlanwertDTO) {
        this.infopanelService.dispatchInformation({
            title: this.facade.dbTranslateService.translateWithOrder(this.planwertData.typ, 'text'),
            secondTitle: this.facade.dbTranslateService.translateWithOrder(this.planwertData.massnahmeObject.produktObject, 'titel'),
            subtitle: 'amm.planung.subnavmenuitem.planwertDetailLabel'
        });
        this.infopanelService.sendLastUpdate(data);

        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    getUnternehmen(): UnternehmenDTO {
        if (this.planwertData && this.planwertData.massnahmeObject && this.planwertData.massnahmeObject.ammAnbieterObject) {
            return this.planwertData.massnahmeObject.ammAnbieterObject.unternehmen;
        }

        return undefined;
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { PLANWERT_ID: this.planwertId }
        };
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.facade.openModalFensterService.openHistoryModal(
                        this.planwertId.toString(),
                        AvamCommonValueObjectsEnum.T_PLANWERT,
                        'wertTripelObject:amm.planundakqui.label.werttripel'
                    );
                }
            });
    }

    canDeactivate() {
        return this.planwertFormComponent.formGroup.dirty;
    }

    reset() {
        this.planwertFormComponent.reset();
    }

    openDeleteDialog() {
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

    delete() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);
        this.bewRestService.deletePlanwert(this.planwertId).subscribe(
            res => {
                if (!res.warning) {
                    const shouldNavigateToUebersicht = this.planwertStorage.shouldNavigateToUebersicht;
                    this.planwertFormComponent.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                    this.bewNavigationHelper.hidePlanwertStaticNavigation(PlanwerttypEnum.MASSNAHME);
                    if (shouldNavigateToUebersicht) {
                        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/planwerte`], {
                            queryParams: { massnahmeId: this.planwertData['massnahmeObject'].massnahmeId }
                        });
                    } else {
                        window.history.back();
                    }
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    submit(type: string) {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.planwertFormComponent.formGroup.valid) {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.planwertFormComponent.ngForm.onSubmit(undefined);
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        switch (type) {
            case 'berechnen':
                this.berechnen();
                break;
            case 'speichern':
                this.openConfirmSaveModal();
                break;
            default:
                break;
        }
    }

    berechnen() {
        this.facade.spinnerService.activate(this.channel);
        this.bewRestService.calculatePlanwert(this.planwertFormComponent.mapToDTO()).subscribe(res => this.handleResponse(res), () => this.deactivateSpinnerAndScrollTop());
    }

    speichern() {
        this.facade.spinnerService.activate(this.channel);
        this.bewRestService.savePlanwert(this.planwertFormComponent.mapToDTO()).subscribe(
            res => {
                this.handleResponse(res);
                if (!(res.warning && res.warning.some(w => w.key === 'DANGER'))) {
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                }
            },
            () => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    openConfirmSaveModal() {
        const controls = this.planwertFormComponent.formGroup.controls;
        const fetchedGueltigVon = this.facade.formUtilsService.parseDate(this.planwertData.gueltigVon).getFullYear();
        const formGueltigVon = this.facade.formUtilsService.parseDate(controls.gueltigVon.value).getFullYear();
        const fetchedGueltigBis = this.facade.formUtilsService.parseDate(this.planwertData.gueltigBis).getFullYear();
        const formGueltigBis = this.facade.formUtilsService.parseDate(controls.gueltigBis.value).getFullYear();

        if (fetchedGueltigVon !== formGueltigVon || fetchedGueltigBis !== formGueltigBis) {
            this.openSaveDialog();
            return;
        }

        this.speichern();
    }

    openSaveDialog() {
        const modalRef = this.facade.openModalFensterService.openDeleteModal();
        modalRef.result.then(result => {
            if (result) {
                this.speichern();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.save';
        modalRef.componentInstance.promptLabel = 'amm.akquisition.message.planwertwirklichspeichern';
        modalRef.componentInstance.primaryButton = 'common.button.jaSpeichern';
        modalRef.componentInstance.secondaryButton = 'common.button.nichtSpeichern';
    }

    setValidatorsOnDurchfuehrungVonBis(dto: PlanwertMDTO) {
        const gueltigVon = dto.massnahmeObject.gueltigVon;
        const gueltigBis = dto.massnahmeObject.gueltigBis;
        //val313
        this.planwertFormComponent.formGroup
            .get('gueltigVon')
            .setValidators([DateValidator.isDateWithinRange(gueltigVon, gueltigBis, 'val277'), Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.planwertFormComponent.formGroup
            .get('gueltigBis')
            .setValidators([DateValidator.isDateWithinRange(gueltigVon, gueltigBis, 'val277'), Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.planwertFormComponent.formGroup.get('gueltigVon').updateValueAndValidity();
        this.planwertFormComponent.formGroup.get('gueltigBis').updateValueAndValidity();
    }

    handleResponse(res: BaseResponseWrapperPlanwertDTOWarningMessages) {
        this.planwertData = res.data;
        this.setupInfobar(this.planwertData);
        this.unternehmen = this.getUnternehmen();
        this.setValidatorsOnDurchfuehrungVonBis(res.data);

        this.deactivateSpinnerAndScrollTop();
    }

    deactivateSpinnerAndScrollTop() {
        OrColumnLayoutUtils.scrollTop();
        this.facade.spinnerService.deactivate(this.channel);
    }

    zurMassnahmenplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.planwertId, ElementPrefixEnum.PLANWERT_PREFIX);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.planwertStorage.shouldNavigateToUebersicht = false;
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.resetTemplateInInfobar();
        this.infopanelService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
    }
}
