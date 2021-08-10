import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { SanktionSachverhaltDTO } from '@shared/models/dtos-generated/sanktionSachverhaltDTO';
import { filter, first, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@shared/helpers/print.helper';
import { SanktionLabels } from '@shared/enums/stes-routing-labels.enum';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { SanktionenSachverhaltCodeEnum as SanktionSachverhaltType } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';
import { FormUtilsService } from '@app/shared';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Permissions } from '@shared/enums/permissions.enum';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { PermissionContextService } from '@shared/services/permission.context.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'sanktion-erfassen-bearbeiten-component',
    templateUrl: './sanktion-erfassen-bearbeiten.component.html',
    providers: [PermissionContextService]
})
export class SanktionErfassenBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit, DeactivationGuarded {
    @ViewChild('routerOutletComponent') routerOutletComponent;
    currentRoute: string;
    sanktionsgrund: any[];
    stesId: string;
    sachverhaltId: string;
    isBearbeiten: boolean;
    sachverhaltToolboxId = 'sanktion';
    public sanktionSachverhaltDTO: SanktionSachverhaltDTO;
    public permissions: typeof Permissions = Permissions;

    private regExpSanktionBearbeiten = '^(/stes/details/[0-9]{1,10}/sanktionen/(([a-z]+)|([a-z]+-weisungen)))(-bearbeiten)';
    private sachverhaltChannel = 'sanktionSachverhaltChannel';

    constructor(
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected dataRestService: StesDataRestService,
        protected activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        protected infobarService: AvamStesInfoBarService,
        private interactionService: StesComponentInteractionService,
        private permissionContextService: PermissionContextService,
        private facade: FacadeService
    ) {
        super();
    }

    public ngOnInit() {
        this.sanktionSachverhaltDTO = null;
        this.getRouteParams();
        this.setSideNav();
        this.configureToolbox();
        this.setSubscriptions();
        if (this.isBearbeiten) {
            this.getData(this.sachverhaltId);
        } else {
            this.permissionContextService.getContextPermissionsWithStesId(+this.stesId);
            this.setInfoleisteInfo();
        }
    }

    public ngAfterViewInit(): void {
        this.routerOutletComponent.sachverhaltForm.reset();
        this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.reset();
    }

    public ngOnDestroy(): void {
        if (!this.isBearbeiten) {
            this.hideSideNav();
        }
        super.ngOnDestroy();
    }

    public onOutletActivate(event): void {
        this.routerOutletComponent = event;
        this.routerOutletComponent.stesId = this.stesId;
        this.routerOutletComponent.isBearbeiten = this.isBearbeiten;
        if (this.isBearbeiten) {
            this.getData(this.sachverhaltId);
        }
    }

    public goToChild($event: any) {
        this.router.navigate([`stes/details/${this.stesId}/${this.currentRoute.replace('-bearbeiten', `-${$event.type.toLowerCase()}-bearbeiten`)}`], {
            queryParams: { sachverhaltId: this.sachverhaltId, [`${$event.type.toLowerCase()}Id`]: $event.id }
        });
    }

    public cancel(): void {
        this.router.navigate([`stes/details/${this.stesId}/sanktionen`]);
        if (this.areFormsDirty()) {
            this.checkConfirmationToCancel();
        } else {
            this.hideSideNav();
        }
    }

    public canDeactivate(): boolean {
        return this.areFormsDirty();
    }

