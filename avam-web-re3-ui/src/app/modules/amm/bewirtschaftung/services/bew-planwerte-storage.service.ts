import { Injectable } from '@angular/core';

@Injectable()
export class AmmPlanwertStorageService {
    private navigateToUebersicht = false;

    get shouldNavigateToUebersicht(): boolean {
        return this.navigateToUebersicht;
    }

    set shouldNavigateToUebersicht(data: boolean) {
        this.navigateToUebersicht = data;
    }
}
