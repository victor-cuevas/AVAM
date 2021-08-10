import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmAdministrationRestService } from '@app/modules/amm/administration/services/amm-administration-rest.service';
import { DmsService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperRahmenvertragDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperRahmenvertragDTOWarningMessages';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { LeistungsvereinbarungDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { RahmenvertragData, RahmenvertragFormComponent } from '../../../components/rahmenvertrag-form/rahmenvertrag-form.component';
import { RahmenvertragService } from '../../../services/rahmenvertrag.service';

enum ActionEnum {
    SAVE,
    DELETE,
    ZURUECKNEHMEN,
    FREIGEBEN,
    UEBERARBEITEN,
    ERSETZEN
}
@Component({
    selector: 'avam-rahmenvertrag-bearbeiten',
    templateUrl: './rahmenvertrag-bearbeiten.component.html',
    styleUrls: ['./rahmenvertrag-bearbeiten.component.scss']
})
export class RahmenvertragBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('rahmenvertragForm') rahmenvertragForm: RahmenvertragFormComponent;

    tableDataSource = [];
    rahmenvertragData: RahmenvertragData;
    channel = 'rahmenvertrag-bearbeiten-channel';
    unternehmenId: number;
    rahmenvertragId: number;
    buttons: Subject<any[]> = new Subject();
    buttonsEnum: typeof AmmButtonsTypeEnum = AmmButtonsTypeEnum;
    action = ActionEnum;

    constructor(
        private facade: FacadeService,
        private route: ActivatedRoute,
        private router: Router,
        private vertraegeService: VertraegeRestService,
        private stesDataRestService: StesDataRestService,
        private rahmenvertragService: RahmenvertragService,
        private infopanelService: AmmInfopanelService,
        private administrationRestService: AmmAdministrationRestService,
        private interactionService: StesComponentInteractionService,
        private dmsService: DmsService
    ) {
        super();
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToNavClose();
        this.getRahmenvertragId();
        this.getUnternehmenId();
        this.subscribeToToolbox();
        this.initInfopanel();
    }

    ngAfterViewInit() {
        this.showSideNavigation();
    }

    getUnternehmenId() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            this.unternehmenId = data['unternehmenId'];
        });
    }

    getRahmenvertragId() {
        this.route.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.rahmenvertragId = +params.rahmenvertragId;
            this.getData();
        });
    }

    initInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.subnavmenuitem.rahmenvertrag'
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);
        const gueltigVon = new Date();

        forkJoin(
            this.vertraegeService.getRahmenvertragStatusOptions(this.rahmenvertragId),
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS),
            this.administrationRestService.getGesetzlicheMassnahmentypListeOhneSpez(gueltigVon),
            this.vertraegeService.getRahmenvertrag(this.rahmenvertragId),
            this.vertraegeService.getRahmenvertragLeistungsvereinbarungen(this.rahmenvertragId),
            this.vertraegeService.getRahmenvertragButtons(this.rahmenvertragId)
        ).subscribe(
            ([statusOptionsResponse, gueltigOptionsResponse, massnahmeOptionsResponse, rahmenvertragDTO, leistungsvereinbarungen, buttons]) => {
                this.rahmenvertragData = {
                    rahmenvertragDto: rahmenvertragDTO.data,
                    statusOptions: statusOptionsResponse.data,
                    gueltigOptions: gueltigOptionsResponse,
                    massnahmeOptions: massnahmeOptionsResponse.data,
                    leistungsvereinbarungen: leistungsvereinbarungen.data
                };

                this.buttons.next(buttons.data);
                this.infopanelService.sendLastUpdate(rahmenvertragDTO.data);
                this.configureToolbox();

                this.tableDataSource = leistungsvereinbarungen.data.map(el => this.createLeistungsvereinbarungenRow(el));

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

        if (
            this.rahmenvertragData &&
            this.rahmenvertragData.rahmenvertragDto &&
            this.rahmenvertragData.rahmenvertragDto.statusObject &&
            this.rahmenvertragData.rahmenvertragDto.statusObject.code !== AmmVierAugenStatusCode.ERSETZT
        ) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

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
                        DmsMetadatenContext.DMS_CONTEXT_RAHMENVERTRAG_BEARBEITEN,
                        this.rahmenvertragData.rahmenvertragDto.rahmenvertragNr.toString()
                    );
                }
            });

        this.dmsService
            .observeDokGenerated()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((data: DokumentVorlageToolboxData) => {
                if (data.targetEntity === DokumentVorlageActionDTO.TargetEntityEnum.RAHMENVERTRAG) {
                    this.getData();
                }
            });
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.RAHMENVERTRAG,
            vorlagenKategorien: [VorlagenKategorie.RAHMENVERTRAG],
            entityIDsMapping: { RAHMENVERTRAG_ID: this.rahmenvertragId }
        };
    }

    createLeistungsvereinbarungenRow(data: LeistungsvereinbarungDTO) {
        return {
            leistungsvereinbarungNr: data.leistungsvereinbarungNr || '',
            titel: data.titel || '',
            gueltigVon: this.facade.formUtilsService.parseDate(data.gueltigVon),
            gueltigBis: this.facade.formUtilsService.parseDate(data.gueltigBis),
            status: this.facade.dbTranslateService.translateWithOrder(data.statusObject, 'kurzText'),
            leistungsvereinbarungId: data.leistungsvereinbarungId || ''
        };
    }

    subscribeToNavClose() {
        return this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    if (this.canDeactivate()) {
                        this.router.navigate([`amm/anbieter/${this.unternehmenId}/rahmenvertraege`]);

                        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
                            if (okClicked) {
                                this.facade.navigationService.hideNavigationTreeRoute('./rahmenvertraege/bearbeiten');
                            }
                        });
                    } else {
                        this.facade.navigationService.hideNavigationTreeRoute('./rahmenvertraege/bearbeiten');
                        this.router.navigate([`amm/anbieter/${this.unternehmenId}/rahmenvertraege`]);
                    }
                }
            });
    }

    update(action: ActionEnum) {
        if (this.isFormValid()) {
            this.facade.fehlermeldungenService.closeMessage();
            const update = this.getUpdate(action);

            if (!update) {
                return;
            }

            this.facade.spinnerService.activate(this.channel);

            update.subscribe(
                response => {
                    if (response.data) {
                        this.router.navigate([`amm/anbieter/${this.unternehmenId}/rahmenvertraege/bearbeiten`], {
                            queryParams: { rahmenvertragId: response.data.rahmenvertragId }
                        });
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    } else {
                        const shouldInvertGueltig = response.warning.find(element => {
                            return element.values.key === 'amm.akquisition.error.ungueltigrahmenvertragleistungsvereinbarung';
                        });

                        if (shouldInvertGueltig) {
                            this.rahmenvertragForm.formGroup.controls.gueltigDropdown.setValue(1);
                        }
                    }
                    this.deactivateSpinnerAndScrollToTop();
                },
                error => {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
        }
    }

    getUpdate(action: ActionEnum): Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages> | undefined {
        switch (action) {
            case ActionEnum.ERSETZEN:
                return this.vertraegeService.rahmenvertragErsetzen(this.rahmenvertragId);
            case ActionEnum.UEBERARBEITEN:
                return this.vertraegeService.rahmenvertragUeberarbeiten(this.rahmenvertragId);
            case ActionEnum.ZURUECKNEHMEN:
                return this.vertraegeService.rahmenvertragZuruecknehmen(this.rahmenvertragId);
            case ActionEnum.FREIGEBEN:
                return this.vertraegeService.rahmenvertragFreigeben(this.rahmenvertragId);
            case ActionEnum.SAVE:
                return this.vertraegeService.updateRahmenvertrag(this.rahmenvertragForm.mapToDTO(this.unternehmenId));
            default:
                break;
        }
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

        this.vertraegeService.deleteRahmenvertrag(this.rahmenvertragId).subscribe(
            res => {
                if (!res.warning) {
                    this.rahmenvertragForm.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                    const navigateToUebersicht = this.rahmenvertragService.getNavigateToUebersicht();

                    if (this.rahmenvertragData.rahmenvertragDto.vorgaengerObject) {
                        this.router.navigate([`amm/anbieter/${this.unternehmenId}/rahmenvertraege/bearbeiten`], {
                            queryParams: {
                                rahmenvertragId: this.rahmenvertragData.rahmenvertragDto.vorgaengerObject.rahmenvertragId
                            }
                        });
                    } else if (navigateToUebersicht) {
                        this.rahmenvertragService.setNavigateToUebersicht(false);
                        this.router.navigate([`amm/anbieter/${this.unternehmenId}/rahmenvertraege`]);
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

    isFormValid(): boolean {
        if (!this.rahmenvertragForm.formGroup.valid) {
            this.rahmenvertragForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return false;
        }
        return true;
    }

    reset() {
        this.rahmenvertragForm.reset();
    }

    leistungsvereinbarungErfassen() {
        this.router.navigate([`amm/anbieter/${this.unternehmenId}/leistungsvereinbarungen/erfassen`], { queryParams: { rahmenvertragId: this.rahmenvertragId } });
    }

    showSideNavigation() {
        this.facade.navigationService.showNavigationTreeRoute('./rahmenvertraege/bearbeiten', { rahmenvertragId: this.rahmenvertragId });
    }

    canDeactivate() {
        return this.rahmenvertragForm.formGroup.dirty;
    }

    deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    lvSelected(lvRow) {
        if (lvRow && lvRow.leistungsvereinbarungId) {
            this.router.navigate([`/amm/anbieter/${this.unternehmenId}/leistungsvereinbarungen/leistungsvereinbarung`], {
                queryParams: { lvId: lvRow.leistungsvereinbarungId, rahmenvertragId: this.rahmenvertragId }
            });
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
    }
}
