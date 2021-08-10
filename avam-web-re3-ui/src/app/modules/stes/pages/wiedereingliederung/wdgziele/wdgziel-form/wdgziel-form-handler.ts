import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { StesWdgZielDTO } from '@app/shared/models/dtos-generated/stesWdgZielDTO';
import { FormUtilsService } from '@app/shared';

@Injectable()
export class WdgZielFormHandler {
    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService) {}

    createForm() {
        const wdgZielForm = this.formBuilder.group(
            {
                ziel: [null, Validators.required],
                bemerkung: null,
                erfassungsDatum: [new Date(), [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                fristBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                isErreicht: false,
                beurteilungsKriterium: this.formBuilder.array([]),
                bearbeitung: [null, Validators.required],
                ojbVersion: null
            },
            { validator: DateValidator.rangeBetweenDates('erfassungsDatum', 'fristBis', 'datumerfasstamungueltig', false) }
        );
        return wdgZielForm;
    }

    mapBeurteilungsKriterienToDTO(beurteilungsOptions: string[]): Array<number> {
        return beurteilungsOptions.filter(crit => crit && crit !== '').map(crit => +crit);
    }

    mapToDTO(wdgZielForm: FormGroup, stesId, wdgZielId?): StesWdgZielDTO {
        return {
            stesWdgZielId: wdgZielId ? wdgZielId : null,
            ojbVersion: wdgZielForm.controls.ojbVersion.value,
            ziel: wdgZielForm.controls.ziel.value,
            datumErfasstAm: this.formUtils.parseDate(wdgZielForm.controls.erfassungsDatum.value),
            datumFrist: this.formUtils.parseDate(wdgZielForm.controls.fristBis.value),
            erreicht: wdgZielForm.controls.isErreicht.value ? wdgZielForm.controls.isErreicht.value : false,
            weitereAngaben: wdgZielForm.controls.bemerkung.value,
            stesId: +stesId,
            erfasserBenutzerDetailObject: wdgZielForm.controls.bearbeitung['benutzerObject'],
            stesBeurteilungselementIds: this.mapBeurteilungsKriterienToDTO(wdgZielForm.controls.beurteilungsKriterium.value)
        };
    }

    clearFormArray(formArray: FormArray) {
        while (formArray.length !== 1) {
            formArray.removeAt(0);
        }
    }

    mapToForm(data: StesWdgZielDTO) {
        const map = {
            ziel: data.ziel,
            bemerkung: data.weitereAngaben,
            erfassungsDatum: this.formUtils.parseDate(data.datumErfasstAm),
            fristBis: this.formUtils.parseDate(data.datumFrist),
            isErreicht: data.erreicht,
            bearbeitung: data.erfasserBenutzerDetailObject,
            ojbVersion: data.ojbVersion
        };
        return map;
    }
}
