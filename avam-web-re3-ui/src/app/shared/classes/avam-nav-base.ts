import { OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@shared/services/navigation-service';

export class AvamNavBase implements OnInit, OnDestroy {
    private messageBusSubscription: Subscription;

    constructor(protected messageBus: MessageBus, protected navigationService: NavigationService) {}

    ngOnInit() {
        this.messageBusSubscription = this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                // if a clicked item itself or some of its children is currently active
                // then the corresponding active component has to handle the "close" click,
                // otherwise we close the item from here
                let active = false;
                if (message.data.item.rla.isActive) {
                    active = true;
                } else if (message.data.item.items) {
                    message.data.item.items.forEach(item => {
                        if (item.rla.isActive) {
                            active = true;
                        }
                    });
                }
                const route = this.joinRouteArray(message.data.routes);
                if (!active) {
                    this.navigationService.hideNavigationTreeRoute(route);
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.messageBusSubscription.unsubscribe();
    }

    private joinRouteArray(routes: string[]): string {
        let routeOutput = '';
        routes.forEach((route: string, index: number) => {
            routeOutput += route;

            if (route.lastIndexOf('/') !== route.length - 1 && index !== routes.length - 1) {
                routeOutput += '/';
            }
        });
        return routeOutput;
    }
}
