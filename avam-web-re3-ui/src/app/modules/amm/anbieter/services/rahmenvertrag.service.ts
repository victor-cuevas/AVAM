import { Injectable } from '@angular/core';

@Injectable()
export class RahmenvertragService {
    private navigateToUebersicht = false;

    constructor() {}

    setNavigateToUebersicht(navigateToUebersicht: boolean) {
        this.navigateToUebersicht = navigateToUebersicht;
    }

    getNavigateToUebersicht(): boolean {
        return this.navigateToUebersicht;
    }
}
