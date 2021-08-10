import { Injectable } from '@angular/core';
import { BewMassnahmeTeilnehmerlisteReactiveFormsService } from './bew-massnahme-teilnehmerliste-reactive-forms.service';
import { AmmTeilnehmerlisteBuchungenParamDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteBuchungenParamDTO';
import { FormUtilsService } from '@app/shared';
import { FiltersData } from './bew-massnahme-teilnehmerliste-form.component';
import { DropdownOption } from '@app/shared/services/forms/form-utils.service';

@Injectable()
export class MassnahmeTeilnehmerlisteHandlerService {
    constructor(public reactiveForms: BewMassnahmeTeilnehmerlisteReactiveFormsService, private formUtils: FormUtilsService) {}

    mapToDTO(teilnehmerlisteDto: AmmTeilnehmerlisteBuchungenParamDTO, data: FiltersData): AmmTeilnehmerlisteBuchungenParamDTO {
        const teilnehmerlisteDtoParam: AmmTeilnehmerlisteBuchungenParamDTO = { ...teilnehmerlisteDto };
        const controls = this.reactiveForms.searchForm.controls;

        if (data.dfeId) {
            teilnehmerlisteDtoParam.durchfuehrungseinheit = { durchfuehrungsId: data.dfeId };
            teilnehmerlisteDtoParam.beschaeftigungseinheitId = data.beschaeftigungseinheitId;
        } else {
            teilnehmerlisteDtoParam.massnahmeId = data.massnahmeId;
            teilnehmerlisteDtoParam.durchfuehrungseinheit = {};
        }

        teilnehmerlisteDtoParam.typeTeilnehmerliste = true;
        teilnehmerlisteDtoParam.createManuellUmbuchbarParam = true;
        teilnehmerlisteDtoParam.createTeilnehmerliste = true;

        if (this.isZeitraum()) {
            teilnehmerlisteDtoParam.createInitialerZeitraum = false;
            teilnehmerlisteDtoParam.initialerZeitraumfilterCode = this.formUtils.getCodeByCodeId(data.zeitraumfilterOptions, controls.initialerZeitraumfilterCode.value);
            teilnehmerlisteDtoParam.initialerZeitraumVon = controls.initialerZeitraumVon.value;
            teilnehmerlisteDtoParam.initialerZeitraumBis = controls.initialerZeitraumBis.value;
        } else {
            teilnehmerlisteDtoParam.createInitialerZeitraum = true;
        }

        return teilnehmerlisteDtoParam;
    }

    mapToForm(teilnehmerlisteDto: AmmTeilnehmerlisteBuchungenParamDTO, zeitraumfilterOptions: DropdownOption[]): AmmTeilnehmerlisteBuchungenParamDTO {
        return {
            initialerZeitraumVon: this.formUtils.parseDate(teilnehmerlisteDto.initialerZeitraumVon),
            initialerZeitraumBis: this.formUtils.parseDate(teilnehmerlisteDto.initialerZeitraumBis),
            initialerZeitraumfilterCode: this.formUtils.getCodeIdByCode(zeitraumfilterOptions, teilnehmerlisteDto.initialerZeitraumfilterCode)
        };
    }

    private isZeitraum(): boolean {
        const formControls = this.reactiveForms.searchForm.controls;
        return formControls.initialerZeitraumVon.value && formControls.initialerZeitraumBis.value && formControls.initialerZeitraumfilterCode.value !== 0;
    }
}
