import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { WizardErfassenService } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/wizard/wizard-erfassen.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Step4OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step4-oste-erfassen-form/step4-oste-erfassen-form.component';
import { FormGroupDirective } from '@angular/forms';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { Unsubscribable } from 'oblique-reactive';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { takeUntil } from 'rxjs/operators';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { WarningMessages } from '@dtos/warningMessages';
import { OsteAnlegenParamDTO } from '@dtos/osteAnlegenParamDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { FacadeService } from '@shared/services/facade.service';
import KeyEnum = WarningMessages.KeyEnum;

@Component({
    selector: 'avam-step4-oste-erfassen-wizard',
    templateUrl: './step4-oste-erfassen-wizard.component.html',
    styleUrls: ['./step4-oste-erfassen-wizard.component.scss']
})
export class Step4OsteErfassenWizardComponent extends Unsubscribable implements OnInit, AfterViewInit {
    @ViewChild('formComponent') formComponent: Step4OsteErfassenFormComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public permissions: typeof Permissions = Permissions;
    spinnerChannel = 'stes4OsteErfassen';

    constructor(
        private resetDialogService: ResetDialogService,
        private wizardService: WizardErfassenService,
        private infopanelService: AmmInfopanelService,
        private fehlermeldungService: FehlermeldungenService,
        private osteDataService: OsteDataRestService,
        private unternehmenRestService: UnternehmenRestService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private facadeService: FacadeService
    ) {
        super();
    }

    ngOnInit() {
        if (!this.wizardService.osteErfassenParam.step3) {
            this.wizardService.navigateTo(1, this.wizardService.osteId || null);
        }

        this.wizardService.selectCurrentStep(3);
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.bewirtschaftung' });
    }

    public ngAfterViewInit() {
        if (this.wizardService.osteDTO) {
            this.formComponent.bewirtschaftungForm.controls.anzhalstellen.setValue(this.wizardService.osteDTO.gleicheOste);
        }
        if (this.wizardService.osteAnlegeParamDTO) {
            this.formComponent.bewirtschaftungForm.controls.meldepflicht.setValue(this.wizardService.osteAnlegeParamDTO.meldepflicht);
        }
    }

    cancel() {
        this.wizardService.navigateToOsteUebersicht();
    }

    canDeactivate() {
        return this.formComponent.bewirtschaftungForm.dirty;
    }

    public reset() {
        if (this.formComponent.bewirtschaftungForm.dirty) {
            this.fehlermeldungService.closeMessage();
            this.resetDialogService.reset(() => {
                this.formComponent.reset();
            });
        }
    }

    public movePrevious() {
        this.fehlermeldungService.closeMessage();
        this.wizardService.navigateTo(3, this.wizardService.osteId || null);
    }

    public save() {
        this.fehlermeldungService.closeMessage();
        if (this.formComponent.bewirtschaftungForm.valid) {
            this.wizardService.activateSpinner(this.spinnerChannel);
            this.unternehmenRestService
                .checkOsteStep(this.mapToDTO(), this.wizardService.currentStep)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperLongWarningMessages) => {
                        if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key !== KeyEnum.DANGER)) {
                            this.wizardService.osteErfassenParam.step4 = true;
                            this.facadeService.notificationService.success('common.message.datengespeichert');
                            this.formComponent.bewirtschaftungForm.markAsPristine();
                            this.router.navigate(['../../stellenangebot/bewirtschaftung'], { relativeTo: this.activatedRoute, queryParams: { osteId: response.data } });
                        }
                        this.wizardService.deactivateSpinner(this.spinnerChannel);
                    },
                    () => {
                        OrColumnLayoutUtils.scrollTop();
                        this.wizardService.deactivateSpinner(this.spinnerChannel);
                    }
                );
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.formComponent.ngForm.onSubmit(undefined);
            this.fehlermeldungService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    private mapToDTO(): OsteAnlegenParamDTO {
        const bewirtschaftung = this.formComponent.bewirtschaftungForm.controls;
        const currentUnternehmen: any = this.formComponent.bewirtschaftungForm.controls.stellenmeldung.value ? this.formComponent.getCurrentAuftraggeber() : null;
        return {
            ...this.wizardService.osteAnlegeParamDTO,
            stellenverantwortungDTO: bewirtschaftung.stellenverantwortung['benutzerObject'],
            meldepflicht: bewirtschaftung.meldepflicht.value,
            zuweisungMeldung: bewirtschaftung.meldungBeiVermittlung.value,
            zuweisungFreigeben: bewirtschaftung.vermittlungenFreigegeben.value,
            ravVorselektion: bewirtschaftung.vorselektion.value,
            zuweisungsstopp: bewirtschaftung.vermittlungsstop.value,
            anzahlStellen: bewirtschaftung.anzhalstellen.value,
            maxZuweisungen: bewirtschaftung.zuweisungMax.value,
            auftraggeber: bewirtschaftung.stellenmeldung.value,
            auftraggeberBurId: currentUnternehmen ? currentUnternehmen.burOrtEinheitId : null,
            auftraggeberId: currentUnternehmen ? currentUnternehmen.unternehmenId : null,
            bewirtschWeitereAngaben: bewirtschaftung.weitereAngaben.value,
            schlagworte: this.getSchlagwortFromMultiselect(),
            sperrfrist: bewirtschaftung.sperrfristbis.value,
            jobroomInternPublikation: this.formComponent.internButtons.getCurrentValue().isYesSelected,
            jobroomInternAnonym: this.formComponent.internButtons.getCurrentValue().isAnonym,
            jobroomExternPublikation: this.formComponent.externButtons.getCurrentValue().isYesSelected,
            jobroomExternAnonym: this.formComponent.externButtons.getCurrentValue().isAnonym,
            publEures: this.formComponent.euresButtons.getCurrentValue().isYesSelected,
            publEuresAnonym: this.formComponent.euresButtons.getCurrentValue().isAnonym,
            meldeDatum: bewirtschaftung.anmeldeDatum.value,
            gueltigkeitsDatum: bewirtschaftung.unbegrentz.value ? new Date(9999, 11, 31) : bewirtschaftung.gueltigkeitsDatum.value
        };
    }

    private getSchlagwortFromMultiselect() {
        return this.formComponent.schlagworteOptions
            .filter(item => !!item.value)
            .map(item => {
                return {
                    schlagwortId: item.id
                };
            });
    }
}
