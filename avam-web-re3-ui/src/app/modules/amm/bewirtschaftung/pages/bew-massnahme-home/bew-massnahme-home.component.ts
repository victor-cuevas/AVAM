import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { Subscription } from 'rxjs';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmBewirtschaftungLabels } from '@app/shared/enums/stes-routing-labels.enum';
@Component({
    selector: 'avam-bew-massnahme-home',
    templateUrl: './bew-massnahme-home.component.html',
    providers: [PermissionContextService]
})
export class BewMassnahmeHomeComponent implements OnInit, OnDestroy {
    massnahmeId: number;
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
            this.massnahmeId = +params['massnahmeId'];
        });
        this.getMassnahme();
        this.messageBusSubscription = this.subscribeToNavClose();
    }

    getMassnahme() {
        this.bewirtschaftungRestService.getMassnahme(this.massnahmeId).subscribe(massnahmeResponse => {
            if (massnahmeResponse && massnahmeResponse.data) {
                const massnahme = massnahmeResponse.data;
                this.permissionContextService.getContextPermissions(massnahme.ownerId);
                this.bewirtschaftungNavigationHelper.setMassnahmeStaticNavigation(massnahme.massnahmeId, massnahme.durchfuehrungseinheitType, massnahme.zulassungstypObject);
                this.bewirtschaftungNavigationHelper.setMassnahmeDynamicNavigation(massnahme.massnahmeId, massnahme.inPlanungAkquisitionSichtbar, massnahme.zulassungstypObject);
            }
        });
    }

    subscribeToNavClose() {
        return this.facadeService.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data && message.data.label === this.facadeService.translateService.instant(AmmBewirtschaftungLabels.MASSNAHME)) {
                this.router.navigate(['../'], { relativeTo: this.route });
            }
        });
    }

    ngOnDestroy() {
        this.messageBusSubscription.unsubscribe();
        this.facadeService.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_MASSNAHMEN);
    }
}
