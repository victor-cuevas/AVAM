import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MeldepflichtEnum } from '@shared/enums/table-icon-enums';
import { FormArray, FormBuilder } from '@angular/forms';

@Component({
    selector: 'avam-common-wrapper-table',
    templateUrl: './common-wrapper-table.component.html',
    styleUrls: ['./common-wrapper-table.component.scss']
})
export class CommonWrapperTableComponent implements OnInit {
    @Input() public tableForm = this.fb.group({ headerControl: false, tableRows: this.fb.array([]) });
    @Input() public shouldFocusInitialRow = true;
    @Input() public dataSource: any[];
    @Input() public columns: any[];
    @Input() public stateKey: string;
    @Input() public config: {
        displayedColumns: any;
        sortField: string;
        sortOrder: number;
        maxHeight: number;
        disabledButtonRow: boolean;
    };

    @Output() public onRowSelect: EventEmitter<any> = new EventEmitter();
    @Output() public onEmail: EventEmitter<any> = new EventEmitter();

    get formArray() {
        return this.tableForm.controls.tableRows as FormArray;
    }

    meldepflichtEnum = MeldepflichtEnum;

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.tableForm.controls['headerControl'].valueChanges.subscribe(bool => {
            const rowGroups = this.tableForm.controls['tableRows'] as FormArray;
            rowGroups.patchValue(Array(rowGroups.length).fill(bool), { emitEvent: false });
        });

        this.tableForm.get('tableRows').valueChanges.subscribe(values => {
            if (values.length) {
                const allSelected = values.every(boolean => boolean);
                if (this.tableForm.get('headerControl').value !== allSelected) {
                    this.tableForm.get('headerControl').patchValue(allSelected, { emitEvent: false });
                }
            }
        });
    }

    onMailTo(row: any) {
        this.onEmail.emit(row);
    }

    private onClick(row): void {
        this.onRowSelect.emit(row);
    }

    private isNotSpecialColumn(item): boolean {
        return item.columnDef !== 'actions' && item.columnDef !== 'flag' && item.columnDef !== 'exclamation' && item.columnDef !== 'checkbox';
    }
}
