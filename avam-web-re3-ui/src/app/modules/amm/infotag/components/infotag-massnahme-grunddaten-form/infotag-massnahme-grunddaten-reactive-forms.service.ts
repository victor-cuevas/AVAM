import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class InfotagMassnahmeGrunddatenReactiveFormsService {
    grunddatenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.grunddatenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                erfassungssprache: '',
                titelDe: '',
                titelFr: '',
                titelIt: '',
                ergaenzendeAngabenDe: '',
                ergaenzendeAngabenFr: '',
                ergaenzendeAngabenIt: '',
                gueltigVon: ['', [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: ['', [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                anbieter: ['', Validators.required],
                massnahmenverantwortung: ['', Validators.required],
                massnahmeNr: ''
            },
            {
                validators: [DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201'), AmmValidators.atLeastOneRequired('titelDe', 'titelFr', 'titelIt')]
            }
        );
    }
}
