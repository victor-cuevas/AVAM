import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchingWizardService } from '@shared/components/new/avam-wizard/matching-wizard.service';
import { ArbeitgeberPaths, StesMatchingprofilPaths } from '@shared/enums/stes-navigation-paths.enum';
import { Environment } from '@shared/components/new/avam-wizard/zuweisung-wizard.service';
import { TranslateService } from '@ngx-translate/core';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { BaseResponseWrapperOsteHeaderParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteHeaderParamDTOWarningMessages';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';
import { Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';

@Component({
    selector: 'avam-matchingprofil-vermittlung-erfassen',
    templateUrl: './matching-wizard.component.html'
})
export class MatchingWizardComponent extends Unsubscribable implements OnInit, OnDestroy {
    stesId: any;
    osteMatchingProfilId: any;
    osteId: any;
    unternehmenId: any;

    stepOne: string;
    stepTwo: string;

    constructor(
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private osteService: OsteDataRestService,
        private translateService: TranslateService,
        private contentService: ContentService,
        private wizardService: MatchingWizardService
    ) {
        super();
    }

    ngOnInit() {
        this.getRouteParamsAndSetWizard();
        this.genereateWizardUrl();
        this.infopanelService.sendLastUpdate({}, true);
        if (this.wizardService.currentStep !== 0) {
            this.wizardService.navigateStep1();
        }
    }

    getRouteParamsAndSetWizard() {
        this.wizardService.setEnvironment(Environment.OSTE);
        this.route.params.subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
            this.wizardService.setUnternehmenId(this.unternehmenId);
        });
        this.route.queryParamMap.subscribe(params => {
            this.stesId = params.get('stesId');
            this.wizardService.setStesId(this.stesId);
            this.osteId = params.get('osteId');
            this.wizardService.setOsteId(this.osteId);
            this.osteMatchingProfilId = params.get('osteMatchingProfilId');
            this.wizardService.setOsteMatchingProfilId(this.osteMatchingProfilId);
            this.osteService
                .getOsteHeader(this.osteId, this.translateService.currentLang)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((osteHeader: BaseResponseWrapperOsteHeaderParamDTOWarningMessages) => {
                    this.contentService.setOsteHeaderData(osteHeader.data);
                });
        });
    }

    genereateWizardUrl() {
        this.stepOne = `${ArbeitgeberPaths.ARBEITGEBER_DETAILS}/${this.unternehmenId}/${ArbeitgeberPaths.STELLENANGEBOTE_MATCHINGPROFIL}/${
            StesMatchingprofilPaths.VERMITTLUNG_ERFASSEN
        }/step1?
        stesId=${this.stesId}&osteId=${this.osteId}&osteMatchingProfilId=${this.osteMatchingProfilId}`;
        this.stepTwo = `${ArbeitgeberPaths.ARBEITGEBER_DETAILS}/${this.unternehmenId}/${ArbeitgeberPaths.STELLENANGEBOTE_MATCHINGPROFIL}/${
            StesMatchingprofilPaths.VERMITTLUNG_ERFASSEN
        }/step2?
        stesId=${this.stesId}&osteId=${this.osteId}&osteMatchingProfilId=${this.osteMatchingProfilId}`;
    }

    zuMatching() {
        this.wizardService.navigateToMatching();
    }

    ngOnDestroy() {
        this.wizardService.setEnvironment(null);
        this.wizardService.setStesId(null);
        this.wizardService.setOsteMatchingProfilId(null);
        this.wizardService.setOsteId(null);
        this.wizardService.setProfilvergleich(null);
        this.contentService.setOsteHeaderData(null);
        super.ngOnDestroy();
    }
}
