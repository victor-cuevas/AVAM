import { NumberValidator } from '@app/shared/validators/number-validator';
import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolboxService } from '@app/shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { Subscription, Subject, forkJoin, iif } from 'rxjs';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { SpinnerService } from 'oblique-reactive';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { AmmKostenEazDTO } from '@app/shared/models/dtos-generated/ammKostenEazDTO';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AmmGesuchEazDTO } from '@app/shared/models/dtos-generated/ammGesuchEazDTO';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { AmmEntscheidCode } from '@app/shared/enums/domain-code/amm-entscheid-code.enum';
import { BerechnungsvarianteCodeEnum } from '@app/shared/enums/domain-code/berechnungsvariante-code.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-eaz-kosten',
    templateUrl: './eaz-kosten.component.html',
    styleUrls: ['./eaz-kosten.component.scss'],
    providers: [ObliqueHelperService]
})
export class EazKostenComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof EazKostenComponent
     */
    eazKostenForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof EazKostenComponent
     */
    channel = 'eaz-kosten-channel';

    eazKostenData: AmmKostenEazDTO;
    geschaeftsfallId: number;
    eazAmmEntscheidId: number;
    eazAmmKostenId: number;
    berechnungsvarianteOptions: any[] = [];

    observeClickActionSub: Subscription;
    disableFieldsByEntscheidStatus = false;

    eazKostenButtons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;

    basisNr: number;
    entscheidNr: number;
    gesuchData: AmmGesuchEazDTO;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private ammDataService: AmmRestService,
        private dataRestService: StesDataRestService,
        private obliqueHelper: ObliqueHelperService,
        private ammHelper: AmmHelper,
        private stesInfobarService: AvamStesInfoBarService,
        protected facade: FacadeService,
        protected router: Router,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.ammEntscheidTypeCode = AmmMassnahmenCode.EAZ;
    }

    /**
     * Init EazKostenComponent
     *
     * @memberof EazKostenComponent
     */
    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesAmm.eazKostenHeader' });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.eazAmmEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
        });

        this.setSideNavigation();
        this.eazKostenForm = this.createFormGroup();
        this.getData();

        super.ngOnInit();
    }

    isOurLabel(message) {
        return message.data.label === this.facade.dbTranslateService.instant(AMMLabels.EAZ);
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.EAZ_GESUCH) ||
            this.router.url.includes(AMMPaths.EAZ_KOSTEN) ||
            this.router.url.includes(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode))
        );
    }

    /**
     * HTTP GET call.
     *
     * @memberof EazKostenComponent
     */
    getData() {
        this.facade.spinnerService.activate(this.channel);
        this.facade.fehlermeldungenService.closeMessage();

        forkJoin([
            this.ammDataService.getKostenEaz(this.eazAmmEntscheidId),
            this.ammDataService.getGesuchEaz(this.stesId, this.geschaeftsfallId),
            this.dataRestService.getCode(DomainEnum.AMM_EAZ_BERECHNUNG)
        ]).subscribe(
            //NOSONAR
            ([kostenResponse, gesuchResponse, berechnenTypOptions]) => {
                this.eazKostenButtons.next(null);
                this.berechnungsvarianteOptions = this.facade.formUtilsService.mapDropdownKurztext(berechnenTypOptions);
                if (kostenResponse.data) {
                    this.fillData(kostenResponse, gesuchResponse);
                }
                this.configureToolbox();
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    setDefaultValues() {
        const defaultCodeId = this.facade.formUtilsService.getCodeIdByCode(this.berechnungsvarianteOptions, BerechnungsvarianteCodeEnum.ORDENTLICHE_BERECHNUNG);
        this.eazKostenForm.controls.berechnungsvariante.setValue(defaultCodeId);
    }

    mapToForm(eazKostenData: AmmKostenEazDTO) {
        return {
            berechnungsvariante: eazKostenData.berechnungsvarianteId ? eazKostenData.berechnungsvarianteId : null,
            beschaeftigungsgrad: eazKostenData.beschaeftigungsGrad,
            monatslohn: eazKostenData.monatslohn,
            berechnungsGrundlage: eazKostenData.berechnungsGrundlage ? eazKostenData.berechnungsGrundlage : 0,
            einarbeitung: this.facade.formUtilsService.parseDate(eazKostenData.einarbeitungVon),
            ausrichtungVon: this.facade.formUtilsService.parseDate(eazKostenData.ausrichtungVon),
            ausrichtungBis: this.facade.formUtilsService.parseDate(eazKostenData.ausrichtungBis)
        };
    }

    mapToDTO() {
        const eazKostenDataToSave = { ...this.eazKostenData };

        eazKostenDataToSave.berechnungsvarianteId = this.eazKostenForm.controls.berechnungsvariante.value;
        eazKostenDataToSave.berechnungsvarianteObject = this.berechnungsvarianteOptions.find(
            option => option.codeId === +this.eazKostenForm.controls.berechnungsvariante.value
        ) as CodeDTO;
        eazKostenDataToSave.beschaeftigungsGrad = this.eazKostenForm.controls.beschaeftigungsgrad.value;
        eazKostenDataToSave.monatslohn = this.eazKostenForm.controls.monatslohn.value;
        eazKostenDataToSave.ausrichtungVon = this.facade.formUtilsService.parseDate(this.eazKostenForm.controls.ausrichtungVon.value);
        eazKostenDataToSave.ausrichtungBis = this.facade.formUtilsService.parseDate(this.eazKostenForm.controls.ausrichtungBis.value);

        return eazKostenDataToSave;
    }

    createFormGroup() {
        return this.formBuilder.group(
            {
                berechnungsvariante: [null, Validators.required],
                beschaeftigungsgrad: [null, [NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween1and100]],
                monatslohn: [null, [Validators.required, NumberValidator.checkValueBetween1and99999]],
                berechnungsGrundlage: null,
                einarbeitung: null,
                ausrichtungVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                ausrichtungBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validator: [
                    DateValidator.rangeBetweenDates('ausrichtungVon', 'ausrichtungBis', 'val202', false, true),
                    DateValidator.dateRange12M('ausrichtungVon', 'ausrichtungBis', 'val203')
                ]
            }
        );
    }

    /**
     * Set side navigation for this component
     *
     * @memberof EazKostenComponent
     */
    setSideNavigation() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.eazAmmEntscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.EAZ_GESUCH, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.eazAmmEntscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.EAZ_KOSTEN, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.eazAmmEntscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.eazAmmEntscheidId
        });
    }

    onSave() {
        if (this.checkFormValid()) {
            this.facade.spinnerService.activate(this.channel);

            const kostenToSave = this.mapToDTO();
            const update = this.ammDataService.updateKostenEaz(kostenToSave);
            const create = this.ammDataService.createKostenEaz(kostenToSave);

            iif(() => (this.eazKostenData.ammKostenId ? true : false), update, create).subscribe(
                response => {
                    this.eazKostenButtons.next(null);
                    this.ammDataService.getButtonsKostenEaz(this.eazAmmEntscheidId).subscribe(btnResponse => {
                        this.eazKostenButtons.next(btnResponse.data);
                    });

                    if (response.data) {
                        this.eazKostenData = response.data;
                        this.eazAmmKostenId = this.eazKostenData.ammKostenId;
                        this.eazKostenForm.reset(this.mapToForm(this.eazKostenData));
                        this.stesInfobarService.sendLastUpdate(this.eazKostenData);
                        this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    } else {
                        this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                    }

                    this.configureToolbox();
                    this.ammHelper.setAdditionalAmmKostenErrors(response.data);

                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                }
            );
        }
    }

    onReset() {
        if (this.eazKostenForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.getData();
            });
        }
    }

    onBerechnen() {
        if (this.checkFormValid()) {
            this.facade.spinnerService.activate(this.channel);
            this.ammDataService.berechnenKostenEaz(this.mapToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.eazKostenData = response.data;
                        this.eazKostenForm.setValue(this.mapToForm(this.eazKostenData));
                    }

                    this.ammHelper.setAdditionalAmmKostenErrors(response.data);

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
     * @memberof EazKostenComponent
     */
    checkFormValid() {
        this.facade.fehlermeldungenService.closeMessage();
        const isValid = this.eazKostenForm.valid;

        if (!isValid) {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }

        return isValid;
    }

    canDeactivate(): boolean {
        return this.eazKostenForm.dirty;
    }

    /**
     * A lifecycle hook that is called when the component is destroyed.
     * Place to Unsubscribe from Observables.
     *
     * @memberof EazKostenComponent
     */
    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        this.facade.fehlermeldungenService.closeMessage();
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
        super.ngOnDestroy();
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private setDisableFieldsByEntscheidStatus(gesuchData: AmmGesuchEazDTO) {
        let statusCode: string;
        let entscheidArtObj: CodeDTO;

        if (gesuchData.ammGeschaeftsfallObject && gesuchData.ammGeschaeftsfallObject.allAmmEntscheid) {
            const allAmmEntscheidArray = gesuchData.ammGeschaeftsfallObject.allAmmEntscheid;

            allAmmEntscheidArray.forEach(element => {
                if (element.ammEntscheidId === this.eazKostenData.ammEntscheidId) {
                    statusCode = element.statusObject.code;
                    entscheidArtObj = element.entscheidArtObject;
                }
            });
        }

        const checkEntscheidStatus =
            statusCode === AmmVierAugenStatusCode.ERSETZT || statusCode === AmmVierAugenStatusCode.FREIGEGEBEN || statusCode === AmmVierAugenStatusCode.FREIGABEBEREIT;

        let isEntscheidArtGutgeheissenOderTeilwGutgeheisen = false;

        if (entscheidArtObj) {
            isEntscheidArtGutgeheissenOderTeilwGutgeheisen =
                entscheidArtObj.code !== AmmEntscheidCode.GUTGEHEISSEN && entscheidArtObj.code !== AmmEntscheidCode.TEILWEISE_GUTGEHEISSEN;
        }

        return checkEntscheidStatus || isEntscheidArtGutgeheissenOderTeilwGutgeheisen;
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        if (this.eazAmmKostenId) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId));

        if (!this.observeClickActionSub) {
            this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.eazAmmKostenId, AvamCommonValueObjectsEnum.T_AMM_KOSTEN_EAZ);
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

    private getEntscheidNr() {
        let entscheidNr: number;

        if (this.gesuchData.ammGeschaeftsfallObject && this.gesuchData.ammGeschaeftsfallObject.allAmmEntscheid) {
            const allAmmEntscheidArray = this.gesuchData.ammGeschaeftsfallObject.allAmmEntscheid;

            allAmmEntscheidArray.forEach(element => {
                if (element.ammEntscheidId === this.eazKostenData.ammEntscheidId) {
                    entscheidNr = element.entscheidNr;
                }
            });
        }

        return entscheidNr;
    }

    private fillData(kostenResponse, gesuchResponse) {
        this.eazKostenData = kostenResponse.data;
        this.eazAmmKostenId = this.eazKostenData.ammKostenId;

        this.ammDataService.getButtonsKostenEaz(this.eazAmmEntscheidId).subscribe(btnResponse => {
            this.eazKostenButtons.next(btnResponse.data);
        });

        this.eazKostenForm.reset(this.mapToForm(this.eazKostenData));

        if (gesuchResponse.data) {
            this.gesuchData = gesuchResponse.data;

            const gesuchEinarbeitungVon = this.gesuchData.massnahmeVon;
            const gesuchEinarbeitungBis = this.gesuchData.massnahmeBis;

            this.eazKostenForm
                .get('ausrichtungVon')
                .setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.val273(gesuchEinarbeitungVon, gesuchEinarbeitungBis)]);
            this.eazKostenForm
                .get('ausrichtungBis')
                .setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.val273(gesuchEinarbeitungVon, gesuchEinarbeitungBis)]);

            this.disableFieldsByEntscheidStatus = this.setDisableFieldsByEntscheidStatus(gesuchResponse.data);

            if (this.disableFieldsByEntscheidStatus) {
                this.eazKostenForm.controls.ausrichtungVon.clearValidators();
                this.eazKostenForm.controls.ausrichtungBis.clearValidators();

                this.eazKostenForm.controls.ausrichtungVon.updateValueAndValidity();
                this.eazKostenForm.controls.ausrichtungBis.updateValueAndValidity();
            }
        }

        if (!kostenResponse.data.berechnungsvarianteId && !kostenResponse.data.berechnungsvarianteObject) {
            this.setDefaultValues();
        }

        this.basisNr = this.gesuchData.ammGeschaeftsfallObject.basisNr;
        this.entscheidNr = this.getEntscheidNr();
        this.stesInfobarService.addItemToInfoPanel(this.infobartemp);

        if (this.eazAmmKostenId) {
            this.stesInfobarService.sendLastUpdate(this.eazKostenData);
        }

        this.ammHelper.setAdditionalAmmKostenErrors(kostenResponse.data);
    }
}
