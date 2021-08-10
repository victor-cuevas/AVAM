import { Permissions } from '@app/shared/enums/permissions.enum';
import { Component, ViewChild, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmMassnahmeErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-massnahme-erfassen-wizard.service';
import { forkJoin, Subscription, Observable } from 'rxjs';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { BewBeschreibungFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { Router } from '@angular/router';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-massnahme-beschreibung-erfassen',
    templateUrl: './bew-massnahme-beschreibung-erfassen.component.html',
    providers: [PermissionContextService]
})
export class BewMassnahmeBeschreibungErfassenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('beschreibungFormComponent') beschreibungFormComponent: BewBeschreibungFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    beschreibungData: any;
    observeClickActionSub: Subscription;
    organisationInfoBar: string;
    produktId: number;
    produktTitelLabel: string;
    unternehmensname: string;
    zulassungstyp: string;
    burNrToDisplay: number;
    unternehmenStatus: string;
    provBurNr: number;
    langSubscription: Subscription;
    permissions: typeof Permissions = Permissions;

    constructor(
        private wizardService: AmmMassnahmeErfassenWizardService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private router: Router,
        private permissionContextService: PermissionContextService,
        private ammHelper: AmmHelper,
        private facade: FacadeService
    ) {
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
        this.infopanelService.appendToInforbar(this.infobarTemplate);

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.initInfopanel();
        });

        this.wizardService.isWizardNext = false;
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getMassnahmeBeschreibung(this.wizardService.massnahmeId),
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

                if (beschreibungDto) {
                    this.permissionContextService.getContextPermissions(beschreibungDto.ownerId);
                }

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

        this.bewirtschaftungRestService
            .saveMassnahmeBeschreibung(this.beschreibungFormComponent.mapToDTO(this.beschreibungData.beschreibungDto), this.wizardService.massnahmeId)
            .subscribe(
                response => {
                    if (response.data) {
                        this.wizardService.beschreibungDTOState = undefined;
                        this.wizardService.isWizardNext = true;
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

    back() {
        this.wizardService.movePrev();
    }

    next() {
        this.wizardService.moveNext();
    }

    reset() {
        this.beschreibungFormComponent.reset();
    }

    cancel() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen`]);
        // add logic to redirect to UI 315-002 when SUC is ready
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
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
            this.wizardService.savedElementkategorieAmtObject,
            this.wizardService.savedStrukturelementGesetzObject
        );
        this.produktId = this.wizardService.produktId;
        this.produktTitelLabel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.produktTitelObject, 'titel');
        this.zulassungstyp = this.facade.dbTranslateService.translate(this.wizardService.zulassungstypObject, 'kurzText');

        this.provBurNr = this.wizardService.unternehmenObject.provBurNr;
        this.burNrToDisplay = this.provBurNr ? this.provBurNr : this.wizardService.unternehmenObject.burNummer;
        this.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
            this.wizardService.unternehmenObject.name1,
            this.wizardService.unternehmenObject.name2,
            this.wizardService.unternehmenObject.name3
        );
        this.unternehmenStatus = this.facade.dbTranslateService.translate(this.wizardService.unternehmenObject.statusObject, 'text');

        const massnahmeLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.massnahme');
        const massnahmeTitelLabel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.massnahmeTitelObject, 'titel');
        const erfassenLabel = this.facade.translateService.instant('amm.nutzung.alttext.erfassen');

        this.infopanelService.dispatchInformation({
            title: `${massnahmeLabel} ${massnahmeTitelLabel} ${erfassenLabel}`,
            subtitle: 'amm.massnahmen.subnavmenuitem.beschreibung'
        });
    }
}
