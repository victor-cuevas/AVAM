import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { LeistungsvereinbarungDTO } from '@dtos/leistungsvereinbarungDTO';
import { map, switchMap } from 'rxjs/operators';
import { StrukturElementDTO } from '@dtos/strukturElementDTO';
import { TreeNodeInterface } from './../../../../../../../../library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { Component, ViewChild, TemplateRef, AfterViewInit, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FacadeService } from '@shared/services/facade.service';
import { VertragswertErfassenWizardService } from '@shared/components/new/avam-wizard/vertragswert-erfassen-wizard.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { PlanwertSuchenParameterDTO } from '@dtos/planwertSuchenParameterDTO';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { PlzDTO } from '@dtos/plzDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@shared/services/toolbox.service';
import { Router } from '@angular/router';
import { Node } from '@shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import * as uuidv4 from 'uuid/v4';
import * as moment from 'moment';
import { VertragswertErfassenTreeTableComponent, VwErfassenTableDataRow } from '../../components/vertragswert-erfassen-tree-table/vertragswert-erfassen-tree-table.component';

@Component({
    selector: 'avam-objekt-auswaehlen',
    templateUrl: './objekt-auswaehlen.component.html'
})
export class ObjektAuswaehlenComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('treeTable') treeTable: VertragswertErfassenTreeTableComponent;

    langSubscription: Subscription;
    unternehmenDTO: UnternehmenDTO;
    strasseInfo: string;
    postfachInfo: string | number;
    burNrToDisplay: string | number;
    observeClickActionSub: Subscription;
    rawTableData: StrukturElementDTO;
    tableData: TreeNodeInterface[];
    isPlanwertUebernehmenChecked = false;
    disablePlanwertUebernehmenCheckbox = true;
    tableOptions: TreeOptionInterface = {};
    tableOptionsForPrinting: TreeOptionInterface = {};

    constructor(
        public wizardService: VertragswertErfassenWizardService,
        private infopanelService: AmmInfopanelService,
        private facade: FacadeService,
        private vertraegeRestService: VertraegeRestService,
        private anbieterRestService: AnbieterRestService,
        private dbTranslateService: DbTranslateService,
        private router: Router
    ) {}

    ngOnInit() {
        const nextStep = new Observable<boolean>(subscriber => {
            this.submit(() => {
                subscriber.next(true);
            });
        });

        this.wizardService.setOnNextStep(nextStep);
    }

    ngAfterViewInit() {
        if (this.wizardService.hasTreeTableState) {
            this.facade.spinnerService.activate(this.wizardService.channel);
            this.tableData = [...this.wizardService.tableDataState];
            this.isPlanwertUebernehmenChecked = this.wizardService.isPlanwertUebernehmenCheckedState;
            this.unternehmenDTO = this.wizardService.leistungsvereinbarungDTO.anbieterObject.unternehmen;
            this.appendToInforbar();
            this.facade.spinnerService.deactivate(this.wizardService.channel);
            this.disablePlanwertUebernehmenCheckbox = false;
            this.tableOptions = { flatTreeState: this.wizardService.expansionState };
        } else {
            this.getData();
            this.tableOptions = { initialExpansionLevel: 1 };
        }

        this.configureToolbox();
        this.initInfopanel();

        this.wizardService.isWizardNext = false;

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.initInfopanel();
            this.appendToInforbar();
            this.tableOptions = { flatTreeState: this.treeTable.getFlattenTreeData() };
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        this.anbieterRestService
            .getLeistungsvereinbarungById(this.wizardService.leistungsvereinbarungId)
            .pipe(
                map(lvResponse => {
                    if (lvResponse.data) {
                        this.wizardService.leistungsvereinbarungDTO = lvResponse.data;
                        this.unternehmenDTO = this.wizardService.leistungsvereinbarungDTO.anbieterObject.unternehmen;
                        this.appendToInforbar();
                    }

                    return this.wizardService.leistungsvereinbarungDTO;
                }),
                switchMap((lvDto: LeistungsvereinbarungDTO) => this.anbieterRestService.getMassnahmeStruktur(this.createMassnahmeStrukturParams(lvDto)))
            )
            .subscribe(
                treeTableDatаResponse => {
                    if (treeTableDatаResponse.data) {
                        this.rawTableData = treeTableDatаResponse.data;
                        this.tableData = [this.buildTree(this.rawTableData)];
                    }

                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.wizardService.channel);
                    this.disablePlanwertUebernehmenCheckbox = false;
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.wizardService.channel);
                    this.disablePlanwertUebernehmenCheckbox = false;
                }
            );
    }

    submit(onDone?) {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.wizardService.selectedTreeTableItem) {
            this.facade.fehlermeldungenService.showMessage('amm.akquisition.message.selectonemassnahmenelement', 'danger');
            OrColumnLayoutUtils.scrollTop();
        } else if (this.isPlanwertUebernehmenChecked) {
            this.setStates();
            this.save(onDone);
        } else {
            this.setStates();
            onDone();
        }
    }

    save(onDone?) {
        this.facade.spinnerService.activate(this.wizardService.channel);
        this.vertraegeRestService.searchPlanwerteForVertragswert(this.wizardService.planwertSuchenParameterDTO, this.wizardService.selectedTreeTableItem.voClass).subscribe(
            response => {
                if (response.data) {
                    this.wizardService.planwertTableData = response.data;

                    if (onDone) {
                        onDone();
                    }
                } else {
                    this.facade.fehlermeldungenService.showMessage('amm.akquisition.message.noplanwertexists', 'danger');
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            }
        );
    }

    cancel() {
        this.facade.fehlermeldungenService.closeMessage();

        this.router.navigate([`/amm/anbieter/${this.wizardService.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
            queryParams: { lvId: this.wizardService.leistungsvereinbarungId }
        });
    }

    itemSelected(selectedItem: VwErfassenTableDataRow) {
        this.wizardService.selectedTreeTableItem = selectedItem;
        this.wizardService.displayLeaveConfirmation = true;

        if (selectedItem) {
            if (this.isPlanwertUebernehmenChecked) {
                this.wizardService.disableStep(2);
            }

            this.wizardService.planwertSuchenParameterDTO = {
                parentId: selectedItem.voId,
                gueltigVon: selectedItem.gueltigVon,
                gueltigBis: selectedItem.gueltigBis
            };
        }
    }

    onPlanwertUebernehmenChange(isChecked: boolean) {
        this.isPlanwertUebernehmenChecked = isChecked;
        this.wizardService.displayLeaveConfirmation = true;

        if (!isChecked) {
            this.wizardService.selectedPlanwert = null;
            this.wizardService.disableStep(1);

            if (this.wizardService.hasTreeTableState) {
                this.wizardService.enableStep(2);
            }
        } else if (this.wizardService.hasTreeTableState) {
            if (!this.wizardService.isPlanwertUebernehmenCheckedState) {
                this.wizardService.disableStep(2);
            }

            this.wizardService.enableStep(1);
            this.wizardService.disableStep(2);
        }
    }

    moveToStep() {
        if (this.isPlanwertUebernehmenChecked) {
            this.wizardService.moveNext();
        } else {
            this.wizardService.selectedPlanwert = null;
            this.wizardService.disableStep(1);
            this.wizardService.movePosition(2);
        }
    }

    ngOnDestroy(): void {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.langSubscription.unsubscribe();
        this.observeClickActionSub.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
    }

    private buildTree(strukturelement: StrukturElementDTO): Node<VwErfassenTableDataRow> {
        const parent: Node<VwErfassenTableDataRow> = new Node(uuidv4(), this.createNodeData(strukturelement));

        if (strukturelement.nachfolgerElementList) {
            strukturelement.nachfolgerElementList.forEach(element => {
                parent.addChild(this.buildTree(element));
            });
        }

        return parent;
    }

    private createNodeData(strukturEl: any): VwErfassenTableDataRow {
        const nodeData: VwErfassenTableDataRow = this.initializeEmptyNodeData();

        nodeData.titelDe = strukturEl.elementNameDe;
        nodeData.titelFr = strukturEl.elementNameFr;
        nodeData.titelIt = strukturEl.elementNameIt;
        nodeData.gueltigVon = strukturEl.gueltigVon;
        nodeData.gueltigBis = strukturEl.gueltigBis;
        nodeData.voId = strukturEl.voId;
        nodeData.voClass = strukturEl.voClass;
        nodeData.voIdAttribute = strukturEl.voIdAttribute;
        nodeData.inVertragswertVerwaltungAuswaehlbar = strukturEl.inVertragswertVerwaltungAuswaehlbar;

        if (strukturEl.aSession) {
            nodeData.inVertragswertVerwaltungAuswaehlbar = this.setIsAuswaehlbar(strukturEl);
        }

        return nodeData;
    }

    private setIsAuswaehlbar(element: any): boolean {
        const isAuswaehlbar = element.inVertragswertVerwaltungAuswaehlbar;
        let isAuswaehlbarAufgrundLvGueltigkeit = true;

        if (this.wizardService.leistungsvereinbarungDTO && this.wizardService.leistungsvereinbarungDTO.gueltigVon && this.wizardService.leistungsvereinbarungDTO.gueltigBis) {
            isAuswaehlbarAufgrundLvGueltigkeit =
                moment(element.gueltigVon).isSameOrAfter(moment(this.wizardService.leistungsvereinbarungDTO.gueltigVon)) &&
                moment(element.gueltigBis).isSameOrBefore(moment(this.wizardService.leistungsvereinbarungDTO.gueltigBis));
        }

        return isAuswaehlbar && isAuswaehlbarAufgrundLvGueltigkeit;
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.wizardService.channel);

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.tableOptionsForPrinting = { flatTreeState: this.treeTable.getFlattenTreeData() };
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.tableData);
            }
        });
    }

    private initInfopanel() {
        const erfassenLabel = this.facade.translateService.instant('amm.akquisition.button.vertragswerterfassen');
        const stepTitel = this.facade.translateService.instant('amm.akquisition.subnavmenuitem.objektauswaehlen');

        this.infopanelService.updateInformation({
            subtitle: `${erfassenLabel} - ${stepTitel}`
        });
    }

    private appendToInforbar() {
        this.strasseInfo = this.getStrasseInfo(this.unternehmenDTO);
        this.postfachInfo = this.getPostfachInfo(this.unternehmenDTO);
        const provBurNr = this.unternehmenDTO.provBurNr;
        this.burNrToDisplay = provBurNr ? provBurNr : this.unternehmenDTO.burNummer;

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }

    private getStrasseInfo(unternehmen: UnternehmenDTO): string {
        let strasseInfo: string;

        if (unternehmen.strasse) {
            strasseInfo = unternehmen.strasse;
        }

        if (unternehmen.strasseNr) {
            strasseInfo += ` ${unternehmen.strasseNr}`;
        }

        const plzOrt = this.getPlzOrt(unternehmen.plz);

        if (plzOrt) {
            strasseInfo = strasseInfo ? `${strasseInfo}, ${plzOrt}` : plzOrt;
        }

        return strasseInfo;
    }

    private getPostfachInfo(unternehmen: UnternehmenDTO): string | number {
        let postfachInfo: string | number;

        if (unternehmen.postfach) {
            postfachInfo = unternehmen.postfach;
        }

        const plzOrt = this.getPlzOrt(unternehmen.plz);

        if (plzOrt) {
            postfachInfo = postfachInfo ? `${postfachInfo}, ${plzOrt}` : plzOrt;
        }

        return postfachInfo;
    }

    private getPlzOrt(plz: PlzDTO) {
        return plz ? `${plz.postleitzahl} ${this.dbTranslateService.translate(plz, 'ort')}` : null;
    }

    private createMassnahmeStrukturParams(lvDto: LeistungsvereinbarungDTO): PlanwertSuchenParameterDTO {
        return {
            gueltigVon: this.facade.formUtilsService.parseDate(lvDto.gueltigVon),
            gueltigBis: this.facade.formUtilsService.parseDate(lvDto.gueltigBis),
            anbieterId: this.wizardService.anbieterId
        };
    }

    private initializeEmptyNodeData(): VwErfassenTableDataRow {
        return {
            elementName: null,
            gueltigVon: null,
            gueltigBis: null,
            voId: null,
            voClass: null,
            voIdAttribute: null,
            titelDe: null,
            titelFr: null,
            titelIt: null,
            isChecked: null,
            inVertragswertVerwaltungAuswaehlbar: null
        };
    }

    private setStates() {
        this.wizardService.hasTreeTableState = true;
        this.wizardService.isPlanwertUebernehmenCheckedState = this.isPlanwertUebernehmenChecked;
        this.wizardService.tableDataState = [...this.tableData];
        this.wizardService.expansionState = this.treeTable.getFlattenTreeData();
    }
}
