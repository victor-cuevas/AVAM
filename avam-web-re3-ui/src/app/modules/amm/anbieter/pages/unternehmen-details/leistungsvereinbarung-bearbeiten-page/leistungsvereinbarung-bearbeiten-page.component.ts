import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FacadeService } from '@app/shared/services/facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LeistungsvereinbarungData, LeistungsvereinbarungFormComponent } from '../../../components/leistungsvereinbarung-form/leistungsvereinbarung-form.component';
import { VertragswerteTableComponent } from '../../../components/leistungsvereinbarung-form/vertragswerte-table/vertragswerte-table.component';
import { of, Observable, forkJoin, Subject, Subscription } from 'rxjs';
import { BaseResponseWrapperRahmenvertragDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperRahmenvertragDTOWarningMessages';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { VertragswertViewDTO } from '@app/shared/models/dtos-generated/vertragswertViewDTO';
import { DmsService, FormatSwissFrancPipe, GenericConfirmComponent } from '@app/shared';
import { VertragswertContainerDTO } from '@app/shared/models/dtos-generated/vertragswertContainerDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BaseResponseWrapperVertragswertContainerDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperVertragswertContainerDTOWarningMessages';
import { BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperLeistungsvereinbarungDTOWarningMessages';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { LeistungsvereinbarungenNavigationService } from '../../../services/leistungsvereinbarungen-navigation.service';

@Component({
    selector: 'avam-leistungsvereinbarung-bearbeiten-page',
    templateUrl: './leistungsvereinbarung-bearbeiten-page.component.html',
    providers: [FormatSwissFrancPipe]
})
export class LeistungsvereinbarungBearbeitenPageComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'leistungsvereinbarung-bearbeiten';

    public get CHANNEL_STATE_KEY() {
        return LeistungsvereinbarungBearbeitenPageComponent.CHANNEL_STATE_KEY;
    }

    @ViewChild('form') lvFormComponent: LeistungsvereinbarungFormComponent;
    @ViewChild('table') vertragswerteTableComponent: VertragswerteTableComponent;
    @ViewChild('auszahlungenModal') auszahlungenModal: ElementRef;

    lvId: number;
    lvData: LeistungsvereinbarungData;
    dataSource;
    vertragswerteLastUpdate: VertragswertContainerDTO;
    ersetzenMsg: string;

    chfTotal: string | number;
    tnTageTotal: number;
    tnTotal: number;

    ammButtonsTypeEnum: typeof AmmButtonsTypeEnum = AmmButtonsTypeEnum;
    buttons: Subject<any[]> = new Subject();
    enabledButtons = [];
    pendentOrInUeberarbeitung = false;
    langChangeSubscription: Subscription;
    observeClickActionSub: Subscription;
    messageBusSub: Subscription;
    observeDokGenerated: Subscription;

    constructor(
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private anbieterRestService: AnbieterRestService,
        private vertraegeRestService: VertraegeRestService,
        private modalService: NgbModal,
        private router: Router,
        private route: ActivatedRoute,
        private formatSwissFrancPipe: FormatSwissFrancPipe,
        private navigationService: LeistungsvereinbarungenNavigationService,
        private dmsService: DmsService
    ) {}

    ngOnInit() {
        this.lvData = { lvDto: {}, statusOptions: [] };

        this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.mapVertragswerteContainer(this.vertragswerteLastUpdate);
        });
    }

    ngAfterViewInit() {
        this.route.parent.parent.params.subscribe(params => {
            this.lvData = { ...this.lvData, anbieterId: +params['unternehmenId'] };
        });

        this.route.queryParams.subscribe(params => {
            this.lvId = +params['lvId'];

            const rahmenvertragId = +params['rahmenvertragId'];

            this.lvData = {
                ...this.lvData,
                rahmenvertragId,
                hasInitialRahmenvertrag: !!rahmenvertragId
            };

            this.getData();
            this.initInfopanel();
        });

        this.navigationService.setLeistungsvereinbarungStaticNavigation(this.lvId);

        this.messageBusSub = this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.close();
            }
        });
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.navigationService.removeLeistungsvereinbarungStaticNavigation();
        this.langChangeSubscription.unsubscribe();
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        if (this.observeDokGenerated) {
            this.observeDokGenerated.unsubscribe();
        }
        this.messageBusSub.unsubscribe();
        this.infopanelService.sendLastUpdate({}, true);
    }

    canDeactivate() {
        return this.lvFormComponent.formGroup.dirty;
    }

    getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        const getLeistungsvereinbarung = this.anbieterRestService.getLeistungsvereinbarungById(this.lvId);
        const getVertragswerteContainer = this.vertraegeRestService.getVertragswertContainerByLvId(this.lvId);

        const getStatusOptions = this.anbieterRestService.getLeistungsvereinbarungStati(this.lvId);
        const getButtons = this.anbieterRestService.getLeistungsvereinbarungButtons(this.lvId);

        const getRahmenvertrag = this.lvData.rahmenvertragId
            ? this.vertraegeRestService.getRahmenvertrag(this.lvData.rahmenvertragId)
            : of(null as Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages>);

        forkJoin([getStatusOptions, getButtons, getRahmenvertrag, getLeistungsvereinbarung, getVertragswerteContainer]).subscribe(
            ([statusOptionsResponse, buttons, rahmenvertragResponse, lvResponse, vertragswerteResponse]) => {
                this.lvData = { ...this.lvData, statusOptions: statusOptionsResponse.data };
                this.buttons.next(buttons.data);
                this.enabledButtons = buttons.data;
                this.pendentOrInUeberarbeitung =
                    lvResponse.data.statusObject.code === AmmVierAugenStatusCode.PENDENT || lvResponse.data.statusObject.code === AmmVierAugenStatusCode.INUEBERARBEITUNG;

                if (rahmenvertragResponse && rahmenvertragResponse.data) {
                    this.lvData = { ...this.lvData, rahmenvertragDto: rahmenvertragResponse.data };
                }

                if (lvResponse && lvResponse.data) {
                    this.lvData = {
                        ...this.lvData,
                        lvDto: lvResponse.data,
                        rahmenvertragDto: lvResponse.data.rahmenvertragObject,
                        rahmenvertragId: lvResponse.data.rahmenvertragObject ? lvResponse.data.rahmenvertragObject.rahmenvertragId : null,
                        hasInitialRahmenvertrag: !!lvResponse.data && !!lvResponse.data.rahmenvertragObject
                    };
                    this.infopanelService.sendLastUpdate(this.lvData.lvDto);
                }

                this.configureToolbox();
                this.handleVertragswerteResponse(vertragswerteResponse);

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    close() {
        this.router.navigate([`amm/anbieter/${this.lvData.anbieterId}/leistungsvereinbarungen`]);
    }

    openErsetzenModal() {
        this.ersetzenMsg = this.facade.translateService.instant('amm.akquisition.message.lversetzenbestaetigen');
        const force = this.getForce();
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.ersetzen(force);
            }
        });
        modalRef.componentInstance.promptLabel = this.ersetzenMsg;
        modalRef.componentInstance.primaryButton = 'common.button.jaErsetzen';
    }

    ersetzen(force: boolean) {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.anbieterRestService.leistungsvereinbarungErsetzen(this.lvId, force).subscribe(
            lvResponse => {
                if (lvResponse.data) {
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    this.router.navigate([`/amm/anbieter/${this.lvData.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
                        queryParams: { lvId: lvResponse.data.leistungsvereinbarungId }
                    });
                    this.navigationService.setLeistungsvereinbarungStaticNavigation(lvResponse.data.leistungsvereinbarungId);
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.handleHttpError();
            }
        );
    }

    ueberarbeiten() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.anbieterRestService.leistungsvereinbarungUeberarbeiten(this.lvFormComponent.mapToDTO()).subscribe(
            lvResponse => {
                this.handleLvResponseOnStatusUpdated(lvResponse);
            },
            () => {
                this.handleHttpError();
            }
        );
    }

    freigeben() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        this.lvFormComponent.appendCurrentUserToFreigabeDurch();

        this.anbieterRestService.leistungsvereinbarungFreigeben(this.lvId).subscribe(
            lvResponse => {
                this.handleLvResponseOnStatusUpdated(lvResponse);
            },
            () => {
                this.handleHttpError();
            }
        );
    }

    zuruecknehmen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.anbieterRestService.leistungsvereinbarungZuruecknehmen(this.lvId).subscribe(
            lvResponse => {
                this.handleLvResponseOnStatusUpdated(lvResponse);
            },
            () => {
                this.handleHttpError();
            }
        );
    }

    vertragswertErfassen() {
        this.router.navigate([`amm/anbieter/${this.lvData.anbieterId}/vertragswert/erfassen/objekt-auswaehlen`], {
            queryParams: { lvId: this.lvId }
        });
    }

    openDeleteModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.deleteLeistungsvereinbarung();
            }
        });

        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.lvFormComponent.formGroup.invalid) {
            this.lvFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    onItemSelected(selectedId) {
        this.router.navigate([`amm/anbieter/${this.lvData.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/detail`], {
            queryParams: { vertragswertId: selectedId, lvId: this.lvId }
        });
    }

    private save() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.anbieterRestService.leistungsvereinbarungSave(this.lvFormComponent.mapToDTO()).subscribe(
            lvResponse => {
                this.handleLvResponseOnStatusUpdated(lvResponse);
            },
            () => {
                this.handleHttpError();
            }
        );
    }

    private handleLvResponseOnStatusUpdated(lvResponse: BaseResponseWrapperLeistungsvereinbarungDTOWarningMessages) {
        if (lvResponse.data) {
            this.lvData = { ...this.lvData, lvDto: lvResponse.data };
            this.infopanelService.sendLastUpdate(this.lvData.lvDto);

            const getStatusOptions = this.anbieterRestService.getLeistungsvereinbarungStati(this.lvId);
            const getButtons = this.anbieterRestService.getLeistungsvereinbarungButtons(this.lvId);
            const getVertragswertContainer = this.vertraegeRestService.getVertragswertContainerByLvId(this.lvId);
            this.pendentOrInUeberarbeitung =
                lvResponse.data.statusObject.code === AmmVierAugenStatusCode.PENDENT || lvResponse.data.statusObject.code === AmmVierAugenStatusCode.INUEBERARBEITUNG;

            this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));

            forkJoin([getButtons, getStatusOptions, getVertragswertContainer]).subscribe(
                ([buttons, status, vertragswerteResponse]) => {
                    this.lvData = { ...this.lvData, statusOptions: status.data };
                    this.buttons.next(buttons.data);
                    this.enabledButtons = buttons.data;

                    this.handleVertragswerteResponse(vertragswerteResponse);

                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
                }
            );
        }

        this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
    }

    private handleHttpError() {
        this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
        OrColumnLayoutUtils.scrollTop();
        this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
    }

    private getForce(): boolean {
        const hasFreigabebereiteABW = this.lvData.lvDto.freigabebereiteAB;
        const hasFreigabebereiteTZW = this.lvData.lvDto.freigabebereiteTZ;

        const nachfolgerNr =
            this.lvData.lvDto.nachfolgerList && this.lvData.lvDto.nachfolgerList.length > 0
                ? this.lvData.lvDto.nachfolgerList[this.lvData.lvDto.nachfolgerList.length - 1].leistungsvereinbarungNr
                : 0;

        let force = false;

        if (!nachfolgerNr) {
            if (hasFreigabebereiteABW.length > 0 && hasFreigabebereiteTZW.length > 0) {
                force = true;
                this.ersetzenMsg = `${this.facade.translateService.instant('amm.akquisition.message.abrechnungenundteilzahlungenaufpendentsetzen', {
                    0: hasFreigabebereiteABW,
                    1: hasFreigabebereiteTZW
                })} ${this.ersetzenMsg}`;
            } else {
                if (hasFreigabebereiteABW.length > 0) {
                    force = true;
                    this.ersetzenMsg = `${this.facade.translateService.instant('amm.akquisition.message.abrechnungenaufpendentsetzen', {
                        0: hasFreigabebereiteABW
                    })}  ${this.ersetzenMsg}`;
                }
                if (hasFreigabebereiteTZW.length > 0) {
                    force = true;
                    this.ersetzenMsg = `${this.facade.translateService.instant('amm.akquisition.message.teilzahlungenaufpendentsetzen', {
                        0: hasFreigabebereiteTZW
                    })} ${this.ersetzenMsg}`;
                }
            }
        }

        return force;
    }

    private handleVertragswerteResponse(vertragswerteResponse: BaseResponseWrapperVertragswertContainerDTOWarningMessages) {
        if (vertragswerteResponse) {
            this.lvData = { ...this.lvData, vertragswerte: vertragswerteResponse.data.vertragswerte };
            this.vertragswerteLastUpdate = vertragswerteResponse.data;
            this.mapVertragswerteContainer(this.vertragswerteLastUpdate);
        }
    }

    private deleteLeistungsvereinbarung() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.anbieterRestService.deleteLeistungsvereinbarung(this.lvId).subscribe(
            response => {
                if (response) {
                    this.lvFormComponent.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));

                    if (this.lvData.lvDto.vorgaengerObject) {
                        const vorgaengerId = this.lvData.lvDto.vorgaengerObject.leistungsvereinbarungId;
                        const queryParams = this.lvData.rahmenvertragId ? { lvId: vorgaengerId, rahmenvertragId: this.lvData.rahmenvertragId } : { lvId: vorgaengerId };
                        this.router.navigate([`amm/anbieter/${this.lvData.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
                            queryParams
                        });

                        this.facade.navigationService.showNavigationTreeRoute(
                            './leistungsvereinbarungen/leistungsvereinbarung',
                            this.lvData.rahmenvertragId
                                ? { lvId: vorgaengerId, rahmenvertragId: this.lvData.rahmenvertragId }
                                : {
                                      lvId: vorgaengerId
                                  }
                        );
                    } else {
                        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung');

                        if (this.lvData.rahmenvertragId && this.lvData.hasInitialRahmenvertrag) {
                            this.router.navigate([`amm/anbieter/${this.lvData.anbieterId}/rahmenvertraege/bearbeiten`], {
                                queryParams: { rahmenvertragId: this.lvData.rahmenvertragId }
                            });
                        } else {
                            this.router.navigate([`amm/anbieter/${this.lvData.anbieterId}/leistungsvereinbarungen`]);
                        }
                    }
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    private mapVertragswerteContainer(vertragswerteContainer: VertragswertContainerDTO) {
        this.chfTotal = vertragswerteContainer ? this.formatSwissFrancPipe.transform(vertragswerteContainer.totalChfBetrag) : '0.00';
        this.tnTotal = vertragswerteContainer ? vertragswerteContainer.totalTeilnehmer : 0;
        this.tnTageTotal = vertragswerteContainer ? vertragswerteContainer.totalTeilnehmerTage : 0;

        this.dataSource = vertragswerteContainer ? vertragswerteContainer.vertragswerte.map((row: VertragswertViewDTO, index) => this.createRow(row, index)) : [];
    }

    private createRow(vertragswert: VertragswertViewDTO, index: number) {
        return {
            index,
            vertragswertId: vertragswert.vertragswertId,
            vertragswertNr: vertragswert.vertragswertNr,
            titel: this.facade.dbTranslateService.translateWithOrder(vertragswert, 'massnahmeTitel'),
            gueltigVon: vertragswert.gueltigVon ? new Date(vertragswert.gueltigVon) : '',
            gueltigBis: vertragswert.gueltigBis ? new Date(vertragswert.gueltigBis) : '',
            isGueltig: vertragswert.gueltigB ? 'common.label.ja' : 'common.label.nein',
            preismodell: this.facade.dbTranslateService.translateWithOrder(vertragswert, 'preismodellText'),
            chfBetrag: this.formatSwissFrancPipe.transform(vertragswert.chfBetrag),
            teilnehmerTage: vertragswert.teilnehmerTage,
            teilnehmer: vertragswert.teilnehmer
        };
    }

    private initInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.subnavmenuitem.leistungsvereinbarung'
        });
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        if (this.enabledButtons.some(btn => btn === this.ammButtonsTypeEnum.FKT_DOKUMENTMANAGER)) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        if (this.lvData && this.lvData.lvDto && this.lvData.lvDto.statusObject && this.lvData.lvDto.statusObject.code !== AmmVierAugenStatusCode.ERSETZT) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.ASALDATEN, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.CHANNEL_STATE_KEY, this.getToolboxConfigData());

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.facade.openModalFensterService.openDmsCopyModal(
                    DmsMetadatenContext.DMS_CONTEXT_AMM_ANBIETER_LEISTUNGSVEREINBARUNG_BEARBEITEN,
                    this.lvData.lvDto.leistungsvereinbarungNr.toString()
                );
            } else if (action.message.action === ToolboxActionEnum.ASALDATEN) {
                this.facade.openModalFensterService.openXLModal(this.auszahlungenModal);
            }
        });

        if (this.observeDokGenerated) {
            this.observeDokGenerated.unsubscribe();
        }
        this.observeDokGenerated = this.dmsService.observeDokGenerated().subscribe((data: DokumentVorlageToolboxData) => {
            if (data.targetEntity === DokumentVorlageActionDTO.TargetEntityEnum.LEISTUNGSVEREINBARUNG) {
                this.getData();
            }
        });
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.LEISTUNGSVEREINBARUNG,
            vorlagenKategorien: [VorlagenKategorie.LEISTUNGSVEREINBARUNG],
            entityIDsMapping: { LEISTUNGSVEREINBARUNG_ID: this.lvId }
        };
    }
}
