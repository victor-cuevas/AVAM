import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { JaNeinCodeEnum } from '@app/shared/enums/domain-code/amm-ja-nein-code.enum';
import { ZahlungenSuchenParameterDTO } from '@app/shared/models/dtos-generated/zahlungenSuchenParameterDTO';
import { TeilzahlungswertSuchenReactiveFormService } from './teilzahlungswert-suchen-reactive-form.service';
import { AmmAlleKeinerCodeEnum } from '@app/shared/enums/domain-code/amm-alle-keiner-code.enum';

@Injectable()
export class TeilzahlungswertSuchenHandlerService {
    constructor(public reactiveForms: TeilzahlungswertSuchenReactiveFormService, private formUtils: FormUtilsService) {}

    mapToForm(state: ZahlungenSuchenParameterDTO) {
        if (state.teilzahlungswertNr) {
            const defaultValues = this.mapDefaultValues();
            return {
                ...defaultValues,
                teilzahlungswertNr: state.teilzahlungswertNr
            };
        } else if (state.profilNr) {
            const defaultValues = this.mapDefaultValues();
            return {
                ...defaultValues,
                profilNr: state.profilNr
            };
        }
        return {
            teilzahlungswertNr: state.teilzahlungswertNr,
            profilNr: state.profilNr,
            anbieter: state.anbieterId ? { unternehmenId: state.anbieterId, name1: state.anbieterName } : null,
            status: state.statusTeilzahlung,
            faelligVon: state.faelligVon ? new Date(state.faelligVon) : '',
            faelligBis: state.faelligBis ? new Date(state.faelligBis) : '',
            sucheAlleTeilzahlungswerte: state.sucheAlleTeilzahlungswerte ? AmmAlleKeinerCodeEnum.ALLE : AmmAlleKeinerCodeEnum.KEINER,
            sucheNurAktuelleTeilzahlungswerte: state.sucheNurAktuelleTeilzahlungswerte ? JaNeinCodeEnum.JA : JaNeinCodeEnum.NEIN
        };
    }

    mapDefaultValues() {
        return {
            sucheAlleTeilzahlungswerte: AmmAlleKeinerCodeEnum.ALLE,
            sucheNurAktuelleTeilzahlungswerte: JaNeinCodeEnum.JA
        };
    }

    mapToDTO(): ZahlungenSuchenParameterDTO {
        const controls = this.reactiveForms.teilzahlungswertSuchenForm.controls;
        if (controls.teilzahlungswertNr.value) {
            return { teilzahlungswertNr: controls.teilzahlungswertNr.value || '' };
        } else if (controls.profilNr.value) {
            return { profilNr: controls.profilNr.value || '' };
        }
        const unternehmenObject = this.getUnternehmenAutosuggestObject();
        return {
            anbieterId: unternehmenObject.anbieterId,
            anbieterName: unternehmenObject.anbieterName,
            teilzahlungswertNr: controls.teilzahlungswertNr.value || '',
            profilNr: controls.profilNr.value || '',
            statusTeilzahlung: this.getStatus(),
            faelligVon: this.formUtils.parseDate(controls.faelligVon.value),
            faelligBis: this.formUtils.parseDate(controls.faelligBis.value),
            sucheAlleTeilzahlungswerte: this.searchAll(),
            sucheNurAktuelleTeilzahlungswerte: this.nurAktuelle()
        };
    }

    getUnternehmenAutosuggestObject() {
        const controls = this.reactiveForms.teilzahlungswertSuchenForm.controls;
        const unternehmenObject = controls.anbieter['unternehmenAutosuggestObject'];
        const anbieterName = unternehmenObject && unternehmenObject.name1 ? unternehmenObject.name1 : '';
        const anbieterId = unternehmenObject && unternehmenObject.unternehmenId !== -1 ? unternehmenObject.unternehmenId : '';

        return { anbieterName, anbieterId };
    }

    getStatus(): number {
        const controls = this.reactiveForms.teilzahlungswertSuchenForm.controls;

        if (controls.sucheAlleTeilzahlungswerte.value === AmmAlleKeinerCodeEnum.KEINER) {
            return 0;
        }
        return +controls.status.value || 0;
    }

    searchAll(): boolean {
        const controls = this.reactiveForms.teilzahlungswertSuchenForm.controls;

        if (controls.status.value || controls.sucheNurAktuelleTeilzahlungswerte.value === JaNeinCodeEnum.NEIN) {
            return null;
        }
        return controls.sucheAlleTeilzahlungswerte.value === AmmAlleKeinerCodeEnum.ALLE;
    }

    nurAktuelle(): boolean {
        const controls = this.reactiveForms.teilzahlungswertSuchenForm.controls;

        if (controls.sucheAlleTeilzahlungswerte.value === AmmAlleKeinerCodeEnum.KEINER) {
            return null;
        }
        return controls.sucheNurAktuelleTeilzahlungswerte.value === JaNeinCodeEnum.JA;
    }
}
