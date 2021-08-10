import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmPlanwertRestService } from '@app/modules/amm/planung/services/amm-planwert-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { CtrlwerteTableData, CtrlwerteTableDataRow } from '@app/shared/components/controllingwerte-table/controllingwerte-handler.service';
import { ControllingwerteTableComponent } from '@app/shared/components/controllingwerte-table/controllingwerte-table.component';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AufteilungBudgetjahrDTO } from '@app/shared/models/dtos-generated/aufteilungBudgetjahrDTO';
import { BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAufteilungBudgetjahrDTOWarningMessages';
import { BaseResponseWrapperListKantonDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListKantonDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { KantonDTO } from '@app/shared/models/dtos-generated/kantonDTO';
import { PlanwertMDTO } from '@app/shared/models/dtos-generated/planwertMDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { SubmitTypeEnum } from '../../submit-type.enum';

@Component({
    selector: 'avam-bew-massnahme-planwert-controllingwerte',
    templateUrl: './bew-massnahme-planwert-controllingwerte.component.html',
    styleUrls: ['./bew-massnahme-planwert-controllingwerte.component.scss']
})
export class BewMassnahmePlanwertControllingwerteComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('planwertControllingwerteTable') planwertControllingwerteTable: ControllingwerteTableComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    channel = 'massnahme-planwert-controllingwerte-page';
    tableData: CtrlwerteTableData;
    kantonDomainList: KantonDTO[];
    kostenverteilschluesselDomainList: CodeDTO[];
    institutionDomainList: CodeDTO[];
    lastData: AufteilungBudgetjahrDTO;
    planwertDto: PlanwertMDTO;
    unternehmen: UnternehmenDTO;
    planwertId: number;
    permissions: typeof Permissions = Permissions;
    submitType = SubmitTypeEnum;

    constructor(
        private facade: FacadeService,
        private bewRestService: BewirtschaftungRestService,
        private stesRestService: StesDataRestService,
        private route: ActivatedRoute,
        private planwertRestService: AmmPlanwertRestService,
        private infopanelService: AmmInfopanelService,
        private ammHelper: AmmHelper
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    public ngOnInit() {
        this.getRouteParams();
        this.getData();
    }

    public getRouteParams() {
        this.route.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.planwertId = +params['planwertId'];
        });
    }

    public getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages, any, BaseResponseWrapperListKantonDTOWarningMessages, CodeDTO[], CodeDTO[]>(
            this.bewRestService.getPlanwertControllingwerte(this.planwertId),
            this.planwertRestService.getPlanwert(this.planwertId, false),
            this.bewRestService.getAllKantoneForBudgetierung(),
            this.stesRestService.getCode(DomainEnum.KOSTENVERTEILSCHLUESSEL),
            this.stesRestService.getCode(DomainEnum.INSTITUTION)
        ).subscribe(
            ([ctrlwerteRes, planwertRes, kantoneRes, kostenverteilschluessel, institution]) => {
                this.lastData = ctrlwerteRes.data;
                this.planwertDto = planwertRes.data;
                this.kantonDomainList = kantoneRes.data;
                this.kostenverteilschluesselDomainList = kostenverteilschluessel;
                this.institutionDomainList = institution;
                this.setPageData(this.lastData);

                this.deactivateSpinnerAndScrollToTop();
            },
            () => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    public canDeactivate() {
        return this.planwertControllingwerteTable.formGroup.dirty || this.planwertControllingwerteTable.tableModified;
    }

    public reset() {
        if (this.canDeactivate()) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.planwertControllingwerteTable.tableModified = false;
                this.populateTableData(this.lastData);
            });
        }
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.resetTemplateInInfobar();
        this.infopanelService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
    }

    public berechnen() {
        this.bewRestService
            .calculatePlanwertControllingwerte(this.planwertId, this.getKostenverteilschluessel(), this.planwertControllingwerteTable.mergeDataForBE(this.lastData))
            .subscribe(
                response => {
                    if (response.data) {
                        this.populateTableData(response.data, false);
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.planundakqui.message.berechnet'));
                    }
                    this.deactivateSpinnerAndScrollToTop();
                },

                () => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    public submit(type: string) {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.planwertControllingwerteTable.formGroup.invalid) {
            this.planwertControllingwerteTable.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.facade.spinnerService.activate(this.channel);

        switch (type) {
            case this.submitType.BERECHNEN:
                this.berechnen();
                break;
            case this.submitType.SPEICHERN:
                this.save(this.planwertControllingwerteTable.mergeDataForBE(this.lastData));
                break;
            default:
                this.deactivateSpinnerAndScrollToTop();
                break;
        }
    }

    public save(data: AufteilungBudgetjahrDTO) {
        this.facade.spinnerService.activate(this.channel);
        this.bewRestService
            .savePlanwertControllingwerte(this.planwertId, this.getKostenverteilschluessel(), data)
            .pipe(
                map(
                    ctrlwerteRes => {
                        if (ctrlwerteRes && ctrlwerteRes.data) {
                            this.lastData = ctrlwerteRes.data;
                            this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                        }
                    },
                    () => {
                        this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                        this.deactivateSpinnerAndScrollToTop();
                    }
                ),
                switchMap(() => this.planwertRestService.getPlanwert(this.planwertId, false))
            )
            .subscribe(
                planwertData => {
                    if (planwertData && planwertData.data) {
                        this.planwertDto = planwertData.data;
                        this.setPageData(this.lastData);
                        this.planwertControllingwerteTable.formGroup.markAsPristine();
                        this.planwertControllingwerteTable.tableModified = false;
                    }

                    this.deactivateSpinnerAndScrollToTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    public deleteRow(row: CtrlwerteTableDataRow) {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);
        if (!row.newEntry) {
            this.bewRestService.deletePlanwertControllingwerteRow(this.planwertId, row.id, this.planwertControllingwerteTable.mergeDataForBE(this.lastData)).subscribe(
                response => {
                    if (response && response.data) {
                        this.lastData = response.data;
                        this.populateTableData(this.lastData);
                        this.planwertControllingwerteTable.formGroup.markAsPristine();
                        this.planwertControllingwerteTable.tableModified = false;
                        this.deactivateSpinnerAndScrollToTop();
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                    }
                },
                () => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
        } else {
            this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
            this.deactivateSpinnerAndScrollToTop();
        }
    }

    zurMassnahmenplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.planwertId, ElementPrefixEnum.PLANWERT_PREFIX);
    }

    private populateTableData(response: AufteilungBudgetjahrDTO, updateKostenverteilschluessel = true) {
        if (response) {
            this.tableData = {
                ctrlwerte: this.planwertControllingwerteTable.createTableData(response, this.institutionDomainList),
                kantone: this.kantonDomainList,
                kostenverteilschluessel: this.kostenverteilschluesselDomainList,
                institution: this.institutionDomainList,

                enabledFields: true,
                disableKostenverteilschluesselChecks: true
            };
            if (updateKostenverteilschluessel) {
                this.tableData.panelFormData = {
                    kostenverteilschluessel: this.planwertDto.kostenverteilschluessel
                };
            }
        }
    }

    private setPageData(param: AufteilungBudgetjahrDTO) {
        this.populateTableData(param);
        this.unternehmen = this.getUnternehmen();
        this.setupInfobar();
        this.configureToolbox();
        this.subscribeToToolbox();
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { PLANWERT_ID: this.planwertId }
        };
    }

    private subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    private setupInfobar() {
        this.infopanelService.dispatchInformation({
            title: this.facade.dbTranslateService.translateWithOrder(this.planwertDto.typ, 'text'),
            secondTitle: this.facade.dbTranslateService.translateWithOrder(this.planwertDto.massnahmeObject.produktObject, 'titel'),
            subtitle: 'amm.planung.subnavmenuitem.planwertControllingwerteLabel'
        });

        this.infopanelService.sendLastUpdate(this.facade.formUtilsService.getLastUpdated(this.lastData.aufteilungenGeldgeber));
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    private getUnternehmen(): UnternehmenDTO {
        if (this.planwertDto && this.planwertDto.massnahmeObject && this.planwertDto.massnahmeObject.ammAnbieterObject) {
            return this.planwertDto.massnahmeObject.ammAnbieterObject.unternehmen;
        }

        return undefined;
    }

    private getKostenverteilschluessel(): string {
        return this.planwertControllingwerteTable.getKostenverteilschluesselCode();
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
