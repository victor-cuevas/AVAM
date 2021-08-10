import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ListeKopieParamDTO } from '@app/shared/models/dtos-generated/listeKopieParamDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { AmmBudgetierungRestService } from '../../services/amm-budgetierung-rest.service';
import { HttpResponseHelper } from '@app/shared/helpers/http-response.helper';
import { HttpResponse } from '@angular/common/http';
import { BudgetwertDTO } from '@app/shared/models/dtos-generated/budgetwertDTO';
import { formatNumber } from '@angular/common';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Component({
    selector: 'avam-budgetvergleich-anzeigen-modal',
    templateUrl: './budgetvergleich-anzeigen-modal.component.html',
    styleUrls: ['./budgetvergleich-anzeigen-modal.component.scss']
})
export class BudgetvergleichAnzeigenModalComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() listeKopieParam: ListeKopieParamDTO;

    formNumber = AmmFormNumberEnum.BUDGET_BUDGETVERGLEICH;
    channel = 'budgetvergleich-modal';
    previousChannel: string;
    toolboxConfiguration: ToolboxConfiguration[];

    nichtKopierteElemente: any[];
    nichtBelegteElemente: any[];
    alertChannel = AlertChannelEnum;

    constructor(
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService,
        private modalService: NgbModal,
        private budgetierungRestService: AmmBudgetierungRestService,
        private dbTranslateService: DbTranslateService
    ) {
        super();
        this.previousChannel = ToolboxService.CHANNEL;
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.fehlermeldungenService.showMessage('amm.budgetierung.feedback.budgetvergleich', 'info', AlertChannelEnum.MODAL);
        this.configureToolbox();
        this.subscribeToolbox();
        this.nichtBelegteElemente = this.listeKopieParam.nichtBelegteElemente.map(this.createBudgetwertRow);
        this.nichtKopierteElemente = this.listeKopieParam.nichtKopierteElemente.map(this.createBudgetwertRow);
    }

    configureToolbox() {
        const config = [
            new ToolboxConfiguration(ToolboxActionEnum.EXCEL, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];
        this.toolboxConfiguration = config;
    }

    subscribeToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.EXCEL) {
                    this.exportBudgetvergleich();
                } else if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
            });
    }

    close() {
        this.modalService.dismissAll();
    }

    exportBudgetvergleich() {
        this.spinnerService.activate(this.channel);

        this.budgetierungRestService.exportBudgetvergleich(this.listeKopieParam, this.dbTranslateService.getCurrentLang()).subscribe(
            (res: HttpResponse<Blob>) => {
                this.spinnerService.deactivate(this.channel);
                HttpResponseHelper.openBlob(res);
            },
            error => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    createBudgetwertRow = (data: BudgetwertDTO) => {
        return {
            institution: this.dbTranslateService.translate(data.teilbudget.institution, 'kurzText'),
            kanton: this.dbTranslateService.translate(data.teilbudget.kanton, 'name'),
            elementname: this.listeKopieParam.budgetwertPathMap[data.strukturelement.strukturelementId]
                ? this.listeKopieParam.budgetwertPathMap[data.strukturelement.strukturelementId]
                : '',
            chf: formatNumber(data.chf, LocaleEnum.SWITZERLAND),
            tntage: formatNumber(data.tnTage, LocaleEnum.SWITZERLAND),
            tn: formatNumber(data.tn, LocaleEnum.SWITZERLAND)
        };
    };

    ngOnDestroy() {
        super.ngOnDestroy();
        SpinnerService.CHANNEL = this.previousChannel;
        ToolboxService.CHANNEL = this.previousChannel;
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
    }
}
