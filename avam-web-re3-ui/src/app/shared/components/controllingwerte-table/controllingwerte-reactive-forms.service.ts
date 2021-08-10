import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class ControllingwerteReactiveFormsService {
    controllwertForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.controllwertForm = this.formBuilder.group({
            kostenverteilschluessel: [null, Validators.required],
            anrechenbareKosten: null,
            alvRelevanteKosten: null,
            rows: this.formBuilder.array([])
        });
    }

    createNewRow(row: any, supportNegativeChf = false): FormGroup {
        const rowGroup = this.formBuilder.group({
            tableId: row.tableId,
            id: row.id,
            jahrOrGeldgeber: [row.jahrOrGeldgeber.codeId ? row.jahrOrGeldgeber.codeId : row.jahrOrGeldgeber, Validators.required],
            kanton: [row.kanton ? row.kanton.kantonsKuerzel : null, Validators.required],
            chf: [
                row.chf,
                [
                    Validators.required,
                    supportNegativeChf
                        ? NumberValidator.isNumberInRange(-999999999999999.95, 999999999999999.95, 'val327', true)
                        : NumberValidator.isNumberInRange(0, 999999999999999.95, 'val323', true)
                ]
            ],
            tnTage: [row.tnTage, [NumberValidator.isNumberInRange(0, 999999999, 'val322', false), Validators.required]],
            teilnehmer: [row.teilnehmer, [NumberValidator.isNumberInRange(0, 999999999, 'val322', false), Validators.required]],
            prozent: [row.prozent, [NumberValidator.isNumberInRange(0, 100, 'val324', false), Validators.required]],
            rowType: row.rowType,
            newEntry: row.newEntry,
            editable: row.editable
        });

        return rowGroup;
    }
}
