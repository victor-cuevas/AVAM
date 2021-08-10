import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { PlanwertDDTO } from '@app/shared/models/dtos-generated/planwertDDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { BewPlanwertFormComponent } from '../../components';
import { BaseResponseWrapperPlanwertDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperPlanwertDTOWarningMessages';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmPlanwertStorageService } from '../../services/bew-planwerte-storage.service';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-bew-standort-planwert-erfassen',
    templateUrl: './bew-standort-planwert-erfassen.component.html',
    styleUrls: ['./bew-standort-planwert-erfassen.component.scss']
})
export class BewStandortPlanwertErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('planwertFormComponent') planwertFormComponent: BewPlanwertFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    dfeId: number;
    massnahmeId: number;
    produktId: number;
    channel = 'standort-planwert-channel';
    planwertData: PlanwertDDTO;
    unternehmen: UnternehmenDTO;
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
        this.facadeService.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT_ERFASSEN, {
            massnahmeId: this.massnahmeId,
            dfeId: this.dfeId
        });
    }

    getRouteData() {
        this.route.parent.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.dfeId = +params['dfeId'];
            this.massnahmeId = +params['massnahmeId'];
        });

        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
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
        this.bewRestService.getStandortPlanwert(this.dfeId).subscribe(res => this.handleResponse(res), () => this.deactivateSpinnerAndScrollTop());
    }

    getUnternehmen() {
        if (
            this.planwertData &&
            this.planwertData.durchfuehrungseinheitObject &&
            this.planwertData.durchfuehrungseinheitObject.massnahmeObject &&
            this.planwertData.durchfuehrungseinheitObject.massnahmeObject.ammAnbieterObject
        ) {
            return this.planwertData.durchfuehrungseinheitObject.massnahmeObject.ammAnbieterObject.unternehmen;
        }

        return undefined;
    }

    setupInfobar() {
        this.infopanelService.updateInformation({
            title: this.facadeService.dbTranslateService.translateWithOrder(this.planwertData.typ, 'text'),
            secondTitle: this.facadeService.dbTranslateService.translateWithOrder(this.planwertData.durchfuehrungseinheitObject.massnahmeObject, 'titel'),
            subtitle: 'amm.massnahmen.subnavmenuitem.planwerterfassen'
        });
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    setValidatorsOnDurchfuehrungVonBis(dto: PlanwertDDTO) {
        const gueltigVon = dto.durchfuehrungseinheitObject.gueltigVon;
        const gueltigBis = dto.durchfuehrungseinheitObject.gueltigBis;

        this.planwertFormComponent.formGroup
            .get('gueltigVon')
            .setValidators([DateValidator.isDateWithinRange(gueltigVon, gueltigBis, 'val313'), Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.planwertFormComponent.formGroup
            .get('gueltigBis')
            .setValidators([DateValidator.isDateWithinRange(gueltigVon, gueltigBis, 'val313'), Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.planwertFormComponent.formGroup.get('gueltigVon').updateValueAndValidity();
        this.planwertFormComponent.formGroup.get('gueltigBis').updateValueAndValidity();
    }

    canDeactivate(): boolean {
        return this.planwertFormComponent.formGroup.dirty;
    }

    cancel() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/standorte/standort/planwerte`], {
            queryParams: { dfeId: this.dfeId, massnahmeId: this.massnahmeId }
        });
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
            this.unternehmen = this.getUnternehmen();
            this.setValidatorsOnDurchfuehrungVonBis(this.planwertData);

            if (speichern && res.data.planwertId > 0) {
                this.planwertStorage.shouldNavigateToUebersicht = true;
                this.planwertFormComponent.formGroup.markAsPristine();
                this.facadeService.notificationService.success(this.facadeService.dbTranslateService.instant('common.message.datengespeichert'));
                this.router.navigate([`../planwert/bearbeiten`], {
                    relativeTo: this.route,
                    queryParams: {
                        massnahmeId: this.planwertData['durchfuehrungseinheitObject'].massnahmeObject.massnahmeId,
                        dfeId: this.planwertData['durchfuehrungseinheitObject'].durchfuehrungsId,
                        planwertId: this.planwertData.planwertId
                    }
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
        this.facadeService.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT_ERFASSEN);
    }
}
