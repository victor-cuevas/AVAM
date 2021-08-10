import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '@shared/services/navigation-service';
import { concatMap, first, take, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, Subject } from 'rxjs';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { StesKontrollperioden } from '@shared/enums/stes-navigation-paths.enum';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageBus } from '@shared/services/message-bus';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DateValidator } from '@shared/validators/date-validator';
import { ArbeitsbemuehungenDTO } from '@dtos/arbeitsbemuehungenDTO';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { Permissions } from '@shared/enums/permissions.enum';
import * as moment from 'moment';
import { ArbeitsbemuehunStatusCodeEnum } from '@shared/enums/domain-code/arbeitsbemuehun-status-code.enum';
import { BeurteilungAbmCodeEnum } from '@shared/enums/domain-code/beurteilung-abm-code.enum';
import { AbmBefreiungDTO } from '@dtos/abmBefreiungDTO';
import { AuthenticationService } from '@core/services/authentication.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { NumberValidator } from '@shared/validators/number-validator';

import { BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages } from '@dtos/baseResponseWrapperArbeitsbemuehungenDTOWarningMessages';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AvamComponentsTableComponent } from '@app/library/wrappers/form/avam-components-table/avam-components-table.component';
import { sort } from '@app/library/wrappers/form/avam-components-table/avam-components-table-sorting';
import { Dropdown, ComponentType, Calendar, ColumnInterface } from '@app/library/wrappers/form/avam-components-table/avam-components-table.interface';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { PermissionContextService } from '@shared/services/permission.context.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { FacadeService } from '@shared/services/facade.service';

export enum COLUMN_BASIC {
    Grunde = 'grunde',
    BefreitVon = 'datumBefreitVon',
    BefreitBis = 'datumBefreitBis'
}

