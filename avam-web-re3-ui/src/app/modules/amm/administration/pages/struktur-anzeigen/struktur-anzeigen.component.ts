import { Component, OnDestroy, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { ToolboxService, FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { MassnahmeartTreeService } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmeart-tree.service';
import { StrukturFilterDTO, StrukturFilterComponent } from '../../components/struktur-filter/struktur-filter.component';
import { forkJoin } from 'rxjs';
import { AmmAdministrationRestService } from '../../services/amm-administration-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { StrukturElementQueryParams } from '@app/shared/models/dtos-generated/strukturElementQueryParams';
import { HttpResponseHelper } from '@app/shared/helpers/http-response.helper';
import { HttpResponse } from '@angular/common/http';
import { NodeData } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { StrukturElementData } from '../../components/strukturelement-modal/strukturelement-modal.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-struktur-anzeigen',
    templateUrl: './struktur-anzeigen.component.html',
    styleUrls: ['./struktur-anzeigen.component.scss'],
    providers: [MassnahmeartTreeService]
})
export class StrukturAnzeigenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('actionColumnTemplate') actionColumnTemplate: TemplateRef<any>;
    @ViewChild('strukturelementModal') strukturelementModal: ElementRef;
    @ViewChild('strukturFilter') strukturFilter: StrukturFilterComponent;

    channel = 'struktur-anzeigen';
    dropdownOptions: ElementKategorieDTO[] = [];

    strukturEl: StrukturElementDTO;
    strukturelementData: StrukturElementData = {};
    treeArray: TreeNodeInterface[] = [];
    treeOptions: TreeOptionInterface;
    lastAnzeigeDatum = new Date();
    mode: string;
    selectedElementkategorieId = 0;
    strukturToSelect: number;

    constructor(
        private facade: FacadeService,
        private ammRestService: AmmAdministrationRestService,
        private modalService: NgbModal,
        private massnahmeartTreeService: MassnahmeartTreeService,
        private infopanelService: AmmInfopanelService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.infopanelService.dispatchInformation({ title: 'amm.administration.topnavmenuitem.massnahmenart', hideInfobar: true });
        this.getData();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.setTreeOptions();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        this.ammRestService
            .getAllElementCategories()
            .pipe(
                map(response => {
                    if (response.data) {
                        this.dropdownOptions = response.data;
                        this.selectedElementkategorieId = response.data[0].elementkategorieId;
                    }
                    return this.selectedElementkategorieId;
                }),
                switchMap(elementkategorieId => this.ammRestService.searchAllStruktur({ elementkategorieId, anzeigeDatum: this.lastAnzeigeDatum }))
            )
            .subscribe(
                response => {
                    if (response.data) {
                        this.strukturEl = response.data;
                        this.treeArray = [this.massnahmeartTreeService.buildTreeForAmmStruktur(this.strukturEl, this.getKategorie(this.selectedElementkategorieId), new Date())];
                        this.configureToolbox();
                    }

                    this.facade.spinnerService.deactivate(this.channel);
                },
                error => {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            );
    }

    setTreeOptions() {
        this.treeOptions = {
            columnOrder: ['elementName', 'elementCode', 'gueltigVonStr', 'gueltigBisStr'],
            columnTitle: ['amm.administration.label.elementname', 'amm.administration.label.code', 'amm.akquisition.label.gueltigvon', 'amm.akquisition.label.gueltigbis'],
            actions: {
                template: this.actionColumnTemplate,
                columnWidth: 80
            },
            firstColumnCustomWidth: 650,
            initialExpansionLevel: 1,
            shouldSaveExpansonState: true
        };
    }

    onRefresh(data: StrukturFilterDTO) {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.strukturFilter.searchForm.valid) {
            this.strukturFilter.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }

        this.facade.spinnerService.activate(this.channel);

        this.selectedElementkategorieId = data.elementkategorieId;
        this.lastAnzeigeDatum = data.anzeigeDatum;
        this.ammRestService.searchAllStruktur(data).subscribe(
            resp => {
                if (resp.data) {
                    this.strukturEl = resp.data;
                    this.treeArray = [this.massnahmeartTreeService.buildTreeForAmmStruktur(this.strukturEl, this.getKategorie(this.selectedElementkategorieId), data.anzeigeDatum)];
                    this.configureToolbox();
                }

                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EXCEL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { ELEMENTKATEGORIE_ID: this.selectedElementkategorieId }
        };
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                } else if (action.message.action === ToolboxActionEnum.EXCEL) {
                    this.onExcelExport();
                }
            });
    }

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.treeArray = [
                this.massnahmeartTreeService.buildTreeForAmmStruktur(
                    this.strukturEl,
                    this.getKategorie(this.selectedElementkategorieId),
                    this.lastAnzeigeDatum,
                    0,
                    this.strukturToSelect
                )
            ];
        });
    }

    openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_AMM_ELEMENTKATEGORIE;
        comp.id = this.selectedElementkategorieId.toString();
    }

    onExcelExport() {
        const queryParams: StrukturElementQueryParams = {
            elementkategorieId: this.selectedElementkategorieId,
            anzeigeDatum: this.lastAnzeigeDatum
        };
        this.ammRestService.getExcelExport(queryParams, this.facade.translateService.currentLang).subscribe((res: HttpResponse<Blob>) => {
            HttpResponseHelper.openBlob(res);
        });
    }

    openEdit(data: NodeData) {
        this.facade.fehlermeldungenService.closeMessage();

        this.facade.spinnerService.activate(this.channel);

        const vorgaengerId = data.vorgaengerObject ? data.vorgaengerObject.strukturelementId : data.strukturelementId;

        forkJoin(
            this.ammRestService.getStrukturElementById(data.strukturelementId),
            this.ammRestService.getStrukturElementPath(vorgaengerId),
            this.ammRestService.getStrukturElementPath(data.mappingAusgleichstelleId),
            this.ammRestService.getStrukturElementRechte(this.selectedElementkategorieId, data.strukturelementId)
        ).subscribe(
            ([strukturelement, path, ausgleichsstellePath, rights]) => {
                const category = this.dropdownOptions.find(el => el.elementkategorieId === this.selectedElementkategorieId);
                this.strukturelementData = {
                    strukturelement: strukturelement.data,
                    selectedCategory: category,
                    strukturPath: path.data,
                    ausgleichsstellePath: ausgleichsstellePath.data,
                    formMode: rights.data.bearbeitungsRecht ? FormModeEnum.EDIT : FormModeEnum.READONLY
                };

                if (this.strukturelementData.strukturelement) {
                    this.modalService.open(this.strukturelementModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' });
                }

                this.facade.spinnerService.deactivate(this.channel);
            },
            error => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    addItem(data: NodeData) {
        this.facade.fehlermeldungenService.closeMessage();

        this.facade.spinnerService.activate(this.channel);

        forkJoin(
            this.ammRestService.getNewElementInitialValue(this.selectedElementkategorieId, data.strukturelementId),
            this.ammRestService.getStrukturElementPath(data.vorgaengerObject.strukturelementId)
        ).subscribe(
            ([initialElement, path]) => {
                const category = this.dropdownOptions.find(el => el.elementkategorieId === this.selectedElementkategorieId);

                this.strukturelementData = {
                    strukturelement: initialElement.data,
                    selectedCategory: category,
                    strukturPath: path.data,
                    formMode: FormModeEnum.CREATE
                };

                if (this.strukturelementData.strukturelement) {
                    this.modalService.open(this.strukturelementModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' });
                } else {
                    OrColumnLayoutUtils.scrollTop();
                }

                this.facade.spinnerService.deactivate(this.channel);
            },
            error => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    onSave(strukturElement: StrukturElementDTO) {
        OrColumnLayoutUtils.scrollTop();

        this.modalService.dismissAll();

        this.facade.spinnerService.activate(this.channel);

        this.strukturFilter.searchForm.patchValue({ date: this.facade.formUtilsService.parseDate(strukturElement.gueltigVon) });
        this.lastAnzeigeDatum = strukturElement.gueltigVon;
        this.strukturToSelect = strukturElement.strukturelementId;

        this.searchAllStruktur({ elementkategorieId: this.selectedElementkategorieId, anzeigeDatum: this.lastAnzeigeDatum });
    }

    onDelete(strukturElement: StrukturElementDTO) {
        OrColumnLayoutUtils.scrollTop();

        this.modalService.dismissAll();

        this.facade.spinnerService.activate(this.channel);

        this.strukturFilter.searchForm.patchValue({ date: this.facade.formUtilsService.parseDate(strukturElement.vorgaengerObject.gueltigVon) });
        this.lastAnzeigeDatum = strukturElement.vorgaengerObject.gueltigVon;
        this.strukturToSelect = strukturElement.vorgaengerObject.strukturelementId;

        this.searchAllStruktur({ elementkategorieId: this.selectedElementkategorieId, anzeigeDatum: this.lastAnzeigeDatum });
    }

    searchAllStruktur(data: StrukturFilterDTO) {
        this.ammRestService.searchAllStruktur(data).subscribe(
            response => {
                if (response.data) {
                    this.strukturEl = response.data;
                    this.treeArray = [
                        this.massnahmeartTreeService.buildTreeForAmmStruktur(
                            this.strukturEl,
                            this.getKategorie(this.selectedElementkategorieId),
                            this.lastAnzeigeDatum,
                            0,
                            this.strukturToSelect
                        )
                    ];
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    getKategorie(elementkategorieId: number): number {
        const element = this.dropdownOptions.find(el => el.elementkategorieId === elementkategorieId);

        return element ? element.kategorie : null;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();

        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ hideInfobar: false });
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
