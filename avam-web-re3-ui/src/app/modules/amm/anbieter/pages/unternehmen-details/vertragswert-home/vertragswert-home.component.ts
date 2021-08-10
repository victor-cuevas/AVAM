import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmBewirtschaftungLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { Subscription } from 'rxjs';
import { LeistungsvereinbarungenNavigationService } from '../../../services/leistungsvereinbarungen-navigation.service';

@Component({
    selector: 'avam-vertragswert-home',
    templateUrl: './vertragswert-home.component.html',
    providers: []
})
export class VertragswertHomeComponent implements OnInit, OnDestroy {
    vertragswertId: number;
    lvId: number;
    messageBusSubscription: Subscription;
    anbieterId: number;

    constructor(private route: ActivatedRoute, private navigationService: LeistungsvereinbarungenNavigationService, private facadeService: FacadeService, private router: Router) {}

    ngOnInit() {
        this.route.parent.parent.parent.params.subscribe(params => {
            this.anbieterId = +params['unternehmenId'];
        });

        this.route.queryParams.subscribe(params => {
            this.vertragswertId = +params['vertragswertId'];
            this.lvId = +params['lvId'];
        });
        this.navigationService.setVertragswertStaticNavigation(this.vertragswertId, this.lvId);

        this.messageBusSubscription = this.facadeService.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data && message.data.label === this.facadeService.translateService.instant(AmmBewirtschaftungLabels.VERTRAGSWERT)) {
                this.router.navigate([`/amm/anbieter/${this.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
                    queryParams: { lvId: this.lvId }
                });
            }
        });
    }

    ngOnDestroy() {
        this.messageBusSubscription.unsubscribe();
        this.navigationService.removeVertragswertStaticNavigation();
    }
}
