import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '@shared/services/navigation-service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MessageBus } from '@shared/services/message-bus';
import { FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { SanktionLabels } from '@shared/enums/stes-routing-labels.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { DateValidator } from '@shared/validators/date-validator';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { getStatusOptions, mapStellungnahmeDtoToForm, parseStatusToBegruendungAkzeptiert, Status } from '@stes/pages/sanktionen/stellungnahme/stellungnahme-form.util';
import { concatMap, filter, finalize, first, take, takeUntil } from 'rxjs/operators';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { SanktionSachverhaltDTO } from '@shared/models/dtos-generated/sanktionSachverhaltDTO';
import { SanktionenSachverhaltCodeEnum as SanktionSachverhaltType } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';
import { SanktionSachverhaltAbmDTO } from '@shared/models/dtos-generated/sanktionSachverhaltAbmDTO';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import PrintHelper from '@shared/helpers/print.helper';
import * as moment from 'moment';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';

import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { CodeDTO } from '@dtos/codeDTO';
import { StellungnahmeSanktionDTO } from '@dtos/stellungnahmeSanktionDTO';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { PermissionContextService } from '@shared/services/permission.context.service';

@Component({
    selector: 'avam-sanktion-stellungnahme',
    templateUrl: './sanktion-stellungnahme.component.html',
    styleUrls: ['./sanktion-stellungnahme.component.scss'],
    providers: [PermissionContextService]
})
export class SanktionStellungnahmeComponent extends AbstractBaseForm implements OnInit, AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('routerOutletComponent') routerOutletComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    public permissions: typeof Permissions = Permissions;
    public previousUrl: string;

    public readonly TOOLBOX_ID = 'stellungnahme-component';
    public readonly TOOLBOX_ACTIONS_ERFASSEN = [ToolboxActionEnum.EMAIL, ToolboxActionEnum.PRINT, ToolboxActionEnum.HELP];
    public readonly TOOLBOX_ACTIONS_BEARBEITEN = [ToolboxActionEnum.HISTORY, ToolboxActionEnum.DMS, ToolboxActionEnum.COPY, ToolboxActionEnum.WORD];

    public readonly stellungnahmeChannel: string = 'stellungnahmeChannel';
    public sanktionStellungnahmeDTO: StellungnahmeSanktionDTO;
    public sanktionSachverhaltDTO: SanktionSachverhaltDTO;
    public sanktionSachverhaltType: string;
    public isBearbeiten = false;
    public stellungnahmeId: string;
    public sachverhaltId: string;
    public stesId: string;

    public notizenFormControl: FormControl;
    public stellungnahmeForm: FormGroup;
    public statusOptions: any[] = [];
    public sachverhaltTypen: CodeDTO[];

    private unsubscribe$ = new Subject();
    private bspCompliant = true;
    private regExpSanktionStellungnahmeBearbeiten = '^(/stes/details/[0-9]{1,10}/sanktionen/(([a-z]+)|([a-z]+-weisungen)))(-stellungnahme-bearbeiten)';

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
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private readonly notificationService: NotificationService,
        private dataService: StesDataRestService,
        private interactionService: StesComponentInteractionService,
        private permissionContextService: PermissionContextService
    ) {
        super('sanktion-stellungnahmeForm', modalService, spinnerService, messageBus, toolboxService, fehlermeldungenService);
        this.previousUrl = this.previousRouteService.getPreviousUrl();
        ToolboxService.CHANNEL = this.stellungnahmeChannel;
    }

    public ngOnInit(): void {
        this.getRouteParams();
        this.configureToolbox();
        this.getData();
        this.createForm();
        this.setSubscriptions();
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

    public onOutletActivate(event): void {
        this.routerOutletComponent = event;
        this.routerOutletComponent.isDisabled = true;
        this.routerOutletComponent.isBearbeiten = true;
    }

    public configureToolbox(): void {
        const bearbeitenActions = this.isBearbeiten ? this.TOOLBOX_ACTIONS_BEARBEITEN : [];
        const toolboxConfig = [...this.TOOLBOX_ACTIONS_ERFASSEN, ...bearbeitenActions].map(action => new ToolboxConfiguration(action, true, true));
        this.toolboxService.sendConfiguration(
            toolboxConfig,
            this.TOOLBOX_ID,
            ToolboxDataHelper.createForSanktionStellungnahme(this.stellungnahmeId, +this.stesId, +this.sachverhaltId)
        );
        this.messageBus.buildAndSend('toolbox.help.formNumber', this.activatedRoute.snapshot.firstChild.data.formNumber);
        this.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: this.activatedRoute.snapshot.firstChild.data.formNumber });
    }

    public getData() {
        this.spinnerService.activate(this.stellungnahmeChannel);
        const getDataObservable = this.isBearbeiten
            ? this.dataService.getSanktionStellungnahmeById(this.stesId, this.sachverhaltId, this.stellungnahmeId)
            : this.dataService.getSanktionSachverhaltById(this.stesId, this.sachverhaltId);

        getDataObservable
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.spinnerService.deactivate(this.stellungnahmeChannel);
                })
            )
            .subscribe((response: { data: any }) => {
                if (this.isBearbeiten) {
                    this.sanktionStellungnahmeDTO = response.data;
                    this.sanktionSachverhaltDTO = this.sanktionStellungnahmeDTO.sachverhaltDTO;
                    this.mapToForm(this.sanktionStellungnahmeDTO);
                    this.permissionContextService.getContextPermissions(response.data.ownerId);
                } else {
                    this.sanktionSachverhaltDTO = response.data;
                    this.permissionContextService.getContextPermissions(response.data.sanktionSachverhalt.benutzerstelleID);
                }

                this.setSachverhaltType();
                this.routerOutletComponent.sachverhaltDTO = this.sanktionSachverhaltDTO;
            });
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

    public canDeactivate(): boolean {
        return this.stellungnahmeForm.dirty || this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.get('notizen').dirty;
    }

    public reset(): void {
        if (this.stellungnahmeForm.dirty || this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.get('notizen').dirty) {
            this.resetDialogService.reset(() => {
                if (this.isBearbeiten) {
                    this.mapToForm(this.sanktionStellungnahmeDTO);
                } else {
                    this.stellungnahmeForm.reset();
                    this.setStatusToAusstehend();
                }
                this.stellungnahmeForm.markAsPristine();
                this.stellungnahmeForm.markAsUntouched();

                const notizen = this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.get('notizen');
                if (notizen.dirty) {
                    notizen.setValue(this.sanktionSachverhaltDTO.sanktionSachverhalt.notizen);
                    notizen.markAsPristine();
                    notizen.markAsUntouched();
                }
            });
        }
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
            .deleteSanktionStellungnahme(this.stesId, this.sachverhaltId, this.stellungnahmeId)
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

    public save(): void {
        if (this.bspCompliant) {
            this.instantiateNotizen();
            this.fehlermeldungenService.closeMessage();
            if (this.stellungnahmeForm.valid) {
                this.saveDataIntoBackend();
            } else {
                this.ngForm.onSubmit(undefined);
                this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
                OrColumnLayoutUtils.scrollTop();
            }
        } else {
            this.setDangerMessages();
        }
    }

    public openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private instantiateNotizen(): void {
        if (!this.notizenFormControl) {
            this.notizenFormControl = this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.get('notizen');
        }
    }

    private saveDataIntoBackend(): void {
        this.spinnerService.activate();
        if (this.stellungnahmeForm.dirty && this.notizenFormControl.dirty) {
            this.getNotizenObservable()
                .pipe(concatMap(() => this.getStellungnahmeObservable()))
                .subscribe(response => this.handleSuccessResponse(response), () => this.handleErrorResponse());
        } else if (this.stellungnahmeForm.dirty) {
            this.getStellungnahmeObservable().subscribe(response => this.handleSuccessResponse(response), () => this.handleErrorResponse());
        } else if (this.notizenFormControl.dirty) {
            this.getNotizenObservable().subscribe(response => this.handleSuccessResponse(response), () => this.handleErrorResponse());
        } else {
            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            this.spinnerService.deactivate();
        }
    }

    private getStellungnahmeObservable(): Observable<any> {
        const stesSanktionStellungnahmeDTO = this.mapToDTO();
        const responseObservable = !this.isBearbeiten
            ? this.dataService.saveSanktionStellungnahme(this.stesId, this.sachverhaltId, stesSanktionStellungnahmeDTO)
            : this.dataService.updateSanktionStellungnahme(this.stesId, this.sachverhaltId, stesSanktionStellungnahmeDTO);
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

    private navigateToSachverhaltBearbeiten(): void {
        let bearbeitenRoute = '';
        switch (this.sanktionSachverhaltType) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                bearbeitenRoute = `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_BEARBEITEN_BEMUEHUNGEN}`;
                break;
            case SanktionSachverhaltType.SACHVERHALT_AMM:
                bearbeitenRoute = `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_BEARBEITEN_MASSNAHMEN}`;
                break;
            case SanktionSachverhaltType.SACHVERHALT_BRT:
                bearbeitenRoute = `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_BEARBEITEN_BERATUNG}`;
                break;
            case SanktionSachverhaltType.SACHVERHALT_KTM:
                bearbeitenRoute = `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_BEARBEITEN_KONTROLL_WEISUNGEN}`;
                break;
            case SanktionSachverhaltType.SACHVERHALT_VMT:
                bearbeitenRoute = `${StesSanktionen.SANKTIONEN}/${StesSanktionen.SANKTION_BEARBEITEN_VERMITTLUNG}`;
                break;
        }
        this.router.navigate([`stes/details/${this.stesId}/${bearbeitenRoute}`], { queryParams: { sachverhaltId: this.sachverhaltId } });
    }

    private getRouteParams(): void {
        this.activatedRoute.queryParamMap.subscribe(params => {
            if (params.get('stellungnahmeId')) {
                this.stellungnahmeId = params.get('stellungnahmeId');
                this.isBearbeiten = true;
            }

            if (params.get('sachverhaltId')) {
                this.sachverhaltId = params.get('sachverhaltId');
            }
        });

        this.activatedRoute.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    private setInfoleisteInfo(): void {
        this.infobarService.sendDataToInfobar({ title: this.getInfoleisteTranslation() });

        if (this.isBearbeiten) {
            this.infobarService.sendLastUpdate(this.sanktionStellungnahmeDTO);
        } else {
            this.infobarService.sendLastUpdate({}, true);
        }
    }

    private getInfoleisteTranslation(): string {
        moment.locale(this.translateService.currentLang);
        let baseRoute = `stes.subnavmenuitem.sanktionen.${this.isBearbeiten ? 'stellungnahmebearbeiten' : 'stellungnahmeerfassen'}.infoleiste.{{type}}`;
        let firstVarEl = '';
        let secondVarEl = '';

        switch (this.sanktionSachverhaltType) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                firstVarEl = this.formUtils.formatDateNgx(
                    (this.sanktionSachverhaltDTO as SanktionSachverhaltAbmDTO).sanktionSachverhalt.datumKontrollPeriode,
                    FormUtilsService.GUI_MONTH_DATE_FORMAT
                );
                baseRoute = baseRoute.replace('{{type}}', 'ABM');
                break;
            case SanktionSachverhaltType.SACHVERHALT_AMM:
                firstVarEl = this.getFirstDynamicInfoleisteElement('datumAnweisung');
                baseRoute = baseRoute.replace('{{type}}', 'AMM');
                break;
            case SanktionSachverhaltType.SACHVERHALT_BRT:
                firstVarEl = this.getFirstDynamicInfoleisteElement('terminBeratung');
                baseRoute = baseRoute.replace('{{type}}', 'BRT');
                break;
            case SanktionSachverhaltType.SACHVERHALT_KTM:
                firstVarEl = this.getFirstDynamicInfoleisteElement('datumVorfall');
                baseRoute = baseRoute.replace('{{type}}', 'KTM');
                break;
            case SanktionSachverhaltType.SACHVERHALT_VMT:
                firstVarEl = this.getFirstDynamicInfoleisteElement('datumZuweisung');
                baseRoute = baseRoute.replace('{{type}}', 'VMT');
                break;
        }

        if (this.isBearbeiten) {
            secondVarEl = this.formUtils.formatDateNgx(this.sanktionStellungnahmeDTO.stellungnahmeBis, FormUtilsService.GUI_DATE_FORMAT);
            return this.translateService.instant(baseRoute, { '0': firstVarEl, '1': secondVarEl });
        } else {
            return this.translateService.instant(baseRoute, { '0': firstVarEl });
        }
    }

    private getFirstDynamicInfoleisteElement(propertyName: string): string {
        return this.sanktionSachverhaltDTO[propertyName] ? this.formUtils.formatDateNgx(this.sanktionSachverhaltDTO[propertyName], FormUtilsService.GUI_DATE_FORMAT) : '';
    }

    private setSideNav(): void {
        if (this.stellungnahmeId) {
            this.navigationService.showNavigationTreeRoute(this.getTreeRoute(true), { sachverhaltId: this.sachverhaltId, stellungnahmeId: this.stellungnahmeId });
        } else {
            this.navigationService.showNavigationTreeRoute(this.getTreeRoute(false), { sachverhaltId: this.sachverhaltId });
        }
    }

    private hideSideNav(): void {
        if (this.stellungnahmeId) {
            this.navigationService.hideNavigationTreeRoute(this.getTreeRoute(true), { sachverhaltId: this.sachverhaltId, stellungnahmeId: this.stellungnahmeId });
        } else {
            this.navigationService.hideNavigationTreeRoute(this.getTreeRoute(false), { sachverhaltId: this.sachverhaltId });
        }
    }

    private getTreeRoute(isBearbeiten: boolean): string {
        let routeType = '';
        switch (this.sanktionSachverhaltType) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                routeType = StesSanktionen.SANKTION_BEMUEHUNGEN_STELLUNGNAHME_BEARBEITEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_AMM:
                routeType = StesSanktionen.SANKTION_MASSNAHMEN_STELLUNGNAHME_BEARBEITEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_BRT:
                routeType = StesSanktionen.SANKTION_BERATUNG_STELLUNGNAHME_BEARBEITEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_KTM:
                routeType = StesSanktionen.SANKTION_KONTROLL_WEISUNGEN_STELLUNGNAHME_BEARBEITEN;
                break;
            case SanktionSachverhaltType.SACHVERHALT_VMT:
                routeType = StesSanktionen.SANKTION_VERMITTLUNG_STELLUNGNAHME_BEARBEITEN;
                break;
        }

        if (!isBearbeiten) {
            routeType = routeType.replace('bearbeiten', 'erfassen');
        }

        return StesSanktionen.SANKTIONEN.concat('/', routeType);
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

        this.configureDropdownOptions();
        this.setStatusToAusstehend();
    }

    private setStatusToAusstehend(): void {
        this.stellungnahmeForm.get('statusCode').setValue(this.statusOptions.find((value, index) => index === 0).value);
    }

    private configureDropdownOptions(): void {
        this.statusOptions = getStatusOptions(this.translateService);
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.statusOptions = getStatusOptions(this.translateService);
        });
    }

    private setDangerMessages(): void {
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
                    this.openHistoryModal(this.stellungnahmeId, AvamCommonValueObjectsEnum.T_STES_SNK_STELLUNGNAHME);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });

        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.setInfoleisteInfo();
        });
        this.router.events
            .pipe(
                filter(event => {
                    if (event instanceof NavigationEnd) {
                        const urlWithoutParams = event.url.split('?')[0];
                        const isRegExp = urlWithoutParams.match(this.regExpSanktionStellungnahmeBearbeiten);
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

    private setSachverhaltType() {
        this.dataService
            .getCode('SachverhaltGrund')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(data => {
                this.sachverhaltTypen = data;
                this.sanktionSachverhaltType = this.formUtils.getCodeByCodeId(this.sachverhaltTypen, this.sanktionSachverhaltDTO.sanktionSachverhalt.sachverhaltTypID.toString());
                this.setInfoleisteInfo();
                this.setSideNav();
            });
    }

    private openDmsCopyModal(): void {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;
        comp.context = DmsMetadatenContext.DMS_CONTEXT_SKN_SACHVERHALT;
        comp.id = this.sachverhaltId;
    }

    private closeComponent(message): void {
        this.navigateDependingOnLabel(message.data.label);
        this.hideSideNav();
    }

    private navigateDependingOnLabel(label) {
        if (label === this.translateService.instant(SanktionLabels.STELLUNGNAHME_ERFASSEN) || label === this.translateService.instant(SanktionLabels.STELLUNGNAHME_BEARBEITEN)) {
            if (this.router.url.includes('sanktionen') && this.router.url.includes('stellungnahme')) {
                !this.previousUrl || this.previousUrl.endsWith('sanktionen')
                    ? this.router.navigate([`stes/details/${this.stesId}/sanktionen`])
                    : this.navigateToSachverhaltBearbeiten();
            }
        }
    }

    private handleSuccessResponse(response): void {
        OrColumnLayoutUtils.scrollTop();
        this.spinnerService.deactivate();
        if (!!response.data) {
            if (!this.isBearbeiten) {
                this.router.navigate([`stes/details/${this.stesId}/${this.getTreeRoute(true)}`], {
                    queryParams: { sachverhaltId: this.sachverhaltId, stellungnahmeId: response.data }
                });
            } else {
                if (!!response.data.type) {
                    // ONLY MODIFIED NOTIZEN
                    this.sanktionSachverhaltDTO = response.data;
                } else {
                    this.sanktionStellungnahmeDTO = response.data;
                    this.sanktionSachverhaltDTO = this.sanktionStellungnahmeDTO.sachverhaltDTO;
                    if (this.notizenFormControl.dirty) {
                        this.sanktionSachverhaltDTO.sanktionSachverhalt.notizen = this.notizenFormControl.value;
                    }
                }

                this.setInfoleisteInfo();
            }

            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.markAsPristine();
            this.stellungnahmeForm.markAsPristine();
        }
    }

    private handleErrorResponse(): void {
        this.spinnerService.deactivate();
        OrColumnLayoutUtils.scrollTop();
    }

    private mapToDTO(): StellungnahmeSanktionDTO {
        const control = this.stellungnahmeForm.controls;
        return {
            stellungnahmeId: parseInt(this.stellungnahmeId, 10),
            sachverhaltId: parseInt(this.sachverhaltId, 10),
            eingangsDatum: control.eingangsdatum.value,
            begruendungAkzeptiert: parseStatusToBegruendungAkzeptiert(+control.statusCode.value),
            stellungnahmeBis: control.stellungnahmeBis.value,
            ...(this.isBearbeiten && { ojbVersion: this.sanktionStellungnahmeDTO.ojbVersion })
        };
    }

    private mapToForm(dto: StellungnahmeSanktionDTO): void {
        this.stellungnahmeForm.patchValue(mapStellungnahmeDtoToForm(dto));
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
