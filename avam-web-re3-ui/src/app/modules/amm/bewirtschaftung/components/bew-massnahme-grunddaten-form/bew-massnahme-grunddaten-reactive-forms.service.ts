import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmValidators } from '@app/shared/validators/amm-validators';

@Injectable()
export class BewMassnahmeGrunddatenReactiveFormsService {
    grunddatenForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.grunddatenForm = this.formBuilder.group(
            {
                erfassungssprache: null,
                titelDe: '',
                titelFr: '',
                titelIt: '',
                ergaenzendeAngabenDe: '',
                ergaenzendeAngabenFr: '',
                ergaenzendeAngabenIt: '',
                gueltigVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                anbieter: [null, Validators.required],
                massnahmenverantwortung: [null, Validators.required],
                inPlanungAkquisitionSichtbar: false,
                lamCode: '',
                zulassungstyp: [null, Validators.required],
                imAngebotSichtbar: false,
                kurseDurchLamZuPruefen: false,
                regionen: this.formBuilder.group({ autosuggests: this.formBuilder.array([]) })
            },
            {
                validators: [DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201'), AmmValidators.atLeastOneRequired('titelDe', 'titelFr', 'titelIt')]
            }
        );
    }
}
