import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'avam-listekopie-table',
    templateUrl: './listekopie-table.component.html'
})
export class ListekopieTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() displayBudgetwerte: boolean;
    columns = [
        { columnDef: 'institution', header: 'common.label.institution', cell: (element: any) => `${element.institution}` },
        { columnDef: 'kanton', header: 'common.label.kanton', cell: (element: any) => `${element.kanton}` },
        { columnDef: 'elementname', header: 'amm.administration.label.elementname', cell: (element: any) => `${element.elementname}` }
    ];
    displayedColumns: any[];

    constructor() {}

    ngOnInit() {
        if (this.displayBudgetwerte) {
            this.columns.push(
                { columnDef: 'chf', header: 'common.label.chf', cell: (element: any) => `${element.chf}` },
                { columnDef: 'tntage', header: 'common.label.tntage', cell: (element: any) => `${element.tntage}` },
                { columnDef: 'tn', header: 'common.label.tn', cell: (element: any) => `${element.tn}` }
            );
        }
        this.displayedColumns = this.columns.map(c => c.columnDef);
    }
}
