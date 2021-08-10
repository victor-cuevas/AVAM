import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxConfig } from '@app/shared/components/toolbox/toolbox-config';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesLeistunsexportePaths } from '@shared/enums/stes-navigation-paths.enum';
import { StesLeistunsexporteLabels } from '@shared/enums/stes-routing-labels.enum';
import { StesLeistungsexportDetailsDTO } from '@shared/models/dtos-generated/stesLeistungsexportDetailsDTO';
import { Subscription } from 'rxjs';
import { LeistungsexporteAbstract } from '../leistungsexporte-abstract';
import { FacadeService } from '@shared/services/facade.service';
import { LeistungsexportFormHandler } from '@stes/pages/leistungsexporte/leistungsexporte-form-handler';

@Component({
    selector: 'app-leistungsexport-erfassen',
    templateUrl: '../leistungsexport-bearbeiten/leistungsexport-bearbeiten.component.html',
    styleUrls: ['./leistungsexport-erfassen.component.scss'],
    providers: [ObliqueHelperService]
})
export class LeistungsexportErfassenComponent extends LeistungsexporteAbstract implements OnInit, OnDestroy {
    stesId: string;
    data: StesLeistungsexportDetailsDTO;
    observeClickActionSub: Subscription;
    fromDateSub: Subscription;
    permissions: typeof Permissions = Permissions;

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private obliqueHelperService: ObliqueHelperService,
        private stesInfobarService: AvamStesInfoBarService,
        protected formBuilder: FormBuilder,
        protected dataService: StesDataRestService,
        protected leFormHandler: LeistungsexportFormHandler,
        protected facade: FacadeService
    ) {
        super(formBuilder, dataService, leFormHandler, facade);
    }

    ngOnInit() {
        super.ngOnInit();
        this.obliqueHelperService.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.leistungsexportErfassen' });
        this.setRouteParams();
        this.observeClickActionSub = this.subscribeToToolbox();
        this.facade.toolboxService.sendConfiguration(ToolboxConfig.getStesLeistungsexportErfassenConfig());
        this.leistungsexportForm = this.leFormHandler.initForm();
        this.fromDateSub = this.leFormHandler.getFromDateSub(this.leistungsexportForm);
        this.facade.navigationService.showNavigationTreeRoute(StesLeistunsexportePaths.LEISTUNGSEXPORTEERFASSEN);
        this.loadData();
    }

    closeComponent(message) {
        if (message.data.label === this.facade.dbTranslateService.instant(StesLeistunsexporteLabels.LEISTUNGSEXPORTEERFASSEN)) {
            this.cancel();
        }
    }

    setRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    loadLeistungsexportPreufResult() {
        return this.dataService.getLeistungsexportePreufResult(this.stesId);
    }

    reset() {
        if (this.leistungsexportForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.leistungsexportForm.reset({ antragdatum: new Date() });
            });
        }
    }

    cancel() {
        if (this.router.url.includes(StesLeistunsexportePaths.LEISTUNGSEXPORTEERFASSEN)) {
            this.router.navigate([`./${StesLeistunsexportePaths.LEISTUNGSEXPORTE}`], { relativeTo: this.route.parent });
        }
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();

        this.validateCountry(this.countriesList, this.leistungsexportForm);

        if (!this.leistungsexportForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.facade.spinnerService.activate(this.leistungsexportChannel);

        this.dataService.createLeistungsexporte(this.leFormHandler.mapToDTO(this.leistungsexportForm, this.stesId)).subscribe(
            response => {
                if (response.data) {
                    this.leistungsexportForm.markAsPristine();
                    this.reset();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    this.router.navigate([`stes/details/${this.stesId}/leistungsexporte/bearbeiten`], {
                        queryParams: { leistungsexportId: response.data.leistungsexportID }
                    });
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    canDeactivate(): boolean {
        return this.leistungsexportForm.dirty;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.fromDateSub.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
        this.observeClickActionSub.unsubscribe();
        this.facade.navigationService.hideNavigationTreeRoute(StesLeistunsexportePaths.LEISTUNGSEXPORTEERFASSEN);
    }
}
