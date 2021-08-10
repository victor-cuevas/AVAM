import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ArbeitsvermittlungRestService } from '@app/core/http/arbeitsvermittlung-rest.service';
import { FormUtilsService } from '@app/shared';
import { ArbeitsvermittlungDataDTO } from '@app/shared/models/dtos-generated/arbeitsvermittlungDataDTO';
import { BurOertlicheEinheitDTO } from '@app/shared/models/dtos-generated/burOertlicheEinheitDTO';
import { NogaDTO } from '@app/shared/models/dtos-generated/nogaDTO';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { StesZwischenverdienstDetailsDTO } from '@app/shared/models/dtos-generated/stesZwischenverdienstDetailsDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { VermittlungDto } from '@app/shared/models/dtos/vermittlung-dto.interface';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { SpinnerService } from 'oblique-reactive';

const zwischenverdienstChannel = 'zwischenverdienst';

@Injectable()
export class ZwischenverdienstFormHandler {
    staatSwitzerland: StaatDTO;
    vermittGuiEntry: VermittlungDto;

    constructor(
        private formBuilder: FormBuilder,
        private dbTranslateService: DbTranslateService,
        private arbeitsvermittlungRestService: ArbeitsvermittlungRestService,
        private spinnerService: SpinnerService,
        private formUtils: FormUtilsService
    ) {}

    createForm() {
        return this.formBuilder.group(
            {
                arbeitgeberBURId: null,
                arbeitgeberId: null,
                schnellzuweisungId: null,
                zuweisungId: null,
                zvDatumVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                zvDatumBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                isSelbststaendigerZV: false,
                isAufgrundZuweisung: false,
                vermittlungsnummer: [{ value: null, disabled: true }, Validators.required],
                vermittlungvom: null,
                stellenBezeichnung: null,
                berufTaetigkeit: [null, Validators.required],
                name1: [null, Validators.required],
                name2: null,
                name3: null,
                plz: null,
                land: null,
                bur: null,
                branche: null,
                initialisiertDurchId: null,
                quelleId: null,
                bemerkung: null,
                ojbVersion: null
            },
            { validator: DateValidator.rangeBetweenDates('zvDatumVon', 'zvDatumBis', 'val201') }
        );
    }

    formatUnternehmenPlz(unternehmen: UnternehmenDTO): string {
        let plz = '';
        let ort = '';

        const isAusland = unternehmen.staat.staatId !== this.staatSwitzerland.staatId;

        if (isAusland) {
            plz = unternehmen.plzAusland && unternehmen.plzAusland.trim().length > 1 ? unternehmen.plzAusland : unternehmen.postfachPlzAusland;
            ort = unternehmen.ortAusland && unternehmen.ortAusland.trim().length > 1 ? unternehmen.ortAusland : unternehmen.postfachPlzOrtAusland;
        } else {
            plz = unternehmen.plz ? unternehmen.plz.postleitzahl : null;
            plz = !plz && unternehmen.postfachPlzObject ? unternehmen.postfachPlzObject.postleitzahl : plz;
            ort = this.dbTranslateService.translate(unternehmen.plz ? unternehmen.plz : unternehmen.postfachPlzObject, 'ort');
        }

        return `${plz} ${ort}`;
    }

    setUnternehmen(unternehmen: UnternehmenDTO, zwischenverdienstForm: FormGroup) {
        if (unternehmen) {
            const unternehmenLand = unternehmen.staat ? this.dbTranslateService.translate(unternehmen.staat, 'name') : null;
            zwischenverdienstForm.patchValue({
                name1: unternehmen.name1,
                name2: unternehmen.name2,
                name3: unternehmen.name3,
                plz: this.formatUnternehmenPlz(unternehmen),
                land: unternehmenLand,
                bur: unternehmen.burNummer,
                branche: this.mapToFormBrancheLegacy(unternehmen.nogaDTO),
                arbeitgeberBURId: unternehmen.burOrtEinheitId !== 0 ? unternehmen.burOrtEinheitId : null,
                arbeitgeberId: unternehmen.unternehmenId
            });
        } else {
            this.resetArbeitgeberData(zwischenverdienstForm);
        }
    }

    mapToFormBrancheLegacy(nogaDTO: NogaDTO): string {
        return nogaDTO ? `${nogaDTO.nogaCodeUp} / ${this.dbTranslateService.translate(nogaDTO, 'textlang')}` : null;
    }

