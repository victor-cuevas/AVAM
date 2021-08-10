import { Injectable } from '@angular/core';
import { BewMassnahmeKostenReactiveForms } from './bew-massnahme-kosten-reactive-forms';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';

@Injectable()
export class BewMassnahmeKostenHandler {
    constructor(public reactiveForms: BewMassnahmeKostenReactiveForms) {}

    mapDropdown(items: CodeDTO[]) {
        return items.map(item => {
            return {
                value: item.codeId,
                code: item.code,
                codeId: item.codeId,
                labelFr: item.textFr,
                labelIt: item.textIt,
                labelDe: item.textDe
            };
        });
    }
}
