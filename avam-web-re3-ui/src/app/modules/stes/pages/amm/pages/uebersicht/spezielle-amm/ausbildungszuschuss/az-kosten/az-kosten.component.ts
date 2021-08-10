import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { FormGroup, FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { SpinnerService, NotificationService } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmKostenAzDTO } from '@app/shared/models/dtos-generated/ammKostenAzDTO';
import { FormUtilsService } from '@app/shared';
import { forkJoin, Subscription, Subject, iif } from 'rxjs';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AmmGesuchAzDTO } from '@app/shared/models/dtos-generated/ammGesuchAzDTO';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { AmmGesuchDTO } from '@app/shared/models/dtos-generated/ammGesuchDTO';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { TranslateService } from '@ngx-translate/core';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { MessageBus } from '@app/shared/services/message-bus';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-az-kosten',
    templateUrl: './az-kosten.component.html',
    styleUrls: ['./az-kosten.component.scss'],
    providers: [ObliqueHelperService]
})
export class AzKostenComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof AzKostenComponent
     */
    kostenForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof AzKostenComponent
     */
    channel = 'az-kosten-channel';

    gesuchData: AmmGesuchAzDTO;
    azKostenData: AmmKostenAzDTO;
    gesuchsTyp: string;
    languageSubscription: Subscription;

    observeClickActionSub: Subscription;
    ammKostenId = 0;
    disableDatePicker;
    gesuchVon: any;
    gesuchBis: any;
    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    ammEntscheidId: number;
    geschaeftsfallId: number;

    /**
     * If the variable is set to true all the fields in UI are set as read-only
     * and the buttons are hidden. The variables is true only when the entscheid-status
     * is 'freigabebereit', 'freigegeben' oder 'ersetzt'
     *
     * @memberof AzKostenComponent
     */
    disableFieldsByEntscheidStatus = false;

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof AzKostenComponent
     */
    submitted = false;

    basisNr: number;
    entscheidNr: number;

    /**
     * Creates an instance of AzKostenComponent.
     * @memberof AzKostenComponent
     */
    constructor(
        private navigationService: NavigationService,
        private formBuilder: FormBuilder,
        private spinnerService: SpinnerService,
        private route: ActivatedRoute,
        private formUtils: FormUtilsService,
        private dbTranslateService: DbTranslateService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService,
        private resetDialogService: ResetDialogService,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private ammDataService: AmmRestService,
        private obliqueHelper: ObliqueHelperService,
        private ammHelper: AmmHelper,
        private stesInfobarService: AvamStesInfoBarService,
        private messageBus: MessageBus,
        protected router: Router,
        protected facade: FacadeService,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.ammEntscheidTypeCode = AmmMassnahmenCode.AZ;
    }

    /**
     * Init AzKostenComponent
     *
     * @memberof AzKostenComponent
     */
    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesAmm.azKostenHeader' });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.ammEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
        });

        this.setSideNavigation();
        this.kostenForm = this.createFormGroup();
        this.getData();

        this.languageSubscription = this.dbTranslateService.getEventEmitter().subscribe(() => {
            this.patchGesuchstypValue();
        });
        super.ngOnInit();
    }

    isOurLabel(message) {
        return message.data.label === this.dbTranslateService.instant(AMMLabels.AZ);
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.AZ_GESUCH) ||
            this.router.url.includes(AMMPaths.AZ_KOSTEN) ||
            this.router.url.includes(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode))
        );
    }

    patchGesuchstypValue() {
        if (this.gesuchData && this.gesuchData.typIdObject) {
            this.gesuchsTyp = this.dbTranslateService.translate(this.gesuchData.typIdObject, 'text');
        }
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        if (this.ammKostenId) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        }

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId));

        if (!this.observeClickActionSub) {
            this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.ammKostenId, AvamCommonValueObjectsEnum.T_AMM_KOSTEN_AZ);
                }
            });
        }
    }

    openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId.toString();
        comp.type = objType;
    }

    onReset() {
        if (this.kostenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.getData();
            });
        }
    }

    /**
     * Create form group with formBuilder.
     * The following form fields - Berechnungslage, "./.", Montlicher Zuschuss, Ausrichtungszeitraum
     * and total Zuschusse will always be read-only and the data will be passed to and displayed as
     * paragraph. Therefore there is no need of the setting and binding to formcontrolnames.
     *
     * @returns {FormGroup}
     * @memberof AzKostenComponent
     */
    createFormGroup() {
        return this.formBuilder.group(
            {
                monatslohnNachDerAusbildung: [null, [Validators.required, NumberValidator.checkValueBetween0and99999]],
                ausbildungsmonatslohn: [null, [Validators.required, NumberValidator.checkValueBetween0and99999]],
                ausrichtungVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                ausrichtungBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                stipendium: [null, NumberValidator.checkValueBetween0and99999],
                anderweitigeUnterstuetzung: [null, NumberValidator.checkValueBetween0and99999]
            },
            {
                validator: [
                    DateValidator.rangeBetweenDates('ausrichtungVon', 'ausrichtungBis', 'val202', false, true),
                    DateValidator.dateRange12M('ausrichtungVon', 'ausrichtungBis', 'val203')
                ]
            }
        );
    }

    onCalculate() {
        if (this.checkFormValid()) {
            this.spinnerService.activate(this.channel);

            this.ammDataService.berechnenKostenAz(this.ammEntscheidId, this.mapToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.azKostenData = response.data;
                        this.kostenForm.setValue(this.mapToForm(this.azKostenData));
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

    /**
     * HTTP GET call.
     *
     * @memberof AzKostenComponent
     */
    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin([this.ammDataService.getKostenAz(this.ammEntscheidId), this.ammDataService.getGesuchAz(this.stesId, this.geschaeftsfallId)]).subscribe(
            ([kostenResponse, gesuchResponse]) => {
                this.buttons.next(null);

                if (kostenResponse.data) {
                    this.ammKostenId = kostenResponse.data.ammKostenId;
                    this.azKostenData = kostenResponse.data;
                    this.kostenForm.reset(this.mapToForm(this.azKostenData));

                    this.ammDataService.getButtonsKostenAz(this.azKostenData.ammEntscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });

                    this.ammHelper.setAdditionalAmmKostenErrors(kostenResponse.data);
                }

                if (gesuchResponse.data) {
                    this.gesuchData = gesuchResponse.data;
                    this.gesuchVon = this.gesuchData.massnahmeVon;
                    this.gesuchBis = this.gesuchData.massnahmeBis;
                    this.kostenForm
                        .get('ausrichtungVon')
                        .setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.val273(this.gesuchVon, this.gesuchBis)]);
                    this.kostenForm
                        .get('ausrichtungBis')
                        .setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.val273(this.gesuchVon, this.gesuchBis)]);
                    this.gesuchsTyp = this.gesuchData.typIdObject ? this.dbTranslateService.translate(this.gesuchData.typIdObject, 'text') : null;
                    const entscheidStatus = this.getEntscheidStatusByEntscheidId(this.gesuchData, this.ammEntscheidId);
                    const disableByEntscheidStatus =
                        entscheidStatus === AmmVierAugenStatusCode.ERSETZT ||
                        entscheidStatus === AmmVierAugenStatusCode.FREIGEGEBEN ||
                        entscheidStatus === AmmVierAugenStatusCode.FREIGABEBEREIT;

                    if (disableByEntscheidStatus) {
                        this.disableFieldsByEntscheidStatus = true;
                        this.disableDatePicker = true;
                    }

                    this.basisNr = this.gesuchData.ammGeschaeftsfallObject.basisNr;
                    this.entscheidNr = this.getEntscheidNr();
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);

                    if (this.ammKostenId) {
                        this.stesInfobarService.sendLastUpdate(this.azKostenData);
                    }
                }

                this.configureToolbox();
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    /**
     * Check for invalid fields.
     *
     * @memberof AzKostenComponent
     */
    checkFormValid() {
        this.fehlermeldungenService.closeMessage();
        this.submitted = true;
        const isValid = this.kostenForm.valid;

        if (!isValid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }

        return isValid;
    }

    onSave() {
        if (this.checkFormValid()) {
            this.spinnerService.activate(this.channel);

            const kostenToSave = this.mapToDTO();
            const update = this.ammDataService.updateKostenAz(this.ammEntscheidId, kostenToSave);
            const create = this.ammDataService.createKostenAz(this.ammEntscheidId, kostenToSave);

            iif(() => (this.ammKostenId ? true : false), update, create).subscribe(
                response => {
                    this.buttons.next(null);

                    this.ammDataService.getButtonsKostenAz(this.azKostenData.ammEntscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });

                    if (response.data) {
                        this.ammKostenId = response.data.ammKostenId;
                        this.azKostenData = response.data;
                        this.kostenForm.reset(this.mapToForm(this.azKostenData));
                        this.stesInfobarService.sendLastUpdate(this.azKostenData);
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

    /**
     * Find the entscheid-status for the current Kosten
     *
     * @memberof AzKostenComponent
     */
    getEntscheidStatusByEntscheidId(gesuchData: AmmGesuchDTO, entscheidId: number) {
        let allAmmEntscheidArray: any;
        let statusCode: string;

        if (gesuchData.ammGeschaeftsfallObject && gesuchData.ammGeschaeftsfallObject.allAmmEntscheid) {
            allAmmEntscheidArray = gesuchData.ammGeschaeftsfallObject.allAmmEntscheid;

            allAmmEntscheidArray.forEach(element => {
                if (element.ammEntscheidId === entscheidId) {
                    statusCode = element.statusObject.code;
                }
            });
        }

        return statusCode;
    }

    /**
     * Map data from backend to form object.
     *
     * @memberof AzKostenComponent
     */
    mapToForm(azKostenFormattedData: AmmKostenAzDTO) {
        return {
            monatslohnNachDerAusbildung: azKostenFormattedData.monatslohnBeruf,
            ausbildungsmonatslohn: azKostenFormattedData.monatslohnAusbildung,
            stipendium: azKostenFormattedData.stipendien,
            anderweitigeUnterstuetzung: azKostenFormattedData.unterstuetzungRente,
            ausrichtungVon: this.formUtils.parseDate(azKostenFormattedData.ausrichtungVon),
            ausrichtungBis: this.formUtils.parseDate(azKostenFormattedData.ausrichtungBis)
        };
    }

    canDeactivate(): boolean {
        return this.kostenForm.dirty;
    }

    /**
     * Map form object to backend.
     *
     * @memberof AzKostenComponent
     */
    mapToDTO(): AmmKostenAzDTO {
        const ammKostenDataSave = { ...this.azKostenData };

        ammKostenDataSave.monatslohnBeruf = this.kostenForm.controls.monatslohnNachDerAusbildung.value;
        ammKostenDataSave.berechnungsGrundlage = this.azKostenData.berechnungsGrundlage;
        ammKostenDataSave.monatslohnAusbildung = this.kostenForm.controls.ausbildungsmonatslohn.value;
        ammKostenDataSave.stipendien = this.kostenForm.controls.stipendium.value;
        ammKostenDataSave.unterstuetzungRente = this.kostenForm.controls.anderweitigeUnterstuetzung.value;
        ammKostenDataSave.unterstuetzungTotal = this.azKostenData.unterstuetzungTotal;
        ammKostenDataSave.zuschussMonatlich = this.azKostenData.zuschussMonatlich;
        ammKostenDataSave.ausrichtungVon = this.formUtils.parseDate(this.kostenForm.controls.ausrichtungVon.value);
        ammKostenDataSave.ausrichtungBis = this.formUtils.parseDate(this.kostenForm.controls.ausrichtungBis.value);
        ammKostenDataSave.betrag = this.azKostenData.betrag;

        return ammKostenDataSave;
    }

    /**
     * Set side navigation for this component
     *
     * @memberof AzKostenComponent
     */
    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.AZ_GESUCH, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.AZ_KOSTEN, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
    }

    /**
     * A lifecycle hook that is called when the component is destroyed.
     * Place to Unsubscribe from Observables.
     *
     * @memberof AzKostenComponent
     */
    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        this.languageSubscription.unsubscribe();
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

    private getEntscheidNr() {
        let entscheidNr: number;

        if (this.gesuchData.ammGeschaeftsfallObject && this.gesuchData.ammGeschaeftsfallObject.allAmmEntscheid) {
            const allAmmEntscheidArray = this.gesuchData.ammGeschaeftsfallObject.allAmmEntscheid;

            allAmmEntscheidArray.forEach(element => {
                if (element.ammEntscheidId === this.ammEntscheidId) {
                    entscheidNr = element.entscheidNr;
                }
            });
        }

        return entscheidNr;
    }
}
