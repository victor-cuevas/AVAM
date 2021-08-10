import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesWiedereingliederungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { WidereingliederungLabels } from '@shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@shared/services/message-bus';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { WdgZielAbstract } from '../wdgziel-abstract';
import { WdgZielFormHandler } from '../wdgziel-form-handler';

@Component({
    selector: 'avam-wiedereingliederungsziel-erfassen',
    templateUrl: '../wdgziel.component.html',
    styleUrls: ['./wdgziel-erfassen.component.scss'],
    providers: [WdgZielFormHandler, ObliqueHelperService]
})
export class WdgZielErfassenComponent extends WdgZielAbstract implements OnInit, OnDestroy {
    permissions: typeof Permissions = Permissions;

    constructor(
        wdgZielFormHandler: WdgZielFormHandler,
        route: ActivatedRoute,
        router: Router,
        dataService: StesDataRestService,
        modalService: NgbModal,
        toolboxService: ToolboxService,
        spinnerService: SpinnerService,
        translateService: TranslateService,
        fehlermeldungenService: FehlermeldungenService,
        resetDialogService: ResetDialogService,
        navigationService: NavigationService,
        notificationService: NotificationService,
        authService: AuthenticationService,
        obliqueHelper: ObliqueHelperService,
        messageBus: MessageBus,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super(
            wdgZielFormHandler,
            route,
            router,
            dataService,
            modalService,
            toolboxService,
            spinnerService,
            translateService,
            fehlermeldungenService,
            resetDialogService,
            navigationService,
            notificationService,
            authService,
            obliqueHelper,
            messageBus
        );
        SpinnerService.CHANNEL = this.wdgZielChannel;
    }

    ngOnInit() {
        super.ngOnInit();
        this.setSideNav();
        this.wdgZielForm = this.wdgZielFormHandler.createForm();
        this.loadData();
        this.toolboxActionSub = this.subscribeToToolbox();
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.wiedereingliederung.zielErfassen' });
    }

    getAdditionalRouteParams(): void {
        // no-op
    }

    closeComponent(message) {
        if (message.data.label === this.translateService.instant(WidereingliederungLabels.ZIEL_ERFASSEN)) {
            this.cancel();
        }
    }

    populateForm() {
        this.wdgZielForm.patchValue({
            erfassungsDatum: new Date()
        });

        this.showCurrentUser();
    }

    setSideNav() {
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.ZIELE_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.ZIEL_ERFASSEN);
    }

    cancel() {
        if (this.router.url.includes(StesWiedereingliederungPaths.ZIEL_ERFASSEN)) {
            this.router.navigate([`./${StesWiedereingliederungPaths.ZIELE_ANZEIGEN}`], { relativeTo: this.route.parent });
        }
    }

    showCurrentUser() {
        this.benutzerAusVollzugsregion.appendCurrentUser();
    }

    save() {
        this.fehlermeldungenService.closeMessage();
        if (!this.wdgZielForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }
        this.spinnerService.activate(this.wdgZielChannel);
        this.dataService.createWdgZiel(this.wdgZielFormHandler.mapToDTO(this.wdgZielForm, this.stesId)).subscribe(
            response => {
                if (response.data !== null) {
                    this.wdgZielForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.router.navigate([`stes/details/${this.stesId}/wiedereingliederung/ziele/bearbeiten`], {
                        queryParams: { stesWdgZielId: response.data.stesWdgZielId }
                    });
                }
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    reset() {
        if (this.wdgZielForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.wdgZielForm.reset({ erfassungsDatum: new Date() });
                this.wdgZielFormHandler.clearFormArray(this.wdgZielForm.get('beurteilungsKriterium') as FormArray);
                this.showCurrentUser();
            });
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.navigationService.hideNavigationTreeRoute(StesWiedereingliederungPaths.ZIEL_ERFASSEN);
    }

    configureToolbox() {
        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];
        this.toolboxService.sendConfiguration(toolboxConfig, this.wdgZielToolboxId);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }
}
