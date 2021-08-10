import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AnbieterAbrechnungFormComponent } from '../../../components/anbieter-abrechnung-form/anbieter-abrechnung-form.component';
import { AbrechnungswertListeViewDTO } from '@app/shared/models/dtos-generated/abrechnungswertListeViewDTO';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { formatNumber } from '@angular/common';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxService, ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { Subject } from 'rxjs';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { AbrechnungBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungBearbeitenParameterDTO';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { TableType } from '@app/modules/amm/anbieter/components/anbieter-abrechnungswert-table/anbieter-abrechnungswert-table.component';
import { AbrechnungswertService } from '../../../services/abrechnungswert.service';

@Component({
    selector: 'avam-abrechnung-erfassen',
    templateUrl: './abrechnung-erfassen.component.html',
    styleUrls: ['./abrechnung-erfassen.component.scss']
})
export class AbrechnungErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('abrechnungForm') abrechnungForm: AnbieterAbrechnungFormComponent;

    channel = 'abrechnung-erfassen';

    anbieterId: number;
    abrechnungParam: AbrechnungBearbeitenParameterDTO;
    isAbrechnungCreated: boolean;
    dataSource = [];
    summeTotal = '';
    abrechnungswerteIds: number[];
    abrechnungswerte: AbrechnungswertListeViewDTO[];
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    tableType = TableType;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private anbieterRestService: AnbieterRestService,
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private abrechnungswertService: AbrechnungswertService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        //we should get the abrechnungswertIds if we are navigated from abrechnungswerte suchen
        this.abrechnungswerteIds = this.abrechnungswertService.getAbrechnungswertIds();
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.anbieterId = params['unternehmenId'];
            this.getData();
        });
        this.facade.navigationService.showNavigationTreeRoute('./abrechnungen/erfassen');
        this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.cancel();
            }
        });
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.dataSource = this.abrechnungswerte.map(el => this.createAbrechnungswertRow(el));
        });
        this.configureToolbox();
        this.subscribeToToolbox();
        this.infopanelService.updateInformation({
            subtitle: 'amm.abrechnungen.button.abrechnungerfassen'
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        const getAbrechnungBearbeitenParameter = this.abrechnungswerteIds.length
            ? this.anbieterRestService.initAbrechnungParamByAbrechnungswertId(this.abrechnungswerteIds)
            : this.anbieterRestService.initAbrechnungParam(this.anbieterId);

        getAbrechnungBearbeitenParameter.subscribe(
            response => {
                this.abrechnungParam = response.data;
                if (response.data) {
                    this.abrechnungswerte = response.data.abrechungswertListe ? [...response.data.abrechungswertListe] : [];
                    this.dataSource = this.abrechnungswerte.map(el => this.createAbrechnungswertRow(el));
                    this.summeTotal = formatNumber(this.abrechnungswerte.reduce((acc, obj) => acc + obj.abrechnungswertSaldoALV, 0), LocaleEnum.SWITZERLAND, '.2-2');
                    this.buttons.next(response.data.enabledActions);
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    createAbrechnungswertRow(abrechnungswert: AbrechnungswertListeViewDTO) {
        const sprachTitel = {
            titelDe: abrechnungswert.durchfuehrungseinheitTitelDe || abrechnungswert.massnahmeTitelDe,
            titelFr: abrechnungswert.durchfuehrungseinheitTitelFr || abrechnungswert.massnahmeTitelFr,
            titelIt: abrechnungswert.durchfuehrungseinheitTitelIt || abrechnungswert.massnahmeTitelIt
        };
        return {
            abrechnungswertId: abrechnungswert.abrechnungswertId,
            abrechnungswertNr: abrechnungswert.abrechnungswertNr || '',
            saldochf: formatNumber(abrechnungswert.abrechnungswertSaldoALV, LocaleEnum.SWITZERLAND, '.2-2'),
            faelligAm: abrechnungswert.abrechnungswertFaelligkeitDatum,
            titel: this.facade.dbTranslateService.translateWithOrder(sprachTitel, 'titel') || '',
            gueltigVon: abrechnungswert.vertragswertGueltigVon,
            gueltigBis: abrechnungswert.vertragswertGueltigBis,
            profilNr: abrechnungswert.vertragswertProfilNr || ''
        };
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel);
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

    cancel() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen`]);
    }

    reset() {
        this.abrechnungForm.reset();
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        if (!this.abrechnungForm.formGroup.value.bearbeitungDurch) {
            this.abrechnungForm.appendCurrentUser();
        }

        if (!this.abrechnungForm.formGroup.valid) {
            this.abrechnungForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.anbieterRestService.saveAbrechnung(this.abrechnungForm.mapToDTO()).subscribe(
            response => {
                if (response.data && response.data.abrechnung.abrechnungId > 0) {
                    this.abrechnungForm.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    this.isAbrechnungCreated = true;
                    this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen/bearbeiten`], { queryParams: { abrechnungId: response.data.abrechnung.abrechnungId } });
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
        return this.abrechnungForm.formGroup.dirty;
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.facade.fehlermeldungenService.closeMessage();
        this.facade.navigationService.hideNavigationTreeRoute('./abrechnungen/erfassen');
        this.facade.toolboxService.sendConfiguration([]);
        if (!this.isAbrechnungCreated) {
            this.abrechnungswertService.clearAbrechnungswertService();
        }
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
