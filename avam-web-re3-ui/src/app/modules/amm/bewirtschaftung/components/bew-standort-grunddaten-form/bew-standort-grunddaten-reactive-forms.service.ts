import { BewStandortGrunddatenData } from './bew-standort-grunddaten-form.component';
import { CodeDTO } from '@dtos/codeDTO';
import { StandortDTO } from '@dtos/standortDTO';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class BewStandortGrunddatenReactiveFormsService {
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
                sozialeAbfederung: null,
                vorstellungsgespraechTest: null,
                status: null,
                inPlanungAkquisitionSichtbar: null,
                imAngebotSichtbar: null,
                kapazitaetMax: null,
                ueberbuchungMax: null,
                beschaeftigungsgrad: null
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

    setValidatorsOnDurchfuehrungVonBis(dto: StandortDTO) {
        const gueltigVonMassnahme = dto.massnahmeObject.gueltigVon;
        const gueltigBisMassnahme = dto.massnahmeObject.gueltigBis;

        this.grunddatenForm
            .get('gueltigVon')
            .setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(gueltigVonMassnahme, gueltigBisMassnahme, 'val277')
            ]);

        this.grunddatenForm
            .get('gueltigBis')
            .setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(gueltigVonMassnahme, gueltigBisMassnahme, 'val277')
            ]);
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

    setValidatorsOnBeschaeftigungseinheit(isApBp: boolean) {
        this.grunddatenForm.controls.kapazitaetMax.setValidators([Validators.required, NumberValidator.val131, NumberValidator.isPositiveInteger]);
        this.grunddatenForm.controls.ueberbuchungMax.setValidators([NumberValidator.val131, NumberValidator.isPositiveInteger]);
        this.grunddatenForm.controls.beschaeftigungsgrad.setValidators([Validators.required, NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween1and100]);
        this.grunddatenForm.controls.sozialeAbfederung.setValidators([Validators.required]);

        if (isApBp) {
            this.grunddatenForm.controls.arbeitgeber.setValidators(Validators.required);
        }

        this.updateValueAndValidityBeschaeftigungseinheit();
    }

    removeValidatorsFromBeschaeftigungseinheit(isApBp: boolean) {
        this.grunddatenForm.controls.kapazitaetMax.clearValidators();
        this.grunddatenForm.controls.ueberbuchungMax.clearValidators();
        this.grunddatenForm.controls.beschaeftigungsgrad.clearValidators();
        this.grunddatenForm.controls.sozialeAbfederung.clearValidators();

        if (isApBp) {
            this.grunddatenForm.controls.arbeitgeber.clearValidators();
        }

        this.updateValueAndValidityBeschaeftigungseinheit();
    }

    updateValueAndValidityBeschaeftigungseinheit() {
        this.grunddatenForm.controls.kapazitaetMax.updateValueAndValidity();
        this.grunddatenForm.controls.ueberbuchungMax.updateValueAndValidity();
        this.grunddatenForm.controls.beschaeftigungsgrad.updateValueAndValidity();
        this.grunddatenForm.controls.sozialeAbfederung.updateValueAndValidity();
        this.grunddatenForm.controls.arbeitgeber.updateValueAndValidity();
    }

    setDefaulFormValidators() {
        this.grunddatenForm.setValidators([
            DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201'),
            AmmValidators.atLeastOneRequired('titelDe', 'titelFr', 'titelIt'),
            AmmValidators.val309('vormittags', 'nachmittags', 'beschaeftigungsgrad')
        ]);
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
