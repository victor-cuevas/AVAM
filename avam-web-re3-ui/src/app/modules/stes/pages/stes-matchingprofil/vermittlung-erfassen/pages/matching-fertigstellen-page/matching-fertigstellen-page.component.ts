import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StesHeaderDTO } from '@dtos/stesHeaderDTO';
import { ActivatedRoute } from '@angular/router';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
// prettier-ignore
import {
    MatchingVermittlungFertigstellenComponent
} from '@shared/components/matchingprofil-vermittlung-erfassen/matching-vermittlung-fertigstellen/matching-vermittlung-fertigstellen.component';

@Component({
    selector: 'avam-matching-fertigstellen-page',
    templateUrl: './matching-fertigstellen-page.component.html'
})
export class MatchingFertigstellenPageComponent implements OnInit, OnDestroy {
    @ViewChild('component') component: MatchingVermittlungFertigstellenComponent;

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
        this.stesInfobarService.sendDataToInfobar({ title: 'arbeitgeber.label.vermittlungFertigstellen' });
    }

    canDeactivate() {
        return this.component.vermittlungForm.dirty;
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
