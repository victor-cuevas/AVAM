import { Component, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ArbeitsvermittlungRestService } from '@app/core/http/arbeitsvermittlung-rest.service';
import { UnternehmenRestService } from '@app/core/http/unternehmen-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxConfig } from '@app/shared/components/toolbox/toolbox-config';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { UnternehmenDataService } from '@app/shared/services/unternehmen-data.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { StesZwischenverdienstPaths } from '@shared/enums/stes-navigation-paths.enum';
import { StesZwischenverdienstLabels } from '@shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@shared/services/navigation-service';
import { ToolboxService } from '@shared/services/toolbox.service';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { ZwischenverdienstFormHandler } from '../zwischenverdienst-form-handler';
import { ZwischenverdiensteAbstract } from '../zwischenverdienste-abstract';
import { FormUtilsService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-zwischenverdienst-erfassen',
    templateUrl: './zwischenverdienst-bearbeiten.component.html',
    providers: [ZwischenverdienstFormHandler, ObliqueHelperService]
})
export class ZwischenverdienstErfassenComponent extends ZwischenverdiensteAbstract implements OnDestroy {
    unternehenSub: Subscription;
    permissions: typeof Permissions = Permissions;

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    constructor(
        dataService: StesDataRestService,
        toolboxService: ToolboxService,
        modalService: NgbModal,
        fehlermeldungenService: FehlermeldungenService,
        spinnerService: SpinnerService,
        unternehmenDataService: UnternehmenDataService,
        protected unternehmenRestService: UnternehmenRestService,
        arbeitsvermittlungRestService: ArbeitsvermittlungRestService,
        formBuilder: FormBuilder,
        dbTranslateService: DbTranslateService,
        translateService: TranslateService,
        route: ActivatedRoute,
        router: Router,
        navigationService: NavigationService,
        zvFormHandler: ZwischenverdienstFormHandler,
        authService: AuthenticationService,
        obliqueHelperService: ObliqueHelperService,
        private notificationService: NotificationService,
        private resetDialogService: ResetDialogService,
        messageBus: MessageBus,
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
        if (message.data.label === this.translateService.instant(StesZwischenverdienstLabels.ZWISCHENVERDIENSTEERFASSEN)) {
            this.cancel();
        }
    }

    cancel() {
        if (this.router.url.includes(StesZwischenverdienstPaths.ZWISCHENVERDIENSTEERFASSEN)) {
            this.router.navigate([`./${StesZwischenverdienstPaths.ZWISCHENVERDIENSTE}`], { relativeTo: this.route.parent });
        }
    }

    setSideNav() {
        this.navigationService.showNavigationTreeRoute(this.getZwischenverdienstPath());
    }

    getZwischenverdienstPath() {
        return StesZwischenverdienstPaths.ZWISCHENVERDIENSTEERFASSEN;
    }

    getToollboxConfig() {
        return ToolboxConfig.getStesZwischenverdienstErfassenConfig();
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
        this.dataService.createZwischenverdienst(this.zvFormHandler.mapToDTO(this.zwischenverdienstForm, this.stesId), this.translateService.currentLang).subscribe(
            response => {
                if (response.data !== null) {
                    this.letzteAktualisierung = {};
                    this.zwischenverdienstForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.router.navigate([`stes/details/${this.stesId}/zwischenverdienste/bearbeiten`], {
                        queryParams: { zwischenverdienstId: response.data.zwischenverdienstId }
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
        if (this.zwischenverdienstForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.zwischenverdienstForm.reset({ isSelbststaendigerZV: false, isAufgrundZuweisung: false });
                this.setFieldsState(false, false);
            });
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.navigationService.hideNavigationTreeRoute(this.getZwischenverdienstPath());
    }
}
