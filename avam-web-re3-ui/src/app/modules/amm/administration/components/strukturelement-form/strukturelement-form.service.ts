import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class StrukturelementFormService {
    formGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.formGroup = this.formBuilder.group(
            {
                erfassungssprache: '',
                elementCode: ['', Validators.required],
                elementnameDe: '',
                elementnameFr: '',
                elementnameIt: '',
                beschreibungDe: '',
                beschreibungFr: '',
                beschreibungIt: '',
                sortierschluessel: ['', NumberValidator.isPositiveIntegerWithMaxLength(2)],
                gueltigVon: ['', [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: ['', [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                kbArtAsal: '',
                elternElement: '',
                ausgleichstelle: '',
                ausgleichstelleId: ''
            },
            {
                validators: [
                    DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201'),
                    AmmValidators.atLeastOneRequired('elementnameDe', 'elementnameFr', 'elementnameIt')
                ]
            }
        );
    }

    setAusgleichsstelleRequired() {
        this.formGroup.controls.ausgleichstelle.setValidators(Validators.required);
    }
}
