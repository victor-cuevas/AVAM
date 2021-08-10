import { Component, ViewChild, TemplateRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { BewBeschreibungFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { AmmBeschaeftigungseinheitErfassenWizardService } from '@app/shared';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { Router } from '@angular/router';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Component({
    selector: 'avam-bew-beschaeftigungseinheit-beschreibung-erfassen',
    templateUrl: './bew-beschaeftigungseinheit-beschreibung-erfassen.component.html'
})
export class BewBeschaeftigungseinheitBeschreibungErfassenComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('beschreibungFormComponent') beschreibungFormComponent: BewBeschreibungFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    beschreibungData: any;
    observeClickActionSub: Subscription;
    langSubscription: Subscription;
    organisationInfoBar: string;
    standortTitel: string;
    zulassungstyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
    permissions: typeof Permissions = Permissions;
    dfeId: number;

    constructor(
        public wizardService: AmmBeschaeftigungseinheitErfassenWizardService,
        private infopanelService: AmmInfopanelService,
        private facade: FacadeService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private router: Router,
        private ammHelper: AmmHelper
    ) {}

    ngOnInit() {
        const nextStep = new Observable<boolean>(subscriber => {
            this.submit(() => {
                subscriber.next(true);
            });
        });
        const previousStep = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            this.wizardService.beschreibungDTOState = this.beschreibungFormComponent.mapToDTO(this.beschreibungData.beschreibungDto);
            this.wizardService.erfassungsspracheIdBeschreibungState = this.beschreibungFormComponent.formGroup.controls.erfassungssprache.value;
            subscriber.next(true);
        });

        this.wizardService.setOnNextStep(nextStep);
        this.wizardService.setOnPreviousStep(previousStep);
    }

    ngAfterViewInit() {
        this.getData();
        this.configureToolbox();
        this.initInfopanel();
        this.updateSecondLabel();
        this.appendToInforbar();
        this.wizardService.isWizardNext = false;

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.updateSecondLabel();
            this.appendToInforbar();
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getBeBeschreibung(this.wizardService.beId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getCode(DomainEnum.SPRACHKENNTNISSE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.stesDataRestService.getCode(DomainEnum.BERUFSFUNKTION),
            this.stesDataRestService.getCode(DomainEnum.STESHANDLUNGSFELD)
        ]).subscribe(
            ([beschreibungResponse, spracheResponse, sparchkenntnisseResponse, ausbildungsniveauResponse, berufsfunktionResponse, steshandlungsfeldResponse]) => {
                let isFirstEntry = true;
                let erfassungsspracheIdBeschreibungState: number;
                let beschreibungDto = beschreibungResponse.data;

                if (this.wizardService.erfassungsspracheIdBeschreibungState) {
                    erfassungsspracheIdBeschreibungState = this.wizardService.erfassungsspracheIdBeschreibungState;
                    isFirstEntry = false;
                }

                if (this.wizardService.beschreibungDTOState) {
                    beschreibungDto = this.wizardService.beschreibungDTOState;
                    beschreibungDto.ojbVersion = beschreibungResponse.data.ojbVersion;
                    isFirstEntry = false;
                }

                this.beschreibungData = {
                    beschreibungDto,
                    erfassungsspracheOptions: spracheResponse,
                    spracheOptions: spracheResponse,
                    muendlichOptions: sparchkenntnisseResponse,
                    schriftlichOptions: sparchkenntnisseResponse,
                    ausbildungsniveauOptions: ausbildungsniveauResponse,
                    funktionInitialCodeList: berufsfunktionResponse,
                    beurteilungskriterienOptions: steshandlungsfeldResponse,
                    erfassungsspracheIdBeschreibungState,
                    isFirstEntry
                };

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            }
        );
    }

    submit(onDone?) {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.beschreibungFormComponent.formGroup.invalid) {
            this.beschreibungFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save(onDone);
    }

    save(onDone?) {
        this.facade.spinnerService.activate(this.wizardService.channel);

        this.bewirtschaftungRestService.saveBeBeschreibung(this.beschreibungFormComponent.mapToDTO(this.beschreibungData.beschreibungDto), this.wizardService.beId).subscribe(
            response => {
                if (response.data) {
                    this.wizardService.isWizardNext = true;
                    this.wizardService.beschreibungDTOState = undefined;
                    this.wizardService.erfassungsspracheIdBeschreibungState = this.beschreibungFormComponent.formGroup.controls.erfassungssprache.value;

                    if (onDone) {
                        onDone();
                    }
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            }
        );
    }

    cancel() {
        this.router.navigate(
            [
                `amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/standorte/standort/${
                    this.wizardService.isPraktikumsstelle ? 'praktikumsstellen' : 'arbeitsplatzkategorien'
                }`
            ],
            {
                queryParams: { massnahmeId: this.wizardService.massnahmeId, dfeId: this.wizardService.dfeId }
            }
        );
    }

    ngOnDestroy(): void {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.langSubscription.unsubscribe();

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

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

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: this.wizardService.isPraktikumsstelle ? 'amm.massnahmen.label.praktikumsstelle' : 'amm.massnahmen.label.arbeitsplatzkategorie',
            subtitle: 'amm.massnahmen.subnavmenuitem.beschreibung'
        });
    }

    private updateSecondLabel() {
        const beTitel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.beTitelObject, 'titel');
        const erfassenLabel = this.facade.translateService.instant('amm.nutzung.alttext.erfassen');

        this.infopanelService.updateInformation({
            secondTitle: `${beTitel} ${erfassenLabel}`
        });
    }

    private appendToInforbar() {
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
            this.wizardService.savedElementkategorieAmtObject,
            this.wizardService.savedStrukturelementGesetzObject
        );
        this.dfeId = this.wizardService.dfeId;
        this.standortTitel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.standortTitelObject, 'titel');
        this.zulassungstyp = this.facade.dbTranslateService.translate(this.wizardService.zulassungstypObject, 'kurzText');
        this.provBurNr = this.wizardService.unternehmenObject.provBurNr;
        this.burNrToDisplay = this.provBurNr ? this.provBurNr : this.wizardService.unternehmenObject.burNummer;
        this.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
            this.wizardService.unternehmenObject.name1,
            this.wizardService.unternehmenObject.name2,
            this.wizardService.unternehmenObject.name3
        );
        this.unternehmenStatus = this.facade.dbTranslateService.translate(this.wizardService.unternehmenObject.statusObject, 'text');

        this.infopanelService.appendToInforbar(this.infobarTemplate);
    }
}
