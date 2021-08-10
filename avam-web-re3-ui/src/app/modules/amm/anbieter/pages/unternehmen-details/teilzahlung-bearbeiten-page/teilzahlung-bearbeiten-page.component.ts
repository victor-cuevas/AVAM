import { TeilzahlungBearbeitenParameterDTO } from '@dtos/teilzahlungBearbeitenParameterDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { FacadeService } from '@shared/services/facade.service';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { TeilzahlungData, TeilzahlungFormComponent } from '../../../components/teilzahlung-form/teilzahlung-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { DmsService, FormatSwissFrancPipe, GenericConfirmComponent } from '@app/shared';
import { TeilzahlungswertListeViewDTO } from '@dtos/teilzahlungswertListeViewDTO';
import { Subject, Subscription, Observable } from 'rxjs';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@dtos/baseResponseWrapperListButtonsEnumWarningMessages';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { TeilzahlungswertService } from '@app/shared/services/teilzahlungswert.service';
import { SpinnerService } from 'oblique-reactive';
import { TeilzahlungswerteTableType } from '../../../components/teilzahlung-form/anbieter-teilzahlungswerte-table/anbieter-teilzahlungswerte-table.component';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';

@Component({
    selector: 'avam-teilzahlung-bearbeiten-page',
    templateUrl: './teilzahlung-bearbeiten-page.component.html',
    providers: [FormatSwissFrancPipe]
})
export class TeilzahlungBearbeitenPageComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('tzform') tzformComponent: TeilzahlungFormComponent;
    @ViewChild('teilzahlungswertModal') teilzahlungswertModal: ElementRef;
    @ViewChild('auszahlungenModal') auszahlungenModal: ElementRef;

    channel = 'teilzahlung-bearbeiten-channel';
    teilzahlungData: TeilzahlungData;
    tableDataSource;
    summeTotal: number | string;
    lastUpdateSummeTotal: number | string;
    tzId: number;
    anbieterId: number;
    teilzahlungswerte: TeilzahlungswertListeViewDTO[];
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    fieldsEnum = TeilzahlungBearbeitenParameterDTO.EnabledFieldsEnum;
    observeClickActionSub: Subscription;
    messageBusSub: Subscription;
    lastUpdateTeilzahlungswerte: TeilzahlungswertListeViewDTO[];
    teilzahlungswerteTableType = TeilzahlungswerteTableType;
    teilzahlungswertIds: number[] = [];
    translateSub: Subscription;
    shouldNavtoSearch: boolean;
    observeDokGenerated: Subscription;

    constructor(
        private facade: FacadeService,
        private route: ActivatedRoute,
        private anbieterRestService: AnbieterRestService,
        private formatSwissFrancPipe: FormatSwissFrancPipe,
        private modalService: NgbModal,
        private router: Router,
        private infopanelService: AmmInfopanelService,
        private teilzahlungswertService: TeilzahlungswertService,
        private vertraegeRestService: VertraegeRestService,
        private dmsService: DmsService
    ) {
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.shouldNavtoSearch = !!this.teilzahlungswertService.getTeilzahlungswertIds().length;
        this.route.queryParams.subscribe(params => {
            this.tzId = +params['teilzahlungId'];
            this.getData();
        });
    }

    ngAfterViewInit() {
        this.route.parent.params.subscribe(params => {
            this.anbieterId = +params['unternehmenId'];
        });

        this.messageBusSub = this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.close();
            }
        });

        this.initInfopanel();
        this.facade.navigationService.showNavigationTreeRoute('./teilzahlungen/bearbeiten', { teilzahlungId: this.tzId });

        this.translateSub = this.facade.translateService.onLangChange.subscribe(() => {
            this.tableDataSource = this.teilzahlungswerte.map(el => this.createTeilzahlungswertRow(el));
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.getTeilzahlungParamByTzId(this.tzId).subscribe(
            tzResponse => {
                const tzParamDto = tzResponse.data;

                if (tzParamDto) {
                    this.setAdditionalData(tzParamDto);
                    this.lastUpdateTeilzahlungswerte = [...tzParamDto.teilzahlungswertListe];
                    this.lastUpdateSummeTotal = tzParamDto.summeTeilzahlungswerte;
                }

                this.teilzahlungData = {
                    tzParamDto
                };

                this.teilzahlungswertService.setTeilzahlungswertIds(tzParamDto.teilzahlungswertListe.map(el => el.teilzahlungswertId));
                this.configureToolbox(this.teilzahlungData.tzParamDto.enabledActions, this.teilzahlungData.tzParamDto.enabledFields);
                this.infopanelService.sendLastUpdate(tzResponse.data.teilzahlung);

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

        if (this.tzformComponent.formGroup.invalid) {
            this.tzformComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.executeHttpMethod(this.anbieterRestService.saveTeilzahlungParam(this.tzformComponent.mapToDTO()), 'common.message.datengespeichert', false, true);
    }

    openDeleteModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.deleteTeilzahlung();
            }
        });

        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    deleteTeilzahlung() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.deleteTeilzahlung(this.tzformComponent.mapToDTO()).subscribe(
            response => {
                if (!response) {
                    this.tzformComponent.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));

                    if (this.shouldNavtoSearch) {
                        // BSP30
                        this.router.navigate(['amm/anbieter/teilzahlungswert/suchen']);
                    } else if (this.teilzahlungData.tzParamDto.teilzahlung.vorgaengerObject) {
                        // BSP28
                        const vorgaengerId = this.teilzahlungData.tzParamDto.teilzahlung.vorgaengerObject.teilzahlungId;

                        this.router.navigate([`amm/anbieter/${this.anbieterId}/teilzahlungen/bearbeiten`], {
                            queryParams: { teilzahlungId: vorgaengerId }
                        });

                        this.facade.navigationService.showNavigationTreeRoute('./teilzahlungen/bearbeiten', {
                            teilzahlungId: vorgaengerId
                        });
                    } else {
                        // BSP30
                        this.facade.navigationService.hideNavigationTreeRoute('./teilzahlungen/bearbeiten');
                        this.router.navigate([`amm/anbieter/${this.anbieterId}/teilzahlungen`]);
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

    freigeben() {
        this.executeHttpMethod(this.anbieterRestService.freigebenTeilzahlung(this.tzId));
    }

    zuruecknehmen() {
        this.executeHttpMethod(this.anbieterRestService.zuruecknehmenTeilzahlung(this.tzId));
    }

    ueberarbeiten() {
        this.executeHttpMethod(this.anbieterRestService.ueberarbeitenTeilzahlung(this.tzId));
    }

    ersetzen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.ersetzenTeilzahlung(this.tzId).subscribe(
            tzResponse => {
                if (tzResponse.data) {
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));

                    this.router.navigate([`/amm/anbieter/${this.anbieterId}/teilzahlungen/bearbeiten`], {
                        queryParams: { teilzahlungId: tzResponse.data.teilzahlung.teilzahlungId }
                    });

                    this.facade.navigationService.showNavigationTreeRoute('./teilzahlungen/bearbeiten', {
                        teilzahlungId: tzResponse.data.teilzahlung.teilzahlungId
                    });
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.handleHttpError();
            }
        );
    }

    reset() {
        this.tzformComponent.reset(this.teilzahlungData.hasTableDataChanged, () => {
            // reset remove flag
            this.lastUpdateTeilzahlungswerte.forEach(tzw => (tzw.remove = false));
            this.teilzahlungData.tzParamDto.teilzahlung.teilzahlungswerte = [...this.lastUpdateTeilzahlungswerte];
            this.teilzahlungData.tzParamDto.summeTeilzahlungswerte = +this.lastUpdateSummeTotal;

            this.setAdditionalData(this.teilzahlungData.tzParamDto);
        });
    }

    removeTeilzahlungswert(teilzahlungswertId: number) {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);
        this.teilzahlungswerte.find(tzw => tzw.teilzahlungswertId === teilzahlungswertId).remove = true;

        this.anbieterRestService.removeTeilzahlungswert(this.tzId, this.teilzahlungswerte).subscribe(
            tzResponse => {
                if (tzResponse.data) {
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.zahlungen.alttext.zuordnunggeloescht'));
                    this.updateTableData(tzResponse.data);
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.handleHttpError();
            }
        );
    }

    openRemoveTzwertDialog(tzId: number) {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.removeTeilzahlungswert(tzId);
            }
        });

        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'amm.abrechnungen.alttext.zuordnungloeschenmessage';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    openTeilzahlungswertModal() {
        this.teilzahlungswertIds = this.teilzahlungswertService.getTeilzahlungswertIds();
        this.facade.openModalFensterService.openXLModal(this.teilzahlungswertModal);
    }

    teilzahlungswertZuordnen(teilzahlungswerte: TeilzahlungswertListeViewDTO[]) {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.zuordnenTeilzahlungswert(this.tzId, [...this.teilzahlungswerte, ...teilzahlungswerte]).subscribe(
            tzResponse => {
                if (tzResponse.data) {
                    this.updateTableData(tzResponse.data);
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.handleHttpError();
            }
        );
    }

    navigateToTzwert(event) {
        this.facade.spinnerService.activate(this.channel);
        this.vertraegeRestService.getTeilzahlungswert(event.teilzahlungswertId).subscribe(
            responce => {
                if (responce.data) {
                    this.router.navigate([`/amm/anbieter/${this.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/teilzahlungswert`], {
                        queryParams: {
                            lvId: responce.data.teilzahlungswert.vertragswertObject.leistungsvereinbarungObject.leistungsvereinbarungId,
                            vertragswertId: responce.data.teilzahlungswert.vertragswertObject.vertragswertId,
                            teilzahlungswertId: responce.data.teilzahlungswert.teilzahlungswertId
                        }
                    });
                }
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    canDeactivate() {
        return this.tzformComponent.formGroup.dirty || this.teilzahlungData.hasTableDataChanged;
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.sendLastUpdate({}, true);

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.observeDokGenerated) {
            this.observeDokGenerated.unsubscribe();
        }

        this.teilzahlungswertService.clearTeilzahlungswertIds();
        this.translateSub.unsubscribe();
    }

    close() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/teilzahlungen`]);
        this.facade.navigationService.hideNavigationTreeRoute('./teilzahlungen/bearbeiten');
    }

    private configureToolbox(enabledActions, enabledFields) {
        const toolboxConfig: ToolboxConfiguration[] = [];

        if (enabledFields.some(field => field === this.fieldsEnum.TEILZAHLUNGREPORT)) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.ASALDATEN, true, true));
        }

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        if (enabledActions.some(btn => btn === this.buttonsEnum.COMMONBUTTONDOKUMENTMANAGER)) {
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
                this.facade.openModalFensterService.openDmsCopyModal(
                    DmsMetadatenContext.DMS_CONTEXT_AMM_ANBIETER_TEILZAHLUNG_BEARBEITEN,
                    this.teilzahlungData.tzParamDto.teilzahlung.teilzahlungNr.toString()
                );
            } else if (action.message.action === ToolboxActionEnum.ASALDATEN) {
                this.facade.openModalFensterService.openXLModal(this.auszahlungenModal);
            }
        });

        if (this.observeDokGenerated) {
            this.observeDokGenerated.unsubscribe();
        }
        this.observeDokGenerated = this.dmsService.observeDokGenerated().subscribe((data: DokumentVorlageToolboxData) => {
            if (data.targetEntity === DokumentVorlageActionDTO.TargetEntityEnum.TEILZAHLUNG) {
                this.getData();
            }
        });
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.TEILZAHLUNG,
            vorlagenKategorien: [VorlagenKategorie.TEILZAHLUNGENTSCHEID],
            entityIDsMapping: { TEILZAHLUNG_ID: this.tzId }
        };
    }

    private initInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.zahlungen.label.teilzahlung'
        });
    }

    private createTeilzahlungswertRow(teilzahlungswert: TeilzahlungswertListeViewDTO) {
        const sprachTitel = {
            titelDe: teilzahlungswert.durchfuehrungsTitelDe || teilzahlungswert.massnahmeTitelDe,
            titelFr: teilzahlungswert.durchfuehrungsTitelFr || teilzahlungswert.massnahmeTitelFr,
            titelIt: teilzahlungswert.durchfuehrungsTitelIt || teilzahlungswert.massnahmeTitelIt
        };
        return {
            teilzahlungswertId: teilzahlungswert.teilzahlungswertId,
            teilzahlungswertNr: teilzahlungswert.teilzahlungswertNr || '',
            chf: this.formatSwissFrancPipe.transform(teilzahlungswert.teilzahlungswertBetrag),
            faelligAm: teilzahlungswert.teilzahlungswertFaelligkeitDatum,
            titel: this.facade.dbTranslateService.translateWithOrder(sprachTitel, 'titel') || '',
            gueltigVon: teilzahlungswert.vertragswertGueltigVon,
            gueltigBis: teilzahlungswert.vertragswertGueltigBis,
            profilNr: teilzahlungswert.vertragswertProfilNr || '',
            teilzahlungswertLoeschbar: teilzahlungswert.teilzahlungswertLoeschbar
        };
    }

    private executeHttpMethod = (httpMethod: Observable<any>, notificationMessage = 'common.message.datengespeichert', hasTableDataChanged = false, onSave = false) => {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        httpMethod.subscribe(
            tzResponse => {
                if (tzResponse.data) {
                    const tzParamDto = tzResponse.data;
                    this.setAdditionalData(tzParamDto);

                    this.teilzahlungData = {
                        tzParamDto,
                        hasTableDataChanged
                    };

                    this.infopanelService.sendLastUpdate(tzResponse.data.teilzahlung);

                    if (notificationMessage) {
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant(notificationMessage));
                    }

                    if (onSave) {
                        this.lastUpdateTeilzahlungswerte = [...tzParamDto.teilzahlungswertListe];
                        this.lastUpdateSummeTotal = tzParamDto.summeTeilzahlungswerte;
                    }
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.handleHttpError();
            }
        );
    };

    private updateTableData(tzParamDto: TeilzahlungBearbeitenParameterDTO) {
        this.setAdditionalData(tzParamDto);
        // set object's properties not to activate change detection
        this.teilzahlungData.tzParamDto.teilzahlung.teilzahlungswerte = [...tzParamDto.teilzahlung.teilzahlungswerte];
        this.teilzahlungData.hasTableDataChanged = true;
        this.teilzahlungswertService.setTeilzahlungswertIds(tzParamDto.teilzahlungswertListe.map(el => el.teilzahlungswertId));
    }

    private setAdditionalData(tzParamDto: TeilzahlungBearbeitenParameterDTO) {
        this.teilzahlungswerte = tzParamDto.teilzahlungswertListe ? [...tzParamDto.teilzahlungswertListe] : [];
        this.tableDataSource = this.teilzahlungswerte.map(el => this.createTeilzahlungswertRow(el));
        this.summeTotal = this.formatSwissFrancPipe.transform(tzParamDto.summeTeilzahlungswerte);
        this.buttons.next(tzParamDto.enabledActions);
    }

    private handleHttpError() {
        this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
        OrColumnLayoutUtils.scrollTop();
        this.facade.spinnerService.deactivate(this.channel);
    }
}
