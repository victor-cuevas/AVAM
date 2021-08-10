import { Injectable } from '@angular/core';
import { AbrechnungswertSuchenReactiveFormService } from './abrechnungswert-suchen-reactive-form.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { JaNeinCodeEnum } from '@app/shared/enums/domain-code/amm-ja-nein-code.enum';
import { AbrechnungswertSuchenParamDTO } from '@app/shared/models/dtos-generated/abrechnungswertSuchenParamDTO';
import { FormUtilsService } from '@app/shared';
import { AmmAlleKeinerCodeEnum } from '@app/shared/enums/domain-code/amm-alle-keiner-code.enum';
import { FacadeService } from '@shared/services/facade.service';

@Injectable()
export class AbrechnungswertSuchenHandlerService {
    constructor(public reactiveForms: AbrechnungswertSuchenReactiveFormService, private facade: FacadeService) {}

    mapToForm(state: AbrechnungswertSuchenParamDTO) {
        if (state.abrechnungswertNr) {
            const defaultValues = this.mapDefaultValues();
            return {
                ...defaultValues,
                abrechnungswertNr: state.abrechnungswertNr
            };
        } else if (state.profilNr) {
            const defaultValues = this.mapDefaultValues();
            return {
                ...defaultValues,
                profilNr: state.profilNr
            };
        }
        return {
            abrechnungswertNr: state.abrechnungswertNr,
            profilNr: state.profilNr,
            anbieter: state.anbieterId ? { unternehmenId: state.anbieterId, name1: state.anbieterName } : null,
            status: state.statusAbrechnung,
            faelligVon: state.faelligVon ? new Date(state.faelligVon) : '',
            faelligBis: state.faelligBis ? new Date(state.faelligBis) : '',
            sucheAlleAbrechnungswerte: state.sucheAlleAbrechnungswerte === 'true' ? AmmAlleKeinerCodeEnum.ALLE : AmmAlleKeinerCodeEnum.KEINER,
            sucheNurAktuelleAbrechnungswerte: state.sucheNurAktuelleAbrechnungswerte === 'true' ? JaNeinCodeEnum.JA : JaNeinCodeEnum.NEIN
        };
    }

    mapDefaultValues() {
        return {
            sucheAlleAbrechnungswerte: AmmAlleKeinerCodeEnum.ALLE,
            sucheNurAktuelleAbrechnungswerte: JaNeinCodeEnum.JA
        };
    }

    mapToDTO(param: AbrechnungswertSuchenParamDTO): AbrechnungswertSuchenParamDTO {
        const controls = this.reactiveForms.abrechnungswertSuchenForm.controls;
        const defaultValues = { ...param, action: 'abrechnungswerttrefferlisteAnzeigen' };
        if (controls.abrechnungswertNr.value) {
            return { ...defaultValues, abrechnungswertNr: controls.abrechnungswertNr.value || '' };
        } else if (controls.profilNr.value) {
            return { ...defaultValues, profilNr: controls.profilNr.value || '' };
        }
        const unternehmenObject = this.getUnternehmenAutosuggestObject();
        return {
            ...defaultValues,
            anbieterId: unternehmenObject.anbieterId,
            anbieterName: unternehmenObject.anbieterName,
            abrechnungswertNr: controls.abrechnungswertNr.value || '',
            profilNr: controls.profilNr.value || '',
            statusAbrechnung: this.getStatus(),
            faelligVon: this.facade.formUtilsService.parseDate(controls.faelligVon.value),
            faelligBis: this.facade.formUtilsService.parseDate(controls.faelligBis.value),
            sucheAlleAbrechnungswerte: this.searchAll(),
            sucheNurAktuelleAbrechnungswerte: this.nurAktuelle()
        };
    }

    getUnternehmenAutosuggestObject() {
        const controls = this.reactiveForms.abrechnungswertSuchenForm.controls;
        const unternehmenObject = controls.anbieter['unternehmenAutosuggestObject'];
        const anbieterName = unternehmenObject && unternehmenObject.name1 ? unternehmenObject.name1 : '';
        const anbieterId = unternehmenObject && unternehmenObject.unternehmenId !== -1 ? unternehmenObject.unternehmenId : '';

        return { anbieterName, anbieterId };
    }

    getStatus(): string {
        const controls = this.reactiveForms.abrechnungswertSuchenForm.controls;

        if (controls.sucheAlleAbrechnungswerte.value === AmmAlleKeinerCodeEnum.KEINER) {
            return '';
        }
        return controls.status.value || '';
    }

    searchAll(): string {
        const controls = this.reactiveForms.abrechnungswertSuchenForm.controls;

        if (controls.status.value || controls.sucheNurAktuelleAbrechnungswerte.value === JaNeinCodeEnum.NEIN) {
            return '';
        }
        return controls.sucheAlleAbrechnungswerte.value === AmmAlleKeinerCodeEnum.ALLE ? 'true' : 'false';
    }

    nurAktuelle(): string {
        const controls = this.reactiveForms.abrechnungswertSuchenForm.controls;

        if (controls.sucheAlleAbrechnungswerte.value === AmmAlleKeinerCodeEnum.KEINER) {
            return '';
        }
        return controls.sucheNurAktuelleAbrechnungswerte.value === JaNeinCodeEnum.JA ? 'true' : 'false';
    }
}
