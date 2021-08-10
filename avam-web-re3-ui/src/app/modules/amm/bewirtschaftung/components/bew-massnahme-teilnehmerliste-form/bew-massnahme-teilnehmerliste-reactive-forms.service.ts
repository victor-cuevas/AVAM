import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { ZeitraumfilterCode } from '@app/shared/enums/domain-code/zeitraumfilter.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DateValidator } from '@app/shared/validators/date-validator';

@Injectable()
export class BewMassnahmeTeilnehmerlisteReactiveFormsService {
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService) {
        this.createForm();
    }

    createForm() {
        this.searchForm = this.formBuilder.group(
            {
                initialerZeitraumVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                initialerZeitraumBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                initialerZeitraumfilterCode: null
            },
            {
                validators: DateValidator.rangeBetweenDates('initialerZeitraumVon', 'initialerZeitraumBis', 'val201', true, true)
            }
        );
    }

    setDynamicValidations(zeitraumfilterOptions: CodeDTO[]) {
        const controls = this.searchForm.controls;

        if (
            controls.initialerZeitraumfilterCode.value === this.formUtils.getCodeIdByCode(zeitraumfilterOptions, ZeitraumfilterCode.TEILNAHME) ||
            controls.initialerZeitraumfilterCode.value === this.formUtils.getCodeIdByCode(zeitraumfilterOptions, ZeitraumfilterCode.TEILNAHMEBEGINN)
        ) {
            controls.initialerZeitraumVon.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            controls.initialerZeitraumBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        } else {
            controls.initialerZeitraumVon.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            controls.initialerZeitraumBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }

        controls.initialerZeitraumVon.updateValueAndValidity();
        controls.initialerZeitraumBis.updateValueAndValidity();
    }

    setCurrentDate() {
        const controls = this.searchForm.controls;

        controls.initialerZeitraumVon.setValue(new Date());
        controls.initialerZeitraumBis.setValue(new Date());
    }
}
