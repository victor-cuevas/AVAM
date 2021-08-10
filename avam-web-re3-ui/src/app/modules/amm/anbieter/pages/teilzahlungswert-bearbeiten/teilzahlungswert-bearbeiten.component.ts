import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { TeilzahlungswertService } from '@app/shared/services/teilzahlungswert.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TeilzahlungswertData, TeilzahlungswertFormComponent } from '../../components/teilzahlungswert-form/teilzahlungswert-form.component';

@Component({
    selector: 'avam-teilzahlungswert-bearbeiten',
    templateUrl: './teilzahlungswert-bearbeiten.component.html'
})
export class TeilzahlungswertBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('teilzahlungswertForm') teilzahlungswertForm: TeilzahlungswertFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    unternehmenId: number;
    vertragswertId: number;
    teilzahlungswertId: number;
    teilzahlungId: number;
    lvId: number;
    channel = 'teilzahlungswert-bearbeiten-channel';
    teilzahlungswertData: TeilzahlungswertData;
    buttons: Subject<any[]> = new Subject();
    vertragswertTypEnum = VertragswertTypCodeEnum;
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;

    constructor(
        private route: ActivatedRoute,
        private facade: FacadeService,
        private router: Router,
        private vertraegeRestService: VertraegeRestService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private teilzahlungswertService: TeilzahlungswertService
    ) {
        super();
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteData();

        this.facade.navigationService.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/teilzahlungswert', {
            vertragswertId: this.vertragswertId,
            teilzahlungswertId: this.teilzahlungswertId,
            lvId: this.lvId
        });
        this.subToNavClose();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.getData();
    }

    getRouteData() {
        this.route.parent.parent.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(res => {
            this.unternehmenId = +res.unternehmenId;
        });

        this.route.parent.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(res => {
            this.vertragswertId = +res.vertragswertId;
            this.teilzahlungswertId = +res.teilzahlungswertId;
            this.lvId = +res.lvId;
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin(this.vertraegeRestService.getTeilzahlungswert(this.teilzahlungswertId), this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS)).subscribe(
            ([teilzahlungswertDto, yesNoOptions]) => {
                if (teilzahlungswertDto.data) {
                    this.teilzahlungswertData = { teilzahlungswertParam: teilzahlungswertDto.data, dropdownOptions: yesNoOptions };
                    this.updateInfopanel();
                    this.buttons.next(teilzahlungswertDto.data.enabledActions);
                }

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.facade.openModalFensterService.openDmsCopyModal(
                        DmsMetadatenContext.DMS_CONTEXT_TEILZAHLUNGSWERT_BEARBEITEN,
                        this.teilzahlungswertData.teilzahlungswertParam.teilzahlungswert.teilzahlungswertNr.toString()
                    );
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.facade.openModalFensterService.openHistoryModal(this.teilzahlungswertId.toString(), AvamCommonValueObjectsEnum.T_TEILZAHLUNGSWERT);
                }
            });
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.TEILZAHLUNGSWERT,
            vorlagenKategorien: [VorlagenKategorie.TEILZAHLUNGSWERTDETAIL],
            entityIDsMapping: { TEILZAHLUNGSWERT_ID: this.teilzahlungswertId }
        };
    }

    updateInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.button.teilzahlungswertbearbeiten',
            hideInfobar: false
        });
        this.infopanelService.sendLastUpdate(this.teilzahlungswertData.teilzahlungswertParam.teilzahlungswert);
        this.infopanelService.appendToInforbar(this.panelTemplate);
    }

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.getData();
        });
    }

    reset() {
        this.teilzahlungswertForm.reset();
    }

    openDeleteDialog() {
        const modalRef = this.facade.openModalFensterService.openDeleteModal();
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    delete() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.vertraegeRestService.deleteTeilzahlungswert(this.teilzahlungswertForm.mapToDTO()).subscribe(
            res => {
                if (!res.warning) {
                    this.teilzahlungswertForm.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                    const navigateToUebersicht = this.teilzahlungswertService.getNavigateToUebersicht();

                    // BSP25, BSP26
                    if (this.teilzahlungswertData.teilzahlungswertParam.teilzahlungswert.vorgaengerObject) {
                        this.navigateToTeilzahlungswert(this.teilzahlungswertData.teilzahlungswertParam.teilzahlungswert.vorgaengerObject.teilzahlungswertId);
                    } else if (navigateToUebersicht) {
                        this.router.navigate([`amm/anbieter/${this.unternehmenId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte`], {
                            queryParams: {
                                lvId: this.lvId,
                                vertragswertId: this.vertragswertId
                            }
                        });
                    } else {
                        window.history.back();
                    }
                }

                this.deactivateSpinnerAndScrollToTop();
            },
            () => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.teilzahlungswertForm.formGroup.invalid) {
            this.teilzahlungswertForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.facade.spinnerService.activate(this.channel);

        this.vertraegeRestService.updateTeilzahlungswert(this.teilzahlungswertForm.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    if (response.data.teilzahlungswert.teilzahlungswertId !== this.teilzahlungswertId) {
                        this.navigateToTeilzahlungswert(response.data.teilzahlungswert.teilzahlungswertId);
                    }

                    this.teilzahlungswertData = { ...this.teilzahlungswertData, teilzahlungswertParam: response.data };
                    this.buttons.next(this.teilzahlungswertData.teilzahlungswertParam.enabledActions);
                    this.updateInfopanel();

                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
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

    navigateToTeilzahlung() {
        this.router.navigate([`amm/anbieter/${this.unternehmenId}/teilzahlungen/bearbeiten`], {
            queryParams: { teilzahlungId: this.teilzahlungswertData.teilzahlungswertParam.teilzahlungswert.teilzahlungSelected.teilzahlungId }
        });
    }

    navigateToTeilzahlungswert(teilzahlungswertId: number) {
        this.router.navigate([`amm/anbieter/${this.unternehmenId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/teilzahlungswert`], {
            queryParams: {
                lvId: this.lvId,
                vertragswertId: this.vertragswertId,
                teilzahlungswertId
            }
        });
    }

    subToNavClose() {
        // test with sidenav when added
        this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.router.navigate([`amm/anbieter/${this.unternehmenId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte`], {
                    queryParams: { lvId: this.lvId, vertragswertId: this.vertragswertId }
                });
            }
        });
    }

    deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
        this.teilzahlungswertService.setNavigateToUebersicht(false);
    }
}
