import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormUtilsService, GenericConfirmComponent, RoboHelpService } from '@app/shared';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { MatchingWizardService } from '@app/shared/components/new/avam-wizard/matching-wizard.service';
import { ZuweisungCodeEnum } from '@app/shared/enums/domain-code/zuweisung-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { BaseResponseWrapperZuweisungOsteErfassenParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperZuweisungOsteErfassenParamDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { ZuweisungOsteErfassenParamDTO } from '@app/shared/models/dtos-generated/zuweisungOsteErfassenParamDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';

@Component({
    selector: 'avam-matching-vermittlung-fertigstellen',
    templateUrl: './matching-vermittlung-fertigstellen.component.html',
    styleUrls: ['./matching-vermittlung-fertigstellen.component.scss']
})
export class MatchingVermittlungFertigstellenComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('vmtverantwortung') vmtverantwortung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    isStes: boolean;
    vermittlungChannel = 'matching-vermittlung-fertigstellen';
    vermittlungToolboxId = 'matching-vermittlung-fertigstellen';
    permissions: typeof Permissions = Permissions;

    toolboxClickSubscription: Subscription;
    langChangeSubscription: Subscription;

    vermittlungForm: FormGroup;
    zuweisungZuLetzterAG: boolean;
    zuweisungFreigeben: boolean;
    vermittlungsartId: number;
    startIndex: string;
    calendarDisabled: boolean;
    radioValueCodeId: number;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    labels = [];
    radioButtonOptions = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private dataService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private notificationService: NotificationService,
        private obliqueHelper: ObliqueHelperService,
        private resetDialogService: ResetDialogService,
        private router: Router,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private translateService: TranslateService,
        private wizardService: MatchingWizardService,
        private roboHelpService: RoboHelpService,
        private formUtils: FormUtilsService
    ) {
        SpinnerService.CHANNEL = this.vermittlungChannel;
        ToolboxService.CHANNEL = this.vermittlungToolboxId;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.wizardService.selectCurrentStep(1);
        this.vermittlungForm = this.createFormGroup();
        this.preparePage();
        this.getData();
    }

    ngAfterViewInit() {
        this.vmtverantwortung.appendCurrentUser();
        this.changeDetector.detectChanges();
    }

    getData() {
        this.spinnerService.activate(this.vermittlungChannel);
        forkJoin<BaseResponseWrapperZuweisungOsteErfassenParamDTOWarningMessages, CodeDTO[]>([
            this.dataService.getZuweisungOste(this.wizardService.getStesId().toString(), this.wizardService.getOsteId()),
            this.dataService.getCode(DomainEnum.VERMITTLUNGSART)
        ]).subscribe(
            ([unternehmen, radioLabels]) => {
                this.zuweisungZuLetzterAG = unternehmen.data.zuweisungZuLetzterAG;
                this.vermittlungsartId = unternehmen.data.vermittlungsartId;
                this.vermittlungForm.controls.vermittlungsArt.setValue(this.vermittlungsartId);
                this.zuweisungFreigeben = unternehmen.data.zuweisungFreigeben;

                this.radioButtonOptions = radioLabels;
                this.setRadioLabels(this.radioButtonOptions);

                this.initCalendarStatus();

                this.spinnerService.deactivate(this.vermittlungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.vermittlungChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    setRadioLabels(radioLabels: CodeDTO[]) {
        this.labels = radioLabels.map(element => this.dbTranslateService.translate(element, 'text'));
    }

    initCalendarStatus() {
        const selectedOption: CodeDTO = this.radioButtonOptions.find(element => element.codeId === this.vermittlungsartId);
        this.calendarDisabled = selectedOption.code !== ZuweisungCodeEnum.BEWERBUNGSANFORDERUNG;

        const bewerbungBis = this.vermittlungForm.controls.bewerbungBis;
        if (this.calendarDisabled) {
            bewerbungBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        } else {
            bewerbungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }
        bewerbungBis.updateValueAndValidity();
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group(
            {
                vermittlungVom: [new Date(), [Validators.required, DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx]],
                vermittlungsArt: null,
                vermittlungsverantwortung: [null, Validators.required],
                bewerbungBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                versanddatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                meldungStellenangebot: false,
                meldungStellensuchender: false
            },
            { validator: [DateValidator.rangeBetweenDatesWarning('vermittlungVom', 'bewerbungBis', 'val207'), DateValidator.val318('vermittlungVom', 'versanddatum')] }
        );
    }

    preparePage() {
        this.configureToolbox();
        this.toolboxClickSubscription = this.subscribeToToolbox();
        this.langChangeSubscription = this.subscribeToLangChange();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.vermittlungToolboxId);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                if (this.isStes) {
                    this.roboHelpService.help(StesFormNumberEnum.STES_MATCHING_VERMITTLUNG_FERTIGSTELLEN);
                } else {
                    this.roboHelpService.help(StesFormNumberEnum.OSTE_MATCHING_VERMITTLUNG_FERTIGSTELLEN);
                }
            }
        });
    }

    subscribeToLangChange(): Subscription {
        return this.translateService.onLangChange.subscribe(() => {
            this.setRadioLabels(this.radioButtonOptions);
        });
    }

    movePrevious() {
        this.wizardService.navigateStep1();
    }

    cancel() {
        this.wizardService.navigateToMatching();
    }

    reset() {
        this.fehlermeldungenService.closeMessage();
        if (this.vermittlungForm.dirty) {
            this.resetDialogService.reset(() => {
                this.vermittlungForm.reset({ vermittlungVom: new Date() });
                this.vmtverantwortung.appendCurrentUser();
                this.vermittlungForm.controls.vermittlungsArt.setValue(this.startIndex);
                document.getElementById(this.startIndex).click();
            });
        }
    }

    processSave() {
        if (this.zuweisungZuLetzterAG) {
            const options: any = { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' };
            const modalRef = this.modalService.open(GenericConfirmComponent, options);
            modalRef.result.then(result => {
                if (result) {
                    this.save();
                }
            });
            modalRef.componentInstance.promptLabel = 'common.label.stellensuchenden';
            modalRef.componentInstance.primaryButton = 'common.button.vermitteln';
            return;
        }

        this.save();
    }

    save() {
        this.fehlermeldungenService.closeMessage();

        if (this.vermittlungForm.invalid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.spinnerService.activate(this.vermittlungChannel);
        this.dataService.createZuweisung(this.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.vermittlungForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.wizardService.navigateToVermittlung(response.data.zuweisungId);
                }
                this.spinnerService.deactivate(this.vermittlungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                this.spinnerService.deactivate(this.vermittlungChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    mapToDTO(): ZuweisungOsteErfassenParamDTO {
        const profilvergleich = this.wizardService.getProfilvergleich();
        return {
            stesId: this.wizardService.getStesId(),
            osteId: this.wizardService.getOsteId(),
            bewerbungBisDate: this.formUtils.parseDate(this.vermittlungForm.controls.bewerbungBis.value),
            zuweisungVomDate: this.formUtils.parseDate(this.vermittlungForm.controls.vermittlungVom.value),
            versanddatum: this.formUtils.parseDate(this.vermittlungForm.controls.versanddatum.value),
            meldungBeiAbmeldungStes: this.vermittlungForm.controls.meldungStellensuchender.value,
            meldungBeiAbmeldungOste: this.vermittlungForm.controls.meldungStellenangebot.value,
            vermittlungsartId: this.vermittlungForm.controls.vermittlungsArt.value ? this.vermittlungForm.controls.vermittlungsArt.value : this.radioValueCodeId,
            versionBean: profilvergleich.versionBean,
            osteProfilId: profilvergleich.osteProfilId,
            stesProfilId: profilvergleich.stesProfilId
        };
    }

    checkedRadioButton(index: number): boolean {
        this.startIndex = this.radioButtonOptions[index].code;
        this.radioValueCodeId = this.radioButtonOptions[index].codeId;
        return this.vermittlungsartId === this.radioButtonOptions[index].codeId;
    }

    isRadioWithDateSelected(index) {
        const bewerbungBis = this.vermittlungForm.controls.bewerbungBis;

        if (this.radioButtonOptions[index].code !== ZuweisungCodeEnum.BEWERBUNGSANFORDERUNG) {
            bewerbungBis.reset();
            bewerbungBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.calendarDisabled = true;
        } else {
            bewerbungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.calendarDisabled = false;
        }
        bewerbungBis.updateValueAndValidity();
        this.vermittlungForm.controls.vermittlungsArt.markAsDirty();
        this.vermittlungForm.controls.vermittlungsArt.setValue(this.radioButtonOptions[index].codeId);
        this.vermittlungForm.controls.vermittlungsArt.updateValueAndValidity();
        this.vermittlungForm.markAsDirty();
    }

    ngOnDestroy() {
        this.toolboxService.resetConfiguration();
        if (this.toolboxClickSubscription) {
            this.toolboxClickSubscription.unsubscribe();
        }
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
    }
}
