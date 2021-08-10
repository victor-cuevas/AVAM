import { RouterLinkActive } from '@angular/router';

/**
 * Model for the `NavTreeComponent` items.
 *
 * @see NavTreeComponent
 */
export class AvamNavTreeItemModel {
    id: string;
    label: string;

    items?: AvamNavTreeItemModel[];

    path?: string; // See `routerLink` docs under https://angular.io/api/router/RouterLink
    fragment?: string; // See `fragment` docs under https://angular.io/api/router/RouterLink
    queryParams?: any = null; // See `queryParams` docs under https://angular.io/api/router/RouterLink

    disabled? = false;
    collapsed? = false;
    showCloseButton? = false;

    parent?: AvamNavTreeItemModel; // Reference to parent, if any.

    // All nested routes, since root nav item:
    routes: any[] = [];

    permissions: any[] = [];

    rla?: RouterLinkActive;

    constructor(json: any, parent?: AvamNavTreeItemModel) {
        Object.assign(this, json);
        if (parent) {
            this.parent = parent;
            this.routes = [...this.parent.routes]; // ES6 array copy :)
        }

        // Ensure item has a path and a full route:
        this.path = this.path || this.id;
        this.routes.push(this.path);

        // Convert all sub items:
        if (Array.isArray(json.items)) {
            this.items = json.items.map(item => {
                return new AvamNavTreeItemModel(item, this);
            });
        }
    }
}
