import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { GenericConfirmComponent } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { CtrlwerteTableData, CtrlwerteTableDataRow } from '@app/shared/components/controllingwerte-table/controllingwerte-handler.service';
import { ControllingwerteTableComponent } from '@app/shared/components/controllingwerte-table/controllingwerte-table.component';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AbrechnungswertBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungswertBearbeitenParameterDTO';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { AbrechnungswertKostenAufteilungDTO } from '@app/shared/models/dtos-generated/abrechnungswertKostenAufteilungDTO';
import { BaseResponseWrapperListKantonDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListKantonDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { KantonDTO } from '@app/shared/models/dtos-generated/kantonDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages } from '@dtos/baseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbrechnungswertService } from '../../../services/abrechnungswert.service';

enum SubmitType {
    SPEICHERN = 'speichern',
    BERECHNEN = 'berechnen'
}

@Component({
    selector: 'avam-abrechnungswert-kostenaufteilung',
    templateUrl: './abrechnungswert-kostenaufteilung.component.html',
    styleUrls: ['./abrechnungswert-kostenaufteilung.component.scss']
})
export class AbrechnungswertKostenaufteilungComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    @ViewChild('planwertControllingwerteTable') planwertControllingwerteTable: ControllingwerteTableComponent;

    channel = 'abrechnungswert-kostenaufteilung-page';
    anbieterId: number;
    lvId: number;
    vertragswertId: number;
    abrechnungswertId: number;
    abrechnungswert: AbrechnungswertDTO;
    vertragswertTypEnum = VertragswertTypCodeEnum;
    tableData: CtrlwerteTableData;
    kantoneDomainList: KantonDTO[];
    kostenverteilschluesselDomainList: CodeDTO[];
    institutionDomainList: CodeDTO[];
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = AbrechnungswertBearbeitenParameterDTO.EnabledActionsEnum;
    lastSaved: AbrechnungswertKostenAufteilungDTO;
    submitType = SubmitType;

    constructor(
        private anbieterRest: AnbieterRestService,
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private bewRestService: BewirtschaftungRestService,
        private stesRestService: StesDataRestService,
        private route: ActivatedRoute,
        private abrechnungswertService: AbrechnungswertService,
        private router: Router,
        private modalService: NgbModal
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
            this.abrechnungswertId = params['abrechnungswertId'];
            this.lvId = params['lvId'];
            this.vertragswertId = params['vertragswertId'];
        });
        this.getData();
        this.subscribeToToolbox();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);
        forkJoin<BaseResponseWrapperAbrechnungswertKostenAufteilungDTOWarningMessages, BaseResponseWrapperListKantonDTOWarningMessages, CodeDTO[], CodeDTO[]>(
            this.anbieterRest.getAbrechnungswertKostenaufteilung(this.abrechnungswertId),
            this.bewRestService.getAllKantoneForBudgetierung(),
            this.stesRestService.getCode(DomainEnum.KOSTENVERTEILSCHLUESSEL),
            this.stesRestService.getCode(DomainEnum.INSTITUTION)
        ).subscribe(
            ([awRes, kantoneRes, kostenverteilschluessel, institution]) => {
                if (awRes.data) {
                    this.kantoneDomainList = kantoneRes.data;
                    this.kostenverteilschluesselDomainList = kostenverteilschluessel;
                    this.institutionDomainList = institution;
                    this.lastSaved = awRes.data;
                    this.setPageData(this.lastSaved);
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            () => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    updateInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.abrechnungen.kopfzeile.abrechnungswertkostenaufteilung',
            hideInfobar: false
        });
        this.infopanelService.sendLastUpdate(this.abrechnungswert);
        this.infopanelService.appendToInforbar(this.panelTemplate);
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.ABRECHNUNGSWERT,
            vorlagenKategorien: [VorlagenKategorie.ABRECHNUNGSWERTDETAIL],
            entityIDsMapping: { ABRECHNUNGSWERT_ID: +this.abrechnungswertId }
        };
    }

    deleteGeldgeber(row: CtrlwerteTableDataRow) {
        this.facade.fehlermeldungenService.closeMessage();

        this.facade.spinnerService.activate(this.channel);
        if (!row.newEntry) {
            this.anbieterRest.deleteAbrechnungswertGeldgeberAufteilung(this.abrechnungswertId, row.id).subscribe(
                response => {
                    if (response.data) {
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                        this.handleUpdateResponse(response);
                    }
                    this.deactivateSpinnerAndScrollToTop();
                },
                () => {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
        } else {
            this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
            this.deactivateSpinnerAndScrollToTop();
        }
    }

    submit(type: string) {
        if (this.planwertControllingwerteTable.formGroup.invalid) {
            this.planwertControllingwerteTable.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        switch (type) {
            case SubmitType.BERECHNEN:
                this.berechnen();
                break;
            case SubmitType.SPEICHERN:
                this.save();
                break;
            default:
                break;
        }
    }

    berechnen() {
        this.anbieterRest
            .calculateAbrechnungswertKostenaufteilung(this.abrechnungswertId, this.planwertControllingwerteTable.getKostenverteilschluesselCode(), [
                this.planwertControllingwerteTable.mergeDataForBE(this.lastSaved.aufteilungBudgetjahr[0])
            ])
            .subscribe(
                response => {
                    if (response && response.data) {
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.planundakqui.message.berechnet'));
                        this.setPageData(response.data);
                        this.planwertControllingwerteTable.tableModified = true;
                    }

                    this.deactivateSpinnerAndScrollToTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    reset() {
        if (this.canDeactivate()) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.planwertControllingwerteTable.tableModified = false;
                this.mapTable(this.lastSaved);
            });
        }
    }

    save() {
        this.anbieterRest
            .updateAbrechnungswertKostenaufteilung(this.abrechnungswertId, this.planwertControllingwerteTable.getKostenverteilschluesselCode(), [
                this.planwertControllingwerteTable.mergeDataForBE(this.lastSaved.aufteilungBudgetjahr[0])
            ])
            .subscribe(
                response => {
                    if (response && response.data) {
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                        this.handleUpdateResponse(response);
                    } else {
                        this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                    }

                    this.deactivateSpinnerAndScrollToTop();
                },
                () => {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    uebernehmen() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.facade.fehlermeldungenService.closeMessage();
                this.facade.spinnerService.activate(this.channel);
                this.anbieterRest.uebernehmenAbrechnungswertKostenaufteilung(this.abrechnungswertId).subscribe(
                    response => {
                        if (response && response.data) {
                            this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.abrechnungen.message.werteuebernahme'));
                            this.handleUpdateResponse(response);
                        }
                        this.deactivateSpinnerAndScrollToTop();
                    },
                    () => {
                        this.deactivateSpinnerAndScrollToTop();
                    }
                );
            }
        });
        modalRef.componentInstance.titleLabel = 'common.button.werteuebernehmen';
        modalRef.componentInstance.promptLabel = 'amm.abrechnungen.message.werteuebernahmewarnung';
        modalRef.componentInstance.primaryButton = 'common.button.jaUebernehmen';
        modalRef.componentInstance.secondaryButton = 'common.button.neinAbbrechen';
    }

    navigateToAbrechnung() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen/bearbeiten`], {
            queryParams: { abrechnungId: this.lastSaved.abrechnungswertBearbeitenParameter.abrechnung.abrechnungId }
        });
    }

    canDeactivate() {
        return this.planwertControllingwerteTable.formGroup.dirty || this.planwertControllingwerteTable.tableModified;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.panelTemplate);
        this.infopanelService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
    }

    private handleUpdateResponse(response) {
        this.lastSaved = response.data;
        this.setPageData(response.data);
        this.planwertControllingwerteTable.tableModified = false;
        this.planwertControllingwerteTable.formGroup.markAsPristine();
    }

    private mapTable(param: AbrechnungswertKostenAufteilungDTO) {
        this.tableData = {
            ctrlwerte: this.planwertControllingwerteTable.createTableData(param.aufteilungBudgetjahr[0], this.institutionDomainList),
            kantone: this.kantoneDomainList,
            kostenverteilschluessel: this.kostenverteilschluesselDomainList,
            institution: this.institutionDomainList,
            panelFormData: {
                kostenverteilschluessel: this.abrechnungswert.kostenverteilschluesselObject,
                showAWKosten: true,
                anrechenbareKosten: this.abrechnungswert.anrechenbareKosten,
                alvRelevanteKosten: param.relevantALVBetrag
            },
            enabledFields: param.abrechnungswertBearbeitenParameter.enabledFields.includes(AbrechnungswertBearbeitenParameterDTO.EnabledFieldsEnum.KOSTENAUFTEILUNG),
            supportNegativeChf: true
        };
    }

    private setPageData(param: AbrechnungswertKostenAufteilungDTO) {
        if (this.abrechnungswertService.readonlyMode) {
            param.abrechnungswertBearbeitenParameter.enabledFields = [];
            param.abrechnungswertBearbeitenParameter.enabledActions = [];
        }
        this.abrechnungswert = param.abrechnungswertBearbeitenParameter.abrechnungswert;
        this.mapTable(param);
        this.buttons.next(param.abrechnungswertBearbeitenParameter.enabledActions);
        this.updateInfopanel();
        this.configureToolbox();
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
