import { AvamNavTreeItemModel } from '@shared/models/avam-nav-tree-item.model';
import { Params } from '@angular/router';

export class NavigationServiceStub {
    public showNavigationTreeRoute(path: string, queryParams?: any): void {}

    public hideNavigationTreeRoute(path: string, queryParams?: any): void {}

    public setInitialNavigation(navigationItems: any[]): void {}

    public setItems(items: AvamNavTreeItemModel[]): void {}

    public routeParamsChanged(params: Params): void {}
}
