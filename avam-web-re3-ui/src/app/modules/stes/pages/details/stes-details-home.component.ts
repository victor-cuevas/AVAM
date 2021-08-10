import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { NavigationService } from '@app/shared/services/navigation-service';
import {
    StesArbeitsvermittlungPaths,
    StesAufgabenPaths,
    StesDetailsPaths,
    StesKontrollperioden,
    StesLeistunsexportePaths,
    StesSanktionen,
    StesTerminePaths,
    StesVermittlungsfaehigkeits,
    StesWiedereingliederungPaths,
    StesZwischenverdienstPaths
} from '@shared/enums/stes-navigation-paths.enum';
import { AvamNavBase } from '@shared/classes/avam-nav-base';

@Component({
    selector: 'app-stes-details-home',
    templateUrl: './stes-details-home.component.html',
    styleUrls: ['./stes-details-home.component.scss']
})
export class StesDetailsHomeComponent extends AvamNavBase implements OnInit, OnDestroy {
    stesId: number;
    readonly navPath = 'stes';

    // this routeToSkip is no more used and left here for references to check.
    // will be removed after all components are fixed
    private routeToSkip: string[] = [
        StesTerminePaths.TERMINBEARBEITEN,
        StesTerminePaths.TERMINERFASSEN,

        StesAufgabenPaths.AUFGABEN_BEARBEITEN,
        StesAufgabenPaths.AUFGABEN_ERFASSEN,

        StesDetailsPaths.BERUFSDATENBEARBEITEN,
        StesDetailsPaths.BERUFSDATENERFASSEN,

        StesWiedereingliederungPaths.AUSGANGSLAGEN_ERFASSEN,
        StesWiedereingliederungPaths.ZIEL_ERFASSEN,
        StesWiedereingliederungPaths.AKTION_ERFASSEN,
        StesArbeitsvermittlungPaths.SCHNELLZUWEISUNG_ERFASSEN,
        StesZwischenverdienstPaths.ZWISCHENVERDIENSTEERFASSEN,
        StesLeistunsexportePaths.LEISTUNGSEXPORTEERFASSEN,
        StesKontrollperioden.ERFASSEN,
        `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_ERFASSEN_BEMUEHUNGEN}`,
        `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_ERFASSEN_MASSNAHMEN}`,
        `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_ERFASSEN_BERATUNG}`,
        `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_ERFASSEN_KONTROLL_WEISUNGEN}`,
        `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_ERFASSEN_VERMITTLUNG}`,
        StesVermittlungsfaehigkeits.SACHVERHALT
    ];

    constructor(
        private route: ActivatedRoute,
        public authService: AuthenticationService,
        private stesDataService: StesDataRestService,
        protected messageBus: MessageBus,
        protected navigationService: NavigationService
    ) {
        super(messageBus, navigationService);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.route.params.subscribe(params => {
            this.stesId = Number(params['stesId']);
            this.authService.setStesPermissionContext(this.stesId);
        });
    }

    ngOnDestroy(): void {
        this.authService.removeStesPermissionContext();
        super.ngOnDestroy();
    }
}
