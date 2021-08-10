import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OsteNavigationHelperService } from '@modules/arbeitgeber/arbeitgeber-details/services/oste-navigation-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@shared/services/navigation-service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { takeUntil } from 'rxjs/operators';
import { BaseResponseWrapperOsteHeaderParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteHeaderParamDTOWarningMessages';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';
import { Unsubscribable } from 'oblique-reactive';
import { Subscription } from 'rxjs';

@Component({
    selector: 'avam-stellenangebot-detail',
    templateUrl: './stellenangebot-detail.component.html'
})
export class StellenangebotDetailComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('component') component;
    osteId: string;
    private messageBusSubscription: Subscription;

    constructor(
        private osteSideNavHelper: OsteNavigationHelperService,
        private route: ActivatedRoute,
        private router: Router,
        private messageBus: MessageBus,
        private navigationService: NavigationService,
        private dbTranslateService: DbTranslateService,
        private osteService: OsteDataRestService,
        private contentService: ContentService
    ) {
        super();
    }

    public ngOnInit() {
        this.route.queryParamMap.subscribe(params => {
            this.osteId = params.get('osteId');
            this.osteSideNavHelper.setOsteId(this.osteId);
            this.osteSideNavHelper.setFirstLevelNav();
        });

        this.messageBusSubscription = this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data && message.data.label === this.dbTranslateService.instant(UnternehmenSideNavLabels.STELLENANGEBOT)) {
                if (this.router.url.includes('stellenangebote/stellenangebot/')) {
                    this.router.navigate(['../'], { relativeTo: this.route });
                }
                if (this.canNavigateAway()) {
                    this.osteSideNavHelper.hideSideNav();
                    this.messageBusSubscription.unsubscribe();
                } else {
                    this.osteSideNavHelper.checkConfirmationToCancel();
                }
            }
        });
        this.osteService
            .getOsteHeader(this.osteId, this.dbTranslateService.getCurrentLang())
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((osteHeader: BaseResponseWrapperOsteHeaderParamDTOWarningMessages) => {
                this.contentService.setOsteHeaderData(osteHeader.data);
            });
    }

    public onOutletActivate(event): void {
        this.component = event;
    }

    public canNavigateAway() {
        return this.component && (!this.component.canDeactivate || !this.component.canDeactivate());
    }

    public ngOnDestroy(): void {
        this.contentService.setOsteHeaderData(null);
        super.ngOnDestroy();
    }
}
