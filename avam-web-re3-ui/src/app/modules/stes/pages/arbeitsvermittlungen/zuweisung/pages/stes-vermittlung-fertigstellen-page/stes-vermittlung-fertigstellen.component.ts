import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractStesZuweisungPage } from '@stes/pages/arbeitsvermittlungen/zuweisung/pages/AbstractStesZuweisungPage.class';
import { ActivatedRoute } from '@angular/router';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { VermittlungFertigstellenComponent } from '@app/shared/components/zuweisung/vermittlung-fertigstellen/vermittlung-fertigstellen.component';

@Component({
    selector: 'avam-stes-vermittlung-fertigstellen',
    templateUrl: './stes-vermittlung-fertigstellen.component.html'
})
export class StesVermittlungFertigstellenPageComponent extends AbstractStesZuweisungPage implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('component') component: VermittlungFertigstellenComponent;

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
        this.stesInfobarService.sendDataToInfobar({ title: 'arbeitgeber.label.vermittlungFertigstellen' });
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    canDeactivate() {
        return this.component.vermittlungForm.dirty;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
