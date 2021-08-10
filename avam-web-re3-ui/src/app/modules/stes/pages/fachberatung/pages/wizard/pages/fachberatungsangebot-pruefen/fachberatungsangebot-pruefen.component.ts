import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { RoboHelpService, ToolboxService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FachberatungWizardService } from '@app/shared/components/new/avam-wizard/fachberatung-wizard.service';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { FachberatungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { BaseResponseWrapperFachberatungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperFachberatungParamDTOWarningMessages';
import { FachberatungParamDTO } from '@app/shared/models/dtos-generated/fachberatungParamDTO';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';

@Component({
    selector: 'avam-fachberatungsangebot-pruefen',
    templateUrl: './fachberatungsangebot-pruefen.component.html'
})
export class FachberatungsangebotPruefenComponent implements OnInit, OnDestroy {
    stesId: number;
    fachberatungsangebotId: any;
    fachberatungsangebotChannel = 'fachberatungsangebot-pruefen';
    fachberatungsangebotToolboxId = 'fachberatungsangebot-pruefen';

    fachberatungsangebotForm: FormGroup;
    fachberatungsangebot: FachberatungParamDTO;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    langChangeSubscription: Subscription;
    toolboxClickActionSub: Subscription;
    stesHeader: StesHeaderDTO;

    constructor(
        private spinnerService: SpinnerService,
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private dbTranslateService: DbTranslateService,
        private dataService: StesDataRestService,
        private translateService: TranslateService,
        private toolboxService: ToolboxService,
        private wizardService: FachberatungWizardService,
        private stesInfobarService: AvamStesInfoBarService,
        private roboHelpService: RoboHelpService
    ) {
        SpinnerService.CHANNEL = this.fachberatungsangebotChannel;
        ToolboxService.CHANNEL = this.fachberatungsangebotToolboxId;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.fachberatungsangebotPruefen' });
        this.setStesId();
        this.setFachberatungsangebotId();
        this.createForm();
        this.subscribeToLangChange();
        this.loadFachberatungsangebot();
        this.wizardService.selectCurrentStep(1);
        this.configureToolbox();
        this.toolboxClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.FACHBERATUNGSANGEBOT_PRUEFEN);
            }
        });
    }

    setStesId() {
        this.route.parent.params.subscribe(parentData => {
            if (parentData && parentData['stesId']) {
                this.stesId = parentData['stesId'];
            }
        });
    }

    configureToolbox() {
        const toolboxConfig = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true), new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)];
        this.toolboxService.sendConfiguration(toolboxConfig, this.fachberatungsangebotToolboxId, null, false);
    }

    setFachberatungsangebotId() {
        this.route.params.subscribe(params => {
            this.fachberatungsangebotId = params['fachberatungsangebotId'];
        });
    }

    createForm() {
        this.fachberatungsangebotForm = this.formBuilder.group({
            beratungsbereich: null,
            bezeichnung: null,
            angebotsNr: null,
            zielpublikum: null,
            initialisierung: null,
            leistung: null
        });
    }

    mapToForm(data: FachberatungParamDTO) {
        let map = {};

        if (data) {
            map = {
                beratungsbereich: this.dbTranslateService.translate(data.fachberatungsbereichObject, 'text'),
                bezeichnung: data.bezeichnung,
                angebotsNr: data.angebotsNr,
                zielpublikum: data.zielpublikum,
                initialisierung: data.initialisierung,
                leistung: data.leistung
            };
        }

        return map;
    }

    loadFachberatungsangebot() {
        this.spinnerService.activate(this.fachberatungsangebotChannel);

        forkJoin<BaseResponseWrapperFachberatungParamDTOWarningMessages, StesHeaderDTO>([
            this.dataService.getFachberatungsangebotParam(this.fachberatungsangebotId, this.translateService.currentLang),
            this.dataService.getStesHeader(this.stesId.toString(), this.translateService.currentLang)
        ]).subscribe(
            ([fachberatungsangebot, stesHeader]) => {
                this.stesHeader = stesHeader;

                this.fachberatungsangebot = fachberatungsangebot.data;
                this.wizardService.setFachberatungsangebot(this.fachberatungsangebot);
                this.fachberatungsangebotForm.setValue(this.mapToForm(fachberatungsangebot.data));

                this.spinnerService.deactivate(this.fachberatungsangebotChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.fachberatungsangebotChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.fachberatungsangebotForm.setValue(this.mapToForm(this.fachberatungsangebot));
        });
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        this.langChangeSubscription.unsubscribe();
        if (this.toolboxClickActionSub) {
            this.toolboxClickActionSub.unsubscribe();
        }
    }

    back() {
        this.wizardService.navigateStep1();
    }

    next() {
        this.router.navigate([`/stes/${this.stesId}/${FachberatungPaths.FACHBERATUNG_ERFASSEN}/step3/fachberatungsangebot/${this.fachberatungsangebotId}`]);
    }

    cancel() {
        this.wizardService.navigateZuwFachberatungen();
    }
}
