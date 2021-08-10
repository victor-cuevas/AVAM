import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FacadeService } from '@shared/services/facade.service';
import { Router } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { RolleErfassenWizardService } from '@shared/components/new/avam-wizard/rolle-erfassen-wizard.service';
import { RolleService } from '@shared/services/rolle.service';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';

@Component({
    selector: 'avam-rolle-erfassen-berechtigungen-page',
    templateUrl: './rolle-erfassen-berechtigungen-page.component.html'
})
export class RolleErfassenBerechtigungenPageComponent extends Unsubscribable implements AfterViewInit, OnInit, OnDestroy {
    observeClickActionSub: Subscription;
    berechtigungScopes: CodeDTO[] = [];

    /**
     * Should have a Observable for the async save or saving the state.
     *
     * @memberof PageErfassenComponent
     */
    constructor(
        public wizardService: RolleErfassenWizardService,
        protected service: RolleService,
        private facade: FacadeService,
        private router: Router,
        private infopanelService: AmmInfopanelService,
        private dataRestService: StesDataRestService
    ) {
        super();
    }

    ngOnInit() {
        this.facade.fehlermeldungenService.closeMessage();
        const step = new Observable<boolean>(subscriber => {
            this.storeEnteredData();
            subscriber.next(true);
        });

        this.wizardService.setOnPreviousStep(step);
    }

    ngAfterViewInit() {
        this.getData();
        this.configureToolbox();
        this.initInfopanel();
        this.subscribeToLangChange();
    }

    /**
     * Call the BE and update the data
     *
     * @memberof PageErfassenComponent
     */
    getData() {
        // check and implement
        this.facade.spinnerService.activate(this.wizardService.channel);
        this.service.data
            .getCode(DomainEnum.SCOPE)
            .pipe(finalize(() => this.service.facade.spinnerService.deactivate(this.wizardService.channel)))
            .subscribe(berechtigungScopes => {
                this.berechtigungScopes = berechtigungScopes;
            });
        this.facade.spinnerService.deactivate(this.wizardService.channel);
    }

    onBerechtigungSelection(scope: CodeDTO): void {
        // implement
    }
    /**
     * Check if the form is invalid
     *
     * @memberof PageErfassenComponent
     */
    submit() {
        this.facade.fehlermeldungenService.closeMessage();
        this.save();
    }

    /**
     * BE Call and saving state if necessary
     *
     * @memberof PageErfassenComponent
     */
    save() {
        // TODO check invalid
        this.facade.spinnerService.activate(this.wizardService.channel);
        this.storeEnteredData();
        // TODO call save
        this.facade.spinnerService.deactivate(this.wizardService.channel);
    }

    /**
     * Abbrechen logic
     *
     * @memberof PageErfassenComponent
     */
    cancel() {
        // implement
    }

    /**
     * Remove items from the infobar
     *
     * @memberof PageErfassenComponent
     */
    ngOnDestroy(): void {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        super.ngOnDestroy();
    }

    reset() {
        // implement
    }

    /**
     * Set the title in the infobar
     *
     * @memberof PageErfassenComponent
     */
    private initInfopanel() {
        this.updateInfoPanel();
    }

    private updateInfoPanel() {
        const label = this.facade.translateService.instant('benutzerverwaltung.topnavmenuitem.rolle');
        // TODO correct title
        const code = 'NEW';

        this.infopanelService.dispatchInformation({
            title: `${label} ${code}`,
            subtitle: 'benutzerverwaltung.subnavmenuitem.berechtigungen',
            hideInfobar: true
        });
    }

    private subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.updateInfoPanel();
        });
    }

    /**
     * Send configuration for the toolbox
     *
     * @memberof PageErfassenComponent
     */
    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.wizardService.channel);

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    private storeEnteredData(): void {
        // store the entered berechtugungen in the service
    }
}
