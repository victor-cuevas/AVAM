import { Permissions } from '@shared/enums/permissions.enum';
import { Subscription, forkJoin } from 'rxjs';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { Component, ViewChild, TemplateRef, AfterViewInit, OnDestroy, EventEmitter } from '@angular/core';
import { BewMassnahmeGrunddatenFormComponent } from '../../components';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { SpinnerService, NotificationService } from 'oblique-reactive';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxService, GenericConfirmComponent } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PreviousRouteService } from '@app/shared/services/previous-route.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Component({
    selector: 'avam-bew-massnahme-grunddaten-bearbeiten',
    templateUrl: './bew-massnahme-grunddaten-bearbeiten.component.html'
})
export class BewMassnahmeGrunddatenBearbeitenComponent implements AfterViewInit, DeactivationGuarded, OnDestroy {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewMassnahmeGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;
    onPlanungAkquisitionSichtbarChange: EventEmitter<boolean> = new EventEmitter();

    channel = 'massnahme-grunddaten-bearbeiten';
    grunddatenData: any;
    previousUrl: string;
    massnahmeId: number;
    produktId: number;
    observeClickActionSub: Subscription;
    inPlanungAkquisitionSichtbar: boolean;
    isIndividuelleAmm = true;
    erfassungsspracheIdGrunddatenState: any;
    massnahmeDto: MassnahmeDTO;
    langSubscription: Subscription;
    kuerzelMassnahmentyp: string;
    massnahmeTitel: string;
    permissions: typeof Permissions = Permissions;
    displayInsAngebotUebernehmen: boolean;

    constructor(
        private stesDataRestService: StesDataRestService,
        private spinnerService: SpinnerService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private translateService: TranslateService,
        private route: ActivatedRoute,
        private fehlermeldungenService: FehlermeldungenService,
        private toolboxService: ToolboxService,
        private infopanelService: AmmInfopanelService,
        private dbTranslateService: DbTranslateService,
        private modalService: NgbModal,
        private notificationService: NotificationService,
        private router: Router,
        private previousRouteService: PreviousRouteService,
        private bewirtschaftungNavigationHelper: AmmBewirtschaftungNavigationHelper,
        private navigationService: NavigationService,
        private ammHelper: AmmHelper
    ) {
        this.previousUrl = this.previousRouteService.getPreviousUrl();
    }

