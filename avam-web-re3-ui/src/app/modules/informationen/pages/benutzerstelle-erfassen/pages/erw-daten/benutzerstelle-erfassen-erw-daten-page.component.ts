import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BenutzerstelleErfassenWizardService } from '@shared/components/new/avam-wizard/benutzerstelle-erfassen-wizard.service';
import { FacadeService } from '@shared/services/facade.service';
import { Router } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
// prettier-ignore
import { BenutzerstelleErweiterteDatenBearbeitenFormComponent } from
        '@modules/informationen/components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten-bearbeiten-form.component';
import { DomainEnum } from '@shared/enums/domain.enum';
import { SpracheEnum } from '@shared/enums/sprache.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { BenutzerstelleErweiterteDaten } from '@modules/informationen/components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { BenutzerstelleService } from '@shared/services/benutzerstelle.service';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { CodeDTO } from '@dtos/codeDTO';

@Component({
    selector: 'avam-benutzerstelle-erfassen-erw-daten-page',
    templateUrl: './benutzerstelle-erfassen-erw-daten-page.component.html'
})
export class BenutzerstelleErfassenErwDatenPageComponent extends Unsubscribable implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('dataForm') dataForm: BenutzerstelleErweiterteDatenBearbeitenFormComponent;

    data: BenutzerstelleErweiterteDaten;
    observeClickActionSub: Subscription;
    organisation: string;

    private deutsch: CodeDTO;

    /**
     * Should have a Observable for the async save or saving the state.
     *
     * @memberof PageErfassenComponent
     */
    constructor(
        public wizardService: BenutzerstelleErfassenWizardService,
        protected service: BenutzerstelleService,
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
        this.dataRestService.getCode(DomainEnum.SPRACHE).subscribe(
            spracheOptions => {
                this.deutsch = spracheOptions.find(el => el.code === SpracheEnum.DEUTSCH);
                if (!this.wizardService.benutzerstelleDTO || !this.wizardService.benutzerstelleDTO.arbeitsspracheId) {
                    this.wizardService.benutzerstelleDTO = { ...this.wizardService.benutzerstelleDTO, arbeitsspracheId: this.deutsch.codeId };
                }
                this.data = { dto: this.wizardService.benutzerstelleDTO, spracheOptions: spracheOptions.filter(el => el.code !== SpracheEnum.RAETOROMANISCH) };
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
        if (this.dataForm.formGroup.invalid) {
            this.dataForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }
        this.facade.spinnerService.activate(this.wizardService.channel);
        this.storeEnteredData();
        this.service.rest.create(this.dataForm.mapToDto(this.wizardService.benutzerstelleDTO)).subscribe(
            (response: BaseResponseWrapperLongWarningMessages) => {
                this.facade.spinnerService.deactivate(this.wizardService.channel);
                if (response.data) {
                    this.wizardService.displayLeaveConfirmation = false;
                    this.service.facade.notificationService.success('common.message.datengespeichert');
                    this.router.navigate([`/informationen/verzeichnisse/benutzerstelle/${response.data}/grunddaten`]);
                }
            },
            () => this.facade.spinnerService.deactivate(this.wizardService.channel)
        );
    }

    /**
     * Abbrechen logic
     *
     * @memberof PageErfassenComponent
     */
    cancel() {
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
        super.ngOnDestroy();
    }

    reset() {
        this.facade.resetDialogService.reset(() => {
            this.facade.fehlermeldungenService.closeMessage();
            this.dataForm.formGroup.reset({ kanton: this.wizardService.benutzerstelleDTO.plzObject.kantonsKuerzel, arbeitssprache: this.deutsch.codeId });
        });
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
        const label = this.facade.translateService.instant('verzeichnisse.subnavmenuitem.benutzerstelle');
        const code = this.wizardService.benutzerstelleDTO.code;

        this.infopanelService.dispatchInformation({
            title: `${label} ${code}`,
            subtitle: 'verzeichnisse.subnavmenuitem.benutzerstelleerweitert',
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
        // store the entered erw-daten in the service
        this.wizardService.benutzerstelleDTO = this.dataForm.mapToDto(this.wizardService.benutzerstelleDTO);
    }
}
