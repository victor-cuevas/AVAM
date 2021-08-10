import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KontaktpersonRestService } from '@app/core/http/kontaktperson-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { InfotagMassnahmeBeschreibungFormComponent } from '@app/modules/amm/infotag/components';
import { InfotagMassnahmeBeschreibungData } from '@app/modules/amm/infotag/components/infotag-massnahme-beschreibung-form/infotag-massnahme-beschreibung-form.component';
import { AmmInfotagRestService } from '@app/modules/amm/infotag/services/amm-infotag-rest.service';
import { AbbrechenModalComponent } from '@app/shared';
import { AbbrechenModalActionCallback } from '@app/shared/classes/abbrechen-modal-action-dismiss-only-current';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { AmmInfotagHelperService } from '../../services/amm-infotag-helper.service';

@Component({
    selector: 'avam-infotag-massnahme-beschreibung-bearbeiten',
    templateUrl: './infotag-massnahme-beschreibung-bearbeiten.component.html',
    styleUrls: ['./infotag-massnahme-beschreibung-bearbeiten.component.scss'],
    providers: [AmmInfotagHelperService]
})
export class InfotagMassnahmeBeschreibungBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('beschreibungForm') beschreibungForm: InfotagMassnahmeBeschreibungFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    beschreibungData: InfotagMassnahmeBeschreibungData;
    channel = 'infotag-massnahme-beschreibung-bearbeiten';
    massnahmeDto: MassnahmeDTO;
    spracheOptions: CodeDTO[];
    massnahmeId: number;
    unternehmen: UnternehmenDTO;
    permissions: typeof Permissions = Permissions;

    switzerland: StaatDTO;
    kontaktpersonen: KontakteViewDTO[];
    beschreibungId: number;

    constructor(
        private infopanelService: AmmInfopanelService,
        private spinnerService: SpinnerService,
        private stesRestService: StesDataRestService,
        private ammInfotagRest: AmmInfotagRestService,
        private route: ActivatedRoute,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private translateService: TranslateService,
        private notificationService: NotificationService,
        private fehlermeldungenService: FehlermeldungenService,
        private dbTranslateService: DbTranslateService,
        private kontaktpersonRestService: KontaktpersonRestService,
        private infotagHelper: AmmInfotagHelperService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteData();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.configureToolbox();
        this.getData();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
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
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.beschreibungId.toString(), AvamCommonValueObjectsEnum.T_AMM_BESCHREIBUNG);
                }
            });
    }

    subscribeToLangChange() {
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.fehlermeldungenService.closeMessage();
            this.getData();
        });
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
        forkJoin(this.ammInfotagRest.getInfotagMassnahme(this.massnahmeId), this.stesRestService.getCode(DomainEnum.SPRACHE), this.stesRestService.getStaatSwiss())
            .pipe(
                map(([dto, spracheOptions, swiss]) => {
                    this.switzerland = swiss;
                    this.massnahmeDto = dto.data;
                    this.spracheOptions = spracheOptions.filter(el => el.code !== SpracheEnum.RAETOROMANISCH);

                    this.beschreibungData = {
                        dto: this.massnahmeDto,
                        spracheOptions: this.spracheOptions
                    };

                    this.beschreibungId = this.massnahmeDto.ammBeschreibungObject ? this.massnahmeDto.ammBeschreibungObject.ammBeschreibungId : null;
                    this.unternehmen = this.getUnternehmen();
                    this.setupInfobar(this.massnahmeDto);

                    this.infotagHelper.checkDfOrtAdresse(this.massnahmeDto.durchfuehrungsortObject, this.switzerland);

                    return this.unternehmen;
                }),
                switchMap((unternehmen: UnternehmenDTO) => this.kontaktpersonRestService.getKontaktpersonenByUnternehmenId(unternehmen.unternehmenId))
            )
            .subscribe(
                kontakpersonen => {
                    if (kontakpersonen.data) {
                        this.kontaktpersonen = kontakpersonen.data;
                        this.infotagHelper.checkKontaktperson(this.beschreibungForm.mapToDto(), this.kontaktpersonen);
                    }

                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.channel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    setupInfobar(data: MassnahmeDTO) {
        this.infopanelService.dispatchInformation({
            title: 'amm.infotag.label.infotagMassnahme',
            secondTitle: data ? this.dbTranslateService.translateWithOrder(data, 'titel') : undefined,
            subtitle: 'amm.infotag.subnavmenuitem.beschreibungDurchfuerungsort',
            hideInfobar: false,
            tableCount: undefined
        });
        this.infopanelService.sendLastUpdate(this.massnahmeDto.durchfuehrungsortObject || this.massnahmeDto.ammBeschreibungObject);
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    getUnternehmen() {
        if (this.massnahmeDto && this.massnahmeDto.ammAnbieterObject) {
            return this.massnahmeDto.ammAnbieterObject.unternehmen;
        }

        return undefined;
    }

    anbieterdatenUebernehmen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);
        this.ammInfotagRest.anbieterdatenUebernehmen(this.massnahmeId).subscribe(
            dto => {
                if (dto.data) {
                    this.massnahmeDto = dto.data;
                    this.beschreibungData = {
                        dto: this.massnahmeDto,
                        spracheOptions: this.spracheOptions,
                        markFormDirty: true
                    };
                    this.setupInfobar(dto.data);
                    this.infotagHelper.checkDfOrtAdresse(this.massnahmeDto.durchfuehrungsortObject, this.switzerland);
                    this.infotagHelper.checkKontaktperson(this.beschreibungForm.mapToDto(), this.kontaktpersonen);
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    onSave() {
        this.fehlermeldungenService.closeMessage();

        if (this.beschreibungForm.formGroup.invalid) {
            this.beschreibungForm.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.infotagHelper.checkDfOrtAdresse(this.massnahmeDto.durchfuehrungsortObject, this.switzerland);
            this.infotagHelper.checkKontaktperson(this.beschreibungForm.mapToDto(), this.kontaktpersonen);
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.update();
    }

    update() {
        this.spinnerService.activate(this.channel);

        this.ammInfotagRest.saveInfotagMassnahmeOrtBeschreibung(this.beschreibungForm.mapToDto()).subscribe(
            res => {
                if (res.data) {
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.massnahmeDto = res.data;
                    this.beschreibungData = {
                        dto: this.massnahmeDto,
                        spracheOptions: this.spracheOptions
                    };
                    this.setupInfobar(res.data);

                    this.infotagHelper.checkDfOrtAdresse(this.massnahmeDto.durchfuehrungsortObject, this.switzerland);
                    this.infotagHelper.checkKontaktperson(this.beschreibungForm.mapToDto(), this.kontaktpersonen);
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    openModalUebernehmen() {
        if (this.beschreibungForm.formGroup.dirty) {
            const modalRefAbbrechen = this.modalService.open(AbbrechenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
            modalRefAbbrechen.componentInstance.setModalAction(new AbbrechenModalActionCallback(modalRefAbbrechen));
            modalRefAbbrechen.componentInstance.setModalText(
                modalRefAbbrechen.componentInstance.setModalText({
                    modalHeader: 'amm.infotag.button.anbieterdatenuebernehmen',
                    bodyHeader: 'common.message.achtung',
                    bodyMessage: 'common.label.anbieteruebernehmen',
                    cancelButtonText: 'common.button.neinAbbrechen',
                    okButtonText: 'common.button.jaFortfahren'
                })
            );
            modalRefAbbrechen.result.then(result => {
                this.anbieterdatenUebernehmen();
            });
            return;
        }
        this.anbieterdatenUebernehmen();
    }

    reset() {
        if (this.beschreibungForm.formGroup.dirty) {
            this.beschreibungForm.reset();
            this.fehlermeldungenService.closeMessage();

            this.infotagHelper.checkDfOrtAdresse(this.massnahmeDto.durchfuehrungsortObject, this.switzerland);
            this.infotagHelper.checkKontaktperson(this.beschreibungForm.mapToDto(), this.kontaktpersonen);
        }
    }

    canDeactivate() {
        return this.beschreibungForm.formGroup.dirty;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.sendLastUpdate({}, true);
        this.infopanelService.resetTemplateInInfobar();
    }
}
