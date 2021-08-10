import { Component, OnInit, Input } from '@angular/core';
import { FormArray } from '@angular/forms';

@Component({
    selector: 'avam-teilbudget-auswaehlen-table',
    templateUrl: './teilbudget-auswaehlen-table.component.html'
})
export class TeilbudgetAuswaehlenTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() rowCheckboxes: FormArray;

    columns = [
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '50px' },
        { columnDef: 'institutionText', header: 'common.label.institution', cell: (element: any) => `${element.institutionText}` },
        { columnDef: 'kantonText', header: 'common.label.kanton', cell: (element: any) => `${element.kantonText}` },
        { columnDef: 'jahr', header: 'common.label.datum.jahr', cell: (element: any) => `${element.jahr}` },
        { columnDef: 'version', header: 'common.label.version', cell: (element: any) => `${element.version}` },
        { columnDef: 'statusText', header: 'common.label.status', cell: (element: any) => `${element.statusText}` }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor() {}

    ngOnInit() {}

    onCheckboxChange(index: number, change: boolean) {
        if (change) {
            for (let i = 0; i < this.rowCheckboxes.controls.length; i++) {
                if (i !== index && this.rowCheckboxes.controls[i].value) {
                    this.rowCheckboxes.controls[i].setValue(false);
                }
            }
        }
    }
}
