import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { FacadeService } from '@shared/services/facade.service';
import { Subscription } from 'rxjs';
import { LeistungsvereinbarungenNavigationService } from '../../../services/leistungsvereinbarungen-navigation.service';

@Component({
    selector: 'avam-leistungsvereinbarung-home',
    templateUrl: './leistungsvereinbarung-home.component.html',
    providers: []
})
export class LeistungsvereinbarungHomeComponent implements OnInit, OnDestroy {
    lvId: number;
    messageBusSubscription: Subscription;

    constructor(private route: ActivatedRoute, private navigationService: LeistungsvereinbarungenNavigationService, private facadeService: FacadeService, private router: Router) {}

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.lvId = +params['lvId'];
        });

        this.navigationService.setLeistungsvereinbarungStaticNavigation(this.lvId);

        this.messageBusSubscription = this.facadeService.messageBus.getData().subscribe(message => {
            if (
                message.type === 'close-nav-item' &&
                message.data &&
                message.data.label === this.facadeService.translateService.instant(UnternehmenSideNavLabels.LEISTUNGSVEREINBARUNG)
            ) {
                this.router.navigate(['../'], { relativeTo: this.route });
            }
        });
    }

    ngOnDestroy() {
        this.messageBusSubscription.unsubscribe();
        this.navigationService.removeLeistungsvereinbarungStaticNavigation();
    }
}
