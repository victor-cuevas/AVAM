import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesWiedereingliederungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { WidereingliederungLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperListStesAusgangslageDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesAusgangslageDTOWarningMessages';
import { BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesAusgangslageDetailsDTOWarningMessages';
import { BaseResponseWrapperStesRahmenfristDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesRahmenfristDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { WarningMessages } from '@app/shared/models/dtos-generated/warningMessages';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { AusgangslageFormComponent } from '../ausgangslage-form/ausgangslage-form.component';
import { AusgangsLageFormData } from '../ausgangslage-form/ausgangslage-form.model';

@Component({
    selector: 'avam-ausgangslage-bearbeiten-page',
    templateUrl: './ausgangslage-bearbeiten-page.component.html'
})
export class AusgangslageBearbeitenPageComponent implements OnInit, OnDestroy {
    @ViewChild('formComponent') formComponent: AusgangslageFormComponent;
    stesId: number;
    ausgangslageId: number;
    channel = 'ausgangslage-bearbeiten-page';
    toolboxSubscription: Subscription;
    langChangeSubscription: Subscription;
    sidenavCloseSub: Subscription;
    formData: AusgangsLageFormData;
    permissions: typeof Permissions = Permissions;
    reloadForm = true;

    constructor(
        private dataRestService: StesDataRestService,
        private datePipe: DatePipe,
        private facade: FacadeService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private router: Router,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.setRouteParams();
        this.facade.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_BEARBEITEN, {
            ausgangslageId: this.ausgangslageId
        });
        this.configureToolbox();
        this.toolboxSubscription = this.getToolboxSubscription();
        this.getData();
        this.langChangeSubscription = this.subscribeToLangChange();
        this.sidenavCloseSub = this.getSidenavCloseSub();
    }

    setRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.ausgangslageId = +params.get('ausgangslageId');
        });

        this.route.parent.params.subscribe(params => {
            this.stesId = +params['stesId'];
        });
    }

    configureToolbox() {
        const toolboxData: DokumentVorlageToolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.WDGAUSGANGSLAGE,
            vorlagenKategorien: [VorlagenKategorie.Wdg],
            entityIDsMapping: { STES_ID: this.stesId, AUSGANGSLAGE_ID: this.ausgangslageId }
        };

        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];
        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, toolboxData);
    }

    getToolboxSubscription(): Subscription {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_AUSGANGSLAGE, this.ausgangslageId.toString());
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.facade.openModalFensterService.openHistoryModal(this.ausgangslageId.toString(), AvamCommonValueObjectsEnum.T_AUSGANGSLAGE);
            }
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin<CodeDTO[], CodeDTO[], CodeDTO[], CodeDTO[], BaseResponseWrapperStesRahmenfristDTOWarningMessages, BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages>([
            this.dataRestService.getCode(DomainEnum.STESVERMITTELBARKEIT),
            this.dataRestService.getCode(DomainEnum.STESQUALIFIKATIONSBEDARF),
            this.dataRestService.getCode(DomainEnum.STESHANDLUNGSBEDARF),
            this.dataRestService.getCode(DomainEnum.STESPRIORITAET),
            this.dataRestService.getRahmenfrist(this.stesId),
            this.dataRestService.getAusgangslageDetails(this.ausgangslageId)
        ]).subscribe(
            ([vermittelbarkeitOptions, qualifikationsbedarfOptions, handlungsbedarfOptions, priorityOptions, rahmenfristRes, ausgangslageRes]) => {
                this.formData = {
                    vermittelbarkeitOptions,
                    qualifikationsbedarfOptions,
                    handlungsbedarfOptions,
                    priorityOptions,
                    rahmenfristDTO: rahmenfristRes.data,
                    ausgangslageDetailsDTO: ausgangslageRes.data,
                    stesId: this.stesId
                };

                this.facade.authenticationService.setOwnerPermissionContext(ausgangslageRes.data.stesID, ausgangslageRes.data.ownerId);
                this.setUeberschrift();
                this.stesInfobarService.sendLastUpdate(this.formData.ausgangslageDetailsDTO);

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    setUeberschrift() {
        const date = this.datePipe.transform(this.formData.ausgangslageDetailsDTO.ausgangslageGueltigAb, 'dd.MM.yyyy');

        this.stesInfobarService.sendDataToInfobar({
            title: `${this.facade.translateService.instant('stes.label.wiedereingliederung.ausgangslageBearbeiten')} ${date}`
        });
    }

    subscribeToLangChange(): Subscription {
        return this.facade.translateService.onLangChange.subscribe(() => {
            this.setUeberschrift();
        });
    }

    getSidenavCloseSub(): Subscription {
        return this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                if (message.data.label === this.facade.translateService.instant(WidereingliederungLabels.AUSGANGSLAGE_BEARBEITEN)) {
                    this.cancel();
                }
            }
        });
    }

    cancel() {
        this.router.navigate([`./${StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN}`], { relativeTo: this.route.parent });
        this.facade.navigationService.hideNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_BEARBEITEN, {
            ausgangslageId: this.ausgangslageId
        });
    }

    reset() {
        this.formComponent.reset();
    }

    openDeleteDialog() {
        const modalRef: NgbModalRef = this.modalService.open(GenericConfirmComponent, { backdrop: 'static' });
        modalRef.result.then(shouldDelete => {
            if (shouldDelete) {
                this.delete();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    delete() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);
        this.dataRestService.deleteAusgangslage(this.ausgangslageId).subscribe(
            (response: BaseResponseWrapperListStesAusgangslageDTOWarningMessages) => {
                if (response && response.warning.find(element => element.key === WarningMessages.KeyEnum.DANGER)) {
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgeloescht'));
                } else {
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengeloescht'));
                    this.formComponent.formGroup.markAsPristine();
                    this.formComponent.tableModified = false;
                    this.router.navigate([`stes/details/${this.stesId}/wiedereingliederung/ausgangslage`]);
                    this.facade.navigationService.hideNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_BEARBEITEN, {
                        ausgangslageId: this.ausgangslageId
                    });
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.formComponent.formGroup.invalid) {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.formComponent.ngForm.onSubmit(undefined);
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.facade.spinnerService.activate(this.channel);
        const ausgangslageDTO = this.formComponent.mapToDTO();
        this.dataRestService.updateAusgangslage(ausgangslageDTO, this.facade.translateService.currentLang).subscribe(
            (res: BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages) => {
                if (res.data) {
                    this.formData = { ...this.formData, ausgangslageDetailsDTO: res.data };
                    this.reload();
                }

                this.displaySaveMessage(res.warning);
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    displaySaveMessage(warnings: Array<WarningMessages>) {
        const hasDangerWarnings = warnings ? warnings.some(warning => warning.key === WarningMessages.KeyEnum.DANGER) : false;

        if (hasDangerWarnings) {
            this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
        } else {
            this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
        }
    }

    reload() {
        setTimeout(() => (this.reloadForm = false));
        setTimeout(() => (this.reloadForm = true));
    }

    canDeactivate(): boolean {
        return this.formComponent.formGroup.dirty || this.formComponent.tableModified;
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.authenticationService.removeOwnerPermissionContext();
        this.toolboxSubscription.unsubscribe();
        this.langChangeSubscription.unsubscribe();
        this.sidenavCloseSub.unsubscribe();
        this.stesInfobarService.sendLastUpdate({}, true);
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
