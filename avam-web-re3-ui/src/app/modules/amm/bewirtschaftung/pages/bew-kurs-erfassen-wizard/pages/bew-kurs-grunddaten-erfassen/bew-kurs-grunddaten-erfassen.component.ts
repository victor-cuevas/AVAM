import { Permissions } from '@shared/enums/permissions.enum';
import { Component, AfterViewInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { Subscription, Observable, forkJoin, iif } from 'rxjs';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmKursErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-kurs-erfassen-wizard.service';
import { BewKursGrunddatenFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungKursGrunddatenData } from '@app/modules/amm/bewirtschaftung/components/bew-kurs-grunddaten-form/bew-kurs-grunddaten-form.component';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { ToolboxActionEnum, ToolboxService, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-kurs-grunddaten-erfassen',
    templateUrl: './bew-kurs-grunddaten-erfassen.component.html'
})
export class BewKursGrunddatenErfassenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewKursGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    grunddatenData: BewirtschaftungKursGrunddatenData;
    observeClickActionSub: Subscription;
    langSubscription: Subscription;
    permissions: typeof Permissions = Permissions;
    organisationInfoBar: string;
    massnahmeId: number;
    massnahmeTitel: string;
    zulassungstyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;

    constructor(
        public wizardService: AmmKursErfassenWizardService,
        private infopanelService: AmmInfopanelService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private ammHelper: AmmHelper,
        private router: Router,
        private facade: FacadeService
    ) {
        const step = new Observable<boolean>(subscriber => {
            this.submit(() => {
                this.wizardService.erfassungsspracheIdGrunddatenState = this.grunddatenFormComponent.formGroup.controls.erfassungssprache.value;
                subscriber.next(true);
            });
        });

        this.wizardService.setOnNextStep(step);
    }

    ngAfterViewInit() {
        this.wizardService.grunddatenForm = this.grunddatenFormComponent.formGroup;

        this.route.parent.params.subscribe(params => {
            this.wizardService.produktId = +params['produktId'];
            this.wizardService.massnahmeId = +params['massnahmeId'];
        });

        this.getData();
        this.configureToolbox();
        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.appendToInforbar();
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);
        const get = this.bewirtschaftungRestService.getDfeSession(this.wizardService.dfeId);
        const create = this.bewirtschaftungRestService.createDfeSession(this.wizardService.massnahmeId);

        forkJoin([
            //NOSONAR
            iif(() => (this.wizardService.dfeId ? true : false), get, create),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VERFUEGBARKEITAMM),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.DURCHFUEHRUNGSKRITERUM_AMM),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SESSION_STATUS)
        ]).subscribe(
            ([dfeResponse, spracheOptionsResponse, verfuegbarkeitAmmResponse, durchfuehrungskriteriumResponse, sessionStatusResponse]) => {
                let erfassungsspracheIdGrunddatenState: number;

                if (this.wizardService.erfassungsspracheIdGrunddatenState) {
                    erfassungsspracheIdGrunddatenState = this.wizardService.erfassungsspracheIdGrunddatenState;
                }

                const grunddatenDto = dfeResponse.data;

                this.grunddatenData = {
                    grunddatenDto,
                    erfassungsspracheOptions: spracheOptionsResponse,
                    verfuegbarkeitAmmOptions: verfuegbarkeitAmmResponse,
                    durchfuehrungskriteriumOptions: durchfuehrungskriteriumResponse,
                    sessionStatusOptions: sessionStatusResponse,
                    erfassungsspracheIdGrunddatenState
                };

                if (!this.wizardService.dfeId) {
                    this.wizardService.unternehmenObject = grunddatenDto.massnahmeObject.ammAnbieterObject.unternehmen;
                    this.wizardService.zulassungstypObject = grunddatenDto.massnahmeObject.zulassungstypObject;
                    this.wizardService.savedElementkategorieAmtObject = grunddatenDto.massnahmeObject.produktObject.elementkategorieAmtObject;
                    this.wizardService.savedStrukturelementGesetzObject = grunddatenDto.massnahmeObject.produktObject.strukturelementGesetzObject;
                    this.wizardService.massnahmeTitelObject = this.ammHelper.getDtoTitel(grunddatenDto.massnahmeObject);
                }

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

        this.bewirtschaftungRestService.saveDfeSession(this.grunddatenFormComponent.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    const sessionDto = response.data;
                    this.wizardService.isWizardNext = true;
                    this.wizardService.dfeId = sessionDto.durchfuehrungsId;
                    this.wizardService.kursTitelObject = this.ammHelper.getDtoTitel(sessionDto);

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
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/kurse`], {
            queryParams: { massnahmeId: this.wizardService.massnahmeId }
        });
    }

    reset() {
        this.grunddatenFormComponent.reset();
    }

    moveNext() {
        this.wizardService.moveNext();
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
            title: 'amm.massnahmen.label.kurserfassen',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
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
}
