import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { AbstractStesZuweisungPage } from '@stes/pages/arbeitsvermittlungen/zuweisung/pages/AbstractStesZuweisungPage.class';
import { ProfilvergleichComponent } from '@shared/components/zuweisung/profilvergleich/profilvergleich.component';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';

@Component({
    selector: 'avam-stes-profil-vergleich-page',
    templateUrl: './stes-profil-vergleich-page.component.html'
})
export class StesProfilVergleichPageComponent extends AbstractStesZuweisungPage implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('component') component: ProfilvergleichComponent;

    constructor(
        public route: ActivatedRoute,
        public spinnerService: SpinnerService,
        public dataService: StesDataRestService,
        public translateService: TranslateService,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super(route, spinnerService, dataService, translateService);
    }

    ngOnInit() {
        super.getRouteParams();
        this.component.stesId = this.stesId;
        this.stesInfobarService.sendDataToInfobar({ title: 'arbeitgeber.label.profildatenVergleichen' });
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
