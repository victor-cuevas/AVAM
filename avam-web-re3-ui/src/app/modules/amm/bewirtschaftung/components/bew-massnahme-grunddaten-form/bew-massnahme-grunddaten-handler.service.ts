import { CodeDTO } from '../../../../../shared/models/dtos-generated/codeDTO';
import { Injectable } from '@angular/core';
import { BewMassnahmeGrunddatenReactiveFormsService } from './bew-massnahme-grunddaten-reactive-forms.service';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';

@Injectable()
export class BewMassnahmeGrunddatenHandlerService {
    constructor(public reactiveForms: BewMassnahmeGrunddatenReactiveFormsService) {}

    mapSpracheDropdown(items: CodeDTO[]) {
        if (items) {
            return items
                .filter(item => item.code !== SpracheEnum.RAETOROMANISCH)
                .map(item => {
                    return { value: item.codeId, code: item.code, codeId: item.codeId, labelFr: item.textFr, labelIt: item.textIt, labelDe: item.textDe };
                });
        }

        return [];
    }

    mapZulassungstypDropdown(items: CodeDTO[], currentZulassungstypCode: string) {
        if (items) {
            const isIndividuell = currentZulassungstypCode !== AmmZulassungstypCode.INDIVIDUELL;

            return items
                .filter(item => (isIndividuell ? item.code !== AmmZulassungstypCode.INDIVIDUELL : item))
                .map(item => {
                    return { value: item.codeId, code: item.code, codeId: item.codeId, labelFr: item.textFr, labelIt: item.textIt, labelDe: item.textDe };
                });
        }

        return [];
    }
}
