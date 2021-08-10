import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { KontaktpersonRestService } from '@app/core/http/kontaktperson-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { InfotagMassnahmeBeschreibungFormComponent } from '@app/modules/amm/infotag/components';
import { InfotagMassnahmeBeschreibungData } from '@app/modules/amm/infotag/components/infotag-massnahme-beschreibung-form/infotag-massnahme-beschreibung-form.component';
import { AmmInfotagHelperService } from '@app/modules/amm/infotag/services/amm-infotag-helper.service';
import { AmmInfotagRestService } from '@app/modules/amm/infotag/services/amm-infotag-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmInfotagMassnahmeWizardService } from '@app/shared/components/new/avam-wizard/amm-infotag-massnahme-wizard.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { forkJoin, Observable, Subscription } from 'rxjs';

@Component({
    selector: 'avam-infotag-massnahme-beschreibung-erfassen',
    templateUrl: './infotag-massnahme-beschreibung-erfassen.component.html',
    styleUrls: ['./infotag-massnahme-beschreibung-erfassen.component.scss'],
    providers: [AmmInfotagHelperService]
})
export class InfotagMassnahmeBeschreibungErfassenComponent implements OnInit, OnDestroy {
    @ViewChild('beschreibungForm') beschreibungForm: InfotagMassnahmeBeschreibungFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    beschreibungData: InfotagMassnahmeBeschreibungData;
    toolboxSubscription: Subscription;
    channel = 'infotag-massnahme-beschreibung-erfassen';
    unternehmen: UnternehmenDTO;
    switzerland: StaatDTO;

    constructor(
        public wizardService: AmmInfotagMassnahmeWizardService,
        private toolboxService: ToolboxService,
        private infopanelService: AmmInfopanelService,
        private fehlermeldungenService: FehlermeldungenService,
        private spinnerService: SpinnerService,
        private ammInfotagRest: AmmInfotagRestService,
        private router: Router,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private dbTranslate: DbTranslateService,
        private stesRestService: StesDataRestService,
        private kontaktpersonRestService: KontaktpersonRestService,
        private infotagHelper: AmmInfotagHelperService
    ) {
        const step = new Observable<boolean>(subscriber => {
            this.wizardService.beschreibungForm = this.beschreibungForm.formGroup.value;
            subscriber.next(true);
        });

        this.wizardService.setOnPreviousStep(step);
    }

    ngOnInit() {
        this.wizardService.navigateInside = false;
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();
        this.setData();
        this.getData();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, undefined, false);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    setData() {
        this.beschreibungData = {
            dto: this.wizardService.massnahmeDto,
            spracheOptions: this.wizardService.spracheOptions,
            form: this.wizardService.beschreibungForm
        };
        this.setupInfobar();
    }

    getData() {
        this.spinnerService.activate(this.channel);
        forkJoin(
            this.stesRestService.getStaatSwiss(),
            this.kontaktpersonRestService.getKontaktpersonenByUnternehmenId(this.wizardService.getMassnahmeUnternehmen().unternehmenId)
        ).subscribe(
            ([swiss, kontakpersonen]) => {
                this.switzerland = swiss;
                this.infotagHelper.checkDfOrtAdresse(this.beschreibungData.dto.durchfuehrungsortObject, this.switzerland);
                this.infotagHelper.checkKontaktperson(this.beschreibungForm.mapToDto(), kontakpersonen.data);
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    setupInfobar() {
        const title = this.wizardService ? this.dbTranslate.translateWithOrder(this.wizardService.massnahmeDto, 'titel') : undefined;
        const erfassenString = this.translateService.instant('amm.nutzung.alttext.erfassen');
        const secondTitleErfassen = `${title} ${erfassenString}`;

        this.infopanelService.updateInformation({
            title: 'amm.infotag.label.infotagMassnahme',
            secondTitle: secondTitleErfassen,
            subtitle: 'amm.infotag.subnavmenuitem.beschreibungDurchfuerungsort'
        });
        this.unternehmen = this.wizardService.getMassnahmeUnternehmen();
        this.infopanelService.appendToInforbar(this.panelTemplate);
    }

    cancel() {
        this.wizardService.cancel();
    }

    reset() {
        if (this.beschreibungForm.formGroup.dirty) {
            this.beschreibungForm.reset();
        }
    }

    previous() {
        this.wizardService.navigateInside = true;
        this.wizardService.movePrev();
    }

    finish() {
        this.fehlermeldungenService.closeMessage();

        if (this.beschreibungForm.formGroup.invalid) {
            this.beschreibungForm.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.spinnerService.activate(this.channel);

        this.ammInfotagRest.saveInfotagMassnahmeOrtBeschreibung(this.beschreibungForm.mapToDto()).subscribe(
            res => {
                if (res.data) {
                    this.wizardService.wizardCompleted = true;
                    this.router.navigate([`amm/infotag/massnahme/${res.data.massnahmeId}/grunddaten`]);
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    ngOnDestroy() {
        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }
        this.infopanelService.updateInformation({
            secondTitle: undefined
        });
        this.infopanelService.removeFromInfobar(this.panelTemplate);
    }
}
