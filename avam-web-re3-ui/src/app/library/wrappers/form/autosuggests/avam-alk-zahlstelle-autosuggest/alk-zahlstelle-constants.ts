import { ZahlstelleDTO } from '@dtos/zahlstelleDTO';

export const DEFAULT_SELECTED_ALK_ZAHLSTELLE_VALUE: ZahlstelleDTO = {
    alkNr: '',
    alkZahlstellenNr: '',
    kassenstatus: '',
    kurznameDe: '',
    kurznameFr: '',
    kurznameIt: '',
    plz: {
        erfasstDurch: '',
        geaendertDurch: '',
        gemeindeBfsnr: -1,
        kantonsKuerzel: '',
        ojbVersion: -1,
        ortDe: '',
        ortFr: '',
        ortIt: '',
        ownerId: -1,
        plzId: -1,
        postleitzahl: ''
    },
    erfasstDurch: '',
    geaendertDurch: '',
    ojbVersion: -1,
    ownerId: -1,
    standStrasse: '',
    zahlstelleId: -1,
    zahlstelleNr: ''
};
