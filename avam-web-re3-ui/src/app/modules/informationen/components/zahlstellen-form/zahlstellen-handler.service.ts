import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { ZahlstellenReactiveFormsService } from '@modules/informationen/components/zahlstellen-form/zahlstellen-reactive-forms.service';
import { ZahlstelleDTO } from '@dtos/zahlstelleDTO';

@Injectable({
    providedIn: 'root'
})
export class ZahlstellenHandlerService {
    constructor(public reactiveForms: ZahlstellenReactiveFormsService, private formUtils: FormUtilsService) {}

    mapToForm(data: ZahlstelleDTO) {
        return {
            alkNr: data.alkNr,
            zahlstellenNr: data.zahlstelleNr,
            kurznameDe: data.kurznameDe,
            kurznameFr: data.kurznameFr,
            kurznameIt: data.kurznameIt,
            alkTyp: data.kassenstatus,
            arbeitsSprache: data.sprachcode,
            blockiergrund: data.blockiergrund,
            datumGueltigVon: this.formUtils.parseDate(data.gueltigAb),
            datumGueltigBis: this.formUtils.parseDate(data.gueltigBis),
            telefon: data.telefon,
            fax: data.telefax,
            email: data.email,
            firmenname1: data.firmenname1,
            firmenname2: data.firmenname2,
            firmenname3: data.firmenname3,
            strasse: data.strasse,
            postfach: data.postfach !== 0 ? data.postfach : '',
            postadresse: {
                postleitzahl: data.plz ? data.plz : '',
                ort: data.plz ? data.plz : ''
            },
            standFirmenname1: data.standFirmenname1,
            standFirmenname2: data.standFirmenname2,
            standFirmenname3: data.standFirmenname3,
            standortstrasse: data.standStrasse,
            standortadresse: {
                postleitzahl: data.standPlzObject ? data.standPlzObject : '',
                ort: data.standPlzObject ? data.standPlzObject : ''
            }
        };
    }

    mapToDTO(controls, zahlstelle?: ZahlstelleDTO): ZahlstelleDTO {
        return {
            ...zahlstelle,
            ojbVersion: zahlstelle && !isNaN(zahlstelle.ojbVersion) ? zahlstelle.ojbVersion : null,
            zahlstelleId: zahlstelle && !isNaN(zahlstelle.zahlstelleId) ? zahlstelle.zahlstelleId : null,
            alkNr: controls.alkNr.value,
            zahlstelleNr: controls.zahlstellenNr.value,
            kurznameDe: controls.kurznameDe.value,
            kurznameFr: controls.kurznameFr.value,
            kurznameIt: controls.kurznameIt.value,
            kassenstatus: controls.alkTyp.value,
            blockiergrund: controls.blockiergrund.value,
            gueltigAb: this.formUtils.parseDate(controls.datumGueltigVon.value),
            gueltigBis: this.formUtils.parseDate(controls.datumGueltigBis.value),
            telefon: controls.telefon.value,
            telefax: controls.fax.value,
            email: controls.email.value,
            sprachcode: controls.arbeitsSprache.value,
            firmenname1: controls.firmenname1.value,
            firmenname2: controls.firmenname2.value,
            firmenname3: controls.firmenname3.value,
            strasse: controls.strasse.value,
            postfach: +controls.postfach.value,
            plz: controls.postadresse['plzWohnAdresseObject'],
            standFirmenname1: controls.standFirmenname1.value,
            standFirmenname2: controls.standFirmenname2.value,
            standFirmenname3: controls.standFirmenname3.value,
            standStrasse: controls.standortstrasse.value,
            standPlzObject: controls.standortadresse['plzWohnAdresseObject']
        };
    }

    updateStandortadresseFieldsWhenAreEmpty(controls) {
        if (!controls.standFirmenname1.value) {
            controls.standFirmenname1.setValue(controls.firmenname1.value);
        }
        if (!controls.standFirmenname2.value) {
            controls.standFirmenname2.setValue(controls.firmenname2.value);
        }
        if (!controls.standFirmenname3.value) {
            controls.standFirmenname3.setValue(controls.firmenname3.value);
        }
        if (!controls.standortstrasse.value) {
            controls.standortstrasse.setValue(controls.strasse.value);
        }
        if (!controls.standortadresse.value.ort && !controls.standortadresse.value.postleitzahl) {
            controls.standortadresse.setValue(controls.postadresse.value);
        }
    }
}
