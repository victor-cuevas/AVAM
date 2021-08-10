import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanwerttypEnum } from '@app/shared/enums/domain-code/planwerttyp.enum';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmBewirtschaftungLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { Subscription } from 'rxjs';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';

@Component({
    selector: 'avam-bew-standort-planwert-home',
    templateUrl: './bew-standort-planwert-home.component.html'
})
export class BewStandortPlanwertHomeComponent implements OnInit, OnDestroy {
    produktId: number;
    massnahmeId: number;
    dfeId: number;
    planwertId: number;

    messageBusSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private bewirtschaftungNavigationHelper: AmmBewirtschaftungNavigationHelper,
        private router: Router,
        private facadeService: FacadeService
    ) {}

    ngOnInit() {
        this.route.parent.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.route.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
            this.dfeId = +params['dfeId'];
            this.planwertId = +params['planwertId'];
            this.bewirtschaftungNavigationHelper.setPlanwertStaticNavigation(PlanwerttypEnum.STANDORT, this.planwertId, this.massnahmeId, this.dfeId);
        });

        this.messageBusSubscription = this.subscribeToNavClose();
    }

    subscribeToNavClose() {
        return this.facadeService.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data && message.data.label === this.facadeService.translateService.instant(AmmBewirtschaftungLabels.PLANWERT)) {
                this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/standorte/standort/planwerte`], {
                    queryParams: { massnahmeId: this.massnahmeId, dfeId: this.dfeId }
                });
            }
        });
    }

    ngOnDestroy() {
        this.messageBusSubscription.unsubscribe();
        this.facadeService.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT);
    }
}