    public reset() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.areFormsDirty()) {
            this.facade.resetDialogService.reset(() => {
                this.markAsPristineForm();
                if (this.isBearbeiten) {
                    this.routerOutletComponent.mapToForm(this.sanktionSachverhaltDTO);
                } else {
                    this.resetFormsAndStatus();
                }
            });
        }
    }

    public openDeleteDialog(): void {
        const modalRef = this.facade.openModalFensterService.openDeleteModal();
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
    }

    public delete(): void {
        this.facade.spinnerService.activate(this.sachverhaltChannel);
        this.dataRestService
            .deleteSanktionSachverhalt(this.stesId, this.sachverhaltId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                result => {
                    if (result.data == null && result.warning == null) {
                        this.facade.notificationService.success('common.message.datengeloescht');
                        this.markAsPristineForm();
                        this.hideSideNav();
                        this.router.navigate([`stes/details/${this.stesId}/sanktionen`]);
                    }
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.sachverhaltChannel);
                }
            );
    }

    public save() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.isFormValid()) {
            const sachverhalt: SanktionSachverhaltDTO = this.routerOutletComponent.mapToDto();
            this.saveSanktionSachverhalt(sachverhalt);
        } else {
            this.showFormErrors();
        }
    }

    public navigateTo(typeNavigation: string) {
        const url = this.currentRoute.replace('bearbeiten', typeNavigation + '-erfassen');
        this.router.navigate([`stes/details/${this.stesId}/` + url], { queryParams: { ['sachverhaltId']: this.sachverhaltId } });
    }

    private getRouteParams(): void {
        this.activatedRoute.queryParamMap.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            if (params.get('sachverhaltId')) {
                this.sachverhaltId = params.get('sachverhaltId');
                this.routerOutletComponent.isBearbeiten = true;
                this.isBearbeiten = true;
            }
        });

        this.activatedRoute.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            if (params['stesId']) {
                this.stesId = params['stesId'];
                this.routerOutletComponent.stesId = this.stesId;
            }
        });
    }

    private setSideNav(): void {
        this.currentRoute = `${StesSanktionen.SANKTIONEN}/${this.activatedRoute.firstChild.snapshot.data['type']}`;
        this.facade.navigationService.showNavigationTreeRoute(this.currentRoute, this.isBearbeiten ? { sachverhaltId: this.sachverhaltId } : null);
    }

    private showFormErrors() {
        OrColumnLayoutUtils.scrollTop();
        this.routerOutletComponent.ngForm.onSubmit();
        this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
    }

    private isFormValid() {
        return this.routerOutletComponent.sachverhaltForm.valid && this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.valid;
    }

    private areFormsDirty(): boolean {
        return this.routerOutletComponent.sachverhaltForm.dirty || this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.dirty;
    }

    private saveSanktionSachverhalt(sachverhalt: SanktionSachverhaltDTO) {
        this.facade.spinnerService.activate(this.sachverhaltChannel);
        const observable = this.isBearbeiten
            ? this.dataRestService.updateSanktionSachverhalt(this.stesId, sachverhalt)
            : this.dataRestService.saveSanktionSachverhalt(this.stesId, sachverhalt);
        observable.pipe(takeUntil(this.unsubscribe)).subscribe(
            response => {
                if (!!response.data) {
                    this.markAsPristineForm();
                    if (this.isBearbeiten) {
                        this.routerOutletComponent.sachverhaltDTO = response.data;
                        this.sanktionSachverhaltDTO = response.data;
                        this.setInfoleisteInfo(response.data);
                    } else {
                        this.router.navigate([`stes/details/${this.stesId}/${this.currentRoute.replace('erfassen', 'bearbeiten')}`], {
                            queryParams: { sachverhaltId: response.data }
                        });
                        this.hideSideNav();
                    }
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                }
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.sachverhaltChannel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.sachverhaltChannel);
            }
        );
    }

    private getData(sachverhaltId: string) {
        this.dataRestService
            .getSanktionSachverhaltById(this.stesId, sachverhaltId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(sachverhalt => {
                this.routerOutletComponent.sachverhaltDTO = sachverhalt.data;
                this.sanktionSachverhaltDTO = sachverhalt.data;
                this.setInfoleisteInfo(sachverhalt.data);
                this.permissionContextService.getContextPermissions(sachverhalt.data.sanktionSachverhalt.benutzerstelleID);
            });
    }

    private configureToolbox() {
        let toolboxConfig = [];
        this.facade.messageBus.buildAndSend('toolbox.help.formNumber', this.activatedRoute.firstChild.snapshot.data['formNumber']);
        this.facade.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: this.activatedRoute.firstChild.snapshot.data['formNumber'] });
        if (this.isBearbeiten) {
            const TOOLBOX_ACTIONS = [
                ToolboxActionEnum.EMAIL,
                ToolboxActionEnum.PRINT,
                ToolboxActionEnum.HELP,
                ToolboxActionEnum.DMS,
                ToolboxActionEnum.HISTORY,
                ToolboxActionEnum.COPY
            ];
            toolboxConfig = TOOLBOX_ACTIONS.map(action => new ToolboxConfiguration(action, true, true));
        } else {
            toolboxConfig = [
                // TODO: Add 'Zurück zur gespeicherten Liste' button when SUC 0765-005 is developed
                new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
            ];
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.sachverhaltToolboxId, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, +this.sachverhaltId));
    }

    private setSubscriptions() {
        ToolboxService.CHANNEL = this.routerOutletComponent.stesSanktionChannel;
        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.facade.openModalFensterService.openHistoryModal(this.sachverhaltId, this.getVOName());
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_SKN_SACHVERHALT, this.sachverhaltId);
                }
            });
        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent();
                }
            });
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.setInfoleisteInfo();
            });
        this.router.events
            .pipe(
                filter(event => {
                    if (event instanceof NavigationEnd) {
                        const urlWithoutParams = event.url.split('?')[0];
                        const isRegExp = urlWithoutParams.match(this.regExpSanktionBearbeiten);
                        if (isRegExp[0] === isRegExp.input) {
                            return true;
                        }
                    }
                    return false;
                }),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => {
                this.routerOutletComponent.isBearbeiten = true;
                if (this.sachverhaltId) {
                    this.getData(this.sachverhaltId);
                }
            });
    }

    private getVOName(): string {
        switch (this.routerOutletComponent.sachverhaltTypeId) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                return AvamCommonValueObjectsEnum.T_STES_SNK_SACHVERHALT_ABM;
            case SanktionSachverhaltType.SACHVERHALT_AMM:
                return AvamCommonValueObjectsEnum.T_STES_SNK_SACHVERHALT_AMM;
            case SanktionSachverhaltType.SACHVERHALT_BRT:
                return AvamCommonValueObjectsEnum.T_STES_SNK_SACHVERHALT_BRT;
            case SanktionSachverhaltType.SACHVERHALT_KTM:
                return AvamCommonValueObjectsEnum.T_STES_SNK_SACHVERHALT_KTM;
            case SanktionSachverhaltType.SACHVERHALT_VMT:
                return AvamCommonValueObjectsEnum.T_STES_SNK_SACHVERHALT_VMT;
            default:
                return null;
        }
    }

    private closeComponent() {
        if (
            this.router.url.includes(this.facade.translateService.instant(SanktionLabels.SANKTIONEN).toLowerCase()) &&
            (this.router.url.includes('erfassen') || this.router.url.includes('bearbeiten'))
        ) {
            this.router.navigate([`stes/details/${this.stesId}/sanktionen`]);
            this.hideSideNav();
        }
    }

    private setInfoleisteInfo(data?): void {
        this.infobarService.sendDataToInfobar({ title: this.getInfoleisteTranslation() });
        if (data) {
            this.infobarService.sendLastUpdate(data.sanktionSachverhalt);
        } else {
            this.infobarService.sendLastUpdate({}, true);
        }
    }

    private getInfoleisteTranslation(): string {
        moment.locale(this.facade.dbTranslateService.getCurrentLang());
        let baseRoute = `stes.subnavmenuitem.sanktionen.${this.isBearbeiten ? 'bearbeiten.infoleiste.{{type}}' : 'erfassen'}`;
        if (!this.isBearbeiten) {
            return this.facade.translateService.instant(baseRoute);
        }
        let firstVarEl = '';
        switch (this.routerOutletComponent.sachverhaltTypeId) {
            case SanktionSachverhaltType.SACHVERHALT_ABM:
                firstVarEl = this.facade.formUtilsService.formatDateNgx(
                    this.routerOutletComponent.sachverhaltDTO.sanktionSachverhalt.datumKontrollPeriode,
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
        return this.facade.translateService.instant(baseRoute, { '0': firstVarEl });
    }

    private getFirstDynamicInfoleisteElement(propertyName: string): string {
        return this.routerOutletComponent.sachverhaltDTO[propertyName]
            ? this.facade.formUtilsService.formatDateNgx(this.routerOutletComponent.sachverhaltDTO[propertyName], FormUtilsService.GUI_DATE_FORMAT)
            : '';
    }

    private markAsPristineForm(): void {
        this.routerOutletComponent.sachverhaltForm.markAsPristine();
        this.routerOutletComponent.fallbearbeitung.fallbearbeitungForm.markAsPristine();
    }

    private resetFormsAndStatus(): void {
        this.routerOutletComponent.ngForm.resetForm();
        this.routerOutletComponent.sachverhaltForm.reset();
        this.routerOutletComponent.fallbearbeitung.resetForm();
        this.routerOutletComponent.setInitialValues();
        this.markAsPristineForm();
    }

    private hideSideNav() {
        this.facade.navigationService.hideNavigationTreeRoute(`${StesSanktionen.SANKTIONEN}/${this.activatedRoute.firstChild.snapshot.data['type']}`);
    }

    private checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideSideNav();
            }
        });
    }
}
