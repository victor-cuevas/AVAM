import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { EnvironmentRestService } from '../../http/environment-rest.service';
import { ActivationEnd, Router } from '@angular/router';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { MessageBus } from '@shared/services/message-bus';
import { EnvironmentDTO } from '@shared/models/dtos-generated/environmentDTO';
import { ToolboxService } from '@app/shared';

@Component({
    selector: 'app-footer-infos',
    templateUrl: './footer-infos.component.html'
})
export class FooterInfosComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() envInfo: EnvironmentDTO;
    private static readonly FORM_NUMBER = 'formNumber';
    private formNumber: string;

    private messageBusSubscription: Subscription;

    constructor(private readonly messageBus: MessageBus, private router: Router, private toolboxService: ToolboxService) {
        super();
    }

    ngOnInit(): void {
        this.router.events
            .pipe(filter(event => event instanceof ActivationEnd))
            .pipe(map((event: ActivationEnd) => event.snapshot.data[FooterInfosComponent.FORM_NUMBER]))
            .pipe(filter((formNumber: string) => formNumber !== undefined))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(formNumber => {
                this.formNumber = formNumber;
                this.informToolbox();
            });

        this.messageBusSubscription = this.messageBus.getData().subscribe(message => {
            if (message.type === 'footer-infos.formNumber') {
                this.formNumber = message.data.formNumber;
                this.informToolbox();
            }
        });
    }

    ngOnDestroy(): void {
        this.messageBusSubscription.unsubscribe();
    }

    getFormNumber(): string {
        return `${this.formNumber} - `;
    }

    getEnvironment(): string {
        if (!this.envInfo) {
            return null;
        } else if (!this.envInfo.environment) {
            return null;
        }

        this.envInfo.environment = this.envInfo.environment.toLowerCase();

        // return first letter to match translation key
        return this.envInfo.environment[0];
    }

    getDbVersion(): string {
        return this.envInfo ? this.envInfo.dbVersion : null;
    }

    getVersion(): string {
        return this.envInfo ? this.envInfo.version : null;
    }

    private informToolbox(): void {
        if (this.formNumber) {
            this.toolboxService.sendData('toolbox.help.formNumber', this.formNumber);
        }
    }
}
