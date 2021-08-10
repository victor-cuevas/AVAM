import { VertragswertDDTO } from '@dtos/vertragswertDDTO';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms/src/model';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { NumberValidator } from '@shared/validators/number-validator';
import { DateValidator } from '@shared/validators/date-validator';
import { VertragswertDetailData } from './vertragswert-detail-form.component';
import { VertragswertMDTO } from '@dtos/vertragswertMDTO';

@Injectable()
export class VertragswertDetailReactiveFormsService {
    vertragswertDetailForm: FormGroup;
    defaultDateValidators: ValidatorFn[] = [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx];
    defaultNumberValidators: ValidatorFn[] = [NumberValidator.isNumberInRange(1, 9999, 'val321', false), NumberValidator.isPositiveInteger];
    defaultTNValidators: ValidatorFn[] = [NumberValidator.isNumberInRange(1, 999999999, 'val319', false), NumberValidator.isPositiveInteger];
    defaultChfValidators: ValidatorFn[] = [Validators.required, NumberValidator.isNumberInRange(0.05, 999999999, 'val320', true)];

    constructor(private formBuilder: FormBuilder) {
        this.vertragswertDetailForm = this.createForm();
    }

    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                budgetposition: '',
                gueltig: null,
                gueltigVon: [null, this.defaultDateValidators],
                gueltigBis: [null, this.defaultDateValidators],
                preismodellTyp: [null, Validators.required],
                preismodell: [null, Validators.required],
                chf: [null, this.defaultChfValidators],
                ergaenzendeAngaben: '',
                chfPreismodel: null,
                tntagePreismodelRow1: [null, this.defaultTNValidators],
                tntagePreismodelRow2: null,
                tnPreismodelRow1: [null, this.defaultTNValidators],
                tnPreismodelRow2: null,
                dePreismodel: null,
                lektionenPreismodel: [null, this.defaultNumberValidators],
                status: ''
            },
            {
                validators: [DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')]
            }
        );
    }

    setValidatorsOnDurchfuehrungVonBis(vertragswertDetailData: VertragswertDetailData, currentFormMode: FormModeEnum) {
        let selectedTreeTableItemGueltigVon;
        let selectedTreeTableItemGueltigBis;

        if (currentFormMode === FormModeEnum.CREATE) {
            selectedTreeTableItemGueltigVon = vertragswertDetailData.selectedTreeTableItem.gueltigVon;
            selectedTreeTableItemGueltigBis = vertragswertDetailData.selectedTreeTableItem.gueltigBis;
        } else {
            selectedTreeTableItemGueltigVon = (vertragswertDetailData.vertragswertDto as VertragswertMDTO).massnahmeObject
                ? (vertragswertDetailData.vertragswertDto as VertragswertMDTO).massnahmeObject.gueltigVon
                : (vertragswertDetailData.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.gueltigVon;
            selectedTreeTableItemGueltigBis = (vertragswertDetailData.vertragswertDto as VertragswertMDTO).massnahmeObject
                ? (vertragswertDetailData.vertragswertDto as VertragswertMDTO).massnahmeObject.gueltigBis
                : (vertragswertDetailData.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.gueltigBis;
        }

        const leistungsvereinbarungGueltigVon = vertragswertDetailData.vertragswertDto.leistungsvereinbarungObject.gueltigVon;
        const leistungsvereinbarungGueltigBis = vertragswertDetailData.vertragswertDto.leistungsvereinbarungObject.gueltigBis;

        this.vertragswertDetailForm
            .get('gueltigVon')
            .setValidators([
                ...this.defaultDateValidators,
                DateValidator.isDateWithinRange(selectedTreeTableItemGueltigVon, selectedTreeTableItemGueltigBis, 'val314'),
                DateValidator.isDateWithinRange(leistungsvereinbarungGueltigVon, leistungsvereinbarungGueltigBis, 'val315')
            ]);
        this.vertragswertDetailForm
            .get('gueltigBis')
            .setValidators([
                ...this.defaultDateValidators,
                DateValidator.isDateWithinRange(selectedTreeTableItemGueltigVon, selectedTreeTableItemGueltigBis, 'val314'),
                DateValidator.isDateWithinRange(leistungsvereinbarungGueltigVon, leistungsvereinbarungGueltigBis, 'val315')
            ]);

        this.vertragswertDetailForm.get('gueltigVon').updateValueAndValidity();
        this.vertragswertDetailForm.get('gueltigBis').updateValueAndValidity();
    }

    toggleDePreismodellRequired(required: boolean) {
        const formControl = this.vertragswertDetailForm.controls.dePreismodel;
        formControl.setValidators(required ? [...this.defaultNumberValidators, Validators.required] : []);
        formControl.updateValueAndValidity();
    }

    toggleLektionenPreismodellRequired(required: boolean) {
        const formControl = this.vertragswertDetailForm.controls.lektionenPreismodel;
        formControl.setValidators(required ? [...this.defaultNumberValidators, Validators.required] : []);
        formControl.updateValueAndValidity();
    }

    toggletntagePreismodelRow1Required(required: boolean) {
        const formControl = this.vertragswertDetailForm.controls.tntagePreismodelRow1;
        formControl.setValidators(required ? [...this.defaultTNValidators, Validators.required] : []);
        formControl.updateValueAndValidity();
    }

    toggletnPreismodelRow1Required(required: boolean) {
        const formControl = this.vertragswertDetailForm.controls.tnPreismodelRow1;
        formControl.setValidators(required ? [...this.defaultTNValidators, Validators.required] : []);
        formControl.updateValueAndValidity();
    }

    toggleChfRequired(required: boolean) {
        const formControl = this.vertragswertDetailForm.controls.chf;
        formControl.setValidators(required ? [...this.defaultChfValidators, Validators.required] : []);
        formControl.updateValueAndValidity();
    }
}
