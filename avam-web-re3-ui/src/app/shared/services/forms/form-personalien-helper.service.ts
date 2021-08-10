import { Injectable } from '@angular/core';
import { FormUtilsService } from './form-utils.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '../../validators/date-validator';
import { AutosuggestValidator } from '../../validators/autosuggest-validator';
import { SvNummerValidator } from '../../validators/sv-nummer-validator';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '../db-translate.service';
import { GeburtsdatumValidator } from '@shared/validators/geburtsdatum-validator';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { StesPersonalienDTO } from '@app/shared/models/dtos-generated/stesPersonalienDTO';
import { TwoFieldsAutosuggestValidator } from '@app/shared/validators/two-fields-autosuggest-validator';
import { NumberValidator } from '@shared/validators/number-validator';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import { PersonStesDTO } from '@app/shared/models/dtos-generated/personStesDTO';

@Injectable({
    providedIn: 'root'
})
export class FormPersonalienHelperService {
    validatorRequired: Validators;

    constructor(private formUtils: FormUtilsService, private translateService: TranslateService, private dbTranslateService: DbTranslateService) {}

    mapToForm(personalien: any) {
        return {
            wohnadresseForm: this.getWohnadresseForm(personalien),
            kontaktangaben: this.getKontaktangaben(personalien),
            personenstammdaten: this.getPersonenstammdaten(personalien),
            aufenhaltsbewilligung: this.getAufenhaltsbewilligung(personalien),
            schlagworte: null
        };
    }

    mapToDTO(personalien: any, personalienForm: FormGroup, isAnmeldung: boolean, staatSchweizId: number) {
        const personalienToSave = JSON.parse(JSON.stringify(personalien));

        const wohnadresseForm = personalienForm.get('wohnadresseForm') as FormGroup;
        const kontaktangaben = personalienForm.get('kontaktangaben') as FormGroup;
        const personenstammdaten = personalienForm.get('personenstammdaten') as FormGroup;
        const aufenhaltsbewilligung = personalienForm.get('aufenhaltsbewilligung') as FormGroup;

        const schlagworte = personalienForm.get('schlagworte');

        this.setWohnAdresseToSave(personalienToSave, wohnadresseForm, isAnmeldung, staatSchweizId);
        this.setKontaktangabenToSave(personalienToSave, kontaktangaben);
        this.setPersonenstammdatenToSave(personalienToSave, personenstammdaten);
        this.setAufenhaltsbewilligungToSave(personalienToSave, aufenhaltsbewilligung);
        this.setSchlagworteToSave(personalienToSave, schlagworte);

        return personalienToSave;
    }

    createForm(formBuilder: FormBuilder, isAnmeldung: boolean) {
        this.validatorRequired = isAnmeldung ? null : Validators.required;
        return formBuilder.group({
            wohnadresseForm: this.createWohnadresseForm(formBuilder, isAnmeldung),
            kontaktangaben: this.createKontaktangaben(formBuilder),
            personenstammdaten: this.createPersonenstammdaten(formBuilder),
            aufenhaltsbewilligung: this.createAufenhaltsbewilligung(formBuilder),
            schlagworte: null
        });
    }

    private createWohnadresseForm(formBuilder: FormBuilder, isAnmeldung: boolean) {
        return formBuilder.group({
            name: [null, Validators.required],
            vorname: [null, Validators.required],
            strasse: null,
            strasseNr: null,
            postfach: [null, NumberValidator.isPositiveIntegerWithMaxLength(5)],
            plz: formBuilder.group({
                postleitzahl: [null, [TwoFieldsAutosuggestValidator.autosuggestRequired('postleitzahl')]],
                ort: [null, TwoFieldsAutosuggestValidator.autosuggestRequired('ort')]
            }),
            land: [null, isAnmeldung ? [Validators.required, AutosuggestValidator.valueTextInput({ invalidLandFormat: { valid: false, value: '' } })] : Validators.required],
            gemeindeBfsNr: [null, [Validators.required, AutosuggestValidator.valueGemeindeBfsInput({ invalidGemeindeFormat: { valid: false, value: '' } })]],
            gemeindeName: [null, Validators.required]
        });
    }

    private createKontaktangaben(formBuilder: FormBuilder) {
        return formBuilder.group({
            telefonprivat: [null, PhoneValidator.isValidFormatWarning],
            telefongeschaeft: [null, PhoneValidator.isValidFormatWarning],
            fax: [null, PhoneValidator.isValidFormatWarning],
            mobile: [null, PhoneValidator.isValidFormatWarning],
            email: null
        });
    }

    private createPersonenstammdaten(formBuilder: FormBuilder) {
        return formBuilder.group({
            svNr: [null, SvNummerValidator.svNummberValid],
            zasName: [null, this.validatorRequired],
            zasVorname: [null, this.validatorRequired],
            geschlecht: [null, this.validatorRequired],
            zivilstand: [null, this.validatorRequired],
            nationalitaet: [null, this.validatorRequired],
            geburtsdatum: [
                null,
                this.validatorRequired !== null
                    ? [
                          DateValidator.dateFormatNgx,
                          DateValidator.isDateInFutureNgx,
                          DateValidator.dateRangeBiggerCenturyNgx,
                          GeburtsdatumValidator.dateValidator,
                          this.validatorRequired
                      ]
                    : [DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateRangeBiggerCenturyNgx, GeburtsdatumValidator.dateValidator]
            ],
            versichertenNrList: null
        });
    }

