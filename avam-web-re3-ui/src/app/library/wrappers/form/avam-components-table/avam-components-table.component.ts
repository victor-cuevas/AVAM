import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, FormGroupDirective, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { SpinnerService } from 'oblique-reactive';
import { GenericConfirmComponent } from '@app/shared';
import * as uuid from 'uuid';

@Component({
    selector: 'avam-components-table',
    templateUrl: './avam-components-table.component.html',
    styleUrls: ['./avam-components-table.component.scss'],
    providers: [ObliqueHelperService],
    encapsulation: ViewEncapsulation.None
})
export class AvamComponentsTableComponent implements OnInit, OnDestroy {
    data: any[] = [];
    displayedColumns: any;
    components: FormArray;
    rows: FormArray;
    form: FormGroup;
    selection: number;
    selectedRow;
    disableDeleteButton = false;
    visible = true;
    createdRow = false;
    _restrictDelete = true;

    onDataChange$: Subject<any> = new Subject();

    @Input('columns') columns;
    @Input('recalculateMaxHeight') recalculateMaxHeight;
    @Input('maxHeight') maxHeight;
    @Input('sortField') sortField;
    @Input('sortOrder') sortOrder;

    /**
     * If true deactivate the initial focus on the table.
     *
     * @type {booblean}
     * @memberof AvamComponentsTableComponent
     */
    @Input() optionalFocus: boolean;

    @Input()
    get restrictDelete() {
        return this._restrictDelete;
    }
    set restrictDelete(data) {
        this._restrictDelete = data;
    }

    @Input() set dataSource(data: any[]) {
        this.form = this.fb.group({ tableRows: this.fb.array([]) });
        this.components = this.form.get('tableRows') as FormArray;

        if (data && data.length > 0) {
            this.displayedColumns = this.columns.map(c => c.columnDef);
            this.form.reset();
            this.data = data;
            this.reset();
            this.data.forEach((d: any) => this.addRow(d));
        } else if (data && data.length === 0) {
            this.displayedColumns = this.columns.map(c => c.columnDef);
            this.form.reset();
            this.reset();
            this.defaultRow();
        }
    }

    @Output('onSort') onSort = new EventEmitter<any>();
    @Output('onDelete') onDelete = new EventEmitter<any>();
    @Output('onCreatedRow') onCreatedRow = new EventEmitter<any>();
    @Output('onDataChanged') onDataChanged = new EventEmitter<any>();
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    channel = 'tabtab';

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private changeDetectorRef: ChangeDetectorRef,
        private spinnerService: SpinnerService
    ) {
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.onDataChange$.subscribe(data => {
            this.forceSelectFirstRow();
            if (this.restrictDelete) {
                this.disableDeleteButton = data.length === 1 ? true : false;
            }
            this.onDataChanged.emit(data);
        });
    }

    ngOnDestroy() {
        this.onDataChange$.unsubscribe();
    }

    defaultRow() {
        const data = [{}];
        data[0] = {};
        this.columns.forEach(column => {
            data[0][column.columnDef] = null;
        });

        this.data = data;
        this.data.forEach((d: any) => this.addRow(d));
    }

    onDeleteRow(row) {
        this.selectedRow = row;
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.deleteRow();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
        this.onDelete.emit(row);
    }

    deleteRow() {
        let rowindex = null;

        this.components.controls.forEach((row, index) => {
            if (row.value.uuid === this.selectedRow.uuid) {
                rowindex = index;
            }
        });

        this.components.removeAt(rowindex);
        this.data.splice(rowindex, 1);
        this.calculateRowIndex();
        this.reset();
        this.data = [...this.data];
        this.form.markAsDirty();
        this.onDataChange$.next(this.data);
        this.forceMarkAsDirty();
    }

    addRow(row) {
        const group = this.fb.group({});
        const uuId = uuid.v4();
        row['uuid'] = uuId;
        group.addControl('rowId', this.fb.control(row.id));
        group.addControl('uuid', this.fb.control(uuId));

        this.columns.forEach(column => {
            const hasValidators = column.component && column.component.validators ? column.component.validators : null;
            if (row[column.columnDef] || row[column.columnDef] === 0) {
                group.addControl(column.columnDef, this.fb.control(row[column.columnDef], hasValidators));
            } else {
                group.addControl(column.columnDef, this.fb.control(null, hasValidators));
            }

            if (column.columnDef === 'actions') {
                const hasGroupValidator = column.groupValidators;
                group.setValidators(hasGroupValidator);
            }
        });

        this.components.push(group);
        this.onDataChange$.next(this.data);
    }

    onAddRowOnTop() {
        this.createdRow = true;

        const group = this.fb.group({
            rowId: null,
            uuid: uuid.v4()
        });

        this.columns.forEach(column => {
            if (column.component && column.component.validators) {
                group.addControl(column.columnDef, this.fb.control(column.component.initialValue ? column.component.initialValue : null, column.component.validators));
            } else {
                group.addControl(column.columnDef, this.fb.control(column.component.initialValue ? column.component.initialValue : null));
            }
        });

        this.onCreatedRow.emit(group);
        this.components.insert(0, group);
        this.parseControlData();

        this.dataSource = [...this.components.value];
        this.calculateRowIndex();
        this.onDataChange$.next(this.data);
        this.forceMarkAsDirty();
    }

    calculateRowIndex() {
        this.components.controls.forEach((row, index) => {
            row['controls'].rowId.setValue(index);
        });
    }

    reset() {
        this.spinnerService.activate(this.channel);
        this.visible = false;
        setTimeout(() => {
            this.visible = true;
            this.spinnerService.deactivate(this.channel);
        }, 0);
    }

    parseChange(group: FormGroup, callback) {
        if (callback) {
            callback(group);
        }
    }

    sortFunction(event) {
        this.onSort.next(event);

        this.sortField = event.field;
        this.sortOrder = event.order;

        this.dataSource = event.data;
    }

    parseControlData() {
        this.components.controls.forEach((component, index) => {
            for (const key in component['controls']) {
                if (component['controls'].hasOwnProperty(key)) {
                    const control = component['controls'][key] as FormControl;
                    // Reset if we have Invalid Date Object from the calendar ('bug' from ngx-calendar).
                    if (!this.isValidInputValue(control.value)) {
                        control.reset();
                    } else if (control['autosuggestObject']) {
                        // Reset if we have an autosuggest component
                        control.reset(control['autosuggestObject']);
                    } else {
                        // control.reset(control.value);
                    }
                }
            }
        });
    }

    isValidInputValue(dateObject) {
        if (Object.prototype.toString.call(dateObject) === '[object Date]') {
            // it is a date
            if (isNaN(dateObject.getTime())) {
                // date is not valid
                return false;
            } else {
                // date is valid
                return true;
            }
        } else {
            // not a date
            return true;
        }
    }

    triggerValidation() {
        this.ngForm.onSubmit(undefined);
    }

    forceSelectFirstRow() {
        // Trigger change detection so the generic table can select always first row.
        this.selection = null;
        setTimeout(() => {
            this.selection = 0;
        }, 0);
    }

    forceMarkAsDirty() {
        // No other way to make form dirty when using formArray.
        setTimeout(() => {
            this.form.markAsDirty();
        }, 0);
    }
}
