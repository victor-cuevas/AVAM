import { first, takeUntil } from 'rxjs/operators';
import { AMMPaths } from '@shared/enums/stes-navigation-paths.enum';
import { OnDestroy, OnInit } from '@angular/core';
import { Unsubscribable } from 'oblique-reactive';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AmmMassnahmenCode } from '@shared/enums/domain-code/amm-massnahmen-code.enum';
import { FacadeService } from '@shared/services/facade.service';

export abstract class AmmCloseableAbstract extends Unsubscribable implements OnInit, OnDestroy, DeactivationGuarded {
    stesId: string;
    ammEntscheidTypeCode: AmmMassnahmenCode;

    constructor(protected facade: FacadeService, protected router: Router, protected interactionService: StesComponentInteractionService) {
        super();
    }

    ngOnInit() {
        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    closeComponent(message) {
        if (this.isOurLabel(message)) {
            if (this.canDeactivate()) {
                this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
                    if (okClicked) {
                        this.hideNavigationTreeRoute();
                    }
                });
            } else {
                this.hideNavigationTreeRoute();
            }
            this.cancel();
        }
    }

    cancel() {
        if (this.isOurUrl()) {
            this.router.navigate([`stes/details/${this.stesId}/amm/uebersicht`]);
        }
    }

    abstract canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
    abstract isOurLabel(message): boolean;
    abstract isOurUrl(): boolean;

    private hideNavigationTreeRoute() {
        this.facade.navigationService.hideNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode));
    }
}
