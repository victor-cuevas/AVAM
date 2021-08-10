import { Permissions } from '@shared/enums/permissions.enum';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { ZeitplanDTO } from '@app/shared/models/dtos-generated/zeitplanDTO';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FormUtilsService } from '@app/shared';

@Injectable()
export class KursKollectiveFormHandler {
    constructor(
        private formBuilder: FormBuilder,
        private authenticationService: AuthenticationService,
        private dbTranslateService: DbTranslateService,
        private formUtils: FormUtilsService
    ) {}

    createForm(): FormGroup {
        return this.formBuilder.group({
            ergaenzendeAngaben: null,
            stichtag: null,
            eintrittsfrist: null,

            vormittags: this.createFormArray(),
            nachmittags: this.createFormArray(),
            verfuegbarkeit: null,
            kurszeiten: null,
            durchfuehrungskriterium: null,
            vorstellungsgespraech: null,

            eingangsdatum: [null, [DateValidator.isDateInFutureNgx, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],

            bearbeitung: [null, [Validators.required]],
            anbieter: null,
            verantwortlichePerson: null,
            teilnehmer: null,
            teilnehmerMax: null,
            ueberbuchung: null,
            ueberbuchungMax: null,
            wartelisteplaetze: null,
            wartelisteplaetzeMax: null,
            buchungsNummer: null,
            status: [null, [Validators.required]],
            buchungAuf: null,
            durchfuehrungsNr: null,
            validationGroup: this.formBuilder.group(
                {
                    durchfuehrungVon: null,
                    durchfuehrungBis: null,
                    anzahlKurstageKurs: null,
                    anzahlLektionenKurs: null,
                    anzahlKurstageBuchung: [null, [NumberValidator.isPositiveInteger, Validators.required, NumberValidator.val131]],
                    anzahlLektionen: [null, [NumberValidator.isPositiveInteger, NumberValidator.val131]],
                    buchungVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, Validators.required]],
                    buchungBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, Validators.required]]
                },
                {
                    validators: [
                        DateValidator.rangeBetweenDates('buchungVon', 'buchungBis', 'val201'),
                        DateValidator.val186('buchungVon', 'buchungBis', 'anzahlKurstageBuchung'),
                        DateValidator.checkPeriodGreaterThan12('buchungVon', 'buchungBis'),
                        DateValidator.val282('durchfuehrungVon', 'durchfuehrungBis', 'buchungVon', 'buchungBis') //VAL281
                    ]
                }
            )
        });
    }

    subscribeToValGroup(form: FormGroup) {
        return form.valueChanges.subscribe(() => {
            const anzahlLektionen = form.controls.anzahlLektionen as FormControl;
            const anzahlKurstageBuchung = form.controls.anzahlKurstageBuchung as FormControl;
            const anzahlLektionenKurs = form.controls.anzahlLektionenKurs as FormControl;
            const anzahlKurstageKurs = form.controls.anzahlKurstageKurs as FormControl;

            if (!!anzahlLektionen.value) {
                if (+anzahlLektionen.value < +anzahlKurstageBuchung.value && +anzahlLektionen.value > +anzahlLektionenKurs.value) {
                    anzahlLektionen.setErrors({
                        ...anzahlLektionen.errors,
                        val182: { type: 'warning' },
                        val183: { type: 'warning', value: anzahlLektionen.value }
                    });
                } else if (+anzahlLektionen.value < +anzahlKurstageBuchung.value) {
                    anzahlLektionen.setErrors({
                        ...anzahlLektionen.errors,
                        val183: { type: 'warning', value: anzahlLektionen.value }
                    });
                } else if (+anzahlLektionen.value > +anzahlLektionenKurs.value) {
                    anzahlLektionen.setErrors({
                        ...anzahlLektionen.errors,
                        val182: { type: 'warning' }
                    });
                }
            } else {
                if (anzahlLektionen.errors) {
                    anzahlLektionen.setErrors({
                        ...anzahlLektionen.errors
                    });
                } else {
                    anzahlLektionen.setErrors(null);
                }
            }

            if (+anzahlKurstageBuchung.value > +anzahlKurstageKurs.value) {
                anzahlKurstageBuchung.setErrors({
                    ...anzahlKurstageBuchung.errors,
                    val181: { type: 'warning' }
                });
            } else {
                if (anzahlKurstageBuchung.errors) {
                    anzahlKurstageBuchung.setErrors({
                        ...anzahlKurstageBuchung.errors
                    });
                } else {
                    anzahlKurstageBuchung.setErrors(null);
                }
            }
        });
    }

    getBearbeiterSearchTokens(ownerId?: number) {
        const currentUser = this.authenticationService.getLoggedUser();

        if (currentUser) {
            return {
                berechtigung: Permissions.AMM_NUTZUNG_BUCHUNG_BEARBEITEN,
                myBenutzerstelleId: `${ownerId ? ownerId : currentUser.benutzerstelleId}`,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                benutzerstelleId: ownerId ? ownerId : currentUser.benutzerstelleId
            };
        }

        return null;
    }

    mapToForm(data: AmmBuchungParamDTO, bearbeiten?: boolean) {
        return {
            ergaenzendeAngaben: this.dbTranslateService.translateWithOrder(data.ergaenzendeAngaben, 'name'),
            stichtag: this.formUtils.parseDate(data.stichtag),
            eintrittsfrist: this.formUtils.parseDate(data.eintrittsfrist),

            verfuegbarkeit: data.zeitplanObject ? (data.zeitplanObject.verfuegbarkeitObject ? data.zeitplanObject.verfuegbarkeitObject.codeId.toString() : null) : null,
            kurszeiten: data.zeitplanObject ? this.dbTranslateService.translateWithOrder(data.zeitplanObject, 'arbeitszeit') : null,
            durchfuehrungskriterium: data.durchfuehrungskriteriumObject.codeId,
            vormittags: this.getVormittags(data.zeitplanObject),
            nachmittags: this.getNachmittags(data.zeitplanObject),
            vorstellungsgespraech: data.vorstellungsgespraechTest,
            eingangsdatum: this.formUtils.parseDate(data.ammBuchungSession.gesuchseingang),

            durchfuehrungsNr: data.durchfuehrungsId,
            anbieter: data.unternehmenObject,
            verantwortlichePerson: data.benutzerDetailDTO,
            teilnehmer: data.anzahlTeilnehmer,
            teilnehmerMax: data.maxTeilnehmerApplicable ? data.maxTeilnehmer : null,
            ueberbuchung: data.anzahlUeberbuchungen,
            ueberbuchungMax: data.maxUeberbuchungen ? data.maxUeberbuchungen : 0,
            wartelisteplaetze: data.wartelisteplaetze,
            wartelisteplaetzeMax: data.maxWartelisteplaetze ? data.maxWartelisteplaetze : 0,
            status: data.ammBuchungSession.statusId,
            buchungsNummer: data.ammBuchungSession.buchungsNr,
            buchungAuf: data.buchungAuf ? this.dbTranslateService.instant(data.buchungAuf) : null,
            bearbeitung: data.ammBuchungSession.benutzerDetailDTO,
            validationGroup: {
                durchfuehrungVon: this.formUtils.parseDate(data.durchfuehrungVon),
                durchfuehrungBis: this.formUtils.parseDate(data.durchfuehrungBis),
                anzahlKurstageKurs: data.anzahlKurstage,
                anzahlLektionenKurs: data.anzahlLektionen,
                buchungVon: this.getBuchungVon(data, bearbeiten),
                buchungBis: this.getBuchungBis(data, bearbeiten),
                anzahlKurstageBuchung: bearbeiten ? data.ammBuchungSession.anzahlKurstage : data.anzahlKurstage,
                anzahlLektionen: bearbeiten ? data.ammBuchungSession.anzahlLektionen : data.anzahlLektionen
            }
        };
    }

    mapToDTO(form: FormGroup, lastData: AmmBuchungParamDTO, statiData: CodeDTO[]) {
        const controls = form.controls;
        const statObj = statiData.find(el => el.codeId === +controls.status.value);
        const ammBuchungSession = {
            ...lastData.ammBuchungSession,
            buchungVon: controls.validationGroup.value.buchungVon
                ? this.formUtils.parseDate(controls.validationGroup.value.buchungVon)
                : this.formUtils.parseDate(lastData.durchfuehrungVon),
            buchungBis: controls.validationGroup.value.buchungBis
                ? this.formUtils.parseDate(controls.validationGroup.value.buchungBis)
                : this.formUtils.parseDate(lastData.durchfuehrungBis),
            anzahlKurstage: controls.validationGroup.value.anzahlKurstageBuchung,
            anzahlLektionen: controls.validationGroup.value.anzahlLektionen,
            benutzerDetailDTO: controls.bearbeitung['benutzerObject'],
            gesuchseingang: this.formUtils.parseDate(controls.eingangsdatum.value),
            statusId: controls.status.value,
            statusObject: statObj
        };

        return { ...lastData, ammBuchungSession };
    }

    getBuchungVon(data: AmmBuchungParamDTO, bearbeiten?: boolean) {
        return bearbeiten ? this.formUtils.parseDate(data.ammBuchungSession.buchungVon) : this.formUtils.parseDate(data.durchfuehrungVon);
    }

    getBuchungBis(data: AmmBuchungParamDTO, bearbeiten?: boolean) {
        return bearbeiten ? this.formUtils.parseDate(data.ammBuchungSession.buchungBis) : this.formUtils.parseDate(data.durchfuehrungBis);
    }

    getVormittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moV, zeitplanObject.diV, zeitplanObject.miV, zeitplanObject.doV, zeitplanObject.frV, zeitplanObject.saV, zeitplanObject.soV];
    }

    getNachmittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moN, zeitplanObject.diN, zeitplanObject.miN, zeitplanObject.doN, zeitplanObject.frN, zeitplanObject.saN, zeitplanObject.soN];
    }

    private createFormArray() {
        return new FormArray([
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false)
        ]);
    }
}
