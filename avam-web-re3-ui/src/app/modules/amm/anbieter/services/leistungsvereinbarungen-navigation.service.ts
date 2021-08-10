import { Injectable } from '@angular/core';
import { FacadeService } from '@app/shared/services/facade.service';

@Injectable()
export class LeistungsvereinbarungenNavigationService {
    private abrechnungswertIds: number[] = [];

    constructor(private facade: FacadeService) {}

    setLeistungsvereinbarungStaticNavigation(lvId: number) {
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung', { lvId });
    }

    removeLeistungsvereinbarungStaticNavigation() {
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung');
    }

    setVertragswertStaticNavigation(vertragswertId: number, lvId: number) {
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert', { vertragswertId, lvId });
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/detail', { vertragswertId, lvId });
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/controllingwerte', { vertragswertId, lvId });
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/asal-daten', { vertragswertId, lvId });
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte', { vertragswertId, lvId });
    }

    setVertragswertDynamicNavigation(vertragswertId: number, lvId: number, abrechnungswertId: number) {
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert', {
            vertragswertId,
            lvId,
            abrechnungswertId
        });
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/grunddaten', {
            vertragswertId,
            lvId,
            abrechnungswertId
        });
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/kosten', {
            vertragswertId,
            lvId,
            abrechnungswertId
        });
        this.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/kostenaufteilung', {
            vertragswertId,
            lvId,
            abrechnungswertId
        });
    }

    removeVertragswertStaticNavigation() {
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert');
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/detail');
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/controllingwerte');
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/asal-daten');
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte');
    }

    removeVertragswertDynamicNavigation() {
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert');
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/grunddaten');
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/kosten');
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/kostenaufteilung');
    }

    setTeilzahlungswertStaticNavigation(vertragswertId: number, lvId: number) {
        const tzwPath = './leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte';
        this.showNavigationTreeRoute(tzwPath, {
            vertragswertId,
            lvId
        });
    }

    removeTeilzahlungswertStaticNavigation() {
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte');
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/teilzahlungswert');
    }

    private showNavigationTreeRoute(path: string, queryParams?: any): void {
        this.facade.navigationService.showNavigationTreeRoute(path, queryParams);
    }
}
