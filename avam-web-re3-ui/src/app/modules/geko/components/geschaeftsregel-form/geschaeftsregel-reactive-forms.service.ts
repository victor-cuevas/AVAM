import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberValidator } from '@shared/validators/number-validator';

@Injectable()
export class GeschaeftsregelReactiveFormsService {
    form: FormGroup;

    constructor(fb: FormBuilder) {
        this.form = fb.group({
            regelId: null,
            ojbVersion: null,
            geschaeftsbereich: [null, [Validators.required]],
            geschaeftsart: [null, [Validators.required]],
            sachstandBeginn: [null],
            sachstandEnde: [null],
            durchlaufzeit: [null, [Validators.required, NumberValidator.isPositiveIntegerWithMaxLength(3), NumberValidator.isNumberWithinRage(1, 999, 'val079')]],
            ergaenzendeangaben: [null]
        });
    }
}
