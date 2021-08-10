import { NumberValidator } from '@shared/validators/number-validator';
import { StandortDTO } from '@dtos/standortDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class BewBeschaeftigungseinheitGrunddatenReactiveFormsService {
    grunddatenForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService) {
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
                berufTaetigkeit: null,
                arbeitgeber: null,
                gueltigVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                verfuegbarkeit: null,
                vormittags: this.createFormArray(),
                nachmittags: this.createFormArray(),
                arbeitszeitenDe: '',
                arbeitszeitenFr: '',
                arbeitszeitenIt: '',
                status: null,
                imAngebotSichtbar: null,
                kapazitaetMax: [null, [Validators.required, NumberValidator.val131, NumberValidator.isPositiveInteger]],
                ueberbuchungMax: [null, [NumberValidator.val131, NumberValidator.isPositiveInteger]],
                beschaeftigungsgrad: [null, [Validators.required, NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween1and100]]
            },
            {
                validators: [
                    DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201'),
                    AmmValidators.atLeastOneRequired('titelDe', 'titelFr', 'titelIt'),
                    AmmValidators.val309('vormittags', 'nachmittags', 'beschaeftigungsgrad')
                ]
            }
        );
    }

    setRequiredWeekdays(verfuegbarkeitOptions: CodeDTO[]) {
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

    setValidatorsOnDurchfuehrungVonBis(dto: StandortDTO) {
        const gueltigVon = dto.gueltigVon;
        const gueltigBis = dto.gueltigBis;

        this.grunddatenForm.get('gueltigVon').setValidators([this.grunddatenForm.get('gueltigVon').validator, DateValidator.isDateWithinRange(gueltigVon, gueltigBis, 'val310')]);
        this.grunddatenForm.get('gueltigBis').setValidators([this.grunddatenForm.get('gueltigBis').validator, DateValidator.isDateWithinRange(gueltigVon, gueltigBis, 'val310')]);
    }

    private createFormArray() {
        return new FormArray([
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false)
        ]);
    }
}
