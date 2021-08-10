import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { forkJoin, Subscription } from 'rxjs';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmBewirtschaftungLabels } from '@app/shared/enums/stes-routing-labels.enum';

@Component({
    selector: 'avam-bew-standort-home',
    templateUrl: './bew-standort-home.component.html',
    providers: [PermissionContextService]
})
export class BewStandortHomeComponent implements OnInit, OnDestroy {
    produktId: number;
    dfeId: number;
    massnahmeId: number;
    inPlanungAkquisitionSichtbar: boolean;
    apkPraktikumsstelleVerwalten: boolean;
    isApBp: boolean;
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
        this.route.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.route.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
            this.dfeId = +params['dfeId'];
        });
        this.getStandort();
        this.messageBusSubscription = this.subscribeToNavClose();
    }

    getStandort() {
        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getDfeStandort(this.produktId, this.massnahmeId, this.dfeId),
            this.bewirtschaftungRestService.getStandortHoldsPraktikumsstellen(this.produktId, this.massnahmeId)
        ]).subscribe(([standortResponse, standortHoldsPraktikumsstellenResponse]) => {
            if (standortResponse && standortResponse.data) {
                const standort = standortResponse.data;

                this.inPlanungAkquisitionSichtbar = standort.inPlanungAkquisitionSichtbar;
                this.apkPraktikumsstelleVerwalten = standort.apkPraktikumsstelleVerwalten;

                this.permissionContextService.getContextPermissions(standort.ownerId);
                this.bewirtschaftungNavigationHelper.setStandortStaticNavigation(this.massnahmeId, this.dfeId);
            }

            if (standortHoldsPraktikumsstellenResponse && standortHoldsPraktikumsstellenResponse.data) {
                this.isApBp = standortHoldsPraktikumsstellenResponse.data;
            }

            this.bewirtschaftungNavigationHelper.setStandortDynamicNavigation(
                this.massnahmeId,
                this.dfeId,
                this.apkPraktikumsstelleVerwalten,
                this.isApBp,
                this.inPlanungAkquisitionSichtbar
            );
        });
    }

    subscribeToNavClose() {
        return this.facadeService.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data && message.data.label === this.facadeService.translateService.instant(AmmBewirtschaftungLabels.STANDORT)) {
                this.router.navigate(['../'], { relativeTo: this.route, queryParams: { massnahmeId: this.massnahmeId } });
            }
        });
    }

    ngOnDestroy() {
        this.messageBusSubscription.unsubscribe();
        this.facadeService.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT);
    }
}
