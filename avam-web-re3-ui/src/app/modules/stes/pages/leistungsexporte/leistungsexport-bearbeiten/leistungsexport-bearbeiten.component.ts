import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxConfig } from '@app/shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesLeistunsexportePaths } from '@shared/enums/stes-navigation-paths.enum';
import { StesLeistunsexporteLabels } from '@shared/enums/stes-routing-labels.enum';
import { Subscription } from 'rxjs';
import { LeistungsexporteAbstract } from '../leistungsexporte-abstract';
import { FacadeService } from '@shared/services/facade.service';
import { LeistungsexportFormHandler } from '@stes/pages/leistungsexporte/leistungsexporte-form-handler';

@Component({
    selector: 'avam-leistungsexport-bearbeiten',
    templateUrl: './leistungsexport-bearbeiten.component.html',
    styleUrls: ['./leistungsexport-bearbeiten.component.scss'],
    providers: [LeistungsexportFormHandler, ObliqueHelperService]
})
export class LeistungsexportBearbeitenComponent extends LeistungsexporteAbstract implements OnInit, OnDestroy {
    stesId: string;
    leistungsexportId: string;
    observeClickActionSub: Subscription;
    fromDateSub: Subscription;
    langChangeSubscription: Subscription;
    permissions: typeof Permissions = Permissions;

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private datePipe: DatePipe,
        private obliqueHelper: ObliqueHelperService,
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
        this.obliqueHelper.ngForm = this.ngForm;
        this.setRouteParams();
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.leistungsexportBearbeiten' });
        this.leistungsexportForm = this.leFormHandler.initForm();
        this.fromDateSub = this.leFormHandler.getFromDateSub(this.leistungsexportForm);
        this.observeClickActionSub = this.subscribeToToolbox(this.leistungsexportId);
        this.facade.toolboxService.sendConfiguration(
            ToolboxConfig.getStesLeistungsexportBearbeitenConfig(),
            this.leistungsexportToolboxId,
            ToolboxDataHelper.createForLstexpBearbeiten(this.stesId, this.leistungsexportId)
        );
        this.facade.navigationService.showNavigationTreeRoute(StesLeistunsexportePaths.LEISTUNGSEXPORTEBEARBEITEN, { leistungsexportId: this.leistungsexportId });
        this.loadData();
        this.langChangeSubscription = this.subscribeToLangChange();
    }

    closeComponent(message) {
        if (message.data.label === this.facade.dbTranslateService.instant(StesLeistunsexporteLabels.LEISTUNGSEXPORTEBEARBEITEN)) {
            this.cancel();
        }
    }

    setRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.leistungsexportId = params.get('leistungsexportId');
        });

        this.route.parent.params.subscribe(params => {
            this.stesId = params.stesId;
        });
    }

    loadLeistungsexport() {
        return this.dataService.getLeistungsexportById(this.leistungsexportId);
    }

    subscribeToLangChange(): Subscription {
        return this.facade.dbTranslateService.getEventEmitter().subscribe(() => {
            if (this.lastUpdate) {
                this.setUeberschrift();
            }
        });
    }

    reset() {
        if (this.leistungsexportForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.leistungsexportForm.reset(this.leFormHandler.mapToForm(this.lastUpdate));
            });
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

        this.dataService.updateLeistungsexport(this.leFormHandler.mapToDTO(this.leistungsexportForm, this.stesId, this.leistungsexportId)).subscribe(
            response => {
                if (response.data) {
                    this.leistungsexportForm.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    this.lastUpdate = response.data;
                    this.leistungsexportForm.reset(this.leFormHandler.mapToForm(response.data));
                    this.setUeberschrift();
                    this.setInfoIconData();
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    cancel() {
        if (this.router.url.includes(StesLeistunsexportePaths.LEISTUNGSEXPORTEBEARBEITEN)) {
            this.router.navigate([`./${StesLeistunsexportePaths.LEISTUNGSEXPORTE}`], { relativeTo: this.route.parent });
            this.facade.navigationService.hideNavigationTreeRoute(StesLeistunsexportePaths.LEISTUNGSEXPORTEBEARBEITEN, { leistungsexportId: this.leistungsexportId });
        }
    }

    delete() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.leistungsexportChannel);

        this.dataService.deleteLeistungsexport(this.stesId, this.leistungsexportId).subscribe(
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                this.cancel();
            },
            () => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    openDeleteDialog() {
        const modalRef = this.facade.openModalFensterService.openDeleteModal();
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
    }

    setUeberschrift() {
        this.stesInfobarService.sendDataToInfobar({ title: `${this.facade.dbTranslateService.instant('stes.subnavmenuitem.leistungsexportBearbeiten')} ${this.getDateRange()}` });
    }

    setInfoIconData() {
        this.stesInfobarService.sendLastUpdate(this.lastUpdate);
    }

    getDateRange(): string {
        const von = this.datePipe.transform(this.lastUpdate.datumLEvon, 'dd.MM.yyyy');
        const bis = ' - ' + this.datePipe.transform(this.lastUpdate.datumLEbis, 'dd.MM.yyyy');
        return von + bis;
    }

    canDeactivate(): boolean {
        return this.leistungsexportForm.dirty;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.facade.toolboxService.sendConfiguration([]);
        this.stesInfobarService.sendLastUpdate({}, true);
        this.facade.fehlermeldungenService.closeMessage();
        this.fromDateSub.unsubscribe();
        this.observeClickActionSub.unsubscribe();
        this.langChangeSubscription.unsubscribe();
    }
}
