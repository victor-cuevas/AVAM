import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FacadeService } from '@app/shared/services/facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CtrlwerteTableData, CtrlwerteTableDataRow } from '@app/shared/components/controllingwerte-table/controllingwerte-handler.service';
import { ControllingwerteTableComponent } from '@app/shared/components/controllingwerte-table/controllingwerte-table.component';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { VertragswertDTO } from '@app/shared/models/dtos-generated/vertragswertDTO';
import { AufteilungBudgetjahrDTO } from '@app/shared/models/dtos-generated/aufteilungBudgetjahrDTO';
import { KantonDTO } from '@app/shared/models/dtos-generated/kantonDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { VertragswertMDTO } from '@app/shared/models/dtos-generated/vertragswertMDTO';
import { VertragswertDDTO } from '@app/shared/models/dtos-generated/vertragswertDDTO';
import { KostenverteilschluesselCode } from '@app/shared/enums/domain-code/kostenverteilschluessel-code.enum';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { Permissions } from '@shared/enums/permissions.enum';

@Component({
    selector: 'avam-vertragswert-controllingwerte',
    templateUrl: './vertragswert-controllingwerte.component.html'
})
export class VertragswertControllingwerteComponent implements OnInit, AfterViewInit, OnDestroy, DeactivationGuarded {
    static readonly CHANNEL_STATE_KEY = 'vertragswert-controllingwerte';

    public get CHANNEL_STATE_KEY() {
        return VertragswertControllingwerteComponent.CHANNEL_STATE_KEY;
    }

    @ViewChild('controllingwerteTable') controllingwerteTable: ControllingwerteTableComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    permissions: typeof Permissions = Permissions;

    anbieterId: number;
    vertragswertId: number;
    lvId: number;
    vertragswertDto: VertragswertDTO;
    tableData: CtrlwerteTableData;
    beTableData: AufteilungBudgetjahrDTO;
    kantoneDomainList: KantonDTO[];
    kostenverteilschluesselDomainList: CodeDTO[];
    institutionDomainList: CodeDTO[];
    isCtrlWerteBearbeitbar: boolean;
    titel: string;
    referencedObjectId: number;

