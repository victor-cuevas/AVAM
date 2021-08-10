import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StesWdgAktionDTO } from '@app/shared/models/dtos-generated/stesWdgAktionDTO';
import { DateValidator } from '@app/shared/validators/date-validator';
import { FormUtilsService } from '@app/shared';

@Injectable()
export class AktionFormHandler {
    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService) {}

    initForm(): FormGroup {
        return this.formBuilder.group(
            {
                bemerkung: null,
                durchgefuehrt: false,
                erfassungsdatum: [new Date(), [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                ojbVersion: [null],
                personalberater: [null, Validators.required],
                wdgDatumBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                wdgDatumVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                wgdAktionen: [null, Validators.required],
                wgdAktionenText: [null, Validators.required],
                ziel: this.formBuilder.array([])
            },
            { validator: DateValidator.rangeBetweenDates('wdgDatumVon', 'wdgDatumBis', 'val202', false) }
        );
    }

    mapToDTO(aktionErfassenForm: FormGroup, stesId: number, wdgAktionId?: number): StesWdgAktionDTO {
        return {
            aktionAmm: aktionErfassenForm.controls.wgdAktionen.value,
            aktionFreitext: aktionErfassenForm.controls.wgdAktionenText.value,
            durchgefuehrt: aktionErfassenForm.controls.durchgefuehrt.value,
            erfBenDetailObject: aktionErfassenForm.controls.personalberater['benutzerObject']
                ? aktionErfassenForm.controls.personalberater['benutzerObject']
                : aktionErfassenForm.controls.personalberater.value,
            ojbVersion: aktionErfassenForm.controls.ojbVersion.value,
            stesID: stesId,
            stesWdgAktionID: wdgAktionId,
            stesWdgZielIds: aktionErfassenForm.controls.ziel.value,
            wdgAktionErfasstAm: this.formUtils.parseDate(aktionErfassenForm.controls.erfassungsdatum.value),
            weitereAngaben: aktionErfassenForm.controls.bemerkung.value,
            zeitBis: this.formUtils.parseDate(aktionErfassenForm.controls.wdgDatumBis.value),
            zeitVon: this.formUtils.parseDate(aktionErfassenForm.controls.wdgDatumVon.value)
        };
    }

    mapToForm(data: StesWdgAktionDTO) {
        let map = {};

        if (data) {
            map = {
                bemerkung: data.weitereAngaben,
                durchgefuehrt: data.durchgefuehrt,
                erfassungsdatum: this.formUtils.parseDate(data.wdgAktionErfasstAm),
                ojbVersion: data.ojbVersion,
                personalberater: data.erfBenDetailObject,
                wdgDatumBis: this.formUtils.parseDate(data.zeitBis),
                wdgDatumVon: this.formUtils.parseDate(data.zeitVon),
                wgdAktionen: data.aktionAmm,
                wgdAktionenText: data.aktionFreitext,
                ziel: data.stesWdgZielIds
            };
        }
        return map;
    }
}
