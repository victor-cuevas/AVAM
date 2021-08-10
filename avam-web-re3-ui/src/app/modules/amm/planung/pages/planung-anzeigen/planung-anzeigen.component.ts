import { PlanungstypEnum } from '@shared/enums/domain-code/planungstyp-code.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { FacadeService } from '@shared/services/facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElementPrefixEnum } from '@shared/enums/domain-code/element-prefix.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { forkJoin, Subscription } from 'rxjs';
import { AmmAdministrationRestService } from '@app/modules/amm/administration/services/amm-administration-rest.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { CodeDTO } from '@dtos/codeDTO';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { PlanungAnzeigenTreeTableComponent } from '../../components/planung-anzeigen-tree-table/planung-anzeigen-tree-table.component';
import { PlanungSuchenFormComponent } from '../../components';
import { AmmPlanungRestService } from '../../services/amm-planung-rest.service';
import { StrukturElementDTO } from '@dtos/strukturElementDTO';
import { Node } from '@shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import * as uuidv4 from 'uuid/v4';
import { PlanungSuchenFormData } from '../../components/planung-suchen-form/planung-suchen-form.component';
import { PlanungSuchenParameterDTO } from '@dtos/planungSuchenParameterDTO';
import { ElementKategorieDTO } from '@dtos/elementKategorieDTO';
import * as moment from 'moment';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-planung-anzeigen',
    templateUrl: './planung-anzeigen.component.html',
    providers: [SearchSessionStorageService]
})
export class PlanungAnzeigenComponent extends Unsubscribable implements OnInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'planung-anzeigen';

    @ViewChild('treeTable') treeTable: PlanungAnzeigenTreeTableComponent;
    @ViewChild('planungSuchenForm') planungSuchenFormComponent: PlanungSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    channel = 'planung-anzeigen-channel';
    // points from which mask the user has come to the current one
    // if the user navigates from the top navigation, this variable is undefined
    maskPrefix: ElementPrefixEnum;
    planungData: PlanungSuchenFormData;
    langSubscription: Subscription;
    observeClickActionSub: Subscription;
    massnahmenartStruktur: CodeDTO;
    planungsart: CodeDTO;
    isUebersicht: boolean;
    tableOptionsForPrinting: TreeOptionInterface = {};
    tableData: TreeNodeInterface[];
    id: number;
    tableOptions: { initialExpansionLevel: number };
    startDate: Date;
    planungstypOptions: CodeDTO[];
    massnahmeartStrukturElements: ElementKategorieDTO[];
    massnahmenTypes: StrukturElementDTO[];
    monthsSequence: number[] = [];
    currentPlanungstyp: PlanungstypEnum;
    planungSuchenParameterDto: PlanungSuchenParameterDTO;
    displayViewModeButton: boolean;

    constructor(
        private infopanelService: AmmInfopanelService,
        private route: ActivatedRoute,
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private ammRestService: AmmRestService,
        private ammAdministrationRestService: AmmAdministrationRestService,
        private ammPlanungRestService: AmmPlanungRestService,
        private searchSessionService: SearchSessionStorageService,
        private router: Router
    ) {
        super();
    }

    ngOnInit() {
        this.route.queryParams.subscribe(queryParams => {
            this.maskPrefix = queryParams['maskPrefix'];
            this.id = +queryParams['id'];
        });

        this.initInfopanel();
        this.configureToolbox();
        this.getData();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.initInfopanel();
        });

        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.planungSuchenFormComponent.planungSuchenForm.valid) {
            this.planungSuchenFormComponent.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }

        const planungSuchenParameterState = this.planungSuchenFormComponent.handler.mapToDTO(this.planungData);
        this.searchSessionService.storeFieldsByKey(PlanungAnzeigenComponent.CHANNEL_STATE_KEY, planungSuchenParameterState);
        this.search(planungSuchenParameterState);
    }

    toggleViewMode() {
        this.isUebersicht = !this.isUebersicht;
        this.planungSuchenParameterDto.uebersichtAktiv = this.isUebersicht;
        this.search(this.planungSuchenParameterDto);
    }

    reset() {
        this.planungSuchenFormComponent.reset();
        this.tableData = [];
    }

    ngOnDestroy() {
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        super.ngOnDestroy();
    }

    private getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            this.stesDataRestService.getFixedCode(DomainEnum.AMM_PLANUNGSMODUS),
            this.ammRestService.getElementkategoriesByAuthorizationKeyScope(Permissions.AMM_PLANUNG_LESEN),
            this.ammAdministrationRestService.getGesetzlicheMassnahmentypListeOhneSpez(new Date(2020, 0, 1))
        ]).subscribe(
            ([planungstypOptionsResponse, massnahmenartStrukturResponse, massnahmenTypeResponse]) => {
                this.planungstypOptions = planungstypOptionsResponse;
                this.massnahmeartStrukturElements = massnahmenartStrukturResponse.data;
                this.massnahmenTypes = massnahmenTypeResponse.data;

                const state = this.searchSessionService.restoreStateByKey(PlanungAnzeigenComponent.CHANNEL_STATE_KEY);

                if (state) {
                    this.planungData = {
                        planungstypOptions: this.planungstypOptions,
                        massnahmeartStrukturElements: this.massnahmeartStrukturElements,
                        massnahmenTypes: this.massnahmenTypes,
                        planungSuchenParameterDto: state.fields
                    };

                    this.search(state.fields);
                } else {
                    if (this.id && this.maskPrefix) {
                        this.getPlanungSuchenParameterDtoById();
                    } else {
                        this.planungData = {
                            planungstypOptions: this.planungstypOptions,
                            massnahmeartStrukturElements: this.massnahmeartStrukturElements,
                            massnahmenTypes: this.massnahmenTypes
                        };

                        this.facade.spinnerService.deactivate(this.channel);
                    }
                }
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    private getPlanungSuchenParameterDtoById() {
        this.facade.spinnerService.activate(this.channel);

        this.ammPlanungRestService.getPlanungSuchenParameterDtoById(this.id, this.maskPrefix).subscribe(
            planungSuchenParameterDtoResponse => {
                const planungSuchenParameterDto = planungSuchenParameterDtoResponse.data;

                if (planungSuchenParameterDto) {
                    this.planungData = {
                        planungstypOptions: this.planungstypOptions,
                        massnahmeartStrukturElements: this.massnahmeartStrukturElements,
                        massnahmenTypes: this.massnahmenTypes,
                        planungSuchenParameterDto
                    };

                    this.search(planungSuchenParameterDto);
                } else {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    private search(planungSuchenParameterDto: PlanungSuchenParameterDTO) {
        this.facade.spinnerService.activate(this.channel);
        this.planungSuchenParameterDto = planungSuchenParameterDto;

        this.ammPlanungRestService.searchWithParams(planungSuchenParameterDto).subscribe(
            response => {
                if (response.data) {
                    this.displayViewModeButton = true;
                    this.startDate = this.planungSuchenFormComponent.planungSuchenForm.controls.planungAb.value;
                    this.currentPlanungstyp = +this.planungSuchenFormComponent.planungSuchenForm.controls.planungstyp.value;
                    this.monthsSequence = this.initializeMonthsSequence(this.startDate);
                    // Modify to current node only, else 1
                    this.tableOptions = { initialExpansionLevel: 6 };
                    this.tableData = [this.buildTree(response.data)];
                }

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    private initInfopanel() {
        const massnahmenartStrukturInfobar = this.facade.dbTranslateService.translate(this.massnahmenartStruktur, 'text');
        const planungsartInfobar = this.facade.dbTranslateService.translate(this.planungsart, 'text');
        const sichtInfobar = this.isUebersicht ? 'amm.planung.label.planunguebersicht' : 'amm.planung.label.planungstandardsicht';

        this.infopanelService.dispatchInformation({
            title: `${massnahmenartStrukturInfobar} - ${planungsartInfobar} -`,
            subtitle: `${sichtInfobar}`
        });
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.tableOptionsForPrinting = { flatTreeState: this.treeTable.getFlattenTreeData() };
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.tableData);
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.facade.openModalFensterService.openDmsCopyModalPlanung(DmsMetadatenContext.DMS_CONTEXT_PLANUNG, 'CH', 2020); //change on get data
            }
        });
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: {},
            entityAdditionalDataMapping: { ORGANISATIONSKUERZEL: 'CH', PLANUNGSJAHR: 2020 } //change on get data
        };
    }

    private buildTree(strukturelement: StrukturElementDTO): Node<any> {
        const parent: Node<any> = new Node(uuidv4(), this.createNodeData(strukturelement));

        if (strukturelement.nachfolgerElementList) {
            strukturelement.nachfolgerElementList.forEach(element => {
                const isPlanwert = this.isPlanwert(element);

                if (!isPlanwert) {
                    parent.addChild(this.buildTree(element));
                } else {
                    if (
                        !this.isUebersicht &&
                        (this.shouldAddPlanwertToProdukt(strukturelement) || this.shouldAddPlanwertToMassnahme(strukturelement) || this.shouldAddPlanwertToDfe(strukturelement))
                    ) {
                        parent.addChild(this.buildTree(element));
                    }
                }
            });
        }

        return parent;
    }

    private createNodeData(strukturEl: any): any {
        const nodeData: any = this.initializeEmptyNodeData();

        nodeData.titelDe = strukturEl.elementNameDe;
        nodeData.titelFr = strukturEl.elementNameFr;
        nodeData.titelIt = strukturEl.elementNameIt;
        nodeData.gueltigVon = strukturEl.gueltigVon;
        nodeData.gueltigBis = strukturEl.gueltigBis;
        nodeData.voId = strukturEl.voId;
        nodeData.voClass = strukturEl.voClass;
        nodeData.voIdAttribute = strukturEl.voIdAttribute;
        // TODO: adjust for hover buttons functionality?
        nodeData.inVertragswertVerwaltungAuswaehlbar = strukturEl.inVertragswertVerwaltungAuswaehlbar;

        if (this.isUebersicht) {
            const children = strukturEl.nachfolgerElementList;
            const parentHighlightMap = new Map();

            if (children && this.shouldHighlightType(strukturEl.voClass)) {
                children.sort((a, b) => a.gueltigVon - b.gueltigVon);
                children.forEach(child => {
                    const childHighlightMap = this.highlight(child);

                    if (childHighlightMap) {
                        this.setBrackets(childHighlightMap, parentHighlightMap);

                        childHighlightMap.forEach((value, key) => {
                            parentHighlightMap.set(key, value);
                        });
                    }
                });

                nodeData.coordinatesToColor = parentHighlightMap;

                return nodeData;
            }
        }

        nodeData.coordinatesToColor = this.highlight(strukturEl);

        return nodeData;
    }

    private setBrackets(childHighlightMap: Map<number, any>, parentHighlightMap: Map<number, any>) {
        const firstChildIndexHighlightObj = childHighlightMap.entries().next().value;
        const firstChildIndex = firstChildIndexHighlightObj[0];

        const lastIndexHighlightObj = Array.from(parentHighlightMap.entries()).pop();

        if (lastIndexHighlightObj) {
            const lastIndex = lastIndexHighlightObj[0];

            if (firstChildIndex === lastIndex + 1) {
                childHighlightMap.set(firstChildIndex, { ...childHighlightMap.get(firstChildIndex), showBracketLeft: true });
                parentHighlightMap.set(lastIndex, { ...parentHighlightMap.get(lastIndex), showBracketRight: true });
            } else if (firstChildIndex === lastIndex) {
                childHighlightMap.set(firstChildIndex, { ...childHighlightMap.get(firstChildIndex), showDoubleBracket: true });
            }
        }
    }

    private highlight(strukturEl: any): Map<number, any> | undefined {
        if (strukturEl.voClass && strukturEl.voClass.includes(AvamCommonValueObjectsEnum.T_PLANWERT)) {
            const gueltigVonMoment = moment(strukturEl.gueltigVon);
            const gueltigBisMoment = moment(strukturEl.gueltigBis);

            // If the selected Planung ab date's month is different than January, then we show for sure two-years in one view
            const twoYearsDispalyed = this.startDate.getMonth() !== 0;

            if (this.shouldHighlightDate(twoYearsDispalyed, gueltigVonMoment, gueltigBisMoment)) {
                // The beginning and the end dates of the Planwert may be in different months.
                const daysInFirstMonth = gueltigVonMoment.daysInMonth();
                // For every month, we have 4 dedicated cells.
                // Therefore we divide the days in month by 4 in order to get a delimiter.
                const delimiterFirstMonth = daysInFirstMonth / 4;
                const daysInLastMonth = gueltigBisMoment.daysInMonth();
                const delimiterLastMonth = daysInLastMonth / 4;

                // Get the first section to highlight.
                let firstSectionToHighlight = this.getSectionToHighlight(gueltigVonMoment, delimiterFirstMonth);
                // Get the last section to highlight.
                let lastSectionToHighlight = this.getSectionToHighlight(gueltigBisMoment, delimiterLastMonth);

                if (gueltigVonMoment.isBefore(this.startDate, 'day')) {
                    firstSectionToHighlight = 0;
                }

                if (
                    gueltigBisMoment.isAfter(
                        moment(this.startDate)
                            .add(12, 'month')
                            .add(-1, 'day'),
                        'day'
                    )
                ) {
                    lastSectionToHighlight = 47;
                }

                return this.fillColorMap(firstSectionToHighlight, lastSectionToHighlight, strukturEl, gueltigVonMoment, gueltigBisMoment);
            }
        }
    }

    private fillColorMap(firstSectionToHighlight: number, lastSectionToHighlight: number, strukturEl: any, gueltigVonMoment: moment.Moment, gueltigBisMoment: moment.Moment) {
        const coordinatesToColor = new Map();

        for (let index = firstSectionToHighlight; index <= lastSectionToHighlight; index++) {
            coordinatesToColor.set(index, {
                style: strukturEl.planwertHasBudget ? 'bg-green' : 'bg-red',
                showBracketLeft: gueltigVonMoment.isBefore(this.startDate, 'day') && index === 0,
                showBracketRight:
                    gueltigBisMoment.isAfter(
                        moment(this.startDate)
                            .add(12, 'month')
                            .add(-1, 'day'),
                        'day'
                    ) && index === 47
            });
        }

        return coordinatesToColor;
    }

    private shouldHighlightDate(twoYearsDispalyed: boolean, gueltigVon: moment.Moment, gueltigBis: moment.Moment): boolean {
        return (
            (twoYearsDispalyed &&
                (gueltigVon.year() === this.startDate.getFullYear() || gueltigVon.year() === this.startDate.getFullYear() + 1) &&
                gueltigBis.isSameOrAfter(this.startDate, 'day')) ||
            (!twoYearsDispalyed && gueltigVon.year() === this.startDate.getFullYear()) ||
            (gueltigVon.year() < this.startDate.getFullYear() && gueltigBis.year() > this.startDate.getFullYear() + 1)
        );
    }

    private shouldHighlightType(voClass: string): boolean {
        return (
            voClass &&
            (voClass.includes(AvamCommonValueObjectsEnum.T_PRODUKT) ||
                voClass.includes(AvamCommonValueObjectsEnum.T_MASSNAHME) ||
                voClass.includes(AvamCommonValueObjectsEnum.T_SESSION) ||
                voClass.includes(AvamCommonValueObjectsEnum.T_STANDORT) ||
                voClass.includes(AvamCommonValueObjectsEnum.T_PLANWERT))
        );
    }

    private getSectionToHighlight(gueltigMoment: moment.Moment, delimiter: number) {
        let sectionToHightlight;

        // Example:
        // We have in total 48 dedicated cells, 4 per month (indices 0 - 47).
        // Assume Planung ab is January 2020.
        // March is the month with index 2 - zero-based month indexing.
        // It covers cells 8-9-10-11, ONLY IF the selected Planung ab is January. Therefore we use the array monthsSequence to get the exact indices.
        // If the Planung ab is different than January, then the cells will be different.
        // March has 31 days. Divided by 4 we get delimiter 7.75.
        // Assume the Planwert period is from 20 March 2020 to 26 March 2020 inclusive.
        // Since (20 > delimiter * 2(=15.5)) AND (20 <= delimiter * 3(=23.25)),
        // we cover the third case, resulting in sectionToHighlight = 2 + 4 * 2 = 10 (eleventh section - zero-based indexing).
        // The same logic is applied to the end date => 26 results in the last case, with 3 + 4 * 2 = 11 (twelfth section)
        if (gueltigMoment.date() <= delimiter) {
            sectionToHightlight = 0 + 4 * this.monthsSequence.indexOf(gueltigMoment.month());
        } else if (gueltigMoment.date() > delimiter && gueltigMoment.date() <= delimiter * 2) {
            sectionToHightlight = 1 + 4 * this.monthsSequence.indexOf(gueltigMoment.month());
        } else if (gueltigMoment.date() > delimiter * 2 && gueltigMoment.date() <= delimiter * 3) {
            sectionToHightlight = 2 + 4 * this.monthsSequence.indexOf(gueltigMoment.month());
        } else {
            sectionToHightlight = 3 + 4 * this.monthsSequence.indexOf(gueltigMoment.month());
        }

        return sectionToHightlight;
    }

    // The purpose of this method is to reorder the months in a sequence
    // which is according the selected Planung ab date in the form.
    //
    // Example:
    // If the selected Planung ab date is January YYYY, then the month sequence is
    // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] -> [January, February, March ..., December]
    // If the selected Planung ab is March YYYY, then the month sequence is
    // [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1] -> [March, April, May ..., February]
    // This is used in order to highlight the correct month sections.
    private initializeMonthsSequence(planungAb: Date): number[] {
        const sequence = [];

        for (let index = 0; index < 12; index++) {
            const momentObj = moment(planungAb);
            const monthIndex = momentObj.month();
            sequence.push(monthIndex);

            // Increment the month by 1
            planungAb = moment(planungAb)
                .add(1, 'month')
                .toDate();
        }

        return sequence;
    }

    private isPlanwert(element: any): boolean {
        return element.voClass && element.voClass.includes(AvamCommonValueObjectsEnum.T_PLANWERT);
    }

    private shouldAddPlanwertToProdukt(parentElement: any): boolean {
        return this.currentPlanungstyp === PlanungstypEnum.PRODUKT && parentElement.voClass.includes(AvamCommonValueObjectsEnum.T_PRODUKT);
    }

    private shouldAddPlanwertToMassnahme(parentElement: any): boolean {
        return this.currentPlanungstyp === PlanungstypEnum.MASSNAHME && parentElement.voClass.includes(AvamCommonValueObjectsEnum.T_MASSNAHME);
    }

    private shouldAddPlanwertToDfe(parentElement: any): boolean {
        return (
            this.currentPlanungstyp === PlanungstypEnum.KURS_STANDORT &&
            parentElement.voClass.includes(AvamCommonValueObjectsEnum.T_SESSION || AvamCommonValueObjectsEnum.T_STANDORT)
        );
    }

    private initializeEmptyNodeData(): any {
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
}
