import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SanktionenSachverhaltCodeEnum, SanktionenSachverhaltCodeEnum as SanktionSachverhaltType } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@shared/services/navigation-service';
import { forkJoin, Observable, Subject } from 'rxjs';
import { concatMap, filter, finalize, first, take, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageBus } from '@app/shared/services/message-bus';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AbstractBaseForm } from '@app/shared/classes/abstract-base-form';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { SachverhaltStatusCodeEnum as StatusEnum } from '@shared/enums/domain-code/sachverhaltstatus-code.enum';
import { SanktionSachverhaltDTO } from '@dtos/sanktionSachverhaltDTO';
import { SanktionLabels } from '@shared/enums/stes-routing-labels.enum';
import * as moment from 'moment';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { StatusCodeService } from '@stes/pages/vermittlungsfaehigkeit/status-code.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Permissions } from '@shared/enums/permissions.enum';
import { AuthenticationService } from '@core/services/authentication.service';
import { BenutzerDetailDTO } from '@dtos/benutzerDetailDTO';
import { DateValidator } from '@shared/validators/date-validator';
import { NumberValidator } from '@shared/validators/number-validator';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { SanktionSachverhaltAbmDTO } from '@app/shared/models/dtos-generated/sanktionSachverhaltAbmDTO';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';

