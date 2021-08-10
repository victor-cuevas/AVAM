import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SchnellzuweisungenBearbeitenComponent } from '@shared/components/schnellzuweisungen-bearbeiten/schnellzuweisungen-bearbeiten.component';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@core/services/authentication.service';
import { UnternehmenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@shared/services/navigation-service';
import { StesHeaderDTO } from '@dtos/stesHeaderDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxService } from '@app/shared';
import { Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-schnellzuweisungen-bearbeiten-page',
    templateUrl: './schnellzuweisungen-bearbeiten-page.component.html',
    styleUrls: []
})
export class SchnellzuweisungenBearbeitenPageComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('element') element: SchnellzuweisungenBearbeitenComponent;

    constructor(
        private activatedRoute: ActivatedRoute,
        private authService: AuthenticationService,
        private navigationService: NavigationService,
        private dataService: StesDataRestService,
        private translateService: TranslateService,
        private toolboxService: ToolboxService
    ) {
        super();
    }

    ngOnInit(): void {
        this.activatedRoute.queryParamMap.subscribe(params => {
            const stesId = params.get('stesId');
            const zuweisungId = params.get('zuweisungId');
            this.element.stesId = stesId;
            this.authService.setStesPermissionContext(+stesId);
            this.navigationService.showNavigationTreeRoute(UnternehmenPaths.SCHNELLZUWEISUNG_BEARBEITEN, { zuweisungId, stesId });
            this.dataService
                .getStesHeader(stesId, this.translateService.currentLang)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((data: StesHeaderDTO) => {
                    this.toolboxService.sendEmailAddress(data.stesBenutzerEmail ? data.stesBenutzerEmail : '');
                });
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    canDeactivate() {
        return this.element.canDeactivate();
    }
}
