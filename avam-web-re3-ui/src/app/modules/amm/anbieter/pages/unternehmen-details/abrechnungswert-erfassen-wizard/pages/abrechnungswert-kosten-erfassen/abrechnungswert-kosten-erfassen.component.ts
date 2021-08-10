import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AbrechnungswertKostenFormComponent } from '@app/modules/amm/anbieter/components/abrechnungswert-kosten-form/abrechnungswert-kosten-form.component';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AbrechnungswertErfassenWizardService } from '@app/shared/components/new/avam-wizard/abrechnungswert-erfassen-wizard.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'avam-abrechnungswert-kosten-erfassen',
    templateUrl: './abrechnungswert-kosten-erfassen.component.html'
})
export class AbrechnungswertKostenErfassenComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('abrechnungswertForm') abrechnungswertForm: AbrechnungswertKostenFormComponent;
    channel = 'abrechnungswert-kosten-erfassen';

    formData = null;
    toolboxSubscription: Subscription;
    constructor(
        private wizardService: AbrechnungswertErfassenWizardService,
        private facade: FacadeService,
        private anbieterRestService: AnbieterRestService,
        private infopanelService: AmmInfopanelService,
        private router: Router
    ) {
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();
        this.infopanelService.updateInformation({
            subtitle: 'amm.abrechnungen.subnavmenuitem.abrechnungswerterfassenkosten',
            hideInfobar: false
        });
    }

    ngAfterViewInit() {
        this.formData = this.wizardService.abrechnungswertParam;
        this.setupWizard();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    cancel() {
        this.router.navigate([`amm/anbieter/${this.wizardService.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/detail`], {
            queryParams: { vertragswertId: this.wizardService.vertragswertId, lvId: this.wizardService.leistungsvereinbarungId }
        });
    }

    reset() {
        this.abrechnungswertForm.reset();
    }

    berechnen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.checkEmptyFields();

        if (!this.abrechnungswertForm.formGroup.valid) {
            this.abrechnungswertForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.anbieterRestService.calculateAbrechnungswert(this.abrechnungswertForm.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.planundakqui.message.datenberechnet'));
                    this.formData = { ...this.formData, abrechnungswert: response.data, isCalculated: true };
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => this.deactivateSpinnerAndScrollToTop()
        );
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.checkEmptyFields();

        if (!this.abrechnungswertForm.formGroup.valid) {
            this.abrechnungswertForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.anbieterRestService.updateAbrechnungswert(this.abrechnungswertForm.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    this.wizardService.isWizardNext = true;
                    this.router.navigate([`/amm/anbieter/${this.wizardService.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/grunddaten`], {
                        queryParams: {
                            lvId: response.data.abrechnungswert.vertragswertObject.leistungsvereinbarungObject.leistungsvereinbarungId,
                            vertragswertId: response.data.abrechnungswert.vertragswertObject.vertragswertId,
                            abrechnungswertId: response.data.abrechnungswert.abrechnungswertId
                        }
                    });
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.toolboxSubscription.unsubscribe();
        this.facade.toolboxService.sendConfiguration([]);
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private checkEmptyFields() {
        if (!this.abrechnungswertForm.formGroup.controls.gesamtKosten.value) {
            this.abrechnungswertForm.formGroup.patchValue({ gesamtKosten: 0.0 });
        }
        if (!this.abrechnungswertForm.formGroup.controls.faelligAm.value) {
            this.abrechnungswertForm.formGroup.patchValue({ faelligAm: this.facade.formUtilsService.parseDate(this.formData.abrechnungswert.faelligkeitDatum) });
        }
    }

    private setupWizard() {
        const step = new Observable<boolean>(subscriber => {
            subscriber.next(true);
        });
        this.wizardService.setOnPreviousStep(step);
    }
}
