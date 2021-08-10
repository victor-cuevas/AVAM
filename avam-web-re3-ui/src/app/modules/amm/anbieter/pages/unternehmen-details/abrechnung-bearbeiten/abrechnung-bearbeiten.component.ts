import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AnbieterAbrechnungFormComponent } from '../../../components/anbieter-abrechnung-form/anbieter-abrechnung-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from '@app/shared/services/facade.service';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { takeUntil, first } from 'rxjs/operators';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Subject, Observable } from 'rxjs';
import { formatNumber } from '@angular/common';
import { AbrechnungswertListeViewDTO } from '@app/shared/models/dtos-generated/abrechnungswertListeViewDTO';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { AbrechnungBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungBearbeitenParameterDTO';
import { GenericConfirmComponent } from '@app/shared';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages } from '@dtos/baseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages';

import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { TableType } from '@app/modules/amm/anbieter/components/anbieter-abrechnungswert-table/anbieter-abrechnungswert-table.component';
import { AbrechnungswertService, NAVIGATION } from '../../../services/abrechnungswert.service';

enum Action {
    SAVE,
    DELETE,
    REMOVEZUORDNUNG,
    ERSETZEN,
    UEBERARBEITEN,
    ZURUECKNEHMEN,
    FREIGEBEN
}
@Component({
    selector: 'avam-abrechnung-bearbeiten',
    templateUrl: './abrechnung-bearbeiten.component.html',
    styleUrls: ['./abrechnung-bearbeiten.component.scss']
})
export class AbrechnungBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('abrechnungForm') abrechnungForm: AnbieterAbrechnungFormComponent;
    @ViewChild('abrechnungswertModal') abrechnungswertModal: ElementRef;
    @ViewChild('auszahlungenModal') auszahlungenModal: ElementRef;

    channel = 'abrechnung-bearbeiten';

    abrechnungParam: AbrechnungBearbeitenParameterDTO;
    anbieterId: number;
    abrechnungId: number;
    initialAbrechnungswerte: AbrechnungswertListeViewDTO[];
    abrechnungswerte: AbrechnungswertListeViewDTO[];
    isTableChanged = false;
    dataSource = [];
    summeTotal = '';
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    fieldsEnum = AbrechnungBearbeitenParameterDTO.EnabledFieldsEnum;
    action = Action;
    tableType = TableType;

    constructor(
        private route: ActivatedRoute,
        private facade: FacadeService,
        private router: Router,
        private anbieterRestService: AnbieterRestService,
        private infopanelService: AmmInfopanelService,
        private abrechnungswertService: AbrechnungswertService,
        private interactionService: StesComponentInteractionService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.anbieterId = params['unternehmenId'];
        });
        this.route.parent.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.abrechnungId = params['abrechnungId'];
            this.getData();
        });
        this.facade.navigationService.showNavigationTreeRoute('./abrechnungen/bearbeiten', { abrechnungId: this.abrechnungId });
        this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                if (this.canDeactivate()) {
                    this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen`]);

                    this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
                        if (okClicked) {
                            this.facade.navigationService.hideNavigationTreeRoute('./abrechnungen/bearbeiten');
                        }
                    });
                } else {
                    this.cancel();
                }
            }
        });
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.dataSource = this.abrechnungswerte.map(el => this.createAbrechnungswertRow(el));
        });
        this.subscribeToToolbox();
        this.infopanelService.updateInformation({
            subtitle: 'amm.abrechnungen.subnavmenuitem.abrechnung'
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.getAbrechnungParam(this.abrechnungId).subscribe(
            response => {
                if (response.data) {
                    this.initialAbrechnungswerte = [...response.data.abrechungswertListe];
                    this.setPageData(response.data);
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => this.deactivateSpinnerAndScrollToTop()
        );
    }

    createAbrechnungswertRow(abrechnungswert: AbrechnungswertListeViewDTO) {
        const sprachTitel = {
            titelDe: abrechnungswert.durchfuehrungseinheitTitelDe || abrechnungswert.massnahmeTitelDe,
            titelFr: abrechnungswert.durchfuehrungseinheitTitelFr || abrechnungswert.massnahmeTitelFr,
            titelIt: abrechnungswert.durchfuehrungseinheitTitelIt || abrechnungswert.massnahmeTitelIt
        };
        return {
            abrechnungswertId: abrechnungswert.abrechnungswertId,
            abrechnungswertNr: abrechnungswert.abrechnungswertNr || '',
            saldochf: formatNumber(abrechnungswert.abrechnungswertSaldoALV, LocaleEnum.SWITZERLAND, '.2-2'),
            faelligAm: abrechnungswert.abrechnungswertFaelligkeitDatum,
            titel: this.facade.dbTranslateService.translateWithOrder(sprachTitel, 'titel') || '',
            gueltigVon: abrechnungswert.vertragswertGueltigVon,
            gueltigBis: abrechnungswert.vertragswertGueltigBis,
            profilNr: abrechnungswert.vertragswertProfilNr || '',
            abrechnungswertLoeschbar: abrechnungswert.abrechnungswertLoeschbar,
            massnahmeAmmAnbieterId: abrechnungswert.massnahmeAmmAnbieterId
        };
    }

    setPageData(param: AbrechnungBearbeitenParameterDTO) {
        if (param.abrechnung.statusObject.code === AmmVierAugenStatusCode.FREIGABEBEREIT) {
            param.enabledFields = param.enabledFields.filter(field => field !== this.fieldsEnum.FREIGEBERID);
        }
        this.abrechnungParam = param;
        this.buttons.next(param.enabledActions);
        this.configureToolbox(param.enabledActions, param.enabledFields);
        this.infopanelService.sendLastUpdate(param.abrechnung);
        this.setTableData(param.abrechungswertListe);
    }

    setTableData(abrechungswertListe) {
        this.abrechnungParam.abrechungswertListe = [...abrechungswertListe];
        this.abrechnungswerte = [...abrechungswertListe];
        this.dataSource = this.abrechnungswerte.map(el => this.createAbrechnungswertRow(el));
        this.summeTotal = formatNumber(this.abrechnungswerte.reduce((acc, obj) => acc + obj.abrechnungswertSaldoALV, 0), LocaleEnum.SWITZERLAND, '.2-2');
        this.isTableChanged = false;
    }

    configureToolbox(enabledActions, enabledFields) {
        const toolboxConfig: ToolboxConfiguration[] = [];

        if (enabledFields.some(field => field === this.fieldsEnum.REPORT)) {
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
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.ABRECHNUNG,
            vorlagenKategorien: [VorlagenKategorie.ABRECHNUNGSENTSCHEID],
            entityIDsMapping: { ABRECHNUNG_ID: this.abrechnungId }
        };
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
                        DmsMetadatenContext.DMS_CONTEXT_AMM_ANBIETER_ABRECHNUNG_BEARBEITEN,
                        this.abrechnungParam.abrechnung.abrechnungNr.toString()
                    );
                } else if (action.message.action === ToolboxActionEnum.ASALDATEN) {
                    this.facade.openModalFensterService.openXLModal(this.auszahlungenModal);
                }
            });
    }

    cancel() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen`]);
        this.facade.navigationService.hideNavigationTreeRoute('./abrechnungen/bearbeiten');
    }

    reset() {
        this.abrechnungForm.reset(this.isTableChanged, () => {
            this.initialAbrechnungswerte.forEach(el => (el.remove = false));
            this.setTableData(this.initialAbrechnungswerte);
        });
    }

    openAbrechnungswertModal() {
        this.facade.openModalFensterService.openXLModal(this.abrechnungswertModal);
    }

    openDeleteDialog(action: Action, abrechnungswertId?: number) {
        const modalRef = this.facade.openModalFensterService.openModal(GenericConfirmComponent);
        modalRef.result.then(result => {
            if (result) {
                if (action === Action.DELETE) {
                    this.delete();
                } else if (action === Action.REMOVEZUORDNUNG) {
                    this.removeAbrechnungswert(abrechnungswertId);
                }
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        if (action === Action.DELETE) {
            modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        } else if (action === Action.REMOVEZUORDNUNG) {
            modalRef.componentInstance.promptLabel = 'amm.abrechnungen.alttext.zuordnungloeschenmessage';
        }
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    update(action: Action) {
        this.facade.fehlermeldungenService.closeMessage();
        const update = this.getUpdate(action);

        if (!update) {
            return;
        }

        this.facade.spinnerService.activate(this.channel);

        update.subscribe(
            response => {
                if (response.data) {
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    if (action === Action.ERSETZEN) {
                        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen/bearbeiten`], { queryParams: { abrechnungId: response.data.abrechnung.abrechnungId } });
                    } else {
                        this.initialAbrechnungswerte = [...response.data.abrechungswertListe];
                        this.setPageData(response.data);
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

    delete() {
        this.facade.fehlermeldungenService.closeMessage();

        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.deleteAbrechnung(this.abrechnungId).subscribe(
            response => {
                if (!response.warning) {
                    this.abrechnungForm.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                    const abrechnungswerte = this.abrechnungswertService.getAbrechnungswertIds();

                    if (abrechnungswerte.length) {
                        window.history.back();
                    } else if (this.abrechnungParam.abrechnung.vorgaengerObject) {
                        const abrechnungId = this.abrechnungParam.abrechnung.vorgaengerObject.abrechnungId;
                        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen/bearbeiten`], { queryParams: { abrechnungId } });
                    } else {
                        this.cancel();
                    }
                }

                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    navigateToAbrechnungswert(abrechnungswert) {
        this.facade.spinnerService.activate(this.channel);
        this.anbieterRestService.getAbrechnungswertParam(abrechnungswert.abrechnungswertId).subscribe(
            response => {
                if (response.data) {
                    this.abrechnungswertService.navigatedFrom = NAVIGATION.ABRECHNUNG_BEARBEITEN;
                    if (this.abrechnungParam.abrechnung.nachfolgerObject) {
                        this.abrechnungswertService.readonlyMode = true;
                    }
                    this.router.navigate(
                        [`/amm/anbieter/${abrechnungswert.massnahmeAmmAnbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/grunddaten`],
                        {
                            queryParams: {
                                lvId: response.data.abrechnungswert.vertragswertObject.leistungsvereinbarungObject.leistungsvereinbarungId,
                                vertragswertId: response.data.abrechnungswert.vertragswertObject.vertragswertId,
                                abrechnungswertId: response.data.abrechnungswert.abrechnungswertId
                            }
                        }
                    );
                }
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    assignAbrechnungswerte(abrechnungswerte: AbrechnungswertListeViewDTO[]) {
        this.facade.fehlermeldungenService.closeMessage();

        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService
            .assignAbrechnungswerte(this.abrechnungId, [...this.abrechnungswerte, ...abrechnungswerte])
            .subscribe(response => this.handleAbrechnungswerteResponse(response), error => this.deactivateSpinnerAndScrollToTop());
    }

    removeAbrechnungswert(abrechnungswertId: number) {
        this.facade.fehlermeldungenService.closeMessage();

        this.facade.spinnerService.activate(this.channel);

        this.abrechnungswerte.find(el => el.abrechnungswertId === abrechnungswertId).remove = true;

        this.anbieterRestService
            .removeAbrechnungswert(this.abrechnungId, this.abrechnungswerte)
            .subscribe(response => this.handleAbrechnungswerteResponse(response), error => this.deactivateSpinnerAndScrollToTop());
    }

    canDeactivate() {
        return this.abrechnungForm.formGroup.dirty || this.isTableChanged;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
        this.abrechnungswertService.clearAbrechnungswertService();
    }

    private handleAbrechnungswerteResponse(response) {
        if (response.data) {
            this.setTableData(response.data.abrechungswertListe);
            this.isTableChanged = true;
        }
        this.deactivateSpinnerAndScrollToTop();
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private getUpdate(action: Action): Observable<BaseResponseWrapperAbrechnungBearbeitenParameterDTOWarningMessages> | undefined {
        switch (action) {
            case Action.ERSETZEN:
                return this.anbieterRestService.abrechnungErsetzen(this.abrechnungId);
            case Action.UEBERARBEITEN:
                return this.anbieterRestService.abrechnungUeberarbeiten(this.abrechnungId);
            case Action.ZURUECKNEHMEN:
                return this.anbieterRestService.abrechnungZuruecknehmen(this.abrechnungId);
            case Action.FREIGEBEN:
                const param = this.abrechnungForm.mapToDTO();
                return this.anbieterRestService.abrechnungFreigeben(param.abrechnung);
            case Action.SAVE:
                if (this.isFormValid()) {
                    return this.anbieterRestService.saveAbrechnung(this.abrechnungForm.mapToDTO());
                }
                break;
        }
    }

    private isFormValid(): boolean {
        if (!this.abrechnungForm.formGroup.value.bearbeitungDurch) {
            this.abrechnungForm.appendCurrentUser();
        }

        if (!this.abrechnungForm.formGroup.valid) {
            this.abrechnungForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return false;
        }
        return true;
    }
}
