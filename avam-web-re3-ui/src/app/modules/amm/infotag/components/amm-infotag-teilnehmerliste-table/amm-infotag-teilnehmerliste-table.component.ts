import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Component({
    selector: 'avam-amm-infotag-teilnehmerliste-table',
    templateUrl: './amm-infotag-teilnehmerliste-table.component.html',
    styleUrls: ['./amm-infotag-teilnehmerliste-table.component.scss']
})
export class AmmInfotagTeilnehmerlisteTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() parentForm: FormGroup;
    @Input() isDfVonInFuture: boolean;

    columns = [
        { columnDef: 'checkbox', header: 'amm.infotag.label.praesenzstatusSelektieren', width: '45px' },
        { columnDef: 'kanton', header: 'common.label.kanton', cell: (element: any) => (element.kanton ? `${element.kanton}` : '') },
        { columnDef: 'platz', header: 'amm.nutzung.label.platz', cell: (element: any) => (element.platz ? `${element.platz}` : '') },
        { columnDef: 'teilnehmer', header: 'amm.nutzung.label.teilnehmer', cell: (element: any) => (element.teilnehmer ? `${element.teilnehmer}` : '') },
        { columnDef: 'personenNr', header: 'amm.nutzung.label.personennr', cell: (element: any) => (element.personenNr ? `${element.personenNr}` : '') },
        { columnDef: 'bearbeitung', header: 'amm.nutzung.label.bearbeitung', cell: (element: any) => (element.bearbeitung ? `${element.bearbeitung}` : '') },
        { columnDef: 'buchungsdatum', header: 'amm.nutzung.label.datumBuchung', cell: (element: any) => (element.buchungsdatum ? `${element.buchungsdatum}` : '') },
        { columnDef: 'personalberater', header: 'amm.nutzung.label.personalberater', cell: (element: any) => (element.personalberater ? `${element.personalberater}` : '') },
        { columnDef: 'statusCode', header: 'amm.infotag.label.praesenzstatus', cell: (element: any) => element.statusCode }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    PRAESENZSTATUS_TEILGENOMMEN = '1';
    PRAESENZSTATUS_ENTSCHULDIGT = '2';
    PRAESENZSTATUS_UNENTSCHULDIGT = '3';
    constructor(private dbTranslateService: DbTranslateService) {}

    ngOnInit() {}

    sortFunction(event) {
        if (event.field === 'statusCode') {
            event.data.sort((value1, value2) => {
                const val1 = this.getStatus(value1[event.field]);
                const val2 = this.getStatus(value2[event.field]);
                if (event.order === 1) {
                    return val1.localeCompare(val2);
                }
                if (event.order === -1) {
                    return val2.localeCompare(val1);
                }
            });
        } else {
            event.data.sort((value1, value2) => {
                if (event.order === 1) {
                    return value1[event.field] - value2[event.field];
                }
                if (event.order === -1) {
                    return value2[event.field] - value1[event.field];
                }
            });
        }
    }

    private getStatus(status: CodeDTO): string {
        return status ? this.dbTranslateService.translate(status, 'kurzText') : this.dbTranslateService.instant('common.message.keineauswahl');
    }
}
