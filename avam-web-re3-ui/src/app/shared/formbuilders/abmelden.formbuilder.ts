import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { DateValidator } from '../validators/date-validator';
import { DbTranslateService } from '../services/db-translate.service';
import { VermittlungSelectComponent } from '..';
import { MessageBus } from '../services/message-bus';
import { UserValidator } from '@shared/validators/autosuggest-validator';

export class AbmeldenFormbuilder {
    abmeldenForm: FormGroup;

    abmeldeAngabenForm: FormGroup;
    neuerArbeitgeberForm: FormGroup;

    boDatenToSave: any;

    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService, private readonly messageBus: MessageBus, private dbTranslateService: DbTranslateService) {}

    static parseIntSave(stringValue): number {
        return stringValue ? +stringValue : null;
    }

    initForm(): FormGroup {
        this.abmeldenForm = this.formBuilder.group({
            abmeldeAngabenForm: this.buildAbmeldenAngaben(),
            neuerArbeitgeberForm: this.buildNeuerArbeitgeber()
        });
        this.definiereFormGroups();

        return this.abmeldenForm;
    }

    mapToDTO(letzteAktualisierung, formBundle): any {
        this.boDatenToSave = { ...letzteAktualisierung };

        // abmeldeAngabenForm
        this.boDatenToSave.abmeldeDatum = this.formUtils.transformDateToTimestamps(this.abmeldeAngabenForm.controls.abmeldedatum.value);
        this.boDatenToSave.stelleGefunden = this.abmeldeAngabenForm.controls.stellegefunden.value;

        // abmeldegrund is a DTO
        if (this.abmeldeAngabenForm.controls.abmeldegrund.value) {
            this.boDatenToSave.abmeldegrund = { codeId: this.abmeldeAngabenForm.controls.abmeldegrund.value };
        } else {
            this.boDatenToSave.abmeldegrund = null;
        }

        this.boDatenToSave.aufgrundVermittlung = this.abmeldeAngabenForm.controls.aufgrundvermittlung.value;

        if (formBundle.vermittlungGuiEntry) {
            this.boDatenToSave.arbeitsvermittlung = {};
            this.boDatenToSave.arbeitsvermittlung.zuweisungId = formBundle.vermittlungGuiEntry.id;
            this.boDatenToSave.arbeitsvermittlung.schnellZuweisungFlag = formBundle.vermittlungGuiEntry.schnellFlag;
        } else {
            this.boDatenToSave.arbeitsvermittlung = null;
        }

        this.boDatenToSave.berufTaetigkeit = this.abmeldeAngabenForm.controls.berufTaetigkeit['berufAutosuggestObject'];
        this.boDatenToSave.arbeitsbeginn = this.formUtils.transformDateToTimestamps(this.abmeldeAngabenForm.controls.arbeitsbeginn.value);
        this.boDatenToSave.personalberater = this.abmeldeAngabenForm.controls.personalberater['benutzerObject'];

        // neuerArbeitgeberForm
        this.boDatenToSave.neuerArbeitgeberBekannt = this.neuerArbeitgeberForm.controls.neuerarbeitgeberbekannt.value;
        this.boDatenToSave.neuerArbeitgeber = formBundle.unternehmenDTO;

        // on unternehmen provided: not really necessary
        this.boDatenToSave.branche = this.neuerArbeitgeberForm.controls.branche.value ? this.neuerArbeitgeberForm.controls.branche['branchAutosuggestObj'] : null;

        return this.boDatenToSave;
    }

    mapToForm(letzteAktualisierung, formBundle) {
        // choose correct branche
        let relevanteBranche = letzteAktualisierung.branche;
        if (letzteAktualisierung.neuerArbeitgeber) {
            relevanteBranche = letzteAktualisierung.neuerArbeitgeber.nogaDTO;
        }

        // store vermittlung guiEntry
        formBundle.vermittlungGuiEntry = this.createVermittlungsGuiEntry(letzteAktualisierung.arbeitsvermittlung);

        let alkText: string;
        if (letzteAktualisierung.transferAlkCode) {
            alkText = this.dbTranslateService.translate(letzteAktualisierung.transferAlkCode, 'text');

            if (letzteAktualisierung.datumTransferALK) {
                alkText = alkText + ` ${this.formUtils.getGuiStringDateFromIsoString(letzteAktualisierung.datumTransferALK)}`;
            }
        } else {
            alkText = this.dbTranslateService.instant('amm.zahlungen.message.keinedatenuebermittelt');
        }

        // provide datum or null
        this.updateStesDetailContent(letzteAktualisierung.abmeldeDatum);
        // on reset the letzteAktualisierung might still be {}
        return {
            abmeldeAngabenForm: {
                abmeldedatum: this.formUtils.parseDate(letzteAktualisierung.abmeldeDatum),
                stellegefunden: letzteAktualisierung.stelleGefunden,
                // unpack DTO
                abmeldegrund: letzteAktualisierung.abmeldegrund ? letzteAktualisierung.abmeldegrund.codeId : null,
                aufgrundvermittlung: letzteAktualisierung.aufgrundVermittlung,

                vermittlungsnummer: formBundle.vermittlungGuiEntry ? formBundle.vermittlungGuiEntry.nr : null,
                berufTaetigkeit: letzteAktualisierung.berufTaetigkeit,
                arbeitsbeginn: this.formUtils.parseDate(letzteAktualisierung.arbeitsbeginn),
                personalberater: letzteAktualisierung.personalberater
            },
            neuerArbeitgeberForm: {
                neuerarbeitgeberbekannt: letzteAktualisierung.neuerArbeitgeberBekannt,
                unternehmensname: letzteAktualisierung.neuerArbeitgeber ? letzteAktualisierung.neuerArbeitgeber.name1 : null,
                branche: relevanteBranche,
                transferanalk: alkText
            }
        };
    }

    updateStesDetailContent(abmeldeDatum) {
        const utils = this.formUtils;
        this.messageBus.sendData({
            type: 'stes-details-content',
            data: { ueberschriftAddition: abmeldeDatum ? utils.transformToStringIfNgbDate(utils.checkDateIfNull(abmeldeDatum)) : null }
        });
    }

    definiereFormGroups() {
        this.abmeldeAngabenForm = this.abmeldenForm.get('abmeldeAngabenForm') as FormGroup;
        this.neuerArbeitgeberForm = this.abmeldenForm.get('neuerArbeitgeberForm') as FormGroup;
    }

    disablePersonal(disable: boolean) {
        if (disable) {
            this.abmeldeAngabenForm.controls.personalberater.disable();
        } else {
            this.abmeldeAngabenForm.controls.personalberater.enable();
        }
    }

    /**
     * creates the vermittlung gui entry which is not a DTO
     */
    private createVermittlungsGuiEntry(dto) {
        if (dto) {
            const guiEntry = {};
            VermittlungSelectComponent.buildArbeitsVermittlungDtoCore(dto, guiEntry);
            return guiEntry;
        }
        return null;
    }

    private buildAbmeldenAngaben(): FormGroup {
        return this.formBuilder.group({
            abmeldedatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, Validators.required]],
            stellegefunden: [true],
            abmeldegrund: [null, [Validators.required]],
            aufgrundvermittlung: [false],

            vermittlungsnummer: [null, [Validators.required]],
            berufTaetigkeit: [],
            arbeitsbeginn: [null, [DateValidator.dateFormatNgx, DateValidator.dateRangeNgx]],
            personalberater: [null, [Validators.required, UserValidator.val212]]
        });
    }

    private buildNeuerArbeitgeber(): FormGroup {
        return this.formBuilder.group({
            neuerarbeitgeberbekannt: [false],
            unternehmensname: [null, [Validators.required]],
            branche: [null, [Validators.required]],
            transferanalk: []
        });
    }
}
