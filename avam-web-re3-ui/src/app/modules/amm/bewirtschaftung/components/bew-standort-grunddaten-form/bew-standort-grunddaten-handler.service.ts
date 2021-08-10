import { AmmConstants } from '@app/shared/enums/amm-constants';
import { PraktikumsstelleDTO } from '@dtos/praktikumsstelleDTO';
import { StandortDTO } from '@dtos/standortDTO';
import { ZeitplanDTO } from '@dtos/zeitplanDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { Injectable } from '@angular/core';
import { BewStandortGrunddatenReactiveFormsService } from './bew-standort-grunddaten-reactive-forms.service';
import { FormUtilsService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { BewStandortGrunddatenData } from './bew-standort-grunddaten-form.component';

@Injectable()
export class BewStandortGrunddatenHandlerService {
    constructor(public reactiveForms: BewStandortGrunddatenReactiveFormsService, private formUtils: FormUtilsService, private translateService: TranslateService) {}

    mapToForm(grunddatenData: BewStandortGrunddatenData) {
        const formBasic = {
            erfassungssprache: grunddatenData.erfassungsspracheIdGrunddatenState
                ? grunddatenData.erfassungsspracheIdGrunddatenState
                : this.formUtils.getCodeIdByCode(grunddatenData.erfassungsspracheOptions, this.translateService.currentLang.toUpperCase()),
            titelDe: grunddatenData.standortDto.titelDe,
            titelFr: grunddatenData.standortDto.titelFr,
            titelIt: grunddatenData.standortDto.titelIt,
            ergaenzendeAngabenDe: grunddatenData.standortDto.bemerkungDe,
            ergaenzendeAngabenFr: grunddatenData.standortDto.bemerkungFr,
            ergaenzendeAngabenIt: grunddatenData.standortDto.bemerkungIt,
            gueltigVon: this.formUtils.parseDate(grunddatenData.standortDto.gueltigVon),
            gueltigBis: this.formUtils.parseDate(grunddatenData.standortDto.gueltigBis),
            inPlanungAkquisitionSichtbar: grunddatenData.standortDto.inPlanungAkquisitionSichtbar,
            sozialeAbfederung: grunddatenData.standortDto.sozialeAbfederung === null ? null : +grunddatenData.standortDto.sozialeAbfederung,
            vorstellungsgespraechTest: grunddatenData.standortDto.vorstellungsgespraechTest
        };

        let formBE;

        if (!grunddatenData.standortDto.apkPraktikumsstelleVerwalten) {
            const firstBE = grunddatenData.standortDto.beschaeftigungseinheiten[0];

            formBE = {
                berufTaetigkeit: firstBE.taetigkeitObject,
                arbeitgeber: firstBE.type === AmmConstants.PRAKTIKUMSSTELLE ? (firstBE as PraktikumsstelleDTO).unternehmenObject : null,
                verfuegbarkeit:
                    firstBE.zeitplanObject.verfuegbarkeitObject && firstBE.zeitplanObject.verfuegbarkeitObject.codeId
                        ? firstBE.zeitplanObject.verfuegbarkeitObject.codeId.toString()
                        : null,
                vormittags: this.setVormittags(firstBE.zeitplanObject),
                nachmittags: this.setNachmittags(firstBE.zeitplanObject),
                arbeitszeitenDe: firstBE.zeitplanObject.arbeitszeitDe,
                arbeitszeitenFr: firstBE.zeitplanObject.arbeitszeitFr,
                arbeitszeitenIt: firstBE.zeitplanObject.arbeitszeitIt,
                status: firstBE.statusObject.codeId,
                imAngebotSichtbar: firstBE.imAngebotSichtbar,
                kapazitaetMax: firstBE.kapazitaetMax,
                ueberbuchungMax: firstBE.ueberbuchungenMax,
                beschaeftigungsgrad: firstBE.beschaeftigungsgradMax
            };
        }

        return { ...formBasic, ...formBE };
    }

    mapToDTO(standortDto: StandortDTO, verfuegbarkeitOptions: CodeDTO[], statusOptions: CodeDTO[]): StandortDTO {
        const standortDtoToSave: StandortDTO = { ...standortDto };
        const controls = this.reactiveForms.grunddatenForm.controls;

        standortDtoToSave.titelDe = controls.titelDe.value;
        standortDtoToSave.titelFr = controls.titelFr.value;
        standortDtoToSave.titelIt = controls.titelIt.value;
        standortDtoToSave.bemerkungDe = controls.ergaenzendeAngabenDe.value;
        standortDtoToSave.bemerkungFr = controls.ergaenzendeAngabenFr.value;
        standortDtoToSave.bemerkungIt = controls.ergaenzendeAngabenIt.value;
        standortDtoToSave.gueltigVon = this.formUtils.parseDate(controls.gueltigVon.value);
        standortDtoToSave.gueltigBis = this.formUtils.parseDate(controls.gueltigBis.value);
        standortDtoToSave.sozialeAbfederung = !!+controls.sozialeAbfederung.value;
        standortDtoToSave.vorstellungsgespraechTest = controls.vorstellungsgespraechTest.value;
        standortDtoToSave.inPlanungAkquisitionSichtbar = controls.inPlanungAkquisitionSichtbar.value;

        if (!standortDto.apkPraktikumsstelleVerwalten) {
            const firstBeschaeftigungseinheit = standortDtoToSave.beschaeftigungseinheiten[0]; // get by reference

            firstBeschaeftigungseinheit.taetigkeitObject = controls.berufTaetigkeit.value ? controls.berufTaetigkeit['berufAutosuggestObject'] : null;

            if (firstBeschaeftigungseinheit.type === AmmConstants.PRAKTIKUMSSTELLE) {
                (firstBeschaeftigungseinheit as PraktikumsstelleDTO).unternehmenObject = {
                    unternehmenId: controls.arbeitgeber['unternehmenAutosuggestObject'].unternehmenId
                };
            }

            firstBeschaeftigungseinheit.zeitplanObject = this.mapZeitplanObject(
                this.reactiveForms.grunddatenForm,
                firstBeschaeftigungseinheit.zeitplanObject,
                verfuegbarkeitOptions
            );
            firstBeschaeftigungseinheit.statusObject = statusOptions.find(option => option.codeId === +controls.status.value) as CodeDTO;
            firstBeschaeftigungseinheit.imAngebotSichtbar = controls.imAngebotSichtbar.value;
            firstBeschaeftigungseinheit.kapazitaetMax = controls.kapazitaetMax.value;
            firstBeschaeftigungseinheit.ueberbuchungenMax = controls.ueberbuchungMax.value;
            firstBeschaeftigungseinheit.beschaeftigungsgradMax = controls.beschaeftigungsgrad.value;
        }

        return standortDtoToSave;
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
            arbeitszeitDe: form.controls.arbeitszeitenDe.value,
            arbeitszeitFr: form.controls.arbeitszeitenFr.value,
            arbeitszeitIt: form.controls.arbeitszeitenIt.value,
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
