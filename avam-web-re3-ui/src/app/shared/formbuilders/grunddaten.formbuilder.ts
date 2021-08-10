import { BenutzerDetailDTO } from '@app/shared/models/dtos-generated/benutzerDetailDTO';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '@shared/services/forms/form-utils.service';
import { DateValidator } from '../validators/date-validator';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '../services/db-translate.service';

export class GrunddatenFormbuilder {
    grunddatenForm: FormGroup;
    grunddatenToSave: any;
    anmeldungForm: FormGroup;
    zustaendigkeitForm: FormGroup;
    erwerbssituationAForm: FormGroup;
    leistungsbezugForm: FormGroup;
    zentralerdruckFForm: FormGroup;
    vermittlungsstoppForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private formUtils: FormUtilsService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService
    ) {}

    initForm(isAnmeldung: boolean): FormGroup {
        this.grunddatenForm = this.formBuilder.group({
            anmeldung: this.buildAnmeldung(),
            zustaendigkeit: this.buildZustaendigkeit(),
            erwerbssituationarbeitsmarktsituation: this.buildErwerbssituationAmarktS(isAnmeldung),
            hoechsteabgeschlosseneausbildung: this.formBuilder.group({
                hoechsteausbildung: null
            }),
            leistungsbezug: this.buildLeistungsbezug(),
            sachbearbeitungalk: this.buildSachbearbeitungalk(),
            zentralerdruckformulare: this.buildZentralerdruckformulare(),
            vermittlungsstopp: this.formBuilder.group({
                vermittlungsstopp: null
            })
        });

        return this.grunddatenForm;
    }

    mapToDTO(letzteAktualisirung, grunddatenForm): any {
        this.grunddatenForm = grunddatenForm;
        this.grunddatenToSave = { ...letzteAktualisirung };
        this.definiereFormGroups();
        this.saveAnmeldung();
        this.saveLeistungsbezug();
        this.saveZentralerdruckFForm();
        this.saveZustaendigkeit();

        if (this.grunddatenToSave.erwerbssituationBeiAnmeldung) {
            this.grunddatenToSave.erwerbssituationBeiAnmeldung.codeId = this.erwerbssituationAForm.controls.erwerbssituationbeianmeldung.value;
        } else {
            this.grunddatenToSave.erwerbssituationBeiAnmeldung = { codeId: this.erwerbssituationAForm.controls.erwerbssituationbeianmeldung.value };
        }

        return this.grunddatenToSave;
    }

    mapToForm(letzteAktualisierung) {
        return {
            anmeldung: {
                anmeldedatumgemeinde: this.formUtils.parseDate(letzteAktualisierung.anmeldedatumGemeinde),
                anmeldedatumrav: this.formUtils.parseDate(letzteAktualisierung.anmeldedatumRav),
                stellenantrittab: this.formUtils.parseDate(letzteAktualisierung.stellenantrittAb),
                ravwechsel: this.formUtils.parseDate(letzteAktualisierung.ravWechsel)
            },
            zustaendigkeit: {
                personalberater: letzteAktualisierung.personalberater,
                benutzerstelle: letzteAktualisierung.benutzerstelle ? letzteAktualisierung.benutzerstelle : null
            },
            erwerbssituationarbeitsmarktsituation: {
                erwerbssituationbeianmeldung: letzteAktualisierung.erwerbssituationBeiAnmeldung ? letzteAktualisierung.erwerbssituationBeiAnmeldung.codeId : null,
                erwerbssituationaktuell: this.checkObjAndTranslate(letzteAktualisierung.erwerbssituationAktuell),

                erwerbssituationberechnet: this.checkObjAndTranslate(letzteAktualisierung.erwerbssituationBerechnet),
                arbeitsmarktsituationberechnet: this.checkObjAndTranslate(letzteAktualisierung.arbeitsmarktsituationBerechnet)
            },
            hoechsteabgeschlosseneausbildung: {
                hoechsteausbildung: this.checkObjAndTranslate(letzteAktualisierung.hoechsteAbgeschlosseneAusbildung)
            },
            leistungsbezug: {
                leistungsbezug: letzteAktualisierung.leistungsbezug ? String(letzteAktualisierung.leistungsbezug.codeId) : '',
                kantonalearbeitslosenhilfe: letzteAktualisierung.kantonaleArbeitslosenhilfe ? letzteAktualisierung.kantonaleArbeitslosenhilfe.codeId : null,
                alk: letzteAktualisierung.zahlstelle
                    ? {
                          id: letzteAktualisierung.zahlstelle.zahlstelleId,
                          inputElementOneValue: letzteAktualisierung.zahlstelle.alkZahlstellenNr,
                          inputElementTwoValue: this.dbTranslateService.translate(letzteAktualisierung.zahlstelle, 'kurzname')
                      }
                    : {
                          id: null,
                          inputElementOneValue: null,
                          inputElementTwoValue: null
                      },
                transferanalk: this.formUtils.formatDateNgx(letzteAktualisierung.transferAnAlk, 'DD.MM.YYYY'),
                leistungsimportEUEFTA: letzteAktualisierung.leistungsimportEUEFTA
            },
            sachbearbeitungalk: {
                nameRa: letzteAktualisierung.nameRa,
                vornameRa: letzteAktualisierung.vornameRa,
                telefonRa: GrunddatenFormbuilder.formatTelefon(letzteAktualisierung),
                emailRa: letzteAktualisierung.emailRa
            },
            zentralerdruckformulare: {
                avpproduzieren: letzteAktualisierung.angabenVersichertePerson,
                pabproduzieren: letzteAktualisierung.nachweisPersoenlicheArbeitsbemuehungen
            },
            vermittlungsstopp: {
                vermittlungsstopp: letzteAktualisierung.vermittlungsstopp
            }
        };
    }

    checkObjAndTranslate(obj: any) {
        return obj ? this.dbTranslateService.translate(obj, 'text') : '';
    }

    definiereFormGroups() {
        this.anmeldungForm = this.grunddatenForm.get('anmeldung') as FormGroup;
        this.zustaendigkeitForm = this.grunddatenForm.get('zustaendigkeit') as FormGroup;
        this.erwerbssituationAForm = this.grunddatenForm.get('erwerbssituationarbeitsmarktsituation') as FormGroup;
        this.leistungsbezugForm = this.grunddatenForm.get('leistungsbezug') as FormGroup;
        this.zentralerdruckFForm = this.grunddatenForm.get('zentralerdruckformulare') as FormGroup;
        this.vermittlungsstoppForm = this.grunddatenForm.get('vermittlungsstopp') as FormGroup;
    }

    saveAnmeldung() {
        this.grunddatenToSave.anmeldedatumGemeinde = this.formUtils.transformDateToTimestamps(this.anmeldungForm.controls.anmeldedatumgemeinde.value);
        this.grunddatenToSave.anmeldedatumRav = this.formUtils.transformDateToTimestamps(this.anmeldungForm.controls.anmeldedatumrav.value);
        this.grunddatenToSave.stellenantrittAb = this.formUtils.transformDateToTimestamps(this.anmeldungForm.controls.stellenantrittab.value);
    }

    saveLeistungsbezug() {
        if (this.grunddatenToSave.leistungsbezug) {
            this.grunddatenToSave.leistungsbezug.codeId = this.leistungsbezugForm.controls.leistungsbezug.value;
        } else {
            this.grunddatenToSave.leistungsbezug = { codeId: this.leistungsbezugForm.controls.leistungsbezug.value };
        }

        if (this.leistungsbezugForm.controls.alk.value) {
            const inputElementOneValue = this.leistungsbezugForm.controls.alk.value.inputElementOneValue;
            this.grunddatenToSave.zahlstelle = {
                zahlstelleId: this.leistungsbezugForm.controls.alk.value.id,
                alkNr: inputElementOneValue !== null ? inputElementOneValue.substring(0, 2) : null,
                zahlstelleNr: inputElementOneValue !== null ? inputElementOneValue.substring(2, 5) : null,
                alkZahlstellenNr: inputElementOneValue
            };
        }

        if (this.grunddatenToSave.kantonaleArbeitslosenhilfe) {
            this.grunddatenToSave.kantonaleArbeitslosenhilfe.codeId = this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.value;
        } else {
            this.grunddatenToSave.kantonaleArbeitslosenhilfe = { codeId: this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.value };
        }
    }

    saveZentralerdruckFForm() {
        this.grunddatenToSave.angabenVersichertePerson = this.zentralerdruckFForm.controls.avpproduzieren.value;
        this.grunddatenToSave.nachweisPersoenlicheArbeitsbemuehungen = this.zentralerdruckFForm.controls.pabproduzieren.value;
        this.grunddatenToSave.vermittlungsstopp = this.vermittlungsstoppForm.controls.vermittlungsstopp.value;
    }

    saveZustaendigkeit() {
        const pberaterFromForm = this.zustaendigkeitForm.controls.personalberater['benutzerObject'] as BenutzerDetailDTO;

        this.grunddatenToSave.sachbearbeiterRAVDetailID = Number(pberaterFromForm.benutzerDetailId) !== -1 ? pberaterFromForm.benutzerDetailId : null;
        this.grunddatenToSave.personalberater = this.zustaendigkeitForm.controls.personalberater['benutzerObject'];
    }

    private static formatTelefon(letzteAktualisierung: any): string {
        let tel: string;
        if (letzteAktualisierung.telefonVorwahlRa) {
            tel = `${letzteAktualisierung.telefonVorwahlRa} ${letzteAktualisierung.telefonRa}`;
        } else {
            tel = letzteAktualisierung.telefonRa;
        }
        return tel;
    }

    private buildAnmeldung(): FormGroup {
        return this.formBuilder.group({
            anmeldedatumgemeinde: [null, [DateValidator.dateValidNgx, DateValidator.dateFormatNgx]],
            anmeldedatumrav: [null, [DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx, Validators.required]],
            stellenantrittab: [null, [DateValidator.dateFormatNgx, DateValidator.dateRangeNgx, DateValidator.dateValidNgx, Validators.required]],
            ravwechsel: null
        });
    }

    private buildZustaendigkeit(): FormGroup {
        return this.formBuilder.group({
            personalberater: [null, Validators.required],
            benutzerstelle: { value: null, disabled: true }
        });
    }

    private buildErwerbssituationAmarktS(isAnmeldung: boolean): FormGroup {
        return this.formBuilder.group({
            erwerbssituationbeianmeldung: isAnmeldung ? [null, Validators.required] : null,
            erwerbssituationaktuell: null,
            erwerbssituationberechnet: null,
            arbeitsmarktsituationberechnet: null
        });
    }

    private buildLeistungsbezug(): FormGroup {
        return this.formBuilder.group({
            leistungsbezug: [null, Validators.required],
            kantonalearbeitslosenhilfe: { value: null, disabled: true },
            alk: null,
            transferanalk: null,
            leistungsimportEUEFTA: null
        });
    }

    private buildSachbearbeitungalk(): FormGroup {
        return this.formBuilder.group({
            nameRa: null,
            vornameRa: null,
            telefonRa: null,
            emailRa: null
        });
    }

    private buildZentralerdruckformulare(): FormGroup {
        return this.formBuilder.group({
            avpproduzieren: null,
            pabproduzieren: null
        });
    }
}
