import { BeschaeftigungseinheitDTO } from '@dtos/beschaeftigungseinheitDTO';
import { PraktikumsstelleDTO } from '@dtos/praktikumsstelleDTO';
import { AmmConstants } from '@shared/enums/amm-constants';
import { ZeitplanDTO } from '@dtos/zeitplanDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { BewBeschaeftigungseinheitGrunddatenReactiveFormsService } from './bew-beschaeftigungseinheit-grunddaten-reactive-forms.service';
import { BewBeschaeftigungseinheitGrunddatenData } from './bew-beschaeftigungseinheit-grunddaten-form.component';

@Injectable()
export class BewBeschaeftigungseinheitGrunddatenHandlerService {
    constructor(public reactiveForms: BewBeschaeftigungseinheitGrunddatenReactiveFormsService, private formUtils: FormUtilsService, private translateService: TranslateService) {}

    mapToForm(beschaeftigungseinheitData: BewBeschaeftigungseinheitGrunddatenData) {
        const be = beschaeftigungseinheitData.beDto;

        return {
            erfassungssprache: beschaeftigungseinheitData.erfassungsspracheIdGrunddatenState
                ? beschaeftigungseinheitData.erfassungsspracheIdGrunddatenState
                : this.formUtils.getCodeIdByCode(beschaeftigungseinheitData.erfassungsspracheOptions, this.translateService.currentLang.toUpperCase()),
            titelDe: be.titelDe,
            titelFr: be.titelFr,
            titelIt: be.titelIt,
            ergaenzendeAngabenDe: be.bemerkungDe,
            ergaenzendeAngabenFr: be.bemerkungFr,
            ergaenzendeAngabenIt: be.bemerkungIt,
            berufTaetigkeit: be.taetigkeitObject,
            arbeitgeber: be.type === AmmConstants.PRAKTIKUMSSTELLE ? (be as PraktikumsstelleDTO).unternehmenObject : null,
            gueltigVon: this.formUtils.parseDate(be.gueltigVon),
            gueltigBis: this.formUtils.parseDate(be.gueltigBis),
            verfuegbarkeit:
                be.zeitplanObject.verfuegbarkeitObject && be.zeitplanObject.verfuegbarkeitObject.codeId ? be.zeitplanObject.verfuegbarkeitObject.codeId.toString() : null,
            vormittags: this.setVormittags(be.zeitplanObject),
            nachmittags: this.setNachmittags(be.zeitplanObject),
            arbeitszeitenDe: be.zeitplanObject.arbeitszeitDe,
            arbeitszeitenFr: be.zeitplanObject.arbeitszeitFr,
            arbeitszeitenIt: be.zeitplanObject.arbeitszeitIt,
            status: be.statusObject.codeId,
            imAngebotSichtbar: be.imAngebotSichtbar,
            kapazitaetMax: be.kapazitaetMax,
            ueberbuchungMax: be.ueberbuchungenMax,
            beschaeftigungsgrad: be.beschaeftigungsgradMax
        };
    }

    mapToDTO(beschaeftigungseinheitData: BewBeschaeftigungseinheitGrunddatenData): BeschaeftigungseinheitDTO {
        const beDtoToSave = { ...beschaeftigungseinheitData.beDto };
        const controls = this.reactiveForms.grunddatenForm.controls;

        beDtoToSave.titelDe = controls.titelDe.value;
        beDtoToSave.titelFr = controls.titelFr.value;
        beDtoToSave.titelIt = controls.titelIt.value;
        beDtoToSave.bemerkungDe = controls.ergaenzendeAngabenDe.value;
        beDtoToSave.bemerkungFr = controls.ergaenzendeAngabenFr.value;
        beDtoToSave.bemerkungIt = controls.ergaenzendeAngabenIt.value;
        beDtoToSave.taetigkeitObject = controls.berufTaetigkeit.value ? controls.berufTaetigkeit['berufAutosuggestObject'] : null;

        if (beDtoToSave.type === AmmConstants.PRAKTIKUMSSTELLE && controls.arbeitgeber.value) {
            (beDtoToSave as PraktikumsstelleDTO).unternehmenObject = {
                unternehmenId: controls.arbeitgeber['unternehmenAutosuggestObject'].unternehmenId
            };
        }

        beDtoToSave.gueltigVon = this.formUtils.parseDate(controls.gueltigVon.value);
        beDtoToSave.gueltigBis = this.formUtils.parseDate(controls.gueltigBis.value);
        beDtoToSave.zeitplanObject = this.mapZeitplanObject(this.reactiveForms.grunddatenForm, beDtoToSave.zeitplanObject, beschaeftigungseinheitData.verfuegbarkeitAmmOptions);
        beDtoToSave.statusObject = beschaeftigungseinheitData.sessionStatusOptions.find(option => option.codeId === +controls.status.value) as CodeDTO;
        beDtoToSave.imAngebotSichtbar = controls.imAngebotSichtbar.value;
        beDtoToSave.kapazitaetMax = controls.kapazitaetMax.value;
        beDtoToSave.ueberbuchungenMax = controls.ueberbuchungMax.value;
        beDtoToSave.beschaeftigungsgradMax = controls.beschaeftigungsgrad.value;

        return beDtoToSave;
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
