import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { Subscription } from 'rxjs';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmBewirtschaftungLabels } from '@app/shared/enums/stes-routing-labels.enum';

@Component({
    selector: 'avam-bew-kurs-home',
    templateUrl: './bew-kurs-home.component.html',
    providers: [PermissionContextService]
})
export class BewKursHomeComponent implements OnInit, OnDestroy {
    dfeId: number;
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
            this.dfeId = +params['dfeId'];
            this.massnahmeId = +params['massnahmeId'];
        });
        this.getKurs();
        this.messageBusSubscription = this.subscribeToNavClose();
    }

    getKurs() {
        this.bewirtschaftungRestService.getDfeSession(this.dfeId).subscribe(kursResponse => {
            if (kursResponse && kursResponse.data) {
                const kurs = kursResponse.data;
                this.permissionContextService.getContextPermissions(kurs.ownerId);
                this.bewirtschaftungNavigationHelper.setKurseStaticNavigation(this.massnahmeId, this.dfeId);
                const isMassnahmeKollektiv = kurs.massnahmeObject.zulassungstypObject.code === AmmZulassungstypCode.KOLLEKTIV;
                this.bewirtschaftungNavigationHelper.setKurseDynamicNavigation(
                    this.massnahmeId,
                    this.dfeId,
                    kurs.inPlanungAkquisitionSichtbar,
                    !!kurs.wartelisteplaetze,
                    isMassnahmeKollektiv
                );
            }
        });
    }

    subscribeToNavClose() {
        return this.facadeService.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data && message.data.label === this.facadeService.translateService.instant(AmmBewirtschaftungLabels.KURS)) {
                this.router.navigate(['../'], { relativeTo: this.route, queryParams: { massnahmeId: this.massnahmeId } });
            }
        });
    }

    ngOnDestroy() {
        this.messageBusSubscription.unsubscribe();
        this.facadeService.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS);
    }
}
