import { FormBuilder, FormGroup } from '@angular/forms';
import { DbTranslateService } from '../services/db-translate.service';
import { PhoneValidator } from '../validators/phone-validator';
import { NumberValidator } from '@shared/validators/number-validator';

export class ZusatzadresseFormbuilder {
    zusatzadresseForm: any;
    zusatzadresseToSave: any;

    constructor(private formBuilder: FormBuilder, private dbTranslateService: DbTranslateService) {}

    initForm(): FormGroup {
        this.zusatzadresseForm = this.formBuilder.group({
            zusatzadressenTypID: null,
            name: null,
            vorname: null,
            strasse: null,
            strasseNr: null,
            postfachNr: [null, NumberValidator.isPositiveIntegerWithMaxLength(5)],
            plz: this.formBuilder.group({
                postleitzahl: null,
                ort: null
            }),
            staat: null,
            privatTelefon: [null, PhoneValidator.isValidFormatWarning],
            korrespondenzAdresse: null
        });

        return this.zusatzadresseForm;
    }

    initDTO() {
        this.zusatzadresseToSave.zusatzadressenTypID = null;
        this.zusatzadresseToSave.name = null;
        this.zusatzadresseToSave.vorname = null;
        this.zusatzadresseToSave.strasse = null;
        this.zusatzadresseToSave.strasseNr = null;
        this.zusatzadresseToSave.postfachNr = null;
        this.zusatzadresseToSave.plzObject = null;
        this.zusatzadresseToSave.staatObject = null;
        this.zusatzadresseToSave.privatTelefon = null;
        this.zusatzadresseToSave.korrespondenzAdresse = false;
        this.zusatzadresseToSave.ortZusatzAusland = null;
        this.zusatzadresseToSave.plzZusatzAusland = null;
    }

    mapToDTO(letzteAktualisirung: any, zusatzadresseForm: FormGroup) {
        this.zusatzadresseToSave = letzteAktualisirung;
        if (zusatzadresseForm !== null) {
            this.zusatzadresseForm = zusatzadresseForm;
            this.zusatzadresseToSave.zusatzadressenTypID = this.zusatzadresseForm.controls.zusatzadressenTypID.value;
            this.zusatzadresseToSave.name = this.zusatzadresseForm.controls.name.value;
            this.zusatzadresseToSave.vorname = this.zusatzadresseForm.controls.vorname.value;
            this.zusatzadresseToSave.strasse = this.zusatzadresseForm.controls.strasse.value;
            this.zusatzadresseToSave.strasseNr = this.zusatzadresseForm.controls.strasseNr.value;
            this.zusatzadresseToSave.postfachNr = this.zusatzadresseForm.controls.postfachNr.value;

            this.zusatzadresseToSave.plzObject = this.zusatzadresseForm.controls.plz['plzWohnAdresseObject'] ? this.zusatzadresseForm.controls.plz['plzWohnAdresseObject'] : null;
            this.zusatzadresseToSave.plzZusatzAusland = this.zusatzadresseForm.controls.plz['plzWohnAdresseObject']
                ? this.zusatzadresseForm.controls.plz['plzWohnAdresseObject'].plzWohnadresseAusland
                : null;
            this.zusatzadresseToSave.ortZusatzAusland = this.zusatzadresseForm.controls.plz['plzWohnAdresseObject']
                ? this.zusatzadresseForm.controls.plz['plzWohnAdresseObject'].ortWohnadresseAusland
                : null;

            this.zusatzadresseToSave.staatObject = this.zusatzadresseForm.controls.staat.landAutosuggestObject;
            this.zusatzadresseToSave.privatTelefon = this.zusatzadresseForm.controls.privatTelefon.value;
            this.zusatzadresseToSave.korrespondenzAdresse =
                this.zusatzadresseForm.controls.korrespondenzAdresse.value === null ? false : this.zusatzadresseForm.controls.korrespondenzAdresse.value;
        } else {
            this.initDTO();
        }

        return this.zusatzadresseToSave;
    }

    mapToForm(letzteAktualisierung) {
        return {
            zusatzadressenTypID: letzteAktualisierung.zusatzadressenTypID > 0 ? letzteAktualisierung.zusatzadressenTypID : null,
            name: letzteAktualisierung.name,
            vorname: letzteAktualisierung.vorname,
            strasse: letzteAktualisierung.strasse,
            strasseNr: letzteAktualisierung.strasseNr,
            postfachNr: letzteAktualisierung.postfachNr !== 0 ? letzteAktualisierung.postfachNr : null,
            plz: {
                postleitzahl: letzteAktualisierung.plzObject ? letzteAktualisierung.plzObject : letzteAktualisierung.plzZusatzAusland || '',
                ort: letzteAktualisierung.plzObject ? letzteAktualisierung.plzObject : letzteAktualisierung.ortZusatzAusland || ''
            },

            staat: letzteAktualisierung.staatObject,
            privatTelefon: letzteAktualisierung.privatTelefon,
            korrespondenzAdresse: letzteAktualisierung.korrespondenzAdresse
        };
    }

    isFormEmpty(zusatzadresseForm: FormGroup): boolean {
        return (
            zusatzadresseForm.controls.zusatzadressenTypID.value === null &&
            this.isEmptyOrNull(zusatzadresseForm.value.name) &&
            this.isEmptyOrNull(zusatzadresseForm.value.vorname) &&
            this.isEmptyOrNull(zusatzadresseForm.value.strasse) &&
            this.isEmptyOrNull(zusatzadresseForm.value.strasseNr) &&
            this.isEmptyOrNull(zusatzadresseForm.value.postfachNr) &&
            this.isPlzEmpty(zusatzadresseForm.controls.plz.value) &&
            zusatzadresseForm.controls.staat.value === null &&
            this.isEmptyOrNull(zusatzadresseForm.value.privatTelefon)
        );
    }

    isEmptyOrNull(value) {
        return value === null || value === '';
    }

    isPlzEmpty(plz): boolean {
        return plz === null || plz.postleitzahl === null || plz.ort === null || (Number(plz.id) === -1 && plz.inputElementOneValue === null && plz.inputElementTwoValue === null);
    }
}
