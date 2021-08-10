import { Component, Input, OnInit } from '@angular/core';
import { RahmenfristProUnternehmenDTO } from '@dtos/rahmenfristProUnternehmenDTO';

@Component({
    selector: 'avam-details-pro-rahmenfrist-table',
    templateUrl: './details-pro-rahmenfrist-table.component.html',
    styleUrls: ['./details-pro-rahmenfrist-table.component.scss']
})
export class DetailsProRahmenfristTableComponent implements OnInit {
    @Input() dataSource: RahmenfristProUnternehmenDTO[];
    @Input() forPrinting = false;

    private readonly betriebsabteilungLabel = 'kaeswe.label.betriebsabteilung';
    private readonly nrLabel = 'kaeswe.label.nr';
    private readonly rahmenfristNrLabel = 'kaeswe.label.rahmenfristnr';
    private readonly vonLabel = 'common.label.von';
    private readonly bisLabel = 'common.label.bis';
    private readonly alkZahlstelleLabel = 'kaeswe.label.alkzahlstelle';
    private readonly ksLabel = 'kaeswe.label.kunds';
    private readonly kae85Label = 'kaeswe.label.kaegroesser85space';
    private readonly sweLabel = 'kaeswe.label.swe';

    private readonly betriebsabteilung = 'betriebsabteilung';
    private readonly betriebsabteilungNr = 'betriebsabteilungNr';
    private readonly rahmenfristNr = 'rahmenfristNr';
    private readonly rahmenfristVon = 'rahmenfristVon';
    private readonly rahmenfristBis = 'rahmenfristBis';
    private readonly zahlstelle = 'zahlstelle';
    private readonly bezApKs = 'bezApKs';
    private readonly bezApKae85 = 'bezApKae85';
    private readonly bezApSwe = 'bezApSwe';

    tableColumns: { columnDef: string; header: string; cell: any; sortable: boolean; dataType?: any }[] = [
        { columnDef: this.betriebsabteilung, header: this.betriebsabteilungLabel, cell: (element: any) => `${element.betriebsabteilung}`, sortable: true },
        { columnDef: this.betriebsabteilungNr, header: this.nrLabel, cell: (element: any) => `${this.emptyIfZero(element.betriebsabteilungNr)}`, sortable: true },
        { columnDef: this.rahmenfristNr, header: this.rahmenfristNrLabel, cell: (element: any) => `${this.emptyIfZero(element.rahmenfristNr)}`, sortable: true },
        { columnDef: this.rahmenfristVon, header: this.vonLabel, dataType: 'date', cell: (element: any) => `${element.rahmenfristVon}`, sortable: true },
        { columnDef: this.rahmenfristBis, header: this.bisLabel, dataType: 'date', cell: (element: any) => `${element.rahmenfristBis}`, sortable: true },
        { columnDef: this.zahlstelle, header: this.alkZahlstelleLabel, cell: (element: any) => `${element.zahlstelle}`, sortable: true },
        { columnDef: this.bezApKs, header: this.ksLabel, cell: (element: any) => `${this.emptyIfZero(element.bezApKs)}`, sortable: true },
        { columnDef: this.bezApKae85, header: this.kae85Label, cell: (element: any) => `${this.emptyIfZero(element.bezApKae85)}`, sortable: true },
        { columnDef: this.bezApSwe, header: this.sweLabel, cell: (element: any) => `${this.emptyIfZero(element.bezApSwe)}`, sortable: true }
    ];

    displayedColumns: string[] = this.tableColumns.map(c => c.columnDef);
    readonly stateKey = 'details-pro-rahmenfrist-table-stateKey';

    constructor() {}

    ngOnInit() {}

    private emptyIfZero(numericData: number): string {
        return numericData && numericData > 0 ? numericData.toString() : '';
    }
}
