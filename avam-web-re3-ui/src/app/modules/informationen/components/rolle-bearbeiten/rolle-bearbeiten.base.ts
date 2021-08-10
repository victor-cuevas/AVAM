import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ToolboxService } from '@app/shared';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { RolleService } from '@shared/services/rolle.service';
import { RolleDTO } from '@dtos/rolleDTO';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';

export abstract class RolleBearbeitenBase extends Unsubscribable implements OnDestroy, DeactivationGuarded {
    channel: string;
    protected rolleId: string;

    protected constructor(protected service: RolleService, route: ActivatedRoute, protected subtitle: string) {
        super();
        this.channel = `${subtitle}.channel`;
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        route.parent.params.subscribe((params: ParamMap) => {
            this.rolleId = params['rolleId'];
            this.initInfopanel();
            this.configureToolbox();
            this.loadData(this.rolleId);
            this.subscribeToLangChange();
        });
    }

    ngOnDestroy(): void {
        this.service.infoBarPanelService.sendLastUpdate(null);
        this.service.facade.fehlermeldungenService.closeMessage();
        this.service.facade.toolboxService.resetConfiguration();
        super.ngOnDestroy();
    }

    canDeactivate(): boolean {
        return false;
    }

    cancel(): void {
        this.service.navigateToSuchen(this.channel);
    }

    reset(): void {
        if (this.canDeactivate()) {
            this.service.facade.resetDialogService.reset(() => {
                this.service.facade.fehlermeldungenService.closeMessage();
                this.loadData(this.rolleId);
            });
        }
    }

    protected abstract loadData(rolleId: string): void;

    protected abstract print(): void;

    protected onLangChange(): void {
        this.initInfopanel();
    }

    protected updateInfobar(rolle: RolleDTO): void {
        this.service.infoBarPanelService.sendLastUpdate(rolle);
        this.service.infopanelService.updateInformation({
            title: 'benutzerverwaltung.label.rolle',
            secondTitle: rolle.code
        });
    }

    protected deactivateSpinnerAndScrollTop(): void {
        OrColumnLayoutUtils.scrollTop();
        this.service.facade.spinnerService.deactivate(this.channel);
    }

    private initInfopanel(): void {
        this.service.infopanelService.updateInformation({ subtitle: this.subtitle });
    }

    private subscribeToLangChange(): void {
        this.service.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.onLangChange());
    }

    private configureToolbox(): void {
        this.service.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.print());
        this.service.facade.toolboxService.sendConfiguration(ToolboxConfig.getRollenBearbeitenConfig(), this.channel);
    }
}
