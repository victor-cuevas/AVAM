import { Injectable } from '@angular/core';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { KantonDTO } from '@app/shared/models/dtos-generated/kantonDTO';
import { BewMassnahmeReserviertePlaetzeTableReactiveFormsService } from './bew-massnahme-reservierte-plaetze-reactive-table-forms.service';

import * as uuid from 'uuid';

export interface PlnwerteTableData {
    plnwerte: PlnwerteTableDataRow[];
    kantoneOptions: KantonDTO[];
    institutionOptions: CodeDTO[];
}

export interface PlnwerteTableDataRow {
    tableId: string;
    id: number;
    institution: CodeDTO | string;
    kanton: KantonDTO | string;
    verfall: number;
    teilnehmer: number;
    status: string;
    statusValue: boolean;
    newEntry: boolean;
}

@Injectable()
export class BewMassnahmeReserviertePlaetzeHandlerService {
    constructor(public reactiveForms: BewMassnahmeReserviertePlaetzeTableReactiveFormsService) {}

    mapKantonDropdown(items: KantonDTO[]) {
        return items.map(item => {
            return {
                value: item.kantonsKuerzel,
                codeId: item.kantonsKuerzel,
                labelDe: item.nameDe,
                labelFr: item.nameFr,
                labelIt: item.nameIt
            };
        });
    }

    getRowDefaultValues(): PlnwerteTableDataRow {
        const defRowelement: PlnwerteTableDataRow = {
            tableId: uuid.v4(),
            id: null,
            institution: '',
            kanton: null,
            verfall: 0,
            teilnehmer: 1,
            status: 'common.label.aktiv',
            statusValue: true,
            newEntry: true
        };
        return defRowelement;
    }
}
