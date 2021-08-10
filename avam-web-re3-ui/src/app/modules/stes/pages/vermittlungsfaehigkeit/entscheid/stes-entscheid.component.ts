import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StesSanktionen, StesVermittlungsfaehigkeits } from '@shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@shared/services/navigation-service';
import { ActivatedRoute, Router } from '@angular/router';
import { first, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { AbstractBaseForm } from '@app/shared/classes/abstract-base-form';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageBus } from '@app/shared/services/message-bus';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SachverhaltFormComponent } from '../sachverhalt-form/sachverhalt-form.component';
import { forkJoin, Subject } from 'rxjs';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { Permissions } from '@shared/enums/permissions.enum';
import PrintHelper from '@shared/helpers/print.helper';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { NumberValidator } from '@shared/validators/number-validator';
import { DateValidator } from '@shared/validators/date-validator';
import { StesVmfEntscheidDTO } from '@shared/models/dtos-generated/stesVmfEntscheidDTO';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { BenutzerDetailDTO } from '@shared/models/dtos-generated/benutzerDetailDTO';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';

import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { Location } from '@angular/common';
import { SachverhaltStatusCodeEnum as StatusEnum } from '@shared/enums/domain-code/sachverhaltstatus-code.enum';
import { StatusCodeService } from '@stes/pages/vermittlungsfaehigkeit/status-code.service';
import { SanktionLabels, VermittlungsfaehigkeitLabels } from '@shared/enums/stes-routing-labels.enum';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { GenericConfirmComponent } from '@app/shared';
import { VermittlungsfaehigkeitDTO } from '@dtos/vermittlungsfaehigkeitDTO';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { PermissionContextService } from '@shared/services/permission.context.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stes-entscheid',
    templateUrl: './stes-entscheid.component.html',
    styleUrls: ['./stes-entscheid.component.scss'],
    providers: [PermissionContextService]
})
export class StesEntscheidComponent extends AbstractBaseForm implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') public ngForm: FormGroupDirective;
    @ViewChild('sachverhaltForm') public sachverhaltForm: SachverhaltFormComponent;
    @ViewChild('freigabeDurch') public freigabeDurchAutosuggest: AvamPersonalberaterAutosuggestComponent;

    public permissions: typeof Permissions = Permissions;

    public readonly TOOLBOX_ID = 'entscheid-component';
    public readonly TOOLBOX_ACTIONS_ERFASSEN = [ToolboxActionEnum.EMAIL, ToolboxActionEnum.PRINT, ToolboxActionEnum.HELP];
    public readonly TOOLBOX_ACTIONS_BEARBEITEN = [ToolboxActionEnum.HISTORY, ToolboxActionEnum.DMS, ToolboxActionEnum.COPY, ToolboxActionEnum.WORD];

    public previousUrl: string;
    public hatErsetzt = false;
    public isBearbeiten = false;
    public entscheidObject: StesVmfEntscheidDTO;

    public entscheidId: string;
    public sachverhaltId: string;
    public stesId: string;

    public BSP23: boolean;
    public BSP24: boolean;
    public BSP25: boolean;
    public BSP26: boolean;

    public entscheidForm: FormGroup;
    public freigabedurch: any = null;
    public benutzerstelleSuchenTokens: any = {};
    public benutzerSuchenTokensfreigabeDurch: {};
    public statusOptions: any[] = [];
    public statusOptionsBackup: any[] = [];

    public sachverhaltDTO: VermittlungsfaehigkeitDTO;

    public personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    private entscheidFormChannel = 'entscheidFormChannel';
    private unsubscribe$ = new Subject();

    constructor(
        private navigationService: NavigationService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private location: Location,
        private statusCodeService: StatusCodeService,
        private resetDialogService: ResetDialogService,
        private authenticationService: AuthenticationService,
        private previousRouteService: PreviousRouteService,
        private formBuilder: FormBuilder,
        private obliqueHelperService: ObliqueHelperService,
        private dataService: StesDataRestService,
        private translateService: TranslateService,
        private infobarService: AvamStesInfoBarService,
        private facade: FacadeService,
        private readonly notificationService: NotificationService,
        modalService: NgbModal,
        messageBus: MessageBus,
        toolboxService: ToolboxService,
        spinnerService: SpinnerService,
        fehlermeldungenService: FehlermeldungenService,
        private interactionService: StesComponentInteractionService,
        private permissionContextService: PermissionContextService
    ) {
        super('entscheidForm', modalService, spinnerService, messageBus, toolboxService, fehlermeldungenService);
        this.previousUrl = this.previousRouteService.getPreviousUrl();
    }

    public ngOnInit(): void {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.getActivatedRouteParams();
        this.setSideNav();
        this.defineFormGroup();
        this.getData();
        this.configureToolbox();
        this.setSubscriptions();
    }

    closeComponent(message) {
        if (
            message.data.label === this.translateService.instant(VermittlungsfaehigkeitLabels.ENTSCHEID_ERFASSEN) ||
            message.data.label === this.translateService.instant(VermittlungsfaehigkeitLabels.ENTSCHEID_BEARBEITEN)
        ) {
            this.cancel();
        }
        this.navigateDependingOnLabel(message.data.label);
    }

    public ngOnDestroy(): void {
        if (!this.isBearbeiten) {
            this.hideSideNav();
        }
        this.infobarService.sendLastUpdate({}, true);
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public getData(): void {
        this.spinnerService.activate(this.entscheidFormChannel);
        const getDataObservable = this.isBearbeiten
            ? this.dataService.getVmfEntscheidbyId(this.stesId, this.sachverhaltId, this.entscheidId)
            : this.dataService.getVmfSachverhaltById(this.stesId, this.sachverhaltId);

        forkJoin(this.dataService.getCode(DomainEnum.ENTSCHEID_STATUS), getDataObservable)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                ([stesStatus, entityData]) => {
                    if (!!stesStatus) {
                        this.statusOptionsBackup = stesStatus;
                        this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(stesStatus);
                        if (!this.isBearbeiten) {
                            setTimeout(() => this.setInitialValueStatusCode(), 0);
                        }
                    }

                    if (!!entityData && !!entityData.data) {
                        if (this.isBearbeiten) {
                            this.entscheidObject = entityData.data;
                            this.sachverhaltForm.sachverhalt = this.entscheidObject.sachverhaltDTO;
                            this.mapToForm(this.entscheidObject);
                            this.defineFreigabeDurchValidation();
                            this.setReadOnly();
                            this.setBSPs();
                        } else {
                            this.sachverhaltForm.sachverhalt = entityData.data;
                            this.sachverhaltDTO = entityData.data;
                        }
                        this.getCurrentUserAndToken();
                        this.fehlermeldungenService.deleteMessage('stes.warning.anspruchberechtigungunklar', 'warning');
                        this.setInfoleisteInfo();
                        this.permissionContextService.getContextPermissions(entityData.data.ownerId);
                    }

                    if (!!stesStatus && !!entityData && !!entityData.data && this.isBearbeiten) {
                        this.statusOptions = this.updateStatusOptions(entityData.data);
                    }

                    this.spinnerService.deactivate(this.entscheidFormChannel);
                },
                () => {
                    this.spinnerService.deactivate(this.entscheidFormChannel);
                }
            );
    }

    public configureToolbox(): void {
        const bearbeitenActions = this.isBearbeiten ? this.TOOLBOX_ACTIONS_BEARBEITEN : [];
        const toolboxConfig = [...this.TOOLBOX_ACTIONS_ERFASSEN, ...bearbeitenActions].map(action => new ToolboxConfiguration(action, true, true));
        this.toolboxService.sendConfiguration(toolboxConfig, this.TOOLBOX_ID, ToolboxDataHelper.createForVmfEntscheid(this.entscheidId, +this.stesId, +this.sachverhaltId));
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
        if (this.hatErsetzt) {
            this.hatErsetzt = false;
            this.getActivatedRouteParams();
            this.getData();
        }
    }

    public reset(): void {
        this.resetDialogService.reset(() => {
            if (this.isBearbeiten) {
                this.mapToForm(this.entscheidObject);
            } else {
                this.entscheidForm.reset();
                this.entscheidForm.controls.vermittlungsfaehig.setValue(false);
                this.freigabeDurchAutosuggest.benutzer = undefined;
                this.freigabeDurchAutosuggest.benutzerDetail = undefined;
                this.setInitialValueAlkTransferDate();
                this.setInitialValueStatusCode();
            }
            this.entscheidForm.markAsPristine();
            this.entscheidForm.markAsUntouched();
        });
    }

    public canDeactivate(): boolean {
        return this.entscheidForm.dirty;
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

    public delete(): void {
        this.spinnerService.activate();
        this.dataService
            .deleteVmfEntscheid(this.stesId, this.sachverhaltId, this.entscheidId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate();
                    this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                    this.navigateToSachverhaltBearbeiten();
                    this.hideSideNav();
                },
                () => {
                    this.handleErrorResponse();
                }
            );
    }

    // includes ueberarbeiten, zuruecknehmen, ersetzen and freigeben
    public updateEntscheid(requestType: string): void {
        this.spinnerService.activate();
        this.fehlermeldungenService.closeMessage();
        this.dataService[requestType](this.stesId, this.sachverhaltId, this.entscheidId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                response => {
                    this.handleSuccessResponse(response);
                    if (requestType === 'ersetzenVmfEntscheid') {
                        this.setNewBearbeitenRoute(response);
                    }
                },
                () => this.handleErrorResponse()
            );
    }

    public save(): void {
        this.fehlermeldungenService.closeMessage();
        if (this.entscheidForm.valid) {
            this.spinnerService.activate();
            const stesVmfEntscheidDTO = this.mapToDTO();
            const responseObservable = !this.isBearbeiten
                ? this.dataService.createVmfEntscheid(this.stesId, this.sachverhaltId, stesVmfEntscheidDTO).pipe(takeUntil(this.unsubscribe$))
                : this.dataService.updateVmfEntscheid(this.stesId, this.sachverhaltId, stesVmfEntscheidDTO).pipe(takeUntil(this.unsubscribe$));
            responseObservable.subscribe(response => this.handleSuccessResponse(response), () => this.handleErrorResponse());
        } else {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    public updateVermittlungsgrad(isVermittlungsfaehig: boolean, keepValue?: boolean): void {
        const vermittlungsgradControl = this.entscheidForm.controls['vermittlungsgrad'];
        if (isVermittlungsfaehig) {
            vermittlungsgradControl.setValidators([Validators.required, NumberValidator.checkValueBetween1and100]);
            vermittlungsgradControl.enable();
        } else {
            if (!keepValue) {
                this.entscheidForm.controls.vermittlungsgrad.setValue(null);
            }
            vermittlungsgradControl.clearValidators();
            vermittlungsgradControl.disable();
        }
        vermittlungsgradControl.updateValueAndValidity();
    }

    public onChangeSlider(target): void {
        this.entscheidForm.controls['vermittlungsgrad'].setValue(Math.floor(target.value) === 0 ? 1 : target.value);
    }

    public onBlurSliderValue(target): void {
        if (target.value !== null && target.value !== '' && target.value !== '0') {
            this.entscheidForm.controls['vermittlungsgrad'].setValue(Math.floor(target.value));
            this.entscheidForm.controls['vermittlungsgrad'].markAsDirty();
            this.entscheidForm.controls['vermittlungsgrad'].updateValueAndValidity();
        }
    }

    public mapToDTO(): StesVmfEntscheidDTO {
        const control = this.entscheidForm.controls;

        return {
            entscheidVmfId: this.entscheidId ? parseInt(this.entscheidId, 10) : null,
            vmfId: parseInt(this.sachverhaltId, 10),
            istVermittlungsfaehig: control.vermittlungsfaehig.value,
            vermittlungsGradProzent: control.vermittlungsgrad.value,
            vermittlungsfaehigVon: control.vermittlungsfaehigVon.value,
            vermittlungsfaehigBis: control.vermittlungsfaehigBis.value,
            statusCode: { codeId: control.statusCode.value, code: '0' },
            ueberprueferBenutzerDetail: this.getFreigabeDurchInfo(),
            ...(this.isBearbeiten && { ojbVersion: this.entscheidObject.ojbVersion })
        };
    }

    public mapToForm(dto: StesVmfEntscheidDTO): void {
        this.entscheidForm.patchValue({
            vermittlungsfaehig: dto.istVermittlungsfaehig,
            vermittlungsgrad: dto.vermittlungsGradProzent,
            vermittlungsfaehigVon: dto.vermittlungsfaehigVon ? new Date(dto.vermittlungsfaehigVon) : null,
            vermittlungsfaehigBis: dto.vermittlungsfaehigBis ? new Date(dto.vermittlungsfaehigBis) : null,
            statusCode: dto.statusCode.codeId,
            entscheidNr: dto.entscheidNr,
            entscheidDatum: dto.entscheidDatum ? this.facade.formUtilsService.formatDateNgx(dto.entscheidDatum, FormUtilsService.GUI_DATE_FORMAT) : null,
            alkTransferDate: dto.alkTransferDate ? this.facade.formUtilsService.formatDateNgx(dto.alkTransferDate, FormUtilsService.GUI_DATE_FORMAT) : null,
            ersetztEntscheidNr: dto.vorgEntscheid && this.entscheidObject.vorgEntscheid.statusCode.codeId === 1686 ? dto.vorgEntscheid.entscheidNr : null,
            freigabeDurch: dto.ueberprueferBenutzerDetail
        });

        if (dto.ueberprueferBenutzerDetail) {
            this.updateFreigabeDurch(dto.ueberprueferBenutzerDetail);
        }

        if (dto.alkTransferDate === null) {
            this.setInitialValueAlkTransferDate();
        }
    }

    public updateFreigabeDurch(freigabeDurch: any): void {
        if (typeof freigabeDurch === 'string' && freigabeDurch === '') {
            this.freigabedurch = null;
        } else if (typeof freigabeDurch !== 'string') {
            this.freigabedurch = freigabeDurch;
        }
    }

    private getFreigabeDurchInfo(): BenutzerDetailDTO {
        if (!!this.freigabedurch && !!this.benutzerstelleSuchenTokens.benutzerstelleId) {
            return {
                benutzerId: this.freigabedurch.benutzerId,
                benutzerDetailId: this.freigabedurch.benutzerDetailId,
                nachname: this.freigabedurch.nachname,
                vorname: this.freigabedurch.vorname,
                benutzerstelleId: this.benutzerstelleSuchenTokens.benutzerstelleId,
                benuStelleCode: this.freigabedurch.benuStelleCode
            };
        } else {
            return null;
        }
    }

    private updateStatusOptions(sachverhalt: VermittlungsfaehigkeitDTO): any[] {
        const filteredStatusOptions = this.statusCodeService.filterStatusOptionsByInitialStatus(this.statusOptionsBackup, sachverhalt.statusCode.codeId);
        return this.facade.formUtilsService.mapDropdownKurztext(filteredStatusOptions);
    }

    private setReadOnly(): void {
        const status = this.entscheidObject.statusCode.code;
        if (status === StatusEnum.STATUS_FREIGABEBEREIT || status === StatusEnum.STATUS_FREIGEGEBEN || status === StatusEnum.STATUS_ERSETZT) {
            this.entscheidForm.disable();
            this.updateVermittlungsgrad(false, true);
        } else {
            this.entscheidForm.enable();
            this.updateVermittlungsgrad(this.entscheidObject.istVermittlungsfaehig);
        }

        this.entscheidForm.updateValueAndValidity();
    }

    private setBSPs(): void {
        const status = this.entscheidObject.statusCode.code;
        // status equal to 'pendent' or 'in Überarbeitung';
        this.BSP23 = status === StatusEnum.STATUS_PENDENT || status === StatusEnum.STATUS_UEBERARBEITUNG;
        // status equal to 'freigabebereit'
        this.BSP24 = status === StatusEnum.STATUS_FREIGABEBEREIT;
        // status equal to 'freigegeben' and no nachEntscheid available
        this.BSP25 = status === StatusEnum.STATUS_FREIGEGEBEN && !this.entscheidObject.nachEntscheidId;
        // status equal to ersetzt or to freigegeben and nachEntscheid is available
        this.BSP26 = status === StatusEnum.STATUS_ERSETZT || (status === StatusEnum.STATUS_FREIGEGEBEN && !!this.entscheidObject.nachEntscheidId);
        // status of the previous entscheid is equal to ersetzt
        if (this.entscheidObject.vorgEntscheid && this.entscheidObject.vorgEntscheid.statusCode.code === StatusEnum.STATUS_ERSETZT) {
            this.entscheidForm.patchValue({ ersetztEntscheidNr: this.entscheidObject.vorgEntscheid.entscheidNr });
        }
    }

    private setInfoleisteInfo(): void {
        let infoleisteTitle;
        const meldeDatumString = this.facade.formUtilsService.formatDateNgx(this.sachverhaltForm.sachverhaltForm.get('meldeDatum').value, 'DD.MM.YYYY');
        if (this.isBearbeiten) {
            const entscheidNrString = this.entscheidForm.get('entscheidNr').value;
            infoleisteTitle = this.translateService.instant('stes.subnavmenuitem.stesvermittlungsfaehigkeit.entscheidbearbeiten.infoleiste', {
                '0': meldeDatumString,
                '1': entscheidNrString
            });
        } else {
            infoleisteTitle = this.translateService.instant('stes.subnavmenuitem.stesvermittlungsfaehigkeit.entscheiderfassen.infoleiste', { '0': meldeDatumString });
        }

        this.infobarService.sendDataToInfobar({ title: infoleisteTitle });
        this.isBearbeiten ? this.infobarService.sendLastUpdate(this.entscheidObject) : this.infobarService.sendLastUpdate({}, true);
    }

    private handleSuccessResponse(result) {
        OrColumnLayoutUtils.scrollTop();
        this.spinnerService.deactivate();
        if (!!result.data) {
            this.entscheidForm.markAsPristine();
            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            if (!this.isBearbeiten) {
                this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/entscheid-bearbeiten`], {
                    queryParams: { sachverhaltId: this.sachverhaltId, entscheidId: result.data }
                });
            } else {
                this.reloadComponentData(result.data);
            }
        }
    }

    private reloadComponentData(entscheid: StesVmfEntscheidDTO) {
        this.sachverhaltForm.sachverhalt = entscheid.sachverhaltDTO;
        this.statusOptions = this.updateStatusOptions(entscheid);
        this.entscheidObject = entscheid;
        this.mapToForm(entscheid);
        this.setReadOnly();
        this.setBSPs();
    }

    private setNewBearbeitenRoute(response) {
        if (!!response.data) {
            this.entscheidId = response.data.entscheidVmfId;
            const queryParams = { sachverhaltId: this.sachverhaltId, entscheidId: this.entscheidId };
            this.location.go(this.router.createUrlTree([], { relativeTo: this.activatedRoute, queryParams }).toString());
            this.hatErsetzt = true;
        }
    }

    private handleErrorResponse() {
        this.spinnerService.deactivate();
        OrColumnLayoutUtils.scrollTop();
    }

    private navigateToSachverhaltBearbeiten(): void {
        this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/sachverhalt-bearbeiten`], { queryParams: { sachverhaltId: this.sachverhaltId } });
    }

    private getActivatedRouteParams() {
        this.activatedRoute.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.activatedRoute.queryParamMap.subscribe(params => {
            // Entscheid erfassen
            if (params.get('sachverhaltId')) {
                this.sachverhaltId = params.get('sachverhaltId');
            }
            // Entscheid bearbeiten
            if (params.get('entscheidId')) {
                this.entscheidId = params.get('entscheidId');
                this.isBearbeiten = true;
            }
        });
    }

    private setSideNav(): void {
        if (this.entscheidId) {
            this.navigationService.showNavigationTreeRoute(StesVermittlungsfaehigkeits.ENTSCHEID_BEARBEITEN, {
                sachverhaltId: this.sachverhaltId,
                entscheidId: this.entscheidId
            });
        } else {
            this.navigationService.showNavigationTreeRoute(StesVermittlungsfaehigkeits.ENTSCHEID_ERFASSEN, { sachverhaltId: this.sachverhaltId });
        }
    }

    private hideSideNav(): void {
        if (this.entscheidId) {
            this.navigationService.hideNavigationTreeRoute(StesVermittlungsfaehigkeits.ENTSCHEID_BEARBEITEN, {
                sachverhaltId: this.sachverhaltId,
                entscheidId: this.entscheidId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(StesVermittlungsfaehigkeits.ENTSCHEID_ERFASSEN, { sachverhaltId: this.sachverhaltId });
        }
    }

    private defineFormGroup(): void {
        this.entscheidForm = this.formBuilder.group(
            {
                vermittlungsfaehig: [false],
                vermittlungsgrad: [null],
                vermittlungsfaehigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.dateRangeNgx]],
                vermittlungsfaehigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.dateRangeNgx]],
                statusCode: [null, [Validators.required]],
                entscheidNr: [null],
                entscheidDatum: [null],
                alkTransferDate: [null],
                ersetztEntscheidNr: [null],
                freigabeDurch: [null]
            },
            { validator: DateValidator.rangeBetweenDates('vermittlungsfaehigVon', 'vermittlungsfaehigBis', 'val201') }
        );
        this.setInitialValueAlkTransferDate();
    }

    private defineFreigabeDurchValidation(): void {
        const freigabeDurch = this.entscheidForm.get('freigabeDurch');
        if (this.entscheidForm.get('statusCode').value === this.facade.formUtilsService.getCodeIdByCode(this.statusOptionsBackup, StatusEnum.STATUS_FREIGABEBEREIT)) {
            freigabeDurch.setValidators([Validators.required]);
        } else {
            freigabeDurch.clearValidators();
        }
        freigabeDurch.updateValueAndValidity();
    }

    private getCurrentUserAndToken(): void {
        const currentUser = this.authenticationService.getLoggedUser();
        if (currentUser) {
            this.benutzerSuchenTokensfreigabeDurch = {
                berechtigung: Permissions.STES_VMF_ENTSCHEID_FREIGEBEN_UEBERARBEITEN,
                myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES,
                benutzerstelleId: this.isBearbeiten ? this.entscheidObject.sachverhaltDTO.ownerId : currentUser.benutzerstelleId
            };

            this.benutzerstelleSuchenTokens = {
                benutzerstelleId: `${currentUser.benutzerstelleId}`,
                vollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    private setSubscriptions(): void {
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.setInfoleisteInfo();

            if (!this.entscheidObject.alkTransferDate) {
                this.setInitialValueAlkTransferDate(event);
            }
        });

        this.entscheidForm
            .get('statusCode')
            .valueChanges.pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => this.defineFreigabeDurchValidation());

        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.entscheidId, AvamCommonValueObjectsEnum.T_STES_VMF_ENTSCHEID);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });

        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.closeComponent(message);
            }
        });
    }

    private openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static'
        });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;
        comp.context = DmsMetadatenContext.DMS_CONTEXT_VMF_ENTSCHEID;
        comp.id = this.entscheidId;
    }

    private openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, {
            windowClass: 'avam-modal-xl',
            ariaLabelledBy: 'modal-basic-title',
            centered: true,
            backdrop: 'static'
        });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private setInitialValueStatusCode(): void {
        this.entscheidForm.controls.statusCode.setValue(this.facade.formUtilsService.getCodeIdByCode(this.statusOptionsBackup, StatusEnum.STATUS_PENDENT));
    }

    private setInitialValueAlkTransferDate(languageEvent?: LangChangeEvent): void {
        const translateService = this.translateService.translations[this.translateService.currentLang];
        if (!!translateService) {
            const label = languageEvent ? languageEvent.translations.stes.message.alkTrasferKeineDate : translateService.stes.message.alkTrasferKeineDate;
            this.entscheidForm.controls.alkTransferDate.setValue(label);
        }
    }

    private getEntscheidPath(): StesVermittlungsfaehigkeits {
        return this.entscheidId ? StesVermittlungsfaehigkeits.ENTSCHEID_BEARBEITEN : StesVermittlungsfaehigkeits.ENTSCHEID_ERFASSEN;
    }

    private navigateDependingOnLabel(label) {
        if (label === this.translateService.instant(SanktionLabels.ENTSCHEID_ERFASSEN) || label === this.translateService.instant(SanktionLabels.ENTSCHEID_BEARBEITEN)) {
            if (this.router.url.includes(StesVermittlungsfaehigkeits.VERMITTLUNGSFAEHIGKEIT) && this.router.url.includes('entscheid')) {
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