    setVermittlung(vermittGuiEntry: VermittlungDto, zwischenverdienstForm: FormGroup) {
        const date = this.formUtils.parseDate(vermittGuiEntry.vom);

        this.vermittGuiEntry = vermittGuiEntry;
        this.resetVermittlungData(zwischenverdienstForm);
        zwischenverdienstForm.controls.vermittlungsnummer.setValue(vermittGuiEntry.nr);
        zwischenverdienstForm.controls.vermittlungvom.setValue(date);

        if (vermittGuiEntry.schnellFlag) {
            zwischenverdienstForm.controls.schnellzuweisungId.setValue(vermittGuiEntry.id);
            zwischenverdienstForm.controls.zuweisungId.setValue(null);
        } else {
            zwischenverdienstForm.controls.schnellzuweisungId.setValue(null);
            zwischenverdienstForm.controls.zuweisungId.setValue(vermittGuiEntry.id);
        }
        this.handleVermittlungResponse(vermittGuiEntry, zwischenverdienstForm);
        zwischenverdienstForm.markAsDirty();
    }

    handleAufgrundZuweisung(zwischenverdienstForm, isAufgrundZuweisung) {
        if (isAufgrundZuweisung) {
            this.resetArbeitgeberData(zwischenverdienstForm);
            this.resetBerufData(zwischenverdienstForm);
            zwischenverdienstForm.controls.name1.setErrors(null);
        } else {
            this.resetVermittlungData(zwischenverdienstForm);
            this.resetBerufData(zwischenverdienstForm);
            zwischenverdienstForm.controls.name1.setErrors({ required: true });
        }
    }

