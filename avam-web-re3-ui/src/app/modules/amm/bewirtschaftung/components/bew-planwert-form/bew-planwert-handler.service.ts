import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { PlanwerttypEnum } from '@app/shared/enums/domain-code/planwerttyp.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { BewPlanwertReactiveFormsService } from './bew-planwert-reactive-forms.service';
import { PlanwertDTO } from '@app/shared/models/dtos-generated/planwertDTO';
import * as moment from 'moment';
import { AmmRestwertXDTO } from '@app/shared/models/dtos-generated/ammRestwertXDTO';

@Injectable()
export class BewPlanwertHandlerService {
    constructor(public reactiveForms: BewPlanwertReactiveFormsService, private formUtils: FormUtilsService, private dbTranslateService: DbTranslateService) {}

    mapToForm(dto: PlanwertDTO) {
        return {
            budgetposition: dto.budgetposition ? this.dbTranslateService.translateWithOrder(dto.budgetposition, 'name') : '',
            gueltigVon: this.formUtils.parseDate(dto.gueltigVon),
            gueltigBis: this.formUtils.parseDate(dto.gueltigBis),
            ergaenzendeAngaben: dto.beschreibung,
            planwertNr: dto.planwertId || '',
            preismodellTypDropdown: dto.preismodellTyp ? dto.preismodellTyp.codeId : '',
            preismodellDropdown: dto.preismodell ? dto.preismodell.codeId : dto.preismodellListe[0] ? dto.preismodellListe[0].codeId : '',
            preismodellInput: dto.preisModellBetrag || '',
            chfPreismodel: this.mapChfPreismodell(dto),
            tntagePreismodelRow1: dto.wertTripelObject.teilnehmerTage || '',
            tntagePreismodelRow2: Math.round(dto.tnTagesPreis),
            tnPreismodelRow1: dto.wertTripelObject.teilnehmer || '',
            tnPreismodelRow2: Math.round(dto.tnPreis),
            dePreismodel: this.mapDePreismodell(dto),
            lektionenPreismodel: dto.anzahlLektionen || ''
        };
    }

    mapChfPreismodell(dto: PlanwertDTO): number | string {
        return dto.wertTripelObject.chfBetrag || dto.typ.code !== PlanwerttypEnum.PRODUKT ? dto.wertTripelObject.chfBetrag : '';
    }

    mapDePreismodell(dto: PlanwertDTO): number | string {
        return dto.anzahlDe ? dto.anzahlDe : dto.typ.code === PlanwerttypEnum.MASSNAHME ? '' : 1;
    }

    mapToDTO(dto: PlanwertDTO): PlanwertDTO {
        const controls = this.reactiveForms.planwertForm.controls;
        const isProdukt = dto.typ.code === PlanwerttypEnum.PRODUKT;
        const result = {
            ...dto,
            gueltigVon: this.formUtils.parseDate(controls.gueltigVon.value),
            gueltigBis: this.formUtils.parseDate(controls.gueltigBis.value),
            preismodellTyp: !isProdukt ? dto.preismodellTypListe.find(el => el.codeId === +controls.preismodellTypDropdown.value) : dto.preismodellTyp,
            preismodell: !isProdukt ? dto.preismodellListe.find(el => el.codeId === +controls.preismodellDropdown.value) : dto.preismodell,
            preisModellBetrag: !isProdukt ? +controls.preismodellInput.value : dto.preisModellBetrag,
            wertTripelObject: {
                ...dto.wertTripelObject,
                chfBetrag: isProdukt && controls.chfPreismodel.value ? +controls.chfPreismodel.value : dto.wertTripelObject.chfBetrag,
                teilnehmerTage: controls.tntagePreismodelRow1.value ? +controls.tntagePreismodelRow1.value : dto.wertTripelObject.teilnehmerTage,
                teilnehmer: controls.tnPreismodelRow1.value ? +controls.tnPreismodelRow1.value : dto.wertTripelObject.teilnehmer
            },
            anzahlDe: !isProdukt ? +controls.dePreismodel.value : dto.anzahlDe,
            anzahlLektionen: !isProdukt ? +controls.lektionenPreismodel.value : dto.anzahlLektionen,
            beschreibung: controls.ergaenzendeAngaben.value
        };
        result.restwerte = this.mapRestwerte(dto, result);
        result.changed = this.hasChanged(dto, result, isProdukt);
        return result;
    }

    hasChanged(initial: PlanwertDTO, current: PlanwertDTO, isProdukt: boolean): boolean {
        const dates = !(moment(initial.gueltigVon).isSame(moment(current.gueltigVon), 'day') && moment(initial.gueltigBis).isSame(moment(current.gueltigBis), 'day'));
        const preisModellBetrag = !isProdukt && initial.preisModellBetrag !== current.preisModellBetrag;
        const chfBetrag = initial.wertTripelObject.chfBetrag !== current.wertTripelObject.chfBetrag;
        const tnTage = initial.wertTripelObject.teilnehmerTage !== current.wertTripelObject.teilnehmerTage;
        const tn = initial.wertTripelObject.teilnehmer !== current.wertTripelObject.teilnehmer;
        const de = !isProdukt && initial.anzahlDe !== current.anzahlDe;
        const lektionen = !isProdukt && initial.anzahlLektionen !== current.anzahlLektionen;
        const bemerkung = initial.beschreibung ? initial.beschreibung.localeCompare(current.beschreibung) !== 0 : !!current.beschreibung;
        const preismodell = !isProdukt && initial.preismodell && initial.preismodell.code !== current.preismodell.code;
        const preismodellTyp = !isProdukt && initial.preismodell && initial.preismodellTyp.code !== current.preismodellTyp.code;

        const result = [dates, preisModellBetrag, chfBetrag, tnTage, tn, de, lektionen, bemerkung, preismodell, preismodellTyp];

        return result.some(Boolean);
    }

    mapRestwerte(initial: PlanwertDTO, current: PlanwertDTO): AmmRestwertXDTO[] | null {
        const initialFromYear = moment(initial.gueltigVon).year();
        const currentFromYear = moment(current.gueltigVon).year();
        const initialToYear = moment(initial.gueltigBis).year();
        const currentToYear = moment(current.gueltigBis).year();

        if (initialFromYear !== currentFromYear || initialToYear !== currentToYear) {
            return null;
        }

        return initial.restwerte;
    }
}
