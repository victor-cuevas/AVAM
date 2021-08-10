import { Injectable } from '@angular/core';

export enum NAVIGATION {
    SUCHEN,
    ABRECHNUNG_BEARBEITEN
}

@Injectable()
export class AbrechnungswertService {
    navigatedFrom: NAVIGATION;
    readonlyMode: boolean;
    private abrechnungswertIds: number[] = [];

    constructor() {}

    setAbrechnungswertIds(abrechnungswertIds: number[]) {
        this.abrechnungswertIds = [...abrechnungswertIds];
    }

    getAbrechnungswertIds(): number[] {
        return this.abrechnungswertIds;
    }

    clearAbrechnungswertService() {
        this.abrechnungswertIds = [];
    }
}