    handleVermittlungResponse(vermittGuiEntry, zwischenverdienstForm: FormGroup) {
        if (vermittGuiEntry) {
            this.spinnerService.activate(zwischenverdienstChannel);
            this.arbeitsvermittlungRestService.getData(vermittGuiEntry.id, vermittGuiEntry.schnellFlag).subscribe(
                (data: ArbeitsvermittlungDataDTO) => {
                    zwischenverdienstForm.controls.stellenBezeichnung.setValue(data.stellenBezeichnung);
                    zwischenverdienstForm.controls.arbeitgeberId.setValue(data.unternehmenId);
                    zwischenverdienstForm.controls.arbeitgeberBURId.setValue(data.burOrtEinheitId);
                    zwischenverdienstForm.controls.berufTaetigkeit.setValue(data.berufsqualifikationDto.berufDto);
                    data.name1 ? zwischenverdienstForm.controls.name1.setValue(data.name1) : zwischenverdienstForm.controls.name1.setValue('');
                    data.name2 ? zwischenverdienstForm.controls.name2.setValue(data.name2) : zwischenverdienstForm.controls.name2.setValue('');
                    data.name3 ? zwischenverdienstForm.controls.name3.setValue(data.name3) : zwischenverdienstForm.controls.name3.setValue('');
                    data.staat.nameDe
                        ? zwischenverdienstForm.controls.land.setValue(this.dbTranslateService.translate(data.staat, 'name'))
                        : zwischenverdienstForm.controls.land.setValue('');
                    data.burNummer ? zwischenverdienstForm.controls.bur.setValue(data.burNummer) : zwischenverdienstForm.controls.bur.setValue('');
                    zwischenverdienstForm.controls.branche.setValue(this.mapToFormBrancheLegacy(data.nogaDTO));
                    zwischenverdienstForm.controls.plz.setValue(this.setPlzOrt(data));
                    this.spinnerService.deactivate(zwischenverdienstChannel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(zwischenverdienstChannel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
        }
    }

    setPlzOrt(plzData: ArbeitsvermittlungDataDTO): string {
        let plz = '';
        let ort = '';

        if (plzData.plz) {
            plz = plzData.plz ? plzData.plz.postleitzahl : '';
            ort = plzData.plz ? this.dbTranslateService.translate(plzData.plz, 'ort') : '';
        } else {
            plz = plzData.plzAusland ? plzData.plzAusland : '';
            ort = plzData.ortAusland ? plzData.ortAusland : '';
        }

        return `${plz} ${ort}`;
    }

    setPlzOrtBur(plzData: BurOertlicheEinheitDTO): string {
        let plz = '';
        let ort = '';

        if (plzData.letzterAGPlzDTO) {
            plz = plzData.letzterAGPlzDTO.postleitzahl;
            ort = this.dbTranslateService.translate(plzData.letzterAGPlzDTO, 'ort');
        }

        return `${plz} ${ort}`;
    }

    setBranche(noga: NogaDTO) {
        let text = '';
        if (noga) {
            text = `${noga.nogaCodeUp} / ${this.dbTranslateService.translateWithOrder(noga, 'textlang')}`;
        }
        return text;
    }

    handleSelbststaendigerZV(zwischenverdienstForm, isSelbststaendigerZV) {
        this.resetArbeitgeberData(zwischenverdienstForm);
        if (isSelbststaendigerZV) {
            zwischenverdienstForm.controls.name1.setErrors(null);
        } else {
            zwischenverdienstForm.controls.name1.setErrors({ required: true });
        }
    }

    mapUnternehmenFromAS(unternehmen, zwischenverdienstForm: FormGroup) {
        zwischenverdienstForm.patchValue({
            arbeitgeberId: unternehmen.unternehmenId,
            arbeitgeberBURId: unternehmen.burOrtEinheitId,
            name2: unternehmen.name2,
            name3: unternehmen.name3,
            plz: this.setPlzOrt(unternehmen),
            land: this.dbTranslateService.translateWithOrder(unternehmen.staat, 'name'),
            bur: unternehmen.burNummer,
            branche: this.setBranche(unternehmen.nogaDTO)
        });
    }

    clearUnternehmenFromAS(zwischenverdienstForm: FormGroup) {
        zwischenverdienstForm.patchValue({
            arbeitgeberId: null,
            arbeitgeberBURId: null,
            name2: null,
            name3: null,
            plz: null,
            land: null,
            bur: null,
            branche: null
        });
    }

    mapBurFromAS(bur: BurOertlicheEinheitDTO, zwischenverdienstForm: FormGroup) {
        zwischenverdienstForm.patchValue({
            arbeitgeberId: null,
            arbeitgeberBURId: bur.burOrtEinheitId,
            name2: bur.letzterAGName2,
            name3: bur.letzterAGName3,
            plz: this.setPlzOrtBur(bur),
            land: null,
            // land: this.dbTranslateService.translateWithOrder(bur.letzterAGLand, 'name'),    Not mapped in get BE , if mapped this can be used or looks stange
            bur: bur.letzterAGBurNummer,
            branche: bur.nogaDTO ? `${bur.nogaDTO.nogaCodeUp} / ${this.dbTranslateService.translateWithOrder(bur.nogaDTO, 'textlang')}` : null
        });
        zwischenverdienstForm.markAsDirty();
    }

    resetVermittlungData(zwischenverdienstForm) {
        zwischenverdienstForm.controls.vermittlungsnummer.reset();
        zwischenverdienstForm.controls.vermittlungvom.reset();
        zwischenverdienstForm.controls.stellenBezeichnung.reset();
        zwischenverdienstForm.controls.zuweisungId.reset();
        zwischenverdienstForm.controls.schnellzuweisungId.reset();
        this.resetArbeitgeberData(zwischenverdienstForm);
        this.resetBerufData(zwischenverdienstForm);
    }

    resetBerufData(zwischenverdienstForm) {
        zwischenverdienstForm.controls.berufTaetigkeit.reset();
    }

    resetArbeitgeberData(zwischenverdienstForm) {
        zwischenverdienstForm.controls.name1.reset();
        zwischenverdienstForm.controls.name2.reset();
        zwischenverdienstForm.controls.name3.reset();
        zwischenverdienstForm.controls.plz.reset();
        zwischenverdienstForm.controls.land.reset();
        zwischenverdienstForm.controls.bur.reset();
        zwischenverdienstForm.controls.branche.reset();
        zwischenverdienstForm.controls.arbeitgeberBURId.reset();
        zwischenverdienstForm.controls.arbeitgeberId.reset();
    }

    mapToDTO(zwischenverdienstForm, stesId, zwischenverdienstId?): StesZwischenverdienstDetailsDTO {
        return {
            arbeitgeberBURId: zwischenverdienstForm.controls.arbeitgeberBURId.value,
            arbeitgeberId: zwischenverdienstForm.controls.arbeitgeberId.value,
            bemerkung: zwischenverdienstForm.controls.bemerkung.value,
            berufId: zwischenverdienstForm.controls.berufTaetigkeit.value ? zwischenverdienstForm.controls.berufTaetigkeit.value.berufId : null,
            berufTaetigkeitObject: zwischenverdienstForm.controls.berufTaetigkeit.value ? zwischenverdienstForm.controls.berufTaetigkeit['berufAutosuggestObject'] : null,
            initialisiertDurchId: zwischenverdienstForm.controls.initialisiertDurchId.value,
            isAufgrundZuweisung: zwischenverdienstForm.controls.isAufgrundZuweisung.value,
            isSelbststaendigerZV: zwischenverdienstForm.controls.isSelbststaendigerZV.value,
            quelleId: zwischenverdienstForm.controls.quelleId.value,
            schnellzuweisungId: zwischenverdienstForm.controls.schnellzuweisungId.value,
            stesId: +stesId,
            zuweisungId: zwischenverdienstForm.controls.zuweisungId.value,
            zvDatumBis: this.formUtils.parseDate(zwischenverdienstForm.controls.zvDatumBis.value),
            zvDatumVon: this.formUtils.parseDate(zwischenverdienstForm.controls.zvDatumVon.value),
            zwischenverdienstId: zwischenverdienstId ? zwischenverdienstId : null,
            ojbVersion: zwischenverdienstForm.controls.ojbVersion.value
        };
    }

    mapCheckboxes(data: StesZwischenverdienstDetailsDTO) {
        return {
            isSelbststaendigerZV: data.isSelbststaendigerZV,
            isAufgrundZuweisung: data.isAufgrundZuweisung
        };
    }

    mapToForm(data: StesZwischenverdienstDetailsDTO) {
        let map = {};
        if (data) {
            map = {
                zvDatumVon: this.formUtils.parseDate(data.zvDatumVon),
                zvDatumBis: this.formUtils.parseDate(data.zvDatumBis),
                arbeitgeberId: data.arbeitgeberId,
                arbeitgeberBURId: data.arbeitgeberBURId,
                initialisiertDurchId: data.initialisiertDurchId,
                quelleId: data.quelleId,
                bemerkung: data.bemerkung,
                ojbVersion: data.ojbVersion
            };
            if (data.arbeitsvermittlungObject) {
                map = {
                    ...map,
                    ...this.mapVermittlungToForm(data)
                };
            }
            if (data.berufTaetigkeitObject) {
                map = { ...map, berufTaetigkeit: data.berufTaetigkeitObject };
            }
            if (data.arbeitgeberObject) {
                map = {
                    ...map,
                    ...this.mapArbeitgeberToForm(data.arbeitgeberObject)
                };
            } else if (data.arbeitgeberBURObject) {
                map = {
                    ...map,
                    ...this.mapArbeitgeberBurToForm(data.arbeitgeberBURObject)
                };
            } else if (data.arbeitsvermittlungObject) {
                map = {
                    ...map,
                    ...this.mapArbeitgeberToForm(data.arbeitsvermittlungObject)
                };
            }
        }
        return map;
    }

    mapVermittlungToForm(data) {
        return {
            vermittlungsnummer: this.getZuweisungNr(data),
            vermittlungvom: this.formUtils.parseDate(data.arbeitsvermittlungObject.zuweisungDatumVom),
            stellenBezeichnung: data.arbeitsvermittlungObject.stellenBezeichnung,
            zuweisungId: data.zuweisungId,
            schnellzuweisungId: data.schnellzuweisungId
        };
    }

    mapArbeitgeberToForm(arbeitgeber: UnternehmenDTO | ArbeitsvermittlungDataDTO) {
        return {
            name1: arbeitgeber,
            name2: arbeitgeber.name2,
            name3: arbeitgeber.name3,
            plz: this.formatUnternehmenPlz(arbeitgeber),
            land: arbeitgeber.staat ? this.dbTranslateService.translate(arbeitgeber.staat, 'name') : null,
            bur: arbeitgeber.burNummer,
            branche: this.mapToFormBrancheLegacy(arbeitgeber.nogaDTO)
        };
    }

    mapArbeitgeberBurToForm(arbeitgeberBur: BurOertlicheEinheitDTO) {
        const nogaText = arbeitgeberBur.nogaDTO ? ` / ${this.dbTranslateService.translate(arbeitgeberBur.nogaDTO, 'textlang')}` : '';
        const plzOrt = `${arbeitgeberBur.letzterAGPlz ? arbeitgeberBur.letzterAGPlz : ''} ${arbeitgeberBur.letzterAGOrt ? arbeitgeberBur.letzterAGOrt : ''}`;
        //const staat = arbeitgeberBur.letzterAGLand ? this.dbTranslateService.translate(arbeitgeberBur.letzterAGLand, 'name') : '';

        return {
            name1: { burOrtEinheitId: arbeitgeberBur.burOrtEinheitId, name1: arbeitgeberBur.letzterAGName1 },
            name2: arbeitgeberBur.letzterAGName2,
            name3: arbeitgeberBur.letzterAGName3,
            plz: plzOrt,
            land: null,
            // land: staat,    Not mapped in BE
            bur: arbeitgeberBur.letzterAGBurNummer,
            branche: `${arbeitgeberBur.letzterAGNogaCode}${nogaText}`
        };
    }

    getSchnellFlag(data) {
        let schnellFlag = false;
        if (data.zuweisungId && !data.schnellzuweisungId) {
            schnellFlag = false;
        } else if (!data.zuweisungId && data.schnellzuweisungId) {
            schnellFlag = true;
        }
        return schnellFlag;
    }

    getZuweisungNr(data) {
        return this.getSchnellFlag(data) ? `SZ-${data.arbeitsvermittlungObject.zuweisungNr}` : `Z-${data.arbeitsvermittlungObject.zuweisungNr}`;
    }
}
