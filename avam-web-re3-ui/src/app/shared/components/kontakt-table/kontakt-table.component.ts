import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { UnternehmenTerminViewDTO } from '@dtos/unternehmenTerminViewDTO';

@Component({
    selector: 'avam-kontakt-table',
    templateUrl: './kontakt-table.component.html'
})
export class KontaktTableComponent implements OnInit {
    @Input() stateKey: string;
    @Input() forPrinting = false;
    @Input() tableData: UnternehmenTerminViewDTO[];
    @Output() onPrimaryAction = new EventEmitter<UnternehmenTerminViewDTO>();
    printStateSuffix = '_forPrint';
    tableColumns = [
        {
            columnDef: 'kontaktdatum',
            header: 'unternehmen.label.kontaktdatum',
            cell: (element: any) => element.datum,
            sortable: true
        },
        {
            columnDef: 'zeit',
            header: 'unternehmen.label.termin.zeitVonBis',
            cell: (element: UnternehmenTerminViewDTO) => this.getZeitVonBis(element),
            sortable: true
        },
        {
            columnDef: 'kontaktperson',
            header: 'unternehmen.label.kontaktperson',
            cell: (element: UnternehmenTerminViewDTO) => this.getKontaktperson(element),
            sortable: true
        },
        {
            columnDef: 'ort',
            header: 'unternehmen.label.ort',
            cell: (element: UnternehmenTerminViewDTO) => element.ort,
            sortable: true
        },
        {
            columnDef: 'grund',
            header: 'unternehmen.label.termin.grundkontakt',
            cell: (element: UnternehmenTerminViewDTO) => element,
            sortable: true
        },
        {
            columnDef: 'art',
            header: 'unternehmen.label.termin.artkontakt',
            cell: (element: UnternehmenTerminViewDTO) => element,
            sortable: true
        },
        {
            columnDef: 'schlagworte',
            header: 'unternehmen.label.termin.schlagworte',
            cell: (element: UnternehmenTerminViewDTO) => element,
            sortable: true
        },
        {
            columnDef: 'status',
            header: 'common.label.status',
            cell: (element: UnternehmenTerminViewDTO) => element,
            sortable: true
        },
        { columnDef: 'actions', header: '', cell: (element: any) => `${element.actions}`, width: '100px' }
    ];
    displayedTableColumns = this.tableColumns.map(c => c.columnDef);

    constructor(private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        if (this.forPrinting) {
            this.displayedTableColumns = this.displayedTableColumns.filter(d => d !== 'actions');
        }
    }

    getStateKey() {
        return this.forPrinting ? this.stateKey + this.printStateSuffix : this.stateKey;
    }

    onOpen(row) {
        this.onPrimaryAction.emit(row);
    }

    sortFunction(event: any) {
        switch (event.field) {
            case 'kontaktdatum':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = data1.datum;
                    const value2 = data2.datum;
                    return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
                });
                break;
            case 'grund':
                this.tableData = event.data.sort((data1, data2) => {
                    return this.sortWithTranslate(event, data1, data2, 'kontaktGrund');
                });
                break;
            case 'art':
                this.tableData = event.data.sort((data1, data2) => {
                    return this.sortWithTranslate(event, data1, data2, 'kontaktArt');
                });
                break;
            case 'schlagworte':
                this.tableData = event.data.sort((data1, data2) => {
                    return this.sortWithTranslate(event, data1, data2, 'schlagwortList');
                });
                break;
            case 'status':
                this.tableData = event.data.sort((data1, data2) => {
                    return this.sortWithTranslate(event, data1, data2, 'status');
                });
                break;
            case 'zeit':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = `${data1.zeitVon} ${data1.zeitBis}`;
                    const value2 = `${data2.zeitVon} ${data2.zeitBis}`;
                    return KontaktTableComponent.sort(event, value1 ? value1 : '', value2 ? value2 : '');
                });
                break;
            case 'kontaktperson':
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = `${data1.kontaktpersonVorname} ${data1.kontaktpersonName}`;
                    const value2 = `${data2.kontaktpersonVorname} ${data2.kontaktpersonName}`;
                    return KontaktTableComponent.sort(event, value1 ? value1 : '', value2 ? value2 : '');
                });
                break;
            default:
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = data1[event.field];
                    const value2 = data2[event.field];
                    return KontaktTableComponent.sort(event, value1 ? value1 : '', value2 ? value2 : '');
                });
                break;
        }
    }

    private getZeitVonBis(dto: UnternehmenTerminViewDTO): string {
        if (dto.zeitVon && dto.zeitBis) {
            return `${dto.zeitVon} - ${dto.zeitBis}`;
        } else {
            return null;
        }
    }

    private getKontaktperson(dto: UnternehmenTerminViewDTO): string {
        return dto.kontaktpersonVorname ? `${dto.kontaktpersonName} ${dto.kontaktpersonVorname}` : `${dto.kontaktpersonName}`;
    }

    private static sort(event: any, value1: any, value2: any): number {
        return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
    }

    private sortWithTranslate(event: any, data1: any, data2: any, propertyPrefix: string): number {
        const value1 = this.dbTranslateService.translate(data1, propertyPrefix);
        const value2 = this.dbTranslateService.translate(data2, propertyPrefix);
        return KontaktTableComponent.sort(event, value1, value2);
    }
}
