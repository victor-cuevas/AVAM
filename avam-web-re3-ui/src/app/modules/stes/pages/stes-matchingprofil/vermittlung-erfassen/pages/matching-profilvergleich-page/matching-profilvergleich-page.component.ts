import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatchingProfilvergleichComponent } from '@shared/components/matchingprofil-vermittlung-erfassen/matching-profilvergleich/matching-profilvergleich.component';
import { ActivatedRoute } from '@angular/router';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { StesHeaderDTO } from '@dtos/stesHeaderDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';

@Component({
    selector: 'avam-matching-profilvergleich-page',
    templateUrl: './matching-profilvergleich-page.component.html'
})
export class MatchingProfilvergleichPageComponent implements OnInit, OnDestroy {
    @ViewChild('component') component: MatchingProfilvergleichComponent;

    stesHeader: StesHeaderDTO;

    constructor(
        private route: ActivatedRoute,
        public dataService: StesDataRestService,
        public translateService: TranslateService,
        private stesInfobarService: AvamStesInfoBarService,
        private fehlermeldungenService: FehlermeldungenService
    ) {}

    ngOnInit() {
        this.component.isStes = true;
        this.fehlermeldungenService.closeMessage();
        this.getRouteParamsAndSetWizard();
        this.stesInfobarService.sendDataToInfobar({ title: 'arbeitgeber.label.profildatenVergleichen' });
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
    }

    private getRouteParamsAndSetWizard() {
        this.route.parent.params.subscribe(params => {
            const stesId = params['stesId'];
            this.dataService.getStesHeader(stesId.toString(), this.translateService.currentLang).subscribe(stesHeader => {
                if (stesHeader) {
                    this.stesHeader = stesHeader;
                }
            });
        });
    }
}
