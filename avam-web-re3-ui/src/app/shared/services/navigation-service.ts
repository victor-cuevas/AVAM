import { Injectable, OnDestroy } from '@angular/core';
import { Unsubscribable } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { MessageBus } from '@shared/services/message-bus';
import { BehaviorSubject } from 'rxjs';
import { AvamNavTreeItemModel } from '@shared/models/avam-nav-tree-item.model';
import { takeUntil } from 'rxjs/operators';
import { Params } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class NavigationService extends Unsubscribable implements OnDestroy {
    private items: AvamNavTreeItemModel[] = [];
    private navigationSubject = new BehaviorSubject<any[]>([]);
    private lastParams: Params;

    constructor(private translate: TranslateService, private messageBus: MessageBus) {
        super();
        this.navigationSubject.pipe(takeUntil(this.unsubscribe)).subscribe(navigationItems => {
            this.items = navigationItems.map(item => {
                return new AvamNavTreeItemModel(item);
            });
            this.updateNavigationItems();
        });
    }

    // Initial method Navigation Tree Model items
    setInitialNavigation(navigationItems: any[]): void {
        this.navigationSubject.next(navigationItems);
    }

    setItems(items: AvamNavTreeItemModel[]) {
        this.items = items;
        this.updateNavigationItems();
    }

    // show route in navigation Tree
    showNavigationTreeRoute(path: string, queryParams?: any): void {
        this.changeStateRoute(path, false, queryParams ? queryParams : null);
        this.updateNavigationItems();
    }

    // hide route in navigation Tree
    hideNavigationTreeRoute(path: string, queryParams?: any): void {
        this.changeStateRoute(path, true, queryParams ? queryParams : null);
        this.updateNavigationItems();
    }

    // Modify the Navigation Tree Model
    changeStateRoute(path: string, state: boolean, queryParams: any) {
        this.doChangeStateRoute(this.items, path, state, queryParams);
    }

    private doChangeStateRoute(items: AvamNavTreeItemModel[], path: string, state: boolean, queryParams: any) {
        items.forEach(item => {
            if (item.routes.join('/').replace('//', '/') === path) {
                item.disabled = state;
                item.queryParams = queryParams;
                if (item.parent) {
                    item.parent.collapsed = item.parent.items.filter(m => m.disabled === false).length === 0;
                }
            }
            if (item.items) {
                this.doChangeStateRoute(item.items, path, state, queryParams);
            }
        });
    }

    updateNavigationItems(): void {
        this.messageBus.buildAndSend('navigation.items', { navItems: this.items });
    }

    routeParamsChanged(params: Params): void {
        if (!this.equals(this.lastParams, params)) {
            this.lastParams = params;
            this.disableMenusWithQueryParams(this.items);
            this.updateNavigationItems();
        }
    }

    private equals(object1, object2): boolean {
        if (object1 === undefined || object2 === undefined) {
            return false;
        }
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (let key of keys1) {
            if (object1[key] !== object2[key]) {
                return false;
            }
        }
        return true;
    }

    private disableMenusWithQueryParams(navigationMenus: any[]): void {
        navigationMenus.forEach(menu => {
            if (menu.queryParams !== null) {
                menu.disabled = true;
            }
            if (menu.items) {
                this.disableMenusWithQueryParams(menu.items);
            }
            if (menu.children) {
                this.disableMenusWithQueryParams(menu.children);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.navigationSubject) {
            this.navigationSubject.unsubscribe();
        }
        super.ngOnDestroy();
    }
}
