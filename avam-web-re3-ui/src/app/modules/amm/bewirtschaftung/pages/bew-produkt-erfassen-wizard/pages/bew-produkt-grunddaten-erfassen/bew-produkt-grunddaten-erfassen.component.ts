import { AmmConstants } from '@app/shared/enums/amm-constants';
import { ProduktDTO } from '@app/shared/models/dtos-generated/produktDTO';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { Component, AfterViewInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { BewProduktGrunddatenFormComponent } from '@app/modules/amm/bewirtschaftung/components/bew-produkt-grunddaten-form/bew-produkt-grunddaten-form.component';
import { AmmProduktErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-produkt-erfassen-wizard.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Router } from '@angular/router';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-produkt-grunddaten-erfassen',
    templateUrl: './bew-produkt-grunddaten-erfassen.component.html'
})
export class BewProduktGrunddatenErfassenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewProduktGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    grunddatenData: any;
    permissions: typeof Permissions = Permissions;
    observeClickActionSub: Subscription;
    organisation: string;

    constructor(
        private wizardService: AmmProduktErfassenWizardService,
        private stesDataRestService: StesDataRestService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private ammRestService: AmmRestService,
        private router: Router,
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

        this.getData();
        this.configureToolbox();
        this.initInfopanel();

        this.grunddatenFormComponent.formGroup.controls.amtsstelle.valueChanges.subscribe(() => {
            this.organisation = this.grunddatenFormComponent.handler.selectedMassnahmenartElement.elementkategorieObject.organisation;
        });

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getProdukt(this.wizardService.produktId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE)
        ]).subscribe(
            ([produktResponse, spracheOptionsResponse]) => {
                let erfassungsspracheIdGrunddatenState: number;

                if (this.wizardService.erfassungsspracheIdGrunddatenState) {
                    erfassungsspracheIdGrunddatenState = this.wizardService.erfassungsspracheIdGrunddatenState;
                }

                if (produktResponse.data) {
                    if (produktResponse.data.produktId !== AmmConstants.UNDEFINED_LONG_ID) {
                        this.grunddatenFormComponent.handler.selectedMassnahmenartElement = produktResponse.data.strukturelementObject;

                        this.setDataWithAmtstelleTexts(produktResponse.data, spracheOptionsResponse, erfassungsspracheIdGrunddatenState);
                    } else {
                        this.grunddatenData = {
                            grunddatenDto: produktResponse.data,
                            erfassungsspracheOptions: spracheOptionsResponse,
                            erfassungsspracheIdGrunddatenState,
                            produktverantwortung: produktResponse.data.verantwortlicherDetailObject
                        };

                        this.facade.spinnerService.deactivate(this.wizardService.channel);
                    }
                } else {
                    this.facade.spinnerService.deactivate(this.wizardService.channel);
                }

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

        this.bewirtschaftungRestService.saveProdukt(this.grunddatenFormComponent.mapToDTO(this.grunddatenData.grunddatenDto)).subscribe(
            response => {
                if (response.data) {
                    this.wizardService.isWizardNext = true;
                    this.wizardService.produktId = response.data.produktId;
                    this.wizardService.produktTitelObject = this.ammHelper.getDtoTitel(response.data);
                    this.wizardService.savedElementkategorieAmtObject = response.data.elementkategorieAmtObject;
                    this.wizardService.savedStrukturelementGesetzObject = response.data.strukturelementGesetzObject;

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
        this.router.navigate(['/home']);
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
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.topnavmenuitem.produkterfassen',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
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

    private setDataWithAmtstelleTexts(grunddatenDto: ProduktDTO, spracheOptionsResponse, erfassungsspracheIdGrunddatenState: number) {
        forkJoin([
            this.ammRestService.getStrukturElementPath(grunddatenDto.strukturelementObject.strukturelementId),
            this.ammRestService.getStrukturElementPath(grunddatenDto.strukturelementAusglObject.strukturelementId)
        ]).subscribe(([amtsstelle, ausgleichsstelle]) => {
            this.grunddatenData = {
                grunddatenDto,
                erfassungsspracheOptions: spracheOptionsResponse,
                amtstellePaths: {
                    amtsstellePath: amtsstelle.data,
                    ausgleichstellePath: ausgleichsstelle.data
                },
                erfassungsspracheIdGrunddatenState,
                produktverantwortung: grunddatenDto.verantwortlicherDetailObject
            };

            this.facade.spinnerService.deactivate(this.wizardService.channel);
        });
    }
}
