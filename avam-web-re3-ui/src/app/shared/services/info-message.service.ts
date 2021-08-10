import { Injectable } from '@angular/core';
import { InfoMessageRestService } from '@core/http/info-message-rest.service';
import { InfoMessageDTO } from '@shared/models/dtos-generated/infoMessageDTO';
import { Subject } from 'rxjs';
import { BenutzerInfoMessageDTO } from '@shared/models/dtos-generated/benutzerInfoMessageDTO';
import { SpinnerService } from 'oblique-reactive';

@Injectable()
export class InfoMessageService {
    public subject: Subject<InfoMessageDTO[]> = new Subject();
    private messages: InfoMessageDTO[];

    constructor(private infoMessageRestService: InfoMessageRestService, private spinnerService: SpinnerService) {}

    markInfoMessageAsRead(channel: string, infoMessageId: number, benutzerLogin: string): void {
        this.spinnerService.activate(channel);
        this.infoMessageRestService.markInfoMessageAsRead(this.asInfoMessageDTO(infoMessageId, benutzerLogin)).subscribe(() => this.getMessages(channel, true));
    }

    getInfoMessages(channel: string): void {
        this.getMessages(channel, false);
    }

    get infoMessages(): InfoMessageDTO[] {
        return this.messages;
    }

    set infoMessages(messages: InfoMessageDTO[]) {
        this.messages = messages;
        this.subject.next(messages);
    }

    private getMessages(channel: string, isActive: boolean): void {
        if (!isActive) {
            this.spinnerService.activate(channel);
        }
        this.infoMessageRestService.getInfoMessages().subscribe((messages: InfoMessageDTO[]) => {
            this.infoMessages = messages;
            this.spinnerService.deactivate(channel);
        });
    }

    private asInfoMessageDTO(infoMessageId: number, benutzerLogin: string): BenutzerInfoMessageDTO {
        return {
            infomessageId: infoMessageId,
            benutzerId: benutzerLogin,
            benutzerInfomessageId: 0
        } as BenutzerInfoMessageDTO;
    }
}
