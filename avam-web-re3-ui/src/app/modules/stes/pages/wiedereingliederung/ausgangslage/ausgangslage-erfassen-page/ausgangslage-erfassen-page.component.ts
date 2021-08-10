import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesWiedereingliederungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { WidereingliederungLabels } from '@app/shared/enums/stes-routing-labels.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { BaseResponseWrapperStesRahmenfristDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesRahmenfristDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { AusgangslageFormComponent } from '../ausgangslage-form/ausgangslage-form.component';
import { AusgangsLageFormData } from '../ausgangslage-form/ausgangslage-form.model';

@Component({
    selector: 'avam-ausgangslage-erfassen-page',
    templateUrl: './ausgangslage-erfassen-page.component.html'
})
export class AusgangslageErfassenPageComponent implements OnInit, OnDestroy {
    @ViewChild('formComponent') formComponent: AusgangslageFormComponent;
    stesId: number;
    channel = 'ausgangslage-erfassen-page';
    toolboxSubscription: Subscription;
    sidenavCloseSub: Subscription;
    formData: AusgangsLageFormData;
    permissions: typeof Permissions = Permissions;

    constructor(
        private dataRestService: StesDataRestService,
        private facade: FacadeService,
        private route: ActivatedRoute,
        private router: Router,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.setRouteParams();
        this.facade.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_ERFASSEN);
        this.sidenavCloseSub = this.getSidenavCloseSub();
        this.configureToolbox();
        this.toolboxSubscription = this.getToolboxSubscription();
        this.getData();
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.wiedereingliederung.ausgangslageErfassen' });
    }

    setRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = +params['stesId'];
        });
    }

    configureToolbox() {
        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    getToolboxSubscription(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin<CodeDTO[], CodeDTO[], CodeDTO[], CodeDTO[], BaseResponseWrapperStesRahmenfristDTOWarningMessages>([
            this.dataRestService.getCode(DomainEnum.STESVERMITTELBARKEIT),
            this.dataRestService.getCode(DomainEnum.STESQUALIFIKATIONSBEDARF),
            this.dataRestService.getCode(DomainEnum.STESHANDLUNGSBEDARF),
            this.dataRestService.getCode(DomainEnum.STESPRIORITAET),
            this.dataRestService.getRahmenfrist(this.stesId)
        ]).subscribe(
            ([vermittelbarkeitOptions, qualifikationsbedarfOptions, handlungsbedarfOptions, priorityOptions, rahmenfristRes]) => {
                this.formData = {
                    vermittelbarkeitOptions,
                    qualifikationsbedarfOptions,
                    handlungsbedarfOptions,
                    priorityOptions,
                    rahmenfristDTO: rahmenfristRes.data,
                    stesId: this.stesId
                };

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    getSidenavCloseSub(): Subscription {
        return this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                if (message.data.label === this.facade.translateService.instant(WidereingliederungLabels.AUSGANGSLAGE_ERFASSEN)) {
                    this.cancel();
                }
            }
        });
    }

    cancel() {
        this.router.navigate([`./${StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN}`], { relativeTo: this.route.parent });
    }

    reset() {
        this.formComponent.reset();
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.formComponent.formGroup.invalid) {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.formComponent.ngForm.onSubmit(undefined);
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.facade.spinnerService.activate(this.channel);
        const ausgangslageDTO = this.formComponent.mapToDTO();
        this.dataRestService.createAusgangslage(ausgangslageDTO, this.facade.translateService.currentLang).subscribe(
            ausgangslage => {
                if (ausgangslage.data) {
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    this.formComponent.formGroup.markAsPristine();
                    this.formComponent.tableModified = false;
                    this.router.navigate([`../bearbeiten`], {
                        queryParams: { ausgangslageId: ausgangslage.data.stesAusgangslageID },
                        relativeTo: this.route
                    });
                } else {
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                }
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    canDeactivate() {
        return this.formComponent.formGroup.dirty || this.formComponent.tableModified;
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.toolboxSubscription.unsubscribe();
        this.sidenavCloseSub.unsubscribe();
        this.facade.navigationService.hideNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_ERFASSEN);
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
