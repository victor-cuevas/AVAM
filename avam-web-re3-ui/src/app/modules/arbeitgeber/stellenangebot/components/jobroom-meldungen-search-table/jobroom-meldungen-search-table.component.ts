import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FacadeService } from '@shared/services/facade.service';
import { IOsteEgovDTO } from '@dtos/iOsteEgovDTO';
import * as moment from 'moment';

@Component({
    selector: 'avam-jobroom-meldungen-search-table',
    templateUrl: './jobroom-meldungen-search-table.component.html',
    styleUrls: ['./jobroom-meldungen-search-table.component.scss']
})
export class JobroomMeldungenSearchTableComponent implements OnInit {
    @Input('isPrintModal') isPrintModal = false;
    @Input() set searchResult(dtoArray: IOsteEgovDTO[]) {
        this.dtoArray = dtoArray;
        if (dtoArray.length) {
            this.dtoArray.sort((v1, v2) => v1.bezeichnung.localeCompare(v2.bezeichnung));
            this.setTableData(this.dtoArray);
        } else {
            this.setTableData([]);
        }
    }
    @Input() meldeartOptions = [];
    @Output() rowSelected = new EventEmitter();
    JOBROOM_ANMELDUNG_TEXT = '0';
    JOBROOM_ABMELDUNG_TEXT = '1';
    dtoArray: any[];
    baseTableConfig = {
        columns: [
            {
                columnDef: 'flag',
                header: 'arbeitgeber.oste.label.stelleMeldepflicht',
                cell: (element: any) => `${element.flag}`,
                fixWidth: true
            },
            {
                columnDef: 'meldedatum',
                header: 'arbeitgeber.oste.label.meldedatum',
                cell: (element: any) => `${this.facadeService.formUtilsService.formatDateNgx(element.meldedatum, 'DD.MM.YYYY') || ''}`
            },
            { columnDef: 'meldeart', header: 'arbeitgeber.oste.label.meldeart', cell: (element: any) => `${element.meldeart || ''}` },
            { columnDef: 'stellenbezeichnung', header: 'arbeitgeber.label.stellenbezeichnung', cell: (element: any) => `${element.stellenbezeichnung || ''}` },
            { columnDef: 'arbeitsort', header: 'arbeitgeber.oste.label.arbeitsort', cell: (element: any) => `${element.arbeitsort || ''}` },
            { columnDef: 'name', header: 'benutzerverwaltung.label.name', cell: (element: any) => `${element.name || ''}` },
            { columnDef: 'strasseNr', header: 'common.label.strassenr', cell: (element: any) => `${element.strasseNr || ''}` },
            { columnDef: 'ort', header: 'stes.label.ort', cell: (element: any) => `${element.ort || ''}` },
            { columnDef: 'benutzerstelle', header: 'unternehmen.label.benutzerstelle', cell: (element: any) => `${element.benutzerstelle || ''}` },
            { columnDef: 'jobroomNr', header: 'arbeitgeber.oste.label.jobroomnr', cell: (element: any) => `${element.jobroomNr || ''}` },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'meldedatum',
            sortOrder: 1,
            displayedColumns: []
        }
    };
    tableConfig;

    constructor(private facadeService: FacadeService) {}

    ngOnInit() {
        this.facadeService.translateService.onLangChange.subscribe(() => {
            this.setTableData(this.dtoArray);
        });
    }

    selectItem(selectedRow) {
        this.rowSelected.emit(selectedRow);
    }

    private setTableData(data: IOsteEgovDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
        if (this.isPrintModal) {
            this.tableConfig.config.displayedColumns = this.tableConfig.config.displayedColumns.filter(col => col !== 'actions');
        }
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
    }

    private createRow(data: IOsteEgovDTO) {
        let meldedatum = null;
        if (data.detailangabenCode === this.JOBROOM_ANMELDUNG_TEXT) {
            const avoidDateTypeError = data.erfasstAm as any;
            const formattedDate = moment(avoidDateTypeError).format('L');
            meldedatum = moment(formattedDate).valueOf();
        } else if (data.anmeldeDatum && data.detailangabenCode === this.JOBROOM_ABMELDUNG_TEXT && data.anmeldeDatum.length >= 10) {
            meldedatum = moment(data.anmeldeDatum.substr(0, 10)).valueOf();
        }
        return {
            flag: data.meldepflicht ? 'showWithoutTooltip' : '',
            meldedatum,
            meldeart: this.facadeService.dbTranslateService.translate(this.meldeartOptions.find(item => item.code === data.detailangabenCode), 'label'),
            stellenbezeichnung: data.bezeichnung,
            arbeitsort: data.arbeitsOrtOrt,
            name: data.untName,
            strasseNr: `${data.untStrasse || ''} ${data.untHausNr || ''}`,
            ort: data.untOrt,
            benutzerstelle: data.arbeitsamtBereich,
            jobroomNr: data.stellennummerEgov,
            additionalData: data
        };
    }
}
