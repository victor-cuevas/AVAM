import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BenutzerstelleService } from '@shared/services/benutzerstelle.service';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';

export abstract class BenutzerstelleBearbeitenBase extends Unsubscribable implements OnDestroy {
    channel: string;
    protected benutzerstelleId: number;

    protected constructor(protected service: BenutzerstelleService, route: ActivatedRoute, protected subtitle: string) {
        super();
        this.channel = `${subtitle}.channel`;
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        route.parent.params.subscribe((params: ParamMap) => {
            this.benutzerstelleId = parseInt(params['benutzerstelleId']);
            this.initInfopanel();
            this.configureToolbox();
            this.loadFormData(this.benutzerstelleId);
            this.subscribeToLangChange();
        });
    }

    ngOnDestroy(): void {
        this.service.facade.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    protected abstract loadFormData(benutzerstelleId: number): void;

    protected deactivateSpinnerAndScrollTop(): void {
        OrColumnLayoutUtils.scrollTop();
        this.service.facade.spinnerService.deactivate(this.channel);
    }

    private initInfopanel(): void {
        this.service.infopanelService.updateInformation({ subtitle: this.subtitle });
    }

    private subscribeToLangChange(): void {
        this.service.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.initInfopanel();
        });
    }

    private configureToolbox(): void {
        this.service.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => PrintHelper.print());
        this.service.facade.toolboxService.sendConfiguration(ToolboxConfig.getBenutzerstelleBearbeitenConfig(), this.channel);
    }
}
