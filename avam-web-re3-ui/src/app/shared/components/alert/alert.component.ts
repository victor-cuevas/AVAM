import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FehlermeldungenService } from '../../services/fehlermeldungen.service';
import { FehlermeldungModel } from '../../models/fehlermeldung.model';
import { Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() channel: string = AlertChannelEnum.MAIN_UI;

    alertChannel = AlertChannelEnum;
    messagesChannelMap: { [x: string]: FehlermeldungModel[] } = {};

    constructor(private fehlermeldungenService: FehlermeldungenService, private router: Router) {
        super();
    }

    ngOnInit(): void {
        this.loadNewChannel(this.channel);

        this.fehlermeldungenService.getNewChannel().subscribe(this.loadNewChannel.bind(this));
    }

    close(index: number): void {
        this.messagesChannelMap[this.channel].splice(index, 1);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    getMessages(channel?: string) {
        return this.messagesChannelMap[channel || this.channel];
    }

    private loadNewChannel(channel: string) {
        if (!this.messagesChannelMap[channel]) {
            this.messagesChannelMap[channel] = [];
            this.observeMessages(channel);
        }
    }

    private reset(channel?: string): void {
        this.messagesChannelMap[channel || this.channel] = [];
    }

    private observeMessages(channel: string = AlertChannelEnum.MAIN_UI): void {
        this.fehlermeldungenService
            .getMessage(channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message) {
                    if (message.action && message.action === 'delete') {
                        const index = this.messagesChannelMap[channel].findIndex(item => item.text === message.text);
                        if (index !== -1) {
                            this.messagesChannelMap[channel].splice(index, 1);
                        }
                    } else {
                        this.messagesChannelMap[channel].push({ text: message.text, type: message.type, channel: message.channel });
                    }
                } else {
                    this.reset(channel);
                }
            });
    }
}
