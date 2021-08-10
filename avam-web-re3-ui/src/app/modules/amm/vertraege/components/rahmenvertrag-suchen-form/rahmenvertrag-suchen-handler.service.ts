import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { RahmenvertragSuchenParamDTO } from '@app/shared/models/dtos-generated/rahmenvertragSuchenParamDTO';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { JaNeinCodeEnum } from '../../../../../shared/enums/domain-code/amm-ja-nein-code.enum';
import { RahmenvertragSuchenReactiveFormsService } from './rahmenvertrag-suchen-reactive-forms.service';

@Injectable()
export class RahmenvertragSuchenHandlerService {
    constructor(public reactiveForms: RahmenvertragSuchenReactiveFormsService, private formUtils: FormUtilsService, private ammHelper: AmmHelper) {}

    mapDefaultValues() {
        return {
            gueltigDropdown: JaNeinCodeEnum.JA
        };
    }

    propertyMapper = (element: StrukturElementDTO) => {
        return {
            value: element.strukturelementId,
            labelDe: element.beschreibungDe,
            labelFr: element.beschreibungFr,
            labelIt: element.beschreibungIt
        };
    };

    mapToDTO(statusOptions?: CodeDTO[]): RahmenvertragSuchenParamDTO {
        const controls = this.reactiveForms.searchForm.controls;
        const anbieter = controls.anbieterParam['unternehmenAutosuggestObject'];
        const gueltigNumber = +controls.gueltigDropdown.value;

        if (controls.rahmenvertragNr.value) {
            return {
                rahmenvertragNr: +controls.rahmenvertragNr.value
            };
        }

        return {
            titel: controls.titel.value ? controls.titel.value : '',
            anbieterId: anbieter && anbieter.unternehmenId !== -1 ? anbieter.unternehmenId : 0,
            anbieterName: anbieter && anbieter.unternehmenId !== -1 ? this.ammHelper.concatenateUnternehmensnamen(anbieter.name1, anbieter.name2, anbieter.name3) : '',
            gueltig: !!gueltigNumber,
            gueltigVon: this.formUtils.parseDate(controls.gueltigVon.value),
            gueltigBis: this.formUtils.parseDate(controls.gueltigBis.value),
            strukturelementId: +controls.massnahmentypDropdown.value || null,
            statusObject: statusOptions ? (statusOptions.find(option => option.codeId === +controls.stautusDropdown.value) as CodeDTO) : null
        };
    }

    mapToForm(data) {
        const unternehmen = data.anbieterId
            ? {
                  unternehmenId: data.anbieterId ? data.anbieterId : -1,
                  name1: data.anbieterName ? data.anbieterName : null
              }
            : null;

        return {
            rahmenvertragNr: data.rahmenvertragNr ? data.rahmenvertragNr : null,
            titel: data.titel,
            anbieterParam: unternehmen,
            gueltigDropdown: data.gueltig ? JaNeinCodeEnum.JA : JaNeinCodeEnum.NEIN,
            gueltigVon: data.gueltigVon ? new Date(data.gueltigVon) : '',
            gueltigBis: data.gueltigBis ? new Date(data.gueltigBis) : '',
            massnahmentypDropdown: data.strukturelementId,
            stautusDropdown: data.statusObject && data.statusObject.value !== -1 ? data.statusObject.value : null
        };
    }
}
