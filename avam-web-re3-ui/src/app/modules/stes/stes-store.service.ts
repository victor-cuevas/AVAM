import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as uuid from 'uuid';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { BerufDTO } from '@dtos/berufDTO';

/**
 * Simple store for stes data.
 *
 * @export
 * @class StesStoreService
 */
@Injectable({ providedIn: 'root' })
export class StesStoreService {
    /**
     * List used to store all the Berufe
     *
     * @memberof AvamBerufAutosuggestComponent
     */
    allBerufeList: BerufDTO[];

    /**
     * To store the gender of the stes during the Anmeldung process
     *
     * @memberof AvamBerufAutosuggestComponent
     */
    stesAnmeldungGeschlecht: string;

    /**
     * Initial state in BehaviorSubject.
     *
     * @private
     * @memberof StesStoreService
     */
    private readonly _data = new BehaviorSubject<any[]>([]);

    /**
     * Rread only stream exposed.
     *
     * @memberof StesStoreService
     */
    readonly data$ = this._data.asObservable();

    /**
     * Emitted value from observable.
     *
     * @private
     * @memberof StesStoreService
     */
    private get data() {
        return this._data.getValue();
    }

    /**
     * Push value in all observable and down all subscribers.
     *
     * @private
     * @memberof StesStoreService
     */
    private set data(val: any[]) {
        this._data.next(val);
    }

    /**
     * Add active stes into state.
     *
     * @param {StesHeaderDTO} data
     * @memberof StesStoreService
     */
    addStes(data: StesHeaderDTO) {
        this.data = [{ data, id: uuid.v4() }];
    }

    /**
     * Remove the stored stes data
     *
     * @memberof StesStoreService
     */
    removeStes() {
        this.data = [];
    }
}
