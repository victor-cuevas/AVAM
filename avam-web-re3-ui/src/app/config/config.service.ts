import { Injectable } from '@angular/core';
import { DocumentMetaService, MasterLayoutConfig, MasterLayoutService, ObliqueHttpInterceptorConfig, Unsubscribable } from 'oblique-reactive';
import { NgbDatepickerConfig, NgbPopoverConfig, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '@core/services/authentication.service';
import { Observable } from 'rxjs';

@Injectable()
export class ConfigService extends Unsubscribable {
    constructor(
        config: MasterLayoutConfig,
        ngbPopoverConfig: NgbPopoverConfig,
        tooltipConfig: NgbTooltipConfig,
        datepickerConfig: NgbDatepickerConfig,
        documentMetaService: DocumentMetaService,
        httpInterceptorConfig: ObliqueHttpInterceptorConfig,
        masterLayoutService: MasterLayoutService,
        private authService: AuthenticationService
    ) {
        super();
        config.locale.locales = ['de', 'fr', 'it'];
        config.layout.fixed = true;
        config.header.animate = false;
        config.header.medium = true;
        config.homePageRoute = '/home';
        config.layout.cover = !this.isLoggedIn();
        config.layout.mainNavigation = this.isLoggedIn();

        ngbPopoverConfig.triggers = 'click'; // TODO customize to 'hover' instead of click. still right?

        // As the HEAD `title` element and the `description` meta element are outside any
        // Angular entry component, we use a service to update these element values:
        documentMetaService.titleSuffix = 'i18n.application.title';
        documentMetaService.description = 'i18n.application.description';
        // NgBootstrap configuration:
        tooltipConfig.container = 'body';
        datepickerConfig.navigation = 'arrows';

        httpInterceptorConfig.api.spinner = false;

        authService.getLoginObservable().subscribe(value => {
            masterLayoutService.coverLayout = !value;
            masterLayoutService.noNavigation = !value;
        });
    }

    public isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    public getLoginObservable(): Observable<boolean> {
        return this.authService.getLoginObservable();
    }
}
