import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '@shared/services/navigation-service';
import { ActivatedRoute, Router } from '@angular/router';
import { StesVermittlungsfaehigkeits } from '@shared/enums/stes-navigation-paths.enum';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageBus } from '@shared/services/message-bus';
import { SachverhaltFormComponent } from '@stes/pages/vermittlungsfaehigkeit/sachverhalt-form/sachverhalt-form.component';
import PrintHelper from '@shared/helpers/print.helper';
import { FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StesVmfStellungnahmeDTO } from '@shared/models/dtos-generated/stesVmfStellungnahmeDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { DateValidator } from '@shared/validators/date-validator';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';

import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { SanktionLabels, VermittlungsfaehigkeitLabels } from '@shared/enums/stes-routing-labels.enum';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { PermissionContextService } from '@shared/services/permission.context.service';

@Component({
    selector: 'avam-stellungnahme',
    templateUrl: './stes-stellungnahme.component.html',
    styleUrls: ['./stes-stellungnahme.component.scss'],
    providers: [PermissionContextService]
})
export class StesStellungnahmeComponent extends AbstractBaseForm implements OnInit, AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('sachverhaltForm') public sachverhaltForm: SachverhaltFormComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public permissions: typeof Permissions = Permissions;

    public readonly TOOLBOX_ID = 'stellungnahme-component';
    public readonly TOOLBOX_ACTIONS_ERFASSEN = [ToolboxActionEnum.EMAIL, ToolboxActionEnum.PRINT, ToolboxActionEnum.HELP];
    public readonly TOOLBOX_ACTIONS_BEARBEITEN = [ToolboxActionEnum.HISTORY, ToolboxActionEnum.DMS, ToolboxActionEnum.COPY, ToolboxActionEnum.WORD];

    public readonly stellungnahmeChannel: string = 'stellungnahmeChannel';
    public stellungnahmeObject: StesVmfStellungnahmeDTO;
    public stellungnahmeId: string;
    public sachverhaltId: string;
    public stesId: string;

    public previousUrl: string;
    public isBearbeiten = false;

    public stellungnahmeForm: FormGroup;
    public statusOptions: any[] = [];

    private bspCompliant = true;
    private readonly OPTION_KEYS = [
        'stes.vermittlungsfaehigkeit.status.ausstehend',
        'stes.vermittlungsfaehigkeit.status.akzeptiert',
        'stes.vermittlungsfaehigkeit.status.abgelehnt'
    ];

    private unsubscribe$ = new Subject();

    constructor(
        modalService: NgbModal,
        messageBus: MessageBus,
        spinnerService: SpinnerService,
        toolboxService: ToolboxService,
        fehlermeldungenService: FehlermeldungenService,
        private navigationService: NavigationService,
        private previousRouteService: PreviousRouteService,
        private infobarService: AvamStesInfoBarService,
        private resetDialogService: ResetDialogService,
        private formUtils: FormUtilsService,
        private translateService: TranslateService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private readonly notificationService: NotificationService,
        private dataService: StesDataRestService,
        private interactionService: StesComponentInteractionService,
        private permissionContextService: PermissionContextService
    ) {
        super('stellungnahmeForm', modalService, spinnerService, messageBus, toolboxService, fehlermeldungenService);
        this.previousUrl = this.previousRouteService.getPreviousUrl();
    }

    public ngOnInit(): void {
        this.getRouteParams();
        this.setSideNav();
        this.configureToolbox();
        this.createForm();
        this.getData();
        this.configureDropdownOptions();
        this.setStatusToAusstehend();
        this.setSubscriptions();
        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.closeComponent(message);
            }
        });
    }

    public ngAfterViewInit(): void {
        const stellungnahmeBis = this.stellungnahmeForm.controls['stellungnahmeBis'];
        stellungnahmeBis.updateValueAndValidity();
    }

    public ngOnDestroy(): void {
        if (!this.isBearbeiten) {
            this.hideSideNav();
        }
        this.infobarService.sendLastUpdate({}, true);
        this.toolboxService.sendConfiguration([]);
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public closeComponent(message): void {
        if (
            message.data.label === this.translateService.instant(VermittlungsfaehigkeitLabels.STELLUNGNAHME_ERFASSEN) ||
            message.data.label === this.translateService.instant(VermittlungsfaehigkeitLabels.STELLUNGNAHME_BEARBEITEN)
        ) {
            this.cancel();
        }
        this.navigateDependingOnLabel(message.data.label);
    }

    public configureToolbox(): void {
        const bearbeitenActions = this.isBearbeiten ? this.TOOLBOX_ACTIONS_BEARBEITEN : [];
        const toolboxConfig = [...this.TOOLBOX_ACTIONS_ERFASSEN, ...bearbeitenActions].map(action => new ToolboxConfiguration(action, true, true));
        this.toolboxService.sendConfiguration(toolboxConfig, this.TOOLBOX_ID, ToolboxDataHelper.createForVmfStellungnahme(this.stellungnahmeId, +this.stesId, +this.sachverhaltId));
    }

    public getData() {
        this.spinnerService.activate(this.stellungnahmeChannel);
        const getDataObservable = this.isBearbeiten
            ? this.dataService.getVmfStellungnahmebyId(this.stesId, this.sachverhaltId, this.stellungnahmeId).pipe(takeUntil(this.unsubscribe$))
            : this.dataService.getVmfSachverhaltById(this.stesId, this.sachverhaltId).pipe(takeUntil(this.unsubscribe$));
        getDataObservable.subscribe(
            (response: { data: any }) => {
                if (!!response && !!response.data) {
                    if (this.isBearbeiten) {
                        this.stellungnahmeObject = response.data;
                        this.sachverhaltForm.sachverhalt = this.stellungnahmeObject.sachverhaltDTO;
                        this.mapToForm(this.stellungnahmeObject);
                    } else {
                        this.sachverhaltForm.sachverhalt = response.data;
                    }
                    this.fehlermeldungenService.deleteMessage('stes.warning.anspruchberechtigungunklar', 'warning');
                    this.setInfoleisteInfo();
                    this.permissionContextService.getContextPermissions(response.data.ownerId);
                }
                this.spinnerService.deactivate(this.stellungnahmeChannel);
            },
            () => {
                this.spinnerService.deactivate(this.stellungnahmeChannel);
            }
        );
    }

    public setInfoleisteInfo(): void {
        let infoleisteTitle;
        const meldeDatumString = this.formUtils.formatDateNgx(this.sachverhaltForm.sachverhaltForm.get('meldeDatum').value, 'DD.MM.YYYY');
        if (this.isBearbeiten) {
            const stellungnahmeBisDatumString = this.formUtils.formatDateNgx(this.stellungnahmeForm.get('stellungnahmeBis').value, 'DD.MM.YYYY');
            infoleisteTitle = this.translateService.instant('stes.subnavmenuitem.stesvermittlungsfaehigkeit.stellungnahmebearbeiten.infoleiste', {
                '0': meldeDatumString,
                '1': stellungnahmeBisDatumString
            });
        } else {
            infoleisteTitle = this.translateService.instant('stes.subnavmenuitem.stesvermittlungsfaehigkeit.stellungnahmeerfassen.infoleiste', { '0': meldeDatumString });
        }
        this.infobarService.sendDataToInfobar({ title: infoleisteTitle });
        this.isBearbeiten ? this.infobarService.sendLastUpdate(this.stellungnahmeObject) : this.infobarService.sendLastUpdate({}, true);
    }

    public canDeactivate(): boolean {
        return this.stellungnahmeForm.dirty;
    }

    public cancel(): void {
        this.fehlermeldungenService.closeMessage();
        !this.previousUrl || this.previousUrl.includes('erfassen') || this.previousUrl.includes('-bearbeiten')
            ? this.navigateToSachverhaltBearbeiten()
            : this.router.navigate([`stes/details/${this.stesId}/${StesVermittlungsfaehigkeits.VERMITTLUNGSFAEHIGKEIT}`]);
        if (this.canDeactivate()) {
            this.checkConfirmationToCancel();
        } else {
            this.hideSideNav();
        }
    }

    public delete(): void {
        this.spinnerService.activate();
        this.dataService.deleteVmfStellungnahme(this.stesId, this.sachverhaltId, this.stellungnahmeId).subscribe(
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate();
                this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                this.fehlermeldungenService.closeMessage();
                this.navigateToSachverhaltBearbeiten();
                this.hideSideNav();
            },
            () => {
                this.handleErrorResponse();
            }
        );
    }

    public openDeleteDialog(): void {
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

    public reset(): void {
        this.resetDialogService.reset(() => {
            if (this.isBearbeiten) {
                this.mapToForm(this.stellungnahmeObject);
            } else {
                this.stellungnahmeForm.reset();
                this.setStatusToAusstehend();
            }
            this.stellungnahmeForm.markAsPristine();
            this.stellungnahmeForm.markAsUntouched();
        });
    }

    public save(): void {
        if (this.bspCompliant) {
            this.fehlermeldungenService.closeMessage();
            if (this.stellungnahmeForm.valid) {
                this.spinnerService.activate();
                const stesVmfStellungnahmeDTO = this.mapToDTO();
                const responseObservable = !this.isBearbeiten
                    ? this.dataService.createVmfStellungnahme(this.stesId, this.sachverhaltId, stesVmfStellungnahmeDTO)
                    : this.dataService.updateVmfStellungnahme(this.stesId, this.sachverhaltId, stesVmfStellungnahmeDTO);
                responseObservable.subscribe(response => this.handleSuccessResponse(response), () => this.handleErrorResponse());
            } else {
                OrColumnLayoutUtils.scrollTop();
                this.ngForm.onSubmit(undefined);
                this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            }
        } else {
            this.setDangerMessages();
        }
    }

    openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;
        comp.context = DmsMetadatenContext.DMS_CONTEXT_VMF_SACHVERHALT;
        comp.id = this.sachverhaltId;
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private navigateToSachverhaltBearbeiten(): void {
        this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/sachverhalt-bearbeiten`], { queryParams: { sachverhaltId: this.sachverhaltId } });
    }

    private mapToDTO(): StesVmfStellungnahmeDTO {
        const control = this.stellungnahmeForm.controls;
        return {
            stellungnahmeId: parseInt(this.stellungnahmeId, 10),
            vmfId: parseInt(this.sachverhaltId, 10),
            eingangsDatum: control.eingangsdatum.value,
            begruendungAkzeptiert: this.parseStatusToBegruendungAkzeptiert(+control.statusCode.value),
            stellungnahmeBis: control.stellungnahmeBis.value,
            ...(this.isBearbeiten && { ojbVersion: this.stellungnahmeObject.ojbVersion })
        };
    }

    private mapToForm(dto: StesVmfStellungnahmeDTO): void {
        this.stellungnahmeForm.patchValue({
            stellungnahmeBis: new Date(dto.stellungnahmeBis),
            eingangsdatum: !!dto.eingangsDatum ? new Date(dto.eingangsDatum) : null,
            statusCode: dto.begruendungAkzeptiert === null ? Status.AUSSTEHEND : dto.begruendungAkzeptiert ? Status.AKZEPTIERT : Status.ABGELEHNT
        });
    }

    private handleSuccessResponse(result) {
        OrColumnLayoutUtils.scrollTop();
        this.spinnerService.deactivate();
        if (!!result.data) {
            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            this.stellungnahmeForm.markAsPristine();
            if (!this.isBearbeiten) {
                const stellungnahmeId = result.data;
                const sachverhaltId = this.sachverhaltId;
                this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/stellungnahme-bearbeiten`], {
                    queryParams: { sachverhaltId, stellungnahmeId }
                });
            } else {
                this.stellungnahmeObject = result.data;
            }
        }
    }

    private handleErrorResponse() {
        this.spinnerService.deactivate();
        OrColumnLayoutUtils.scrollTop();
    }

    private parseStatusToBegruendungAkzeptiert(statusValue: number): boolean {
        return statusValue === Status.AUSSTEHEND ? null : statusValue === Status.AKZEPTIERT;
    }

    private getRouteParams(): void {
        this.route.queryParamMap.subscribe(params => {
            if (params.get('stellungnahmeId')) {
                this.stellungnahmeId = params.get('stellungnahmeId');
                this.isBearbeiten = true;
            }

            if (params.get('sachverhaltId')) {
                this.sachverhaltId = params.get('sachverhaltId');
            }
        });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    private setSideNav(): void {
        if (this.stellungnahmeId) {
            this.navigationService.showNavigationTreeRoute(StesVermittlungsfaehigkeits.STELLUNGNAHME_BEARBEITEN, {
                sachverhaltId: this.sachverhaltId,
                stellungnahmeId: this.stellungnahmeId
            });
        } else {
            this.navigationService.showNavigationTreeRoute(StesVermittlungsfaehigkeits.STELLUNGNAHME_ERFASSEN, { sachverhaltId: this.sachverhaltId });
        }
    }

    private hideSideNav(): void {
        if (this.stellungnahmeId) {
            this.navigationService.hideNavigationTreeRoute(StesVermittlungsfaehigkeits.STELLUNGNAHME_BEARBEITEN, {
                sachverhaltId: this.sachverhaltId,
                stellungnahmeId: this.stellungnahmeId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(StesVermittlungsfaehigkeits.STELLUNGNAHME_ERFASSEN, { sachverhaltId: this.sachverhaltId });
        }
    }

    private configureDropdownOptions(): void {
        this.statusOptions = this.getStatusOptions();
        this.translateService.onLangChange.subscribe(() => {
            this.statusOptions = this.getStatusOptions();
        });
    }

    private getStatusOptions(): any[] {
        const currentLang = this.translateService.currentLang;
        return this.OPTION_KEYS.map((key, index) => {
            const translationDe = currentLang === 'de' ? this.translateService.instant(key) : '';
            const translationFr = currentLang === 'fr' ? this.translateService.instant(key) : '';
            const translationIt = currentLang === 'it' ? this.translateService.instant(key) : '';
            return { value: index + 1, labelDe: translationDe, labelFr: translationFr, labelIt: translationIt };
        });
    }

    private createForm(): void {
        this.stellungnahmeForm = this.fb.group({
            stellungnahmeBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            eingangsdatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            statusCode: [null, Validators.required]
        });

        this.stellungnahmeForm.controls['statusCode'].valueChanges.subscribe((value: string) => {
            const eingangsdatum = this.stellungnahmeForm.controls['eingangsdatum'];
            eingangsdatum.setValidators(
                +value === Status.AKZEPTIERT || +value === Status.ABGELEHNT
                    ? [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]
                    : [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]
            );
            eingangsdatum.updateValueAndValidity();

            this.setDangerMessages();
        });

        this.stellungnahmeForm.controls['eingangsdatum'].valueChanges.subscribe(() => {
            this.setDangerMessages();
        });
    }

    private setDangerMessages() {
        const eingangsdatum = this.stellungnahmeForm.controls['eingangsdatum'];
        const statusCode = this.stellungnahmeForm.controls['statusCode'];
        this.fehlermeldungenService.closeMessage();
        this.bspCompliant = true;

        if (eingangsdatum.valid && eingangsdatum.value !== null && eingangsdatum.value !== '' && +statusCode.value === Status.AUSSTEHEND) {
            this.fehlermeldungenService.showMessage('stes.error.vermittlungsfaehigkeit.fehlermeldung4668', 'danger');
            OrColumnLayoutUtils.scrollTop();
            this.bspCompliant = false;
        }
    }

    private setStatusToAusstehend(): void {
        if (!this.isBearbeiten) {
            this.stellungnahmeForm.get('statusCode').setValue(this.statusOptions.find((value, index) => index === 0).value);
        }
    }

    private setSubscriptions(): void {
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.setInfoleisteInfo();
        });

        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.stellungnahmeId, AvamCommonValueObjectsEnum.T_STES_VMF_STELLUNGNAHME);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });
    }

    private navigateDependingOnLabel(label) {
        if (label === this.translateService.instant(SanktionLabels.STELLUNGNAHME_ERFASSEN) || label === this.translateService.instant(SanktionLabels.STELLUNGNAHME_BEARBEITEN)) {
            if (this.router.url.includes(StesVermittlungsfaehigkeits.VERMITTLUNGSFAEHIGKEIT) && this.router.url.includes('stellungnahme')) {
                !this.previousUrl || this.previousUrl.endsWith(StesVermittlungsfaehigkeits.VERMITTLUNGSFAEHIGKEIT)
                    ? this.router.navigate([`stes/details/${this.stesId}/${StesVermittlungsfaehigkeits.VERMITTLUNGSFAEHIGKEIT}`])
                    : this.navigateToSachverhaltBearbeiten();
            }
        }
    }

    private checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideSideNav();
            }
        });
    }
}

/*
 * If the values in the Status enum are going to be changed,
 * code in the 'getStatusOptions' function should be updated
 * consequently to avoid breaking the component
 */

enum Status {
    AUSSTEHEND = 1,
    AKZEPTIERT = 2,
    ABGELEHNT = 3
}
