import { VertragswertTypCodeEnum } from '@shared/enums/domain-code/vertragswert-typ-code.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { VertragswertDetailReactiveFormsService } from './vertragswert-detail-reactive-forms.service';
import { VertragswertDTO } from '@shared/models/dtos-generated/vertragswertDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { VertragswertDetailData } from './vertragswert-detail-form.component';
import { WertTripelDTO } from '@dtos/wertTripelDTO';

@Injectable()
export class VertragswertDetailHandlerService {
    constructor(private reactiveForms: VertragswertDetailReactiveFormsService, private formUtils: FormUtilsService, private dbTranslateService: DbTranslateService) {}

    mapToForm(vertragswertDto: VertragswertDTO) {
        return {
            budgetposition: vertragswertDto.budgetposition ? this.dbTranslateService.translateWithOrder(vertragswertDto.budgetposition, 'name') : '',
            gueltig: +vertragswertDto.gueltigB,
            gueltigVon: this.formUtils.parseDate(vertragswertDto.gueltigVon),
            gueltigBis: this.formUtils.parseDate(vertragswertDto.gueltigBis),
            preismodellTyp: vertragswertDto.preismodellTyp ? vertragswertDto.preismodellTyp.codeId : null,
            preismodell: vertragswertDto.preismodell ? vertragswertDto.preismodell.codeId : null,
            chf: vertragswertDto.preisModellBetrag,
            ergaenzendeAngaben: vertragswertDto.beschreibung,
            chfPreismodel: vertragswertDto.wertTripelObject.chfBetrag,
            tntagePreismodelRow1: vertragswertDto.wertTripelObject.teilnehmerTage,
            tntagePreismodelRow2: vertragswertDto.tnTagesPreis,
            tnPreismodelRow1: vertragswertDto.wertTripelObject.teilnehmer,
            tnPreismodelRow2: vertragswertDto.tnPreis,
            dePreismodel: vertragswertDto.anzahlDe,
            lektionenPreismodel: vertragswertDto.anzahlLektionen,
            status: this.dbTranslateService.translate(vertragswertDto.leistungsvereinbarungObject.statusObject, 'text')
        };
    }

    mapToFormOnGueltigChange(vertragswertDto: VertragswertDTO) {
        return {
            budgetposition: vertragswertDto.budgetposition ? this.dbTranslateService.translateWithOrder(vertragswertDto.budgetposition, 'name') : '',
            gueltigVon: this.formUtils.parseDate(vertragswertDto.gueltigVon),
            gueltigBis: this.formUtils.parseDate(vertragswertDto.gueltigBis),
            preismodellTyp: vertragswertDto.preismodellTyp ? vertragswertDto.preismodellTyp.codeId : null,
            preismodell: vertragswertDto.preismodell ? vertragswertDto.preismodell.codeId : null,
            chf: 0,
            ergaenzendeAngaben: vertragswertDto.beschreibung,
            chfPreismodel: 0,
            tntagePreismodelRow1: 0,
            tntagePreismodelRow2: 0,
            tnPreismodelRow1: 0,
            tnPreismodelRow2: 0,
            dePreismodel: vertragswertDto.anzahlDe,
            lektionenPreismodel: vertragswertDto.anzahlLektionen,
            status: this.dbTranslateService.translate(vertragswertDto.leistungsvereinbarungObject.statusObject, 'text')
        };
    }

    mapToDTO(vertragswertDetailData: VertragswertDetailData): VertragswertDTO {
        const dto: VertragswertDTO = { ...vertragswertDetailData.vertragswertDto };
        const controls = this.reactiveForms.vertragswertDetailForm.controls;

        dto.beschreibung = controls.ergaenzendeAngaben.value;
        dto.gueltigVon = this.formUtils.parseDate(controls.gueltigVon.value);
        dto.gueltigBis = this.formUtils.parseDate(controls.gueltigBis.value);
        dto.preismodellTyp = vertragswertDetailData.preismodellTypOptions.find(option => option.codeId === +controls.preismodellTyp.value) as CodeDTO;
        dto.preismodell = vertragswertDetailData.vertragswertDto.preismodellList.find(option => option.codeId === +controls.preismodell.value) as CodeDTO;
        dto.preisModellBetrag = controls.chf.value;
        dto.tnTagesPreis = controls.tntagePreismodelRow2.value;
        dto.tnPreis = controls.tnPreismodelRow2.value;
        dto.anzahlDe = controls.dePreismodel.value;
        dto.anzahlLektionen = controls.lektionenPreismodel.value;

        dto.wertTripelObject.changed = this.setChanged(vertragswertDetailData.vertragswertDto.wertTripelObject, controls);
        dto.wertTripelObject.teilnehmer = controls.tnPreismodelRow1.value;
        dto.wertTripelObject.teilnehmerTage = controls.tntagePreismodelRow1.value;
        dto.wertTripelObject.chfBetrag = controls.chf.value;
        dto.gueltigB = !!+controls.gueltig.value;

        return dto;
    }

    setDefaultValues(planwertUebernommen: boolean, dto: VertragswertDTO) {
        if (!planwertUebernommen) {
            this.reactiveForms.vertragswertDetailForm.controls.preismodell.setValue(dto.preismodellList[0].codeId);
            this.reactiveForms.vertragswertDetailForm.controls.tntagePreismodelRow1.setValue(null);
            this.reactiveForms.vertragswertDetailForm.controls.tnPreismodelRow1.setValue(null);
            this.reactiveForms.vertragswertDetailForm.controls.chf.setValue(null);
            this.reactiveForms.vertragswertDetailForm.controls.lektionenPreismodel.setValue(null);

            if (dto.typ.code === VertragswertTypCodeEnum.MASSNAHME) {
                this.reactiveForms.vertragswertDetailForm.controls.dePreismodel.setValue(null);
            }
        }
    }

    mapToFormStatusBudgetposition(vertragswertDto: VertragswertDTO) {
        return {
            budgetposition: vertragswertDto.budgetposition ? this.dbTranslateService.translateWithOrder(vertragswertDto.budgetposition, 'name') : '',
            status: this.dbTranslateService.translate(vertragswertDto.leistungsvereinbarungObject.statusObject, 'text')
        };
    }

    private setChanged(wertTripelObject: WertTripelDTO, controls): boolean {
        return (
            wertTripelObject.teilnehmer !== +controls.tnPreismodelRow1.value ||
            wertTripelObject.teilnehmerTage !== +controls.tntagePreismodelRow1.value ||
            wertTripelObject.chfBetrag !== +controls.chf.value
        );
    }
}
