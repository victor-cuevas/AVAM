import { Component, OnInit, OnDestroy } from '@angular/core';
import { SpinnerService } from 'oblique-reactive';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormUtilsService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from 'src/app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { FormBuilder, FormGroup } from '@angular/forms';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';

@Component({
    selector: 'avam-auszug',
    templateUrl: './auszug.component.html',
    styleUrls: ['./auszug.component.scss']
})
export class AuszugComponent implements OnInit, OnDestroy {
    /**
     * Current component channel.
     *
     * @memberof AuszugComponent
     */
    channel = 'ammAuszugChannel';
    auszugData = null;
    observeClickActionSub: Subscription;
    stesId: string;
    langChangeSubscription: Subscription;
    auszugForm: FormGroup;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    constructor(
        private stesDataRestService: StesDataRestService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService,
        private route: ActivatedRoute,
        private translateService: TranslateService,
        private formUtils: FormUtilsService,
        private formBuilder: FormBuilder,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.stesInfobarService.sendDataToInfobar({ title: 'stes.tooltip.ammAuszug' });

        this.initForm();
        this.getData();
        this.configureToolbox();

        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.getData();
        });
    }

    initForm() {
        this.auszugForm = this.formBuilder.group({
            letzerArbeitgeber: null,
            personalberater: null
        });
    }

    mapToForm() {
        this.auszugForm = this.formBuilder.group({
            letzerArbeitgeber:
                this.auszugData && this.auszugData.letzterArbeitgeber
                    ? {
                          unternehmenId: this.auszugData.unternehmenId,
                          burOrtEinheitId: this.auszugData.burOrtEinheitId,
                          name1: this.auszugData.letzterArbeitgeber,
                          strasse: null,
                          nummer: null,
                          plz: null,
                          ort: null
                      }
                    : null,

            personalberater: this.auszugData && this.auszugData.benutzerDetail ? this.auszugData.benutzerDetail : null
        });
    }

    /**
     * HTTP GET call.
     *
     * @memberof AuszugComponent
     */
    getData() {
        this.spinnerService.activate(this.channel);

        this.stesDataRestService.getAuszug(this.stesId, this.translateService.currentLang).subscribe(
            (response: any) => {
                this.auszugData = response;
                this.formatPercentages();
                this.setZahlungsstop();
                this.formatBerufe();
                this.mapToForm();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmAuszugUebersicht(+this.stesId));

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    /**
     * A lifecycle hook that is called when the component is destroyed.
     * Place to Unsubscribe from Observables.
     *
     * @memberof AuszugComponent
     */
    ngOnDestroy(): void {
        this.observeClickActionSub.unsubscribe();
        this.langChangeSubscription.unsubscribe();
        this.toolboxService.sendConfiguration([]);

        this.fehlermeldungenService.closeMessage();
    }

    private formatPercentages() {
        this.auszugData.versicherterVerdienst = this.formUtils.formatPercentage(this.auszugData.versicherterVerdienst, 2);
        this.auszugData.vermittlung = this.formUtils.formatPercentage(this.auszugData.vermittlung, 2);
    }

    // BSP1
    private setZahlungsstop() {
        const result = new Date() <= new Date(this.auszugData.zahlungsstoppBis) ? 'amm.abrechnungen.label.ja' : 'amm.abrechnungen.label.nein';

        this.auszugData.zahlungsstop = result;
    }

    private formatBerufe() {
        this.auszugData.erlernterBeruf = this.auszugData.erlernterBeruf.split('\n');
    }
}
