import { KontakteViewDTO } from '@dtos/kontakteViewDTO';
import { Component, OnDestroy, AfterViewInit, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { BewDurchfuehrungsortFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { Subscription, Observable, forkJoin, iif, of } from 'rxjs';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmKontaktpersonDTO } from '@app/shared/models/dtos-generated/ammKontaktpersonDTO';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { Router } from '@angular/router';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { DurchfuehrungsortDTO } from '@app/shared/models/dtos-generated/durchfuehrungsortDTO';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmBeschaeftigungseinheitErfassenWizardService } from '@app/shared';
import { KontaktpersonRestService } from '@app/core/http/kontaktperson-rest.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ToolboxConfiguration, ToolboxService, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';

@Component({
    selector: 'avam-bew-beschaeftigungseinheit-durchfort-erfassen',
    templateUrl: './bew-beschaeftigungseinheit-durchfort-erfassen.component.html'
})
export class BewBeschaeftigungseinheitDurchfortErfassenComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('durchsfuerungsortFormComponent') durchsfuerungsortFormComponent: BewDurchfuehrungsortFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    durchfuehrungsortData: any;
    observeClickActionSub: Subscription;
    langSubscription: Subscription;
    permissions: typeof Permissions = Permissions;
    organisationInfoBar: string;
    standortTitel: string;
    zulassungstyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
    kontaktPersonenList: AmmKontaktpersonDTO[] = [];
    dfeId: number;
    switzerlandDTO: StaatDTO;

    constructor(
        public wizardService: AmmBeschaeftigungseinheitErfassenWizardService,
        private infopanelService: AmmInfopanelService,
        private router: Router,
        private ammHelper: AmmHelper,
        private facade: FacadeService,
        private kontaktpersonRestService: KontaktpersonRestService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService
    ) {}

    ngOnInit() {
        const step = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            this.wizardService.durchfuehrungsortDTOState = this.durchsfuerungsortFormComponent.mapToDTO();
            subscriber.next(true);
        });

        this.wizardService.setOnPreviousStep(step);
    }

    ngAfterViewInit() {
        this.getData();
        this.configureToolbox();
        this.initInfopanel();
        this.appendToInforbar();
        this.updateSecondLabel();
        this.wizardService.isWizardNext = false;

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.updateSecondLabel();
            this.appendToInforbar();
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);
        const updateKP = this.kontaktpersonRestService.getKontaktpersonenByUnternehmenId(this.wizardService.unternehmenObject.unternehmenId);

        forkJoin([
            //NOSONAR
            iif(
                () =>
                    this.wizardService.unternehmenObject.unternehmenId && this.facade.authenticationService.hasAnyPermission([Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN])
                        ? true
                        : false,
                updateKP,
                of(null)
            ),
            this.bewirtschaftungRestService.getBeDurchfuehrungsort(this.wizardService.beId),
            this.stesDataRestService.getStaatSwiss()
        ]).subscribe(
            ([kontaktPersonResponse, durchfuehrungsortResponse, swissResponse]) => {
                if (kontaktPersonResponse && kontaktPersonResponse.data) {
                    this.kontaktPersonenList = kontaktPersonResponse.data.map(this.ammHelper.kontaktpersonMapper);
                }

                let durchfuehrungsortDTO = durchfuehrungsortResponse.data;
                this.switzerlandDTO = swissResponse;

                if (this.wizardService.durchfuehrungsortDTOState) {
                    durchfuehrungsortDTO = this.wizardService.durchfuehrungsortDTOState;
                    durchfuehrungsortDTO.ojbVersion = durchfuehrungsortResponse.data.ojbVersion;
                    durchfuehrungsortDTO.ammKontaktpersonObject.ojbVersion = durchfuehrungsortResponse.data.ammKontaktpersonObject.ojbVersion;
                    this.isAnbieterInfoChanged(durchfuehrungsortDTO, this.switzerlandDTO);
                    this.isKontaktpersonInfoChanged(this.wizardService.durchfuehrungsortDTOState);
                }

                this.durchfuehrungsortData = {
                    durchfuehrungsortDTO
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

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.durchsfuerungsortFormComponent.formGroup.invalid) {
            this.durchsfuerungsortFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.finish();
    }

    finish() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        this.bewirtschaftungRestService.saveBeDurchfuehrungsort(this.durchsfuerungsortFormComponent.mapToDTO(), this.wizardService.beId).subscribe(
            response => {
                if (response.data) {
                    this.wizardService.isWizardNext = true;
                    this.isAnbieterInfoChanged(response.data, this.switzerlandDTO);
                    this.isKontaktpersonInfoChanged(this.wizardService.durchfuehrungsortDTOState);

                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.router.navigate(
                        [
                            `amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/standorte/standort/${
                                this.wizardService.isPraktikumsstelle ? 'praktikumsstellen/praktikumsstelle' : 'arbeitsplatzkategorien/arbeitsplatzkategorie'
                            }/grunddaten`
                        ],
                        {
                            queryParams: { massnahmeId: this.wizardService.massnahmeId, dfeId: this.wizardService.dfeId, beId: this.wizardService.beId }
                        }
                    );
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

    onKpersonSelected(kperson: KontakteViewDTO) {
        this.wizardService.kpersonId = kperson.kontaktpersonId;
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
        this.facade.fehlermeldungenService.closeMessage();
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
            subtitle: 'amm.massnahmen.subnavmenuitem.durchfuehrungsort'
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

    private isAnbieterInfoChanged(durchfuehrungsortDTO: DurchfuehrungsortDTO, switzerlandDTO: StaatDTO) {
        if (durchfuehrungsortDTO && this.ammHelper.isAddressDifferentFromAnbieter(durchfuehrungsortDTO, switzerlandDTO)) {
            this.facade.fehlermeldungenService.showMessage('amm.message.abweichungstandortadresse', 'info');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private isKontaktpersonInfoChanged(durchfuehrungsortDTOState) {
        if (
            durchfuehrungsortDTOState &&
            this.ammHelper.isKontaktpersonInfoDifferentFromAnbieterWizard(
                durchfuehrungsortDTOState.ammKontaktpersonObject,
                this.durchsfuerungsortFormComponent.isKontaktPersonSelected(durchfuehrungsortDTOState),
                this.kontaktPersonenList,
                this.wizardService.kpersonId
            )
        ) {
            this.facade.fehlermeldungenService.showMessage('amm.message.abweichungkontaktperson', 'info');
            OrColumnLayoutUtils.scrollTop();
        }
    }
}
