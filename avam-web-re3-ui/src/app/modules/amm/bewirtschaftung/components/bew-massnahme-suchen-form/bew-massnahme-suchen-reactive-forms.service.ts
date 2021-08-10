import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';
import { MassnahmeSuchenParamDTO } from '@app/shared/models/dtos-generated/massnahmeSuchenParamDTO';

@Injectable()
export class BewMassnahmeSuchenReactiveFormsService {
    searchForm: FormGroup;
    currentYear = new Date().getFullYear();

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group(
            {
                strukturelementId: null,
                strukturelementText: null,
                elementkategorieId: null,
                massnahmeId: [null, NumberValidator.isPositiveInteger],
                titel: null,
                lamCode: null,
                region: null,
                regionText: null,
                anbieterParam: null,
                zulassungstypId: null,
                imAngebotSichtbar: null,
                pruefenDurchLam: null,
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201')
            }
        );
    }

    resetAdditionalDropdowns() {
        this.searchForm.controls.imAngebotSichtbar.setValue(null);
        this.searchForm.controls.pruefenDurchLam.setValue(null);
    }

    noSearchCriteriaGiven(): boolean {
        return (
            !this.isMassnahmenartSelected() &&
            !this.searchForm.controls.massnahmeId.value &&
            !this.searchForm.controls.titel.value &&
            !this.searchForm.controls.lamCode.value &&
            !this.searchForm.controls.region.value &&
            !this.searchForm.controls.anbieterParam.value &&
            !this.searchForm.controls.zulassungstypId.value &&
            !this.searchForm.controls.imAngebotSichtbar.value &&
            !this.searchForm.controls.pruefenDurchLam.value &&
            !this.isDateSelected()
        );
    }

    getDefaultValues(): MassnahmeSuchenParamDTO {
        return {
            gueltigVon: new Date(this.currentYear, 0, 1),
            gueltigBis: new Date(this.currentYear, 11, 31)
        };
    }

    setDefaultValues() {
        const defaultValues = this.getDefaultValues();
        this.searchForm.controls.gueltigVon.setValue(defaultValues.gueltigVon);
        this.searchForm.controls.gueltigBis.setValue(defaultValues.gueltigBis);
    }

    private isMassnahmenartSelected(): boolean {
        return this.searchForm.controls.strukturelementId.value || this.searchForm.controls.strukturelementText.value || this.searchForm.controls.elementkategorieId.value;
    }

    private isDateSelected(): boolean {
        return this.searchForm.controls.gueltigVon.value || this.searchForm.controls.gueltigBis.value;
    }
}
