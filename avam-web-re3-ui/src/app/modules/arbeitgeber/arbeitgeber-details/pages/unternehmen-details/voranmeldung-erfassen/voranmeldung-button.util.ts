import { VoranmeldungKaeDTO } from '@dtos/voranmeldungKaeDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { KurzarbeitEntscheidEnum } from '@shared/enums/domain-code/kurzarbeit-entscheid.enum';
import { KurzarbeitStatusEnum } from '@shared/enums/domain-code/kurzarbeit-status.enum';

export enum VoranmeldungButtonEnum {
    SPEICHERN = 'common.button.speichern',
    ZURUECKSETZEN = 'common.button.zuruecksetzen',
    KOPIEREN = 'common.button.kopieren',
    LOESCHEN = 'common.button.loeschen',
    ZURUECKNEHMEN = 'common.button.zuruecknehmen',
    ERSETZEN = 'kaeswe.button.ersetzen',
    UEBERARBEITEN = 'common.button.ueberarbeiten',
    FREIGEBEN = 'common.button.freigeben',
    ABBRECHEN = 'common.button.abbrechen'
}

export enum NgClassEnum {
    PRIMARY = 'btn-primary',
    SECONDARY = 'btn-secondary',
    LINK = 'btn-link'
}

export interface VoranmeldungButton {
    class: string;
    isVisible: boolean;
    key: VoranmeldungButtonEnum;
    action: any;
    permissions: string[];
}

export interface VoranmeldungButtonAction {
    key: VoranmeldungButtonEnum;
    action: any;
}

export class VoranmeldungButtonUtil {
    private static readonly PENDENT_MAHNUNG_INUEBERARBEITUNG = [VoranmeldungButtonEnum.ZURUECKSETZEN, VoranmeldungButtonEnum.SPEICHERN, VoranmeldungButtonEnum.LOESCHEN];
    private static readonly FREIBABEBEREIT = [VoranmeldungButtonEnum.FREIGEBEN, VoranmeldungButtonEnum.ZURUECKNEHMEN, VoranmeldungButtonEnum.UEBERARBEITEN];
    private readonly voranmeldung: VoranmeldungKaeDTO;
    private readonly unternehmenAktivStatus: number;
    private readonly nachfolgerId: number;

    constructor(voranmeldung: VoranmeldungKaeDTO, aktivStatusCodeId: number, nachfolgerId: number) {
        this.voranmeldung = voranmeldung;
        this.unternehmenAktivStatus = aktivStatusCodeId;
        this.nachfolgerId = nachfolgerId;
    }

    initButtons(actions: VoranmeldungButtonAction[]): VoranmeldungButton[] {
        return [...this.initLinkButtons(actions), ...this.initSecondaryButtons(actions), ...this.initPrimaryButtons(actions)];
    }

    private initLinkButtons(actions: VoranmeldungButtonAction[]): VoranmeldungButton[] {
        return [
            {
                class: NgClassEnum.LINK,
                isVisible: this.showButton(VoranmeldungButtonEnum.ABBRECHEN),
                permissions: [],
                key: VoranmeldungButtonEnum.ABBRECHEN,
                action: () => this.doAction(actions, VoranmeldungButtonEnum.ABBRECHEN)
            } as VoranmeldungButton,
            {
                class: NgClassEnum.LINK,
                isVisible: this.showButton(VoranmeldungButtonEnum.ZURUECKSETZEN),
                permissions: [Permissions.ARBEITGEBER_KAE_VORANMELDUNG_BEARBEITEN, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_LOESCHEN],
                key: VoranmeldungButtonEnum.ZURUECKSETZEN,
                action: () => this.doAction(actions, VoranmeldungButtonEnum.ZURUECKSETZEN)
            } as VoranmeldungButton
        ];
    }