    private createAufenhaltsbewilligung(formBuilder: FormBuilder) {
        return formBuilder.group({
            leistungsimporteuefta: null,
            aufenthaltsstatus: [null],
            aufenthaltbis: [null, DateValidator.dateValidNgx],
            einreisedatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
        });
    }

    private getWohnadresseForm(personalien: StesPersonalienDTO) {
        return {
            name: personalien.nameAVAM,
            vorname: personalien.vornameAVAM,
            strasse: personalien.strasseWohnadresse,
            strasseNr: personalien.hausNrWohnadresse,
            postfach: personalien.postfachNrWohnadresse === 0 ? '' : personalien.postfachNrWohnadresse,

            plz: {
                postleitzahl: personalien.plzWohnAdresseObject ? personalien.plzWohnAdresseObject : personalien.plzWohnadresseAusland || '',
                ort: personalien.plzWohnAdresseObject ? personalien.plzWohnAdresseObject : personalien.ortWohnadresseAusland || ''
            },
            land: personalien.landWohnadresseObject,
            gemeindeBfsNr: personalien.gemeindeWohnadresseObject ? personalien.gemeindeWohnadresseObject : '',
            gemeindeName: personalien.gemeindeWohnadresseObject ? personalien.gemeindeWohnadresseObject : ''
        };
    }

    private getKontaktangaben(personalien: StesPersonalienDTO) {
        return {
            telefonprivat: personalien.telNrPrivat,
            telefongeschaeft: personalien.telNrGeschaeft,
            fax: personalien.faxNr,
            mobile: personalien.mobileNr,
            email: personalien.email
        };
    }

    private getPersonenstammdaten(personalien: StesPersonalienDTO) {
        let personenstammdaten = null;
        if (personalien.personStesObject) {
            let svNumber = null;
            if (!personalien.personStesObject.svNrFromZas && personalien.personStesObject.versichertenNrList !== undefined) {
                personalien.personStesObject.versichertenNrList.forEach(element => {
                    if (element.istAktuelleVersichertenNr) {
                        svNumber = element.versichertenNr;
                    }
                });
            } else {
                svNumber = personalien.personStesObject.svNrFromZas;
            }
            personenstammdaten = {
                svNr: svNumber,
                zasName: personalien.personStesObject.namePersReg,
                zasVorname: personalien.personStesObject.vornamePersReg,
                geschlecht: personalien.personStesObject.geschlechtObject.codeId,
                zivilstand: personalien.personStesObject.zivilstandObject ? personalien.personStesObject.zivilstandObject.codeId : null,
                nationalitaet: personalien.personStesObject.nationalitaetObject,
                geburtsdatum: personalien.personStesObject.geburtsDatum,
                versichertenNrList: personalien.personStesObject.versichertenNrList
            };
        } else {
            personenstammdaten = {
                svNr: null,
                zasName: null,
                zasVorname: null,
                geschlecht: null,
                zivilstand: null,
                nationalitaet: null,
                geburtsdatum: null,
                versichertenNrList: null
            };
        }

        return personenstammdaten;
    }

    private getAufenhaltsbewilligung(personalien: StesPersonalienDTO) {
        return {
            leistungsimporteuefta: personalien.leistungsimportEUEFTA,
            aufenthaltsstatus: personalien.aufenthaltsStatusID,
            aufenthaltbis: this.formUtils.parseDate(personalien.aufenthaltBis),
            einreisedatum: this.formUtils.parseDate(personalien.einreiseDatum)
        };
    }

    private setWohnAdresseToSave(personalienToSave: StesPersonalienDTO, wohnadresseForm: FormGroup, isAnmeldung: boolean, staatSchweizId: number) {
        const plzWohnaddresseObject = wohnadresseForm.controls.plz['plzWohnAdresseObject'];

        personalienToSave.nameAVAM = wohnadresseForm.controls.name.value;
        personalienToSave.vornameAVAM = wohnadresseForm.controls.vorname.value;
        personalienToSave.strasseWohnadresse = wohnadresseForm.controls.strasse.value;
        personalienToSave.hausNrWohnadresse = wohnadresseForm.controls.strasseNr.value;
        personalienToSave.postfachNrWohnadresse = wohnadresseForm.controls.postfach.value;

        personalienToSave.landWohnadresseObject = wohnadresseForm.controls.land['landAutosuggestObject'];
        personalienToSave.gemeindeWohnadresseObject = wohnadresseForm.controls.gemeindeBfsNr['autosuggestObject'];

        if (isAnmeldung) {
            personalienToSave.plzWohnAdresseObject = plzWohnaddresseObject ? plzWohnaddresseObject : null;

            personalienToSave.plzWohnadresseAusland =
                plzWohnaddresseObject && plzWohnaddresseObject.postleitzahl && isNaN(plzWohnaddresseObject.postleitzahl) ? plzWohnaddresseObject.plzWohnadresseAusland : null;
        } else {
            this.setPlzOrtWohnadresseToSaveForBearbeiten(personalienToSave, plzWohnaddresseObject, staatSchweizId);
        }
    }

