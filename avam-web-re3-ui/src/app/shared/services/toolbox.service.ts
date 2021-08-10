import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface ToolboxAction {
    channel: any;
    message: ToolboxEvent;
}

export class ToolboxService {
    static CHANNEL;
    static GESPEICHERTEN_LISTE_URL;
    public toolboxDataBehaviorSubject: BehaviorSubject<ToolboxTypeData> = new BehaviorSubject({});
    private buttonClickSubject = new Subject<ToolboxAction>();
    private emailAddressSubject = new Subject();

    private toolboxConfigurationSubject = new BehaviorSubject<{ config?: ToolboxConfiguration[]; id?: string; data?: any }>({});

    constructor() {}

    sendClickAction(event: any) {
        this.buttonClickSubject.next(event);
    }

    /**
     * @param channel
     * @param observeClickActionSub the old subscription (if present: to be deleted)
     */
    observeClickAction(channel, observeClickActionSub?: Subscription): Observable<ToolboxAction> {
        if (observeClickActionSub) {
            observeClickActionSub.unsubscribe();
        }

        return this.buttonClickSubject.asObservable().pipe(filter((m: any) => m.channel === channel));
    }

    resetConfiguration() {
        this.sendConfiguration([]);
    }

    sendConfiguration(configuration: ToolboxConfiguration[], toolBoxId?: string, toolBoxData?: any, hasZuruekButton = true) {
        if (hasZuruekButton) {
            configuration.push(new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, true));
        }
        this.toolboxConfigurationSubject.next({ config: configuration, id: toolBoxId, data: toolBoxData });
    }

    observeConfiguration() {
        return this.toolboxConfigurationSubject.asObservable();
    }

    sendEmailAddress(email: string) {
        this.emailAddressSubject.next(email);
    }

    observeEmailAddress() {
        return this.emailAddressSubject.asObservable();
    }

    sendData(type: string, data: any) {
        this.toolboxDataBehaviorSubject.next({ type, data });
    }

    observeData(): BehaviorSubject<ToolboxTypeData> {
        return this.toolboxDataBehaviorSubject;
    }
}

export enum ToolboxActionEnum {
    HISTORY = 'HISTORY',
    EMAIL = 'EMAIL',
    DMS = 'DMS',
    COPY = 'COPY',
    WORD = 'WORD',
    EXCEL = 'EXCEL',
    PRINT = 'PRINT',
    HELP = 'HELP',
    EXIT = 'EXIT',
    ZURUECK = 'ZURUECK',
    ASALDATEN = 'ASALDATEN'
}

export class ToolboxConfiguration {
    constructor(public action: ToolboxActionEnum, public enabled: boolean, public withBorder: boolean) {}
}

export class ToolboxEvent {
    constructor(public action: ToolboxActionEnum, public id: string, public formNumber?: string) {}
}

export interface ToolboxTypeData {
    type?: string;
    data?: any;
}
