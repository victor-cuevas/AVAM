import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesWiedereingliederungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperStesWdgAktionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesWdgAktionDTOWarningMessages';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { WidereingliederungLabels } from '@shared/enums/stes-routing-labels.enum';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { Observable } from 'rxjs';
import { AktionAbstract } from '../wdgaktionen-abstract';
import { AktionFormHandler } from '../wdgaktionen-form-handler';

@Component({
    selector: 'avam-wdgaktionen-bearbeiten',
    templateUrl: '../wdgaktionen-erfassen/wdgaktionen-erfassen.component.html',
    styleUrls: ['../wdgaktionen-erfassen/wdgaktionen-erfassen.component.scss'],
    providers: [AktionFormHandler, ObliqueHelperService]
})
export class WdgAktionenBearbeitenComponent extends AktionAbstract implements OnInit, OnDestroy {
    wdgAktionId: string;

    aktionenToolboxId = 'wdgaktion-bearbeiten';

    permissions: typeof Permissions = Permissions;

    constructor(
        messageBus: MessageBus,
        private navigationService: NavigationService,
        private notificationService: NotificationService,
        private resetDialogService: ResetDialogService,
        private router: Router,
        private translateService: TranslateService,
        private obliqueHelper: ObliqueHelperService,
        aktionFormHandler: AktionFormHandler,
        dataService: StesDataRestService,
        dbTranslateService: DbTranslateService,
        fehlermeldungenService: FehlermeldungenService,
        formBuilder: FormBuilder,
        modalService: NgbModal,
        route: ActivatedRoute,
        spinnerService: SpinnerService,
        toolboxService: ToolboxService,
        authService: AuthenticationService,
        stesInfobarService: AvamStesInfoBarService
    ) {
        super(
            aktionFormHandler,
            dataService,
            dbTranslateService,
            fehlermeldungenService,
            formBuilder,
            modalService,
            route,
            spinnerService,
            toolboxService,
            authService,
            messageBus,
            stesInfobarService
        );
        ToolboxService.CHANNEL = this.aktionenToolboxId;
    }

    ngOnInit() {
        super.ngOnInit();
        this.obliqueHelper.ngForm = this.ngForm;
        this.setRouteParams();
        this.setSideNavigation();
        this.aktionErfassenForm = this.aktionFormHandler.initForm();
        this.configureToolbox();
        this.toolboxClickSubscription = this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.loadData();
        this.initialiseBenuStelleId();
    }

    reset() {
        if (this.aktionErfassenForm.dirty || this.selectionChanged) {
            this.resetDialogService.reset(() => {
                this.aktionErfassenForm.reset(this.aktionFormHandler.mapToForm(this.lastUpdate));
                this.populateZiele(this.lastUpdate.stesWdgZielIds);
                this.initWdgAktionenRadioState();
            });
        }
    }

    save() {
        this.fehlermeldungenService.closeMessage();
        if (!this.aktionErfassenForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }
        this.spinnerService.activate(this.wdgAktionenChannel);

        this.dataService.updateWDGAktion(this.aktionFormHandler.mapToDTO(this.aktionErfassenForm, +this.stesId, +this.wdgAktionId)).subscribe(
            response => {
                this.lastUpdate = response.data;

                if (response.data !== null) {
                    this.aktionErfassenForm.markAsPristine();
                    this.selectionChanged = false;
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.aktionErfassenForm.reset(this.aktionFormHandler.mapToForm(response.data));
                    this.setUeberschrift();
                    this.setInfoIconData();
                }
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    cancel() {
        if (this.router.url.includes(StesWiedereingliederungPaths.AKTIONEN_BEARBEITEN)) {
            this.router.navigate([`./${StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN}`], { relativeTo: this.route.parent });
            this.navigationService.hideNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_BEARBEITEN, {
                wdgAktionId: this.wdgAktionId
            });
        }
    }

    delete() {
        this.aktionErfassenForm.markAsPristine();
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.wdgAktionenChannel);
        this.dataService.deleteWDGAktion(this.wdgAktionId).subscribe(
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                this.router.navigate([`./${StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN}`], { relativeTo: this.route.parent });
                this.navigationService.hideNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_BEARBEITEN, {
                    wdgAktionId: this.wdgAktionId
                });
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
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

    setRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.wdgAktionId = params.get('wdgAktionId');
        });

        this.route.parent.params.subscribe(params => {
            this.stesId = params.stesId;
        });
    }

    initWdgAktionenRadioState() {
        if (this.aktionErfassenForm.controls.wgdAktionen.value) {
            this.isWgdAktionenSelect = true;
        }
        if (this.aktionErfassenForm.controls.wgdAktionenText.value) {
            this.isWgdAktionenSelect = false;
        }
        this.selectionChanged = false;
    }

    configureToolbox(): void {
        const toolboxData: DokumentVorlageToolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.WDGAKTION,
            vorlagenKategorien: [VorlagenKategorie.Wdg],
            entityIDsMapping: { STES_ID: +this.stesId, WDG_AKTION_ID: +this.wdgAktionId }
        };

        this.toolboxService.sendConfiguration(
            [
                new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true)
            ],
            this.aktionenToolboxId,
            toolboxData
        );
    }

    setUeberschrift() {
        if (this.lastUpdate.aktionAmm || this.lastUpdate.aktionFreitext) {
            this.stesInfobarService.sendDataToInfobar({
                title: `${this.dbTranslateService.instant('stes.wdg.label.aktion')} - ${this.lastUpdate.aktionAmm ? this.lastUpdate.aktionAmm : this.lastUpdate.aktionFreitext}`
            });
        }
    }

    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.ZIELE_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_BEARBEITEN, {
            wdgAktionId: this.wdgAktionId
        });
    }

    loadAktion(): Observable<BaseResponseWrapperStesWdgAktionDTOWarningMessages> {
        return this.dataService.getWdgAktionById(this.wdgAktionId);
    }

    closeComponent(message) {
        if (message.data.label === this.translateService.instant(WidereingliederungLabels.AKTION_BEARBEITEN)) {
            this.cancel();
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.toolboxClickSubscription.unsubscribe();
        this.fehlermeldungenService.closeMessage();
    }
}
