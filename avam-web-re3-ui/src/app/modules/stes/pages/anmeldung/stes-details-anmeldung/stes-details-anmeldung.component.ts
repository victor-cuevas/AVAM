import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { MessageBus } from '@shared/services/message-bus';

@Component({
    selector: 'app-stes-details-anmeldung',
    templateUrl: './stes-details-anmeldung.component.html',
    styleUrls: ['./stes-details-anmeldung.component.scss']
})
export class StesDetailsAnmeldungComponent implements OnInit, OnDestroy {
    isInfoleisteEnabled = false;
    public ueberschrift: string;
    private titleTranslateSubscription: Subscription;
    private messageBusSubscription: Subscription;

    constructor(private wizardService: WizardService, private translate: TranslateService, private readonly messageBus: MessageBus) {}

    onOutletDeactivate() {
        if (this.titleTranslateSubscription) {
            this.ueberschrift = null;
            this.titleTranslateSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.wizardService.changeStepSubject.subscribe(step => {
            if (step > 2) {
                this.isInfoleisteEnabled = true;
            } else {
                this.isInfoleisteEnabled = false;
            }
        });
        this.messageBusSubscription = this.messageBus.getData().subscribe(message => {
            if (message.type === 'stes-details-content-ueberschrift') {
                this.ueberschrift = message.data.ueberschrift;
            }
        });
    }

    onOutletActivate(outlet: RouterOutlet) {
        if (outlet && outlet.activatedRouteData && outlet.activatedRouteData['title']) {
            const title = outlet.activatedRouteData['title'];
            this.titleTranslateSubscription = this.translate.stream(title).subscribe(ueberschrift => {
                this.ueberschrift = ueberschrift;
            });
        }
    }

    ngOnDestroy() {
        this.messageBusSubscription.unsubscribe();
    }
}
