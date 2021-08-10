import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormUtilsService, GenericConfirmComponent, RoboHelpService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FachberatungWizardService } from '@app/shared/components/new/avam-wizard/fachberatung-wizard.service';
import { FbStatusCodeEnum } from '@app/shared/enums/domain-code/fb-status-code.enum';
import { ZustaendigkeitsbereichCodeEnum } from '@app/shared/enums/domain-code/zustaendigkeitsbereich-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { FachberatungPaths } from '@app/shared/enums/stes-navigation-paths.enum';

import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FachberatungsangebotViewDTO } from '@app/shared/models/dtos-generated/fachberatungsangebotViewDTO';
import { FachberatungSuchenParamDTO } from '@app/shared/models/dtos-generated/fachberatungSuchenParamDTO';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { FacadeService } from '@shared/services/facade.service';
@Component({
    selector: 'avam-fachberatungsangebot-suchen',
    templateUrl: './fachberatungsangebot-suchen.component.html',
    styleUrls: ['./fachberatungsangebot-suchen.component.scss'],
    providers: [ObliqueHelperService]
})
export class FachberatungsangebotSuchenComponent implements OnInit, OnDestroy {
    fachberatungsangebotChannel = 'fachberatungsangebot-table';

    dataSource = [];
    beratungsbereichOptionsLabels = [];
    zustaendigkeitsbereichOptionsLabels = [];
    zustaendigkeitsbereichDefaultValue;
    stesId;
    statusId;
    selectedFachberatungsangebotId;
    resultCount = null;
    fachberatungsangebotToolboxId = 'fachberatungsangebot-table';
    toolboxClickActionSub: Subscription;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    stesHeader: StesHeaderDTO;

    searchFormData: FormGroup;

    langChangeSubscription: Subscription;

    permissions: typeof Permissions = Permissions;

    constructor(
        private formBuilder: FormBuilder,
        private obliqueHelper: ObliqueHelperService,
        private route: ActivatedRoute,
        private router: Router,
        private dbTranslateSerivce: DbTranslateService,
        private dataService: StesDataRestService,
        private spinnerService: SpinnerService,
        private facade: FacadeService,
        private fehlermeldungenService: FehlermeldungenService,
        private toolboxService: ToolboxService,
        private readonly modalService: NgbModal,
        private wizardService: FachberatungWizardService,
        private translateService: TranslateService,
        private resetDialogService: ResetDialogService,
        private roboHelpService: RoboHelpService,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        SpinnerService.CHANNEL = this.fachberatungsangebotChannel;
        ToolboxService.CHANNEL = this.fachberatungsangebotToolboxId;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.fachberatungsangebote' });
        this.setStesId();
        this.createForm();
        this.loadData();
        this.configureToolbox();
        this.toolboxClickActionSub = this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.wizardService.selectCurrentStep(0);
        if (this.wizardService.getSearchForm()) {
            this.searchFormData.reset(this.wizardService.getSearchForm().value);
        }
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        if (this.toolboxClickActionSub) {
            this.toolboxClickActionSub.unsubscribe();
        }
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        this.fehlermeldungenService.closeMessage();
    }

    setStesId() {
        this.route.parent.params.subscribe(parentData => {
            if (parentData && parentData['stesId']) {
                this.stesId = parentData['stesId'];
            }
        });
    }

    itemSelected(data) {
        this.selectedFachberatungsangebotId = data.fachberatungsangebotId;
        if (data.istIdentischeZuweisungVorhanden) {
            this.wizardService.setIdentischeZuweisungVorhanden(true);
            this.openModal(GenericConfirmComponent, 'modal-basic-title');
            return;
        }
        this.wizardService.setIdentischeZuweisungVorhanden(false);

        this.navigateToNextStep();
    }

    navigateToNextStep() {
        this.wizardService.setFachberatungsangebotId(this.selectedFachberatungsangebotId);
        this.wizardService.navigateStep2();
    }

