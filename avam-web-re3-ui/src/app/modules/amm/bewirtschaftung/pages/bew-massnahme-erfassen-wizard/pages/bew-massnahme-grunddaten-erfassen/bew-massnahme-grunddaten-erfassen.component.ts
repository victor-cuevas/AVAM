import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Component, AfterViewInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BewMassnahmeGrunddatenFormComponent } from '@app/modules/amm/bewirtschaftung/components/bew-massnahme-grunddaten-form/bew-massnahme-grunddaten-form.component';
import { AmmMassnahmeErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-massnahme-erfassen-wizard.service';
import { forkJoin, Subscription, iif, Observable } from 'rxjs';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-massnahme-grunddaten-erfassen',
    templateUrl: './bew-massnahme-grunddaten-erfassen.component.html'
})
export class BewMassnahmeGrunddatenErfassenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewMassnahmeGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    grunddatenData: any;
    permissions: typeof Permissions = Permissions;
    produktId: number;
    observeClickActionSub: Subscription;
    organisationInfoBar: string;
    produktNrInfoBar: string;
    produktTitelInfoBar: string;
    langSubscription: Subscription;

    constructor(
        private wizardService: AmmMassnahmeErfassenWizardService,
        private router: Router,
        private route: ActivatedRoute,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private ammHelper: AmmHelper,
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
            this.produktId = +params['produktId'];
            this.wizardService.produktId = this.produktId;
        });

        this.getData();
        this.configureToolbox();
        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.organisationInfoBar = this.getInfopanelOrganisation();
            this.produktTitelInfoBar = this.getInfopanelProduktTitel();
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);
        const get = this.bewirtschaftungRestService.getMassnahme(this.wizardService.massnahmeId);
        const create = this.bewirtschaftungRestService.createMassnahme(this.produktId);

        forkJoin([
            //NOSONAR
            iif(() => (this.wizardService.massnahmeId ? true : false), get, create),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.ZULASSUNG_TYP_AMM)
        ]).subscribe(
            ([massnahmeResponse, spracheOptionsResponse, zulassungstypAmmResponse]) => {
                let erfassungsspracheIdGrunddatenState: number;

                if (this.wizardService.erfassungsspracheIdGrunddatenState) {
                    erfassungsspracheIdGrunddatenState = this.wizardService.erfassungsspracheIdGrunddatenState;
                }

                this.grunddatenData = {
                    grunddatenDto: massnahmeResponse.data,
                    erfassungsspracheOptions: spracheOptionsResponse,
                    zulassungstypAmmOptions: zulassungstypAmmResponse,
                    erfassungsspracheIdGrunddatenState,
                    massnahmenverantwortung: massnahmeResponse.data ? massnahmeResponse.data.produktObject.verantwortlicherDetailObject : null
                };

                this.organisationInfoBar = this.getInfopanelOrganisation();
                this.produktNrInfoBar = this.getInfopanelProduktNr();
                this.produktTitelInfoBar = this.getInfopanelProduktTitel();

                this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
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

        this.bewirtschaftungRestService.saveMassnahme(this.grunddatenFormComponent.mapToDTO(this.grunddatenData.grunddatenDto)).subscribe(
            response => {
                if (response.data) {
                    const massnahmeDto = response.data;

                    this.wizardService.isWizardNext = true;
                    this.wizardService.massnahmeId = massnahmeDto.massnahmeId;
                    this.wizardService.produktTitelObject = this.ammHelper.getDtoTitel(massnahmeDto);
                    this.wizardService.massnahmeTitelObject = this.ammHelper.getDtoTitel(massnahmeDto);
                    this.wizardService.unternehmenObject = massnahmeDto.ammAnbieterObject.unternehmen;
                    this.wizardService.zulassungstypObject = massnahmeDto.zulassungstypObject;
                    this.wizardService.savedElementkategorieAmtObject = massnahmeDto.produktObject.elementkategorieAmtObject;
                    this.wizardService.savedStrukturelementGesetzObject = massnahmeDto.produktObject.strukturelementGesetzObject;
                    this.wizardService.hasAnbieterChanged = this.grunddatenData.grunddatenDto.ammAnbieterObject
                        ? this.grunddatenData.grunddatenDto.ammAnbieterObject.unternehmenId !==
                          this.grunddatenFormComponent.formGroup.controls.anbieter['unternehmenAutosuggestObject'].unternehmenId
                        : false;

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
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen`]);
        // add logic to redirect to UI 315-002 when SUC is ready
    }

    reset() {
        this.grunddatenFormComponent.reset();
    }

    moveNext() {
        this.wizardService.moveNext();
    }

    ngOnDestroy(): void {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        this.langSubscription.unsubscribe();
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
            title: 'amm.nutzung.title.massnahmeErfassen',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
        });
    }

    private getInfopanelOrganisation(): string {
        if (this.grunddatenData && this.grunddatenData.grunddatenDto) {
            return this.ammHelper.getMassnahmenOrganisationTypKuerzel(
                this.grunddatenData.grunddatenDto.produktObject.elementkategorieAmtObject,
                this.grunddatenData.grunddatenDto.produktObject.strukturelementGesetzObject
            );
        }

        return '';
    }

    private getInfopanelProduktNr(): string {
        if (this.grunddatenData && this.grunddatenData.grunddatenDto) {
            return this.grunddatenData.grunddatenDto.produktObject.produktId;
        }

        return '';
    }

    private getInfopanelProduktTitel(): string {
        if (this.grunddatenData && this.grunddatenData.grunddatenDto) {
            return this.facade.dbTranslateService.translateWithOrder(this.grunddatenData.grunddatenDto.produktObject, 'titel');
        }

        return '';
    }
}
