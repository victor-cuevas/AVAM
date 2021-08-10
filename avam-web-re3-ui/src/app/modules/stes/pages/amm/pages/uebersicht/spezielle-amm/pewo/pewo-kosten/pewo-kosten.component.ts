import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { NavigationService } from '@app/shared/services/navigation-service';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { SpinnerService, NotificationService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subject, Subscription, iif } from 'rxjs';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AmmKostenPewoDTO } from '@app/shared/models/dtos-generated/ammKostenPewoDTO';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmGesuchDTO } from '@app/shared/models/dtos-generated/ammGesuchDTO';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmGesuchstypPewoCodeEnum } from '@app/shared/enums/domain-code/amm-gesuchstyp-pewo-code.enum';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmGesuchPewoDTO } from '@app/shared/models/dtos-generated/ammGesuchPewoDTO';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { VerkehrsmittelEnum } from '@app/shared/enums/domain-code/amm-verkehrsmittel-code.enum';
import { registerLocaleData } from '@angular/common';
import localeCh from '@angular/common/locales/de-CH';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { first } from 'rxjs/operators';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@app/shared/services/message-bus';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-pewo-kosten',
    templateUrl: './pewo-kosten.component.html',
    styleUrls: ['./pewo-kosten.component.scss'],
    providers: [ObliqueHelperService]
})
export class PewoKostenComponent extends AmmCloseableAbstract implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validation status of an individual form control.
     *
     * @memberof PewoKostenComponent
     */
    pewoKostenForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof PewoKostenComponent
     */
    channel = 'pewo-kosten-channel';

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof PewoKostenComponent
     */
    submitted = false;

    ammEntscheidId: number;
    geschaeftsfallId: number;
    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    pewoKostenData: AmmKostenPewoDTO;
    ammKostenId = 0;
    verkehrsmittelOptions: any[] = [];
    languageSubscription: Subscription;
    basisNr: number;
    entscheidNr: number;
    observeClickActionSub: Subscription;
    isGesuchstypPendler = false;
    disableFieldsByEntscheidStatus = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private navigationService: NavigationService,
        private spinnerService: SpinnerService,
        private ammDataService: AmmRestService,
        protected facade: FacadeService,
        private dbTranslateService: DbTranslateService,
        private dataRestService: StesDataRestService,
        private obliqueHelper: ObliqueHelperService,
        private ammHelper: AmmHelper,
        private resetDialogService: ResetDialogService,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private stesInfobarService: AvamStesInfoBarService,
        private toolboxService: ToolboxService,
        private modalService: NgbModal,
        private messageBus: MessageBus,
        protected router: Router,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.ammEntscheidTypeCode = AmmMassnahmenCode.PEWO;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesAmm.pewoKostenHeader' });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.ammEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
        });

        this.setSideNavigation();

        this.pewoKostenForm = this.createFormGroup();
        this.getData();

        this.languageSubscription = this.dbTranslateService.getEventEmitter().subscribe(() => {
            this.patchValue();
        });

        registerLocaleData(localeCh, LocaleEnum.SWITZERLAND);
        super.ngOnInit();
    }

    isOurLabel(message) {
        return message.data.label === this.dbTranslateService.instant(AMMLabels.PEWO);
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.PEWO_GESUCH) ||
            this.router.url.includes(AMMPaths.PEWO_KOSTEN) ||
            this.router.url.includes(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode))
        );
    }

    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.PEWO_GESUCH, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.PEWO_KOSTEN, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.ammEntscheidId
        });
    }

    createFormGroup() {
        return this.formBuilder.group(
            {
                gesuchstyp: [null, Validators.required],
                ausrichtungVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                ausrichtungBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                verkehrsmittel: [null, Validators.required],
                fahrtkostenA: [null, NumberValidator.checkValueBetween0and99999],
                fahrtkostenB: [null, [Validators.required, NumberValidator.checkValueBetween0and99999]],
                auswertigeVerpflegungA: [null, NumberValidator.checkValueBetween0and99999],
                auswertigeVerpflegungB: [null, NumberValidator.checkValueBetween0and99999],
                auswertigeUnterkunftA: [null, NumberValidator.checkValueBetween0and99999],
                auswertigeUnterkunftB: [null, NumberValidator.checkValueBetween0and99999],
                vergleichseinkommenA: [null, [Validators.required, NumberValidator.checkValueBetween0and99999]],
                vergleichseinkommenB: [null, [Validators.required, NumberValidator.checkValueBetween0and99999]]
            },
            {
                validator: [DateValidator.rangeBetweenDates('ausrichtungVon', 'ausrichtungBis', 'val202', false, true)]
            }
        );
    }

    canDeactivate(): boolean {
        return this.pewoKostenForm.dirty;
    }

    patchValue() {
        if (this.pewoKostenData && this.pewoKostenData.gesuchTypIdObject) {
            this.pewoKostenForm.patchValue({ gesuchstyp: this.dbTranslateService.translate(this.pewoKostenData.gesuchTypIdObject, 'text') });
        }
    }

    /**
     * HTTP GET call.
     *
     * @memberof PewoKostenComponent
     */
    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin([
            this.ammDataService.getKostenPewo(this.ammEntscheidId),
            this.ammDataService.getGesuchPewo(this.stesId, this.geschaeftsfallId),
            this.dataRestService.getCode(DomainEnum.VERKEHRSMITTEL)
        ]).subscribe(
            ([kostenResponse, gesuchResponse, verkehrsmittelOptions]) => {
                this.buttons.next(null);
                this.verkehrsmittelOptions = this.facade.formUtilsService.mapDropdownKurztext(verkehrsmittelOptions);

                if (gesuchResponse.data) {
                    this.basisNr = gesuchResponse.data.ammGeschaeftsfallObject.basisNr;
                    this.entscheidNr = this.getEntscheidNr(gesuchResponse.data);
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);

                    this.configureToolbox();
                    if (gesuchResponse.data.typIdObject.code && gesuchResponse.data.typIdObject.code === AmmGesuchstypPewoCodeEnum.PENDLER) {
                        this.isGesuchstypPendler = true;
                    }

                    this.disableFieldsByEntscheidStatus = this.setDisableFieldsByEntscheidStatus(gesuchResponse.data);

                    this.pewoKostenForm
                        .get('ausrichtungVon')
                        .setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.val167(gesuchResponse.data.massnahmeVon)]);
                }

                if (kostenResponse.data) {
                    this.pewoKostenData = kostenResponse.data;
                    this.ammKostenId = this.pewoKostenData.ammKostenId;
                    this.pewoKostenForm.reset(this.mapToForm(this.pewoKostenData));
                    this.ammDataService.getButtonsKostenPewo(this.ammEntscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });

                    if (this.ammKostenId) {
                        this.stesInfobarService.sendLastUpdate(kostenResponse.data);
                    }

                    this.ammHelper.setAdditionalAmmKostenErrors(kostenResponse.data);
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    onReset() {
        if (this.pewoKostenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.getData();
            });
        }
    }

    onCalculate() {
        if (this.checkFormValid()) {
            this.spinnerService.activate(this.channel);

            this.ammDataService.berechnenKostenPewo(this.mapToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.pewoKostenData = response.data;
                        this.pewoKostenForm.setValue(this.mapToForm(this.pewoKostenData));
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
     * @memberof PewoKostenComponent
     */
    checkFormValid() {
        this.fehlermeldungenService.closeMessage();
        this.submitted = true;
        const isValid = this.pewoKostenForm.valid;

        if (!isValid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }

        return isValid;
    }

    /**
     * Map data from backend to form object.
     *
     * @memberof PewoKostenComponent
     */
    mapToForm(pewoKostenFormattedData: AmmKostenPewoDTO) {
        return {
            gesuchstyp: this.dbTranslateService.translate(pewoKostenFormattedData.gesuchTypIdObject, 'text'),
            vergleichseinkommenA: pewoKostenFormattedData.vergleichslohnFrueher,
            fahrtkostenA: pewoKostenFormattedData.fahrtkostenFrueher,
            auswertigeVerpflegungA: pewoKostenFormattedData.verpflegungskostenFrueher,
            auswertigeUnterkunftA: pewoKostenFormattedData.unterkunftskostenFrueher,
            ausrichtungVon: this.facade.formUtilsService.parseDate(pewoKostenFormattedData.ausrichtungVon),
            ausrichtungBis: this.facade.formUtilsService.parseDate(pewoKostenFormattedData.ausrichtungBis),
            vergleichseinkommenB: pewoKostenFormattedData.vergleichslohn,
            fahrtkostenB: pewoKostenFormattedData.fahrtkosten,
            auswertigeVerpflegungB: pewoKostenFormattedData.verpflegungskosten,
            auswertigeUnterkunftB: pewoKostenFormattedData.unterkunftskosten,
            verkehrsmittel: pewoKostenFormattedData.verkehrsmittelId
                ? pewoKostenFormattedData.verkehrsmittelId
                : this.facade.formUtilsService.getCodeIdByCode(this.verkehrsmittelOptions, VerkehrsmittelEnum.PRIVATFAHRZEUG)
        };
    }

    /**
     * Map form object to backend.
     *
     * @memberof PewoKostenComponent
     */
    mapToDTO(): AmmKostenPewoDTO {
        const ammKostenDataSave: any = { ...this.pewoKostenData };

        // Map Panel A
        ammKostenDataSave.vergleichslohnFrueher = this.pewoKostenForm.controls.vergleichseinkommenA.value;
        ammKostenDataSave.berechnungsGrundlage = this.pewoKostenData.berechnungsGrundlage;
        ammKostenDataSave.fahrtkostenFrueher = this.pewoKostenForm.controls.fahrtkostenA.value;
        ammKostenDataSave.verpflegungskostenFrueher = this.pewoKostenForm.controls.auswertigeVerpflegungA.value;
        ammKostenDataSave.unterkunftskostenFrueher = this.pewoKostenForm.controls.auswertigeUnterkunftA.value;
        ammKostenDataSave.kostenTotalFrueher = this.pewoKostenData.kostenTotalFrueher;
        ammKostenDataSave.bereinigterLohnFrueher = this.pewoKostenData.bereinigterLohnFrueher;

        // Map Panel B
        ammKostenDataSave.vergleichslohn = this.pewoKostenForm.controls.vergleichseinkommenB.value;
        ammKostenDataSave.berechnungsGrundlage = this.pewoKostenData.berechnungsGrundlage;
        ammKostenDataSave.fahrtkosten = this.pewoKostenForm.controls.fahrtkostenB.value;
        ammKostenDataSave.verpflegungskosten = this.pewoKostenForm.controls.auswertigeVerpflegungB.value;
        ammKostenDataSave.unterkunftskosten = this.pewoKostenForm.controls.auswertigeUnterkunftB.value;
        ammKostenDataSave.kostenTotal = this.pewoKostenData.kostenTotal;
        ammKostenDataSave.bereinigterLohn = this.pewoKostenData.bereinigterLohn;

        // Map all other
        ammKostenDataSave.verkehrsmittelObject = this.verkehrsmittelOptions.find(option => option.codeId === +this.pewoKostenForm.controls.verkehrsmittel.value) as CodeDTO;
        ammKostenDataSave.lohneinbusse = this.pewoKostenData.lohneinbusse;
        ammKostenDataSave.zuschussMonatlich = this.pewoKostenData.zuschussMonatlich;
        ammKostenDataSave.ausrichtungVon = this.facade.formUtilsService.parseDate(this.pewoKostenForm.controls.ausrichtungVon.value);
        ammKostenDataSave.ausrichtungBis = this.facade.formUtilsService.parseDate(this.pewoKostenForm.controls.ausrichtungBis.value);
        ammKostenDataSave.ausrichtungszeitraumInMonaten = this.pewoKostenData.ausrichtungszeitraumInMonaten;
        ammKostenDataSave.zuschussTotal = this.pewoKostenData.zuschussTotal;

        return ammKostenDataSave;
    }

    onSave() {
        if (this.checkFormValid()) {
            this.spinnerService.activate(this.channel);

            const kostenToSave = this.mapToDTO();
            const update = this.ammDataService.updateKostenPewo(kostenToSave);
            const create = this.ammDataService.createKostenPewo(kostenToSave);

            iif(() => (this.ammKostenId ? true : false), update, create).subscribe(
                response => {
                    this.buttons.next(null);

                    this.ammDataService.getButtonsKostenPewo(this.pewoKostenData.ammEntscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });

                    if (response.data) {
                        this.pewoKostenData = response.data;
                        this.ammKostenId = this.pewoKostenData.ammKostenId;
                        this.pewoKostenForm.reset(this.mapToForm(this.pewoKostenData));
                        this.stesInfobarService.sendLastUpdate(response.data);
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

    ngOnDestroy() {
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        this.fehlermeldungenService.closeMessage();
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.toolboxService.sendConfiguration([]);
        this.stesInfobarService.sendLastUpdate({}, true);
        super.ngOnDestroy();
    }

    private deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private setDisableFieldsByEntscheidStatus(gesuchData: AmmGesuchPewoDTO) {
        let statusCode: string;

        if (gesuchData.ammGeschaeftsfallObject && gesuchData.ammGeschaeftsfallObject.allAmmEntscheid) {
            const allAmmEntscheidArray = gesuchData.ammGeschaeftsfallObject.allAmmEntscheid;

            allAmmEntscheidArray.forEach(element => {
                if (element.ammEntscheidId === this.ammEntscheidId) {
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
                if (element.ammEntscheidId === this.ammEntscheidId) {
                    entscheidNr = element.entscheidNr;
                }
            });
        }

        return entscheidNr;
    }

    private configureToolbox() {
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
                    this.openHistoryModal(this.ammKostenId, AvamCommonValueObjectsEnum.T_AMM_KOSTEN_PEWO);
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
}
