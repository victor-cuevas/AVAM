import { INameItem } from './name-item.interface';
import { GemeindeDTO } from '@app/shared/models/dtos-generated/gemeindeDTO';

export const defaultGemeindeBaseInfo: GemeindeDTO = {
    amRegionInKanton: null,
    amtlicherName: null,
    bezirksName: null,
    bfsNr: null,
    bfsNummer: -1,
    erfasstAm: null,
    erfasstDurch: null,
    geaendertAm: null,
    geaendertDurch: null,
    gemeindeId: -1,
    kantonsKuerzel: null,
    kurzName: null,
    letzteAenderung: null,
    nameDe: '',
    nameFr: '',
    nameIt: '',
    ojbVersion: -1,
    ownerId: -1,
    sprachCode: null,
    suchRegionId: null
};

const result: INameItem = {
    gemeindeBaseInfo: defaultGemeindeBaseInfo,
    kanton: '',
    ortschaftsbezeichnung: '',
    plz: -1
};

export const defaultNameValue: INameItem = result;

export const initialMockValue: GemeindeDTO = {
    amRegionInKanton: null,
    amtlicherName: null,
    bezirksName: null,
    bfsNr: null,
    bfsNummer: 351,
    erfasstAm: null,
    erfasstDurch: null,
    geaendertAm: null,
    geaendertDurch: null,
    gemeindeId: 209,
    kantonsKuerzel: null,
    kurzName: null,
    letzteAenderung: null,
    nameDe: 'Bern',
    nameFr: 'Berne',
    nameIt: 'Berna',
    ojbVersion: 0,
    ownerId: 0,
    sprachCode: null,
    suchRegionId: null
};
