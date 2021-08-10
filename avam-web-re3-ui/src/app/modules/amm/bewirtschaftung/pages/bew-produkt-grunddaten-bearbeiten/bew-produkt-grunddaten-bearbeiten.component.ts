import { Component, AfterViewInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { BewProduktGrunddatenFormComponent } from '../../components/bew-produkt-grunddaten-form/bew-produkt-grunddaten-form.component';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { Subscription, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { SpinnerService, NotificationService } from 'oblique-reactive';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduktDTO } from '@app/shared/models/dtos-generated/produktDTO';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@app/shared/services/navigation-service';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';

@Component({
    selector: 'avam-bew-produkt-grunddaten-bearbeiten',
    templateUrl: './bew-produkt-grunddaten-bearbeiten.component.html'
})
export class BewProduktGrunddatenBearbeitenComponent implements AfterViewInit, DeactivationGuarded, OnDestroy {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewProduktGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'produkt-grunddaten-bearbeiten';
    grunddatenData: any;
    produktId: number;
    permissions: typeof Permissions = Permissions;
    erfassungsspracheOptions: any[];
    erfassungsspracheIdGrunddatenState: number;
    observeClickActionSub: Subscription;
    organisationInfoBar: string;
    previousUrl: string;
    isIndividuelleAmm: boolean;
    isInPlanungSichtbar: boolean;
    grunddatenDto: ProduktDTO;
    langSubscription: Subscription;
    showDelete: boolean;

    constructor(
        private stesDataRestService: StesDataRestService,
        private spinnerService: SpinnerService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private translateService: TranslateService,
        private route: ActivatedRoute,
        private ammRestService: AmmRestService,
        private fehlermeldungenService: FehlermeldungenService,
        private toolboxService: ToolboxService,
        private infopanelService: AmmInfopanelService,
        private dbTranslateService: DbTranslateService,
        private modalService: NgbModal,
        private notificationService: NotificationService,
        private router: Router,
        private navigationService: NavigationService,
        private previousRouteService: PreviousRouteService,
        private ammHelper: AmmHelper,
        private ammBewirtschaftungNavigationHelper: AmmBewirtschaftungNavigationHelper
    ) {
        this.previousUrl = this.previousRouteService.getPreviousUrl();
    }

    ngAfterViewInit() {
        this.route.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });
        this.initInfopanel();
        this.getData();
        this.langSubscription = this.translateService.onLangChange.subscribe(() => {
            this.updateSecondLabel(this.grunddatenDto);
            this.sendTemplateToInfobar(this.grunddatenDto);
        });
    }

    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getProdukt(this.produktId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE)
        ]).subscribe(
            ([produktResponse, spracheOptionsResponse]) => {
                this.erfassungsspracheOptions = spracheOptionsResponse;

                if (produktResponse.data) {
                    const produkt = produktResponse.data;
                    this.setDataWithAmtstelleTexts(produkt);
                    this.showDelete = (!produkt.massnahmeList || produkt.massnahmeList.length === 0) && (!produkt.planwertList || produkt.planwertList.length === 0);
                    this.ammBewirtschaftungNavigationHelper.setProduktDynamicNavigation(produkt.inPlanungSichtbar);
                } else {
                    this.spinnerService.deactivate(this.channel);
                }
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    submit() {
        this.fehlermeldungenService.closeMessage();

        if (this.grunddatenFormComponent.formGroup.invalid) {
            this.grunddatenFormComponent.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.spinnerService.activate(this.channel);
        this.erfassungsspracheIdGrunddatenState = this.grunddatenFormComponent.formGroup.controls.erfassungssprache.value;

        this.bewirtschaftungRestService.saveProdukt(this.grunddatenFormComponent.mapToDTO(this.grunddatenData.grunddatenDto)).subscribe(
            response => {
                if (response.data) {
                    const produkt = response.data;
                    this.setDataWithAmtstelleTexts(produkt);
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.infopanelService.sendLastUpdate(produkt);
                    this.ammBewirtschaftungNavigationHelper.setProduktDynamicNavigation(produkt.inPlanungSichtbar);
                } else {
                    this.spinnerService.deactivate(this.channel);
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    zurProduktplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.produktId, ElementPrefixEnum.PRODUKT_PREFIX);
    }

    openDeleteModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.deleteProdukt();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    deleteProdukt() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.deleteProdukt(this.produktId).subscribe(
            response => {
                if (!response) {
                    this.grunddatenFormComponent.formGroup.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));

                    if (this.previousUrl && this.previousUrl.includes(AMMPaths.BEW_PRODUKT_ERFASSEN)) {
                        this.router.navigate(['/home']);
                    } else {
                        this.router.navigate([`/amm/bewirtschaftung/${AMMPaths.BEW_PRODUKT_SUCHEN}`]);
                    }
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    reset() {
        this.grunddatenFormComponent.reset();
    }

    canDeactivate(): boolean {
        return this.grunddatenFormComponent.formGroup.dirty;
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.resetTemplateInInfobar();
        this.infopanelService.sendLastUpdate({}, true);
        this.infopanelService.updateInformation({ secondTitle: '' });
        this.langSubscription.unsubscribe();

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.produkt',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
        });
    }

    private updateSecondLabel(produktDto: ProduktDTO) {
        if (produktDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.dbTranslateService.translateWithOrder(produktDto, 'titel')
            });
        }
    }

    private sendTemplateToInfobar(produktDto: ProduktDTO) {
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(produktDto.elementkategorieAmtObject, produktDto.strukturelementGesetzObject);

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, true));

        if (!this.isIndividuelleAmm) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.configureToolboxData(this.produktId));

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.produktId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(+this.produktId, AvamCommonValueObjectsEnum.T_PRODUKT);
            }
        });
    }

    private configureToolboxData(produktId: number): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.PRODUKT,
            vorlagenKategorien: [VorlagenKategorie.PRODUKT],
            entityIDsMapping: { PRODUKT_ID: produktId }
        };
    }

    private setDataWithAmtstelleTexts(grunddatenDto: ProduktDTO) {
        forkJoin([
            this.ammRestService.getStrukturElementPath(grunddatenDto.strukturelementObject.strukturelementId),
            this.ammRestService.getStrukturElementPath(grunddatenDto.strukturelementAusglObject.strukturelementId)
        ]).subscribe(([amtsstelle, ausgleichsstelle]) => {
            this.grunddatenData = {
                grunddatenDto,
                erfassungsspracheOptions: this.erfassungsspracheOptions,
                amtstellePaths: {
                    amtsstellePath: amtsstelle.data,
                    ausgleichstellePath: ausgleichsstelle.data
                },
                erfassungsspracheIdGrunddatenState: this.erfassungsspracheIdGrunddatenState,
                produktverantwortung: grunddatenDto.verantwortlicherDetailObject
            };

            this.grunddatenDto = grunddatenDto;
            this.isIndividuelleAmm = this.grunddatenDto.individuellenAMM;
            this.isInPlanungSichtbar = this.grunddatenDto.inPlanungSichtbar;

            this.infopanelService.sendLastUpdate(this.grunddatenDto);
            this.updateSecondLabel(this.grunddatenDto);
            this.sendTemplateToInfobar(this.grunddatenDto);
            this.togglePlanwerteNavigation();
            this.configureToolbox();

            this.spinnerService.deactivate(this.channel);
        });
    }

    private openDmsCopyModal(produktId: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_AMM_PRODUKT_GRUNDDATEN;
        comp.id = produktId.toString();
    }

    private openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }

    private togglePlanwerteNavigation() {
        if (!this.grunddatenData.grunddatenDto.inPlanungSichtbar) {
            this.navigationService.hideNavigationTreeRoute(`./planwerte`);
        } else {
            this.navigationService.showNavigationTreeRoute(`./planwerte`);
        }
    }
}
