import { Injectable } from '@angular/core';
import { VertragswertSuchenReactiveFormsService } from './vertragswert-suchen-reactive-forms.service';
import { VertragswertSuchenParamDTO } from '@app/shared/models/dtos-generated/vertragswertSuchenParamDTO';
import { FormUtilsService } from '@app/shared';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FacadeService } from '@app/shared/services/facade.service';
import { JaNeinCodeEnum } from '@app/shared/enums/domain-code/amm-ja-nein-code.enum';
import { AbstractControl, FormControl } from '@angular/forms';

@Injectable()
export class VertragswertSuchenHandlerService {
    constructor(public reactiveForms: VertragswertSuchenReactiveFormsService, private formUtils: FormUtilsService, private ammHelper: AmmHelper, private facade: FacadeService) {}

    mapDefaultValues() {
        return {
            nurAktuelleVertragswerte: JaNeinCodeEnum.JA
        };
    }

    mapToDTO(full = false): VertragswertSuchenParamDTO {
        const controls = this.reactiveForms.searchForm.controls;
        const anbieter = controls.anbieterParam['unternehmenAutosuggestObject'];

        if (this.isFieldEnabled(controls.profilNummer)) {
            return {
                profilNummer: this.getNumericControlValue(controls.profilNummer.value)
            };
        }

        if (this.isFieldEnabled(controls.vertragswertNr)) {
            return {
                vertragswertNr: this.getNumericControlValue(controls.vertragswertNr.value)
            };
        }

        return {
            vertragswertNr: controls.vertragswertNr.value,
            profilNummer: controls.profilNummer.value,
            gueltigVon: this.formUtils.parseDate(controls.gueltigVon.value),
            gueltigBis: this.formUtils.parseDate(controls.gueltigBis.value),
            leistungsvereinbarungStatusId: controls.leistungsvereinbarungStatusId.value ? +controls.leistungsvereinbarungStatusId.value : -1,
            nurAktuelleVertragswerte: controls.nurAktuelleVertragswerte.value !== '' ? !!+controls.nurAktuelleVertragswerte.value : null,
            anbieterId: anbieter && anbieter.unternehmenId !== -1 ? anbieter.unternehmenId : null,
            anbieterName: anbieter && anbieter.unternehmenId !== -1 ? this.ammHelper.concatenateUnternehmensnamen(anbieter.name1, anbieter.name2, anbieter.name3) : null
        };
    }

    mapToForm(data: any): any {
        const unternehmen = data.anbieterId
            ? {
                  unternehmenId: data.anbieterId ? data.anbieterId : -1,
                  name1: data.anbieterName ? data.anbieterName : null
              }
            : null;

        return {
            anbieterParam: unternehmen,
            gueltigVon: data.gueltigVon ? new Date(data.gueltigVon) : '',
            gueltigBis: data.gueltigBis ? new Date(data.gueltigBis) : '',
            vertragswertNr: data.vertragswertNr ? data.vertragswertNr : null,
            profilNummer: data.profilNummer ? data.profilNummer : '',
            leistungsvereinbarungStatusId: data.leistungsvereinbarungStatusId.toString(),
            nurAktuelleVertragswerte: data.nurAktuelleVertragswerte === true ? 1 : 0,
            statusId: data.statusId !== -1 ? data.statusId : null
        };
    }

    private getNumericControlValue(value: any): number {
        return value ? value : 0;
    }

    private isFieldEnabled(formControl: AbstractControl) {
        return formControl.value && formControl.enabled;
    }
}
