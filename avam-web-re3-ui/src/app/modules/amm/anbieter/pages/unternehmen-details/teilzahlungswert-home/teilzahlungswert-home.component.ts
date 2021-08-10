import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeistungsvereinbarungenNavigationService } from '../../../services/leistungsvereinbarungen-navigation.service';

@Component({
    selector: 'avam-teilzahlungswert-home',
    templateUrl: './teilzahlungswert-home.component.html',
    providers: []
})
export class TeilzahlungswertHomeComponent implements OnInit, OnDestroy {
    vertragswertId: number;
    teilzahlungswertId: number;
    lvId: number;

    constructor(private route: ActivatedRoute, private navigationService: LeistungsvereinbarungenNavigationService) {}
    ngOnInit() {
        this.route.parent.queryParams.subscribe(res => {
            this.vertragswertId = +res.vertragswertId;
            this.teilzahlungswertId = +res.teilzahlungswertId;
            this.lvId = +res.lvId;
        });

        this.navigationService.setTeilzahlungswertStaticNavigation(this.vertragswertId, this.lvId);
    }

    ngOnDestroy() {
        this.navigationService.removeTeilzahlungswertStaticNavigation();
    }
}
