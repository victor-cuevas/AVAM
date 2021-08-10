import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BenutzerstelleErfassenWizardService } from '@shared/components/new/avam-wizard/benutzerstelle-erfassen-wizard.service';
import { FacadeService } from '@shared/services/facade.service';
import { Router } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { BenutzerstelleGrunddatenFormComponent } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten-form.component';
import { BenutzerstelleGrunddaten } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten';
import { DomainEnum } from '@shared/enums/domain.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FormGroup } from '@angular/forms';
import { BenutzerstelleService } from '@shared/services/benutzerstelle.service';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { map } from 'rxjs/operators';

@Component({
    selector: 'avam-benutzerstelle-erfassen-grunddaten-page',
    templateUrl: './benutzerstelle-erfassen-grunddaten-page.component.html'
})
export class BenutzerstelleErfassenGrunddatenPageComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('dataForm') dataForm: BenutzerstelleGrunddatenFormComponent;

    data: BenutzerstelleGrunddaten;
    observeClickActionSub: Subscription;

    /**
     * Should have a Observable for the async save or saving the state.
     *
     * @memberof PageErfassenComponent
     */
    constructor(
        public wizardService: BenutzerstelleErfassenWizardService,
        private facade: FacadeService,
        private router: Router,
        private infopanelService: AmmInfopanelService,
        private service: BenutzerstelleService
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
        this.service.dataRest.getCode(DomainEnum.BENUTZERSTELLETYP).subscribe(
            benutzerstelleTyp => {
                this.data = { dto: this.wizardService.benutzerstelleDTO, benutzerstelleTypeOptions: benutzerstelleTyp };
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            }
        );
    }

    /**
     * Check if the form is invalid
     *
     * @memberof PageErfassenComponent
     */
    submit(onDone?) {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.dataForm.formGroup.invalid) {
            this.dataForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.save(onDone);
    }

    reset() {
        if (this.wizardService.displayLeaveConfirmation || this.dataForm.formGroup.dirty) {
            this.service.facade.resetDialogService.reset(() => {
                this.service.facade.fehlermeldungenService.closeMessage();
                this.dataForm.formGroup.reset();
                this.wizardService.displayLeaveConfirmation = false;
            });
        }
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
        if (this.dataForm.formGroup.dirty) {
            this.wizardService.displayLeaveConfirmation = true;
        }
        this.router.navigate(['/home']);
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
            title: 'verzeichnisse.topnavmenuitem.benutzerstelleerfassen',
            subtitle: 'verzeichnisse.subnavmenuitem.benutzerstellegrunddaten',
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
        let valid = true;
        this.wizardService.benutzerstelleDTO = this.dataForm.mapToDto(this.wizardService.benutzerstelleDTO);
        return this.service.rest
            .validate(this.wizardService.benutzerstelleDTO)
            .pipe(
                map(dto => {
                    this.wizardService.benutzerstelleDTO = dto.data;
                    return !AbstractBaseForm.hasDangerWarning(dto.warning);
                })
            )
            .toPromise();
    }
}
