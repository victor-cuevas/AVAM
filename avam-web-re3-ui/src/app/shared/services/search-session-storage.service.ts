import { Injectable } from '@angular/core';

@Injectable()
export class SearchSessionStorageService {
    /**
     *Creates an instance of SearchSessionStorageService.
     * @memberof SearchSessionStorageService
     */
    constructor() {}

    /**
     * Returns items for given stateKey.
     *
     * @params {string} stateKey
     * @returns {*} data or null
     * @memberof SearchSessionStorageService
     */
    restoreStateByKey(stateKey: string) {
        const storage = this.getStorage();
        const stateString = storage.getItem(stateKey);

        return stateString ? JSON.parse(stateString) : undefined;
    }

    /**
     * Store search fields for a given stateKey.
     *
     * @param {string} stateKey
     * @param {*} data
     * @memberof SearchSessionStorageService
     */
    storeFieldsByKey(stateKey: string, data) {
        const state: any = {};
        state.fields = data;
        this.storeStateByKey(stateKey, state);
    }

    /**
     * Clear the storage for given stateKey.
     *
     * @param {string} stateKey
     * @memberof SearchSessionStorageService
     */
    clearStorageByKey(stateKey: string) {
        if (stateKey) {
            this.getStorage().removeItem(stateKey);
        }
    }

    /**
     * Returns the storage.
     *
     * @returns
     * @memberof SearchSessionStorageService
     */
    getStorage() {
        return window.sessionStorage;
    }

    /**
     * Stores data in the session storage for a given stateKey.
     *
     * @param {string} stateKey
     * @param {*} data
     * @memberof SearchSessionStorageService
     */
    storeStateByKey(stateKey: string, state: any) {
        try {
            const storage = this.getStorage();

            if (Object.keys(state).length) {
                this.clearStorageByKey(stateKey);
                storage.setItem(stateKey, JSON.stringify(state));
            }
        } catch (e) {}
    }

    restoreDefaultValues(stateKey: string) {
        if (stateKey) {
            const storage = this.getStorage();
            const stateString = storage.getItem(stateKey);
            if (stateString) {
                let state: any = JSON.parse(stateString);
                if (state.defaultSortField) {
                    state.sortField = state.defaultSortField;
                }
                if (state.defaultSortOrder) {
                    state.sortOrder = state.defaultSortOrder;
                }
                if (!isNaN(state.defaultSelection)) {
                    state.selection = state.defaultSelection;
                }
                storage.setItem(stateKey, JSON.stringify(state));
            }
        }
    }

    resetSelectedTableRow(stateKey: string) {
        const tableState = this.restoreStateByKey(stateKey);
        tableState.defaultSelection = 0;
        tableState.selection = 0;
        this.storeStateByKey(stateKey, tableState);
    }
}
