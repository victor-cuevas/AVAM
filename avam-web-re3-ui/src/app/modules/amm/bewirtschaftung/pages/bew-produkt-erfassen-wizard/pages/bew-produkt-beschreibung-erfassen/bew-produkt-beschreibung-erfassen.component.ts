import { Component, ViewChild, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import { AmmProduktErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-produkt-erfassen-wizard.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BewBeschreibungFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-produkt-beschreibung-erfassen',
    templateUrl: './bew-produkt-beschreibung-erfassen.component.html'
})
export class BewProduktBeschreibungErfassenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('beschreibungFormComponent') beschreibungFormComponent: BewBeschreibungFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    beschreibungData: any;
    permissions: typeof Permissions = Permissions;
    observeClickActionSub: Subscription;
    organisationInfoBar: string;

    constructor(
        private wizardService: AmmProduktErfassenWizardService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private router: Router,
        private infopanelService: AmmInfopanelService,
        private ammHelper: AmmHelper,
        private facade: FacadeService
    ) {
        const step = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            this.wizardService.beschreibungDTOState = this.beschreibungFormComponent.mapToDTO(this.beschreibungData.beschreibungDto);
            this.wizardService.erfassungsspracheIdBeschreibungState = this.beschreibungFormComponent.formGroup.controls.erfassungssprache.value;
            subscriber.next(true);
        });

        this.wizardService.setOnPreviousStep(step);
    }

    ngAfterViewInit() {
        this.wizardService.isWizardNext = false;

        this.getData();
        this.configureToolbox();
        this.initInfopanel();
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
            this.wizardService.savedElementkategorieAmtObject,
            this.wizardService.savedStrukturelementGesetzObject
        );

        this.infopanelService.appendToInforbar(this.infobarTemplate);

        this.facade.translateService.onLangChange.subscribe(() => {
            this.initInfopanel();
            this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
                this.wizardService.savedElementkategorieAmtObject,
                this.wizardService.savedStrukturelementGesetzObject
            );
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getProduktBeschreibung(this.wizardService.produktId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getCode(DomainEnum.SPRACHKENNTNISSE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.stesDataRestService.getCode(DomainEnum.BERUFSFUNKTION),
            this.stesDataRestService.getCode(DomainEnum.STESHANDLUNGSFELD)
        ]).subscribe(
            ([beschreibungResponse, spracheResponse, sparchkenntnisseResponse, ausbildungsniveauResponse, berufsfunktionResponse, steshandlungsfeldResponse]) => {
                let isFirstEntry = true;
                let beschreibungDto = beschreibungResponse.data;
                let erfassungsspracheIdBeschreibungState: number;

                if (this.wizardService.beschreibungDTOState) {
                    beschreibungDto = this.wizardService.beschreibungDTOState;
                    beschreibungDto.ojbVersion = beschreibungResponse.data.ojbVersion;
                    erfassungsspracheIdBeschreibungState = this.wizardService.erfassungsspracheIdBeschreibungState;
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
                    isFirstEntry,
                    isProduktBeschreibung: true
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

        if (this.beschreibungFormComponent.formGroup.invalid) {
            this.beschreibungFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.finish();
    }

    finish() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        this.bewirtschaftungRestService
            .saveProduktBeschreibung(this.beschreibungFormComponent.mapToDTO(this.beschreibungData.beschreibungDto), this.wizardService.produktId)
            .subscribe(
                response => {
                    if (response.data) {
                        this.wizardService.isWizardNext = true;
                        this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                        this.router.navigate([`/amm/bewirtschaftung/produkt/${this.wizardService.produktId}/grunddaten`]);
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
        this.beschreibungFormComponent.reset();
    }

    cancel() {
        this.router.navigate(['/home']);
    }

    ngOnDestroy(): void {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

    private initInfopanel() {
        const produktLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.produkt');
        const titelLabel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.produktTitelObject, 'titel');
        const erfassenLabel = this.facade.translateService.instant('amm.nutzung.alttext.erfassen');

        this.infopanelService.dispatchInformation({
            title: `${produktLabel} ${titelLabel} ${erfassenLabel}`,
            subtitle: 'amm.massnahmen.subnavmenuitem.beschreibung'
        });
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
}
