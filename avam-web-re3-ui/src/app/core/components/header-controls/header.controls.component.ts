import { AfterViewInit, Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '@config/config.service';
import { NotificationService } from 'oblique-reactive';
import { AuthenticationService } from '@core/services/authentication.service';
import { Subscription } from 'rxjs';
import { DmsService, RoboHelpService, ToolboxService } from '@app/shared';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { MessageBus } from '@shared/services/message-bus';
import { GuidedTourService } from '@shared/services/guided-tour.service';
import { StartPageComponent } from '@home/pages/start-page/start-page.component';
import { getBaseLocation } from '@environments/common-functions.util';
import { HeaderService } from '@core/services/header.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { UnternehmenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { Event, NavigationEnd, Router } from '@angular/router';

@Component({
    selector: 'header-controls',
    templateUrl: './header.controls.component.html'
})
export class HeaderControlsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    public permissions: typeof Permissions = Permissions;
    private static readonly DE: string = 'de';
    private static readonly FR: string = 'fr';
    private static readonly IT: string = 'it';
    private authSubscription: Subscription;
    private hasHintergrundbild: boolean;
    private routerSubscription: Subscription;

    constructor(
        public headerService: HeaderService,
        private translateService: TranslateService,
        private guidedTourService: GuidedTourService,
        private config: ConfigService,
        private notificationService: NotificationService,
        private authService: AuthenticationService,
        private roboHelpService: RoboHelpService,
        private readonly messageBus: MessageBus,
        private dmsService: DmsService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.authSubscription = this.authService.getLoginObservable().subscribe(() => {
            this.ngOnChanges();
        });

        this.routerSubscription = this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                // AVB-20488: do not fire on login page
                if (['/', '/login'].indexOf(event.url) === -1) {
                    this.headerService.getJobroomMeldungenCount();
                    this.routerSubscription.unsubscribe();
                }
            }
        });
    }

    ngOnChanges(): void {
        const elements = document.getElementsByClassName('navbar-locale');
        if (!elements || elements.length === 0) {
            return;
        }
        const element = elements.item(0) as HTMLElement;
        element.style.display = this.config.isLoggedIn() ? 'none' : 'flex';

        this.messageBus.buildAndSend('start-page.show-background-image', this.hasHintergrundbild);
    }

    ngAfterViewInit(): void {
        this.ngOnChanges();
        const showBackgroundImage: any = localStorage.getItem('showBackgroundImage');
        if (!showBackgroundImage) {
            this.hasHintergrundbild = true;
        } else {
            this.hasHintergrundbild = JSON.parse(showBackgroundImage) as boolean;
        }
    }

    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        this.headerService.resultCount = 0;
    }

    isDe(): boolean {
        return this.translateService.currentLang === HeaderControlsComponent.DE;
    }

    isFr(): boolean {
        return this.translateService.currentLang === HeaderControlsComponent.FR;
    }

    isIt(): boolean {
        return this.translateService.currentLang === HeaderControlsComponent.IT;
    }

    help(): void {
        this.roboHelpService.help(StesFormNumberEnum.SYSTEMGRUNDLAGEN);
    }

    guidedTour(): void {
        this.guidedTourService.openGuidedTourUrl();
    }

    useDe(): void {
        this.use(HeaderControlsComponent.DE);
    }

    useFr(): void {
        this.use(HeaderControlsComponent.FR);
    }

    useIt(): void {
        this.use(HeaderControlsComponent.IT);
    }

    changeBackgroundImage(value: boolean): void {
        this.hasHintergrundbild = value;
        localStorage.setItem(StartPageComponent.LOCAL_STORAGE_SHOW_BG_IMG, JSON.stringify(this.hasHintergrundbild));
        this.messageBus.buildAndSend('start-page.show-background-image', this.hasHintergrundbild);
    }

    isHintergrundbildChecked(): boolean {
        return this.hasHintergrundbild;
    }

    openDmsWorkspace(): void {
        this.dmsService.openDmsWorkspace();
    }

    logout(): void {
        ToolboxService.GESPEICHERTEN_LISTE_URL = undefined;
        this.authService.logout();
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    openInNewWindow() {
        window.open(getBaseLocation() + '/home');
    }

    getUrlJobroomMeldungen() {
        this.router.navigate([`/arbeitgeber/stellenangebot/${UnternehmenPaths.JOBROOM_MELDUNGEN_SUCHEN}`]);
    }

    private use(lang: string): void {
        const isSameLang: boolean = this.translateService.currentLang === lang;
        this.translateService.use(lang);
        this.notifyLangChange(isSameLang);
    }

    private notifyLangChange(isSameLang: boolean): void {
        if (isSameLang) {
            this.notificationService.warning('login.feedback.sprache.nichtgewechselt');
        } else {
            this.notificationService.success('login.feedback.sprache.gewechselt');
        }
    }
}
