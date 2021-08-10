import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class FehlermeldungenService {
    private subjectChannelMap: { [x: string]: BehaviorSubject<any> } = {};
    private newChannelAdded: Subject<any> = new Subject();

    constructor(private translate: TranslateService) {}

    showMessage(message: string, type: string, channel: string = AlertChannelEnum.MAIN_UI) {
        channel = this.getCurrentChannel(channel);
        this.createChannelIfDoesntExists(channel);
        this.subjectChannelMap[channel].next({ text: this.translate.instant(message), type, channel });
    }

    showErrorMessage(message: string, channel: string = AlertChannelEnum.MAIN_UI) {
        this.showMessage(message, 'danger', channel);
    }

    closeMessage(channel: string = AlertChannelEnum.MAIN_UI) {
        channel = this.getCurrentChannel(channel);
        this.createChannelIfDoesntExists(channel);
        this.subjectChannelMap[channel].next(null);
    }

    getMessage(channel: string = AlertChannelEnum.MAIN_UI): Observable<any> {
        channel = this.getCurrentChannel(channel);
        this.createChannelIfDoesntExists(channel);
        return this.subjectChannelMap[channel].asObservable();
    }

    createChannelIfDoesntExists(channel: string) {
        if (!this.subjectChannelMap[channel]) {
            this.subjectChannelMap[channel] = new BehaviorSubject(null);
            this.newChannelAdded.next(channel);
        }
    }

    getCurrentChannel(inputChannel: string) {
        return inputChannel === null ? AlertChannelEnum.MAIN_UI : inputChannel;
    }

    getNewChannel() {
        return this.newChannelAdded.asObservable();
    }

    deleteMessage(message: string, type: string, channel: string = AlertChannelEnum.MAIN_UI) {
        channel = this.getCurrentChannel(channel);
        this.subjectChannelMap[channel].next({ text: this.translate.instant(message), type, channel, action: 'delete' });
    }
}
