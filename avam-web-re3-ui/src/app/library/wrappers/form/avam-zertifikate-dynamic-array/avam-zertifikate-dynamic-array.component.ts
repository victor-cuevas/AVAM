import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AvamZertifikateDynamicArrayInterface } from './avam-zertifikate-dynamic-array.interface';

@Component({
    selector: 'avam-zertifikate-dynamic-array',
    templateUrl: './avam-zertifikate-dynamic-array.component.html',
    styleUrls: ['./avam-zertifikate-dynamic-array.component.scss']
})
export class AvamZertifikateDynamicArrayComponent implements OnInit {
    @Input() zertifikatePlaceholder: string;
    @Input() zertifikateOptions = [];
    @Input() isDisabled: boolean;

    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;
    }

    @Input() set dataSource(data: AvamZertifikateDynamicArrayInterface[]) {
        this.loaded = true;
        this.initForm();
        if (data && data.length > 0) {
            data.forEach(row => {
                this.createRow(row);
            });
        } else {
            this.createRow();
        }
    }

    @Output() onItemAdded: EventEmitter<any> = new EventEmitter();
    @Output() onItemRemoved: EventEmitter<any> = new EventEmitter();
    @Output() onDuplication: EventEmitter<any> = new EventEmitter();

    data = [];
    readOnlyValues: string[];
    form: FormGroup;
    rows: any;

    loaded: boolean;
    isReadOnly: boolean;

    /**
     * Stores the Zerifikate FormArray, which is binded to the parentForm.controls.zertifikate in ngOnInit()
     *
     * @private
     * @memberof AvamZertifikateDynamicArrayComponent
     */
    private zertifikate: FormArray;

    constructor(private formBuilder: FormBuilder) {}

    ngOnInit() {}

    initForm() {
        this.rows = this.formBuilder.array([]);
        this.form = this.formBuilder.group({ zertifikate: this.rows });
        this.zertifikate = this.form.get('zertifikate') as FormArray;
    }

    onChange(event: string | number) {
        const filtered = this.form.value.zertifikate.filter(val => Number(val.zertifikat) === Number(event));
        if (filtered.length > 1) {
            const indexToDelete = this.form.value.zertifikate.findIndex(val => Number(val.zertifikat) === Number(event));
            this.zertifikate.removeAt(indexToDelete);
            this.onDuplication.emit(event);
        }
    }

    createRow(row?: AvamZertifikateDynamicArrayInterface) {
        this.zertifikate.push(
            this.formBuilder.group(
                row
                    ? {
                          zertifikatId: [row.zertifikatId],
                          zertifikat: [row.zertifikatCode],
                          gueltigBis: [new Date(row.gueltigBis), [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
                      }
                    : {
                          zertifikatId: [null],
                          zertifikat: [null],
                          gueltigBis: [new Date(), [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
                      }
            )
        );
    }

    /**
     * Adds a new empty item to the FormArray (this.zertifikate) and marks the form dirty.
     *
     * @memberof AvamZertifikateDynamicArrayComponent
     */
    addItem(): void {
        this.zertifikate.push(
            this.formBuilder.group({
                zertifikatId: [null],
                zertifikat: [null],
                gueltigBis: [new Date(), [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            })
        );

        setTimeout(() => {
            this.form.markAsDirty();
        }, 0);

        this.onItemAdded.emit();
    }

    /**
     * Removes the item from the FormArray (this.zertifikate), when the trash icon is clicked.
     * Also marks the form dirty.
     *
     * @memberof AvamZertifikateDynamicArrayComponent
     */
    removeItem(indexToRemove: number) {
        this.zertifikate.removeAt(indexToRemove);
        this.form.markAsDirty();
        this.onItemRemoved.emit();
    }
}
