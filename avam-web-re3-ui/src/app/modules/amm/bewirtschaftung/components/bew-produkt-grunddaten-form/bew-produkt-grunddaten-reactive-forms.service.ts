import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmValidators } from '@app/shared/validators/amm-validators';

@Injectable()
export class BewProduktGrunddatenReactiveFormsService {
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
                produktverantwortung: [null, Validators.required],
                inPlanungSichtbar: false,
                lamCode: '',
                amtsstelle: null,
                amtsstelleText: [null, Validators.required],
                ausgleichsstelle: null,
                ausgleichsstelleText: [null, Validators.required],
                ammAnbieterList: this.formBuilder.array([])
            },
            {
                validators: [DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201'), AmmValidators.atLeastOneRequired('titelDe', 'titelFr', 'titelIt')]
            }
        );
    }
}
