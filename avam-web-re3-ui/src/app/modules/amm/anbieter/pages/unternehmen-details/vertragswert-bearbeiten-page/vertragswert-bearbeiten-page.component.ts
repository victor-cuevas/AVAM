import { LeistungsvereinbarungDTO } from '@dtos/leistungsvereinbarungDTO';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { Component, OnDestroy, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FacadeService } from '@shared/services/facade.service';
import { VertragswertDetailFormComponent, VertragswertDetailData } from '@app/modules/amm/anbieter/components/vertragswert-detail-form/vertragswert-detail-form.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { Permissions } from '@shared/enums/permissions.enum';
import { VertragswertDTO } from '@dtos/vertragswertDTO';
import { VertragswertTypCodeEnum } from '@shared/enums/domain-code/vertragswert-typ-code.enum';
import { VertragswertMDTO } from '@dtos/vertragswertMDTO';
import { VertragswertDDTO } from '@dtos/vertragswertDDTO';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@shared/services/toolbox.service';
import { AmmVierAugenStatusCode } from '@shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import PrintHelper from '@shared/helpers/print.helper';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { AmmConstants } from '@shared/enums/amm-constants';
import { SpinnerService } from 'oblique-reactive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DmsService, GenericConfirmComponent } from '@app/shared';
import { LeistungsvereinbarungenNavigationService } from '../../../services/leistungsvereinbarungen-navigation.service';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';

