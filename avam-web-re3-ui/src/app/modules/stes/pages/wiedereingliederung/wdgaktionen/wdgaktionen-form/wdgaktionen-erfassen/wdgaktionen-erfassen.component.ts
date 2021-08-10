import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ToolboxService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesWiedereingliederungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { WidereingliederungLabels } from '@shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@shared/services/message-bus';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { AktionAbstract } from '../wdgaktionen-abstract';
import { AktionFormHandler } from '../wdgaktionen-form-handler';

@Component({
    selector: 'avam-wdgaktionen-erfassen',
    templateUrl: './wdgaktionen-erfassen.component.html',
    styleUrls: ['./wdgaktionen-erfassen.component.scss'],
    providers: [AktionFormHandler, ObliqueHelperService]
})
export class WdgAktionenErfassenComponent extends AktionAbstract implements OnInit, OnDestroy {
    permissions: typeof Permissions = Permissions;

    constructor(
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
        messageBus: MessageBus,
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
        SpinnerService.CHANNEL = this.wdgAktionenChannel;
    }

    ngOnInit() {
        super.ngOnInit();
        this.obliqueHelper.ngForm = this.ngForm;
        this.getRouteParams();
        this.aktionErfassenForm = this.aktionFormHandler.initForm();
        this.initialiseBenuStelleId();
        this.setSideNavigation();
        this.configureToolbox();
        this.toolboxClickSubscription = this.subscribeToToolbox();
        this.loadData();
        this.wdgAktionenBtn.nativeElement.focus();
        this.setUeberschrift();
    }

    setUeberschrift() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.wiedereingliederung.aktionErfassen' });
    }

    configureToolbox(): void {
        this.toolboxService.sendConfiguration(
            [
                new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
            ],
            this.aktionenToolboxId
        );
    }

    cancel() {
        if (this.router.url.includes(StesWiedereingliederungPaths.AKTION_ERFASSEN)) {
            this.router.navigate([`./${StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN}`], { relativeTo: this.route.parent });
        }
    }

    reset() {
        this.fehlermeldungenService.closeMessage();
        if (this.aktionErfassenForm.dirty || this.selectionChanged) {
            this.resetDialogService.reset(() => {
                this.aktionErfassenForm.reset({ erfassungsdatum: new Date() });
                this.pberater.appendCurrentUser();
                this.clearFormArray(this.aktionErfassenForm.get('ziel') as FormArray);
                this.initWdgAktionenRadioState();
            });
        }
    }

    clearFormArray(formArray: FormArray) {
        while (formArray.length !== 1) {
            formArray.removeAt(0);
        }
    }

    save() {
        this.fehlermeldungenService.closeMessage();
        if (this.aktionErfassenForm.valid) {
            this.spinnerService.activate(this.wdgAktionenChannel);

            this.dataService.createWDGAktion(this.aktionFormHandler.mapToDTO(this.aktionErfassenForm, +this.stesId)).subscribe(
                response => {
                    if (response.data !== null) {
                        this.aktionErfassenForm.markAsPristine();
                        this.selectionChanged = false;
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        this.router.navigate([`stes/details/${this.stesId}/wiedereingliederung/aktionen/bearbeiten`], {
                            queryParams: { wdgAktionId: response.data.stesWdgAktionID }
                        });
                    }
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                    this.deactivateSpinnerAndScrollTop();
                }
            );
        } else {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            if (this.isWgdAktionenSelect && !this.aktionErfassenForm.get('wgdAktionen').value) {
                this.fehlermeldungenService.showMessage('stes.matching.error.ammoderfreitext', 'danger');
            }
            OrColumnLayoutUtils.scrollTop();
        }
    }

    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.ZIELE_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AKTION_ERFASSEN);
    }

    initWdgAktionenRadioState() {
        this.isWgdAktionenSelect = true;
        this.selectionChanged = false;
    }

    closeComponent(message) {
        if (message.data.label === this.translateService.instant(WidereingliederungLabels.AKTION_ERFASSEN)) {
            this.cancel();
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.toolboxService.sendConfiguration([]);
        this.toolboxClickSubscription.unsubscribe();
        this.navigationService.hideNavigationTreeRoute(StesWiedereingliederungPaths.AKTION_ERFASSEN);
    }
}
