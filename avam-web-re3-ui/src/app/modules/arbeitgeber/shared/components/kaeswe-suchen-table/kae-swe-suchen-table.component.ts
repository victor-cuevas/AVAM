import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { VoranmeldungKaeSuchenResponseDTO } from '@dtos/voranmeldungKaeSuchenResponseDTO';
import { MeldungSweOverviewListDTO } from '@dtos/meldungSweOverviewListDTO';
import { CodeDTO } from '@dtos/codeDTO';

@Component({
    selector: 'avam-kaeswe-suchen-table',
    templateUrl: './kae-swe-suchen-table.component.html'
})
export class KaeSweSuchenTableComponent implements OnInit {
    @Input() gesamtbetriebCode: CodeDTO;
    @Input() stateKey: string;
    @Input() forPrinting = false;
    @Input() tableData: VoranmeldungKaeSuchenResponseDTO[] | MeldungSweOverviewListDTO[];
    @Output() onPrimaryAction = new EventEmitter<VoranmeldungKaeSuchenResponseDTO | MeldungSweOverviewListDTO>();
    printStateSuffix = '_forPrint';
    tableColumns = [
        {
            columnDef: 'burNr',
            header: 'kaeswe.label.burnr',
            cell: (element: VoranmeldungKaeSuchenResponseDTO | MeldungSweOverviewListDTO) => `${element.burNr}`,
            sortable: true
        },
        {
            columnDef: 'arbeitgeber',
            header: 'kaeswe.label.arbeitgeber',
            cell: (element: VoranmeldungKaeSuchenResponseDTO | MeldungSweOverviewListDTO) => element.arbeitgeber,
            sortable: true
        },
        {
            columnDef: 'ort',
            header: 'unternehmen.label.ort',
            cell: (element: VoranmeldungKaeSuchenResponseDTO | MeldungSweOverviewListDTO) => element,
            sortable: true
        },
        {
            columnDef: 'betriebsabteilung',
            header: 'kaeswe.label.betriebsabteilung',
            cell: (element: VoranmeldungKaeSuchenResponseDTO | MeldungSweOverviewListDTO) => element.betriebsabteilung,
            sortable: true
        },
        {
            columnDef: 'betriebsabteilungNr',
            header: 'kaeswe.label.nr',
            cell: (element: VoranmeldungKaeSuchenResponseDTO | MeldungSweOverviewListDTO) => this.getBetriebsabteilungNr(element),
            sortable: true
        },
        {
            columnDef: 'numEntscheide',
            header: 'kaeswe.label.anzahlentscheide',
            cell: (element: VoranmeldungKaeSuchenResponseDTO | MeldungSweOverviewListDTO) => `${element.numEntscheide}`,
            sortable: true
        },
        { columnDef: 'actions', header: '', cell: (element: any) => `${element.actions}`, width: '60px' }
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

    sortFunction(event: { data: any; field: string; order: number }) {
        switch (event.field) {
            case 'ort':
                this.tableData = event.data.sort((data1, data2) => {
                    return this.sortWithTranslate(event, data1, data2, 'ort');
                });
                break;
            case 'betriebsabteilungNr':
                this.tableData = event.data.sort((data1, data2) => {
                    if (this.isGesamtbetrieb(data1)) {
                        return this.isGesamtbetrieb(data2) ? 0 : -event.order;
                    }
                    if (this.isGesamtbetrieb(data2)) {
                        return event.order;
                    }
                    return KaeSweSuchenTableComponent.sort(event, data1.betriebsabteilungNr, data2.betriebsabteilungNr);
                });
                break;
            default:
                this.tableData = event.data.sort((data1, data2) => {
                    const value1 = data1[event.field];
                    const value2 = data2[event.field];
                    return KaeSweSuchenTableComponent.sort(event, value1 ? value1 : '', value2 ? value2 : '');
                });
                break;
        }
    }

    private static sort(event: any, value1: any, value2: any): number {
        return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
    }

    private sortWithTranslate(event: any, data1: any, data2: any, propertyPrefix: string): number {
        const value1 = this.dbTranslateService.translate(data1, propertyPrefix);
        const value2 = this.dbTranslateService.translate(data2, propertyPrefix);
        return KaeSweSuchenTableComponent.sort(event, value1, value2);
    }

    private isGesamtbetrieb(row: VoranmeldungKaeSuchenResponseDTO | MeldungSweOverviewListDTO): boolean {
        return row.betriebsabteilung === this.dbTranslateService.translate(this.gesamtbetriebCode, 'text');
    }

    /**
     *  Bedingte Systemverhalten und Plausibilitaeten BSP1
     */
    private getBetriebsabteilungNr(row: VoranmeldungKaeSuchenResponseDTO | MeldungSweOverviewListDTO): string {
        let betriebasabteilungNr = '';
        if (!this.isGesamtbetrieb(row)) {
            if (row.betriebsabteilungNr && !isNaN(row.betriebsabteilungNr) && Number(row.betriebsabteilungNr).valueOf() > 0) {
                betriebasabteilungNr = String(row.betriebsabteilungNr);
            }
        }
        return betriebasabteilungNr;
    }
}
