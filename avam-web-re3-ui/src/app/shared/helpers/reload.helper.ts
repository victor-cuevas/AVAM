import { filter, takeUntil } from 'rxjs/operators';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

export class ReloadHelper {
    static enable(router: Router, notifier: Subject<any>, reloadFunction: any): Subscription {
        return router.events
            .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd))
            .pipe(takeUntil(notifier))
            .subscribe(() => reloadFunction());
    }
}
