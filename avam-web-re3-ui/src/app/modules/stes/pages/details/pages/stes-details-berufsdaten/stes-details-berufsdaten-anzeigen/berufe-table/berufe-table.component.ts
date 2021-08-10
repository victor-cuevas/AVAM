import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StesBerufsdatenDTO } from '@dtos/stesBerufsdatenDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { GeschlechtPipe } from '@app/shared/pipes/geschlecht.pipe';

@Component({
    selector: 'avam-berufe-table',
    templateUrl: './berufe-table.component.html',
    styleUrls: ['./berufe-table.component.scss']
})
export class BerufeTableComponent implements OnInit {
    id = 'berufsdatenTable';
    @Output() dbClick: EventEmitter<any> = new EventEmitter<any>();
    @Input() public data: any[] = [];
    public displayedColumns = [];
    public columns = [];

    constructor(private dbTranslateService: DbTranslateService, private geschlechtPipe: GeschlechtPipe) {}

    ngOnInit() {
        this.setHeaders();
    }

    setHeaders() {
        this.columns = [
            {
                columnDef: 'berufsTaetigkeit',
                header: 'stes.label.vermittlung.berufTaetigkeit',
                cell: (element: any) => `${element.berufsTaetigkeit}`
            },
            {
                columnDef: 'dauer',
                header: 'stes.label.dauervonbis',
                cell: (element: any) => `${element.dauer}`
            },
            {
                columnDef: 'berufsFunktion',
                header: 'stes.label.funktion',
                cell: (element: any) => `${element.berufsFunktion}`
            },
            {
                columnDef: 'qualifikation',
                header: 'stes.label.qualifikation',
                cell: (element: any) => `${element.qualifikation}`
            },
            {
                columnDef: 'ausgeuebtB',
                header: 'stes.label.ausgeuebt',
                cell: (element: any) => `${element.ausgeuebtB}`
            },
            {
                columnDef: 'zuletztB',
                header: 'stes.label.zuletzt',
                cell: (element: any) => `${element.zuletztB}`
            },
            {
                columnDef: 'gesuchtB',
                header: 'stes.label.gesucht',
                cell: (element: any) => `${element.gesuchtB}`
            },
            { columnDef: 'actions', header: '', cell: () => '', fixWidth: true }
        ];

        this.displayedColumns = this.columns.map(c => c.columnDef);
    }

    public setData(dataSource: StesBerufsdatenDTO[], geschlecht: string) {
        this.data = [];
        dataSource.forEach(row => {
            this.data.push({
                berufsTaetigkeit: this.dbTranslateService.translate(row.berufsTaetigkeitObject, this.geschlechtPipe.transform('bezeichnung', geschlecht)),
                dauer: row.dauer,
                berufsFunktion: row.berufsFunktionObject ? this.dbTranslateService.translate(row.berufsFunktionObject, 'text') : '',
                qualifikation: row.qualifikationObject ? this.dbTranslateService.translate(row.qualifikationObject, 'text') : '',
                ausgeuebtB: row.ausgeuebtB ? 'X' : '-',
                zuletztB: row.zuletztB ? 'X' : '-',
                gesuchtB: row.gesuchtB ? 'X' : '-',
                stesBerufsqualifikationID: row.stesBerufsqualifikationID
            });
        });
    }

    public onClick(row) {
        this.dbClick.emit(row);
    }
}
