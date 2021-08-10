import { GeKoGeschaeftSuchenDTO } from '@dtos/geKoGeschaeftSuchenDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { ArbeitgeberSearchState } from '@modules/geko/components/arbeitgeber-search/arbeitgeber-search.state';

export interface GeschaeftArbeitgeberSuchenData {
    dto?: GeKoGeschaeftSuchenDTO;
    geschaeftsartOptions?: CodeDTO[];
    sachstandOptions?: CodeDTO[];
    action?: GeschaeftArbeitgeberSuchenAction;
    cache?: ArbeitgeberSearchState;
}

export enum GeschaeftArbeitgeberSuchenAction {
    INIT,
    CACHE
}
