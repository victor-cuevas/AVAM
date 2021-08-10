import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { MeldepflichtEnum } from '@shared/enums/table-icon-enums';

@Component({
    selector: 'avam-mutationsantraege-anzeigen-table',
    templateUrl: './mutationsantraege-anzeigen-table.component.html',
    styleUrls: ['./mutationsantraege-anzeigen-table.component.scss']
})
export class MutationsantraegeAnzeigenTableComponent implements OnInit {
    @Input() public tableForm = this.fb.group({ headerControl: false, tableRows: this.fb.array([]) });
    @Input() public dataSource: any[];
    @Input() public columns: any[];
    @Input() public config: {
        displayedColumns: any;
        sortField: string;
        sortOrder: number;
        maxHeight: number;
    };
    @Output() public sortEvent: EventEmitter<any> = new EventEmitter();
    @Output() public onRowSelect: EventEmitter<any> = new EventEmitter();

    get formArray() {
        return this.tableForm.controls.tableRows as FormArray;
    }

    meldepflichtEnum = MeldepflichtEnum;

    constructor(private fb: FormBuilder) {}

    public ngOnInit(): void {
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

    public sortFunction(event): void {
        this.sortEvent.emit(event);
    }

    private onClick(row): void {
        this.onRowSelect.emit(row);
    }

    private isNotSpecialColumn(item): boolean {
        return item.columnDef !== 'actions' && item.columnDef !== 'flag' && item.columnDef !== 'exclamation' && item.columnDef !== 'checkbox';
    }
}
