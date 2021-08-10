import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { MatchingProfilvergleichComponent } from '@shared/components/matchingprofil-vermittlung-erfassen/matching-profilvergleich/matching-profilvergleich.component';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';

@Component({
    selector: 'avam-matching-profilvergleich-page',
    templateUrl: './matching-profilvergleich-page.component.html'
})
export class MatchingProfilvergleichPageComponent implements OnInit, OnDestroy {
    @ViewChild('component') component: MatchingProfilvergleichComponent;

    unternehmenId: any;

    constructor(
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private fehlermeldungenService: FehlermeldungenService,
        private contentService: ContentService
    ) {}

    ngOnInit() {
        this.component.isStes = false;
        this.contentService.setAlertVisibility(false);
        this.fehlermeldungenService.closeMessage();
        this.getRouteParams();
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.label.profildatenVergleichen' });
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
