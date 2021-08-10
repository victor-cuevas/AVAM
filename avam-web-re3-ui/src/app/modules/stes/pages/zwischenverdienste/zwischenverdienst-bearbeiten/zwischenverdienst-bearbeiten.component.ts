import { DatePipe } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ArbeitsvermittlungRestService } from '@app/core/http/arbeitsvermittlung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { UnternehmenRestService } from '@app/core/http/unternehmen-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxConfig } from '@app/shared/components/toolbox/toolbox-config';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesZwischenverdienstPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxService } from '@app/shared/services/toolbox.service';
import { UnternehmenDataService } from '@app/shared/services/unternehmen-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { StesZwischenverdienstLabels } from '@shared/enums/stes-routing-labels.enum';
import { BaseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { Observable, Subscription } from 'rxjs';
import { ZwischenverdienstFormHandler } from '../zwischenverdienst-form-handler';
import { ZwischenverdiensteAbstract } from '../zwischenverdienste-abstract';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-zwischenverdienst-bearbeiten',
    templateUrl: './zwischenverdienst-bearbeiten.component.html',
    providers: [ZwischenverdienstFormHandler, ObliqueHelperService]
})
export class ZwischenverdienstBearbeitenComponent extends ZwischenverdiensteAbstract {
    zwischenverdienstId: string;
    unternehenSub: Subscription;
    zwischenverdienstNavPath = 'zwischenverdienste/bearbeiten';
    permissions: typeof Permissions = Permissions;

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    constructor(
        spinnerService: SpinnerService,
        navigationService: NavigationService,
        dataService: StesDataRestService,
        arbeitsvermittlungRestService: ArbeitsvermittlungRestService,
        toolboxService: ToolboxService,
        modalService: NgbModal,
        formBuilder: FormBuilder,
        dbTranslateService: DbTranslateService,
        translateService: TranslateService,
        route: ActivatedRoute,
        router: Router,
        fehlermeldungenService: FehlermeldungenService,
        unternehmenRestService: UnternehmenRestService,
        unternehmenDataService: UnternehmenDataService,
        zvFormHandler: ZwischenverdienstFormHandler,
        authService: AuthenticationService,
        obliqueHelperService: ObliqueHelperService,
        private notificationService: NotificationService,
        messageBus: MessageBus,
        private datePipe: DatePipe,
        private resetDialogService: ResetDialogService,
        stesInfobarService: AvamStesInfoBarService,
        facade: FacadeService
    ) {
        super(
            toolboxService,
            modalService,
            spinnerService,
            dataService,
            fehlermeldungenService,
            unternehmenRestService,
            unternehmenDataService,
            formBuilder,
            dbTranslateService,
            arbeitsvermittlungRestService,
            translateService,
            route,
            router,
            navigationService,
            zvFormHandler,
            authService,
            obliqueHelperService,
            messageBus,
            stesInfobarService,
            facade
        );
        SpinnerService.CHANNEL = this.zwischenverdienstChannel;
        ToolboxService.CHANNEL = this.zwischenverdienstToolboxId;
    }

    closeComponent(message) {
        if (message.data.label === this.translateService.instant(StesZwischenverdienstLabels.ZWISCHENVERDIENSTEBEARBEITEN)) {
            this.cancel();
        }
    }

    cancel() {
        if (this.router.url.includes(StesZwischenverdienstPaths.ZWISCHENVERDIENSTEBEARBEITEN)) {
            this.router.navigate([`./${StesZwischenverdienstPaths.ZWISCHENVERDIENSTE}`], { relativeTo: this.route.parent });
            this.navigationService.hideNavigationTreeRoute(this.getZwischenverdienstPath(), {
                zwischenverdienstId: this.zwischenverdienstId
            });
        }
    }

    setSideNav() {
        this.navigationService.showNavigationTreeRoute(this.getZwischenverdienstPath(), {
            zwischenverdienstId: this.zwischenverdienstId
        });
    }

    setAdditionalRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.zwischenverdienstId = params.get('zwischenverdienstId');
        });
    }

    getZwischenverdienstPath() {
        return StesZwischenverdienstPaths.ZWISCHENVERDIENSTEBEARBEITEN;
    }

    getToollboxConfig() {
        return ToolboxConfig.getStesZwischenverdienstBearbeitenConfig();
    }

    reset() {
        if (this.zwischenverdienstForm.dirty) {
            this.resetDialogService.reset(() => {
                this.zwischenverdienstForm.reset(this.zvFormHandler.mapCheckboxes(this.letzteAktualisierung));
                this.zwischenverdienstForm.patchValue(this.zvFormHandler.mapToForm(this.letzteAktualisierung));
                this.setFieldsState(this.zwischenverdienstForm.get('isAufgrundZuweisung').value, this.zwischenverdienstForm.get('isSelbststaendigerZV').value);
            });
        }
    }

    loadZwischenverdienst(): Observable<BaseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages> {
        return this.dataService.getZwischenverdienstById(this.zwischenverdienstId);
    }

    setUeberschrift() {
        this.stesInfobarService.sendDataToInfobar({ title: `${this.dbTranslateService.instant('stes.label.zwischenverdienst')} ${this.getDateRange()}` });
    }

    getDateRange(): string {
        const von = this.datePipe.transform(this.facade.formUtilsService.parseDate(this.letzteAktualisierung.zvDatumVon), 'dd.MM.yyyy');
        const bis = this.letzteAktualisierung.zvDatumBis
            ? ' - ' + this.datePipe.transform(this.facade.formUtilsService.parseDate(this.letzteAktualisierung.zvDatumBis), 'dd.MM.yyyy')
            : '';
        return von + bis;
    }

    save() {
        this.fehlermeldungenService.closeMessage();
        if (!this.zwischenverdienstForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.spinnerService.activate(this.zwischenverdienstChannel);
        this.dataService
            .updateZwischenverdienst(this.zvFormHandler.mapToDTO(this.zwischenverdienstForm, this.stesId, this.zwischenverdienstId), this.translateService.currentLang)
            .subscribe(
                response => {
                    if (response.data !== null) {
                        this.zwischenverdienstForm.markAsPristine();
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        this.letzteAktualisierung = response.data;
                        this.zwischenverdienstForm.reset(this.zvFormHandler.mapCheckboxes(this.letzteAktualisierung));
                        this.zwischenverdienstForm.patchValue(this.zvFormHandler.mapToForm(response.data));
                        this.setFieldsState(this.isAufgrundZuweisung(), this.isSelbststaendigerZV());
                        this.setUnternehmenRequired();
                        this.setUeberschrift();
                        this.setupInfoIconOnInit();
                        this.lastSelectedArbeitgeber = null;
                    }
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                    this.deactivateSpinnerAndScrollTop();
                }
            );
    }

    delete() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.zwischenverdienstChannel);
        this.dataService.deleteZwischenverdienst(this.zwischenverdienstId).subscribe(
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                this.zwischenverdienstForm.markAsPristine();
                this.cancel();
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    openDeleteDialog() {
        const modalRef = this.openModal(GenericConfirmComponent, 'modal-basic-title');
        modalRef.result.then(
            result => {
                if (result) {
                    this.delete();
                }
            },
            reason => {
                this.fehlermeldungenService.closeMessage();
                ToolboxService.CHANNEL = this.zwischenverdienstToolboxId;
            }
        );
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    setupInfoIconOnInit() {
        this.stesInfobarService.sendLastUpdate(this.letzteAktualisierung);
    }

    setupInfoIconOnDestroy() {
        this.stesInfobarService.sendLastUpdate({}, true);
    }
}
