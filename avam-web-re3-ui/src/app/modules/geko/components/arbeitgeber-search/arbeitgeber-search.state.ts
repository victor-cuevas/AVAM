import { GeKoGeschaeftSuchenDTO } from '@dtos/geKoGeschaeftSuchenDTO';

export interface ArbeitgeberSearchState {
    fields: ArbeitgeberSearchStateFields;
}

export interface ArbeitgeberSearchStateFields {
    dto: GeKoGeschaeftSuchenDTO;
    fallbearbeiterId: any;
    benutzerstellenId: any;
}
