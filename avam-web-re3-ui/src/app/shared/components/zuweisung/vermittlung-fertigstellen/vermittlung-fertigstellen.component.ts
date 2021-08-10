import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { FormUtilsService, GenericConfirmComponent, RoboHelpService } from '@app/shared';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { ZuweisungWizardService } from '@shared/components/new/avam-wizard/zuweisung-wizard.service';
import { ZuweisungCodeEnum } from '@shared/enums/domain-code/zuweisung-code.enum';
import { DomainEnum } from '@shared/enums/domain.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import PrintHelper from '@shared/helpers/print.helper';
import { BaseResponseWrapperZuweisungOsteErfassenParamDTOWarningMessages } from '@dtos/baseResponseWrapperZuweisungOsteErfassenParamDTOWarningMessages';
import { CodeDTO } from '@dtos/codeDTO';
import { StesHeaderDTO } from '@dtos/stesHeaderDTO';
import { ZuweisungOsteErfassenParamDTO } from '@dtos/zuweisungOsteErfassenParamDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { DateValidator } from '@shared/validators/date-validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-vermittlung-fertigstellen',
    templateUrl: './vermittlung-fertigstellen.component.html',
    styleUrls: ['./vermittlung-fertigstellen.component.scss']
})
export class VermittlungFertigstellenComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('vmtverantwortung') vmtverantwortung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    vermittlungForm: FormGroup;
    toolboxClickSubscription: Subscription;

    vermittlungChannel = 'vermittlung-fertigstellen';
    vermittlungToolboxId = 'vermittlung-fertigstellen';
    permissions: typeof Permissions = Permissions;

    zuweisungZuLetzterAG: boolean;
    zuweisungFreigeben: boolean;
    stesHeader: StesHeaderDTO;

    labels = [];
    radioButtonOptions = [];
    langChangeSubscription: Subscription;

    vermittlungsartId: number;
    startIndex: string;

    calendarDisabled: boolean;
    radioValueCodeId: number;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    constructor(
        private formBuilder: FormBuilder,
        private wizardService: ZuweisungWizardService,
        private router: Router,
        private resetDialogService: ResetDialogService,
        private fehlermeldungenService: FehlermeldungenService,
        private spinnerService: SpinnerService,
        private route: ActivatedRoute,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private stesDataRestService: StesDataRestService,
        private notificationService: NotificationService,
        private changeDetector: ChangeDetectorRef,
        private dbTranslateService: DbTranslateService,
        private translateService: TranslateService,
        private roboHelpService: RoboHelpService,
        private formUtils: FormUtilsService,
        private obliqueHelper: ObliqueHelperService
    ) {
        SpinnerService.CHANNEL = this.vermittlungChannel;
        ToolboxService.CHANNEL = this.vermittlungToolboxId;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.createForm();
        this.configureToolbox();
        this.wizardService.selectCurrentStep(2);
        this.toolboxClickSubscription = this.subscribeToToolbox();
        this.getData();
        this.subscribeToLangChange();
    }

    ngAfterViewInit() {
        this.vmtverantwortung.appendCurrentUser();
        this.changeDetector.detectChanges();
    }

    subscribeToLangChange() {
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.getData();
        });
    }

    createForm() {
        this.vermittlungForm = this.formBuilder.group(
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

    movePrevious() {
        this.wizardService.navigateTo(2);
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.vermittlungToolboxId, null, false);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.VERMITTLUNG_FERTIGSTELLEN);
            }
        });
    }

    cancel() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.wizardService.navigateToArbeitsvermittlung();
            }
        });
        modalRef.componentInstance.titleLabel = 'common.button.vermittlungAbbrechen';
        modalRef.componentInstance.promptLabel = 'common.message.vermittlungAbbrechen';
        modalRef.componentInstance.primaryButton = 'common.button.jaAbbrechen';
        modalRef.componentInstance.secondaryButton = 'i18n.common.no';
    }

    reset() {
        this.fehlermeldungenService.closeMessage();
        if (this.vermittlungForm.dirty) {
            this.resetDialogService.reset(() => {
                this.vermittlungForm.reset({ vermittlungVom: new Date() });
                this.vmtverantwortung.appendCurrentUser();
                this.vermittlungForm.controls.vermittlungsArt.setValue(this.startIndex);
                document.getElementById(this.startIndex).click();
                this.vermittlungForm.markAsPristine();
            });
        }
    }

    save() {
        this.fehlermeldungenService.closeMessage();

        if (this.vermittlungForm.valid) {
            this.spinnerService.activate(this.vermittlungChannel);

            this.stesDataRestService.createZuweisung(this.mapToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.vermittlungForm.markAsPristine();
                        this.reset();
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        this.wizardService.navigateToBearbeiten(response.data.zuweisungId);
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
        } else {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.ngForm.onSubmit(undefined);
            OrColumnLayoutUtils.scrollTop();
        }
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

    getData() {
        this.spinnerService.activate(this.vermittlungChannel);
        forkJoin<BaseResponseWrapperZuweisungOsteErfassenParamDTOWarningMessages, CodeDTO[], StesHeaderDTO>([
            this.stesDataRestService.getZuweisungOste(this.wizardService.getStesId().toString(), this.wizardService.getOsteId()),
            this.stesDataRestService.getCode(DomainEnum.VERMITTLUNGSART),
            this.stesDataRestService.getStesHeader(this.wizardService.getStesId().toString(), this.translateService.currentLang)
        ]).subscribe(
            ([unternehmen, radioOpts, stesHeader]) => {
                this.zuweisungZuLetzterAG = unternehmen.data.zuweisungZuLetzterAG;
                this.vermittlungsartId = unternehmen.data.vermittlungsartId;
                this.vermittlungForm.controls.vermittlungsArt.setValue(this.vermittlungsartId);
                this.zuweisungFreigeben = unternehmen.data.zuweisungFreigeben;

                this.radioButtonOptions = radioOpts;
                this.labels = [];
                for (const value of radioOpts) {
                    this.labels.push(this.dbTranslateService.translate(value, 'text'));
                }

                this.stesHeader = stesHeader;

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
