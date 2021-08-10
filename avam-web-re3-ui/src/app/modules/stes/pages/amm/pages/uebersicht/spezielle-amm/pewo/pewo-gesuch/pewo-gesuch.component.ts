import { Permissions } from '@shared/enums/permissions.enum';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormGroupDirective, FormGroup, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { AmmGesuchPewoDTO } from '@app/shared/models/dtos-generated/ammGesuchPewoDTO';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { NavigationService } from '@app/shared/services/navigation-service';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { Subject, forkJoin, iif, Subscription } from 'rxjs';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { SpinnerService, NotificationService, Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AmmGeschaeftsstatusCode } from '@app/shared/enums/domain-code/amm-geschaeftsstatus-code.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { TranslateService } from '@ngx-translate/core';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@app/shared/services/message-bus';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-pewo-gesuch',
    templateUrl: './pewo-gesuch.component.html',
    styleUrls: ['./pewo-gesuch.component.scss'],
    providers: [ObliqueHelperService]
})
export class PewoGesuchComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    /**
     * Tracks the value and validity state of a group of FormControl instances.
     *
     * @memberof PewoGesuchComponent
     */
    pewoGesuchForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof PewoGesuchComponent
     */
    channel = 'pewo-gesuch-channel';

    /**
     *  Tracks the state of the form if it is submitted.
     *
     * @memberof PewoGesuchComponent
     */
    submitted = false;

    /**
     * The variables checks if the Konktaktperson object is chosen from the modal window or not. If it is chosen
     * from the modal window the fields underneath are read-only if it isn't the fields are editable
     */
    isKontaktpersonSelected = true;

    pewoGesuchData: AmmGesuchPewoDTO;
    bearbeitungSuchenTokens: {};
    unternehmendId: number;
    kontaktPersonObject: KontakteViewDTO;
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    geschaeftsfallId: number;
    shouldKeepMessages: boolean;
    isGesuchStatusGeprueft = false;
    isTheFirstEntscheidFreigabebereitFreigegebenOderErsetzt = false;
    pewoAmmEntscheidId: number;
    vorgaengerEntscheidId: number;
    nachfolgerEntscheidId: number;
    isKpersonCleared = false;
    statusOptions: any[] = [];
    gesuchstypOptions: any[] = [];
    buttonsPewo: Subject<any[]> = new Subject();

    reloadSubscription: Subscription;
    observeClickActionSub: Subscription;
    basisNr: number;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(
        private navigationService: NavigationService,
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private ammDataService: AmmRestService,
        private spinnerService: SpinnerService,
        private route: ActivatedRoute,
        private dataRestService: StesDataRestService,
        private notificationService: NotificationService,
        protected router: Router,
        private translateService: TranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private resetDialogService: ResetDialogService,
        private modalService: NgbModal,
        private dbTranslateService: DbTranslateService,
        private authService: AuthenticationService,
        protected facade: FacadeService,
        private stesInfobarService: AvamStesInfoBarService,
        private toolboxService: ToolboxService,
        private messageBus: MessageBus,
        private ammHelper: AmmHelper,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.ammEntscheidTypeCode = AmmMassnahmenCode.PEWO;
    }

    ngOnInit() {
        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => {
            this.setSideNavigation();
            this.getData();
        });

        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesAmm.pewoGesuchHeader' });
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.geschaeftsfallId = params.get('gfId') ? +params.get('gfId') : null;
            this.pewoAmmEntscheidId = params.get('entscheidId') ? +params.get('entscheidId') : null;
        });

        this.configureToolbox();
        this.pewoGesuchForm = this.createFormGroup();
        this.getData();

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

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        this.toolboxService.sendConfiguration(
            toolboxConfig,
            this.channel,
            ToolboxDataHelper.createForAmm(
                DokumentVorlageActionDTO.TargetEntityEnum.PEWOGESUCH,
                [VorlagenKategorie.AMM_GESUCH_PEWO],
                +this.stesId,
                this.geschaeftsfallId,
                null,
                this.pewoAmmEntscheidId
            )
        );

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.geschaeftsfallId, +this.pewoGesuchData.gesuchsNr);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(+this.pewoGesuchData.ammGesuchId, AvamCommonValueObjectsEnum.T_AMM_GESUCH_PEWO);
            }
        });
    }

    /**
     * HTTP GET call.
     *
     * @memberof PewoGesuchComponent
     */
    getData() {
        this.spinnerService.activate(this.channel);
        const get = this.ammDataService.getGesuchPewo(this.stesId, this.geschaeftsfallId);
        const create = this.ammDataService.createGesuchPewo(this.stesId);
        forkJoin([
            this.dataRestService.getCode(DomainEnum.AMMGESCHAEFTSSTATUS),
            this.dataRestService.getCode(DomainEnum.GESUCHSTYPPEWO),
            iif(() => (this.geschaeftsfallId ? true : false), get, create)
        ]).subscribe(
            ([statusOptions, gesuchstypOptionsPewo, pewoGesuchResponse]) => {
                this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(statusOptions).filter(s => s.code !== AmmGeschaeftsstatusCode.PRUEFBEREIT);
                this.gesuchstypOptions = this.facade.formUtilsService.mapDropdownKurztext(gesuchstypOptionsPewo);
                this.buttonsPewo.next(null);
                if (pewoGesuchResponse.data) {
                    this.isKpersonCleared = false;
                    this.pewoGesuchData = pewoGesuchResponse.data;
                    this.initializeBearbeitungTokens(this.pewoGesuchData);
                    this.pewoAmmEntscheidId = this.ammHelper.getEntscheidId(this.pewoGesuchData.ammGeschaeftsfallObject);
                    this.unternehmendId = this.pewoGesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.pewoGesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;
                    this.getButtons();
                    this.isGesuchStatusGeprueft = this.checkIsGesuchStatusGeprueft(this.pewoGesuchData.statusObject.code);
                    this.isTheFirstEntscheidFreigabebereitFreigegebenOderErsetzt = this.checkFirstEntscheidStatus(this.pewoGesuchData.ammGeschaeftsfallObject);
                    this.basisNr = this.pewoGesuchData.ammGeschaeftsfallObject.basisNr;
                    this.vorgaengerEntscheidId = this.ammHelper.getEntscheidId(this.pewoGesuchData.ammGeschaeftsfallObject.vorgaengerObject);
                    this.nachfolgerEntscheidId = this.ammHelper.getEntscheidId(this.pewoGesuchData.ammGeschaeftsfallObject.nachfolgerObject);
                    if (!this.geschaeftsfallId) {
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        this.shouldKeepMessages = true;
                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.PEWO_GESUCH}`], {
                            queryParams: {
                                gfId: this.pewoGesuchData.ammGeschaeftsfallId,
                                entscheidId: this.pewoAmmEntscheidId
                            }
                        });
                    } else {
                        this.shouldKeepMessages = false;
                    }
                    this.pewoGesuchForm.setValue(this.mapToForm(pewoGesuchResponse.data));
                    this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);
                    this.stesInfobarService.sendLastUpdate(this.pewoGesuchData);
                    this.setSideNavigation();
                }
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    onChangeArbeitgeber(event: any) {
        if (event) {
            if (event.unternehmenId) {
                this.unternehmendId = event.unternehmenId;
            } else {
                this.unternehmendId = null;
            }
        } else {
            this.unternehmendId = null;
        }

        this.onKontaktpersonClear();
    }

    /**
     * Triggered when Zuruecknehmen Button is clicked
     *
     * @memberof PewoGesuchComponent
     */
    onGesuchPewoZuruecknehmen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammDataService.zuruecknehmenGesuchPewo(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                this.buttonsPewo.next(null);
                this.getButtons();

                if (response.data) {
                    this.pewoGesuchData = response.data;

                    this.unternehmendId = this.pewoGesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.pewoGesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;

                    this.isGesuchStatusGeprueft = this.checkIsGesuchStatusGeprueft(this.pewoGesuchData.statusObject.code);
                    this.isTheFirstEntscheidFreigabebereitFreigegebenOderErsetzt = this.checkFirstEntscheidStatus(this.pewoGesuchData.ammGeschaeftsfallObject);
                    this.pewoGesuchForm.setValue(this.mapToForm(this.pewoGesuchData));
                    this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                    this.stesInfobarService.sendLastUpdate(this.pewoGesuchData);
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                } else {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            err => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    /**
     * Triggered when Geschäftsfall ersetzen Button is clicked
     *
     * @memberof PewoGesuchComponent
     */
    onGeschaeftsfallErsetzen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammDataService.geschaeftsfallErsetzen(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    const newGeschaeftsfallId = response.data;
                    let newAmmEntscheidId: number;

                    this.ammDataService.getGesuchPewo(this.stesId, newGeschaeftsfallId).subscribe(
                        gesuchResponse => {
                            if (gesuchResponse.data) {
                                newAmmEntscheidId = this.ammHelper.getEntscheidId(gesuchResponse.data.ammGeschaeftsfallObject);
                            }

                            this.notificationService.success(this.dbTranslateService.instant('amm.nutzung.feedback.geschaeftsfallersetzt'));

                            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.PEWO_GESUCH}`], {
                                queryParams: {
                                    gfId: newGeschaeftsfallId,
                                    entscheidId: newAmmEntscheidId
                                }
                            });
                        },
                        () => {
                            this.deactivateSpinnerAndScrollTop();
                        }
                    );
                } else {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    /**
     * Submit form.
     *
     * @memberof PewoGesuchComponent
     */
    onSubmit() {
        this.fehlermeldungenService.closeMessage();
        this.submitted = true;

        if (this.pewoGesuchForm.invalid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.onSave();
    }

    /**
     * Trigger onSave when form is valid.
     *
     * @memberof PewoGesuchComponent
     */
    onSave() {
        this.spinnerService.activate(this.channel);

        this.ammDataService.updateGesuchPewo(this.stesId, this.mapToDTO()).subscribe(
            response => {
                this.buttonsPewo.next(null);
                this.getButtons();

                if (response.data) {
                    this.isKpersonCleared = false;
                    this.pewoGesuchData = response.data;

                    this.unternehmendId = this.pewoGesuchData.ammGeschaeftsfallObject.unternehmenObject
                        ? this.pewoGesuchData.ammGeschaeftsfallObject.unternehmenObject.unternehmenId
                        : null;

                    this.isGesuchStatusGeprueft = this.checkIsGesuchStatusGeprueft(this.pewoGesuchData.statusObject.code);
                    this.isTheFirstEntscheidFreigabebereitFreigegebenOderErsetzt = this.checkFirstEntscheidStatus(this.pewoGesuchData.ammGeschaeftsfallObject);
                    this.pewoGesuchForm.reset(this.mapToForm(this.pewoGesuchData));
                    this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                    this.stesInfobarService.sendLastUpdate(this.pewoGesuchData);
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                } else {
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    openModalLoeschen() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.onGeschaeftsfallLoeschen();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    /**
     * Triggered when Geschaeftsfall-Loeschen Button is clicked
     * Also redirects to the Geschaeftsfall of the vorgaenger, if there is one.
     * If not the tree table is loaded.
     *
     * @memberof PewoGesuchComponent
     */
    onGeschaeftsfallLoeschen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammDataService.geschaeftsfallLoeschen(this.stesId, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    this.pewoGesuchForm.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));

                    const vorgaengerGeschaeftsfallId = this.pewoGesuchData.ammGeschaeftsfallObject ? this.pewoGesuchData.ammGeschaeftsfallObject.vorgaengerId : null;

                    if (vorgaengerGeschaeftsfallId) {
                        const vorgaengerEntscheidIdId = this.pewoGesuchData.ammGeschaeftsfallObject
                            ? this.pewoGesuchData.ammGeschaeftsfallObject.vorgaengerObject.allAmmEntscheid[0].ammEntscheidId
                            : null;

                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.PEWO_GESUCH}`], {
                            queryParams: {
                                gfId: vorgaengerGeschaeftsfallId,
                                entscheidId: vorgaengerEntscheidIdId
                            }
                        });
                    } else {
                        this.navigationService.hideNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode));
                        this.cancel();
                    }
                } else {
                    this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
            }
        );
    }

    /**
     * Map data from backend to form object.
     *
     * @memberof PewoGesuchComponent
     * @param ammGesuchPewoData
     */
    mapToForm(ammGesuchPewoData: AmmGesuchPewoDTO) {
        const ammKontaktpersonObject = ammGesuchPewoData.ammKontaktpersonObject;

        return {
            eingangsdatum: this.facade.formUtilsService.parseDate(ammGesuchPewoData.eingangsdatum),
            beginntaetigkeit: this.facade.formUtilsService.parseDate(ammGesuchPewoData.massnahmeVon),
            bearbeitung: ammGesuchPewoData.bearbeiterDetailObject,
            gesuchsNr: ammGesuchPewoData.gesuchsNr,
            status: ammGesuchPewoData.statusObject.codeId,
            gesuchstyp: ammGesuchPewoData.typIdObject.codeId,
            arbeitgeber: ammGesuchPewoData.ammGeschaeftsfallObject ? ammGesuchPewoData.ammGeschaeftsfallObject.unternehmenObject : null,
            kontaktperson: this.setKontaktperson(ammKontaktpersonObject),
            name: ammKontaktpersonObject ? ammKontaktpersonObject.name : null,
            vorname: ammKontaktpersonObject ? ammKontaktpersonObject.vorname : null,
            telefon: ammKontaktpersonObject ? ammKontaktpersonObject.telefon : null,
            mobile: ammKontaktpersonObject ? ammKontaktpersonObject.mobile : null,
            fax: ammKontaktpersonObject ? ammKontaktpersonObject.fax : null,
            email: ammKontaktpersonObject ? ammKontaktpersonObject.email : null
        };
    }

    /**
     * Map form object to backend.
     *
     * @memberof PewoGesuchComponent
     */
    mapToDTO(): AmmGesuchPewoDTO {
        const pewoDataToSave = { ...this.pewoGesuchData };

        pewoDataToSave.eingangsdatum = this.facade.formUtilsService.parseDate(this.pewoGesuchForm.controls.eingangsdatum.value);
        pewoDataToSave.massnahmeVon = this.facade.formUtilsService.parseDate(this.pewoGesuchForm.controls.beginntaetigkeit.value);
        pewoDataToSave.bearbeiterDetailObject = this.pewoGesuchForm.controls.bearbeitung['benutzerObject'];
        pewoDataToSave.gesuchsNr = this.pewoGesuchForm.controls.gesuchsNr.value;
        pewoDataToSave.statusObject = this.statusOptions.find(option => option.codeId === +this.pewoGesuchForm.controls.status.value) as CodeDTO;
        pewoDataToSave.typIdObject = this.gesuchstypOptions.find(option => option.codeId === +this.pewoGesuchForm.controls.gesuchstyp.value) as CodeDTO;

        pewoDataToSave.ammGeschaeftsfallObject.unternehmenObject = {
            unternehmenId: this.pewoGesuchForm.controls.arbeitgeber['unternehmenAutosuggestObject'].unternehmenId,
            name1: this.pewoGesuchForm.controls.arbeitgeber['unternehmenAutosuggestObject'].name1
        };

        pewoDataToSave.ammKontaktpersonObject = this.ammHelper.initializeKperson(this.pewoGesuchForm, this.pewoGesuchData, this.kontaktPersonObject, this.isKpersonCleared);

        return pewoDataToSave;
    }

    setRequiredFields(selectedOptionCodeId: string) {
        const selectedOptionCode = this.facade.formUtilsService.getCodeByCodeId(this.statusOptions, selectedOptionCodeId);

        if (selectedOptionCode === AmmGeschaeftsstatusCode.GEPRUEFT) {
            this.pewoGesuchForm.controls.eingangsdatum.setValidators([
                Validators.required,
                DateValidator.isDateInFutureNgx,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx
            ]);
            this.pewoGesuchForm.controls.beginntaetigkeit.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            this.pewoGesuchForm.controls.arbeitgeber.setValidators(Validators.required);

            this.updateValueAndValidityOnRequiredFields();
        } else {
            this.setDefaultValidators();
            this.updateValueAndValidityOnRequiredFields();
        }
    }

    canDeactivate(): boolean {
        return this.pewoGesuchForm.dirty;
    }

    /**
     * Create form group with formBuilder.
     *
     * @returns {FormGroup}
     * @memberof PewoGesuchComponent
     */
    createFormGroup() {
        return this.formBuilder.group({
            eingangsdatum: [null, [DateValidator.isDateInFutureNgx, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            beginntaetigkeit: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            bearbeitung: null,
            gesuchsNr: null,
            status: [null, Validators.required],
            gesuchstyp: [null, Validators.required],
            arbeitgeber: null,
            kontaktperson: null,
            name: null,
            vorname: null,
            telefon: [null, this.getTelefonValidator()],
            mobile: [null, this.getTelefonValidator()],
            fax: [null, this.getTelefonValidator()],
            email: [null, this.getEmailValidator()]
        });
    }

    onKontaktpersonClear() {
        this.isKontaktpersonSelected = false;
        this.kontaktPersonObject = null;
        this.isKpersonCleared = true;
        this.pewoGesuchForm.patchValue({
            kontaktperson: null,
            name: null,
            vorname: null,
            telefon: null,
            mobile: null,
            fax: null,
            email: null
        });
    }

    onKontaktpersonSelected(kontaktperson: KontakteViewDTO) {
        this.kontaktPersonObject = kontaktperson;
        this.isKontaktpersonSelected = true;
        this.pewoGesuchForm.markAsDirty();
        this.pewoGesuchForm.patchValue({
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            telefon: kontaktperson.telefonNr,
            mobile: kontaktperson.mobileNr,
            fax: kontaktperson.telefaxNr,
            email: kontaktperson.email
        });
    }

    onReset() {
        if (this.pewoGesuchForm.dirty) {
            this.resetDialogService.reset(() => {
                this.pewoGesuchForm.reset(this.mapToForm(this.pewoGesuchData));
                this.fehlermeldungenService.closeMessage();
                this.isKontaktpersonSelected = this.isKontaktPersonSelected();
            });

            this.isKpersonCleared = false;
        }
    }

    getTelefonValidator(): ValidatorFn {
        return PhoneValidator.isValidFormatWarning;
    }

    getEmailValidator(): ValidatorFn {
        return EmailValidator.isValidFormat;
    }

    setIsKpersonCleared() {
        this.isKpersonCleared = true;
    }

    /**
     * Set side navigation for this component
     *
     * @memberof PewoGesuchComponent
     */
    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.pewoAmmEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.PEWO_GESUCH, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.pewoAmmEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.PEWO_KOSTEN, {
            gfId: this.geschaeftsfallId,
            entscheidId: this.pewoAmmEntscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.SPEZIELL_ENTSCHEID.replace(':type', this.ammEntscheidTypeCode), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.pewoAmmEntscheidId
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (!this.shouldKeepMessages) {
            this.fehlermeldungenService.closeMessage();
        }

        this.toolboxService.sendConfiguration([]);
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
    }

    private deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private setKontaktperson(kontaktperson) {
        let kontaktpersonInputValue = '';

        if (kontaktperson) {
            if (kontaktperson.name) {
                kontaktpersonInputValue += kontaktperson.name;

                if (kontaktperson.vorname) {
                    kontaktpersonInputValue += `, ${kontaktperson.vorname}`;
                }
            } else if (kontaktperson.vorname) {
                kontaktpersonInputValue += kontaktperson.vorname;
            }
        }

        return kontaktpersonInputValue;
    }

    private getButtons() {
        this.ammDataService.getButtonsAmmGesuch(this.stesId, this.pewoGesuchData.ammGeschaeftsfallId).subscribe(btnResponse => {
            this.buttonsPewo.next(btnResponse.data);
        });
    }

    private setDefaultValidators() {
        this.pewoGesuchForm.controls.eingangsdatum.setValidators([DateValidator.isDateInFutureNgx, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.pewoGesuchForm.controls.beginntaetigkeit.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        this.pewoGesuchForm.controls.arbeitgeber.clearValidators();
    }

    private updateValueAndValidityOnRequiredFields() {
        this.pewoGesuchForm.controls.eingangsdatum.updateValueAndValidity();
        this.pewoGesuchForm.controls.beginntaetigkeit.updateValueAndValidity();
        this.pewoGesuchForm.controls.arbeitgeber.updateValueAndValidity();
    }

    private checkIsGesuchStatusGeprueft(statusObjectCode: string) {
        return statusObjectCode === AmmGeschaeftsstatusCode.GEPRUEFT;
    }

    /**
     * The function gets the status of the very first Entscheid (The one that has no Vorgaenger)
     * and returns true if the Entscheid is "ersetzt", "freigegeben" or "freigabebereit"
     * @param ammGeschaeftsfallObject
     */
    private checkFirstEntscheidStatus(ammGeschaeftsfallObject: any) {
        let statusCode = null;
        const allAmmEntscheidArray = ammGeschaeftsfallObject.allAmmEntscheid;
        const allAmmEntscheidArrayLastIndex = allAmmEntscheidArray.length - 1;

        if (
            ammGeschaeftsfallObject &&
            allAmmEntscheidArray &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex] &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject
        ) {
            statusCode = allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject.code;
        }

        return statusCode === AmmVierAugenStatusCode.ERSETZT || statusCode === AmmVierAugenStatusCode.FREIGEGEBEN || statusCode === AmmVierAugenStatusCode.FREIGABEBEREIT;
    }

    private isKontaktPersonSelected(): boolean {
        return this.pewoGesuchData.ammKontaktpersonObject && !!this.pewoGesuchData.ammKontaktpersonObject.kontaktId;
    }

    private openDmsCopyModal(geschaeftsfallId: number, gesuchNr: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_STES_AMM;
        comp.id = geschaeftsfallId.toString();
        comp.nr = gesuchNr.toString();
    }

    private openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }

    private initializeBearbeitungTokens(pewoGesuchData: AmmGesuchPewoDTO) {
        const currentUser = this.authService.getLoggedUser();
        const benutzerstelleId = pewoGesuchData.ownerId ? pewoGesuchData.ownerId : currentUser.benutzerstelleId;

        if (currentUser) {
            this.bearbeitungSuchenTokens = {
                berechtigung: Permissions.AMM_NUTZUNG_GESUCH_BEARBEITEN,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                benutzerstelleId
            };
        }
    }
}
