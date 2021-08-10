import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { Injectable } from '@angular/core';
import { BewKursGrunddatenReactiveFormsService } from './bew-kurs-grunddaten-reactive-forms.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { BewirtschaftungKursGrunddatenData } from './bew-kurs-grunddaten-form.component';
import { FormUtilsService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { ZeitplanDTO } from '@dtos/zeitplanDTO';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

@Injectable()
export class BewKursGrunddatenHandlerService {
    constructor(public reactiveForms: BewKursGrunddatenReactiveFormsService, private formUtils: FormUtilsService, private translateService: TranslateService) {}

    mapToForm(grunddatenData: BewirtschaftungKursGrunddatenData) {
        return {
            erfassungssprache: grunddatenData.erfassungsspracheIdGrunddatenState
                ? grunddatenData.erfassungsspracheIdGrunddatenState
                : this.formUtils.getCodeIdByCode(grunddatenData.erfassungsspracheOptions, this.translateService.currentLang.toUpperCase()),
            titelDe: grunddatenData.grunddatenDto.titelDe,
            titelFr: grunddatenData.grunddatenDto.titelFr,
            titelIt: grunddatenData.grunddatenDto.titelIt,
            ergaenzendeAngabenDe: grunddatenData.grunddatenDto.bemerkungDe,
            ergaenzendeAngabenFr: grunddatenData.grunddatenDto.bemerkungFr,
            ergaenzendeAngabenIt: grunddatenData.grunddatenDto.bemerkungIt,
            durchfuehrungVon: this.formUtils.parseDate(grunddatenData.grunddatenDto.gueltigVon),
            durchfuehrungBis: this.formUtils.parseDate(grunddatenData.grunddatenDto.gueltigBis),
            stichtagAm: this.formUtils.parseDate(grunddatenData.grunddatenDto.stichtagAm),
            eintrittsfristBis: this.formUtils.parseDate(grunddatenData.grunddatenDto.eintrittsfristBis),
            anzahlKurstage: grunddatenData.grunddatenDto.anzahlKurstage,
            anzahlLektionen: grunddatenData.grunddatenDto.anzahlLektionen,
            verfuegbarkeit:
                grunddatenData.grunddatenDto.zeitplanObject.verfuegbarkeitObject && grunddatenData.grunddatenDto.zeitplanObject.verfuegbarkeitObject.codeId
                    ? grunddatenData.grunddatenDto.zeitplanObject.verfuegbarkeitObject.codeId.toString()
                    : null,
            vormittags: this.setVormittags(grunddatenData.grunddatenDto.zeitplanObject),
            nachmittags: this.setNachmittags(grunddatenData.grunddatenDto.zeitplanObject),
            kurszeitenDe: grunddatenData.grunddatenDto.zeitplanObject.arbeitszeitDe,
            kurszeitenFr: grunddatenData.grunddatenDto.zeitplanObject.arbeitszeitFr,
            kurszeitenIt: grunddatenData.grunddatenDto.zeitplanObject.arbeitszeitIt,
            durchfuehrungskriterium: grunddatenData.grunddatenDto.durchfuehrungskriteriumId,
            vorstellungsgespraechTest: grunddatenData.grunddatenDto.vorstellungsgespraechTest,
            status: grunddatenData.grunddatenDto.statusObject.codeId,
            inPlanungAkquisitionSichtbar: grunddatenData.grunddatenDto.inPlanungAkquisitionSichtbar,
            imAngebotSichtbar: grunddatenData.grunddatenDto.imAngebotSichtbar,
            lamErstelltEntscheide: grunddatenData.grunddatenDto.lamErstelltEntscheide,
            teilnehmerMin: grunddatenData.grunddatenDto.teilnehmerAnzahlMin,
            teilnehmerMax: grunddatenData.grunddatenDto.teilnehmerAnzahlMax,
            ueberbuchungMax: grunddatenData.grunddatenDto.ueberbuchungenMax,
            wartelisteplaetze: grunddatenData.grunddatenDto.wartelisteplaetze
        };
    }

    mapToDTO(sessionDto: SessionDTO, verfuegbarkeitOptions: CodeDTO[], statusOptions: CodeDTO[], durchfuehrungskriteriumOptions: CodeDTO[]): SessionDTO {
        const sessionDtoToSave: SessionDTO = { ...sessionDto };
        const controls = this.reactiveForms.grunddatenForm.controls;

        sessionDtoToSave.titelDe = controls.titelDe.value;
        sessionDtoToSave.titelFr = controls.titelFr.value;
        sessionDtoToSave.titelIt = controls.titelIt.value;
        sessionDtoToSave.bemerkungDe = controls.ergaenzendeAngabenDe.value;
        sessionDtoToSave.bemerkungFr = controls.ergaenzendeAngabenFr.value;
        sessionDtoToSave.bemerkungIt = controls.ergaenzendeAngabenIt.value;
        sessionDtoToSave.gueltigVon = this.formUtils.parseDate(controls.durchfuehrungVon.value);
        sessionDtoToSave.gueltigBis = this.formUtils.parseDate(controls.durchfuehrungBis.value);
        sessionDtoToSave.stichtagAm = this.formUtils.parseDate(controls.stichtagAm.value);
        sessionDtoToSave.eintrittsfristBis = this.formUtils.parseDate(controls.eintrittsfristBis.value);
        sessionDtoToSave.inPlanungAkquisitionSichtbar = controls.inPlanungAkquisitionSichtbar.value;
        sessionDtoToSave.anzahlKurstage = controls.anzahlKurstage.value;
        sessionDtoToSave.anzahlLektionen = controls.anzahlLektionen.value;
        sessionDtoToSave.zeitplanObject = this.mapZeitplanObject(this.reactiveForms.grunddatenForm, sessionDto.zeitplanObject, verfuegbarkeitOptions);
        sessionDtoToSave.durchfuehrungskriteriumId = controls.durchfuehrungskriterium.value;
        sessionDtoToSave.durchfuehrungskriteriumObject = durchfuehrungskriteriumOptions.find(option => option.codeId === +controls.durchfuehrungskriterium.value) as CodeDTO;
        sessionDtoToSave.vorstellungsgespraechTest = controls.vorstellungsgespraechTest.value;
        sessionDtoToSave.statusObject = statusOptions.find(option => option.codeId === +controls.status.value) as CodeDTO;
        sessionDtoToSave.inPlanungAkquisitionSichtbar = controls.inPlanungAkquisitionSichtbar.value;
        sessionDtoToSave.imAngebotSichtbar = !!controls.imAngebotSichtbar.value;
        sessionDtoToSave.lamErstelltEntscheide = controls.lamErstelltEntscheide.value;
        sessionDtoToSave.teilnehmerAnzahlMin = controls.teilnehmerMin.value;
        sessionDtoToSave.teilnehmerAnzahlMax = controls.teilnehmerMax.value;
        sessionDtoToSave.ueberbuchungenMax = controls.ueberbuchungMax.value;
        sessionDtoToSave.wartelisteplaetze = controls.wartelisteplaetze.value;

        return sessionDtoToSave;
    }

    private setVormittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moV, zeitplanObject.diV, zeitplanObject.miV, zeitplanObject.doV, zeitplanObject.frV, zeitplanObject.saV, zeitplanObject.soV];
    }

    private setNachmittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moN, zeitplanObject.diN, zeitplanObject.miN, zeitplanObject.doN, zeitplanObject.frN, zeitplanObject.saN, zeitplanObject.soN];
    }

    private mapZeitplanObject(form: FormGroup, zeitplan: ZeitplanDTO, verfuegbarkeitOptions: CodeDTO[]): ZeitplanDTO {
        const vormittags: FormArray = form.controls.vormittags as FormArray;
        const nachmittags: FormArray = form.controls.nachmittags as FormArray;
        const verfuegbarkeit: FormControl = form.controls.verfuegbarkeit as FormControl;

        return {
            ...zeitplan,
            verfuegbarkeitObject: verfuegbarkeitOptions.find(el => el.codeId === +verfuegbarkeit.value),
            arbeitszeitDe: form.controls.kurszeitenDe.value,
            arbeitszeitFr: form.controls.kurszeitenFr.value,
            arbeitszeitIt: form.controls.kurszeitenIt.value,
            moV: vormittags.value[0],
            diV: vormittags.value[1],
            miV: vormittags.value[2],
            doV: vormittags.value[3],
            frV: vormittags.value[4],
            saV: vormittags.value[5],
            soV: vormittags.value[6],
            moN: nachmittags.value[0],
            diN: nachmittags.value[1],
            miN: nachmittags.value[2],
            doN: nachmittags.value[3],
            frN: nachmittags.value[4],
            saN: nachmittags.value[5],
            soN: nachmittags.value[6]
        };
    }
}