    toolboxSubscription: Subscription;
    langSubscription: Subscription;
    vertragswertTypCodeEnum = VertragswertTypCodeEnum;
    kostenverteilschluesselTypCodeEnum = KostenverteilschluesselCode;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private facade: FacadeService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private vertraegeRestService: VertraegeRestService
    ) {
        ToolboxService.CHANNEL = this.CHANNEL_STATE_KEY;
    }

    ngOnInit() {
        this.route.parent.params.subscribe(data => {
            this.anbieterId = data['unternehmenId'];
        });

        this.route.queryParams.subscribe(params => {
            this.vertragswertId = +params['vertragswertId'];
            this.lvId = +params['lvId'];
        });

        this.updateInfopanel();
        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.appendToInforbar();
        });
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }

        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }

        this.facade.fehlermeldungenService.closeMessage();

        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.sendLastUpdate({}, true);
    }

    canDeactivate() {
        return this.controllingwerteTable.formGroup.dirty || this.controllingwerteTable.tableModified;
    }

    deleteRow(row: CtrlwerteTableDataRow) {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        if (!row.newEntry) {
            this.vertraegeRestService.deleteVertragswertControllingwerteRow(this.vertragswertId, row.id, this.controllingwerteTable.mergeDataForBE(this.beTableData)).subscribe(
                response => {
                    this.beTableData = response.data;
                    this.mapData(response.data);
                    this.controllingwerteTable.formGroup.markAsPristine();
                    this.controllingwerteTable.tableModified = false;

                    this.scrollToTopAndDeactivateSpinner();

                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                },
                () => {
                    this.scrollToTopAndDeactivateSpinner();
                }
            );
        } else {
            this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
            this.scrollToTopAndDeactivateSpinner();
        }
    }

    reset() {
        if (this.canDeactivate()) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.controllingwerteTable.tableModified = false;
                this.mapData(this.beTableData);
            });
        }
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.controllingwerteTable.formGroup.invalid) {
            this.controllingwerteTable.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.save();
    }

    calculate() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.controllingwerteTable.formGroup.invalid) {
            this.controllingwerteTable.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        this.vertraegeRestService
            .calculateVertragswertControllingwerte(
                this.vertragswertId,
                this.controllingwerteTable.getKostenverteilschluesselCode(),
                this.controllingwerteTable.mergeDataForBE(this.beTableData)
            )
            .subscribe(
                berechnenResponse => {
                    if (berechnenResponse.data) {
                        this.mapData(berechnenResponse.data, true);

                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.planundakqui.message.berechnet'));
                    }

                    this.scrollToTopAndDeactivateSpinner();
                },
                () => {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('amm.planundakqui.message.nichtberechnet'));
                    this.scrollToTopAndDeactivateSpinner();
                }
            );
    }

    zurMassnahme() {
        this.router.navigate(
            [`amm/bewirtschaftung/produkt/${(this.vertragswertDto as VertragswertMDTO).massnahmeObject.produktObject.produktId}/massnahmen/massnahme/grunddaten`],
            { queryParams: { massnahmeId: (this.vertragswertDto as VertragswertMDTO).massnahmeObject.massnahmeId } }
        );
    }

    zumKurs() {
        this.router.navigate(
            [
                `amm/bewirtschaftung/produkt/${
                    (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.massnahmeObject.produktObject.produktId
                }/massnahmen/massnahme/kurse/kurs/grunddaten`
            ],
            {
                queryParams: {
                    dfeId: (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.durchfuehrungsId,
                    massnahmeId: (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.massnahmeObject.massnahmeId
                }
            }
        );
    }

    zumStandort() {
        this.router.navigate(
            [
                `amm/bewirtschaftung/produkt/${
                    (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.massnahmeObject.produktObject.produktId
                }/massnahmen/massnahme/standorte/standort/grunddaten`
            ],
            {
                queryParams: {
                    dfeId: (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.durchfuehrungsId,
                    massnahmeId: (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.massnahmeObject.massnahmeId
                }
            }
        );
    }

    private getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        forkJoin([
            this.vertraegeRestService.getVertragswertControllingwerte(this.vertragswertId),
            this.vertraegeRestService.getVertragswertDetailById(this.vertragswertId, this.lvId),
            this.bewirtschaftungRestService.getAllKantoneForBudgetierung(),
            this.stesDataRestService.getCode(DomainEnum.KOSTENVERTEILSCHLUESSEL),
            this.stesDataRestService.getCode(DomainEnum.INSTITUTION)
        ]).subscribe(
            ([controllingwerteResponse, vertragswertResponse, kantoneResponse, kostenverteilschluesselOptionsResponse, institutionResponse]) => {
                this.vertragswertDto = vertragswertResponse.data;
                this.kantoneDomainList = kantoneResponse.data;
                this.kostenverteilschluesselDomainList = kostenverteilschluesselOptionsResponse;
                this.institutionDomainList = institutionResponse;

                this.appendToInforbar();
                const lastUpdatedObject = this.facade.formUtilsService.getLastUpdated(controllingwerteResponse.data.aufteilungenGeldgeber);
                this.infopanelService.sendLastUpdate(lastUpdatedObject);

                if (ToolboxService.CHANNEL === this.CHANNEL_STATE_KEY) {
                    this.configureToolbox();
                    this.toolboxSubscription = this.subscribeToToolbox();
                }

                this.beTableData = controllingwerteResponse.data;
                this.mapData(controllingwerteResponse.data);

                this.scrollToTopAndDeactivateSpinner();
            },
            () => {
                this.scrollToTopAndDeactivateSpinner();
            }
        );
    }

    private mapData(response: AufteilungBudgetjahrDTO, tableOnly = false) {
        if (response) {
            this.isCtrlWerteBearbeitbar = response.ctrlWerteBearbeitbar;

            this.tableData = {
                ctrlwerte: this.controllingwerteTable.createTableData(response, this.institutionDomainList),
                kantone: this.kantoneDomainList,
                kostenverteilschluessel: this.kostenverteilschluesselDomainList,
                institution: this.institutionDomainList,
                panelFormData: {
                    kostenverteilschluessel: tableOnly ? this.getCurrentKostenverteilschluessel() : this.vertragswertDto.kostenverteilschluessel
                },
                enabledFields: response.ctrlWerteBearbeitbar,
                geldgeberRequired: true,
                disableKostenverteilschluesselChecks: true
            };
        }
    }

    private getCurrentKostenverteilschluessel() {
        return this.kostenverteilschluesselDomainList.find(el => el.codeId === +this.controllingwerteTable.formGroup.controls.kostenverteilschluessel.value);
    }

    private save() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        const currentKostenverteilschluessel = this.kostenverteilschluesselDomainList.find(
            el => el.codeId === +this.controllingwerteTable.formGroup.controls.kostenverteilschluessel.value
        );

        this.vertraegeRestService
            .saveVertragswertControllingwerte(this.vertragswertId, currentKostenverteilschluessel.code, this.controllingwerteTable.mergeDataForBE(this.beTableData))
            .subscribe(
                response => {
                    if (response.data) {
                        this.getData();
                        this.controllingwerteTable.tableModified = false;
                        this.controllingwerteTable.formGroup.markAsPristine();

                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    } else {
                        this.scrollToTopAndDeactivateSpinner();
                    }
                },
                () => {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                    this.scrollToTopAndDeactivateSpinner();
                }
            );
    }

    private scrollToTopAndDeactivateSpinner() {
        OrColumnLayoutUtils.scrollTop();
        this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
    }

    private updateInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.subnavmenuitem.vertragswertControllingwerte'
        });
    }

    private appendToInforbar() {
        if (this.vertragswertDto.typ.code === VertragswertTypCodeEnum.MASSNAHME) {
            this.titel = this.facade.dbTranslateService.translateWithOrder((this.vertragswertDto as VertragswertMDTO).massnahmeObject, 'titel');
            this.referencedObjectId = (this.vertragswertDto as VertragswertMDTO).massnahmeObject.massnahmeId;
        } else {
            this.titel = this.facade.dbTranslateService.translateWithOrder((this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject, 'titel');
            this.referencedObjectId = (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.durchfuehrungsId;
        }

        this.infopanelService.appendToInforbar(this.infobarTemplate);
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.CHANNEL_STATE_KEY, this.getToolboxConfigData());
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { VERTRAGSWERT_ID: this.vertragswertId }
        };
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.controllingwerteTable.dataSource);
            }
        });
    }
}
