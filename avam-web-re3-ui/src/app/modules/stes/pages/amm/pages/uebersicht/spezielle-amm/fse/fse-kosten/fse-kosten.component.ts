import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { NavigationService } from '@app/shared/services/navigation-service';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolboxService, FormUtilsService } from '@app/shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { Subscription, Subject, forkJoin, iif } from 'rxjs';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { SpinnerService, NotificationService, Unsubscribable } from 'oblique-reactive';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { AmmKostenFseDTO } from '@app/shared/models/dtos-generated/ammKostenFseDTO';
import { TranslateService } from '@ngx-translate/core';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmFseBerechnenModusCode } from '@app/shared/enums/domain-code/amm-fse-berechnen-modus-code.enum';
import { BaseResponseWrapperAmmKostenFseDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmKostenFseDTOWarningMessages';
import { BaseResponseWrapperAmmGesuchFseDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmGesuchFseDTOWarningMessages';
import { AmmGesuchFseDTO } from '@app/shared/models/dtos-generated/ammGesuchFseDTO';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { takeUntil } from 'rxjs/operators';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AmmGesuchDTO } from '@app/shared/models/dtos-generated/ammGesuchDTO';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-fse-kosten',
    templateUrl: './fse-kosten.component.html',
    styleUrls: ['./fse-kosten.component.scss'],
    providers: [ObliqueHelperService]
})
export class FseKostenComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof FseKostenComponent
     */
    fseKostenForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof FseKostenComponent
     */
    channel = 'fse-kosten-channel';

    fseKostenData: AmmKostenFseDTO;
    geschaeftsfallId: number;
    fseAmmEntscheidId: number;
    fseAmmKostenId: number;
    berechnenTypOptions: any[] = [];

    observeClickActionSub: Subscription;

    fseKostenButtons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;

    disableFieldsByEntscheidStatus = false;
    basisNr: number;
    entscheidNr: number;

    constructor(
        private navigationService: NavigationService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService,
        private spinnerService: SpinnerService,
        private ammDataService: AmmRestService,
        private dataRestService: StesDataRestService,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private resetDialogService: ResetDialogService,
        protected facade: FacadeService,
        private obliqueHelper: ObliqueHelperService,
        private ammHelper: AmmHelper,
        private stesInfobarService: AvamStesInfoBarService,
        private messageBus: MessageBus,
        protected router: Router,
        protected interactionService: StesComponentInteractionService,
        private dbTranslateService: DbTranslateService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.ammEntscheidTypeCode = AmmMassnahmenCode.FSE;
    }

    /**
     * Init FseKostenComponent
     *
     * @memberof FseKostenComponent
     */
    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesAmm.fseKostenHeader' });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.fseAmmEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
        });

        this.setSideNavigation();
        this.fseKostenForm = this.createFormGroup();
        this.getData();
        super.ngOnInit();
    }

    isOurLabel(message) {
        return message.data.label === this.dbTranslateService.instant(AMMLabels.FSE);
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.FSE_GESUCH) ||
            this.router.url.includes(AMMPaths.FSE_KOSTEN) ||
            this.router.url.includes(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode))
        );
    }

    /**
     * HTTP GET call.
     *
     * @memberof FseKostenComponent
     */
    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin<BaseResponseWrapperAmmKostenFseDTOWarningMessages, CodeDTO[], BaseResponseWrapperAmmGesuchFseDTOWarningMessages>(
            //NOSONAR
            [
                this.ammDataService.getKostenFse(this.fseAmmEntscheidId),
                this.dataRestService.getCode(DomainEnum.FSE_BERECHNEN_MODUS),
                this.ammDataService.getGesuchFse(this.stesId, this.geschaeftsfallId)
            ]
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([kostenResponse, berechnenTypOptions, gesuchResponse]) => {
                    this.fseKostenButtons.next(null);
                    this.berechnenTypOptions = this.facade.formUtilsService.mapDropdownKurztext(berechnenTypOptions);

                    if (kostenResponse.data) {
                        this.fseKostenData = kostenResponse.data;
                        this.fseAmmKostenId = this.fseKostenData.ammKostenId;

                        this.ammDataService.getButtonsKostenFse(this.fseAmmEntscheidId).subscribe(btnResponse => {
                            this.fseKostenButtons.next(btnResponse.data);
                        });

                        this.fseKostenForm.reset(this.mapToForm(this.fseKostenData));

                        if (gesuchResponse.data) {
                            this.disableFieldsByEntscheidStatus = this.setDisableFieldsByEntscheidStatus(gesuchResponse.data);
                            this.basisNr = gesuchResponse.data.ammGeschaeftsfallObject.basisNr;
                            this.entscheidNr = this.getEntscheidNr(gesuchResponse.data);
                            this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
                        }

                        if (this.fseAmmKostenId) {
                            this.stesInfobarService.sendLastUpdate(this.fseKostenData);
                        }

                        this.ammHelper.setAdditionalAmmKostenErrors(kostenResponse.data);
                    }

                    this.configureToolbox();
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                }
            );
    }

    mapToForm(fseKostenData: AmmKostenFseDTO) {
        return {
            planungsbeginnGesuch: this.facade.formUtilsService.parseDate(fseKostenData.planungsbeginnGesuch),
            planungsendeGesuch: this.facade.formUtilsService.parseDate(fseKostenData.planungsendeGesuch),
            berechnungsmodus: this.setBerechnungsmodus(),
            ausrichtungVon: this.facade.formUtilsService.parseDate(fseKostenData.ausrichtungVon),
            ausrichtungBis: this.facade.formUtilsService.parseDate(fseKostenData.ausrichtungBis),
            anzahlArbeitstage: fseKostenData.anzahlArbeitstage
        };
    }

    /**
     * Check for invalid fields.
     *
     * @memberof FseKostenComponent
     */
    checkFormValid() {
        this.fehlermeldungenService.closeMessage();
        const isValid = this.fseKostenForm.valid;

        if (!isValid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }

        return isValid;
    }

    /**
     * Trigger onSave when form is valid.
     *
     * @memberof FseKostenComponent
     */
    onSave() {
        if (this.checkFormValid()) {
            this.spinnerService.activate(this.channel);

            const kostenToSave = this.mapToDTO();
            const update = this.ammDataService.updateKostenFse(kostenToSave);
            const create = this.ammDataService.createKostenFse(kostenToSave);

            iif(() => (this.fseKostenData.ammKostenId ? true : false), update, create).subscribe(
                response => {
                    this.fseKostenButtons.next(null);

                    this.ammDataService.getButtonsKostenFse(this.fseAmmEntscheidId).subscribe(btnResponse => {
                        this.fseKostenButtons.next(btnResponse.data);
                    });

                    if (response.data) {
                        this.fseKostenData = response.data;
                        this.fseAmmKostenId = this.fseKostenData.ammKostenId;
                        this.fseKostenForm.reset(this.mapToForm(this.fseKostenData));
                        this.stesInfobarService.sendLastUpdate(this.fseKostenData);
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        this.ammHelper.setAdditionalAmmKostenErrors(response.data);
                    } else {
                        this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                    }

                    this.configureToolbox();
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }
            );
        }
    }

    mapToDTO() {
        const fseKostenDataToSave = { ...this.fseKostenData };

        fseKostenDataToSave.berechnungsmodusObject = this.berechnenTypOptions.find(option => option.codeId === +this.fseKostenForm.controls.berechnungsmodus.value) as CodeDTO;
        fseKostenDataToSave.ausrichtungVon = this.facade.formUtilsService.parseDate(this.fseKostenForm.controls.ausrichtungVon.value);
        fseKostenDataToSave.ausrichtungBis = this.facade.formUtilsService.parseDate(this.fseKostenForm.controls.ausrichtungBis.value);
        fseKostenDataToSave.anzahlArbeitstage = this.fseKostenForm.controls.anzahlArbeitstage.value;

        return fseKostenDataToSave;
    }

    onBerechnen() {
        if (this.checkFormValid()) {
            this.spinnerService.activate(this.channel);

            this.ammDataService.berechnenKostenFse(this.mapToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.fseKostenData = response.data;
                        this.fseKostenForm.setValue(this.mapToForm(this.fseKostenData));
                        this.ammHelper.setAdditionalAmmKostenErrors(response.data);
                    }

                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                }
            );
        }
    }

    onReset() {
        if (this.fseKostenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.getData();
            });
        }
    }

    createFormGroup() {
        return this.formBuilder.group(
            {
                planungsbeginnGesuch: null,
                planungsendeGesuch: null,
                berechnungsmodus: [null, Validators.required],
                ausrichtungVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                ausrichtungBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                anzahlArbeitstage: null
            },
            {
                validator: [DateValidator.rangeBetweenDates('ausrichtungVon', 'ausrichtungBis', 'val202', false, true)]
            }
        );
    }

    setRequiredFields(berechnenCodeId) {
        const selectedOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.berechnenTypOptions, berechnenCodeId);

        this.clearValidatorsOnRequiredFields();

        switch (selectedOptionCode) {
            case AmmFseBerechnenModusCode.ARBEITSTAGEAUSDATUMSBEREICH:
                this.fseKostenForm.controls.ausrichtungVon.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
                this.fseKostenForm.controls.ausrichtungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
                break;

            case AmmFseBerechnenModusCode.PLANUNGSENDE:
                this.fseKostenForm.controls.ausrichtungVon.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
                this.fseKostenForm.controls.anzahlArbeitstage.setValidators(Validators.required);
                break;

            case AmmFseBerechnenModusCode.PLANUNGSBEGINN:
                this.fseKostenForm.controls.ausrichtungBis.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
                this.fseKostenForm.controls.anzahlArbeitstage.setValidators(Validators.required);

                break;
        }

        this.updateValueAndValidityOnRequiredFields();
    }

    canDeactivate(): boolean {
        return this.fseKostenForm.dirty;
    }

    /**
     * Set side navigation for this component
     *
     * @memberof FseKostenComponent
     */
    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.fseAmmEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.FSE_GESUCH, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.fseAmmEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.FSE_KOSTEN, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.fseAmmEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.fseAmmEntscheidId
        });
    }

    /**
     * A lifecycle hook that is called when the component is destroyed.
     * Place to Unsubscribe from Observables.
     *
     * @memberof FseKostenComponent
     */
    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
        super.ngOnDestroy();
    }

    private deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        if (this.fseAmmKostenId) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        }

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId));

        if (!this.observeClickActionSub) {
            this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.fseAmmKostenId, AvamCommonValueObjectsEnum.T_AMM_KOSTEN_FSE);
                }
            });
        }
    }

    private openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }

    private updateValueAndValidityOnRequiredFields() {
        this.fseKostenForm.controls.ausrichtungVon.updateValueAndValidity();
        this.fseKostenForm.controls.ausrichtungBis.updateValueAndValidity();
        this.fseKostenForm.controls.anzahlArbeitstage.updateValueAndValidity();
    }

    private clearValidatorsOnRequiredFields() {
        this.fseKostenForm.controls.anzahlArbeitstage.clearValidators();

        // set default validators
        this.fseKostenForm.controls.ausrichtungVon.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.fseKostenForm.controls.ausrichtungBis.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
    }

    private setBerechnungsmodus() {
        let berechnungsmodusCodeId;

        if (this.fseKostenData.berechnungsmodusObject) {
            berechnungsmodusCodeId = this.fseKostenData.berechnungsmodusObject.codeId;
        } else {
            berechnungsmodusCodeId = this.facade.formUtilsService.getCodeIdByCode(this.berechnenTypOptions, AmmFseBerechnenModusCode.ARBEITSTAGEAUSDATUMSBEREICH);
        }

        return berechnungsmodusCodeId;
    }

    private setDisableFieldsByEntscheidStatus(gesuchData: AmmGesuchFseDTO) {
        let statusCode: string;

        if (gesuchData.ammGeschaeftsfallObject && gesuchData.ammGeschaeftsfallObject.allAmmEntscheid) {
            const allAmmEntscheidArray = gesuchData.ammGeschaeftsfallObject.allAmmEntscheid;

            allAmmEntscheidArray.forEach(element => {
                if (element.ammEntscheidId === this.fseKostenData.ammEntscheidId) {
                    statusCode = element.statusObject.code;
                }
            });
        }

        const disableByEntscheidStatus =
            statusCode === AmmVierAugenStatusCode.ERSETZT || statusCode === AmmVierAugenStatusCode.FREIGEGEBEN || statusCode === AmmVierAugenStatusCode.FREIGABEBEREIT;

        return disableByEntscheidStatus;
    }

    private getEntscheidNr(gesuchData: AmmGesuchDTO) {
        let entscheidNr: number;

        if (gesuchData.ammGeschaeftsfallObject && gesuchData.ammGeschaeftsfallObject.allAmmEntscheid) {
            const allAmmEntscheidArray = gesuchData.ammGeschaeftsfallObject.allAmmEntscheid;

            allAmmEntscheidArray.forEach(element => {
                if (element.ammEntscheidId === this.fseAmmEntscheidId) {
                    entscheidNr = element.entscheidNr;
                }
            });
        }

        return entscheidNr;
    }
}
