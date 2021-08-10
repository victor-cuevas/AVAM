import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MessageBus } from '@shared/services/message-bus';
import { Unsubscribable } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { StartPageModel } from '@shared/models/start-page.model';
import { AuthenticationService } from '@core/services/authentication.service';

@Component({
    selector: 'app-start-page',
    templateUrl: './start-page.component.html',
    styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent extends Unsubscribable implements OnInit, AfterViewInit {
    public static readonly LOCAL_STORAGE_SHOW_BG_IMG = 'showBackgroundImage';
    public static readonly START_PAGE_MODEL = 'startPageModel';
    showBackgroundImage: boolean;
    messages: string[];
    private model: StartPageModel = JSON.parse(localStorage.getItem(StartPageComponent.START_PAGE_MODEL));

    constructor(private readonly messageBus: MessageBus, private translateService: TranslateService, private authenticationService: AuthenticationService) {
        super();
    }

    ngOnInit(): void {
        this.initBackgroundImage();
    }

    ngAfterViewInit(): void {
        this.messageBus.getData().subscribe(() => {
            this.initBackgroundImage();
        });
    }

    showMessages(): boolean {
        return this.model && this.model.currentUser !== null && this.model.currentUser !== 'undefined';
    }

    lastloginMsg(): string {
        return this.translateService.instant('login.feedback.lastlogin', { date: this.model.currentUser.userDto.letztesLogin });
    }

    benutzerstelleMsg(): string {
        return this.translateService.instant('login.feedback.benutzerstelle', { stelle: this.model.currentUser.userDto.benutzerstelleName });
    }

    erfolgreichAngemeldetMsg(): string {
        return this.model.isLogin ? this.translateService.instant('login.feedback.successMsg') : null;
    }

    siteChangedMsg(): string {
        return this.model.siteChanged
            ? this.translateService.instant('login.feedback.benutzerstelle.gewechselt')
            : this.translateService.instant('login.feedback.benutzerstelle.nichtgewechselt');
    }

    isLoggedIn(): boolean {
        return this.authenticationService.isLoggedIn();
    }

    private initBackgroundImage(): void {
        const hasBackgroundImage: any = localStorage.getItem(StartPageComponent.LOCAL_STORAGE_SHOW_BG_IMG);
        this.showBackgroundImage = !hasBackgroundImage ? true : (JSON.parse(hasBackgroundImage) as boolean);
    }
}
