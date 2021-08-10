import { KontakteViewDTO } from '@dtos/kontakteViewDTO';
import { Component, ViewChild, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BewDurchfuehrungsortFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { Observable, Subscription, forkJoin, iif, of } from 'rxjs';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { AmmKursErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-kurs-erfassen-wizard.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { StaatDTO } from '@dtos/staatDTO';
import { Router } from '@angular/router';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { DurchfuehrungsortDTO } from '@dtos/durchfuehrungsortDTO';
import { KontaktpersonRestService } from '@app/core/http/kontaktperson-rest.service';
import { AmmKontaktpersonDTO } from '@app/shared/models/dtos-generated/ammKontaktpersonDTO';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-kurs-durchfuehrungsort-erfassen',
    templateUrl: './bew-kurs-durchfuehrungsort-erfassen.component.html',
    providers: [PermissionContextService]
})
export class BewKursDurchfuehrungsortErfassenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('durchsfuerungsortFormComponent') durchsfuerungsortFormComponent: BewDurchfuehrungsortFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    durchfuehrungsortData: any;
    observeClickActionSub: Subscription;
    langSubscription: Subscription;
    permissions: typeof Permissions = Permissions;
    massnahmeId: number;
    organisationInfoBar: string;
    massnahmeTitel: string;
    zulassungstyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
    kontaktPersonenList: AmmKontaktpersonDTO[] = [];
    switzerlandDTO: StaatDTO;

    constructor(
        private wizardService: AmmKursErfassenWizardService,
        private infopanelService: AmmInfopanelService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private router: Router,
        private ammHelper: AmmHelper,
        private kontaktpersonRestService: KontaktpersonRestService,
        private facade: FacadeService
    ) {
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
            this.bewirtschaftungRestService.getDfeDurchfuehrungsort(this.wizardService.dfeId),
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

        this.bewirtschaftungRestService.saveDfeDurchfuehrungsort(this.durchsfuerungsortFormComponent.mapToDTO(), this.wizardService.dfeId).subscribe(
            response => {
                if (response.data) {
                    this.wizardService.isWizardNext = true;
                    this.isAnbieterInfoChanged(response.data, this.switzerlandDTO);
                    this.isKontaktpersonInfoChanged(this.wizardService.durchfuehrungsortDTOState);

                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.router.navigate([`/amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/kurse/kurs/grunddaten`], {
                        queryParams: { massnahmeId: this.wizardService.massnahmeId, dfeId: this.wizardService.dfeId }
                    });
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

    back() {
        this.wizardService.movePrev();
    }

    reset() {
        this.durchsfuerungsortFormComponent.reset();
    }

    cancel() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/kurse`], {
            queryParams: { massnahmeId: this.wizardService.massnahmeId }
        });
    }

    onKpersonSelected(kperson: KontakteViewDTO) {
        this.wizardService.kpersonId = kperson.kontaktpersonId;
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
            title: 'amm.massnahmen.subnavmenuitem.kurs',
            subtitle: 'amm.massnahmen.subnavmenuitem.durchfuehrungsort'
        });
    }

    private updateSecondLabel() {
        const kursTitel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.kursTitelObject, 'titel');
        const erfassenLabel = this.facade.translateService.instant('amm.nutzung.alttext.erfassen');

        this.infopanelService.updateInformation({
            secondTitle: `${kursTitel} ${erfassenLabel}`
        });
    }

    private appendToInforbar() {
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
            this.wizardService.savedElementkategorieAmtObject,
            this.wizardService.savedStrukturelementGesetzObject
        );
        this.massnahmeId = this.wizardService.massnahmeId;
        this.massnahmeTitel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.massnahmeTitelObject, 'titel');
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
