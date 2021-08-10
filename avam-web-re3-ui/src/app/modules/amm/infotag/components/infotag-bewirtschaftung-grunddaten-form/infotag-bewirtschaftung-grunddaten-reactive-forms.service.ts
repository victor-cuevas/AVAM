import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { FormUtilsService } from '@app/shared';

@Injectable()
export class InfotagBewirtschaftungGrunddatenReactiveFormsService {
    grunddatenForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService) {
        this.grunddatenForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                erfassungssprache: null,
                titelDe: null,
                titelFr: null,
                titelIt: null,
                ergaenzendeAngabenDe: null,
                ergaenzendeAngabenFr: null,
                ergaenzendeAngabenIt: null,
                durchfuehrungVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                durchfuehrungBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                vormittags: new FormArray([
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false)
                ]),
                nachmittags: new FormArray([
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false)
                ]),
                verfuegbarkeit: [null, Validators.required],
                durchfuehrungsNr: null,
                kurszeitenDe: null,
                kurszeitenFr: null,
                kurszeitenIt: null,
                isInfotagSichtbar: null,
                teilnehmerMax: [null, [Validators.required, NumberValidator.val131, NumberValidator.isPositiveInteger]],
                ueberbuchungMax: [null, [NumberValidator.val131, NumberValidator.isPositiveInteger]]
            },
            {
                validators: [DateValidator.rangeBetweenDates('durchfuehrungVon', 'durchfuehrungBis', 'val201'), AmmValidators.atLeastOneRequired('titelDe', 'titelFr', 'titelIt')]
            }
        );
    }

    setValidatorsOnDurchfuehrungVonBis(dto) {
        const gueltigVonProdukt = dto.massnahmeObject.gueltigVon;
        const gueltigBisProdukt = dto.massnahmeObject.gueltigBis;

        this.grunddatenForm
            .get('durchfuehrungVon')
            .setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(gueltigVonProdukt, gueltigBisProdukt, 'val277')
            ]);

        this.grunddatenForm
            .get('durchfuehrungBis')
            .setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(gueltigVonProdukt, gueltigBisProdukt, 'val277')
            ]);
    }

    setRequiredWeekdays(verfuegbarkeitOptions) {
        this.grunddatenForm.setValidators([
            this.grunddatenForm.validator,
            AmmValidators.requiredWeekDays(
                'vormittags',
                'nachmittags',
                'verfuegbarkeit',
                this.formUtils.getCodeIdByCode(verfuegbarkeitOptions, VerfuegbarkeitAMMCodeEnum.WOCHENPLAN)
            )
        ]);
    }
}
