import { Injectable } from '@angular/core';
import { RolleRestService } from '@core/http/rolle-rest.service';
import { FacadeService } from '@shared/services/facade.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { Router } from '@angular/router';
import { InformationenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { RolleDTO } from '@dtos/rolleDTO';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { CoreInfoBarPanelService } from '@app/library/core/core-info-bar/core-info-bar-panel/core-info-bar-panel.service';

@Injectable({
    providedIn: 'root'
})
export class RolleService {
    readonly suchenPath = `${InformationenPaths.BASE}/${InformationenPaths.BENUTZERVERWALTUNG_ROLLEN_SUCHEN}`;
    readonly bearbeitenPath = `${InformationenPaths.BASE}/${InformationenPaths.BENUTZERVERWALTUNG_ROLLE}/${InformationenPaths.BENUTZERVERWALTUNG_ROLLEN_GRUNDDATEN_BEARBEITEN}`;

    constructor(
        public rest: RolleRestService,
        public data: StesDataRestService,
        public facade: FacadeService,
        public router: Router,
        public infopanelService: AmmInfopanelService,
        public infoBarPanelService: CoreInfoBarPanelService
    ) {}

    navigateToBearbeiten(rolle: RolleDTO, channel?: string): void {
        if (channel) {
            this.facade.spinnerService.activate(channel);
        }
        const path = this.bearbeitenPath.replace(':rolleId', String(rolle.rolleId));
        this.router.navigate([path]);
        if (channel) {
            this.facade.spinnerService.deactivate(channel);
        }
    }

    navigateToSuchen(channel?: string): void {
        if (channel) {
            this.facade.spinnerService.activate(channel);
        }
        this.router.navigate([this.suchenPath]);
        if (channel) {
            this.facade.spinnerService.deactivate(channel);
        }
    }
}
