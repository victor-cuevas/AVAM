import { Injectable } from '@angular/core';
import { LeistungsvereinbarungSuchenReactiveFormsService } from './leistungsvereinbarung-suchen-reactive-forms.service';
import { LeistungsvereinbarungSuchenParamDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungSuchenParamDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FormUtilsService } from '@app/shared';
import { AbstractControl } from '@angular/forms';

@Injectable()
export class LeistungsvereinbarungSuchenHandlerService {
    constructor(public reactiveForms: LeistungsvereinbarungSuchenReactiveFormsService, private formUtils: FormUtilsService, private ammHelper: AmmHelper) {}

    mapToDTO(full = false): LeistungsvereinbarungSuchenParamDTO {
        const controls = this.reactiveForms.searchForm.controls;

        if (!full) {
            const dto = this.mapToDtoNichtKombinierbareSuchkriterien(controls);

            if (dto) {
                return dto;
            }
        }

        const anbieter = controls.anbieterParam['unternehmenAutosuggestObject'];

        return {
            leistungsvereinbarungNr: this.getNumericControlValue(controls.leistungsvereinbarungNr.value),
            titel: controls.titel.value ? controls.titel.value : '',
            vertragswertNr: this.getNumericControlValue(controls.vertragswertNr.value),
            profilNr: this.getNumericControlValue(controls.profilNr.value),
            gueltigVon: this.formUtils.parseDate(controls.gueltigVon.value),
            gueltigBis: this.formUtils.parseDate(controls.gueltigBis.value),
            statusId: controls.statusId.value ? controls.statusId.value : -1,
            anbieterId: anbieter && anbieter.unternehmenId !== -1 ? anbieter.unternehmenId : 0,
            anbieterName: anbieter && anbieter.unternehmenId !== -1 ? this.ammHelper.concatenateUnternehmensnamen(anbieter.name1, anbieter.name2, anbieter.name3) : ''
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
            leistungsvereinbarungNr: data.leistungsvereinbarungNr ? data.leistungsvereinbarungNr : null,
            titel: data.titel,
            anbieterParam: unternehmen,
            gueltigVon: data.gueltigVon ? new Date(data.gueltigVon) : '',
            gueltigBis: data.gueltigBis ? new Date(data.gueltigBis) : '',
            vertragswertNr: data.vertragswertNr ? data.vertragswertNr : null,
            profilNr: data.profilNr ? data.profilNr : null,
            statusId: data.statusId !== -1 ? data.statusId : null
        };
    }

    private mapToDtoNichtKombinierbareSuchkriterien(controls: { [key: string]: AbstractControl }): LeistungsvereinbarungSuchenParamDTO {
        if (controls.leistungsvereinbarungNr.value && controls.leistungsvereinbarungNr.enabled) {
            return {
                leistungsvereinbarungNr: this.getNumericControlValue(controls.leistungsvereinbarungNr.value)
            };
        } else if (controls.vertragswertNr.value && controls.vertragswertNr.enabled) {
            return {
                vertragswertNr: this.getNumericControlValue(controls.vertragswertNr.value)
            };
        } else if (controls.profilNr.value && controls.profilNr.enabled) {
            return {
                profilNr: this.getNumericControlValue(controls.profilNr.value)
            };
        } else {
            return null;
        }
    }

    private getNumericControlValue(value: any): number {
        return value ? value : 0;
    }
}
