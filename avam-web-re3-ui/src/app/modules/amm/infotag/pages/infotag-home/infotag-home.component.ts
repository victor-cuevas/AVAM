import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageBus } from '@app/shared/services/message-bus';
import { NavigationService } from '@app/shared/services/navigation-service';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AmmInfotagRestService } from '../../services/amm-infotag-rest.service';
import { InfotageUebersichtComponent } from '../infotage-uebersicht/infotage-uebersicht.component';

@Component({
    selector: 'avam-infotag-home',
    templateUrl: './infotag-home.component.html',
    providers: [PermissionContextService]
})
export class InfotagHomeComponent implements OnInit, OnDestroy {
    messageBusSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private infotagRestService: AmmInfotagRestService,
        private permissionContextService: PermissionContextService,
        private messageBus: MessageBus,
        private router: Router,
        private navigationService: NavigationService,
        private searchSession: SearchSessionStorageService
    ) {}

    ngOnInit() {
        this.setupPage();
        this.messageBusSubscription = this.subscribeToNavClose();
    }

    setupPage() {
        this.route.queryParams
            .pipe(
                map(params => {
                    this.showAmmInfotagNav(+params['dfeId']);
                    return params;
                }),
                switchMap(params => this.infotagRestService.getInfotag(+params['dfeId']))
            )
            .subscribe(res => {
                this.permissionContextService.getContextPermissions(res.data.ownerId);
            });
    }

    subscribeToNavClose() {
        return this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.searchSession.clearStorageByKey(InfotageUebersichtComponent.CHANNEL);
                this.router.navigate(['../'], { relativeTo: this.route });
            }
        });
    }

    showAmmInfotagNav(dfeId: number) {
        this.navigationService.showNavigationTreeRoute(`./infotage/infotag`, {
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(`./infotage/infotag/grunddaten`, {
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(`./infotage/infotag/beschreibung`, {
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(`./infotage/infotag/teilnehmerliste`, {
            dfeId
        });
    }

    ngOnDestroy(): void {
        this.navigationService.hideNavigationTreeRoute(`./infotage/infotag`);
        this.messageBusSubscription.unsubscribe();
    }
}
