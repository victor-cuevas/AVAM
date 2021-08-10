import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { FacadeService } from '@app/shared/services/facade.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { forkJoin, Subject } from 'rxjs';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { AbrechnungswertGrunddatenFormComponent } from '../../components/abrechnungswert-grunddaten-form/abrechnungswert-grunddaten-form.component';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { Router, ActivatedRoute } from '@angular/router';
import { AbrechnungDTO } from '@app/shared/models/dtos-generated/abrechnungDTO';
import { AbrechnungswertBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungswertBearbeitenParameterDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AbrechnungswertService, NAVIGATION } from '../../services/abrechnungswert.service';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-abrechnungswert-grunddaten',
    templateUrl: './abrechnungswert-grunddaten.component.html',
    styleUrls: ['./abrechnungswert-grunddaten.component.scss']
})
export class AbrechnungswertGrunddatenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('abrechnungswertForm') abrechnungswertForm: AbrechnungswertGrunddatenFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    channel = 'abrechnungswert-grunddaten';

    formData = null;
    anbieterId: number;
    abrechnung: AbrechnungDTO;
    abrechnungswertId: number;
    abrechnungswert: AbrechnungswertDTO;
    enabledFields = [];
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    vertragswertTypEnum = VertragswertTypCodeEnum;

    constructor(
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private anbieterRestService: AnbieterRestService,
        private router: Router,
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private abrechnungswertService: AbrechnungswertService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.parent.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.anbieterId = +params['unternehmenId'];
        });
        this.route.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.abrechnungswertId = +params['abrechnungswertId'];
            this.getData();
        });
        this.subscribeToToolbox();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin(this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS), this.anbieterRestService.getAbrechnungswertParam(this.abrechnungswertId)).subscribe(
            ([yesNoOptions, abrechnungswertResp]) => {
                if (abrechnungswertResp.data) {
                    this.setPageData(abrechnungswertResp.data, yesNoOptions);
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => this.deactivateSpinnerAndScrollToTop()
        );
    }

    updateInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.abrechnungen.kopfzeile.abrechnungswertgrunddaten',
            hideInfobar: false
        });
        this.infopanelService.sendLastUpdate(this.abrechnungswert);
        this.infopanelService.appendToInforbar(this.panelTemplate);
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
                        DmsMetadatenContext.DMS_CONTEXT_ABRECHNUNGSWERT_GRUNDDATEN_BEARBEITEN,
                        this.abrechnungswert.abrechnungswertNr.toString()
                    );
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.facade.openModalFensterService.openHistoryModal(this.abrechnungswertId.toString(), AvamCommonValueObjectsEnum.T_ABRECHNUNGSWERT);
                }
            });
    }

    configureToolbox(enabledActions) {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        if (enabledActions.some(btn => btn === this.buttonsEnum.COMMONBUTTONDOKUMENTMANAGER)) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.ABRECHNUNGSWERT,
            vorlagenKategorien: [VorlagenKategorie.ABRECHNUNGSWERTDETAIL],
            entityIDsMapping: { ABRECHNUNGSWERT_ID: this.abrechnungswertId }
        };
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

    save() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        const isPruefungDurchEnabled = this.enabledFields.some(field => field === AbrechnungswertBearbeitenParameterDTO.EnabledFieldsEnum.GRUNDDATEN);
        if (isPruefungDurchEnabled && !this.abrechnungswertForm.formGroup.value.pruefungDurch) {
            this.abrechnungswertForm.appendCurrentUser();
        }

        if (!this.abrechnungswertForm.formGroup.valid) {
            this.abrechnungswertForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
        }

        this.anbieterRestService.updateAbrechnungswert(this.abrechnungswertForm.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    if (response.data.abrechnungswert.abrechnungswertId !== this.abrechnungswertId) {
                        this.navigateToAbrechnungswert(response.data.abrechnungswert.abrechnungswertId);
                    } else {
                        this.setPageData(response.data);
                    }
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
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

        this.anbieterRestService.deleteAbrechnungswert(this.abrechnungswertId).subscribe(
            response => {
                if (!response.warning) {
                    this.abrechnungswertForm.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));

                    if (this.abrechnungswert.vorgaengerObject) {
                        this.navigateToAbrechnungswert(this.abrechnungswert.vorgaengerObject.abrechnungswertId);
                    } else if (this.abrechnungswertService.navigatedFrom === NAVIGATION.ABRECHNUNG_BEARBEITEN) {
                        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen/bearbeiten`], { queryParams: { abrechnungId: this.abrechnung.abrechnungId } });
                    } else if (this.abrechnungswertService.navigatedFrom === NAVIGATION.SUCHEN) {
                        this.router.navigate(['amm/anbieter/abrechnungswert/suchen']);
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

    canDeactivate() {
        return this.abrechnungswertForm.formGroup.dirty;
    }

    reset() {
        this.abrechnungswertForm.reset();
    }

    cancel() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert`], {
            queryParams: {
                lvId: this.abrechnungswert.vertragswertObject.leistungsvereinbarungObject.leistungsvereinbarungId,
                vertragswertId: this.abrechnungswert.vertragswertObject.vertragswertId
            }
        });
    }

    navigateToAbrechnung() {
        this.abrechnungswertService.setAbrechnungswertIds([this.abrechnungswertId]);
        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen/bearbeiten`], { queryParams: { abrechnungId: this.abrechnung.abrechnungId } });
    }

    navigateToAbrechnungswert(abrechnungswertId: number) {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/grunddaten`], {
            queryParams: {
                abrechnungswertId,
                lvId: this.abrechnungswert.vertragswertObject.leistungsvereinbarungObject.leistungsvereinbarungId,
                vertragswertId: this.abrechnungswert.vertragswertObject.vertragswertId
            }
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.panelTemplate);
        this.infopanelService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
        this.abrechnungswertService.navigatedFrom = undefined;
    }

    private setPageData(param: AbrechnungswertBearbeitenParameterDTO, yesNoOptions?: CodeDTO[]) {
        if (this.abrechnungswertService.readonlyMode) {
            param.enabledActions = [];
            param.enabledFields = [];
        }
        this.formData = yesNoOptions ? { abrechnungswertParam: param, yesNoOptions } : { ...this.formData, abrechnungswertParam: param };
        this.abrechnungswert = param.abrechnungswert;
        this.abrechnung = param.abrechnung;
        this.buttons.next(param.enabledActions);
        this.enabledFields = param.enabledFields;
        this.updateInfopanel();
        this.configureToolbox(param.enabledActions);
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
