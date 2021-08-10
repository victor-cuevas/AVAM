import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { GeschaeftMeldungDTO } from '@dtos/geschaeftMeldungDTO';
import { GekoMeldungService } from '@modules/geko/services/geko-meldung.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { GeschaeftMeldungRow } from '@shared/classes/abstract-meldungen-result-form';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-meldungen-table',
    templateUrl: './meldungen-table.component.html',
    styleUrls: ['./meldungen-table.component.scss']
})
export class MeldungenTableComponent extends Unsubscribable implements OnInit, OnDestroy {
    selectedRow: any;
    selectedRows: any[] = [];
    selection: any;
    @Input() stateKey: string;
    @Input() showName = true;
    @Input() forPrinting = false;
    _sourceData: GeschaeftMeldungDTO[];
    @Input() set sourceData(data: GeschaeftMeldungDTO[]) {
        this._sourceData = data;
        this.tableData = this.gekoMeldungService.mapDtoToTable(data);
        this.checkRows(this.idsToRestoreChecks);
    }

    tableData: GeschaeftMeldungRow[];
    // onCheck emits true if at least one row is selected, false otherwise
    @Output() onCheck = new EventEmitter<boolean>();
    @Output() onDeleteSingleRow = new EventEmitter<GeschaeftMeldungRow>();
    @Output() onPrimaryAction = new EventEmitter<GeschaeftMeldungRow>();
    allchecked = false;
    idsToRestoreChecks: number[] = null;

    tableColumns = [
        { columnDef: 'checkbox', header: 'Checkbox', cell: (element: any) => `${element.checkbox}`, width: '50px' },
        { columnDef: 'envelope', header: 'Envelope', cell: (element: any) => `${element.gelesen}`, width: '60px', sortable: true },
        { columnDef: 'createdOn', header: 'geko.label.erstelltAm', cell: (element: any) => element.erstelltAm, sortable: true },
        { columnDef: 'geschaeftsart', header: 'geko.label.geschaeftsart', cell: (element: any) => element.geschaeftsart, sortable: true },
        { columnDef: 'meldungsText', header: 'geko.label.meldungstext', cell: (element: any) => this.prepareMeldungsText(element), sortable: true },
        { columnDef: 'name', header: 'stes.label.name', cell: (element: any) => `${element.displayName}`, sortable: true },
        { columnDef: 'responsible', header: 'geko.label.zustandig', cell: (element: any) => this.getZustandig(element), sortable: true },
        { columnDef: 'identificationNumber', header: 'geko.label.identifikation', cell: (element: any) => `${element.meldungId}`, sortable: true },
        { columnDef: 'actions', header: '', cell: (element: any) => `${element.actions}`, width: '100px' }
    ];

    displayedTableColumns: string[];

    constructor(private gekoMeldungService: GekoMeldungService, private dbTranslateService: DbTranslateService) {
        super();
    }

    sortFunction(event: any) {
        switch (event.field) {
            case 'envelope':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = data1.gelesen;
                    const value2 = data2.gelesen;
                    return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
                });
                break;
            case 'createdOn':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = data1.erstelltAm;
                    const value2 = data2.erstelltAm;
                    return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
                });
                break;
            case 'geschaeftsart':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = this.dbTranslateService.translate(data1.geschaeftsart, 'kurzText');
                    const value2 = this.dbTranslateService.translate(data2.geschaeftsart, 'kurzText');
                    return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
                });
                break;
            case 'meldungsText':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = data1.displayMeldungsText;
                    const value2 = data2.displayMeldungsText;
                    return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
                });
                break;
            case 'name':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = this.getName(data1);
                    const value2 = this.getName(data2);
                    return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
                });
                break;
            case 'responsible':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = this.getZustandig(data1);
                    const value2 = this.getZustandig(data2);
                    return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
                });
                break;
            case 'identificationNumber':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = data1.meldungId;
                    const value2 = data2.meldungId;
                    return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
                });
                break;
        }
    }

    ngOnInit() {
        this.displayedTableColumns = this.tableColumns.map(c => c.columnDef).filter(d => (this.showName ? true : d !== 'name'));
        if (this.forPrinting) {
            this.displayedTableColumns = this.displayedTableColumns.filter(d => d !== 'checkbox' && d !== 'actions');
        }
    }

    getStateKey() {
        return this.forPrinting ? this.stateKey + this.gekoMeldungService.printStateSuffix : this.stateKey;
    }

    getName(meldung: GeschaeftMeldungDTO) {
        return this.gekoMeldungService.getName(meldung);
    }

    getZustandig(meldung: GeschaeftMeldungDTO) {
        return this.gekoMeldungService.getZustandig(meldung);
    }

    onOpen(row) {
        this.onPrimaryAction.emit(row);
    }

    onDeleteRow(row) {
        this.onDeleteSingleRow.emit(row);
    }

    checkRows(ids: number[]) {
        if (ids && ids.length > 0) {
            this.tableData.filter(r => ids.indexOf(r.meldungId) > -1).forEach(row => (row.checked = true));
        }
        this.selectedRows = this.tableData.filter(r => r.checked === true);
        this.trackAllChecked();
        this.onCheck.emit(this.selectedRows.length > 0);
    }

    checkbox(row) {
        if (!row.checked) {
            row.checked = true;
            this.selectedRows.push(row);
            this.trackAllChecked();
        } else {
            row.checked = false;
            this.allchecked = false;
            this.selectedRows = this.selectedRows.filter(r => r.checked === true);
        }
        this.onCheck.emit(this.selectedRows.length > 0);
    }

    checkAll() {
        this.allchecked = !this.allchecked;

        this.tableData.forEach(row => (row.checked = this.allchecked));

        this.selectedRows = this.allchecked ? this.tableData.slice() : [];
        this.onCheck.emit(this.selectedRows.length > 0);
    }

    private trackAllChecked() {
        this.allchecked = this.selectedRows.length > 0 && this.selectedRows.length === this.tableData.length;
    }

    private prepareMeldungsText(element: any): any {
        element.displayMeldungsText = this.dbTranslateService.translate(element.meldungsTextObj, 'kurzText');
        const translatedText = this.dbTranslateService.translate(element.meldungsTextObj, 'text');
        const replacementValues = element.meldungsText.split(';');
        if (replacementValues.length <= 2) {
            element.displayToolTipMeldungsText = translatedText;
        } else {
            replacementValues.shift();
            replacementValues.pop();
            element.displayToolTipMeldungsText = this.replaceParams(translatedText, replacementValues);
        }
        return element;
    }

    private replaceParams(parametrizedText: string, replacementValues: string[]) {
        return parametrizedText.replace(/{(\d+)}/g, function() {
            return replacementValues[arguments[1]];
        });
    }
}
