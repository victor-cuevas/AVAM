import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Unsubscribable } from 'oblique-reactive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { ElementKategorieEnum } from '@shared/enums/element-kategorie.enum';
import { InfotagMassnahmeSuchenFormComponent, InfotagMassnahmeSuchenTableComponent } from '../../components';
import { AmmInfotagRestService } from '../../services/amm-infotag-rest.service';
import { Router } from '@angular/router';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { AmmInfotagStorageService } from '../../services/amm-infotag-storage.service';
import { InfotagMassnahmeSuchenParamDTO } from '@app/shared/models/dtos-generated/infotagMassnahmeSuchenParamDTO';
import { MassnahmeViewDTO } from '@app/shared/models/dtos-generated/massnahmeViewDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-infotag-massnahme-suchen',
    templateUrl: './infotag-massnahme-suchen.component.html',
    styleUrls: ['./infotag-massnahme-suchen.component.scss']
})
export class InfotagMassnahmeSuchenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    static readonly STATE_KEY = 'infotag-massnahme-suchen';
    public get STATE_KEY() {
        return InfotagMassnahmeSuchenComponent.STATE_KEY;
    }

    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('massnahmeSuchenForm') massnahmeSuchenForm: InfotagMassnahmeSuchenFormComponent;

    tableSpinnerChannel = 'infotag-massnahme-table';

    infotagMassnahmeData;
    toolboxChannel = 'infotag-massnahme-suchen';
    dataSource = [];

    constructor(
        private facade: FacadeService,
        private modalService: NgbModal,
        private infopanelService: AmmInfopanelService,
        private ammRestService: AmmRestService,
        private infotagRest: AmmInfotagRestService,
        private router: Router,
        private searchSession: SearchSessionStorageService,
        private infotagStorage: AmmInfotagStorageService
    ) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit() {
        this.subscribeToLangChange();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.setupInfobar();
        this.getData();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngAfterViewInit() {}

    getData() {
        this.facade.spinnerService.activate(this.STATE_KEY);
        this.ammRestService.getElementkategoriesByAuthorizationKeyScope(ElementKategorieEnum.KEY_AMM_INFOTAG_NUTZEN).subscribe(
            res => {
                const state = this.searchSession.restoreStateByKey(InfotagMassnahmeSuchenComponent.STATE_KEY);
                this.infotagMassnahmeData = {
                    dropdownOptions: res.data,
                    state: null
                };

                if (state) {
                    this.infotagMassnahmeData.state = state.fields;
                    this.searchRestCall(this.mapStorageData(state.fields));
                }

                this.facade.spinnerService.deactivate(this.STATE_KEY);
            },
            error => {
                this.facade.spinnerService.deactivate(this.STATE_KEY);
            }
        );
    }

    mapStorageData(stateData) {
        const currentLang = this.facade.translateService.currentLang;
        return {
            elementkategorieId: stateData.elementkategorieId,
            massnahmeId: stateData.massnahmeId,
            titel: stateData.titel,
            anbieter: {
                name1: stateData.anbieter ? stateData.anbieter.name1 : null,
                unternehmenId: stateData.anbieter ? stateData.anbieter.unternehmenId : null
            },
            gueltigVon: stateData.gueltigVon,
            gueltigBis: stateData.gueltigBis,
            benutzersprache: currentLang,
            benutzer: stateData.benutzer
        };
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.toolboxChannel);
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true });
    }

    setupInfobar() {
        this.infopanelService.dispatchInformation({
            title: this.facade.translateService.instant('amm.infotag.label.infotagMassnahmen'),
            hideInfobar: true
        });
    }

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.search();
            this.setupInfobar();
        });
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.massnahmeSuchenForm.massnahmeSuchenForm.valid) {
            this.massnahmeSuchenForm.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }

        const searchData = this.massnahmeSuchenForm.mapToDTO();
        const storedData = this.massnahmeSuchenForm.mapStoreData();
        this.searchRestCall(searchData);
        this.searchSession.resetSelectedTableRow(InfotagMassnahmeSuchenTableComponent.STATE_KEY);
        this.searchSession.storeFieldsByKey(InfotagMassnahmeSuchenComponent.STATE_KEY, storedData);
    }

    searchRestCall(data: InfotagMassnahmeSuchenParamDTO) {
        this.facade.spinnerService.activate(this.tableSpinnerChannel);
        this.infotagRest.getInfotagMassnahmenList(data).subscribe(
            res => {
                if (res.data) {
                    this.dataSource = res.data.map(el => this.createInfotagRow(el));
                }

                this.infopanelService.updateInformation({ tableCount: res.data.length });
                this.facade.spinnerService.deactivate(this.tableSpinnerChannel);
            },
            error => {
                this.facade.spinnerService.deactivate(this.tableSpinnerChannel);
            }
        );
    }

    reset() {
        this.massnahmeSuchenForm.reset();
        this.facade.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(InfotagMassnahmeSuchenComponent.STATE_KEY);
        this.searchSession.restoreDefaultValues(InfotagMassnahmeSuchenTableComponent.STATE_KEY);
    }

    itemSelected(massnahmeId) {
        this.infotagStorage.shouldNavigateToSearch = true;
        this.router.navigate([`amm/infotag/massnahme/${massnahmeId}/grunddaten`]);
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: null });
        super.ngOnDestroy();
    }

    createInfotagRow(data: MassnahmeViewDTO) {
        return {
            titel: this.facade.dbTranslateService.translateWithOrder(data, 'titel'),
            durchfuerungsort: this.facade.dbTranslateService.translateWithOrder(data, 'durchfuehrungsort') || '',
            gueltigVon: data.gueltigVon,
            gueltigBis: data.gueltigBis,
            anbieter: this.getFullName(data.unternehmenName1, data.unternehmenName2, data.unternehmenName3),
            massnahmeId: data.massnahmeId
        };
    }

    getFullName(name1: string, name2: string, name3: string): string {
        return `${name1}${name2 ? ' ' + name2 : ''}${name3 ? ' ' + name3 : ''}`;
    }
}
