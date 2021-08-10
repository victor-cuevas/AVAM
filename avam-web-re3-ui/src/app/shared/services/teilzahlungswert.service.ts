import { Injectable } from '@angular/core';

@Injectable()
export class TeilzahlungswertService {
    private teilzahlungswertIds: number[] = [];
    private navigateToUebersicht = false;

    constructor() {}

    setTeilzahlungswertIds(teilzahlungswertIds: number[]) {
        this.teilzahlungswertIds = teilzahlungswertIds;
    }

    getTeilzahlungswertIds(): number[] {
        return this.teilzahlungswertIds;
    }

    clearTeilzahlungswertIds() {
        this.teilzahlungswertIds = [];
    }

    setNavigateToUebersicht(navigateToUebersicht: boolean) {
        this.navigateToUebersicht = navigateToUebersicht;
    }

    getNavigateToUebersicht(): boolean {
        return this.navigateToUebersicht;
    }
}
