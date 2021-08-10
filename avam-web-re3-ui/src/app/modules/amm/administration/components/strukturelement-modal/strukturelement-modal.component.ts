import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { ToolboxConfiguration, ToolboxService, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { SpinnerService, NotificationService, Unsubscribable } from 'oblique-reactive';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { iif } from 'rxjs';
import PrintHelper from '@app/shared/helpers/print.helper';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { MultiLanguageParamDTO } from '@app/shared/models/dtos-generated/multiLanguageParamDTO';
import { StrukturelementFormComponent } from '../strukturelement-form/strukturelement-form.component';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { AbbrechenModalComponent, GenericConfirmComponent } from '@app/shared';
import { AbbrechenModalActionNavigation } from '@app/shared/classes/abbrechen-modal-action-navigation';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { AmmAdministrationRestService } from '../../services/amm-administration-rest.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { StringHelper } from '@app/shared/helpers/string.helper';

export interface StrukturElementData {
    strukturelement?: StrukturElementDTO;
    selectedCategory?: ElementKategorieDTO;
    strukturPath?: MultiLanguageParamDTO;
    ausgleichsstellePath?: MultiLanguageParamDTO;
    formMode?: FormModeEnum;
    spracheOptions?: any[];
}
@Component({
    selector: 'avam-strukturelement-modal',
    templateUrl: './strukturelement-modal.component.html',
    styleUrls: ['./strukturelement-modal.component.scss']
})
export class StrukturelementModalComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() strukturelementData: StrukturElementData;
    @Input() oldChannel;
    @Output() onSave: EventEmitter<StrukturElementDTO> = new EventEmitter();
    @Output() onDelete: EventEmitter<StrukturElementDTO> = new EventEmitter();

    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    @ViewChild('strukturelementForm') strukturelementForm: StrukturelementFormComponent;

    channel: 'strukturelement-modal';
    infopanelData: any;
    headerLabelKey: string;
    formNumber: string;
    formModes = FormModeEnum;
    alertChannel = AlertChannelEnum;
    warningMessages = [];
    toolboxConfiguration: ToolboxConfiguration[];

    constructor(
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService,
        private stesRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private interactionService: StesComponentInteractionService,
        private ammRestService: AmmAdministrationRestService,
        private notificationService: NotificationService,
        private dbTranslateService: DbTranslateService,
        private translateService: TranslateService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getSpracheOptions();
        switch (this.strukturelementData.formMode) {
            case FormModeEnum.CREATE:
                this.strukturelementData.strukturelement.sortierSchluessel = null;
                this.headerLabelKey = 'amm.administration.label.strukturelementerfassen';
                this.formNumber = '0355003';
                this.configureToolbox();
                this.subscribeToolbox();
                this.infopanelService.updateInformation({
                    hideInfobar: false
                });
                this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
                break;
            case FormModeEnum.EDIT:
            case FormModeEnum.READONLY:
                this.headerLabelKey = 'amm.administration.label.strukturelementbearbeiten';
                this.formNumber = '0355004';
                this.configureToolbox(true);
                this.subscribeToolbox(true);
                this.infopanelService.updateInformation({
                    hideInfobar: false
                });
                this.infopanelService.sendLastUpdate(this.strukturelementData.strukturelement);
                this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
                break;
            default:
        }
    }

    getSpracheOptions() {
        this.spinnerService.activate(this.channel);
        this.stesRestService.getCode(DomainEnum.SPRACHE, AlertChannelEnum.MODAL).subscribe(
            spracheOptions => {
                this.strukturelementData = { ...this.strukturelementData, spracheOptions: spracheOptions.filter(el => el.code !== SpracheEnum.RAETOROMANISCH) };
                this.spinnerService.deactivate(this.channel);
            },
            error => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    configureToolbox(enableHistoriesierung = false) {
        const config = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];
        if (enableHistoriesierung) {
            config.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, false));
        }
        this.toolboxConfiguration = config;
    }

    subscribeToolbox(enableHistoriesierung = false) {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                } else if (enableHistoriesierung && action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.strukturelementData.strukturelement.strukturelementId.toString(), AvamCommonValueObjectsEnum.T_STRUKTURELEMENT);
                }
            });
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId;
        comp.type = objType;
    }

    save() {
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);

        if (!this.strukturelementForm.formGroup.valid) {
            this.strukturelementForm.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger', AlertChannelEnum.MODAL);
            return;
        }

        const strukturelementDto = this.strukturelementForm.mapToDTO();

        if (strukturelementDto.gesetz && this.isBefore(this.strukturelementData.strukturelement.gueltigBis, strukturelementDto.gueltigBis)) {
            const modalRef = this.openConfirmDialog(() => this.saveStrukturElement(strukturelementDto));
            modalRef.componentInstance.primaryButton = 'common.button.jaSpeichern';
            modalRef.componentInstance.promptLabel = 'amm.administration.message.gesetzaendern';
        } else {
            this.saveStrukturElement(strukturelementDto);
        }
    }

    close() {
        if (this.strukturelementForm.formGroup.dirty) {
            const modalRef = this.modalService.open(AbbrechenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', centered: true });
            modalRef.componentInstance.setModalAction(new AbbrechenModalActionNavigation(this.interactionService, modalRef.componentInstance.activeModal));
            this.interactionService.navigateAwayAbbrechen.pipe(takeUntil(this.unsubscribe)).subscribe(okClicked => {
                if (okClicked) {
                    this.modalService.dismissAll();
                }
            });
        } else {
            this.modalService.dismissAll();
        }
    }

    reset() {
        this.strukturelementForm.reset();
    }

    delete() {
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.spinnerService.activate(this.channel);

        this.ammRestService
            .deleteStrukturElement(this.strukturelementData.strukturelement.elementkategorieId, this.strukturelementData.strukturelement.strukturelementId, AlertChannelEnum.MODAL)
            .subscribe(
                response => {
                    if (!response) {
                        this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));
                        this.onDelete.emit(this.strukturelementData.strukturelement);
                    }
                    this.spinnerService.deactivate(this.channel);
                },
                error => {
                    this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    saveStrukturElement(strukturelementDto: StrukturElementDTO) {
        this.spinnerService.activate(this.channel);

        const create = this.ammRestService.saveStrukturElement(strukturelementDto, AlertChannelEnum.MODAL);
        const update = this.ammRestService.updateStrukturElement(strukturelementDto, AlertChannelEnum.MODAL);

        iif(() => (strukturelementDto.strukturelementId ? true : false), update, create).subscribe(
            response => {
                if (response.data) {
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                    this.warningMessages = response.warning ? response.warning : [];
                    this.onSave.emit(response.data);
                }
                this.spinnerService.deactivate(this.channel);
            },
            error => {
                this.spinnerService.deactivate(this.channel);
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    openDeleteDialog() {
        const modalRef = this.openConfirmDialog(() => this.delete());
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.promptLabel = this.strukturelementData.strukturelement.nachfolgerElementList.length
            ? 'amm.administration.message.loeschen'
            : 'common.label.datenWirklichLoeschen';
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        ToolboxService.CHANNEL = this.oldChannel;
        SpinnerService.CHANNEL = this.oldChannel;

        this.infopanelService.updateInformation({ hideInfobar: true });
        this.infopanelService.sendLastUpdate({}, true);
        this.infopanelService.resetTemplateInInfobar();
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);

        this.warningMessages.forEach(message => {
            if (message.key === 'WARNING') {
                this.showWarningMessage(message);
            }
        });
    }

    private openConfirmDialog(callback): NgbModalRef {
        const modalRef = this.modalService.open(GenericConfirmComponent, {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static',
            centered: true
        });
        modalRef.result.then(result => {
            if (result) {
                callback();
            }
        });

        return modalRef;
    }

    private isBefore(date: Date, dateToCompare: Date): boolean {
        const momentDate = moment(date, ['DD.MM.YYYY', 'x'], true);
        const compareDate = moment(dateToCompare, ['DD.MM.YYYY', 'x'], true);

        return compareDate.isBefore(momentDate, 'day');
    }

    private showWarningMessage(message) {
        const errorMessageHeader = message.values.key ? `${this.translateService.instant(message.values.key)}` : '';

        if (message.values.values) {
            const errorMessage = StringHelper.stringFormatter(
                errorMessageHeader,
                [...message.values.values].map(v => {
                    try {
                        return this.translateService.instant(v);
                    } catch (error) {
                        return v;
                    }
                })
            );
            this.fehlermeldungenService.showMessage(errorMessage, message.key.toLowerCase());
        } else {
            this.fehlermeldungenService.showMessage(message.values.key, message.key.toLowerCase());
        }
    }
}