import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { GenericConfirmComponent } from '@app/shared';
import { EntscheidSanktionDTO } from '@dtos/entscheidSanktionDTO';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { PermissionContextService } from '@shared/services/permission.context.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-sanktion-entscheid',
    templateUrl: './sanktion-entscheid.component.html',
    styleUrls: ['./sanktion-entscheid.component.scss'],
    providers: [PermissionContextService]
})
export class SanktionEntscheidComponent extends AbstractBaseForm implements OnInit, AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('routerOutletComponent') routerOutletComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('freigabeDurch') public freigabeDurchAutosuggest: AvamPersonalberaterAutosuggestComponent;
    public permissions: typeof Permissions = Permissions;
    public previousUrl: string;

    public readonly TOOLBOX_ID = 'entscheid-component';
    public readonly TOOLBOX_ACTIONS_ERFASSEN = [ToolboxActionEnum.EMAIL, ToolboxActionEnum.PRINT, ToolboxActionEnum.HELP];
    public readonly TOOLBOX_ACTIONS_BEARBEITEN = [ToolboxActionEnum.HISTORY, ToolboxActionEnum.DMS, ToolboxActionEnum.COPY, ToolboxActionEnum.WORD, ToolboxActionEnum.HISTORY];

    public readonly entscheidChannel: string = 'entscheidChannel';

    public sanktionSachverhaltDTO: SanktionSachverhaltDTO;
    public sanktionEntscheidDTO: EntscheidSanktionDTO;

    public sanktionSachverhaltType: string;
    public isBearbeiten = false;
    public entscheidId: string;
    public sachverhaltId: string;
    public stesId: string;

    public formDisabled: boolean;
    public notizenFormControl: FormControl;
    public entscheidForm: FormGroup;
    public benutzerstelleSuchenTokens: any = {};
    public benutzerSuchenTokensfreigabeDurch: {};
    public statusOptions: any[] = [];
    public statusOptionsBackup: any[] = [];
    public sachverhaltTypen: CodeDTO[];

    BSP14 = false;
    BSP15 = false;
    BSP16 = false;
    BSP17 = false;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    private entscheidFormChannel = 'entscheidFormChannel';
    private unsubscribe$ = new Subject();
    private regExpSanktionEntscheidBearbeiten = '^(/stes/details/[0-9]{1,10}/sanktionen/(([a-z]+)|([a-z]+-weisungen)))(-entscheid-bearbeiten)';
    constructor(
        modalService: NgbModal,
        messageBus: MessageBus,
        spinnerService: SpinnerService,
        toolboxService: ToolboxService,
        fehlermeldungenService: FehlermeldungenService,
        private authenticationService: AuthenticationService,
        private navigationService: NavigationService,
        private translateService: TranslateService,
        private activatedRoute: ActivatedRoute,
        private statusCodeService: StatusCodeService,
        private previousRouteService: PreviousRouteService,
        private resetDialogService: ResetDialogService,
        private readonly notificationService: NotificationService,
        private fb: FormBuilder,
        private router: Router,
        private facade: FacadeService,
        private dataService: StesDataRestService,
        private infobarService: AvamStesInfoBarService,
        private interactionService: StesComponentInteractionService,
        private permissionContextService: PermissionContextService
    ) {
        super('sanktion-stellungnahmeForm', modalService, spinnerService, messageBus, toolboxService, fehlermeldungenService);
        this.previousUrl = this.previousRouteService.getPreviousUrl();
        ToolboxService.CHANNEL = this.entscheidChannel;
    }

    public ngOnInit() {
        this.getRouteParams();
        this.configureToolbox();
        this.createForm();
        this.getData();
        this.setSubscriptions();
    }

    public ngAfterViewInit(): void {
        const einstellungsbeginn = this.entscheidForm.controls['einstellungsbeginn'];
        const einstelltage = this.entscheidForm.controls['einstelltage'];
        einstellungsbeginn.updateValueAndValidity();
        einstelltage.updateValueAndValidity();
    }

    public ngOnDestroy(): void {
        if (!this.isBearbeiten) {
            this.hideSideNav();
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public onOutletActivate(event): void {
        this.routerOutletComponent = event;
        this.routerOutletComponent.isDisabled = true;
        this.routerOutletComponent.isBearbeiten = true;
    }

    public getData() {
        this.spinnerService.activate(this.entscheidFormChannel);
        const getDataObservable = this.isBearbeiten
            ? this.dataService.getSanktionEntscheidById(this.stesId, this.sachverhaltId, this.entscheidId)
            : this.dataService.getSanktionSachverhaltById(this.stesId, this.sachverhaltId);

        forkJoin(this.dataService.getCode(DomainEnum.ENTSCHEID_STATUS), getDataObservable, this.dataService.getCode(DomainEnum.SACHVERHALTGRUND))
            .pipe(
                takeUntil(this.unsubscribe$),
                finalize(() => {
                    this.setSideNav();
                    this.setInfoleisteInfo();
                })
            )
            .subscribe(
                ([stesStatus, entityData, sachverhaltTypen]) => {
                    if (!!stesStatus) {
                        this.statusOptionsBackup = stesStatus;
                        this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(stesStatus);
                        this.setInitialValueStatusCode();
                    }

                    if (!!entityData && !!entityData.data) {
                        this.sachverhaltTypen = sachverhaltTypen;
                        if (this.isBearbeiten) {
                            this.sanktionEntscheidDTO = entityData.data;
                            this.sanktionSachverhaltDTO = this.sanktionEntscheidDTO.sachverhaltDTO;
                            this.mapToForm(this.sanktionEntscheidDTO);
                            this.defineFreigabeDurchValidation();
                            this.isReadOnlyByStatus();
                            this.setBSPs(entityData.data);
                            this.permissionContextService.getContextPermissions(entityData.data.ownerId);
                        } else {
                            this.sanktionSachverhaltDTO = entityData.data;
                            this.permissionContextService.getContextPermissions(entityData.data.sanktionSachverhalt.benutzerstelleID);
                        }
                        this.routerOutletComponent.sachverhaltDTO = this.sanktionSachverhaltDTO;
                    }
                    this.sanktionSachverhaltType = this.facade.formUtilsService.getCodeByCodeId(
                        this.sachverhaltTypen,
                        this.sanktionSachverhaltDTO.sanktionSachverhalt.sachverhaltTypID.toString()
                    );
                    if (!!stesStatus && !!entityData && !!entityData.data && this.isBearbeiten) {
                        this.statusOptions = this.updateStatusOptions(entityData.data);
                    }
                    this.getCurrentUserAndToken();
                    this.spinnerService.deactivate(this.entscheidFormChannel);
                },
                () => {
                    this.spinnerService.deactivate(this.entscheidFormChannel);
                }
            );
    }

    public configureToolbox(): void {
        const bearbeitenEntscheidActions = this.isBearbeiten ? this.TOOLBOX_ACTIONS_BEARBEITEN : [];
        const toolboxEntscheidConfig = [...this.TOOLBOX_ACTIONS_ERFASSEN, ...bearbeitenEntscheidActions].map(action => new ToolboxConfiguration(action, true, true));
        this.toolboxService.sendConfiguration(
            toolboxEntscheidConfig,
            this.TOOLBOX_ID,
            ToolboxDataHelper.createForSanktionEntscheid(this.entscheidId, +this.stesId, +this.sachverhaltId)
        );
        this.messageBus.buildAndSend('toolbox.help.formNumber', this.activatedRoute.snapshot.firstChild.data.formNumber);
        this.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: this.activatedRoute.snapshot.firstChild.data.formNumber });
    }

    public canDeactivate(): boolean {
        return this.entscheidForm.dirty || this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.get('notizen').dirty;
    }

    public cancel(): void {
        this.fehlermeldungenService.closeMessage();
        !this.previousUrl || this.previousUrl.includes('erfassen') || this.previousUrl.includes('-bearbeiten')
            ? this.navigateToSachverhaltBearbeiten()
            : this.router.navigate([`stes/details/${this.stesId}/${StesSanktionen.SANKTIONEN}`]);
        if (this.canDeactivate()) {
            this.checkConfirmationToCancel();
        } else {
            this.hideSideNav();
        }
    }

    public reset(): void {
        if (this.entscheidForm.dirty || this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.get('notizen').dirty) {
            this.fehlermeldungenService.closeMessage();
            this.resetDialogService.reset(() => {
                if (this.isBearbeiten) {
                    this.mapToForm(this.sanktionEntscheidDTO);
                } else {
                    this.entscheidForm.reset();
                    this.freigabeDurchAutosuggest.benutzer = undefined;
                    this.freigabeDurchAutosuggest.benutzerDetail = undefined;
                    this.setInitialValueAlkTransferDate();
                    this.setInitialValueStatusCode();
                }
                this.entscheidForm.markAsPristine();
                this.entscheidForm.markAsUntouched();

                const notizen = this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.get('notizen');
                if (notizen.dirty) {
                    notizen.setValue(this.sanktionSachverhaltDTO.sanktionSachverhalt.notizen);
                    notizen.markAsPristine();
                    notizen.markAsUntouched();
                }
            });
        }
    }

    public save(): void {
        this.instantiateNotizen();
        this.fehlermeldungenService.closeMessage();
        if (this.entscheidForm.valid || this.entscheidForm.disabled) {
            this.saveDataIntoBackend();
        } else {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    public isVermittlung(): boolean {
        return this.sanktionSachverhaltType === SanktionSachverhaltType.SACHVERHALT_VMT;
    }

    public isReadOnlyByStatus(): void {
        if (this.sanktionEntscheidDTO) {
            const statusCode = this.sanktionEntscheidDTO.entscheidStatusObject.code;
            if (statusCode === StatusEnum.STATUS_FREIGABEBEREIT || statusCode === StatusEnum.STATUS_FREIGEGEBEN || statusCode === StatusEnum.STATUS_ERSETZT) {
                this.entscheidForm.disable();
                this.formDisabled = true;
            } else {
                this.entscheidForm.enable();
                this.formDisabled = false;
            }
        }
        this.entscheidForm.updateValueAndValidity();
    }

    public callRestService(serviceName: string): void {
        this.fehlermeldungenService.closeMessage();
        const sanktionEntscheidDto: EntscheidSanktionDTO = this.mapToDTO();
        this.spinnerService.activate(this.entscheidFormChannel);
        this.dataService[serviceName](this.stesId, this.sachverhaltId, sanktionEntscheidDto)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                response => {
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.entscheidFormChannel);
                    if (serviceName === 'deleteSanktionEntscheid') {
                        this.notificationService.success('common.message.datengeloescht');
                        this.router.navigate([`stes/details/${this.stesId}/${this.getRouteToSachverhaltBearbeiten()}`], {
                            queryParams: { sachverhaltId: this.sachverhaltId }
                        });
                        this.hideSideNav();
                    } else if (serviceName === 'ersetzenSanktionEntscheid') {
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        this.router.navigateByUrl(`stes/details/${this.stesId}/${this.getTreeRoute(true)}`, { skipLocationChange: true }).then(() => {
                            this.router.navigate([`stes/details/${this.stesId}/${this.getTreeRoute(true)}/`], {
                                queryParams: { sachverhaltId: this.sachverhaltId, entscheidId: response.data.entscheidSanktionId }
                            });
                            this.entscheidId = response.data.entscheidSanktionId;
                            this.getData();
                            this.sanktionEntscheidDTO = response.data;
                            this.defineFreigabeDurchValidation();
                            this.isReadOnlyByStatus();
                            this.statusOptions = this.updateStatusOptions(response.data);
                            this.markAsPristineForm();
                            this.setBSPs(response.data);
                        });
                    } else if (response.data) {
                        this.mapToForm(response.data);
                        this.sanktionEntscheidDTO = response.data;
                        this.defineFreigabeDurchValidation();
                        this.isReadOnlyByStatus();
                        this.statusOptions = this.updateStatusOptions(response.data);
                        this.markAsPristineForm();
                        this.setBSPs(response.data);
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    }
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.entscheidFormChannel);
                }
            );
    }

    public deleteWithConfirm() {
        this.openDeleteConfirmation(GenericConfirmComponent);
    }

    private openDeleteConfirmation(content) {
        const modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.callRestService('deleteSanktionEntscheid');
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    private instantiateNotizen(): void {
        if (!this.notizenFormControl) {
            this.notizenFormControl = this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.get('notizen');
        }
    }

    private saveDataIntoBackend(): void {
        this.spinnerService.activate(this.entscheidFormChannel);
        if (this.entscheidForm.dirty && this.notizenFormControl.dirty) {
            this.getNotizenObservable()
                .pipe(concatMap(() => this.getEntscheidObservable()))
                .subscribe(
                    response => {
                        this.updateFormFromResponseAndHandleSuccess(response);
                    },
                    () => this.handleErrorResponse()
                );
        } else if (this.entscheidForm.dirty) {
            this.getEntscheidObservable().subscribe(
                response => {
                    this.updateFormFromResponseAndHandleSuccess(response);
                },
                () => this.handleErrorResponse()
            );
        } else if (this.notizenFormControl.dirty) {
            this.getNotizenObservable().subscribe(response => this.handleSuccessResponse(response), () => this.handleErrorResponse());
        } else {
            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            this.spinnerService.deactivate(this.entscheidFormChannel);
        }
    }

    private updateFormFromResponseAndHandleSuccess(response) {
        if (response.data) {
            this.mapToForm(response.data);
        }
        this.handleSuccessResponse(response);
    }

    private getEntscheidObservable(): Observable<any> {
        const stesSanktionEntscheidDTO = this.mapToDTO();
        const responseObservable = !this.isBearbeiten
            ? this.dataService.saveSanktionEntscheid(this.stesId, this.sachverhaltId, stesSanktionEntscheidDTO)
            : this.dataService.updateSanktionEntscheid(this.stesId, this.sachverhaltId, stesSanktionEntscheidDTO);
        responseObservable.pipe(take(1));
        return responseObservable;
    }

    private getNotizenObservable(): Observable<any> {
        return this.dataService
            .updateSanktionSachverhalt(this.stesId, {
                ...this.sanktionSachverhaltDTO,
                sanktionSachverhalt: { ...this.sanktionSachverhaltDTO.sanktionSachverhalt, notizen: this.notizenFormControl.value }
            })
            .pipe(take(1));
    }

    private setInfoleisteInfo(): void {
        this.infobarService.sendDataToInfobar({ title: this.getInfoleisteTranslation() });

        if (this.isBearbeiten) {
            this.infobarService.sendLastUpdate(this.sanktionEntscheidDTO);
        } else {
            this.infobarService.sendLastUpdate({}, true);
        }
    }

    private getInfoleisteTranslation(): string {
        moment.locale(this.translateService.currentLang);
        let baseRoute = `stes.subnavmenuitem.sanktionen.${this.isBearbeiten ? 'entscheidbearbeiten' : 'entscheiderfassen'}.infoleiste.{{type}}`;
        let firstEntscheidVarEl = '';
        let secondEntscheidVarEl = '';

        switch (this.sanktionSachverhaltType) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                firstEntscheidVarEl = this.facade.formUtilsService.formatDateNgx(
                    (this.sanktionSachverhaltDTO as SanktionSachverhaltAbmDTO).sanktionSachverhalt.datumKontrollPeriode,
                    FormUtilsService.GUI_MONTH_DATE_FORMAT
                );
                baseRoute = baseRoute.replace('{{type}}', 'ABM');
                break;
            case SanktionSachverhaltType.SACHVERHALT_AMM:
                firstEntscheidVarEl = this.getFirstDynamicInfoleisteElement('datumAnweisung');
                baseRoute = baseRoute.replace('{{type}}', 'AMM');
                break;
            case SanktionSachverhaltType.SACHVERHALT_BRT:
                firstEntscheidVarEl = this.getFirstDynamicInfoleisteElement('terminBeratung');
                baseRoute = baseRoute.replace('{{type}}', 'BRT');
                break;
            case SanktionSachverhaltType.SACHVERHALT_KTM:
                firstEntscheidVarEl = this.getFirstDynamicInfoleisteElement('datumVorfall');
                baseRoute = baseRoute.replace('{{type}}', 'KTM');
                break;
            case SanktionSachverhaltType.SACHVERHALT_VMT:
                firstEntscheidVarEl = this.getFirstDynamicInfoleisteElement('datumZuweisung');
                baseRoute = baseRoute.replace('{{type}}', 'VMT');
                break;
        }

        if (this.isBearbeiten) {
            secondEntscheidVarEl = this.sanktionEntscheidDTO.entscheidNr.toString();
            return this.translateService.instant(baseRoute, { '0': firstEntscheidVarEl, '1': secondEntscheidVarEl });
        } else {
            return this.translateService.instant(baseRoute, { '0': firstEntscheidVarEl });
        }
    }

    private getFirstDynamicInfoleisteElement(propertyName: string): string {
        return this.sanktionSachverhaltDTO[propertyName]
            ? this.facade.formUtilsService.formatDateNgx(this.sanktionSachverhaltDTO[propertyName], FormUtilsService.GUI_DATE_FORMAT)
            : '';
    }

    private createForm(): void {
        this.entscheidForm = this.fb.group({
            einstellungsbeginn: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            einstelltage: [null, [Validators.required, NumberValidator.isPositiveInteger, NumberValidator.val103]],
            sachverhaltlohnausfall: [null, NumberValidator.isPositiveInteger],
            statusCode: [null, Validators.required],
            entscheidNr: [null],
            entscheidDatum: [null],
            alkTransferDate: [null],
            ersetztEntscheidNr: [null],
            freigabeDurch: [null]
        });

        this.entscheidForm
            .get('statusCode')
            .valueChanges.pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => this.defineFreigabeDurchValidation());

        this.setInitialValueAlkTransferDate();
    }

    private setInitialValueAlkTransferDate(languageEvent?: LangChangeEvent): void {
        const translateService = this.translateService.translations[this.translateService.currentLang];
        if (!!translateService) {
            const label = languageEvent ? languageEvent.translations.stes.message.alkTrasferKeineDate : translateService.stes.message.alkTrasferKeineDate;
            this.entscheidForm.controls.alkTransferDate.setValue(label);
        }
    }

    private updateStatusOptions(entscheidDTO: EntscheidSanktionDTO): any[] {
        const filteredEntscheidOptions = this.statusCodeService.filterStatusOptionsByInitialStatus(this.statusOptionsBackup, entscheidDTO.entscheidStatusId);
        return this.facade.formUtilsService.mapDropdownKurztext(filteredEntscheidOptions);
    }

    private setSideNav(): void {
        if (this.entscheidId) {
            this.navigationService.showNavigationTreeRoute(this.getTreeRoute(true), { sachverhaltId: this.sachverhaltId, entscheidId: this.entscheidId });
        } else {
            this.navigationService.showNavigationTreeRoute(this.getTreeRoute(false), { sachverhaltId: this.sachverhaltId });
        }
    }

    private hideSideNav(): void {
        if (this.entscheidId) {
            this.navigationService.hideNavigationTreeRoute(this.getTreeRoute(true), { sachverhaltId: this.sachverhaltId, entscheidId: this.entscheidId });
        } else {
            this.navigationService.hideNavigationTreeRoute(this.getTreeRoute(false), { sachverhaltId: this.sachverhaltId });
        }
    }

    private getCurrentUserAndToken(): void {
        const currentUser = this.authenticationService.getLoggedUser();
        const benutzerstelleId = this.isBearbeiten ? this.sanktionEntscheidDTO.ownerId : currentUser.benutzerstelleId;

        if (currentUser) {
            this.benutzerSuchenTokensfreigabeDurch = {
                berechtigung: Permissions.STES_SANKTION_ENTSCHEID_FREIGEBEN_UEBERARBEITEN,
                benutzerstelleId,
                myBenutzerstelleId: currentUser.benutzerstelleId,
                myVollzugsregionTyp: DomainEnum.STES
            };

            this.benutzerstelleSuchenTokens = {
                benutzerstelleId,
                vollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    private setSubscriptions(): void {
        this.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });

        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.entscheidId, AvamCommonValueObjectsEnum.T_STES_SNK_ENTSCHEID);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });

        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.setInfoleisteInfo();

            if (!this.sanktionEntscheidDTO || !this.sanktionEntscheidDTO.transferAsalDatum) {
                this.setInitialValueAlkTransferDate(event);
            } else {
                const alkTransferDateValue = this.sanktionEntscheidDTO.transferAsal
                    ? this.translateService.instant('stes.message.alkTransferDateUebermittelt', {
                          alkTransfer: this.facade.formUtilsService.formatDateNgx(this.sanktionEntscheidDTO.transferAsalDatum, FormUtilsService.GUI_DATE_FORMAT)
                      })
                    : null;
                this.entscheidForm.controls.alkTransferDate.setValue(alkTransferDateValue);
            }
        });
        this.router.events
            .pipe(
                filter(event => {
                    if (event instanceof NavigationEnd) {
                        const urlWithoutParams = event.url.split('?')[0];
                        const isRegExp = urlWithoutParams.match(this.regExpSanktionEntscheidBearbeiten);
                        if (isRegExp[0] === isRegExp.input) {
                            return true;
                        }
                    }
                    return false;
                }),
                takeUntil(this.unsubscribe$)
            )
            .subscribe(url => {
                this.routerOutletComponent.isBearbeiten = true;
                this.getData();
            });
    }

    private openHistoryModal(objId: string, objType: string): void {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private openDmsCopyModal(): void {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;
        comp.context = DmsMetadatenContext.DMS_CONTEXT_SKN_SACHVERHALT;
        comp.id = this.sachverhaltId;
    }

    private closeComponent(message): void {
        if (
            message.data.label === this.translateService.instant(SanktionLabels.ENTSCHEID_ERFASSEN) ||
            message.data.label === this.translateService.instant(SanktionLabels.ENTSCHEID_BEARBEITEN)
        ) {
            this.cancel();
        }
        this.navigateDependingOnLabel(message.data.label);
    }

    private navigateDependingOnLabel(label) {
        if (label === this.translateService.instant(SanktionLabels.ENTSCHEID_ERFASSEN) || label === this.translateService.instant(SanktionLabels.ENTSCHEID_BEARBEITEN)) {
            if (this.router.url.includes('sanktionen') && this.router.url.includes('entscheid')) {
                !this.previousUrl || this.previousUrl.endsWith('sanktionen')
                    ? this.router.navigate([`stes/details/${this.stesId}/sanktionen`])
                    : this.navigateToSachverhaltBearbeiten();
            }
        }
    }

    private getTreeRoute(isBearbeiten: boolean): string {
        let routeType = '';
        switch (this.sanktionSachverhaltType) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                routeType = StesSanktionen.SANKTION_BEMUEHUNGEN_ENTSCHEID_BEARBEITEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_AMM:
                routeType = StesSanktionen.SANKTION_MASSNAHMEN_ENTSCHEID_BEARBEITEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_BRT:
                routeType = StesSanktionen.SANKTION_BERATUNG_ENTSCHEID_BEARBEITEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_KTM:
                routeType = StesSanktionen.SANKTION_KONTROLL_WEISUNGEN_ENTSCHEID_BEARBEITEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_VMT:
                routeType = StesSanktionen.SANKTION_VERMITTLUNG_ENTSCHEID_BEARBEITEN;
                break;
        }

        if (!isBearbeiten) {
            routeType = routeType.replace('bearbeiten', 'erfassen');
        }
        return StesSanktionen.SANKTIONEN.concat('/', routeType);
    }

    private getRouteToSachverhaltBearbeiten(): string {
        let routeType = '';
        switch (this.sanktionSachverhaltType) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                routeType = StesSanktionen.SANKTION_BEARBEITEN_BEMUEHUNGEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_AMM:
                routeType = StesSanktionen.SANKTION_BEARBEITEN_MASSNAHMEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_BRT:
                routeType = StesSanktionen.SANKTION_BEARBEITEN_BERATUNG;
                break;
            case SanktionSachverhaltType.SACHVERHALT_KTM:
                routeType = StesSanktionen.SANKTION_BEARBEITEN_KONTROLL_WEISUNGEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_VMT:
                routeType = StesSanktionen.SANKTION_BEARBEITEN_VERMITTLUNG;
                break;
        }

        return StesSanktionen.SANKTIONEN.concat('/', routeType);
    }

    private getRouteParams(): void {
        this.activatedRoute.queryParamMap.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params.get('entscheidId')) {
                this.entscheidId = params.get('entscheidId');
                this.isBearbeiten = true;
            }

            if (params.get('sachverhaltId')) {
                this.sachverhaltId = params.get('sachverhaltId');
            }
        });

        this.activatedRoute.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    private handleSuccessResponse(response): void {
        OrColumnLayoutUtils.scrollTop();
        this.spinnerService.deactivate(this.entscheidFormChannel);
        if (!!response.data) {
            if (!this.isBearbeiten) {
                this.router.navigate([`stes/details/${this.stesId}/${this.getTreeRoute(true)}`], {
                    queryParams: { sachverhaltId: this.sachverhaltId, entscheidId: response.data }
                });
            } else {
                if (!!response.data.type) {
                    // ONLY MODIFIED NOTIZEN
                    this.sanktionSachverhaltDTO = response.data;
                    this.setBSPs(this.sanktionEntscheidDTO);
                    this.statusOptions = this.updateStatusOptions(this.sanktionEntscheidDTO);
                } else {
                    this.sanktionEntscheidDTO = response.data;
                    this.sanktionSachverhaltDTO = this.sanktionEntscheidDTO.sachverhaltDTO;
                    if (this.notizenFormControl.dirty) {
                        this.sanktionSachverhaltDTO.sanktionSachverhalt.notizen = this.notizenFormControl.value;
                    }
                    this.setBSPs(response.data);
                    this.statusOptions = this.updateStatusOptions(response.data);
                }

                this.setInfoleisteInfo();
            }

            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            this.markAsPristineForm();
            if (this.isBearbeiten) {
                this.isReadOnlyByStatus();
            }
        }
    }

    private markAsPristineForm(): void {
        this.routerOutletComponent.sachverhaltForm.markAsPristine();
        this.entscheidForm.markAsPristine();
        this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.markAsPristine();
    }

    private handleErrorResponse(): void {
        this.spinnerService.deactivate(this.entscheidFormChannel);
        OrColumnLayoutUtils.scrollTop();
    }

    private mapToDTO(): EntscheidSanktionDTO {
        const controls = this.entscheidForm.controls;
        return {
            entscheidSanktionId: this.entscheidId ? parseInt(this.entscheidId, 10) : null,
            sachverhaltId: parseInt(this.sachverhaltId, 10),
            datumEinstellungsBeginn: controls.einstellungsbeginn.value,
            einstelltage: controls.einstelltage.value,
            lohnausfallZV:
                this.facade.formUtilsService.getCodeByCodeId(this.sachverhaltTypen, this.sanktionSachverhaltDTO.sanktionSachverhalt.sachverhaltTypID.toString()) ===
                SanktionenSachverhaltCodeEnum.SACHVERHALT_VMT
                    ? controls.sachverhaltlohnausfall.value
                    : null,
            entscheidStatusId: controls.statusCode.value,
            entscheidStatusObject: { codeId: controls.statusCode.value, code: '0' },
            ueberprueferBenutzerDetailObject: controls.freigabeDurch['benutzerObject'],
            ...(this.isBearbeiten && { ojbVersion: this.sanktionEntscheidDTO.ojbVersion })
        };
    }

    private mapToForm(dto: EntscheidSanktionDTO): void {
        this.entscheidForm.patchValue({
            einstellungsbeginn: dto.datumEinstellungsBeginn ? new Date(dto.datumEinstellungsBeginn) : null,
            einstelltage: dto.einstelltage,
            sachverhaltlohnausfall: dto.lohnausfallZV,
            statusCode: dto.entscheidStatusId,
            entscheidNr: dto.entscheidNr,
            entscheidDatum: dto.entscheidDatum ? this.facade.formUtilsService.formatDateNgx(dto.entscheidDatum, FormUtilsService.GUI_DATE_FORMAT) : null,
            //BSP18
            alkTransferDate: dto.transferAsal
                ? this.translateService.instant('stes.message.alkTransferDateUebermittelt', {
                      alkTransfer: this.facade.formUtilsService.formatDateNgx(dto.transferAsalDatum, FormUtilsService.GUI_DATE_FORMAT)
                  })
                : null,
            //BSP9
            ersetztEntscheidNr: dto.ersetztEntscheidNr,
            freigabeDurch: dto.ueberprueferBenutzerDetailObject
        });

        if (!dto.transferAsal) {
            this.setInitialValueAlkTransferDate();
        }
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

    private setInitialValueStatusCode(): void {
        this.entscheidForm.controls.statusCode.setValue(this.facade.formUtilsService.getCodeIdByCode(this.statusOptionsBackup, StatusEnum.STATUS_PENDENT));
        this.entscheidForm.controls.statusCode.disable();
    }

    private setBSPs(sanktionEntscheidDTO: EntscheidSanktionDTO): void {
        this.BSP14 =
            sanktionEntscheidDTO.entscheidStatusObject.code === StatusEnum.STATUS_PENDENT || sanktionEntscheidDTO.entscheidStatusObject.code === StatusEnum.STATUS_UEBERARBEITUNG;
        this.BSP15 = sanktionEntscheidDTO.entscheidStatusObject.code === StatusEnum.STATUS_FREIGABEBEREIT;
        this.BSP16 = sanktionEntscheidDTO.entscheidStatusObject.code === StatusEnum.STATUS_FREIGEGEBEN && !sanktionEntscheidDTO.nachEntscheidId;
        this.BSP17 =
            (sanktionEntscheidDTO.entscheidStatusObject.code === StatusEnum.STATUS_ERSETZT || sanktionEntscheidDTO.entscheidStatusObject.code === StatusEnum.STATUS_FREIGEGEBEN) &&
            !!sanktionEntscheidDTO.nachEntscheidId;

        //BSP13
        if (
            sanktionEntscheidDTO.sachverhaltDTO.type === this.facade.formUtilsService.getCodeIdByCode(this.sachverhaltTypen, SanktionSachverhaltType.SACHVERHALT_ABM) &&
            sanktionEntscheidDTO.sachverhaltDTO.stellungnahmeList.some(element => element.begruendungAkzeptiert === true) &&
            sanktionEntscheidDTO.entscheidStatusId.toString() === this.facade.formUtilsService.getCodeIdByCode(this.statusOptionsBackup, StatusEnum.STATUS_FREIGABEBEREIT)
        ) {
            this.fehlermeldungenService.showMessage('stes.warning.akzeptiereStellungnahme', 'warning');
        }
    }

    private navigateToSachverhaltBearbeiten(): void {
        let bearbeitenRoute = '';
        switch (this.sanktionSachverhaltType) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                bearbeitenRoute = StesSanktionen.SANKTION_BEARBEITEN_BEMUEHUNGEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_AMM:
                bearbeitenRoute = StesSanktionen.SANKTION_BEARBEITEN_MASSNAHMEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_BRT:
                bearbeitenRoute = StesSanktionen.SANKTION_BEARBEITEN_BERATUNG;
                break;
            case SanktionSachverhaltType.SACHVERHALT_KTM:
                bearbeitenRoute = StesSanktionen.SANKTION_BEARBEITEN_KONTROLL_WEISUNGEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_VMT:
                bearbeitenRoute = StesSanktionen.SANKTION_BEARBEITEN_VERMITTLUNG;
                break;
        }
        this.router.navigate([`stes/details/${this.stesId}/${StesSanktionen.SANKTIONEN}/${bearbeitenRoute}`], { queryParams: { sachverhaltId: this.sachverhaltId } });
    }

    private getSanktionType() {
        let type;
        switch (this.routerOutletComponent.sachverhaltTypeId) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                type = 'BEMUEHUNGEN';
                break;
            case SanktionSachverhaltType.SACHVERHALT_AMM:
                type = 'MASSNAHMEN';
                break;
            case SanktionSachverhaltType.SACHVERHALT_BRT:
                type = 'BERATUNG';
                break;
            case SanktionSachverhaltType.SACHVERHALT_KTM:
                type = 'KONTROLL_WEISUNGEN';
                break;
            case SanktionSachverhaltType.SACHVERHALT_VMT:
                type = 'VERMITTLUNG';
                break;
        }
        return type;
    }

    private checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideSideNav();
            }
        });
    }
}
