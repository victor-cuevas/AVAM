import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StesLeistungsexportDetailsDTO } from '@app/shared/models/dtos-generated/stesLeistungsexportDetailsDTO';
import { DateValidator } from '@app/shared/validators/date-validator';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Injectable()
export class LeistungsexportFormHandler {
    constructor(private formBuilder: FormBuilder) {}

    initForm(): FormGroup {
        return this.formBuilder.group(
            {
                antragdatum: [new Date(), [DateValidator.isDateInFutureNgx, Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                abreisedatum: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                datumlstexpvon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                datumlstexpbis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                datumrueckkehr: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                antragpendent: false,
                antragabgewiesen: false,
                anspruchsberechtigtFurL: false,
                telefonprivat: [null, PhoneValidator.isValidFormatWarning],
                plz: null,
                plzОrt: null,
                strasse: null,
                strasseNr: null,
                bemerkung: null,
                zielstaatId: [null, Validators.required],
                ojbVersion: null
            },
            { validator: DateValidator.rangeBetweenDates('datumlstexpvon', 'datumlstexpbis', 'datumlevonbisungueltig') }
        );
    }

    // BSP 13
    getFromDateSub(leistungsexportForm: FormGroup): Subscription {
        const dateFromCtrl = leistungsexportForm.controls.datumlstexpvon as FormControl;

        return dateFromCtrl.valueChanges.subscribe((date: any) => {
            if (date !== null && dateFromCtrl.valid) {
                this.setToDate(date, leistungsexportForm);
            }
        });
    }

    // BSP13
    setToDate(fromDate, leistungsexportForm) {
        const current = moment(fromDate, 'DD.MM.YYYY', true);
        const dateTo = leistungsexportForm.controls.datumlstexpbis;

        if (!dateTo.value) {
            const future = current.add(3, 'M').subtract(1, 'd');
            dateTo.setValue(future.toDate());
        }
    }

    mapToDTO(leistungsexportForm, stesId, lsExpId?): StesLeistungsexportDetailsDTO {
        return {
            leistungsexportID: lsExpId,
            stesID: +stesId,
            datumAntrag: leistungsexportForm.controls.antragdatum.value,
            datumAbreise: leistungsexportForm.controls.abreisedatum.value,
            datumRueckkehr: leistungsexportForm.controls.datumrueckkehr.value,
            datumLEvon: leistungsexportForm.controls.datumlstexpvon.value,
            datumLEbis: leistungsexportForm.controls.datumlstexpbis.value,
            abgewiesen: leistungsexportForm.controls.antragabgewiesen.value,
            pendent: leistungsexportForm.controls.antragpendent.value,
            anspruchLE: leistungsexportForm.controls.anspruchsberechtigtFurL.value,
            auslandStrasse: leistungsexportForm.controls.strasse.value,
            auslandNr: leistungsexportForm.controls.strasseNr.value,
            auslandTel: leistungsexportForm.controls.telefonprivat.value,
            bemerkung: leistungsexportForm.controls.bemerkung.value,
            auslandPLZ: leistungsexportForm.controls.plz.value,
            auslandOrt: leistungsexportForm.controls.plzОrt.value,
            zielStaatID: leistungsexportForm.controls.zielstaatId.value,
            ojbVersion: leistungsexportForm.controls.ojbVersion.value
        };
    }

    mapToForm(data) {
        let map = {};

        if (data) {
            map = {
                antragdatum: new Date(data.datumAntrag),
                abreisedatum: new Date(data.datumAbreise),
                datumlstexpvon: new Date(data.datumLEvon),
                datumlstexpbis: new Date(data.datumLEbis),
                datumrueckkehr: data.datumRueckkehr ? new Date(data.datumRueckkehr) : null,
                anspruchsberechtigtFurL: data.anspruchLE,
                antragabgewiesen: data.abgewiesen,
                antragpendent: data.pendent,
                zielstaatId: data.zielStaatID,
                strasse: data.auslandStrasse,
                strasseNr: data.auslandNr,
                plz: data.auslandPLZ,
                plzОrt: data.auslandOrt,
                telefonprivat: data.auslandTel,
                bemerkung: data.bemerkung,
                ojbVersion: data.ojbVersion
            };
        }

        return map;
    }
}
