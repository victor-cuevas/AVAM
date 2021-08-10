import { Injectable } from '@angular/core';

@Injectable()
export class AmmInfotagStorageService {
    private navigateToSearch = false;

    get shouldNavigateToSearch(): boolean {
        return this.navigateToSearch;
    }

    set shouldNavigateToSearch(data: boolean) {
        this.navigateToSearch = data;
    }
}
