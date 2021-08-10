import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ElementKategorieEnum } from '@app/shared/enums/element-kategorie.enum';
import { DurchfuehrungseinheitListeViewDTO } from '@dtos/durchfuehrungseinheitListeViewDTO';
import { InfotagDurchfuehrungseinheitSuchenParamDTO } from '@dtos/infotagDurchfuehrungseinheitSuchenParamDTO';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Unsubscribable } from 'oblique-reactive';
import { InfotagBewirtschaftungSuchenFormComponent, InfotagBewirtschaftungSuchenTableComponent } from '../../components';
import { InfotagBewirtschaftungSuchenData } from '../../components/infotag-bewirtschaftung-suchen-form/infotag-bewirtschaftung-suchen-form.component';
import { AmmInfotagRestService } from '../../services/amm-infotag-rest.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-infotag-bewirtschaftung-suchen',
    templateUrl: './infotag-bewirtschaftung-suchen.component.html',
    styleUrls: ['./infotag-bewirtschaftung-suchen.component.scss']
})
export class InfotagBewirtschaftungSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static readonly STATE_KEY = 'infotag-bewirtschaftung-suchen-state';

    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('infotagSuchenForm') infotagSuchenForm: InfotagBewirtschaftungSuchenFormComponent;

    infotagData: InfotagBewirtschaftungSuchenData;
    toolboxChannel = 'infotag-bewirtschaftung-suchen';
    searchSpinnerChannel = 'infotag-bewirtschaftung-suchen';
    tableSpinnerChannel = 'infotag-bewirtschaftung-table';
    dataSource = [];

    constructor(
        private infopanelService: AmmInfopanelService,
        private modalService: NgbModal,
        private ammRestService: AmmRestService,
        private infotagRest: AmmInfotagRestService,
        private searchSession: SearchSessionStorageService,
        private facadeService: FacadeService,
        private ammHelper: AmmHelper,
        private router: Router
    ) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit() {
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.configureToolbox();
        this.getData();
        this.setupInfobar();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngAfterViewInit() {}

    getData() {
        this.facadeService.spinnerService.activate(this.searchSpinnerChannel);
        this.ammRestService.getElementkategoriesByAuthorizationKeyScope(ElementKategorieEnum.KEY_AMM_INFOTAG_NUTZEN).subscribe(
            res => {
                const state = this.searchSession.restoreStateByKey(InfotagBewirtschaftungSuchenComponent.STATE_KEY);
                this.infotagData = { dropdownOptions: res.data };

                if (state) {
                    this.infotagData.state = state.fields;
                    this.searchRestCall(this.infotagSuchenForm.mapStorageDataToDto(state.fields));
                }

                this.facadeService.spinnerService.deactivate(this.searchSpinnerChannel);
            },
            error => {
                this.facadeService.spinnerService.deactivate(this.searchSpinnerChannel);
            }
        );
    }

    setupInfobar() {
        this.infopanelService.dispatchInformation({
            title: this.facadeService.translateService.instant('amm.infotag.label.listeinfotage'),
            hideInfobar: true
        });
    }

    subscribeToLangChange() {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.search();
            this.setupInfobar();
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facadeService.toolboxService.sendConfiguration(toolboxConfig, this.toolboxChannel, null, true);
    }

    subscribeToToolbox() {
        this.facadeService.toolboxService
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

    search() {
        this.facadeService.fehlermeldungenService.closeMessage();

        if (!this.infotagSuchenForm.infotagSuchenForm.valid) {
            this.infotagSuchenForm.ngForm.onSubmit(undefined);
            this.facadeService.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }

        const storedData = this.infotagSuchenForm.mapStoreData();
        const searchData = this.infotagSuchenForm.mapToDto();

        this.searchSession.storeFieldsByKey(InfotagBewirtschaftungSuchenComponent.STATE_KEY, storedData);
        this.searchSession.resetSelectedTableRow(InfotagBewirtschaftungSuchenTableComponent.STATE_KEY);
        this.searchRestCall(searchData);
    }

    searchRestCall(data: InfotagDurchfuehrungseinheitSuchenParamDTO) {
        this.facadeService.spinnerService.activate(this.tableSpinnerChannel);
        this.infotagRest.getInfotagDurchfuehrungseinheitList(data).subscribe(
            res => {
                if (res.data) {
                    this.dataSource = [...res.data]
                        .sort(this.sortByStrField('durchfuehrungseinheitTitel'))
                        .sort(this.sortByStrField('ortsbezeichnung'))
                        .map(el => this.createInfotagRow(el));
                    this.infopanelService.updateInformation({ tableCount: res.data.length });
                } else {
                    this.dataSource = [];
                    this.infopanelService.updateInformation({ tableCount: 0 });
                }
                this.facadeService.spinnerService.deactivate(this.tableSpinnerChannel);
            },
            error => {
                this.facadeService.spinnerService.deactivate(this.tableSpinnerChannel);
            }
        );
    }

    sortByStrField(field: string) {
        return (v1: DurchfuehrungseinheitListeViewDTO, v2: DurchfuehrungseinheitListeViewDTO): number => {
            const str1 = this.facadeService.dbTranslateService.translate(v1, field) || '';
            const str2 = this.facadeService.dbTranslateService.translate(v2, field) || '';
            return str1.localeCompare(str2);
        };
    }

    createInfotagRow(data: DurchfuehrungseinheitListeViewDTO) {
        const plz = data.plz || '';
        const plzName = this.facadeService.dbTranslateService.translateWithOrder(data, 'ortsbezeichnung') || '';
        const anzUeberbuchungen = data.anzUeberbuchungen || 0;
        const ueberbuchungenMax = data.ueberbuchungenMax || 0;
        const teilnehmer = data.anzBuchungenKorr || 0;
        const teilnehmerMax = data.maxPlaetze || 0;

        return {
            titel: this.facadeService.dbTranslateService.translateWithOrder(data, 'durchfuehrungseinheitTitel') || '',
            ort: `${plz} ${plzName}`,
            datum: data.durchfuehrungseinheitGueltigVon,
            kurszeiten: this.facadeService.dbTranslateService.translateWithOrder(data, 'kurszeiten') || '',
            anbieter: this.ammHelper.concatenateUnternehmensnamen(data.massnahmeUnternehmenName1, data.massnahmeUnternehmenName2, data.massnahmeUnternehmenName3),
            massnahmeId: data.massnahmeId,
            teilnehmer: `${teilnehmer}/${teilnehmerMax}`,
            ueberbuchung: `${anzUeberbuchungen}/${ueberbuchungenMax}`,
            dfeId: data.durchfuehrungseinheitId
        };
    }

    reset() {
        this.infotagSuchenForm.reset();
        this.facadeService.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(InfotagBewirtschaftungSuchenComponent.STATE_KEY);
        this.searchSession.restoreDefaultValues(InfotagBewirtschaftungSuchenTableComponent.STATE_KEY);
    }

    itemSelected(row) {
        this.router.navigate([`amm/infotag/massnahme/${row.massnahmeId}/infotage/infotag/grunddaten`], {
            queryParams: { dfeId: row.dfeId }
        });
    }

    ngOnDestroy() {
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: undefined });
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }
}
