import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { ZeitplanDTO } from '@app/shared/models/dtos-generated/zeitplanDTO';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { InfotagBewirtschaftungGrunddatenReactiveFormsService } from './infotag-bewirtschaftung-grunddaten-reactive-forms.service';
import { FacadeService } from '@shared/services/facade.service';

@Injectable()
export class InfotagBewirtschaftungGrunddatenHandlerService {
    constructor(public reactiveForms: InfotagBewirtschaftungGrunddatenReactiveFormsService, private translate: TranslateService, private facade: FacadeService) {}

    languagePropertyMapper(element: CodeDTO) {
        return {
            value: element.code,
            labelDe: element.kurzTextDe,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt
        };
    }

    mapToForm(grunddatenDto: SessionDTO) {
        return {
            erfassungssprache: this.translate.currentLang.toUpperCase(),
            titelDe: grunddatenDto.titelDe,
            titelFr: grunddatenDto.titelFr,
            titelIt: grunddatenDto.titelIt,
            ergaenzendeAngabenDe: grunddatenDto.bemerkungDe,
            ergaenzendeAngabenFr: grunddatenDto.bemerkungFr,
            ergaenzendeAngabenIt: grunddatenDto.bemerkungIt,
            durchfuehrungVon: this.facade.formUtilsService.parseDate(grunddatenDto.gueltigVon),
            durchfuehrungBis: this.facade.formUtilsService.parseDate(grunddatenDto.gueltigBis),
            verfuegbarkeit:
                grunddatenDto.zeitplanObject.verfuegbarkeitObject && grunddatenDto.zeitplanObject.verfuegbarkeitObject.codeId
                    ? grunddatenDto.zeitplanObject.verfuegbarkeitObject.codeId.toString()
                    : null,
            vormittags: this.setVormittags(grunddatenDto.zeitplanObject),
            nachmittags: this.setNachmittags(grunddatenDto.zeitplanObject),
            kurszeitenDe: grunddatenDto.zeitplanObject.arbeitszeitDe,
            kurszeitenFr: grunddatenDto.zeitplanObject.arbeitszeitFr,
            kurszeitenIt: grunddatenDto.zeitplanObject.arbeitszeitIt,
            durchfuehrungsNr: grunddatenDto.durchfuehrungsId,
            isInfotagSichtbar: grunddatenDto.imAngebotSichtbar,
            teilnehmerMax: grunddatenDto.teilnehmerAnzahlMax,
            ueberbuchungMax: grunddatenDto.ueberbuchungenMax
        };
    }

    setVormittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moV, zeitplanObject.diV, zeitplanObject.miV, zeitplanObject.doV, zeitplanObject.frV, zeitplanObject.saV, zeitplanObject.soV];
    }

    setNachmittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moN, zeitplanObject.diN, zeitplanObject.miN, zeitplanObject.doN, zeitplanObject.frN, zeitplanObject.saN, zeitplanObject.soN];
    }

    mapToDTO(dto: SessionDTO, verfuegbarkeitOptions: CodeDTO[]): SessionDTO {
        const controls = this.reactiveForms.grunddatenForm.controls;

        return {
            ...dto,
            titelDe: controls.titelDe.value,
            titelFr: controls.titelFr.value,
            titelIt: controls.titelIt.value,
            bemerkungDe: controls.ergaenzendeAngabenDe.value,
            bemerkungFr: controls.ergaenzendeAngabenFr.value,
            bemerkungIt: controls.ergaenzendeAngabenIt.value,
            gueltigVon: this.facade.formUtilsService.parseDate(controls.durchfuehrungVon.value),
            gueltigBis: this.facade.formUtilsService.parseDate(controls.durchfuehrungBis.value),
            zeitplanObject: this.mapZeitplanObject(this.reactiveForms.grunddatenForm, dto.zeitplanObject, verfuegbarkeitOptions),
            imAngebotSichtbar: !!controls.isInfotagSichtbar.value,
            teilnehmerAnzahlMax: controls.teilnehmerMax.value,
            ueberbuchungenMax: controls.ueberbuchungMax.value,
            teilnehmerAnzahlMin: 0,
            // The next field is mapped extra in RE2 and expected from the BL
            // This call should be safe because both fields are required and should not be null
            anzahlKurstage: this.getAnzahlKurstage(controls.durchfuehrungVon.value, controls.durchfuehrungBis.value)
        };
    }

    mapZeitplanObject(form: FormGroup, zeitplan: ZeitplanDTO, verfuegbarkeitOptions: CodeDTO[]): ZeitplanDTO {
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

    getAnzahlKurstage(from, to): number {
        const fromMoment = moment(from, ['DD.MM.YYYY', 'x'], true);
        const toMoment = moment(to, ['DD.MM.YYYY', 'x'], true);

        return toMoment.diff(fromMoment, 'days') + 1;
    }
}
