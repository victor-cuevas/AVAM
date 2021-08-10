import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacadeService } from '@shared/services/facade.service';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { forkJoin } from 'rxjs';
import { MeldepflichtDTO } from '@dtos/meldepflichtDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { BaseResponseWrapperListMeldepflichtDTOWarningMessages } from '@dtos/baseResponseWrapperListMeldepflichtDTOWarningMessages';
import { BerufMeldepflichtSuchenParamDTO } from '@dtos/berufMeldepflichtSuchenParamDTO';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';

@Component({
    selector: 'stellenmeldepflicht-berufe',
    templateUrl: './stellenmeldepflicht-berufe-page.component.html',
    styleUrls: ['./stellenmeldepflicht-berufe-page.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class StellenmeldepflichtBerufePageComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    channel = 'stellenmeldepflichtberufe';
    searchForm: FormGroup;
    kantoneOptions: any[] = [];
    tableConfig: any;

    private rawData: MeldepflichtDTO[] = [];
    private baseTableConfig = {
        columns: [
            { columnDef: 'bezeichnung', header: 'arbeitgeber.oste.label.berufsbezeichnung', cell: (e: any) => `${e.bezeichnung}` },
            { columnDef: 'BN2000code', header: 'arbeitgeber.oste.label.BN2000-Code', cell: (e: any) => `${e.BN2000code}` },
            { columnDef: 'BN2000berufsart', header: 'arbeitgeber.oste.label.BN2000-Berufsart', cell: (e: any) => `${e.BN2000berufsart}` },
            { columnDef: 'meldepflichtigIn', header: 'arbeitgeber.oste.label.meldepflichtigIn', cell: (e: any) => `${e.meldepflichtigIn}` }
        ],
        data: [],
        config: {
            sortField: 'bezeichnung',
            sortOrder: 1,
            displayedColumns: []
        }
    };

    constructor(
        private formBuilder: FormBuilder,
        private facadeService: FacadeService,
        private dataService: StesDataRestService,
        private osteRestService: OsteDataRestService,
        private infoPanelService: AmmInfopanelService
    ) {
        super();
    }

    ngOnInit(): void {
        this.setTableData([]);
        this.generateForm();
        this.getData();
        this.initToolBox();
        this.infoPanelService.dispatchInformation({
            subtitle: 'arbeitgeber.oste.topnavmenuitem.meldepflichtListe',
            hideInfobar: true
        });
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.updateData();
            this.reorderOptions();
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.infoPanelService.updateInformation({ hideInfobar: false });
    }

    updateData() {
        this.facadeService.spinnerService.activate(this.channel);
        const searchParams = this.mapToDTO();
        this.osteRestService
            .searchStellenangebotMeldepflichtigenBerufeList(searchParams)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe((response: BaseResponseWrapperListMeldepflichtDTOWarningMessages) => {
                if (response.data) {
                    this.writingDataIntoTable(response);
                }
            });
    }

    gesamtschweizerischChanged(value: boolean) {
        if (!this.searchForm.controls.kantonal.value && !value) {
            this.searchForm.controls.gesamtschweizerisch.setValue(true);
        }
    }

    kantonalChanged(value: boolean) {
        let currentValue = value;
        if (!this.searchForm.controls.gesamtschweizerisch.value && !currentValue) {
            currentValue = true;
            this.searchForm.controls.kantonal.setValue(currentValue);
        }
        this.updateDropdown(currentValue);
    }

    private getData() {
        this.facadeService.spinnerService.activate(this.channel);
        const searchParams = this.mapToDTO();
        forkJoin([this.dataService.getCode(DomainEnum.KANTON), this.osteRestService.searchStellenangebotMeldepflichtigenBerufeList(searchParams)])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe(([kantoneOptions, response]) => {
                this.kantoneOptions = this.facadeService.formUtilsService.mapDropdownKurztext(kantoneOptions);
                this.reorderOptions();
                if (response.data) {
                    this.writingDataIntoTable(response);
                }
            });
    }

    private reorderOptions() {
        this.kantoneOptions.sort(this.compareOptions(this.facadeService.translateService.currentLang));
    }

    private generateForm() {
        this.searchForm = this.formBuilder.group({
            gesamtschweizerisch: true,
            kantonal: true,
            kantonalDropdown: null
        });
    }

    private mapToDTO(): BerufMeldepflichtSuchenParamDTO {
        return {
            gesamtschweizerisch: this.searchForm.controls.gesamtschweizerisch.value,
            kantonal: this.searchForm.controls.kantonal.value,
            kantonId: this.searchForm.controls.kantonalDropdown.value
        };
    }

    private updateDropdown(currentValue) {
        if (!currentValue) {
            this.searchForm.controls.kantonalDropdown.disable();
            this.searchForm.controls.kantonalDropdown.setValue(null);
        } else {
            this.searchForm.controls.kantonalDropdown.enable();
        }
    }

    private setTableData(data: MeldepflichtDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: MeldepflichtDTO): any {
        return {
            bezeichnung: data.bezeichnung,
            BN2000code: data.chIscoCode,
            BN2000berufsart: data.chIscoBerufsart,
            meldepflichtigIn: data.kantone.reduce((v1, v2) => `${v1}, ${v2}`)
        };
    }

    private initToolBox() {
        ToolboxService.CHANNEL = this.channel;
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getStellenmeldepflichtBerufeConfig(), this.channel, null);

        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.tableConfig.data));
    }

    private compareOptions(currentLang: string) {
        const toSearch = currentLang.substring(0, 1).toUpperCase() + currentLang.substring(1);
        return (p1: any, p2: any) => p1[`label${toSearch}`].localeCompare(p2[`label${toSearch}`]);
    }

    private writingDataIntoTable(response: BaseResponseWrapperListMeldepflichtDTOWarningMessages) {
        this.rawData = response.data;
        this.infoPanelService.updateInformation({ tableCount: this.rawData.length });
        this.rawData.sort((v1, v2) => (v1.chIscoBerufsart > v2.chIscoBerufsart ? 1 : v1.chIscoBerufsart < v2.chIscoBerufsart ? -1 : 0));
        this.setTableData(this.rawData);
    }
}
