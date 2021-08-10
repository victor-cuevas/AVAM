import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperSessionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperSessionDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InfotagBewirtschaftungGrunddatenFormComponent } from '../../components';
import { InfotagBewGrunddatenData } from '../../components/infotag-bewirtschaftung-grunddaten-form/infotag-bewirtschaftung-grunddaten-form.component';
import { AmmInfotagRestService } from '../../services/amm-infotag-rest.service';

@Component({
    selector: 'avam-infotag-grunddaten-bearbeiten',
    templateUrl: './infotag-grunddaten-bearbeiten.component.html',
    styleUrls: ['./infotag-grunddaten-bearbeiten.component.scss']
})
export class InfotagGrunddatenBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('grunddatenForm') grunddatenForm: InfotagBewirtschaftungGrunddatenFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    grunddatenData: InfotagBewGrunddatenData;
    channel = 'infotag-bewirtschaftung-grunddaten-bearbeiten';
    spracheOptions: CodeDTO[];
    infotagDto: SessionDTO;
    dfeId: number;
    permissions: typeof Permissions = Permissions;
    hasBookings = false;
    massnahmeId: number;
    unternehmen: UnternehmenDTO;

    constructor(
        private spinnerService: SpinnerService,
        private infotagRestService: AmmInfotagRestService,
        private stesRestService: StesDataRestService,
        private route: ActivatedRoute,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService,
        private modalService: NgbModal,
        private router: Router,
        private toolboxService: ToolboxService,
        private infopanelService: AmmInfopanelService,
        private translate: TranslateService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteData();
        this.getData();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
    }

    getRouteData() {
        this.route.parent.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.dfeId = params['dfeId'];
        });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.massnahmeId = params['massnahmeId'];
        });
    }

    getData() {
        this.spinnerService.activate(this.channel);
        forkJoin<CodeDTO[], CodeDTO[], BaseResponseWrapperSessionDTOWarningMessages>([
            this.stesRestService.getCode(DomainEnum.VERFUEGBARKEITAMM),
            this.stesRestService.getCode(DomainEnum.SPRACHE),
            this.infotagRestService.getInfotag(this.dfeId)
        ]).subscribe(
            ([verfuegbarkeitoptions, spracheoptions, res]) => {
                this.infotagDto = res.data;
                this.hasBookings = res.data.anzahlBuchungen && res.data.anzahlBuchungen > 0;
                this.setupInfobar(this.infotagDto);
                this.configureToolbox();
                this.spracheOptions = spracheoptions.filter(el => el.code !== SpracheEnum.RAETOROMANISCH);
                this.grunddatenData = { verfuegbarkeitOptions: verfuegbarkeitoptions, spracheOptions: this.spracheOptions, grunddatenDto: res.data, hasBookings: this.hasBookings };
                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    setupInfobar(dto: SessionDTO) {
        this.infopanelService.dispatchInformation({
            title: 'amm.infotag.subnavmenuitem.infotag',
            secondTitle: dto ? this.dbTranslateService.translateWithOrder(dto, 'titel') : undefined,
            subtitle: 'amm.infotag.subnavmenuitem.grunddaten',
            hideInfobar: false,
            tableCount: undefined
        });
        this.unternehmen = dto.durchfuehrungsortObject.unternehmenObject;
        this.infopanelService.sendLastUpdate(dto);
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.INFOTAG,
            vorlagenKategorien: [VorlagenKategorie.INFOTAG],
            entityIDsMapping: { DFE_ID: this.dfeId }
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
                    this.openHistoryModal(this.dfeId.toString(), AvamCommonValueObjectsEnum.T_SESSION);
                }
            });
    }

    openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_INFOTAG_BEARBEITEN;
        comp.id = this.dfeId.toString();
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    subscribeToLangChange() {
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.setupInfobar(this.infotagDto);
        });
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

    delete() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);
        this.infotagRestService.deleteInfotag(this.dfeId).subscribe(
            res => {
                if (!res.warning) {
                    this.grunddatenForm.formGroup.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));
                    const copyId = this.route.snapshot.queryParams.copy;
                    if (copyId > 0) {
                        this.router.navigate([`amm/infotag/massnahme/${this.massnahmeId}/infotage/infotag/grunddaten`], {
                            queryParams: { dfeId: copyId }
                        });
                    } else {
                        this.router.navigate([`amm/infotag/massnahme/${this.massnahmeId}/infotage`]);
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

    reset() {
        this.grunddatenForm.reset();
    }

    onCopy() {
        this.router.navigate([`amm/infotag/massnahme/${this.massnahmeId}/infotag/erfassen/grunddaten`], {
            queryParams: {
                dfeId: this.dfeId
            }
        });
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

        this.infotagRestService.saveInfotag(this.grunddatenForm.mapToDTO()).subscribe(
            res => {
                if (res.data) {
                    this.infotagDto = res.data;
                    this.grunddatenData = { ...this.grunddatenData, grunddatenDto: this.infotagDto };
                    this.setupInfobar(this.infotagDto);
                    this.grunddatenForm.formGroup.markAsPristine();
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
