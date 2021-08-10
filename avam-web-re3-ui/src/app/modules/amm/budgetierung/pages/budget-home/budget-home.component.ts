import { Component, OnInit, OnDestroy } from '@angular/core';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'avam-budget-home',
    templateUrl: './budget-home.component.html',
    styleUrls: ['./budget-home.component.scss']
})
export class BudgetHomeComponent implements OnInit, OnDestroy {
    navPath: string;
    sideMenu: string;
    sub: Subscription;

    constructor(private infopanelService: AmmInfopanelService, private route: ActivatedRoute) {}

    ngOnInit() {
        this.initSideNav();
        this.initInfopanel();
    }

    initSideNav() {
        this.navPath = 'amm';
        this.sub = this.route.data.subscribe(v => (this.sideMenu = v.sideMenu));
    }

    initInfopanel() {
        this.infopanelService.dispatchInformation({});
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
