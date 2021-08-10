import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { InfotagMassnahmeGrunddatenFormComponent } from '@app/modules/amm/infotag/components';
import { InfotagMassnahmeGrunddatenData } from '@app/modules/amm/infotag/components/infotag-massnahme-grunddaten-form/infotag-massnahme-grunddaten-form.component';
import { AmmInfotagRestService } from '@app/modules/amm/infotag/services/amm-infotag-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmInfotagMassnahmeWizardService } from '@app/shared/components/new/avam-wizard/amm-infotag-massnahme-wizard.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Observable, Subscription } from 'rxjs';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';

@Component({
    selector: 'avam-infotag-massnahme-grunddaten-erfassen',
    templateUrl: './infotag-massnahme-grunddaten-erfassen.component.html',
    styleUrls: ['./infotag-massnahme-grunddaten-erfassen.component.scss']
})
export class InfotagMassnahmeGrunddatenErfassenComponent implements OnInit, OnDestroy {
    @ViewChild('grunddatenForm') grunddatenForm: InfotagMassnahmeGrunddatenFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    grunddatenData: InfotagMassnahmeGrunddatenData;
    toolboxSubscription: Subscription;
    channel = 'infotag-massnahme-grunddaten-erfassen';

    constructor(
        public wizardService: AmmInfotagMassnahmeWizardService,
        private stesRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private ammInfotagRest: AmmInfotagRestService,
        private fehlermeldungenService: FehlermeldungenService
    ) {
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;

        const step = new Observable<boolean>(subscriber => {
            subscriber.next(true);
        });

        this.wizardService.setOnNextStep(step);
    }

    ngOnInit() {
        this.wizardService.navigateInside = false;
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();
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

    getData() {
        this.spinnerService.activate(this.channel);

        const init = !(this.wizardService.massnahmeDto && this.wizardService.massnahmeDto.massnahmeId > 0);
        const fetchObservable = init ? this.ammInfotagRest.getNewInfotagMassnahme() : this.ammInfotagRest.getInfotagMassnahme(this.wizardService.massnahmeDto.massnahmeId);

        forkJoin(this.stesRestService.getCode(DomainEnum.SPRACHE), fetchObservable).subscribe(
            ([spracheOptions, dto]) => {
                this.wizardService.massnahmeDto = dto.data;
                this.wizardService.spracheOptions = spracheOptions.filter(el => el.code !== SpracheEnum.RAETOROMANISCH);
                this.wizardService.grunddatenForm = this.grunddatenForm.formGroup;
                this.grunddatenData = { dto: this.wizardService.massnahmeDto, spracheOptions: this.wizardService.spracheOptions };
                this.setupInfobar();

                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    setupInfobar() {
        this.infopanelService.dispatchInformation({
            title: 'amm.infotag.titel.infotagMassnahmeErfassen',
            subtitle: 'amm.infotag.subnavmenuitem.grunddaten'
        });
        this.wizardService.infobarKurzel = this.setInfobarData(this.wizardService.massnahmeDto);
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    setInfobarData(dto: MassnahmeDTO): string {
        if (dto && dto.produktObject && dto.produktObject.elementkategorieAmtObject) {
            return dto.produktObject.elementkategorieAmtObject.organisation + '-';
        }

        return '';
    }

    cancel() {
        this.wizardService.cancel();
    }

    reset() {
        this.grunddatenForm.reset();
    }

    next() {
        this.fehlermeldungenService.closeMessage();

        if (this.grunddatenForm.formGroup.invalid) {
            this.grunddatenForm.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.spinnerService.activate(this.channel);

        this.ammInfotagRest.saveInfotagMassnahme(this.grunddatenForm.mapToDto()).subscribe(
            res => {
                if (res.data) {
                    if (this.wizardService.beschreibungForm) {
                        this.compareAnbieter({ ...res.data }, { ...this.wizardService.massnahmeDto });
                    }
                    this.wizardService.massnahmeDto = res.data;
                    this.wizardService.navigateInside = true;
                    this.wizardService.moveNext();
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    compareAnbieter(newDto: MassnahmeDTO, oldDto: MassnahmeDTO) {
        if (newDto.ammAnbieterObject.unternehmenId !== oldDto.ammAnbieterObject.unternehmenId) {
            this.wizardService.beschreibungForm = undefined;
        }
    }

    ngOnDestroy() {
        this.toolboxSubscription.unsubscribe();
    }
}
