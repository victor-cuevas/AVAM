import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Component({
    selector: 'avam-sprache-table',
    templateUrl: './sprache-table.component.html',
    styleUrls: ['./sprache-table.component.scss']
})
export class SpracheTableComponent implements OnInit {
    id = 'spracheTable';
    @Input() dataSource: any[] = [];
    @Input() selectedItem;

    @Output() dbClick: EventEmitter<any> = new EventEmitter<any>();

    displayedColumns = [];
    columns = [];
    data = [];
    selectedRow = 0;

    constructor(private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.setHeaders();
        if (this.selectedItem) {
            this.selectedRow = this.dataSource.findIndex(data => data.code === this.selectedItem.code);
        }
        this.setData(this.dataSource);
    }

    setHeaders() {
        this.columns = [
            {
                columnDef: 'code',
                header: 'common.label.code',
                cell: (element: any) => `${element.code}`,
                width: '105px'
            },
            {
                columnDef: 'bezeichnung',
                header: 'common.label.bezeichnung',
                cell: (element: any) => `${element.bezeichnung}`
            },
            { columnDef: 'actions', header: '', cell: () => '', width: '50px' }
        ];

        this.displayedColumns = this.columns.map(c => c.columnDef);
    }

    public setData(dataSource: any[]) {
        this.data = [];
        dataSource.forEach(row => {
            this.data.push({
                code: Number(row.code),
                bezeichnung: this.dbTranslateService.translate(row, 'text')
            });
        });
    }

    public onClick(row) {
        this.dbClick.emit(row);
    }
}