    private initSecondaryButtons(actions: VoranmeldungButtonAction[]): VoranmeldungButton[] {
        return [
            {
                class: NgClassEnum.SECONDARY,
                isVisible: this.showButton(VoranmeldungButtonEnum.KOPIEREN),
                permissions: [Permissions.ARBEITGEBER_KAE_VORANMELDUNG_KOPIEREN],
                key: VoranmeldungButtonEnum.KOPIEREN,
                action: () => this.doAction(actions, VoranmeldungButtonEnum.KOPIEREN)
            } as VoranmeldungButton,
            {
                class: NgClassEnum.SECONDARY,
                isVisible: this.showButton(VoranmeldungButtonEnum.LOESCHEN),
                permissions: [Permissions.ARBEITGEBER_KAE_VORANMELDUNG_LOESCHEN],
                key: VoranmeldungButtonEnum.LOESCHEN,
                action: () => this.doAction(actions, VoranmeldungButtonEnum.LOESCHEN)
            } as VoranmeldungButton,
            {
                class: NgClassEnum.SECONDARY,
                isVisible: this.showButton(VoranmeldungButtonEnum.ZURUECKNEHMEN),
                permissions: [Permissions.ARBEITGEBER_KAE_VORANMELDUNG_ZURUECKNEHMEN],
                key: VoranmeldungButtonEnum.ZURUECKNEHMEN,
                action: () => this.doAction(actions, VoranmeldungButtonEnum.ZURUECKNEHMEN)
            } as VoranmeldungButton,
            {
                class: NgClassEnum.SECONDARY,
                isVisible: this.showButton(VoranmeldungButtonEnum.UEBERARBEITEN),
                permissions: [Permissions.ARBEITGEBER_KAE_VORANMELDUNG_UEBERARBEITEN],
                key: VoranmeldungButtonEnum.UEBERARBEITEN,
                action: () => this.doAction(actions, VoranmeldungButtonEnum.UEBERARBEITEN)
            } as VoranmeldungButton
        ];
    }

    private initPrimaryButtons(actions: VoranmeldungButtonAction[]): VoranmeldungButton[] {
        return [
            {
                class: NgClassEnum.PRIMARY,
                isVisible: this.showButton(VoranmeldungButtonEnum.ERSETZEN),
                permissions: [Permissions.ARBEITGEBER_KAE_VORANMELDUNG_ERSETZEN],
                key: VoranmeldungButtonEnum.ERSETZEN,
                action: () => this.doAction(actions, VoranmeldungButtonEnum.ERSETZEN)
            } as VoranmeldungButton,
            {
                class: NgClassEnum.PRIMARY,
                isVisible: this.showButton(VoranmeldungButtonEnum.FREIGEBEN),
                permissions: [Permissions.ARBEITGEBER_KAE_VORANMELDUNG_FREIGEBEN],
                key: VoranmeldungButtonEnum.FREIGEBEN,
                action: () => this.doAction(actions, VoranmeldungButtonEnum.FREIGEBEN)
            } as VoranmeldungButton,
            {
                class: NgClassEnum.PRIMARY,
                isVisible: this.showButton(VoranmeldungButtonEnum.SPEICHERN),
                permissions: [Permissions.ARBEITGEBER_KAE_VORANMELDUNG_BEARBEITEN],
                key: VoranmeldungButtonEnum.SPEICHERN,
                action: () => this.doAction(actions, VoranmeldungButtonEnum.SPEICHERN)
            } as VoranmeldungButton
        ];
    }

    private showButton(key: VoranmeldungButtonEnum): boolean {
        const code: string = this.voranmeldung.statusObject.code.trim();
        if (KurzarbeitStatusEnum.KAE_STATUS_ERSETZT !== code && key === VoranmeldungButtonEnum.KOPIEREN) {
            return this.showKopieren();
        } else {
            switch (code) {
                case KurzarbeitStatusEnum.KAE_STATUS_PENDENT:
                case KurzarbeitStatusEnum.KAE_STATUS_MAHNUNG:
                case KurzarbeitStatusEnum.KAE_STATUS_INUEBERARBEITUNG:
                    return VoranmeldungButtonUtil.PENDENT_MAHNUNG_INUEBERARBEITUNG.includes(key);
                case KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT:
                    return VoranmeldungButtonUtil.FREIBABEBEREIT.includes(key);
                case KurzarbeitStatusEnum.KAE_STATUS_FREIGEGEBEN:
                    return key === VoranmeldungButtonEnum.ERSETZEN && this.isUnternehmenAktiv() && this.hatKeineNachfolger();
                default:
                    return false;
            }
        }
    }

    private showKopieren(): boolean {
        return (
            this.isUnternehmenAktiv() && (!this.voranmeldung.entscheidKaeObject || this.voranmeldung.entscheidKaeObject.code !== KurzarbeitEntscheidEnum.KAE_ENTSCHEID_UNGUELTIG)
        );
    }

    private isUnternehmenAktiv(): boolean {
        return this.voranmeldung.betriebsabteilungObject.unternehmenObject.statusObject.codeId === this.unternehmenAktivStatus;
    }

    private doAction(actions: VoranmeldungButtonAction[], key: VoranmeldungButtonEnum): void {
        const buttonAction: VoranmeldungButtonAction = actions.find(action => action.key === key);
        if (buttonAction) {
            buttonAction.action();
        }
    }

    private hatKeineNachfolger(): boolean {
        return !this.nachfolgerId || this.nachfolgerId < 1;
    }
}
