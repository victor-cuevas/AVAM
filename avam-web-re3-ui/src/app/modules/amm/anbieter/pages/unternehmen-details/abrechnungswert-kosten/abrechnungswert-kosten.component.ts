import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AbrechnungDTO } from '@app/shared/models/dtos-generated/abrechnungDTO';
import { AbrechnungswertBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungswertBearbeitenParameterDTO';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbrechnungswertKostenFormComponent } from '../../../components/abrechnungswert-kosten-form/abrechnungswert-kosten-form.component';
import { AbrechnungswertService } from '../../../services/abrechnungswert.service';

@Component({
    selector: 'avam-abrechnungswert-kosten',
    templateUrl: './abrechnungswert-kosten.component.html',
    styleUrls: ['./abrechnungswert-kosten.component.scss']
})
export class AbrechnungswertKostenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('abrechnungswertForm') abrechnungswertForm: AbrechnungswertKostenFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    channel = 'abrechnungswert-kosten-page';

    formData = null;
    anbieterId: number;
    abrechnung: AbrechnungDTO;
    abrechnungswertId: number;
    abrechnungswert: AbrechnungswertDTO;
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    vertragswertTypEnum = VertragswertTypCodeEnum;

    constructor(
        private facade: FacadeService,
        private anbieterRestService: AnbieterRestService,
        private router: Router,
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private abrechnungswertService: AbrechnungswertService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.parent.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.anbieterId = +params['unternehmenId'];
        });
        this.route.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.abrechnungswertId = +params['abrechnungswertId'];
            this.getData();
        });
        this.configureToolbox();
        this.subscribeToToolbox();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.getAbrechnungswertParam(this.abrechnungswertId).subscribe(
            response => {
                if (response.data) {
                    this.setPageData(response.data);
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => this.deactivateSpinnerAndScrollToTop()
        );
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.ABRECHNUNGSWERT,
            vorlagenKategorien: [VorlagenKategorie.ABRECHNUNGSWERTDETAIL],
            entityIDsMapping: { ABRECHNUNGSWERT_ID: this.abrechnungswertId }
        };
    }

    berechnen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.checkEmptyFields();

        if (!this.abrechnungswertForm.formGroup.valid) {
            this.abrechnungswertForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.anbieterRestService.calculateAbrechnungswert(this.abrechnungswertForm.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.planundakqui.message.datenberechnet'));
                    this.formData = { ...this.formData, abrechnungswert: response.data, isCalculated: true };
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => this.deactivateSpinnerAndScrollToTop()
        );
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.checkEmptyFields();

        if (!this.abrechnungswertForm.formGroup.valid) {
            this.abrechnungswertForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.anbieterRestService.updateAbrechnungswert(this.abrechnungswertForm.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    if (response.data.abrechnungswert.abrechnungswertId !== this.abrechnungswertId) {
                        this.router.navigate([`amm/anbieter/${this.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/grunddaten`], {
                            queryParams: {
                                abrechnungswertId: response.data.abrechnungswert.abrechnungswertId,
                                lvId: this.abrechnungswert.vertragswertObject.leistungsvereinbarungObject.leistungsvereinbarungId,
                                vertragswertId: this.abrechnungswert.vertragswertObject.vertragswertId
                            }
                        });
                    } else {
                        this.setPageData(response.data);
                    }
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    canDeactivate() {
        return this.abrechnungswertForm.formGroup.dirty;
    }

    reset() {
        this.abrechnungswertForm.reset();
    }

    navigateToAbrechnung() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen/bearbeiten`], { queryParams: { abrechnungId: this.abrechnung.abrechnungId } });
    }

    updateInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.abrechnungen.kopfzeile.abrechnungswertkosten',
            hideInfobar: false
        });
        this.infopanelService.sendLastUpdate(this.abrechnungswert);
        this.infopanelService.appendToInforbar(this.panelTemplate);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.panelTemplate);
        this.infopanelService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
    }

    private setPageData(param: AbrechnungswertBearbeitenParameterDTO) {
        if (this.abrechnungswertService.readonlyMode) {
            param.enabledActions = [];
            param.enabledFields = [];
        }
        this.formData = param;
        this.abrechnung = param.abrechnung;
        this.abrechnungswert = param.abrechnungswert;
        this.buttons.next(param.enabledActions);
        this.updateInfopanel();
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private checkEmptyFields() {
        if (!this.abrechnungswertForm.formGroup.controls.gesamtKosten.value) {
            this.abrechnungswertForm.formGroup.patchValue({ gesamtKosten: 0.0 });
        }
        if (!this.abrechnungswertForm.formGroup.controls.faelligAm.value) {
            this.abrechnungswertForm.formGroup.patchValue({ faelligAm: this.facade.formUtilsService.parseDate(this.formData.abrechnungswert.faelligkeitDatum) });
        }
    }
}
