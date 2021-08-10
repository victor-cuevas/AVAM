import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import {
    InfotagMassnahmeGrunddatenData,
    InfotagMassnahmeGrunddatenFormComponent
} from '@app/modules/amm/infotag/components/infotag-massnahme-grunddaten-form/infotag-massnahme-grunddaten-form.component';
import { AmmInfotagRestService } from '@app/modules/amm/infotag/services/amm-infotag-rest.service';
import { AmmInfotagStorageService } from '@app/modules/amm/infotag/services/amm-infotag-storage.service';
import { GenericConfirmComponent } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-infotag-massnahme-grunddaten-bearbeiten',
    templateUrl: './infotag-massnahme-grunddaten-bearbeiten.component.html',
    styleUrls: ['./infotag-massnahme-grunddaten-bearbeiten.component.scss']
})
export class InfotagMassnahmeGrunddatenBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('grunddatenForm') grunddatenForm: InfotagMassnahmeGrunddatenFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    grunddatenData: InfotagMassnahmeGrunddatenData;
    lastMassnahmeData: MassnahmeDTO;
    massnahmeId: number;
    channel = 'infotag-massnahme-grunddaten-bearbeiten';

    permissions: typeof Permissions = Permissions;
    hasSession: boolean;

    constructor(
        private stesRestService: StesDataRestService,
        private translate: TranslateService,
        private ammInfotagRest: AmmInfotagRestService,
        private infopanelService: AmmInfopanelService,
        private dbTranslateService: DbTranslateService,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService,
        private router: Router,
        private infotagStorage: AmmInfotagStorageService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToToolbox();
        this.getRouteData();
        this.getData();
        this.subscribeToLangChange();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { MASSNAHME_ID: this.massnahmeId }
        };
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.lastMassnahmeData.massnahmeId.toString(), AvamCommonValueObjectsEnum.T_MASSNAHME);
                }
            });
    }

    openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_AMM_INFOTAG_MASSNAHME_BESCHREIBUNG;
        comp.id = this.massnahmeId.toString();
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    getRouteData() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
        });
    }

    getData() {
        this.spinnerService.activate(this.channel);
        forkJoin(this.stesRestService.getCode(DomainEnum.SPRACHE), this.ammInfotagRest.getInfotagMassnahme(this.massnahmeId)).subscribe(
            ([spracheOptions, dto]) => {
                this.lastMassnahmeData = dto.data;
                this.hasSession = this.lastMassnahmeData.hasSession;
                this.grunddatenData = { dto: this.lastMassnahmeData, spracheOptions: spracheOptions.filter(el => el.code !== SpracheEnum.RAETOROMANISCH) };
                this.setupInfobar(this.lastMassnahmeData);
                this.configureToolbox();
                this.spinnerService.deactivate(this.channel);
            },
            error => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    subscribeToLangChange() {
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.setupInfobar(this.lastMassnahmeData);
        });
    }

    setupInfobar(data: MassnahmeDTO) {
        this.infopanelService.dispatchInformation({
            title: 'amm.infotag.label.infotagMassnahme',
            secondTitle: data ? this.dbTranslateService.translateWithOrder(data, 'titel') : undefined,
            subtitle: 'amm.infotag.subnavmenuitem.grunddaten',
            hideInfobar: false,
            tableCount: undefined
        });
        this.infopanelService.sendLastUpdate(data);
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    reset() {
        this.grunddatenForm.reset();
    }

    save() {
        this.spinnerService.activate(this.channel);
        this.fehlermeldungenService.closeMessage();

        if (this.grunddatenForm.formGroup.invalid) {
            this.grunddatenForm.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            this.spinnerService.deactivate(this.channel);
            return;
        }

        this.ammInfotagRest.saveInfotagMassnahme(this.grunddatenForm.mapToDto()).subscribe(
            res => {
                if (res.data) {
                    this.hasSession = res.data.hasSession;
                    this.grunddatenData = { ...this.grunddatenData, dto: res.data };
                    this.lastMassnahmeData = res.data;
                    this.setupInfobar(res.data);
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    delete() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);
        this.ammInfotagRest.deleteInfotagMassnahme(this.massnahmeId).subscribe(
            res => {
                if (!res.warning) {
                    const shouldNavigateToSearch = this.infotagStorage.shouldNavigateToSearch;
                    this.grunddatenForm.formGroup.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));
                    if (shouldNavigateToSearch) {
                        this.router.navigate([`amm/infotag/massnahme/suchen`]);
                    } else {
                        this.router.navigate(['/home/start-page']);
                    }
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    openDeleteDialog() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
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

    canDeactivate() {
        return this.grunddatenForm.formGroup.dirty;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.sendLastUpdate({}, true);
        this.infopanelService.resetTemplateInInfobar();
    }
}
