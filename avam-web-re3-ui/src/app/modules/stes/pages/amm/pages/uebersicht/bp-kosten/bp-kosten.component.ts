import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@app/shared/services/message-bus';
import { forkJoin, iif, Subject, Subscription } from 'rxjs';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmKostenBpDTO } from '@app/shared/models/dtos-generated/ammKostenBpDTO';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { first } from 'rxjs/operators';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-bp-kosten',
    templateUrl: './bp-kosten.component.html',
    styleUrls: ['./bp-kosten.component.scss'],
    providers: [ObliqueHelperService]
})
export class BPKostenComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof BPKostenComponent
     */
    kostenForm: FormGroup;

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof BPKostenComponent
     */
    submitted = false;

    /**
     * Current component channel.
     *
     * @memberof BPKostenComponent
     */
    channel = 'BpKostenChannel';

    isTheFirstEntscheidFreigabebereitFreigegebenOrErsetzt: boolean;
    entscheidId: number;
    kostenId: number;
    basisNr: number;
    geschaeftsfallId: number;
    entscheidNr: number;
    ammMassnahmenType: string;
    ammButtonTypesEnum = AmmButtonsTypeEnum;
    buchungTitle: any;
    bpKostenData: AmmKostenBpDTO;
    langChangeSubscription: Subscription;
    observeClickActionSub: Subscription;
    bpKostenButtons: Subject<any[]> = new Subject();

    /**
     * Creates an instance of BPKostenComponent.
     * @param {FormBuilder} formBuilder
     * @param {NavigationService} navigationService
     * @memberof BPKostenComponent
     */
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private obliqueHelper: ObliqueHelperService,
        protected router: Router,
        private ammDataService: AmmRestService,
        private stesInfobarService: AvamStesInfoBarService,
        private modalService: NgbModal,
        private stesDataRestService: StesDataRestService,
        private ammHelper: AmmHelper,
        protected facade: FacadeService,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    /**
     * Init BPKostenComponent
     *
     * @memberof BPKostenComponent
     */
    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;

        this.route.queryParamMap.subscribe(param => {
            this.geschaeftsfallId = +param.get('gfId');
            this.entscheidId = param.get('entscheidId') ? +param.get('entscheidId') : null;
        });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.paramMap.subscribe(param => {
            this.ammMassnahmenType = param.get('type');
            this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];
        });

        this.setSideNavigation();

        this.getData();

        this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            if (this.bpKostenData) {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle(this.facade.dbTranslateService.translateWithOrder(this.buchungTitle, 'name')) });
            } else {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle() });
            }
        });

        this.kostenForm = this.createFormGroup();
        super.ngOnInit();
    }

    isOurLabel(message) {
        return (
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_BP) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.KOLLEKTIV_BP)
        );
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BP_KOSTEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType))
        );
    }

    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof BPKostenComponent
     */
    createFormGroup() {
        return this.formBuilder.group({
            monatlicherArbeitgeberanteilProzent: null,
            monatlicherArbeitgeberanteilCHF: null
        });
    }

    /**
     * HTTP GET call.
     *
     * @memberof BPKostenComponent
     */
    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            this.ammDataService.getKostenBp(this.entscheidId),
            this.ammDataService.getAmmEntscheid(this.entscheidId),
            this.ammDataService.getAmmBuchungParam(this.geschaeftsfallId, this.ammMassnahmenType, this.stesId)
        ]).subscribe(
            ([
                //NOSONAR
                resKostenBpData,
                resEntscheid,
                buchungResponse
            ]) => {
                this.bpKostenButtons.next(null);

                if (resKostenBpData.data) {
                    this.bpKostenData = resKostenBpData.data;
                    this.kostenId = this.bpKostenData.ammKostenId;

                    if (this.kostenId) {
                        this.stesInfobarService.sendLastUpdate(this.bpKostenData);
                    }

                    this.kostenForm.reset(this.mapToForm(resKostenBpData.data));
                    this.setValidatorsBasedOnBerechnungsgrundlage(resKostenBpData.data.berechnungsgrundlage);

                    this.ammDataService.getButtonsKostenBp(this.entscheidId).subscribe(btnResponse => {
                        this.bpKostenButtons.next(btnResponse.data);
                    });

                    this.ammHelper.setAdditionalAmmKostenErrors(resKostenBpData.data);
                }

                if (resEntscheid.data) {
                    const oldestEntscheidStatusCode = this.getOldestEntscheidStatusCode(resEntscheid.data);

                    this.isTheFirstEntscheidFreigabebereitFreigegebenOrErsetzt =
                        oldestEntscheidStatusCode === AmmVierAugenStatusCode.FREIGABEBEREIT ||
                        oldestEntscheidStatusCode === AmmVierAugenStatusCode.FREIGEGEBEN ||
                        oldestEntscheidStatusCode === AmmVierAugenStatusCode.ERSETZT;
                }

                if (buchungResponse.data) {
                    const buchungObject = this.ammHelper.getAmmBuchung(buchungResponse.data);
                    this.basisNr = buchungObject.ammGeschaeftsfallObject.basisNr;
                    this.entscheidNr = this.ammHelper.getEntscheidNr(buchungObject, this.entscheidId);
                    this.buchungTitle = buchungResponse.data.titel;
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle(this.facade.dbTranslateService.translateWithOrder(this.buchungTitle, 'name')) });
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
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
     * The method checks if Berechnungsgrundlage CHF is empty. If it is both fields Monatlicher Arbeitgeberanteil %  and
     * Monatlicher Arbeitgeberanteil CHF are must fields.If it is not empty only one of the two fields must be filled.
     */
    setValidatorsBasedOnBerechnungsgrundlage(berechnungsgrundlageValue: number | null) {
        this.updateMonatlicherArbeitgeberanteilProzentValidators(berechnungsgrundlageValue);
        this.updateMonatlicherArbeitgeberanteilChfValidators(berechnungsgrundlageValue);
    }

    updateMonatlicherArbeitgeberanteilProzentValidators(berechnungsgrundlageValue: number | null) {
        const prozentControl: AbstractControl = this.kostenForm.controls.monatlicherArbeitgeberanteilProzent;
        const chfControl: AbstractControl = this.kostenForm.controls.monatlicherArbeitgeberanteilCHF;

        if (!berechnungsgrundlageValue || this.hasNoValue(prozentControl)) {
            chfControl.setValidators([Validators.required]);
        } else {
            chfControl.clearValidators();
        }

        this.updateControlsForValueAndValidity(prozentControl, chfControl, () => {
            prozentControl.updateValueAndValidity({ emitEvent: false, onlySelf: false });
            chfControl.updateValueAndValidity();
        });
    }

    updateMonatlicherArbeitgeberanteilChfValidators(berechnungsgrundlageValue: number | null) {
        const prozentControl: AbstractControl = this.kostenForm.controls.monatlicherArbeitgeberanteilProzent;
        const chfControl: AbstractControl = this.kostenForm.controls.monatlicherArbeitgeberanteilCHF;

        if (!berechnungsgrundlageValue || this.hasNoValue(chfControl)) {
            prozentControl.setValidators([Validators.required, NumberValidator.isPositiveInteger, NumberValidator.val285(false)]);
        } else {
            prozentControl.clearValidators();
            prozentControl.setValidators([NumberValidator.isPositiveInteger, NumberValidator.val285(true)]);
        }

        this.updateControlsForValueAndValidity(prozentControl, chfControl, () => {
            chfControl.updateValueAndValidity({ emitEvent: false, onlySelf: false });
            prozentControl.updateValueAndValidity();
        });
    }

    /**
     * Map data from backend to form object.
     *
     * @memberof BPKostenComponent
     */
    mapToForm(ammKostenBpData: AmmKostenBpDTO) {
        return {
            monatlicherArbeitgeberanteilProzent: ammKostenBpData.arbeitgeberbeitragProzent,
            monatlicherArbeitgeberanteilCHF: ammKostenBpData.arbeitgeberbeitrag
        };
    }

    /**
     * Map form object to backend.
     *
     * @memberof BPKostenComponent
     */
    mapToDTO() {
        const kostenDataToSave = { ...this.bpKostenData };

        kostenDataToSave.arbeitgeberbeitragProzent = this.kostenForm.controls.monatlicherArbeitgeberanteilProzent.value;
        kostenDataToSave.arbeitgeberbeitrag = this.kostenForm.controls.monatlicherArbeitgeberanteilCHF.value
            ? Number(this.kostenForm.controls.monatlicherArbeitgeberanteilCHF.value)
            : null;

        return kostenDataToSave;
    }

    /**
     * Trigger onSave when form is valid.
     *
     * @memberof BPKostenComponent
     */
    onSave() {
        if (this.checkFormValid()) {
            this.facade.spinnerService.activate(this.channel);

            const kostenToSave = this.mapToDTO();
            const update = this.ammDataService.updateKostenBp(kostenToSave);
            const create = this.ammDataService.createKostenBp(kostenToSave);

            iif(() => (this.bpKostenData.ammKostenId ? true : false), update, create).subscribe(
                response => {
                    this.bpKostenButtons.next(null);

                    this.ammDataService.getButtonsKostenBp(this.entscheidId).subscribe(btnResponse => {
                        this.bpKostenButtons.next(btnResponse.data);
                    });

                    if (response.data) {
                        this.bpKostenData = response.data;
                        this.kostenId = this.bpKostenData.ammKostenId;
                        this.kostenForm.reset(this.mapToForm(this.bpKostenData));
                        this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                        this.ammHelper.setAdditionalAmmKostenErrors(response.data);
                    } else {
                        this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                    }

                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                }
            );
        }
    }

    /**
     * Trigger onAsalDatenUebernehmen.
     *
     * @memberof BPKostenComponent
     */
    onAsalDatenUebernehmen() {
        if (this.checkFormValid()) {
            this.facade.fehlermeldungenService.closeMessage();
            this.facade.spinnerService.activate(this.channel);
            this.kostenForm.markAsDirty();

            this.ammDataService.asalDatenUebernehmenKostenBp(this.mapToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.mapDataFromAsalDaten(response.data);
                    }

                    this.setAdditionalMsg(response.data);
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.setAdditionalMsg(null);
                    this.deactivateSpinnerAndScrollTop();
                }
            );
        }
    }

    /**
     * Trigger onCalculate.
     *
     * @memberof BPKostenComponent
     */
    onCalculate() {
        if (this.checkFormValid()) {
            this.facade.fehlermeldungenService.closeMessage();
            this.facade.spinnerService.activate(this.channel);

            this.ammDataService.berechnenKostenBp(this.mapToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.bpKostenData = response.data;
                        this.kostenForm.setValue(this.mapToForm(this.bpKostenData));
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
     * Check for invalid fields.
     *
     * @memberof BPKostenComponent
     */
    checkFormValid() {
        this.facade.fehlermeldungenService.closeMessage();
        const isValid = this.kostenForm.valid;

        if (!isValid) {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }

        return isValid;
    }

    /**
     * Submit form.
     *
     * @memberof BPKostenComponent
     */
    onSubmit() {
        this.submitted = true;

        if (this.kostenForm.invalid) {
            return;
        }

        this.onSave();
    }

    /**
     * Reset form.
     *
     * @memberof BPKostenComponent
     */
    onReset() {
        if (this.kostenForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.getData();
            });
        }
    }

    /**
     * Check if form is dirty and notifiy DeactivationGuard.
     *
     * @memberof BPKostenComponent
     */
    canDeactivate() {
        return this.kostenForm.dirty;
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        if (this.kostenId) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId));

        if (!this.observeClickActionSub) {
            this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.kostenId, AvamCommonValueObjectsEnum.T_AMM_BP_KOSTEN);
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

    /**
     * A lifecycle hook that is called when the component is destroyed.
     * Place to Unsubscribe from Observables.
     *
     * @memberof BPKostenComponent
     */
    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        this.langChangeSubscription.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    private hasNoValue(control: AbstractControl): boolean {
        return !control || (!control.value || control.value === '');
    }

    private updateControlsForValueAndValidity(controlA: AbstractControl, controlB: AbstractControl, updateValueAndValidity: any): void {
        if (this.hasNoValue(controlA) && this.hasNoValue(controlB)) {
            controlA.setErrors({ required: true });
            controlB.setErrors({ required: true });
            controlA.markAsTouched();
            controlB.markAsTouched();
            controlA.markAsDirty();
            controlB.markAsDirty();
            controlA.updateValueAndValidity();
            controlB.updateValueAndValidity();
        } else {
            updateValueAndValidity();
        }
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private configureInfobarTitle(title?) {
        const massnahmenLabel = this.facade.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const translatedLabel = this.facade.translateService.instant('amm.nutzung.label.kosten');

        return `${massnahmenLabel} ${title} - ${translatedLabel}`;
    }

    private setSideNavigation() {
        this.showNavigationTreeRoute(AMMPaths.AMM_GENERAL);
        if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP) {
            this.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_BUCHUNG);
            this.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG);
            this.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_DURCHFUHRUNG);
        } else if (this.ammMassnahmenType === AmmMassnahmenCode.BP) {
            this.showNavigationTreeRoute(AMMPaths.PSAK_BUCHUNG);
            this.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG);
            this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG);
            this.showNavigationTreeRoute(AMMPaths.TEILNEHMERPLAETZE);
        } else {
            this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_BUCHUNG);
            this.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG);
            this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG);
        }
        this.showNavigationTreeRoute(AMMPaths.BP_KOSTEN);
        this.showNavigationTreeRoute(AMMPaths.SPESEN);
        this.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID);
    }

    private showNavigationTreeRoute(path) {
        this.facade.navigationService.showNavigationTreeRoute(path.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
    }

    /**
     * The function returns the status code of the very first Entscheid -
     * the one that has no Vorgänger
     */
    private getOldestEntscheidStatusCode(entscheidData): string {
        let statusCode: string;
        const allAmmEntscheidArray = entscheidData.ammGeschaeftsfallObject.allAmmEntscheid;
        const allAmmEntscheidArrayLastIndex = allAmmEntscheidArray.length - 1;

        if (
            entscheidData.ammGeschaeftsfallObject &&
            allAmmEntscheidArray &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex] &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject
        ) {
            statusCode = allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject.code;
        }

        return statusCode;
    }

    /**
     * @param asalDatenResponse
     *
     * This function should map all the data from the asal daten response to the bpKostenData except for these two fields -
     * "Dauer der Massnahme" and "Total Arbeitgeberanteil". According to the new requirements the user should
     * click berechnen or speichern in order to calculate the values of the two fields.
     */
    private mapDataFromAsalDaten(asalDatenResponse) {
        const ausrichtungszeitraumInMonatenOldValue = this.bpKostenData.ausrichtungszeitraumInMonaten;
        const betragOldValue = this.bpKostenData.betrag;
        this.bpKostenData = asalDatenResponse;
        this.bpKostenData.ausrichtungszeitraumInMonaten = ausrichtungszeitraumInMonatenOldValue;
        this.bpKostenData.betrag = betragOldValue;
    }

    private setAdditionalMsg(kosten: AmmKostenBpDTO) {
        this.ammHelper.setAdditionalAmmKostenErrors(kosten);
        this.facade.fehlermeldungenService.showMessage('common.message.asaldatenuebernommen', 'info');
        OrColumnLayoutUtils.scrollTop();
    }
}
