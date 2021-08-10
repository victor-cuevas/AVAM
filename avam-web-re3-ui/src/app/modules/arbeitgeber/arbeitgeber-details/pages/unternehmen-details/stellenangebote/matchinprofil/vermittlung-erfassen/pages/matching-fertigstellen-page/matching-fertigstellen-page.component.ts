import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
// prettier-ignore
import {
    MatchingVermittlungFertigstellenComponent
} from '@shared/components/matchingprofil-vermittlung-erfassen/matching-vermittlung-fertigstellen/matching-vermittlung-fertigstellen.component';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';

@Component({
    selector: 'avam-matching-fertigstellen-page',
    templateUrl: './matching-fertigstellen-page.component.html'
})
export class MatchingFertigstellenPageComponent implements OnInit, OnDestroy {
    @ViewChild('component') component: MatchingVermittlungFertigstellenComponent;
    unternehmenId: any;

    constructor(
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private fehlermeldungenService: FehlermeldungenService,
        private contentService: ContentService
    ) {}

    ngOnInit() {
        this.component.isStes = false;
        this.contentService.setAlertVisibility(true);
        this.fehlermeldungenService.closeMessage();
        this.getRouteParams();
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.label.vermittlungFertigstellen' });
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
    }

    getRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
        });
    }
}
