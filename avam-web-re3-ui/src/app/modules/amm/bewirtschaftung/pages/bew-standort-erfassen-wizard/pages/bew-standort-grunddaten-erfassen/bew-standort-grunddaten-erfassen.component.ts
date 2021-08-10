import { FacadeService } from '@shared/services/facade.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Component, AfterViewInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { BewStandortGrunddatenFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { Subscription, Observable, iif, forkJoin } from 'rxjs';
import { AmmStandortErfassenWizardService, ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { Router, ActivatedRoute } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { BewStandortGrunddatenData } from '@app/modules/amm/bewirtschaftung/components/bew-standort-grunddaten-form/bew-standort-grunddaten-form.component';
import PrintHelper from '@app/shared/helpers/print.helper';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';

@Component({
    selector: 'avam-bew-standort-grunddaten-erfassen',
    templateUrl: './bew-standort-grunddaten-erfassen.component.html'
})
export class BewStandortGrunddatenErfassenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewStandortGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    grunddatenData: BewStandortGrunddatenData;
    observeClickActionSub: Subscription;
    langSubscription: Subscription;
    organisationInfoBar: string;
    massnahmeId: number;
    massnahmeTitel: string;
    zulassungstyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
    permissions: typeof Permissions = Permissions;

    constructor(
        private wizardService: AmmStandortErfassenWizardService,
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
        const get = this.bewirtschaftungRestService.getDfeStandort(this.wizardService.produktId, this.wizardService.massnahmeId, this.wizardService.dfeId);
        const create = this.bewirtschaftungRestService.createDfeStandort(this.wizardService.produktId, this.wizardService.massnahmeId);

        forkJoin([
            //NOSONAR
            iif(() => (this.wizardService.dfeId ? true : false), get, create),
            this.bewirtschaftungRestService.getStandortHoldsPraktikumsstellen(this.wizardService.produktId, this.wizardService.massnahmeId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VERFUEGBARKEITAMM),
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SESSION_STATUS)
        ]).subscribe(
            ([dfeResponse, standortHoldsPraktikumsstellenResponse, spracheOptionsResponse, verfuegbarkeitAmmResponse, sozialeAbfederungResponse, sessionStatusResponse]) => {
                let erfassungsspracheIdGrunddatenState: number;

                if (this.wizardService.erfassungsspracheIdGrunddatenState) {
                    erfassungsspracheIdGrunddatenState = this.wizardService.erfassungsspracheIdGrunddatenState;
                }

                const standortDto = dfeResponse.data;

                this.grunddatenData = {
                    standortDto,
                    erfassungsspracheOptions: spracheOptionsResponse,
                    verfuegbarkeitAmmOptions: verfuegbarkeitAmmResponse,
                    sozialeAbfederungOptions: sozialeAbfederungResponse,
                    sessionStatusOptions: sessionStatusResponse,
                    erfassungsspracheIdGrunddatenState,
                    isApBp: standortHoldsPraktikumsstellenResponse.data
                };

                if (!this.wizardService.dfeId) {
                    this.wizardService.unternehmenObject = standortDto.massnahmeObject.ammAnbieterObject.unternehmen;
                    this.wizardService.zulassungstypObject = standortDto.massnahmeObject.zulassungstypObject;
                    this.wizardService.savedElementkategorieAmtObject = standortDto.massnahmeObject.produktObject.elementkategorieAmtObject;
                    this.wizardService.savedStrukturelementGesetzObject = standortDto.massnahmeObject.produktObject.strukturelementGesetzObject;
                    this.wizardService.massnahmeTitelObject = this.ammHelper.getDtoTitel(standortDto.massnahmeObject);
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

        this.bewirtschaftungRestService.saveDfeStandort(this.grunddatenFormComponent.mapToDTO(), this.facade.translateService.currentLang).subscribe(
            response => {
                if (response.data) {
                    const standortDto = response.data;
                    this.wizardService.isWizardNext = true;
                    this.wizardService.dfeId = standortDto.durchfuehrungsId;
                    this.wizardService.standortTitelObject = this.ammHelper.getDtoTitel(standortDto);

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
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/standorte`], {
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
            title: 'amm.massnahmen.label.standorterfassen',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
        });
    }
}
