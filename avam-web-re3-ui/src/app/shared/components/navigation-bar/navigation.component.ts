import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Unsubscribable } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@shared/services/navigation-service';
import { AvamNavTreeItemModel } from '@shared/models/avam-nav-tree-item.model';
import { AuthenticationService } from '@core/services/authentication.service';
import ScrollUtils from '@app/library/core/utils/scroll.utils';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html'
})
export class NavigationComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewChecked {
    @Input() navPath: string;
    @Input() sideMenu: string;
    sideNavigationChecked = false;
    interval: any;

    items: AvamNavTreeItemModel[] = [];

    constructor(
        private readonly route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService,
        private messageBus: MessageBus,
        private navigationService: NavigationService,
        private authService: AuthenticationService,
        private cdRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'navigation.items') {
                    this.items = message.data.navItems;
                    this.handleSidebarScrollingAfterNavigation();
                } else if (message.type === 'click-sidebar-nav-item') {
                    this.handleSidebarScrollingAfterNavigation(message.data.target);
                }
            });

        this.authService.sideNavigationPermissionSubject.pipe(takeUntil(this.unsubscribe)).subscribe(permissions => {
            if (permissions && permissions.length > 0) {
                this.navigationService.setItems(this.authService.filterWithDeepCopy(this.items, permissions));
            }
        });

        this.router.config
            .filter(module => module.path === this.navPath)
            .forEach(context => {
                if (this.sideMenu) {
                    const sideMenu = context.data[this.sideMenu].navTree.items;
                    this.navigationService.setInitialNavigation(this.authService.filterWithDeepCopy(sideMenu));
                } else {
                    this.navigationService.setInitialNavigation(this.authService.filterWithDeepCopy(context.data.navItems.navTree.items));
                }
            });
        this.route.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.navigationService.routeParamsChanged(params);
        });
    }

    private handleSidebarScrollingAfterNavigation(target?: any) {
        this.sideNavigationChecked = false;
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            if (!this.sideNavigationChecked) {
                this.sideNavigationChecked = ScrollUtils.scrollActiveMenuItemIntoViewIfNeeded(target);
            } else {
                clearInterval(this.interval);
            }
        }, 100);
    }

    ngOnDestroy(): void {
        clearInterval(this.interval);
        super.ngOnDestroy();
    }

    ngAfterViewChecked() {
        this.cdRef.detectChanges();
    }
}
