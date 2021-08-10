import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';

@Component({
    selector: 'avam-bew-produkt-home',
    templateUrl: './bew-produkt-home.component.html',
    styleUrls: ['./bew-produkt-home.component.scss'],
    providers: [PermissionContextService]
})
export class BewProduktHomeComponent implements OnInit {
    navPath: string;
    sideMenu: string;
    produktId: number;

    constructor(
        private route: ActivatedRoute,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private translateService: TranslateService,
        private permissionContextService: PermissionContextService,
        private bewirtschaftungNavigationHelper: AmmBewirtschaftungNavigationHelper
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.initSideNav();
        this.getProdukt();
    }

    getProdukt() {
        this.bewirtschaftungRestService.getProdukt(this.produktId).subscribe(produktResponse => {
            if (produktResponse && produktResponse.data) {
                const produkt = produktResponse.data;
                this.permissionContextService.getContextPermissions(produkt.ownerId);
                this.bewirtschaftungNavigationHelper.setProduktDynamicNavigation(produkt.inPlanungSichtbar);
            }
        });
    }

    initSideNav() {
        this.navPath = 'amm';
        this.sideMenu = 'bewirtschaftungNavItems';
    }
}