@Component({
    selector: 'avam-kontrollperioden-erfassen-bearbeiten',
    templateUrl: './kontrollperioden-erfassen-bearbeiten.component.html',
    styleUrls: ['./kontrollperioden-erfassen-bearbeiten.component.scss']
})
export class KontrollperiodenErfassenBearbeitenComponent extends AbstractBaseForm implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('table') table: AvamComponentsTableComponent;
    public readonly TOOLBOX_ID = 'kontrollperiode-component';
    public readonly TOOLBOX_ACTIONS_ERFASSEN = [ToolboxActionEnum.EMAIL, ToolboxActionEnum.PRINT, ToolboxActionEnum.HELP];
    //TODO: add "Zurueck zur gespeicherten Liste" action
    public readonly TOOLBOX_ACTIONS_BEARBEITEN = [ToolboxActionEnum.HISTORY, ToolboxActionEnum.DMS, ToolboxActionEnum.COPY, ToolboxActionEnum.WORD];
    public previousUrl: string;
    public kontrollperiodeForm: FormGroup;
    public arbeitsbemuehungenForm: FormGroup;
    public status: any[] = [];
    public beurteilung: any[] = [];
    public zeitOptions: any[] = [];
    public stesPermissions: string[] = [];
    public benutzerSuchenTokens: {} = {};
    public personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    public kontrollperiodeDTO: ArbeitsbemuehungenDTO;
    public isBearbeiten = false;
    public grund: any[] = [];
    public dataSource;
    public path;
    public columns: ColumnInterface[];
    private kontrollperiodenChannel = 'kontrollperioden';
    private abmBefreiungList: AbmBefreiungDTO[] = [];
    private kontrollperiodeId: string;
    private stesId: string;
    private unsubscribe$ = new Subject();
    private permissions: typeof Permissions = Permissions;
    private statusResponse: any[];
    private beurteilungResponse: any[];
    private initialKontrollperiodeDTO: ArbeitsbemuehungenDTO;

    constructor(
        modalService: NgbModal,
        messageBus: MessageBus,
        spinnerService: SpinnerService,
        toolboxService: ToolboxService,
        fehlermeldungenService: FehlermeldungenService,
        protected resetDialogService: ResetDialogService,
        private navigationService: NavigationService,
        private activatedRoute: ActivatedRoute,
        private infobarService: AvamStesInfoBarService,
        private dbTranslateService: DbTranslateService,
        private router: Router,
        private translateService: TranslateService,
        private previousRouteService: PreviousRouteService,
        private formBuilder: FormBuilder,
        private dataService: StesDataRestService,
        private readonly notificationService: NotificationService,
        private facade: FacadeService,
        private authenticationService: AuthenticationService,
        private authenticationRestService: AuthenticationRestService,
        private interactionService: StesComponentInteractionService
    ) {
        super('kontrollperioden-erfassen-bearbeiten', modalService, spinnerService, messageBus, toolboxService, fehlermeldungenService);
        this.previousUrl = this.previousRouteService.getPreviousUrl();
        this.setZeitOptions();
    }

    public ngOnInit() {
        this.getRouteParams();
        this.setSideNav();
        this.configureToolbox();
        this.setSubscriptions();
        this.getCurrentUserAndTokens();
        this.getFormData();
        this.generateForm();
        if (this.isBearbeiten) {
            this.getData();
        } else {
            this.authenticationRestService
                .getContextPermissionsWithStesId(+this.stesId)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(response => {
                    if (response) {
                        this.stesPermissions = response;
                    }
                });
            this.getDefaultDataForKontrollperiode();
            this.setInfoleisteInfo();
        }
    }

    public ngOnDestroy() {
        if (!this.isBearbeiten) {
            this.hideSideNav();
        }
        this.infobarService.sendLastUpdate({}, true);
        this.toolboxService.sendConfiguration([]);
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public canDeactivate(): boolean {
        return this.areSomeFormDirty();
    }

    public cancel() {
        this.fehlermeldungenService.closeMessage();
        if (this.router.url.includes(StesKontrollperioden.ERFASSEN) || this.router.url.includes(StesKontrollperioden.BEARBEITEN)) {
            this.navigateToKontrollperioden();
        }
        if (this.canDeactivate()) {
            this.checkConfirmationToCancel();
        } else {
            this.hideSideNav();
        }
    }

    public reset() {
        if (this.areSomeFormDirty()) {
            this.resetDialogService.reset(() => {
                this.mapToForm(this.initialKontrollperiodeDTO);
                this.fehlermeldungenService.closeMessage();
                this.markAllFormAsPristine();
                this.markAllFormAsUntouched();
            });
        }
    }

    public save() {
        this.fehlermeldungenService.closeMessage();
        const areCorrectAllBSPs = this.checkBSPS();
        if (this.areAllFormValid() && areCorrectAllBSPs) {
            const kontrollperiodenDTO = this.mapToDto(true);
            this.spinnerService.activate(this.kontrollperiodenChannel);
            if (this.isBearbeiten) {
                this.updateKontrollperiode(kontrollperiodenDTO);
            } else {
                this.createKontrollperiode(kontrollperiodenDTO);
            }
        } else if (!this.areAllFormValid()) {
            OrColumnLayoutUtils.scrollTop();
            this.ngForm.onSubmit(undefined);
            this.table.triggerValidation();
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    public checkBSPS(): boolean {
        const checkBSP3AndBsp1 = this.checkBSP3ErfasssenOrBSP1Bearbeiten();
        const checkBsp13AndBsp7 = this.controlBSP13ErfassenOrBSP7Bearbeiten();
        const checkBsp14AndBsp8 = this.controlBSP14ErfassenOrBSP8Bearbeiten();
        return checkBSP3AndBsp1 && checkBsp13AndBsp7 && checkBsp14AndBsp8;
    }

    public delete() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.kontrollperiodenChannel);
        this.deleteKontrollperiode();
    }

    public getData(): void {
        this.spinnerService.activate(this.kontrollperiodenChannel);
        const dataSource$: Observable<any> = this.dataService.getKontrollperiodeById(this.stesId, this.kontrollperiodeId).pipe(takeUntil(this.unsubscribe$));
        const grunde$ = this.dataService.getCode(DomainEnum.BEFREIUNGSGRUND_ABM).pipe(takeUntil(this.unsubscribe$));
        forkJoin([dataSource$, grunde$])
            .pipe(
                concatMap(([dataSource, grund]) => {
                    this.grund = grund.map(this.grundeMapper);
                    this.initialKontrollperiodeDTO = dataSource.data;
                    this.handleSuccessGetDataResponse(dataSource);
                    return this.authenticationRestService.getContextPermissionsWithStesId(this.initialKontrollperiodeDTO.stesID).pipe(take(1));
                })
            )
            .subscribe((permissions: string[]) => (this.stesPermissions = permissions));
    }

    public deleteWithConfirm() {
        this.openDeleteConfirmationModal(GenericConfirmComponent);
    }

    public configureToolbox(): void {
        const bearbeitenActions = this.isBearbeiten ? this.TOOLBOX_ACTIONS_BEARBEITEN : [];
        const toolboxConfig = [...this.TOOLBOX_ACTIONS_ERFASSEN, ...bearbeitenActions].map(action => new ToolboxConfiguration(action, true, true));
        this.toolboxService.sendConfiguration(
            toolboxConfig,
            this.TOOLBOX_ID,
            ToolboxDataHelper.createForKontrollperiode(this.kontrollperiodeId, +this.stesId, +this.kontrollperiodeId)
        );
        this.messageBus.buildAndSend('toolbox.help.formNumber', this.activatedRoute.snapshot.data.formNumber);
        this.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: this.activatedRoute.snapshot.data.formNumber });
    }

    public statusChange(value: any) {
        const validators = [DateValidator.dateFormatNgx, DateValidator.dateValidNgx];
        if (typeof value === 'number') {
            value = value.toString();
        }
        if (this.statusResponse && value === this.facade.formUtilsService.getCodeIdByCode(this.statusResponse, ArbeitsbemuehunStatusCodeEnum.ABGESCHLOSSEN)) {
            validators.push(Validators.required);
        }
        this.arbeitsbemuehungenForm.controls.kontrolldatum.setValidators(validators);
        this.arbeitsbemuehungenForm.controls.kontrolldatum.updateValueAndValidity();
    }

    public beurteilungChange(value) {
        this.checkGrundMandatory(value);
    }

    public getDefaultDataForKontrollperiode() {
        if (!this.isBearbeiten) {
            const auxKontrollPeriode = this.kontrollperiodeForm.controls.kontrollperiode.value;

            if (auxKontrollPeriode instanceof Date && !isNaN(auxKontrollPeriode.getTime())) {
                this.spinnerService.activate(this.kontrollperiodenChannel);
                const defaultKontrollperiode = this.dataService.getDefaultDataForKontrollperiode(
                    this.stesId,
                    this.facade.formUtilsService.formatDateNgx(auxKontrollPeriode, 'DD-MM-YYYY')
                );
                const grundeObs = this.dataService.getCode(DomainEnum.BEFREIUNGSGRUND_ABM);
                forkJoin([defaultKontrollperiode, grundeObs])
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe(
                        ([result, grund]) => {
                            this.grund = grund.map(this.grundeMapper);
                            this.setupTable();
                            if (!!result.data) {
                                if (!this.initialKontrollperiodeDTO) {
                                    this.initialKontrollperiodeDTO = result.data;
                                }
                                const AbmDTO = this.kontrollperiodeForm.dirty
                                    ? { ...result.data, ...this.mapToDto(), abmBefreiungList: [...result.data.abmBefreiungList, ...this.mapToDto().abmBefreiungList] }
                                    : result.data;
                                this.mapToForm(AbmDTO);
                                this.kontrollperiodeDTO = result.data;
                            }
                            this.spinnerService.deactivate(this.kontrollperiodenChannel);
                        },
                        () => this.spinnerService.deactivate(this.kontrollperiodenChannel)
                    );
            }
        }
    }

    public onSort(event) {
        moment.locale('en-US');
        event.data = this.table.components.controls.map((formGroup: FormGroup) => {
            return {
                id: formGroup.controls.rowId.value,
                grunde: formGroup.controls.grunde.value,
                datumBefreitVon: formGroup.controls.datumBefreitVon.value,
                datumBefreitBis: formGroup.controls.datumBefreitBis.value
            };
        });

        switch (event.field) {
            case COLUMN_BASIC.Grunde:
                // sort.AvamLabelDropdownComponent(event, this.grund) doesn't work right now therefore custom sort.
                sort.emptyValues(event, event.field);
                event.data.sort((value1, value2) => {
                    if (value1[event.field] !== null && value2[event.field] !== null) {
                        const optionValue1 = this.dbTranslateService.translate(this.grund.find(item => item.value === value1[event.field]), 'label') || '';
                        const optionValue2 = this.dbTranslateService.translate(this.grund.find(item => item.value === value2[event.field]), 'label') || '';
                        if (event.order === 1) {
                            return optionValue1.localeCompare(optionValue2);
                        }

                        if (event.order === -1) {
                            return optionValue2.localeCompare(optionValue1);
                        }
                    }
                });
                break;
            case COLUMN_BASIC.BefreitVon:
                sort.AvamLabelCalendarComponent(event);
                break;
            case COLUMN_BASIC.BefreitBis:
                sort.AvamLabelCalendarComponent(event);
                break;
            default:
                break;
        }
    }

    private setupTable() {
        const grundeColumn: Dropdown = {
            columnDef: COLUMN_BASIC.Grunde,
            header: 'stes.label.grund',
            component: {
                type: ComponentType.dropdown,
                options: this.grund,
                placeholder: 'common.label.waehlen',
                onChange: group => {
                    const validations = [DateValidator.dateFormatNgx, DateValidator.dateValidNgx];
                    if (group.value.grunde) {
                        validations.push(Validators.required);
                    }
                    group.controls.datumBefreitVon.setValidators(validations);
                    group.controls.datumBefreitBis.setValidators(validations);
                    group.controls.datumBefreitVon.updateValueAndValidity();
                    group.controls.datumBefreitBis.updateValueAndValidity();
                }
            }
        };

        const datumBefreitVonColumn: Calendar = {
            columnDef: COLUMN_BASIC.BefreitVon,
            header: 'stes.label.befreitVon',
            component: {
                type: ComponentType.calendar,
                validators: [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]
            }
        };

        const datumBefreitBisColumn: Calendar = {
            columnDef: COLUMN_BASIC.BefreitBis,
            header: 'stes.label.befreitBis',
            component: {
                type: ComponentType.calendar,
                validators: [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]
            }
        };

        const ActionColumn = {
            columnDef: 'actions',
            header: '',
            width: 65,
            cell: (element: any) => {
                return '';
            },
            groupValidators: DateValidator.rangeBetweenDates(COLUMN_BASIC.BefreitVon, COLUMN_BASIC.BefreitBis, 'val201'),
            component: {}
        };
        this.columns = [grundeColumn, datumBefreitVonColumn, datumBefreitBisColumn, ActionColumn];
    }

    private createKontrollperiode(kontrollperiodeDTO: ArbeitsbemuehungenDTO): void {
        this.dataService
            .createKontrollperiode(this.stesId, kontrollperiodeDTO)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({ next: this.handleSuccessPersistResponse.bind(this), error: this.handleErrorResponse.bind(this) });
    }

    private updateKontrollperiode(kontrollperiodenDTO: ArbeitsbemuehungenDTO) {
        this.dataService
            .updateKontrollperiode(this.stesId, kontrollperiodenDTO)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({ next: this.handleSuccessUpdateResponse.bind(this), error: this.handleErrorResponse.bind(this) });
    }

    private deleteKontrollperiode() {
        this.dataService
            .deleteKontrollperiode(this.stesId, this.kontrollperiodeId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({ next: this.handleDeleteSuccessResponse.bind(this), error: this.handleErrorResponse.bind(this) });
    }

    private handleSuccessPersistResponse(response: any) {
        if (!!response.data) {
            this.markAllFormAsPristine();
            this.navigateToBearbeiten(response.data);
            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            this.navigationService.hideNavigationTreeRoute(StesKontrollperioden.ERFASSEN);
        }
        OrColumnLayoutUtils.scrollTop();
        this.spinnerService.deactivate(this.kontrollperiodenChannel);
    }

    private handleSuccessUpdateResponse(response: BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages) {
        if (!!response.data) {
            this.markAllFormAsPristine();
            this.commonRefreshData(response.data);
            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
        }
        OrColumnLayoutUtils.scrollTop();
        this.spinnerService.deactivate(this.kontrollperiodenChannel);
    }

    private handleSuccessGetDataResponse(response: BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages) {
        if (response && response.data) {
            this.commonRefreshData(response.data);
        }
        this.spinnerService.deactivate(this.kontrollperiodenChannel);
    }

    private commonRefreshData(data: ArbeitsbemuehungenDTO) {
        this.kontrollperiodeDTO = data;
        this.setInfoleisteInfo();
        this.setupTable();
        this.mapToForm(data);
    }

    private handleDeleteSuccessResponse() {
        this.hideSideNav();
        OrColumnLayoutUtils.scrollTop();
        this.spinnerService.deactivate(this.kontrollperiodenChannel);
        this.notificationService.success('common.message.datengeloescht');
        this.navigateToKontrollperioden();
    }

    private handleErrorResponse() {
        OrColumnLayoutUtils.scrollTop();
        this.spinnerService.deactivate(this.kontrollperiodenChannel);
    }

    private mapToForm(data: ArbeitsbemuehungenDTO) {
        if (
            new Date(this.kontrollperiodeForm.controls.kontrollperiode.value).getMonth() !== new Date(data.datumKontrollPeriode).getMonth() ||
            new Date(this.kontrollperiodeForm.controls.kontrollperiode.value).getFullYear() !== new Date(data.datumKontrollPeriode).getFullYear()
        ) {
            this.kontrollperiodeForm.controls.kontrollperiode.setValue(data.datumKontrollPeriode ? new Date(data.datumKontrollPeriode) : null);
        }
        this.kontrollperiodeForm.patchValue({
            zeit: data.istSituationVorAL,
            status: data.statusId,
            personalberater: data.personalberaterDetailObject
        });
        this.arbeitsbemuehungenForm.patchValue({
            kontrolldatum: data.datumPruefung ? new Date(data.datumPruefung) : null,
            eingangsdatum: data.datumEingang ? new Date(data.datumEingang) : null,
            scandatum: data.datumScan ? this.facade.formUtilsService.formatDateNgx(data.datumScan, FormUtilsService.GUI_DATE_FORMAT) : null,
            vereinbart: data.sollBewerbungen,
            erbracht: data.istBewerbungen,
            ergaenzendeAngaben: data.weitereAngaben,
            beurteilung: data.beurteilungAbmID
        });
        this.abmBefreiungList = data.abmBefreiungList.length ? data.abmBefreiungList : [];
        this.dataSource = data.abmBefreiungList.length ? data.abmBefreiungList.map((item, index) => this.mapBefreiungToForm(item, index)) : [];
    }

    private mapBefreiungToForm(item: AbmBefreiungDTO, index: number) {
        return {
            id: index,
            grunde: item.befreiungsgrundAbmID,
            datumBefreitVon: new Date(item.datumBefreitVon),
            datumBefreitBis: new Date(item.datumBefreitBis)
        };
    }

    private openDeleteConfirmationModal(content) {
        const modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
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

    private getCurrentUserAndTokens(): void {
        const currentUser = this.authenticationService.getLoggedUser();
        if (currentUser) {
            this.benutzerSuchenTokens = {
                myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    private checkBSP3ErfasssenOrBSP1Bearbeiten(): boolean {
        if (
            +this.arbeitsbemuehungenForm.controls.beurteilung.value ===
                +this.facade.formUtilsService.getCodeIdByCode(this.beurteilungResponse, BeurteilungAbmCodeEnum.BEFREIT.valueOf()) &&
            this.table.data.length === 0
        ) {
            this.fehlermeldungenService.showMessage('stes.message.beurteilungbefreitgrundnachweisfehlt', 'danger');
            return false;
        }

        return true;
    }

    private controlBSP13ErfassenOrBSP7Bearbeiten(): boolean {
        const datum = this.arbeitsbemuehungenForm.controls.kontrolldatum.value;
        this.fehlermeldungenService.deleteMessage('stes.message.kontrolldatumgroessertagdatum', 'danger');
        if (datum && moment(datum).isAfter(new Date(), 'day')) {
            this.fehlermeldungenService.showMessage('stes.message.kontrolldatumgroessertagdatum', 'danger');
            return false;
        }
        return true;
    }

    private controlBSP14ErfassenOrBSP8Bearbeiten(): boolean {
        const eingangsdatumFormValue = this.arbeitsbemuehungenForm.controls.eingangsdatum.value;
        const kontrolldatumFormValue = this.arbeitsbemuehungenForm.controls.kontrolldatum.value;

        this.fehlermeldungenService.deleteMessage('stes.message.kontrolldatumgroessereingangdatum', 'danger');
        if (eingangsdatumFormValue && kontrolldatumFormValue && moment(kontrolldatumFormValue).isBefore(eingangsdatumFormValue, 'day')) {
            this.fehlermeldungenService.showMessage('stes.message.kontrolldatumgroessereingangdatum', 'danger');
            return false;
        }
        return true;
    }

    private shouldSendBefreiung(item, force) {
        const found = this.abmBefreiungList.find(
            obj => +obj.befreiungsgrundAbmID === +item.grunde && obj.datumBefreitVon === item.datumBefreitVon.getTime() && obj.datumBefreitBis === item.datumBefreitBis.getTime()
        );
        return this.isBearbeiten || !found || force;
    }

    private mapToDto(force = false): ArbeitsbemuehungenDTO {
        const arbeitsbemuehungenFormControl = this.arbeitsbemuehungenForm.controls;
        const kontrollperiodeFormControl = this.kontrollperiodeForm.controls;
        const abmBefreiungen = this.table.form.value.tableRows
            .filter(item => item.grunde && item.datumBefreitVon && item.datumBefreitBis && this.shouldSendBefreiung(item, force))
            .map(item => {
                return {
                    befreiungsgrundAbmID: item.grunde,
                    datumBefreitVon: item.datumBefreitVon,
                    datumBefreitBis: item.datumBefreitBis,
                    stesID: parseInt(this.stesId, 10)
                };
            });
        return {
            arbeitsbemuehungenID: this.isBearbeiten ? parseInt(this.kontrollperiodeId, 10) : null,
            datumPruefung: arbeitsbemuehungenFormControl.kontrolldatum.value,
            datumKontrollPeriode: kontrollperiodeFormControl.kontrollperiode.value,
            datumEingang: arbeitsbemuehungenFormControl.eingangsdatum.value,
            sollBewerbungen: arbeitsbemuehungenFormControl.vereinbart.value,
            istBewerbungen: arbeitsbemuehungenFormControl.erbracht.value,
            weitereAngaben: arbeitsbemuehungenFormControl.ergaenzendeAngaben.value,
            abmBefreiungList: abmBefreiungen,
            istSituationVorAL: this.kontrollperiodeForm.controls.zeit.value,
            statusId: parseInt(kontrollperiodeFormControl.status.value, 10),
            ojbVersion: this.kontrollperiodeDTO ? this.kontrollperiodeDTO.ojbVersion : 0,
            beurteilungAbmID: parseInt(arbeitsbemuehungenFormControl.beurteilung.value, 10),
            stesID: parseInt(this.stesId, 10)
        };
    }

    private areAllFormValid(): boolean {
        return this.arbeitsbemuehungenForm.valid && this.kontrollperiodeForm.valid && this.table.form.valid;
    }

    private markAllFormAsPristine(): void {
        this.arbeitsbemuehungenForm.markAsPristine();
        this.kontrollperiodeForm.markAsPristine();
        this.table.form.markAsPristine();
    }

    private markAllFormAsUntouched(): void {
        this.arbeitsbemuehungenForm.markAsUntouched();
        this.kontrollperiodeForm.markAsUntouched();
        this.table.form.markAsUntouched();
    }

    private setZeitOptions() {
        if (!!this.translateService) {
            // TODO check real values true & false
            this.zeitOptions = [
                {
                    value: true,
                    labelFr: this.translateService.instant('stes.label.vorArbeitslosigkeit'),
                    labelIt: this.translateService.instant('stes.label.vorArbeitslosigkeit'),
                    labelDe: this.translateService.instant('stes.label.vorArbeitslosigkeit')
                },
                {
                    value: false,
                    labelFr: this.translateService.instant('stes.label.waehrendArbeitslosigkeit'),
                    labelIt: this.translateService.instant('stes.label.waehrendArbeitslosigkeit'),
                    labelDe: this.translateService.instant('stes.label.waehrendArbeitslosigkeit')
                }
            ];
        }
    }

    private generateForm() {
        this.kontrollperiodeForm = this.formBuilder.group({
            kontrollperiode: [new Date(), [Validators.required, DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]],
            zeit: [null, Validators.required],
            status: [null, Validators.required],
            personalberater: null
        });

        this.arbeitsbemuehungenForm = this.formBuilder.group({
            eingangsdatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            scandatum: null,
            kontrolldatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            vereinbart: [null, NumberValidator.isPositiveInteger],
            erbracht: [null, NumberValidator.isPositiveInteger],
            beurteilung: [null, Validators.required],
            ergaenzendeAngaben: null
        });
    }

    private getFormData() {
        this.spinnerService.activate(this.kontrollperiodenChannel);
        forkJoin(this.dataService.getCode(DomainEnum.STATUS_ARBEITSBEMUEHUNG), this.dataService.getCode(DomainEnum.BEURTEILUNG_ABM))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([status, beurteilung]) => {
                    this.statusResponse = status;
                    this.beurteilungResponse = beurteilung;
                    this.status = this.facade.formUtilsService.mapDropdownKurztext(status);
                    this.beurteilung = this.facade.formUtilsService.mapDropdownKurztext(beurteilung);
                },
                () => {
                    this.spinnerService.deactivate(this.kontrollperiodenChannel);
                }
            );
    }

    private getRouteParams(): void {
        this.activatedRoute.queryParamMap.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params.get('kontrollperiodeId')) {
                this.kontrollperiodeId = params.get('kontrollperiodeId');
                this.isBearbeiten = true;
            }
        });

        this.activatedRoute.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params['stesId']) {
                this.stesId = params['stesId'];
            }
        });
    }

    private setSideNav(): void {
        let path: string = StesKontrollperioden.BEARBEITEN;
        this.activatedRoute.data.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.formNumber === StesFormNumberEnum.KONTROLLPERIODE_ERFASSEN) {
                path = StesKontrollperioden.ERFASSEN;
            }
        });
        this.path = path;
        this.navigationService.showNavigationTreeRoute(path, this.isBearbeiten ? { kontrollperiodeId: this.kontrollperiodeId } : null);
    }

    private hideSideNav(): void {
        this.navigationService.hideNavigationTreeRoute(this.path, this.isBearbeiten ? { kontrollperiodeId: this.kontrollperiodeId } : null);
    }

    private setSubscriptions() {
        ToolboxService.CHANNEL = this.kontrollperiodenChannel;
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.kontrollperiodeId, AvamCommonValueObjectsEnum.T_STES_KONTROLLPERIODEN);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });
        this.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.setZeitOptions();
            this.setInfoleisteInfo();
            this.commonRefreshData(this.kontrollperiodeDTO);
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
        comp.context = DmsMetadatenContext.DMS_CONTEXT_KONTROLLPERIODE;
        comp.id = this.kontrollperiodeId;
    }

    private setInfoleisteInfo(): void {
        moment.locale(this.translateService.currentLang);
        if (this.isBearbeiten) {
            const auxKontrollperiodeDatum = this.facade.formUtilsService.formatDateNgx(this.kontrollperiodeDTO.datumKontrollPeriode, FormUtilsService.GUI_MONTH_DATE_FORMAT);
            this.infobarService.sendDataToInfobar({
                title: this.translateService.instant('stes.subnavmenuitem.kontrollperioden.bearbeiten.infoleiste', { '0': auxKontrollperiodeDatum })
            });
        } else {
            this.infobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.kontrollperioden.erfassen' });
        }
        this.isBearbeiten ? this.infobarService.sendLastUpdate(this.kontrollperiodeDTO) : this.infobarService.sendLastUpdate({}, true);
    }

    private closeComponent(message) {
        if (this.router.url.includes(StesKontrollperioden.ERFASSEN) || this.router.url.includes(StesKontrollperioden.BEARBEITEN)) {
            this.navigateToKontrollperioden();
            this.hideSideNav();
        }
    }

    private navigateToKontrollperioden(): void {
        this.router.navigate([`stes/details/${this.stesId}/kontrollperioden`]);
    }

    private navigateToBearbeiten(kontrollperiodeId: number) {
        this.router.navigate([`stes/details/${this.stesId}/kontrollperioden/bearbeiten`], {
            queryParams: { kontrollperiodeId }
        });
    }

    private areSomeFormDirty(): boolean {
        return this.arbeitsbemuehungenForm.dirty || this.kontrollperiodeForm.dirty || this.table.form.dirty;
    }

    private checkGrundMandatory(value) {
        const filledBefreiung = this.table.form.value.tableRows.filter(item => item.grunde && item.datumBefreitVon && item.datumBefreitBis);
        if (
            this.beurteilungResponse &&
            value === this.facade.formUtilsService.getCodeIdByCode(this.beurteilungResponse, BeurteilungAbmCodeEnum.BEFREIT) &&
            !filledBefreiung.length
        ) {
            if (this.table.form.controls.tableRows.get('0')) {
                this.table.form.controls.tableRows
                    .get('0')
                    .get('grunde')
                    .setValidators(Validators.required);
                this.table.form.controls.tableRows
                    .get('0')
                    .get('grunde')
                    .updateValueAndValidity();
            }
        } else if (!filledBefreiung.length) {
            if (this.table.form.controls.tableRows.get('0')) {
                this.table.form.controls.tableRows
                    .get('0')
                    .get('grunde')
                    .clearValidators();
                this.table.form.controls.tableRows
                    .get('0')
                    .get('grunde')
                    .updateValueAndValidity();
            }
        }
    }

    private grundeMapper(element) {
        return {
            value: element.codeId,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    }

    private checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideSideNav();
            }
        });
    }
}
