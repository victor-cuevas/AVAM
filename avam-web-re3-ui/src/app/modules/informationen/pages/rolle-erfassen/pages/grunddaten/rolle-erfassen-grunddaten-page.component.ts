import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { FacadeService } from '@shared/services/facade.service';
import { Router } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { RolleErfassenWizardService } from '@shared/components/new/avam-wizard/rolle-erfassen-wizard.service';
import { RollenGrunddatenFormComponent, RollenGrunddatenFormData } from '@modules/informationen/components/rollen-grunddaten-form/rollen-grunddaten-form.component';
import { RolleService } from '@shared/services/rolle.service';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { finalize, map } from 'rxjs/operators';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';

@Component({
    selector: 'avam-rolle-erfassen-grunddaten-page',
    templateUrl: './rolle-erfassen-grunddaten-page.component.html'
})
export class RolleErfassenGrunddatenPageComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('dataForm') dataForm: RollenGrunddatenFormComponent;
    data: RollenGrunddatenFormData;
    observeClickActionSub: Subscription;

    /**
     * Should have a Observable for the async save or saving the state.
     *
     * @memberof PageErfassenComponent
     */
    constructor(
        public wizardService: RolleErfassenWizardService,
        private facade: FacadeService,
        private router: Router,
        private service: RolleService,
        private infopanelService: AmmInfopanelService
    ) {}

    ngOnInit() {
        this.facade.fehlermeldungenService.closeMessage();
        const step = new Observable<boolean>(subscriber => {
            this.submit(() => {
                this.storeEnteredData().then(stored => {
                    if (stored) {
                        this.wizardService.displayLeaveConfirmation = true;
                        subscriber.next(true);
                    }
                });
            });
        });

        this.wizardService.setOnNextStep(step);
    }

    ngAfterViewInit() {
        this.getData();
        this.configureToolbox();
        this.initInfopanel();
    }

    /**
     * Call the BE and update the data
     *
     * @memberof PageErfassenComponent
     */
    getData() {
        // check and implement
        this.facade.spinnerService.activate(this.wizardService.channel);
        forkJoin<CodeDTO[], CodeDTO[]>([this.service.data.getCode(DomainEnum.VOLLZUGSREGIONTYP), this.service.data.getCode(DomainEnum.BENUTZERSTELLETYP)])
            .pipe(finalize(() => this.service.facade.spinnerService.deactivate(this.wizardService.channel)))
            .subscribe(([vollzugsregiontyp, benutzerstellentyp]) => {
                this.data = {
                    vollzugsregiontyp,
                    benutzerstellentyp,
                    dto: this.wizardService.rolleDTO
                };
            });
    }

    /**
     * Check if the form is invalid
     *
     * @memberof PageErfassenComponent
     */
    submit(onDone?) {
        this.facade.fehlermeldungenService.closeMessage();

        // TODO check for invalid data form

        this.save(onDone);
    }

    reset() {
        // implement
    }

    /**
     * BE Call and saving state if necessary
     *
     * @memberof PageErfassenComponent
     */
    save(onDone?) {
        this.facade.spinnerService.activate(this.wizardService.channel);
        if (onDone) {
            onDone();
        }
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
    }

    /**
     * Set the title in the infobar
     *
     * @memberof PageErfassenComponent
     */
    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'benutzerverwaltung.topnavmenuitem.rolle',
            subtitle: 'benutzerverwaltung.subnavmenuitem.grunddaten',
            hideInfobar: true
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

    private storeEnteredData(): Promise<boolean> {
        // store the entered grunddaten in the service
        this.wizardService.rolleDTO = this.dataForm.mapToDto(this.wizardService.rolleDTO);
        return this.service.rest
            .validate(this.wizardService.rolleDTO)
            .pipe(
                map(dto => {
                    return !AbstractBaseForm.hasDangerWarning(dto.warning);
                })
            )
            .toPromise();
    }
}
