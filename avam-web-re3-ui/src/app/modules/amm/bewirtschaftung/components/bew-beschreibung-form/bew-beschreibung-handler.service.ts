import { Injectable } from '@angular/core';
import { BewBeschreibungReactiveFormsService } from './bew-beschreibung-reactive-forms.service';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';

@Injectable()
export class BewBeschreibungHandlerService {
    defaultParentEnding = '0';

    constructor(public reactiveForms: BewBeschreibungReactiveFormsService) {}

    mapErfassungsspracheOptions(items) {
        return items
            .filter(item => item.code !== SpracheEnum.RAETOROMANISCH)
            .map(item => {
                return { value: item.codeId, code: item.code, codeId: item.codeId, labelFr: item.textFr, labelIt: item.textIt, labelDe: item.textDe };
            });
    }

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

    mapMultiselect(items: CodeDTO[]) {
        return items.map(item => {
            return {
                id: item.codeId,
                textDe: item.kurzTextDe,
                textIt: item.kurzTextIt,
                textFr: item.kurzTextFr,
                value: false
            };
        });
    }

    mapTreeOptions(initialOptions: CodeDTO[]) {
        const problemfeldOptionsMapped = [];

        initialOptions.forEach(element => {
            if (element.code.charAt(1) === this.defaultParentEnding) {
                const group = element.code.charAt(0);
                problemfeldOptionsMapped.push({
                    id: element.codeId,
                    value: false,
                    textDe: element.textDe,
                    textFr: element.textFr,
                    textIt: element.textIt,
                    code: element.code,
                    children: this.getChildren(initialOptions, group, element.codeId)
                });
            }
        });

        return problemfeldOptionsMapped;
    }

    private getChildren(initialOptions, group, parentId) {
        const children = [];

        initialOptions.forEach(element => {
            if (element.code.charAt(1) !== this.defaultParentEnding && element.code.charAt(0) === group) {
                children.push({
                    id: element.codeId,
                    value: false,
                    textDe: element.textDe,
                    textFr: element.textFr,
                    textIt: element.textIt,
                    code: element.code,
                    parentId
                });
            }
        });

        return children;
    }
}
