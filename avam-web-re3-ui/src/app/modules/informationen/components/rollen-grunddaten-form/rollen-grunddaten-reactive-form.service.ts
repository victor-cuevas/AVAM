import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@shared/validators/date-validator';

@Injectable()
export class RollenGrunddatenReactiveFormService {
    form: FormGroup;

    constructor(fb: FormBuilder) {
        this.form = fb.group(
            {
                rollede: [null, [Validators.required]],
                rollefr: [null, [Validators.required]],
                rolleit: [null, [Validators.required]],
                vollzugsregiontyp: [null, [Validators.required]],
                gueltigab: null,
                gueltigbis: null,
                rollecode: [null, [Validators.required]],
                dmsrolle: null,
                benutzerstellentyp: [null, [Validators.required]],
                rolleId: null
            },
            { validator: [DateValidator.rangeBetweenDates('gueltigab', 'gueltigbis', 'val202', false, true)] }
        );
    }
}
