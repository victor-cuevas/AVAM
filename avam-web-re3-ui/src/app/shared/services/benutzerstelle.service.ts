import { Injectable } from '@angular/core';
import { BenutzerstelleRestService } from '@core/http/benutzerstelle-rest.service';
import { FacadeService } from '@shared/services/facade.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { Router } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { CoreInfoBarPanelService } from '@app/library/core/core-info-bar/core-info-bar-panel/core-info-bar-panel.service';

@Injectable({
    providedIn: 'root'
})
export class BenutzerstelleService {
    constructor(
        public rest: BenutzerstelleRestService,
        public dataRest: StesDataRestService,
        public facade: FacadeService,
        public interaction: StesComponentInteractionService,
        public router: Router,
        public infopanelService: AmmInfopanelService,
        public infoBarPanelService: CoreInfoBarPanelService
    ) {}
}
