import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { switchMap } from 'rxjs/operators';
import { AmmInfotagRestService } from '../../services/amm-infotag-rest.service';
import { AmmInfotagStorageService } from '../../services/amm-infotag-storage.service';

@Component({
    selector: 'avam-infotag-massnahme-home',
    templateUrl: './infotag-massnahme-home.component.html',
    styleUrls: ['./infotag-massnahme-home.component.scss'],
    providers: [PermissionContextService]
})
export class InfotagMassnahmeHomeComponent implements OnInit, OnDestroy {
    navPath: string;
    sideMenu: string;

    constructor(
        private infotagStorage: AmmInfotagStorageService,
        private route: ActivatedRoute,
        private infotagRestService: AmmInfotagRestService,
        private permissionContextService: PermissionContextService
    ) {}

    ngOnInit() {
        this.initSideNav();
        this.setupPermissions();
    }

    initSideNav() {
        this.navPath = 'amm';
        this.sideMenu = 'infotagMassnahmeNavItems';
    }

    setupPermissions() {
        this.route.params.pipe(switchMap(params => this.infotagRestService.getInfotagMassnahme(+params['massnahmeId']))).subscribe(res => {
            this.permissionContextService.getContextPermissions(res.data.ownerId);
        });
    }

    ngOnDestroy() {
        this.infotagStorage.shouldNavigateToSearch = false;
    }
}
