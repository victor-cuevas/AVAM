import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@shared/services/toolbox.service';
import { BewBeschaeftigungseinheitGrunddatenData } from './../../../../components/bew-beschaeftigungseinheit-grunddaten-form/bew-beschaeftigungseinheit-grunddaten-form.component';
import { AmmBeschaeftigungseinheitErfassenWizardService } from '@shared/components/new/avam-wizard/amm-beschaeftigungseinheit-erfassen-wizard.service';
import { AmmHelper } from '@shared/helpers/amm.helper';
import { FacadeService } from '@shared/services/facade.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Component, AfterViewInit, OnDestroy, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { Subscription, Observable, forkJoin, iif } from 'rxjs';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Router } from '@angular/router';
// prettier-ignore
import { BewBeschaeftigungseinheitGrunddatenFormComponent } 
from '@app/modules/amm/bewirtschaftung/components/bew-beschaeftigungseinheit-grunddaten-form/bew-beschaeftigungseinheit-grunddaten-form.component';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import PrintHelper from '@app/shared/helpers/print.helper';

@Component({
    selector: 'avam-bew-beschaeftigungseinheit-grunddaten-erfassen',
    templateUrl: './bew-beschaeftigungseinheit-grunddaten-erfassen.component.html'
})
export class BewBeschaeftigungseinheitGrunddatenErfassenComponent implements AfterViewInit, OnDestroy, OnInit {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewBeschaeftigungseinheitGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    beschaeftigungseinheitData: BewBeschaeftigungseinheitGrunddatenData;
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
        private ammHelper: AmmHelper,
        private router: Router
    ) {}

    ngOnInit() {
        const step = new Observable<boolean>(subscriber => {
            this.submit(() => {
                subscriber.next(true);
            });
        });

        this.wizardService.setOnNextStep(step);

        this.infopanelService.resetTemplateInInfobar();
    }

    ngAfterViewInit() {
        this.wizardService.grunddatenForm = this.grunddatenFormComponent.formGroup;

        this.getData();
        this.configureToolbox();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.appendToInforbar();
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);
        const get = this.bewirtschaftungRestService.getBeschaeftigungseinheit(this.wizardService.beId);
        const create = this.bewirtschaftungRestService.createBeschaeftigungseinheit(this.wizardService.dfeId);

        forkJoin([
            //NOSONAR
            iif(() => (this.wizardService.beId ? true : false), get, create),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VERFUEGBARKEITAMM),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SESSION_STATUS)
        ]).subscribe(
            ([standortResponse, spracheOptionsResponse, verfuegbarkeitAmmResponse, sessionStatusResponse]) => {
                let erfassungsspracheIdGrunddatenState: number;

                if (this.wizardService.erfassungsspracheIdGrunddatenState) {
                    erfassungsspracheIdGrunddatenState = this.wizardService.erfassungsspracheIdGrunddatenState;
                }

                const standortDto = standortResponse.data;
                const beDto = standortDto.beschaeftigungseinheiten[0];

                this.beschaeftigungseinheitData = {
                    standortDto,
                    beDto,
                    erfassungsspracheOptions: spracheOptionsResponse,
                    verfuegbarkeitAmmOptions: verfuegbarkeitAmmResponse,
                    sessionStatusOptions: sessionStatusResponse,
                    erfassungsspracheIdGrunddatenState,
                    isPraktikumsstelle: this.wizardService.isPraktikumsstelle
                };

                if (!this.wizardService.beId) {
                    this.wizardService.unternehmenObject = standortDto.massnahmeObject.ammAnbieterObject.unternehmen;
                    this.wizardService.zulassungstypObject = standortDto.massnahmeObject.zulassungstypObject;
                    this.wizardService.savedElementkategorieAmtObject = standortDto.massnahmeObject.produktObject.elementkategorieAmtObject;
                    this.wizardService.savedStrukturelementGesetzObject = standortDto.massnahmeObject.produktObject.strukturelementGesetzObject;
                    this.wizardService.standortTitelObject = this.ammHelper.getDtoTitel(standortDto.massnahmeObject);
                }

                this.facade.messageBus.buildAndSend('footer-infos.formNumber', {
                    formNumber: this.wizardService.isPraktikumsstelle ? AmmFormNumberEnum.BEW_PRAKTIKUMSSTELLE_GRUNDDATEN : AmmFormNumberEnum.BEW_ARBEITSPLATZKATEGORIE_GRUNDDATEN
                });

                this.initInfopanel();
                this.appendToInforbar();

                this.facade.spinnerService.deactivate(this.wizardService.channel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            }
        );
    }

    submit(onDone?) {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.grunddatenFormComponent.formGroup.invalid) {
            this.grunddatenFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save(onDone);
    }

    save(onDone?) {
        this.facade.spinnerService.activate(this.wizardService.channel);

        this.bewirtschaftungRestService.saveBeschaeftigungseinheit(this.grunddatenFormComponent.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    const standortDto = response.data;
                    this.wizardService.isWizardNext = true;
                    this.wizardService.beId = standortDto.beschaeftigungseinheiten[0].beschaeftigungseinheitId;
                    this.wizardService.beTitelObject = this.ammHelper.getDtoTitel(standortDto.beschaeftigungseinheiten[0]);

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
            title: this.wizardService.isPraktikumsstelle ? 'amm.massnahmen.label.praktikumsstelleerfassen' : 'amm.massnahmen.label.arbeitsplatzkategorieerfassen',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
        });
    }
}
