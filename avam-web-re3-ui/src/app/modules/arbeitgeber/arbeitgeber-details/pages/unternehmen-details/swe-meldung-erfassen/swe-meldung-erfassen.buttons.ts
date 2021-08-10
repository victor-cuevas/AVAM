import { Permissions } from '@shared/enums/permissions.enum';
import { SweMeldungErfassenComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/swe-meldung-erfassen/swe-meldung-erfassen.component';
import { SweStatusEnum } from '@shared/enums/domain-code/swe-status.enum';
import { AuthenticationService } from '@core/services/authentication.service';

export function getSweMeldungErfassenButtons(component: SweMeldungErfassenComponent, auth: AuthenticationService) {
    return [new AbbrechenButton(component, auth), new ZuruecksetzenButton(component, auth), new SpeichernButton(component, auth)];
}

export function getSweMeldungBearbeitenButtons(component: SweMeldungErfassenComponent, state: SweStatusEnum, auth: AuthenticationService, contextPermissions: string[]) {
    const availableButtons = [
        new AbbrechenButton(component, auth),
        new ZuruecksetzenButton(component, auth),
        new UeberarbeitenButton(component, auth),
        new ZuruecknehmenButton(component, auth),
        new KopierenButton(component, auth),
        new LoeschenButton(component, auth),
        new WiderrufButton(component, auth),
        new SpeichernButton(component, auth),
        new ErsetzenButton(component, auth),
        new FreigebenButton(component, auth)
    ];

    return availableButtons.filter(button => button.isVisibleInState(state) && button.hasUserPermissions(contextPermissions));
}
export abstract class SweMeldungActionButton {
    cssClasses = 'btn btn-secondary ml-1';
    abstract title: string;
    abstract permissions: Permissions[];

    constructor(protected readonly component: SweMeldungErfassenComponent, protected auth: AuthenticationService) {}

    hasUserPermissions(contextPermissions: string[]): boolean {
        return this.auth.hasAnyPermission(this.permissions, contextPermissions);
    }

    abstract isVisibleInState(state: SweStatusEnum): boolean;
    abstract onButtonClicked(): void;
}

class AbbrechenButton extends SweMeldungActionButton {
    readonly cssClasses = 'btn btn-link ml-1';
    readonly title = 'common.button.abbrechen';
    readonly permissions: Permissions[] = [];

    hasUserPermissions(contextPermissions: string[]): boolean {
        return true;
    }

    isVisibleInState(state: SweStatusEnum): boolean {
        return true;
    }

    onButtonClicked(): void {
        this.component.abbrechen();
    }
}

class ZuruecksetzenButton extends SweMeldungActionButton {
    readonly cssClasses = 'btn btn-link ml-1';
    readonly title = 'common.button.zuruecksetzen';
    readonly permissions: Permissions[] = [];

    hasUserPermissions(contextPermissions: string[]): boolean {
        return true;
    }

    isVisibleInState(state: SweStatusEnum): boolean {
        return state === SweStatusEnum.SWE_STATUS_PENDENT || state === SweStatusEnum.SWE_STATUS_MAHNUNG || state === SweStatusEnum.SWE_STATUS_INUEBERARBEITUNG;
    }

    onButtonClicked(): void {
        this.component.zuruecksetzen();
    }
}

class SpeichernButton extends SweMeldungActionButton {
    readonly cssClasses = 'btn btn-primary ml-1';
    readonly permissions: Permissions[] = [Permissions.ARBEITGEBER_SWE_MELDUNG_BEARBEITEN, Permissions.ARBEITGEBER_SWE_MELDUNG_ERFASSEN];
    readonly title = 'common.button.speichern';

    isVisibleInState(state: SweStatusEnum): boolean {
        return state === SweStatusEnum.SWE_STATUS_MAHNUNG || state === SweStatusEnum.SWE_STATUS_PENDENT || state === SweStatusEnum.SWE_STATUS_INUEBERARBEITUNG;
    }

    onButtonClicked(): void {
        this.component.save();
    }
}

class KopierenButton extends SweMeldungActionButton {
    readonly permissions: Permissions[] = [Permissions.ARBEITGEBER_SWE_MELDUNG_KOPIEREN];
    readonly title = 'common.button.kopieren';

    isVisibleInState(state: SweStatusEnum): boolean {
        if (this.component.isSweMeldungUngueltig() || !this.component.isUnternehmenAktiv()) {
            return false;
        }
        return (
            state === SweStatusEnum.SWE_STATUS_PENDENT ||
            state === SweStatusEnum.SWE_STATUS_MAHNUNG ||
            state === SweStatusEnum.SWE_STATUS_FREIGABEBEREIT ||
            state === SweStatusEnum.SWE_STATUS_INUEBERARBEITUNG ||
            state === SweStatusEnum.SWE_STATUS_FREIGEGEBEN
        );
    }

    onButtonClicked(): void {
        this.component.copy();
    }
}

class LoeschenButton extends SweMeldungActionButton {
    readonly permissions: Permissions[] = [Permissions.ARBEITGEBER_SWE_MELDUNG_LOESCHEN];
    readonly title = 'common.button.loeschen';

    isVisibleInState(state: SweStatusEnum): boolean {
        return state === SweStatusEnum.SWE_STATUS_PENDENT || state === SweStatusEnum.SWE_STATUS_INUEBERARBEITUNG || state === SweStatusEnum.SWE_STATUS_MAHNUNG;
    }

    onButtonClicked(): void {
        this.component.openDeleteModal();
    }
}

class WiderrufButton extends SweMeldungActionButton {
    readonly permissions: Permissions[] = [Permissions.ARBEITGEBER_SWE_MELDUNG_WIDERRUF];
    readonly title = 'kaeswe.button.widerruf';

    isVisibleInState(state: SweStatusEnum): boolean {
        if (this.component.isSweMeldungUngueltig()) {
            return false;
        }
        return state === SweStatusEnum.SWE_STATUS_MAHNUNG || state === SweStatusEnum.SWE_STATUS_INUEBERARBEITUNG || state === SweStatusEnum.SWE_STATUS_PENDENT;
    }

    onButtonClicked(): void {
        this.component.widerruf();
    }
}

class ZuruecknehmenButton extends SweMeldungActionButton {
    readonly permissions: Permissions[] = [Permissions.ARBEITGEBER_SWE_MELDUNG_ZURUECKNEHMEN];
    readonly title = 'common.button.zuruecknehmen';

    isVisibleInState(state: SweStatusEnum): boolean {
        return state === SweStatusEnum.SWE_STATUS_FREIGABEBEREIT;
    }

    onButtonClicked(): void {
        this.component.zuruecknehmen();
    }
}

class ErsetzenButton extends SweMeldungActionButton {
    readonly cssClasses = 'btn btn-primary ml-1';
    readonly permissions: Permissions[] = [Permissions.ARBEITGEBER_SWE_MELDUNG_ERSETZEN];
    readonly title = 'kaeswe.button.ersetzen';

    isVisibleInState(state: SweStatusEnum): boolean {
        return state === SweStatusEnum.SWE_STATUS_FREIGEGEBEN && this.isSwissArbeitgeber() && !this.hasNachfolger();
    }

    onButtonClicked(): void {
        this.component.ersetzen();
    }

    private isSwissArbeitgeber() {
        return this.component.unternehmenDetailsDTO.unternehmen.staat.iso2Code === 'CH';
    }

    private hasNachfolger() {
        return this.component.nachfolger.id > 0 && this.component.nachfolger.statusCode === SweStatusEnum.SWE_STATUS_FREIGEGEBEN;
    }
}

class UeberarbeitenButton extends SweMeldungActionButton {
    readonly permissions: Permissions[] = [Permissions.ARBEITGEBER_SWE_MELDUNG_UEBERARBEITEN];
    readonly title = 'kaeswe.button.ueberarbeiten';

    isVisibleInState(state: SweStatusEnum): boolean {
        return state === SweStatusEnum.SWE_STATUS_FREIGABEBEREIT;
    }

    onButtonClicked(): void {
        this.component.ueberarbeiten();
    }
}

class FreigebenButton extends SweMeldungActionButton {
    readonly cssClasses = 'btn btn-primary ml-1';
    readonly permissions: Permissions[] = [Permissions.ARBEITGEBER_SWE_MELDUNG_FREIGEBEN];
    readonly title = 'kaeswe.button.freigeben';

    isVisibleInState(state: SweStatusEnum): boolean {
        return state === SweStatusEnum.SWE_STATUS_FREIGABEBEREIT;
    }

    onButtonClicked(): void {
        this.component.freigeben();
    }
}
