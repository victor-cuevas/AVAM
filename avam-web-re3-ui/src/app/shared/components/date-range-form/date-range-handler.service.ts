import { Injectable } from '@angular/core';
import { DateRangeReactiveFormsService } from './date-range-reactive-forms.service';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';

@Injectable()
export class DateRangeHandlerService {
    constructor(public reactiveForms: DateRangeReactiveFormsService, private formUtils: FormUtilsService) {}

    mapToDTO() {
        return {
            gueltigBis: this.formUtils.parseDate(this.reactiveForms.searchForm.controls.gueltigBis.value),
            gueltigVon: this.formUtils.parseDate(this.reactiveForms.searchForm.controls.gueltigVon.value)
        };
    }

    mapToForm(data) {
        return {
            gueltigVon: data.gueltigVon ? new Date(data.gueltigVon) : '',
            gueltigBis: data.gueltigBis ? new Date(data.gueltigBis) : ''
        };
    }
}
