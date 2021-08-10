import { Permissions } from '@shared/enums/permissions.enum';
import { Component, AfterViewInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { BewBeschaeftigungseinheitGrunddatenFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BewBeschaeftigungseinheitGrunddatenData } from '../../components/bew-beschaeftigungseinheit-grunddaten-form/bew-beschaeftigungseinheit-grunddaten-form.component';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { BeschaeftigungseinheitDTO } from '@app/shared/models/dtos-generated/beschaeftigungseinheitDTO';
import { StandortDTO } from '@app/shared/models/dtos-generated/standortDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { GenericConfirmComponent } from '@app/shared';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';

@Component({
    selector: 'avam-bew-bee-grunddaten-bearbeiten',
    templateUrl: './bew-bee-grunddaten-bearbeiten.component.html'
})
export class BewBeeGrunddatenBearbeitenComponent implements AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewBeschaeftigungseinheitGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'bewirtschaftung-bee-grunddaten-bearbeiten';
    beschaeftigungseinheitData: BewBeschaeftigungseinheitGrunddatenData;
    observeClickActionSub: Subscription;
    langSubscription: Subscription;
    permissions: typeof Permissions = Permissions;
    beId: number;
    erfassungsspracheIdGrunddatenState: number;
    isPraktikumsstelle: boolean;
    organisationInfoBar: string;
    standortTitel: string;
    zulassungstyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
    dfeId: number;
    showDeleteButton: boolean;
    massnahmeId: number;
    produktId: number;

    constructor(
        private infopanelService: AmmInfopanelService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private facade: FacadeService,
        private modalService: NgbModal,
        private ammHelper: AmmHelper,
        private router: Router
    ) {}

    ngAfterViewInit() {
        this.route.parent.parent.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
            this.dfeId = +params['dfeId'];
            this.beId = +params['beId'];
        });

        this.subscribeToToolbox();
        this.getData();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.updateSecondLabel(this.beschaeftigungseinheitData.beDto);
            this.sendTemplateToInfobar(this.beschaeftigungseinheitData.beDto);
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getBeschaeftigungseinheit(this.beId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VERFUEGBARKEITAMM),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SESSION_STATUS)
        ]).subscribe(
            ([beResponse, spracheOptionsResponse, verfuegbarkeitAmmResponse, sessionStatusResponse]) => {
                const standortDto = beResponse.data;
                let beDto;

                if (standortDto) {
                    this.showDeleteButton = standortDto.beschaeftigungseinheitenCount > 1;
                    beDto = standortDto.beschaeftigungseinheiten[0];
                }

                if (beDto) {
                    this.isPraktikumsstelle = beDto.type === AmmConstants.PRAKTIKUMSSTELLE;
                    this.facade.messageBus.buildAndSend('footer-infos.formNumber', {
                        formNumber: this.isPraktikumsstelle ? AmmFormNumberEnum.BEW_PRAKTIKUMSSTELLE_GRUNDDATEN : AmmFormNumberEnum.BEW_ARBEITSPLATZKATEGORIE_GRUNDDATEN
                    });
                }

                this.beschaeftigungseinheitData = {
                    standortDto,
                    beDto,
                    erfassungsspracheOptions: spracheOptionsResponse,
                    verfuegbarkeitAmmOptions: verfuegbarkeitAmmResponse,
                    sessionStatusOptions: sessionStatusResponse,
                    isPraktikumsstelle: this.isPraktikumsstelle
                };

                this.initInfopanel();
                this.updateSecondLabel(beDto);
                this.sendTemplateToInfobar(standortDto);
                this.infopanelService.sendLastUpdate(beDto);
                this.configureToolbox();

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
        this.facade.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.saveBeschaeftigungseinheit(this.grunddatenFormComponent.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    const standortDto = response.data;
                    const beDto = standortDto.beschaeftigungseinheiten[0];

                    this.beschaeftigungseinheitData = {
                        ...this.beschaeftigungseinheitData,
                        standortDto,
                        beDto
                    };

                    this.showDeleteButton = standortDto.beschaeftigungseinheitenCount > 1;
                    this.infopanelService.sendLastUpdate(beDto);
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    openDeleteModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    delete() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.deleteBeschaeftigungseinheit(this.beId).subscribe(
            response => {
                if (!response) {
                    this.grunddatenFormComponent.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));

                    this.facade.navigationService.hideNavigationTreeRoute(
                        this.isPraktikumsstelle ? AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE : AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE
                    );
                    this.router.navigate(
                        [
                            `amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/standorte/standort/${
                                this.isPraktikumsstelle ? 'praktikumsstellen' : 'arbeitsplatzkategorien'
                            }`
                        ],
                        {
                            queryParams: { massnahmeId: this.massnahmeId, dfeId: this.dfeId }
                        }
                    );
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

    canDeactivate(): boolean {
        return this.grunddatenFormComponent.formGroup.dirty;
    }

    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.sendLastUpdate({}, true);
        this.infopanelService.updateInformation({ secondTitle: '' });
        this.langSubscription.unsubscribe();

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
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.configureToolboxData());
    }

    private subscribeToToolbox(): Subscription {
        return (this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.dfeId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(
                    this.beId,
                    this.isPraktikumsstelle ? AvamCommonValueObjectsEnum.T_PRAKTIKUMSSTELLE : AvamCommonValueObjectsEnum.T_ARBEITSPLATZKATEGORIE,
                    AmmConstants.ZEITPLAN_VERFUEGBARKEIT_OBJECT
                );
            }
        }));
    }

    private openDmsCopyModal(dfeId: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_AMM_DFE_STANDORT_GRUNDDATEN;
        comp.id = dfeId.toString();
    }

    private openHistoryModal(objId: number, objType: string, ref: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
        comp.ref = ref;
    }

    private configureToolboxData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.BESCHAEFTIGUNGSEINHEIT,
            vorlagenKategorien: this.isPraktikumsstelle ? [VorlagenKategorie.PRAKTIKUMSSTELLE] : [VorlagenKategorie.ARBEITSPLATZKATEGORIE],
            entityIDsMapping: {
                DFE_ID: this.dfeId,
                UNTERNEHMEN_ID: this.isPraktikumsstelle ? this.beschaeftigungseinheitData.standortDto.massnahmeObject.ammAnbieterObject.unternehmenId : null,
                BESCHAEFTIGUNGSEINHEIT_ID: this.beId
            }
        };
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: this.isPraktikumsstelle ? 'amm.massnahmen.label.praktikumsstelle' : 'amm.massnahmen.label.arbeitsplatzkategorie',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
        });
    }

    private updateSecondLabel(beDto: BeschaeftigungseinheitDTO) {
        if (beDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.facade.dbTranslateService.translateWithOrder(beDto, 'titel')
            });
        }
    }

    private sendTemplateToInfobar(standortDto: StandortDTO) {
        if (standortDto) {
            this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
                standortDto.massnahmeObject.produktObject.elementkategorieAmtObject,
                standortDto.massnahmeObject.produktObject.strukturelementGesetzObject
            );
            this.standortTitel = this.facade.dbTranslateService.translateWithOrder(standortDto, 'titel');
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
}
