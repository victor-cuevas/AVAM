import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as uuid from 'uuid';
import { Router, ActivatedRoute } from '@angular/router';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';

/**
 * Simple store for Amm data.
 *
 * @export
 * @class AmmStoreService
 */
@Injectable({ providedIn: 'root' })
export class AmmStoreService {
    /**
     * Inject Router and ActivatedRoute.
     *
     * @memberof AmmStoreService
     */
    constructor(private router: Router, private route: ActivatedRoute) {}

    /**
     * Initial state in BehaviorSubject.
     *
     * @private
     * @memberof AmmStoreService
     */
    private readonly nodeData = new BehaviorSubject<any>({});

    /**
     * Rread only stream exposed.
     *
     * @memberof AmmStoreService
     */
    readonly data$ = this.nodeData.asObservable();

    /**
     * Push value in all observable and down all subscribers.
     *
     * @private
     * @memberof AmmStoreService
     */
    private set data(data: any) {
        this.nodeData.next(data);
    }

    /**
     * Route to the active Amm and store the nodeData.
     *
     * @memberof AmmStoreService
     */
    addAmm(nodeData: any) {
        this.data = { nodeData, id: uuid.v4() };

        this.navigate(nodeData);
    }

    private navigate(nodeData) {
        this.router.navigate([`stes/details/${nodeData.stesId}/${AMMPaths.AMM_GENERAL}`], {
            relativeTo: this.route.parent
        });
    }
}