    openModal(content, windowClass) {
        const modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass, backdrop: 'static' });
        modalRef.result.then(
            result => {
                this.navigateToNextStep();
            },
            reason => {
                ToolboxService.CHANNEL = this.fachberatungsangebotToolboxId;
            }
        );
        modalRef.componentInstance.promptLabel = 'stes.message.zuweisungfb.identischezuweisungvorhanden';
        modalRef.componentInstance.primaryButton = 'common.button.ok';
        modalRef.componentInstance.secondaryButton = 'common.button.abbrechen';
    }

    getFachberatungsangebote() {
        this.fehlermeldungenService.closeMessage();
        if (!this.searchFormData.valid || !this.stesId) {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            return;
        }

        this.spinnerService.activate(this.fachberatungsangebotChannel);
        this.dataService.getFachberatungsangebote(this.mapToDTO()).subscribe(
            fachberatungsangebote => {
                this.dataSource = fachberatungsangebote.data
                    .map((element: FachberatungsangebotViewDTO) => this.createFachberatungsangebotViewRow(element))
                    .sort((v1, v2) => (v1.angebotnr < v2.angebotnr ? 1 : v1.angebotnr > v2.angebotnr ? -1 : 0));
                this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.fachberatungsangebote', tableCount: this.dataSource.length });
                this.spinnerService.deactivate(this.fachberatungsangebotChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.fachberatungsangebotChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    search() {
        this.wizardService.setSearchForm(this.searchFormData);
        this.getFachberatungsangebote();
    }

    loadData() {
        this.spinnerService.activate(this.fachberatungsangebotChannel);
        forkJoin<CodeDTO[], CodeDTO[], CodeDTO, StesHeaderDTO>([
            this.dataService.getCode(DomainEnum.BERATUNGSBEREICH),
            this.dataService.getCode(DomainEnum.ZUSTAENDIGKEITSREGION),
            this.dataService.codeSearch(DomainEnum.STATUS_FB, FbStatusCodeEnum.FB_STATUS_AKTIV),
            this.dataService.getStesHeader(this.stesId, this.translateService.currentLang)
        ]).subscribe(
            ([beratungsbereich, zustaendigkeitsbereich, statusId, stesHeader]) => {
                this.stesHeader = stesHeader;
                this.beratungsbereichOptionsLabels = this.facade.formUtilsService.mapDropdownKurztext(beratungsbereich);
                this.zustaendigkeitsbereichOptionsLabels = this.facade.formUtilsService.mapDropdownKurztext(zustaendigkeitsbereich);
                this.statusId = statusId.codeId;
                if (this.wizardService.getSearchForm()) {
                    this.getFachberatungsangebote();
                } else {
                    this.zustaendigkeitsbereichDefaultValue = this.facade.formUtilsService.getCodeIdByCode(
                        zustaendigkeitsbereich,
                        ZustaendigkeitsbereichCodeEnum.EIGENE_VOLLZUGSREGION
                    );
                    this.searchFormData.patchValue({ zustaendigkeitsBereichId: this.zustaendigkeitsbereichDefaultValue });
                }

                this.spinnerService.deactivate(this.fachberatungsangebotChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.fachberatungsangebotChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    createFachberatungsangebotViewRow(row: FachberatungsangebotViewDTO): any {
        return {
            fachberatungsangebotId: row.fachberatungsangebotId,
            beratungsbereich: this.dbTranslateSerivce.translate(row, 'fachberatungsbereichText'),
            bezeichnung: row.bezeichnung,
            angebotnr: row.angebotNr.toString(),
            fachberatungsstelle: this.extractFachberatungsstelle(row),
            strasse: `${row.unternehmenStrasse} ${row.unternehmenHausNummer}`,
            plzOrt: `${row.unternehmenPlz} ${this.dbTranslateSerivce.translate(row, 'unternehmenOrt')}`,
            istIdentischeZuweisungVorhanden: row.istIdentischeZuweisungVorhanden
        };
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            if (this.resultCount !== null) {
                // this prevents going inside on page refresh on IE
                this.getFachberatungsangebote();
            }
        });
    }

    extractFachberatungsstelle(row: FachberatungsangebotViewDTO): string {
        const unternehmenName1 = row.unternehmenName1 ? row.unternehmenName1 : '';
        const unternehmenName2 = row.unternehmenName2 ? row.unternehmenName2 : '';
        const unternehmenName3 = row.unternehmenName3 ? row.unternehmenName3 : '';
        return `${unternehmenName1} ${unternehmenName2} ${unternehmenName3}`;
    }

    createForm() {
        this.searchFormData = this.formBuilder.group({
            beratungsBereichId: [''],
            bezeichnung: [''],
            angebotsNr: ['', NumberValidator.isPositiveInteger],
            zustaendigkeitsBereichId: [''],
            fachberatungsstelle: null,
            angebotsverantwortungen: null,
            status: null
        });
    }

    cancel() {
        this.router.navigate([`stes/details/${this.stesId}/${FachberatungPaths.FACHBERATUNGEN}`]);
    }

    reset() {
        if (this.searchFormData.dirty) {
            this.resetDialogService.reset(() => {
                this.searchFormData.reset();
                this.searchFormData.patchValue({ zustaendigkeitsBereichId: this.zustaendigkeitsbereichDefaultValue });
                this.fehlermeldungenService.closeMessage();
                this.dataSource = [];
            });
        }
    }

    mapToDTO(): FachberatungSuchenParamDTO {
        return {
            stesId: this.stesId,
            beratungsBereichId: this.searchFormData.controls.beratungsBereichId.value,
            bezeichnung: this.searchFormData.controls.bezeichnung.value,
            angebotsNr: this.searchFormData.controls.angebotsNr.value,
            zustaendigkeitsBereichId: this.searchFormData.controls.zustaendigkeitsBereichId.value,
            statusId: this.statusId,
            unternehmenId:
                this.searchFormData.controls.fachberatungsstelle['unternehmenAutosuggestObject'].unternehmenId !== -1
                    ? this.searchFormData.controls.fachberatungsstelle['unternehmenAutosuggestObject'].unternehmenId
                    : null,
            unternehmenText: this.searchFormData.controls.fachberatungsstelle['unternehmenAutosuggestObject'].name1
        };
    }

    configureToolbox() {
        const toolboxConfig = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true), new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)];
        this.toolboxService.sendConfiguration(toolboxConfig, this.fachberatungsangebotToolboxId, null, false);
    }

    subscribeToToolbox() {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.FACHBERATUNGSANGEBOT_SUCHEN);
            }
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true }).result.then(
            result => {
                ToolboxService.CHANNEL = this.fachberatungsangebotToolboxId;
            },
            reason => {}
        );
    }
}
