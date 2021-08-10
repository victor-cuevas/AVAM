export interface Zahlstelle {
    zahlstelleId: string;
    alkNr: string;
    alkZahlstellenNr: string;
    zahlstelleNr: string;
    kassenstatus: string;
    kurznameDe: string;
    kurznameFr: string;
    kurznameIt: string;
    standStrasse: string;
    plz: {
        plzId: number;
        postleitzahl: number;
        ortDe: string;
        ortFr: string;
        ortIt: string;
    };
}
