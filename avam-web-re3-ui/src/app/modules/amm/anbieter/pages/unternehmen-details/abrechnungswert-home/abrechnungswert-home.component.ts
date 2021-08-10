import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbrechnungswertService } from '../../../services/abrechnungswert.service';
import { LeistungsvereinbarungenNavigationService } from '../../../services/leistungsvereinbarungen-navigation.service';

@Component({
    selector: 'avam-abrechnungswert-home',
    templateUrl: './abrechnungswert-home.component.html',
    providers: []
})
export class AbrechnungswertHomeComponent implements OnInit, OnDestroy {
    vertragswertId: number;
    lvId: number;
    abrechnungswertId: number;

    constructor(private route: ActivatedRoute, private navigationService: LeistungsvereinbarungenNavigationService, private abrechnungswertService: AbrechnungswertService) {}
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.vertragswertId = +params['vertragswertId'];
            this.lvId = +params['lvId'];
            this.abrechnungswertId = +params['abrechnungswertId'];
        });
        this.navigationService.setVertragswertDynamicNavigation(this.vertragswertId, this.lvId, this.abrechnungswertId);
    }

    ngOnDestroy() {
        this.abrechnungswertService.readonlyMode = undefined;
    }
}
