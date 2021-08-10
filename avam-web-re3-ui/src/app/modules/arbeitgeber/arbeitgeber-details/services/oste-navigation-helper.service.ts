import { Injectable } from '@angular/core';
import { NavigationService } from '@shared/services/navigation-service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';

@Injectable({
    providedIn: 'root'
})
export class OsteNavigationHelperService {
    private osteId: number;
    private zuweisungId: number;

    constructor(private navigationService: NavigationService, private interactionService: StesComponentInteractionService) {}

    setOsteId(id) {
        this.osteId = id;
    }

    setFirstLevelNav(extraParams?) {
        const queryParams = { osteId: this.osteId };
        let extendedParams = queryParams;
        if (extraParams) {
            extendedParams = {
                ...extendedParams,
                ...extraParams
            };
        }
        this.navigationService.showNavigationTreeRoute('./stellenangebote/stellenangebot', queryParams);
        this.navigationService.showNavigationTreeRoute('./stellenangebote/stellenangebot/vermittlungen', queryParams);
        this.navigationService.showNavigationTreeRoute('./stellenangebote/stellenangebot/matchingprofil', queryParams);
        this.navigationService.showNavigationTreeRoute('./stellenangebote/stellenangebot/bewirtschaftung', extendedParams);
        this.navigationService.showNavigationTreeRoute('./stellenangebote/stellenangebot/basisangaben', queryParams);
        this.navigationService.showNavigationTreeRoute('./stellenangebote/stellenangebot/bewerbung', queryParams);
        this.navigationService.showNavigationTreeRoute('./stellenangebote/stellenangebot/anforderungen', queryParams);
    }

    setSecondLevelNav(id) {
        this.zuweisungId = id;
        this.setFirstLevelNav();
        this.navigationService.showNavigationTreeRoute('./stellenangebote/stellenangebot/vermittlungen/bearbeiten', { osteId: this.osteId, zuweisungId: id });
    }

    hideSideNav() {
        this.navigationService.hideNavigationTreeRoute('./stellenangebote/stellenangebot', { osteId: this.osteId });
    }

    checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideSideNav();
            }
        });
    }

    resetOsteContext(id) {
        if (id !== +this.osteId) {
            this.hideSideNav();
            this.navigationService.hideNavigationTreeRoute('./stellenangebote/stellenangebot/vermittlungen/bearbeiten', { osteId: this.osteId, zuweisungId: this.zuweisungId });
            this.setOsteId(id);
        }
    }
}
