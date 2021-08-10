import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Environment, ZuweisungWizardService } from '@shared/components/new/avam-wizard/zuweisung-wizard.service';
import { takeUntil } from 'rxjs/operators';
import { BaseResponseWrapperOsteHeaderParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteHeaderParamDTOWarningMessages';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';
import { Unsubscribable } from 'oblique-reactive';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-oste-zuweisung-erfassen-wizard',
    templateUrl: './oste-zuweisung-erfassen-wizard.component.html'
})
export class OsteZuweisungErfassenWizardComponent extends Unsubscribable implements OnInit, OnDestroy {
    unternehmenId: any;
    osteId: any;

    stepOne: string;
    stepTwo: string;
    stepThree: string;

    constructor(
        private route: ActivatedRoute,
        private osteService: OsteDataRestService,
        private translateService: TranslateService,
        private contentService: ContentService,
        private wizardService: ZuweisungWizardService,
        private searchSession: SearchSessionStorageService
    ) {
        super();
    }

    ngOnInit() {
        this.getRouteParams();
        this.genereateWizardUrl();
        this.wizardService.setEnvironment(Environment.OSTE);
        this.wizardService.setUnternehmenId(this.unternehmenId);
        this.wizardService.setOsteId(this.osteId);
        this.wizardService.navigateToOste(1);

        this.osteService
            .getOsteHeader(this.osteId, this.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((osteHeader: BaseResponseWrapperOsteHeaderParamDTOWarningMessages) => {
                this.contentService.setOsteHeaderData(osteHeader.data);
            });
    }

    getRouteParams() {
        this.route.params.subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.osteId = params.get('osteId');
        });
    }

    genereateWizardUrl() {
        this.stepOne = `${this.unternehmenId}/stellenangebote/stellenangebot/vermittlungen/erfassen/erfassen/step1`;
        this.stepTwo = `${this.unternehmenId}/stellenangebote/stellenangebot/vermittlungen/erfassen/erfassen/step2`;
        this.stepThree = `${this.unternehmenId}/stellenangebote/stellenangebot/vermittlungen/erfassen/erfassen/step3`;
    }

    zuStellenvermittlung() {
        this.wizardService.navigateToArbeitsvermittlungOste();
    }

    ngOnDestroy() {
        this.searchSession.clearStorageByKey('osteSuchenZuweisungErfassenStateKey');
        this.searchSession.clearStorageByKey('osteZuweisungSuchenResultsStateKey');
        this.wizardService.setStesId(null);
        this.wizardService.setOsteId(null);
        this.wizardService.setUnternehmenId(null);
        this.wizardService.setEnvironment(null);
        this.wizardService.setProfilvergleich(null);
        this.contentService.setOsteHeaderData(null);
        super.ngOnDestroy();
    }
}
