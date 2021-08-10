import { Component, OnInit, OnDestroy } from '@angular/core';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmBewirtschaftungLabels } from '@app/shared/enums/stes-routing-labels.enum';

@Component({
    selector: 'avam-bew-beschaeftigungseinheit-home',
    templateUrl: './bew-beschaeftigungseinheit-home.component.html',
    providers: [PermissionContextService]
})
export class BewBeschaeftigungseinheitHomeComponent implements OnInit, OnDestroy {
    navPath: string;
    sideMenu: string;
    beId: number;
    dfeId: number;
    massnahmeId: number;
    type: string;
    subscriptions = new Array<Subscription>();
    messageBusSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private permissionContextService: PermissionContextService,
        private bewirtschaftungNavigationHelper: AmmBewirtschaftungNavigationHelper,
        private router: Router,
        private facadeService: FacadeService
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.dfeId = +params['dfeId'];
            this.massnahmeId = +params['massnahmeId'];
            this.beId = +params['beId'];
        });
        this.getBeschaeftigungseinheit();
    }

    getBeschaeftigungseinheit() {
        this.bewirtschaftungRestService.getBeschaeftigungseinheit(this.beId).subscribe(beResponse => {
            if (beResponse && beResponse.data) {
                const beschaeftigungseinheit = beResponse.data.beschaeftigungseinheiten.find(be => be.beschaeftigungseinheitId === this.beId);
                this.type = beschaeftigungseinheit.type;
                this.permissionContextService.getContextPermissions(beschaeftigungseinheit.ownerId);

                if (this.type === AmmConstants.ARBEITSPLATZKATEGORIE) {
                    this.bewirtschaftungNavigationHelper.setArbeitsplatzkategorieStaticNavigation(this.massnahmeId, this.dfeId, this.beId);
                } else {
                    this.bewirtschaftungNavigationHelper.setPraktikumsstelleStaticNavigation(this.massnahmeId, this.dfeId, this.beId);
                }

                this.messageBusSubscription = this.subscribeToNavClose();
            }
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.facadeService.navigationService.hideNavigationTreeRoute(
            this.type === AmmConstants.ARBEITSPLATZKATEGORIE
                ? AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE
                : AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE
        );

        if (this.messageBusSubscription) {
            this.messageBusSubscription.unsubscribe();
        }
    }

    subscribeToNavClose() {
        return this.facadeService.messageBus.getData().subscribe(message => {
            if (
                message.type === 'close-nav-item' &&
                message.data &&
                (message.data.label === this.facadeService.translateService.instant(AmmBewirtschaftungLabels.ARBEITSPLATZKATEGORIE) ||
                    message.data.label === this.facadeService.translateService.instant(AmmBewirtschaftungLabels.PRAKTIKUMSSTELLE))
            ) {
                this.router.navigate(['../'], { relativeTo: this.route, queryParams: { massnahmeId: this.massnahmeId, dfeId: this.dfeId } });
            }
        });
    }
}