@Component({
    selector: 'avam-vertragswert-bearbeiten-page',
    templateUrl: './vertragswert-bearbeiten-page.component.html'
})
export class VertragswertBearbeitenPageComponent implements AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('detailFormComponent') detailFormComponent: VertragswertDetailFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'vertragswert-bearbeiten-page-channel';
    vertragswertDetailData: VertragswertDetailData;
    langSubscription: Subscription;
    observeClickActionSub: Subscription;
    observeDokGenerated: Subscription;
    vertragswertId: number;
    anbieterId: number;
    permissions: typeof Permissions = Permissions;
    vertragswertDto: VertragswertDTO;
    vertragswertTypCodeEnum = VertragswertTypCodeEnum;
    titel: string;
    isGueltig: boolean;
    lvId: number;
    isPreismodellTypReadonly: boolean;
    isGueltigReadonly: boolean;
    referencedLv: LeistungsvereinbarungDTO;

    constructor(
        private infopanelService: AmmInfopanelService,
        private facade: FacadeService,
        private vertraegeRestService: VertraegeRestService,
        private stesDataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private navigation: LeistungsvereinbarungenNavigationService,
        private router: Router,
        private dmsService: DmsService
    ) {
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngAfterViewInit() {
        this.route.queryParams.subscribe(params => {
            this.vertragswertId = +params['vertragswertId'];
            this.lvId = +params['lvId'];
            this.getData();
        });
        this.route.parent.parent.parent.parent.params.subscribe(params => {
            this.anbieterId = +params['unternehmenId'];
        });

        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.appendToInforbar();
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.vertraegeRestService.getVertragswertDetailById(this.vertragswertId, this.lvId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.PREISMODELLTYP),
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS)
        ]).subscribe(
            ([detailResponse, preismodellTypOptionsResponse, yesNoOptionsResponse]) => {
                this.vertragswertDto = detailResponse.data;
                this.referencedLv = this.vertragswertDto.leistungsvereinbarungList.find(lv => lv.leistungsvereinbarungId === this.lvId);

                this.vertragswertDetailData = {
                    vertragswertDto: this.vertragswertDto,
                    preismodellTypOptions: preismodellTypOptionsResponse,
                    yesNoOptions: yesNoOptionsResponse,
                    referencedLv: this.referencedLv
                };

                if (ToolboxService.CHANNEL === this.channel) {
                    this.configureToolbox();
                    this.appendToInforbar();
                }

                this.showAbrechnungswertSideNavigation(this.vertragswertDto.abrechnungswertId, this.vertragswertId, this.lvId);

                const lvStatusCode = this.referencedLv.statusObject.code;

                const lvStatusReadonly = this.lvStatusCheckReadonly(lvStatusCode);
                this.isPreismodellTypReadonly = !this.vertragswertDto.gueltigB || lvStatusReadonly;
                this.isGueltigReadonly = lvStatusReadonly || (!this.vertragswertDto.vorgaengerObject && this.vertragswertDto.leistungsvereinbarungList.length === 1);

                this.infopanelService.sendLastUpdate(this.vertragswertDto);
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

        if (this.detailFormComponent.formGroup.invalid) {
            this.detailFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        const formGueltigVon = this.facade.formUtilsService.parseDate(this.detailFormComponent.formGroup.controls.gueltigVon.value);
        const formGueltigBis = this.facade.formUtilsService.parseDate(this.detailFormComponent.formGroup.controls.gueltigBis.value);
        const dtoGueltigVon = this.facade.formUtilsService.parseDate(this.vertragswertDetailData.vertragswertDto.gueltigVon);
        const dtoGueltigBis = this.facade.formUtilsService.parseDate(this.vertragswertDetailData.vertragswertDto.gueltigBis);

        if (
            this.isGueltig &&
            this.vertragswertDto.leistungsvereinbarungList.length === 1 &&
            (formGueltigVon.getFullYear() !== dtoGueltigVon.getFullYear() || formGueltigBis.getFullYear() !== dtoGueltigBis.getFullYear())
        ) {
            this.openSaveModal();
        } else {
            this.save();
        }
    }

    openSaveModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.save();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.save';
        modalRef.componentInstance.promptLabel = 'amm.akquisition.message.confirmvwsave';
        modalRef.componentInstance.primaryButton = 'common.button.jaSpeichern';
        modalRef.componentInstance.secondaryButton = 'common.button.abbrechen';
    }

    save() {
        this.facade.spinnerService.activate(this.channel);

        this.vertraegeRestService.saveVertragswert(this.detailFormComponent.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.referencedLv = response.data.leistungsvereinbarungList.find(lv => lv.leistungsvereinbarungId === this.lvId);

                    this.vertragswertDetailData = {
                        ...this.vertragswertDetailData,
                        vertragswertDto: response.data,
                        referencedLv: this.referencedLv
                    };

                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                }

                this.infopanelService.sendLastUpdate(response.data);
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    zurMassnahme() {
        this.router.navigate(
            [`amm/bewirtschaftung/produkt/${(this.vertragswertDto as VertragswertMDTO).massnahmeObject.produktObject.produktId}/massnahmen/massnahme/grunddaten`],
            { queryParams: { massnahmeId: (this.vertragswertDto as VertragswertMDTO).massnahmeObject.massnahmeId } }
        );
    }

    zumKurs() {
        this.router.navigate(
            [
                `amm/bewirtschaftung/produkt/${
                    (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.massnahmeObject.produktObject.produktId
                }/massnahmen/massnahme/kurse/kurs/grunddaten`
            ],
            {
                queryParams: {
                    dfeId: (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.durchfuehrungsId,
                    massnahmeId: (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.massnahmeObject.massnahmeId
                }
            }
        );
    }

    zumStandort() {
        this.router.navigate(
            [
                `amm/bewirtschaftung/produkt/${
                    (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.massnahmeObject.produktObject.produktId
                }/massnahmen/massnahme/standorte/standort/grunddaten`
            ],
            {
                queryParams: {
                    dfeId: (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.durchfuehrungsId,
                    massnahmeId: (this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject.massnahmeObject.massnahmeId
                }
            }
        );
    }

    calculate() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.detailFormComponent.formGroup.invalid) {
            this.detailFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.facade.spinnerService.activate(this.channel);

        this.vertraegeRestService.berechnenVertragswertDetail(this.detailFormComponent.mapToDTO()).subscribe(
            berechnenResponse => {
                if (berechnenResponse.data) {
                    const isFormDirty = this.detailFormComponent.formGroup.dirty;
                    this.vertragswertDetailData = { ...this.vertragswertDetailData, vertragswertDto: berechnenResponse.data, preserveFormDirty: isFormDirty };
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.planundakqui.message.berechnet'));
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

    abrechnungswertErfassen() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/erfassen`], {
            queryParams: { lvId: this.vertragswertDto.leistungsvereinbarungObject.leistungsvereinbarungId, vertragswertId: this.vertragswertId }
        });
    }

    openDeleteModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.deleteVertragswert();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    onGuelitgChange(isGueltig: boolean) {
        this.isGueltig = isGueltig;
    }

    ngOnDestroy(): void {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.sendLastUpdate({}, true);

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }

        if (this.observeDokGenerated) {
            this.observeDokGenerated.unsubscribe();
        }

        this.facade.fehlermeldungenService.closeMessage();
    }

    canDeactivate() {
        return this.detailFormComponent.formGroup.dirty;
    }

    private lvStatusCheckReadonly(lvStatusCode: string): boolean {
        return lvStatusCode === AmmVierAugenStatusCode.FREIGABEBEREIT || lvStatusCode === AmmVierAugenStatusCode.FREIGEGEBEN || lvStatusCode === AmmVierAugenStatusCode.ERSETZT;
    }

    private initInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.subnavmenuitem.vertragswertdetail'
        });
    }

    private appendToInforbar() {
        if (this.vertragswertDto.typ.code === VertragswertTypCodeEnum.MASSNAHME) {
            this.titel = this.facade.dbTranslateService.translateWithOrder((this.vertragswertDto as VertragswertMDTO).massnahmeObject, 'titel');
        } else {
            this.titel = this.facade.dbTranslateService.translateWithOrder((this.vertragswertDto as VertragswertDDTO).durchfuehrungseinheitObject, 'titel');
        }

        this.infopanelService.appendToInforbar(this.infobarTemplate);
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        if (this.vertragswertDto.leistungsvereinbarungObject.statusObject.code !== AmmVierAugenStatusCode.ERSETZT) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_VERTRAGSWERT_BEARBEITEN, this.vertragswertDto.vertragswertNr.toString());
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.facade.openModalFensterService.openHistoryModal(this.vertragswertId.toString(), AvamCommonValueObjectsEnum.T_VERTRAGSWERT, AmmConstants.WERTTRIPEL_OBJECT);
            }
        });

        if (this.observeDokGenerated) {
            this.observeDokGenerated.unsubscribe();
        }
        this.observeDokGenerated = this.dmsService.observeDokGenerated().subscribe((data: DokumentVorlageToolboxData) => {
            if (data.targetEntity === DokumentVorlageActionDTO.TargetEntityEnum.VERTRAGSWERT) {
                this.getData();
            }
        });
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.VERTRAGSWERT,
            vorlagenKategorien: [VorlagenKategorie.VERTRAGSWERTDETAIL],
            entityIDsMapping: { VERTRAGSWERT_ID: this.vertragswertId }
        };
    }

    private showAbrechnungswertSideNavigation(abrechnungswertId: number, vertragswertId: number, lvId: number) {
        if (abrechnungswertId !== 0) {
            this.navigation.setVertragswertDynamicNavigation(vertragswertId, lvId, abrechnungswertId);
        } else {
            this.navigation.removeVertragswertDynamicNavigation();
        }
    }

    private deleteVertragswert() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.vertraegeRestService.deleteVertragswert(this.vertragswertId).subscribe(
            response => {
                if (!response) {
                    this.detailFormComponent.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));

                    if (this.vertragswertDto.vorgaengerObject) {
                        this.router.navigate([], {
                            queryParams: { vertragswertId: this.vertragswertDto.vorgaengerObject.vertragswertId },
                            relativeTo: this.route
                        });
                    } else {
                        this.router.navigate(['../../'], {
                            queryParams: { lvId: this.vertragswertDto.leistungsvereinbarungObject.leistungsvereinbarungId },
                            relativeTo: this.route
                        });
                    }
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
}
