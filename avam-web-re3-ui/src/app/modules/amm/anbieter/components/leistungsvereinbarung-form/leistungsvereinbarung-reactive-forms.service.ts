import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { FormUtilsService } from '@app/shared';
import { LeistungsvereinbarungData } from './leistungsvereinbarung-form.component';
import { VertragswertViewDTO } from '@app/shared/models/dtos-generated/vertragswertViewDTO';

@Injectable()
export class LeistungsvereinbarungReactiveFormsService {
    lvForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService) {
        this.lvForm = this.createForm();
    }

    /**
     * Create the form group with the VALs
     *
     * @memberof LeistungsvereinbarungReactiveFormsService
     */
    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                titel: null,
                beschreibung: null,
                gueltigVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                bearbeitungDurch: null,
                rahmenvertrag: null,
                leistungsvereinbarungNr: null,
                status: null,
                freigabeDurch: null,
                freigabeDatum: null
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201', true, true)
            }
        );
    }

    setDefaultValues(lvData: LeistungsvereinbarungData) {
        if (!lvData.lvDto) {
            this.lvForm.controls.gueltigBis.setValue(
                lvData.rahmenvertragDto && lvData.hasInitialRahmenvertrag ? this.formUtils.parseDate(lvData.rahmenvertragDto.gueltigBis) : new Date(9999, 11, 31)
            );

            if (lvData.rahmenvertragDto && lvData.hasInitialRahmenvertrag) {
                this.lvForm.controls.rahmenvertrag.setValue(lvData.rahmenvertragDto.rahmenvertragNr);
            } else {
                this.lvForm.controls.rahmenvertrag.setValue(null);
            }

            this.lvForm.updateValueAndValidity();
        }
    }

    setDateValidators(lvData: LeistungsvereinbarungData) {
        if (lvData.rahmenvertragDto && this.lvForm.controls.rahmenvertrag.value) {
            const from = lvData.rahmenvertragDto.gueltigVon;
            const to = lvData.rahmenvertragDto.gueltigBis;

            this.lvForm.controls.gueltigVon.setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(from, to, 'val303')
            ]);
            this.lvForm.controls.gueltigBis.setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(from, to, 'val303')
            ]);
        } else {
            this.lvForm.controls.gueltigVon.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.lvForm.controls.gueltigBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }

        this.setAdditionalDateValidators(lvData.vertragswerte);
        this.updateValueAndValidity();
    }

    updateValueAndValidity() {
        this.lvForm.controls.gueltigVon.updateValueAndValidity();
        this.lvForm.controls.gueltigBis.updateValueAndValidity();
    }

    setAdditionalDateValidators(vertragswerte: VertragswertViewDTO[]) {
        if (vertragswerte && vertragswerte.length > 0) {
            const earliestVertragswert = vertragswerte.reduce((element, result) => {
                if (!result) {
                    return element;
                }
                return element.gueltigVon < result.gueltigVon ? element : result;
            });

            const speatestVertragswert = vertragswerte.reduce((element, result) => {
                if (!result) {
                    return element;
                }
                return element.gueltigVon > result.gueltigVon ? element : result;
            });

            this.lvForm.controls.gueltigVon.setValidators([
                this.lvForm.controls.gueltigVon.validator,
                DateValidator.checkDateSameOrAfter(earliestVertragswert.gueltigVon, 'val296')
            ]);
            this.lvForm.controls.gueltigBis.setValidators([
                this.lvForm.controls.gueltigBis.validator,
                DateValidator.checkDateSameOrBefore(speatestVertragswert.gueltigBis, 'val297')
            ]);
        }
    }
}