    private setPlzOrtWohnadresseToSaveForBearbeiten(personalienToSave: StesPersonalienDTO, plzWohnaddresseObject: any, staatSchweizId: number) {
        personalienToSave.plzWohnadresseAusland = plzWohnaddresseObject ? plzWohnaddresseObject.plzWohnadresseAusland : null;
        personalienToSave.ortWohnadresseAusland = plzWohnaddresseObject ? plzWohnaddresseObject.ortWohnadresseAusland : null;

        if (personalienToSave.landWohnadresseObject && personalienToSave.landWohnadresseObject.staatId === staatSchweizId) {
            personalienToSave.plzWohnAdresseObject = plzWohnaddresseObject ? plzWohnaddresseObject : null;
        } else {
            personalienToSave.plzWohnAdresseObject = null;
        }
    }

    private setKontaktangabenToSave(personalienToSave: StesPersonalienDTO, kontaktangaben: FormGroup) {
        personalienToSave.faxNr = kontaktangaben.controls.fax.value;
        personalienToSave.telNrGeschaeft = kontaktangaben.controls.telefongeschaeft.value;
        personalienToSave.telNrPrivat = kontaktangaben.controls.telefonprivat.value;
        personalienToSave.mobileNr = kontaktangaben.controls.mobile.value;
        personalienToSave.email = kontaktangaben.controls.email.value;
    }

    private setSchlagworteToSave(personalienToSave: StesPersonalienDTO, schlagworte: any) {
        const filteredKatList = schlagworte.value.filter(v => v.value);
        const schlagwortSTESListe = [];
        filteredKatList.forEach(item => {
            schlagwortSTESListe.push({
                schlagwortId: item.id,
                schlagwortObject: {
                    schlagwortId: item.id,
                    schlagwortDe: item.textDe,
                    schlagwortFr: item.textFr,
                    schlagwortIt: item.textIt
                }
            });
        });
        personalienToSave.schlagwortSTESListe = schlagwortSTESListe;
    }

    private setPersonenstammdatenToSave(personalienToSave: StesPersonalienDTO, personenstammdaten: FormGroup) {
        const personStesObject = personalienToSave.personStesObject;
        personStesObject.svNrFromZas = personenstammdaten.controls.svNr.value;
        personStesObject.geburtsDatum = personenstammdaten.controls.geburtsdatum.value;
        personStesObject.geschlechtId = personenstammdaten.controls.geschlecht.value;
        personStesObject.namePersReg = personenstammdaten.controls.zasName.value;
        personStesObject.vornamePersReg = personenstammdaten.controls.zasVorname.value;
        personStesObject.zivilstandId = personenstammdaten.controls.zivilstand.value;
        personStesObject.nationalitaetId = personenstammdaten.controls.nationalitaet['landAutosuggestObject'].staatId;
        personStesObject.nationalitaetObject = personenstammdaten.controls.nationalitaet['landAutosuggestObject'];
        this.createVersichertenNrList(personStesObject, personenstammdaten);
    }

    private setAufenhaltsbewilligungToSave(personalienToSave: any, aufenhaltsbewilligung: FormGroup) {
        personalienToSave.leistungsimportEUEFTA = aufenhaltsbewilligung.controls.leistungsimporteuefta.value;
        personalienToSave.aufenthaltsStatusID = aufenhaltsbewilligung.controls.aufenthaltsstatus.value;
        personalienToSave.aufenthaltBis = this.formUtils.transformDateToTimestamps(aufenhaltsbewilligung.controls.aufenthaltbis.value);
        personalienToSave.einreiseDatum = this.formUtils.transformDateToTimestamps(aufenhaltsbewilligung.controls.einreisedatum.value);
    }

    private createVersichertenNrList(personStes: PersonStesDTO, personenstammdaten: FormGroup) {
        let pvNrList: Array<PersonVersichertenNrDTO>;
        const svNr = personenstammdaten.controls.svNr.value;
        if (svNr) {
            pvNrList = new Array<PersonVersichertenNrDTO>();
            if (personStes.versichertenNrList) {
                personStes.versichertenNrList.forEach((element: PersonVersichertenNrDTO) => {
                    if (!element.istAktuelleVersichertenNr) {
                        pvNrList.push({
                            personStesId: personStes.personStesId,
                            versichertenNr: element.versichertenNr,
                            istAktuelleVersichertenNr: false
                        });
                    }
                });
            }
            pvNrList.push({
                personStesId: personStes.personStesId,
                versichertenNr: svNr,
                istAktuelleVersichertenNr: true
            });
        }
        personStes.versichertenNrList = pvNrList;
    }
}