    ngAfterViewInit() {
        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
        });
        this.route.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.getData();
        this.subscribeToToolbox();
        this.initInfopanel();

        this.langSubscription = this.translateService.onLangChange.subscribe(() => {
            this.updateSecondLabel(this.massnahmeDto);
            this.sendTemplateToInfobar(this.massnahmeDto);
        });
    }

    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getMassnahme(this.massnahmeId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.ZULASSUNG_TYP_AMM)
        ]).subscribe(
            ([massnahmeResponse, spracheOptionsResponse, zulassungstypAmmResponse]) => {
                this.grunddatenData = {
                    grunddatenDto: massnahmeResponse.data,
                    erfassungsspracheOptions: spracheOptionsResponse,
                    zulassungstypAmmOptions: zulassungstypAmmResponse,
                    massnahmenverantwortung: massnahmeResponse.data ? massnahmeResponse.data.produktObject.verantwortlicherDetailObject : null
                };

                if (massnahmeResponse.data) {
                    this.massnahmeDto = massnahmeResponse.data;
                    this.isIndividuelleAmm = massnahmeResponse.data.zulassungstypObject.code === AmmZulassungstypCode.INDIVIDUELL;
                    this.inPlanungAkquisitionSichtbar = massnahmeResponse.data.inPlanungAkquisitionSichtbar;
                    this.displayInsAngebotUebernehmen = this.massnahmeDto.displayInsAngebotUebernehmen;
                    this.bewirtschaftungNavigationHelper.setMassnahmeDynamicNavigation(
                        this.massnahmeDto.massnahmeId,
                        this.massnahmeDto.inPlanungAkquisitionSichtbar,
                        this.massnahmeDto.zulassungstypObject
                    );
                }

                this.configureToolbox();
                this.updateSecondLabel(this.massnahmeDto);
                this.sendTemplateToInfobar(this.massnahmeDto);
                this.infopanelService.sendLastUpdate(this.massnahmeDto);

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
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

        this.bewirtschaftungRestService.saveMassnahme(this.grunddatenFormComponent.mapToDTO(this.grunddatenData.grunddatenDto)).subscribe(
            massnahmeResponse => {
                if (massnahmeResponse.data) {
                    this.grunddatenData = {
                        ...this.grunddatenData,
                        grunddatenDto: massnahmeResponse.data,
                        erfassungsspracheIdGrunddatenState: this.erfassungsspracheIdGrunddatenState
                    };

                    this.massnahmeDto = massnahmeResponse.data;
                    this.inPlanungAkquisitionSichtbar = this.massnahmeDto.inPlanungAkquisitionSichtbar;
                    this.updateSecondLabel(this.massnahmeDto);
                    this.sendTemplateToInfobar(this.massnahmeDto);
                    this.infopanelService.sendLastUpdate(this.massnahmeDto);
                    this.bewirtschaftungNavigationHelper.setMassnahmeDynamicNavigation(
                        this.massnahmeDto.massnahmeId,
                        this.massnahmeDto.inPlanungAkquisitionSichtbar,
                        this.massnahmeDto.zulassungstypObject
                    );
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
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

    reset() {
        this.grunddatenFormComponent.reset();
    }

    zuMassnahmenplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.massnahmeId, ElementPrefixEnum.MASSNAHME_PREFIX);
    }

    massnhameInsAngebotUebernehmen() {
        this.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.insAngebotUebernehmen(this.massnahmeId).subscribe(
            response => {
                if (response.data) {
                    const massnahmeDto = response.data;
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                        this.router.navigate([`amm/bewirtschaftung/produkt/${massnahmeDto.produktObject.produktId}/massnahmen/massnahme/grunddaten`], {
                            queryParams: { massnahmeId: massnahmeDto.massnahmeId }
                        })
                    );
                } else {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
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

    openDeleteModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.deleteMassnahme();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    deleteMassnahme() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.deleteMassnahme(this.massnahmeId).subscribe(
            response => {
                if (!response) {
                    this.grunddatenFormComponent.formGroup.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));

                    this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_MASSNAHMEN);
                    if (this.previousUrl && this.previousUrl.includes('/bewirtschaftung/massnahme/suchen')) {
                        this.router.navigate([`amm/bewirtschaftung/massnahme/suchen`]);
                    } else {
                        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen`]);
                        //add logic for "der Benutzer die Massnahme ab der Planung erfasst hat"
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

    canDeactivate(): boolean {
        return this.grunddatenFormComponent.formGroup.dirty;
    }

    ngOnDestroy() {
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
            title: 'amm.massnahmen.subnavmenuitem.massnahme',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
        });
    }

    private updateSecondLabel(massnahmeDto: MassnahmeDTO) {
        if (massnahmeDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.dbTranslateService.translateWithOrder(massnahmeDto, 'titel')
            });
        }
    }

    private sendTemplateToInfobar(massnahmeDto: MassnahmeDTO) {
        this.kuerzelMassnahmentyp = this.getKuerzelMassnahmentyp(massnahmeDto);
        this.massnahmeTitel = this.dbTranslateService.translateWithOrder(massnahmeDto, 'titel');

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }

    private getKuerzelMassnahmentyp(massnahmeDto: MassnahmeDTO): string {
        const kuerzel = massnahmeDto && massnahmeDto.produktObject.elementkategorieAmtObject ? massnahmeDto.produktObject.elementkategorieAmtObject.organisation : '';
        const massnahmentyp =
            massnahmeDto && massnahmeDto.produktObject.strukturelementGesetzObject
                ? this.dbTranslateService.translate(massnahmeDto.produktObject.strukturelementGesetzObject, 'elementName')
                : '';

        return kuerzel && massnahmentyp ? `${kuerzel} - ${massnahmentyp}` : kuerzel ? kuerzel : massnahmentyp ? massnahmentyp : '';
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

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.configureToolboxData());
    }

    private subscribeToToolbox(): Subscription {
        return (this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.massnahmeId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(+this.massnahmeId, AvamCommonValueObjectsEnum.T_MASSNAHME);
            }
        }));
    }

    private configureToolboxData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.MASSNAHME,
            vorlagenKategorien: [VorlagenKategorie.MASSNAHME],
            entityIDsMapping: { MASSNAHME_ID: this.massnahmeId }
        };
    }

    private openDmsCopyModal(massnahmeId: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_AMM_MASSNAHME_GRUNDDATEN;
        comp.id = massnahmeId.toString();
    }

    private openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }
}
