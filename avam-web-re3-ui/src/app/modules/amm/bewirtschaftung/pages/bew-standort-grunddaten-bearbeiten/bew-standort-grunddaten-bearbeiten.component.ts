import { SessionDTO } from '@dtos/sessionDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { Component, AfterViewInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { Subscription, forkJoin, Observable } from 'rxjs';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { GenericConfirmComponent } from '@app/shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { BewStandortGrunddatenData, BewStandortGrunddatenFormComponent } from '../../components/bew-standort-grunddaten-form/bew-standort-grunddaten-form.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@app/shared/services/navigation-service';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
@Component({
    selector: 'avam-bew-standort-grunddaten-bearbeiten',
    templateUrl: './bew-standort-grunddaten-bearbeiten.component.html'
})
export class BewStandortGrunddatenBearbeitenComponent implements AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewStandortGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'bew-standort-grunddaten-bearbeiten';
    grunddatenData: BewStandortGrunddatenData;
    observeClickActionSub: Subscription;
    langSubscription: Subscription;
    queryParamsSub: Subscription;
    permissions: typeof Permissions = Permissions;
    organisationInfoBar: string;
    massnahmeTitel: string;
    zulassungstyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
    erfassungsspracheIdGrunddatenState: number;
    isMassnahmeKollektiv: boolean;
    produktId: number;
    massnahmeId: number;
    dfeId: number;
    inPlanungAkquisitionSichtbar: boolean;
    isApBp: boolean;
    isUfPvbSemo: boolean;
    apkPraktikumsstelleVerwalten: boolean;

    constructor(
        private infopanelService: AmmInfopanelService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private ammHelper: AmmHelper,
        private router: Router,
        private bewirtschaftungNavigationHelper: AmmBewirtschaftungNavigationHelper,
        private facade: FacadeService,
        private navigationService: NavigationService
    ) {}

    ngAfterViewInit() {
        this.route.parent.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.queryParamsSub = this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
            this.dfeId = +params['dfeId'];

            this.getData();
        });

        this.subscribeToToolbox();
        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.updateSecondLabel(this.grunddatenData.standortDto);
            this.sendTemplateToInfobar(this.grunddatenData.standortDto);
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getDfeStandort(this.produktId, this.massnahmeId, this.dfeId),
            this.bewirtschaftungRestService.getStandortHoldsPraktikumsstellen(this.produktId, this.massnahmeId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VERFUEGBARKEITAMM),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SESSION_STATUS),
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS)
        ]).subscribe(
            ([standortResponse, standortHoldsPraktikumsstellenResponse, spracheOptionsResponse, verfuegbarkeitAmmResponse, sessionStatusResponse, yesNoResponse]) => {
                const standortDto = standortResponse.data;
                this.isApBp = standortHoldsPraktikumsstellenResponse.data;

                this.grunddatenData = {
                    standortDto,
                    erfassungsspracheOptions: spracheOptionsResponse,
                    verfuegbarkeitAmmOptions: verfuegbarkeitAmmResponse,
                    sessionStatusOptions: sessionStatusResponse,
                    sozialeAbfederungOptions: yesNoResponse,
                    isApBp: this.isApBp
                };

                if (standortResponse.data) {
                    this.isMassnahmeKollektiv = standortDto.massnahmeObject.zulassungstypObject.code === AmmZulassungstypCode.KOLLEKTIV;
                    this.inPlanungAkquisitionSichtbar = standortDto.inPlanungAkquisitionSichtbar;
                    this.apkPraktikumsstelleVerwalten = standortDto.apkPraktikumsstelleVerwalten;
                }

                this.bewirtschaftungNavigationHelper.setStandortDynamicNavigation(
                    this.massnahmeId,
                    this.dfeId,
                    this.apkPraktikumsstelleVerwalten,
                    this.isApBp,
                    this.inPlanungAkquisitionSichtbar
                );

                this.configureToolbox();
                this.updateSecondLabel(standortDto);
                this.sendTemplateToInfobar(standortDto);
                this.infopanelService.sendLastUpdate(standortDto);

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.grunddatenFormComponent.formGroup.invalid) {
            this.grunddatenFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.executeHttpMethod(this.bewirtschaftungRestService.saveDfeStandort(this.grunddatenFormComponent.mapToDTO(), this.facade.translateService.currentLang));
    }

    reset() {
        this.grunddatenFormComponent.reset();
    }

    openDeleteModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.deleteStandort();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    deleteStandort() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.deleteDfeStandort(this.produktId, this.massnahmeId, this.dfeId).subscribe(
            response => {
                if (!response) {
                    this.grunddatenFormComponent.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));

                    this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT);
                    this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/standorte`], {
                        queryParams: {
                            massnahmeId: this.massnahmeId
                        }
                    });
                    //add logic for "der Standort die Massnahme ab der Planung erfasst hat" BSP81
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    openVerwaltenModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.verwalten();
            }
        });

        modalRef.componentInstance.promptLabel = this.facade.translateService.instant('amm.massnahmen.message.standort.verwaltung.einfuehren', {
            0: this.isApBp
                ? this.facade.translateService.instant('amm.massnahmen.label.praktikumsstelle')
                : this.facade.translateService.instant('amm.massnahmen.label.arbeitsplatzkategorie'),
            1: this.facade.translateService.instant('amm.massnahmen.button.verwaltung.aufheben')
        });
        modalRef.componentInstance.primaryButton = 'amm.massnahmen.button.javerwalten';
    }

    verwalten() {
        this.executeHttpMethod(this.bewirtschaftungRestService.verwaltenDfeStandort(this.produktId, this.massnahmeId, this.dfeId));
    }

    openAufhebenModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.aufheben();
            }
        });

        modalRef.componentInstance.promptLabel = this.facade.translateService.instant('amm.massnahmen.message.standort.verwaltung.aufheben', {
            0: this.isApBp
                ? this.facade.translateService.instant('amm.massnahmen.label.praktikumsstelle')
                : this.facade.translateService.instant('amm.massnahmen.label.arbeitsplatzkategorie')
        });
        modalRef.componentInstance.primaryButton = 'common.button.jaFortfahren';
    }

    aufheben() {
        this.executeHttpMethod(this.bewirtschaftungRestService.aufhebenDfeStandort(this.produktId, this.massnahmeId, this.dfeId));
    }

    zurStandortplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.dfeId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    canDeactivate(): boolean {
        return this.grunddatenFormComponent.formGroup.dirty;
    }

    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.sendLastUpdate({}, true);
        this.infopanelService.updateInformation({ secondTitle: '' });
        this.langSubscription.unsubscribe();

        if (this.queryParamsSub) {
            this.queryParamsSub.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        if (this.isMassnahmeKollektiv) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.configureToolboxData());
    }

    private subscribeToToolbox(): Subscription {
        return (this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.dfeId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.dfeId, AvamCommonValueObjectsEnum.T_STANDORT);
            }
        }));
    }

    private openDmsCopyModal(dfeId: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_AMM_DFE_STANDORT_GRUNDDATEN;
        comp.id = dfeId.toString();
    }

    private openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }

    private configureToolboxData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.STANDORT,
            vorlagenKategorien: this.grunddatenData.standortDto.apkPraktikumsstelleVerwalten ? [VorlagenKategorie.STANDORT_MIT_APK] : [VorlagenKategorie.STANDORT_OHNE_APK],
            entityIDsMapping: { DFE_ID: this.dfeId }
        };
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.standort',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
        });
    }

    private updateSecondLabel(standortDto: SessionDTO) {
        if (standortDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.facade.dbTranslateService.translateWithOrder(standortDto, 'titel')
            });
        }
    }

    private sendTemplateToInfobar(standortDto: SessionDTO) {
        if (standortDto) {
            this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
                standortDto.massnahmeObject.produktObject.elementkategorieAmtObject,
                standortDto.massnahmeObject.produktObject.strukturelementGesetzObject
            );
            this.massnahmeTitel = this.facade.dbTranslateService.translateWithOrder(standortDto.massnahmeObject, 'titel');
            this.zulassungstyp = this.facade.dbTranslateService.translate(standortDto.massnahmeObject.zulassungstypObject, 'kurzText');
            this.provBurNr = standortDto.massnahmeObject.ammAnbieterObject.unternehmen.provBurNr;
            this.burNrToDisplay = this.provBurNr ? this.provBurNr : standortDto.massnahmeObject.ammAnbieterObject.unternehmen.burNummer;
            this.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
                standortDto.massnahmeObject.ammAnbieterObject.unternehmen.name1,
                standortDto.massnahmeObject.ammAnbieterObject.unternehmen.name2,
                standortDto.massnahmeObject.ammAnbieterObject.unternehmen.name3
            );
            this.unternehmenStatus = this.facade.dbTranslateService.translate(standortDto.massnahmeObject.ammAnbieterObject.unternehmen.statusObject, 'text');
        }

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }

    private executeHttpMethod = (httpMethod: Observable<any>, notificationMessage = 'common.message.datengespeichert') => {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        httpMethod.subscribe(
            standortResponse => {
                if (standortResponse.data) {
                    const standortDto = standortResponse.data;

                    this.grunddatenData = {
                        ...this.grunddatenData,
                        standortDto
                    };

                    this.inPlanungAkquisitionSichtbar = standortDto.inPlanungAkquisitionSichtbar;
                    this.apkPraktikumsstelleVerwalten = standortDto.apkPraktikumsstelleVerwalten;
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant(notificationMessage));
                    this.infopanelService.sendLastUpdate(standortDto);
                }

                this.bewirtschaftungNavigationHelper.setStandortDynamicNavigation(
                    this.massnahmeId,
                    this.dfeId,
                    this.apkPraktikumsstelleVerwalten,
                    this.isApBp,
                    this.inPlanungAkquisitionSichtbar
                );

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    };
}
