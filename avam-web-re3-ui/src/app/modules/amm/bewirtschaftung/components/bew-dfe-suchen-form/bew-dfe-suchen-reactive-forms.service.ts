import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, RequiredValidator, Validators, AbstractControl } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';

@Injectable()
export class BewDfeSuchenReactiveFormsService {
    searchForm: FormGroup;
    isZeitraumMandatory: boolean;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group(
            {
                strukturelementId: null,
                strukturelementText: null,
                elementkategorieId: null,
                durchfuehrungseinheitId: [null, NumberValidator.isPositiveInteger],
                beschaeftigungseinheitId: [null, NumberValidator.isPositiveInteger],
                taetigkeit: null,
                titel: null,
                region: null,
                regionText: null,
                anbieterParam: null,
                zulassungstypId: null,
                dfeImAngebotSichtbar: false,
                pruefenDurchLam: null,
                zeitraum: null,
                zeitraumVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                zeitraumBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                platzsituation: null,
                statusId: null
            },
            {
                validators: DateValidator.rangeBetweenDates('zeitraumVon', 'zeitraumBis', 'val201')
            }
        );
    }

    checkRequredDate() {
        if (this.checkMultiselectSelected(this.searchForm.controls.zeitraum.value)) {
            this.searchForm.controls.zeitraumVon.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx, Validators.required]);
            this.searchForm.controls.zeitraumBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx, Validators.required]);
        } else {
            this.searchForm.controls.zeitraumVon.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.searchForm.controls.zeitraumBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }

        this.isZeitraumMandatory = !this.searchForm.controls.zeitraumVon.value || !this.searchForm.controls.zeitraumBis.value ? true : false;

        this.searchForm.controls.zeitraumVon.updateValueAndValidity();
        this.searchForm.controls.zeitraumBis.updateValueAndValidity();
        this.searchForm.controls.zeitraum.updateValueAndValidity();
    }

    resetAdditionalDropdowns() {
        this.searchForm.controls.dfeImAngebotSichtbar.setValue(false);
        this.searchForm.controls.pruefenDurchLam.setValue(null);
    }

    noSearchCriteriaGiven(): boolean {
        return (
            !this.isMassnahmenartSelected() &&
            !this.isIdsSelected() &&
            !this.isFormValuesSelected() &&
            !this.checkMultiselectSelected(this.searchForm.controls.zeitraum.value) &&
            !this.checkMultiselectSelected(this.searchForm.controls.platzsituation.value) &&
            !this.isDateSelected()
        );
    }

    private isFormValuesSelected(): boolean {
        return (
            this.searchForm.controls.taetigkeit.value ||
            this.searchForm.controls.titel.value ||
            this.searchForm.controls.region.value ||
            this.searchForm.controls.anbieterParam.value ||
            this.searchForm.controls.zulassungstypId.value ||
            !!+this.searchForm.controls.dfeImAngebotSichtbar.value ||
            this.searchForm.controls.statusId.value ||
            this.searchForm.controls.pruefenDurchLam.value
        );
    }

    private isIdsSelected(): boolean {
        return this.searchForm.controls.durchfuehrungseinheitId.value || this.searchForm.controls.beschaeftigungseinheitId.value;
    }

    private isMassnahmenartSelected(): boolean {
        return this.searchForm.controls.strukturelementId.value || this.searchForm.controls.strukturelementText.value || this.searchForm.controls.elementkategorieId.value;
    }

    private isDateSelected(): boolean {
        return this.searchForm.controls.zeitraumVon.value || this.searchForm.controls.zeitraumBis.value;
    }

    private checkMultiselectSelected(multiselect: any[]): boolean {
        if (multiselect) {
            return multiselect.filter(cb => cb.value === true).length > 0;
        }
        return false;
    }
}
