import { AfterViewInit, Component, OnInit } from '@angular/core';
import { InfoMessageService } from '@shared/services/info-message.service';
import { Unsubscribable } from 'oblique-reactive';
import { InfoMessageDTO } from '@shared/models/dtos-generated/infoMessageDTO';
import { takeUntil } from 'rxjs/operators';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';

@Component({
    selector: 'app-info-message',
    templateUrl: './info-message.component.html',
    styleUrls: ['./info-message.component.scss']
})
export class InfoMessageComponent extends Unsubscribable implements OnInit, AfterViewInit {
    showInfo = true;
    infoMessages: InfoMessageDTO[];
    readonly infoMessageChannel: string = 'start-page.info-messages';
    private currentUser: JwtDTO;

    constructor(private infoMessageService: InfoMessageService) {
        super();
    }

    ngOnInit(): void {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.subscribeToInfoMessages();
    }

    ngAfterViewInit(): void {
        this.infoMessageService.getInfoMessages(this.infoMessageChannel);
    }

    toggle(): void {
        this.showInfo = !this.showInfo;
    }

    markInfoMessageAsRead(infoMessageId: number): void {
        this.infoMessageService.markInfoMessageAsRead(this.infoMessageChannel, infoMessageId, this.currentUser.userDto.benutzerLogin);
    }

    private subscribeToInfoMessages(): void {
        this.infoMessages = [];
        this.infoMessageService.subject
            .asObservable()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((messages: InfoMessageDTO[]) => this.setInfoMessages(messages));
    }

    private setInfoMessages(messages: InfoMessageDTO[]): void {
        this.infoMessages = messages;
        this.showInfo = messages.length > 0;
    }
}
