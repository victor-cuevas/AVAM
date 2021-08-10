import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { BaseResponseWrapperPlanwertDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperPlanwertDTOWarningMessages';
import { PlanwertPDTO } from '@app/shared/models/dtos-generated/planwertPDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { BewPlanwertFormComponent } from '../../components';
import { AmmPlanwertStorageService } from '../../services/bew-planwerte-storage.service';

@Component({
    selector: 'avam-bew-produkt-planwert-erfassen',
    templateUrl: './bew-produkt-planwert-erfassen.component.html',
    styleUrls: ['./bew-produkt-planwert-erfassen.component.scss']
})
export class BewProduktPlanwertErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('planwertFormComponent') planwertFormComponent: BewPlanwertFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    produktId: number;
    channel = 'produkt-planwert-erfassen';
    planwertData: PlanwertPDTO;
    permissions: typeof Permissions = Permissions;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private bewRestService: BewirtschaftungRestService,
        private facadeService: FacadeService,
        private infopanelService: AmmInfopanelService,
        private planwertStorage: AmmPlanwertStorageService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteData();
        this.getData();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.subscribeToNavClose();
        this.facadeService.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT_ERFASSEN);
    }

    getRouteData() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.produktId = +params['produktId'];
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facadeService.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    subscribeToToolbox() {
        this.facadeService.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    getData() {
        this.facadeService.spinnerService.activate(this.channel);

        this.bewRestService.getProduktPlanwert(this.produktId).subscribe(res => this.handleResponse(res), () => this.deactivateSpinnerAndScrollTop());
    }

    setupInfobar() {
        this.infopanelService.updateInformation({
            title: this.facadeService.dbTranslateService.translateWithOrder(this.planwertData.typ, 'text'),
            secondTitle: this.facadeService.dbTranslateService.translateWithOrder(this.planwertData.produktObject, 'titel'),
            subtitle: 'amm.massnahmen.subnavmenuitem.planwerterfassen'
        });
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    setValidatorsOnDurchfuehrungVonBis(dto: PlanwertPDTO) {
        const gueltigVon = dto.produktObject.gueltigVon;
        const gueltigBis = dto.produktObject.gueltigBis;
        //VAL313
        this.planwertFormComponent.formGroup
            .get('gueltigVon')
            .setValidators([DateValidator.isDateWithinRange(gueltigVon, gueltigBis, 'val278'), Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.planwertFormComponent.formGroup
            .get('gueltigBis')
            .setValidators([DateValidator.isDateWithinRange(gueltigVon, gueltigBis, 'val278'), Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.planwertFormComponent.formGroup.get('gueltigVon').updateValueAndValidity();
        this.planwertFormComponent.formGroup.get('gueltigBis').updateValueAndValidity();
    }

    canDeactivate(): boolean {
        return this.planwertFormComponent.formGroup.dirty;
    }

    cancel() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/planwerte`]);
    }

    submit(type: string) {
        this.facadeService.fehlermeldungenService.closeMessage();

        if (!this.planwertFormComponent.formGroup.valid) {
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.planwertFormComponent.ngForm.onSubmit(undefined);
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        switch (type) {
            case 'berechnen':
                this.berechnen();
                break;
            case 'speichern':
                this.speichern();
                break;
            default:
                break;
        }
    }

    berechnen() {
        this.facadeService.spinnerService.activate(this.channel);
        this.bewRestService.calculatePlanwert(this.planwertFormComponent.mapToDTO()).subscribe(res => this.handleResponse(res), () => this.deactivateSpinnerAndScrollTop());
    }

    speichern() {
        this.facadeService.spinnerService.activate(this.channel);
        this.bewRestService.savePlanwert(this.planwertFormComponent.mapToDTO()).subscribe(
            res => this.handleResponse(res, true),
            () => {
                this.facadeService.notificationService.error(this.facadeService.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    handleResponse(res: BaseResponseWrapperPlanwertDTOWarningMessages, speichern = false) {
        if (res.data) {
            this.planwertData = res.data;
            this.setupInfobar();
            this.setValidatorsOnDurchfuehrungVonBis(this.planwertData);

            if (speichern && res.data.planwertId > 0) {
                this.planwertStorage.shouldNavigateToUebersicht = true;
                this.planwertFormComponent.formGroup.markAsPristine();
                this.facadeService.notificationService.success(this.facadeService.dbTranslateService.instant('common.message.datengespeichert'));
                this.router.navigate([`../planwert/bearbeiten`], {
                    relativeTo: this.route,
                    queryParams: { planwertId: this.planwertData.planwertId }
                });
            }
        }

        this.deactivateSpinnerAndScrollTop();
    }

    deactivateSpinnerAndScrollTop() {
        OrColumnLayoutUtils.scrollTop();
        this.facadeService.spinnerService.deactivate(this.channel);
    }

    subscribeToNavClose() {
        this.facadeService.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.cancel();
                }
            });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facadeService.fehlermeldungenService.closeMessage();
        this.infopanelService.resetTemplateInInfobar();
        this.facadeService.toolboxService.sendConfiguration([]);
        this.facadeService.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT_ERFASSEN);
    }
}
