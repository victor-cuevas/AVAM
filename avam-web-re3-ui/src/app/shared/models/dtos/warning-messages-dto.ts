export enum MessageKey {
    WARNING = 'WARNING',
    DANGER = 'DANGER'
}

export interface MessageValues {
    key: string;
    values?: Object[];
}

export interface WarningMessagesDTO {
    key: MessageKey;
    values: MessageValues;
}
