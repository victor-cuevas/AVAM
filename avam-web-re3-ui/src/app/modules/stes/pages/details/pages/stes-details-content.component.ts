import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { FehlermeldungModel } from 'src/app/shared/models/fehlermeldung.model';
import { MessageBus } from '@shared/services/message-bus';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { StesStoreService } from '@app/modules/stes/stes-store.service';
import { ToolboxService } from '@app/shared';

@Component({
    selector: 'app-stes-details-content',
    templateUrl: './stes-details-content.component.html',
    styleUrls: ['./stes-details-content.component.scss']
})
export class StesDetailsContentComponent implements OnInit, OnDestroy {
    isShown: boolean;
    messages: FehlermeldungModel[] = [];
    /*
     * number of business objects
     */
    contentNumber: number = null;

    /**
     * in sync with chosen menu item
     */
    public ueberschrift: string;
    public ueberschriftBackup: string;

    /**
     * things like dates: vom 25.06.2019
     */
    public ueberschriftAddition = '';

    private titleTranslateSubscription: Subscription;
    private fehlermeldungenSubscription: Subscription;
    private messageBusSubscription: Subscription;
    constructor(
        private fehlermeldungenService: FehlermeldungenService,
        private translate: TranslateService,
        private readonly messageBus: MessageBus,
        private dataService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private route: ActivatedRoute,
        private stesStore: StesStoreService,
        private toolbox: ToolboxService
    ) {
        this.fehlermeldungenSubscription = this.fehlermeldungenService.getMessage().subscribe(message => {
            if (message) {
                const index: number = this.messages.findIndex(value => value.text === message.text);
                if (index === -1) {
                    this.messages.push({ text: message.text, type: message.type, channel: message.channel });
                } else if (message.action !== undefined && message.action === 'delete') {
                    this.messages.splice(index, 1);
                }
            } else {
                this.messages = [];
            }
        });
    }

    ngOnInit() {
        this.route.params.subscribe(data => {
            if (data && data['stesId']) {
                this.dataService.getStesHeader(data['stesId'], this.translate.currentLang).subscribe((stesData: StesHeaderDTO) => {
                    this.toolbox.sendEmailAddress(stesData.stesBenutzerEmail);
                    this.stesStore.addStes(stesData);
                });
            }
        });

        this.messageBusSubscription = this.messageBus.getData().subscribe(message => {
            if (message.type === 'stes-details-content') {
                this.contentNumber = message.data.contentNumber;
                this.ueberschriftAddition = message.data.ueberschriftAddition ? message.data.ueberschriftAddition : '';
            } else if (message.type === 'stes-details-content-ueberschrift') {
                if (!this.ueberschriftBackup) {
                    this.ueberschriftBackup = this.ueberschrift;
                }
                this.ueberschrift = message.data.ueberschrift;
            } else if (message.type === 'stes-details-recover-ueberschrift') {
                this.ueberschrift = this.ueberschriftBackup;
            }
        });
    }

    ngOnDestroy() {
        if (this.fehlermeldungenSubscription) {
            this.fehlermeldungenSubscription.unsubscribe();
        }

        this.messageBusSubscription.unsubscribe();
    }

    onOutletActivate(outlet: RouterOutlet) {
        if (outlet && outlet.activatedRouteData && outlet.activatedRouteData['title']) {
            const title = outlet.activatedRouteData['title'];
            this.titleTranslateSubscription = this.translate.stream(title).subscribe(ueberschrift => {
                this.ueberschrift = ueberschrift;
                this.ueberschriftBackup = null;
            });
        }
    }

    onOutletDeactivate() {
        if (this.titleTranslateSubscription) {
            this.ueberschrift = null;
            this.titleTranslateSubscription.unsubscribe();
        }
    }

    close(index: number) {
        this.messages.splice(index, 1);
    }
}
