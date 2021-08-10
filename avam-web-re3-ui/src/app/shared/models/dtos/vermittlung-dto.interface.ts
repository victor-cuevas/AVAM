// client-side gui entry - try to use java DTOs only
export interface VermittlungDto {
    meldepflicht: number;
    vom: Date;
    nr: string;
    stellenbezeichnung: string;
    unternehmensname: string;
    ort: string;
    stesIdAvam: string;
    status: string;
    ergebnis: string;
    id: number;
    schnellFlag: boolean;
}
