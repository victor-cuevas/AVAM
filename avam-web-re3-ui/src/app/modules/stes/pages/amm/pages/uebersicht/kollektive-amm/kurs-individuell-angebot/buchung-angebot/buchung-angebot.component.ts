import { Permissions } from '@shared/enums/permissions.enum';
import { DmsContextSensitiveDossierDTO } from '@app/shared/models/dtos-generated/dmsContextSensitiveDossierDTO';
import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { FormGroup, FormGroupDirective, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxConfig } from '@app/shared/components/toolbox/toolbox-config';
import { SpinnerService } from 'oblique-reactive';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AmmGeschaeftsstatusCode } from '@app/shared/enums/domain-code/amm-geschaeftsstatus-code.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { forkJoin, Subject, Observable, Subscription } from 'rxjs';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { BaseResponseWrapperCollectionIntegerWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionIntegerWarningMessages';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { DmsService, RoboHelpService, GenericConfirmComponent } from '@app/shared';
import { ZeitplanDTO } from '@app/shared/models/dtos-generated/zeitplanDTO';
import { AmmStesGeschaeftsfallDTO } from '@app/shared/models/dtos-generated/ammStesGeschaeftsfallDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmBuchungSessionDTO } from '@app/shared/models/dtos-generated/ammBuchungSessionDTO';
import { AmmBuchungPraktikumsstelleDTO } from '@app/shared/models/dtos-generated/ammBuchungPraktikumsstelleDTO';
import { AmmBuchungArbeitsplatzkategorieDTO } from '@app/shared/models/dtos-generated/ammBuchungArbeitsplatzkategorieDTO';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';

import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-buchung-angebot',
    templateUrl: './buchung-angebot.component.html',
    styleUrls: ['./buchung-angebot.component.scss'],
    providers: [ObliqueHelperService]
})
export class BuchungAngebotComponent extends AmmCloseableAbstract implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('bearbeitung') bearbeitung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('infobarBasisNr') infobarBasisNr: TemplateRef<any>;

    buchungForm: FormGroup;
    channel = 'BuchungImAngebotChannel';

    isWizard = true;
    currentMassnahmeId: number;
    showZustimmungLam = false;
    showButtonWeiter = true;
    buchungData: AmmBuchungParamDTO;
    isReadonly: boolean;
    disabledValueBewirtschafter = true;
    massnahmenverantwortungSuchenTokens: {};
    verfuegbarkeitOptions: CodeDTO[] = [];
    buchungsStatusOptions: CodeDTO[] = [];
    yesNoOptions: CodeDTO[] = [];
    clearCheckboxes = true;
    bearbeiterSuchenTokens: {};
    geschaeftsfallId = 0;
    entscheidId: number;
    ammMassnahmenType = AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT;
    buchungsStatusOptionsUnmapped: CodeDTO[];
    basisNr: number;
    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;

    langChangeSubscription: Subscription;
    observeClickActionSub: Subscription;
    permissions: typeof Permissions = Permissions;

    vorgaengerEntscheidId: number;
    nachfolgerEntscheidId: number;
    vorgaengerGfId: any;
    nachvolgerGfId: any;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    get massnahmeId() {
        return this.wizardService.getMassnahmeId();
    }

    constructor(
        private wizardService: MassnahmeBuchenWizardService,
        private ammDataService: AmmRestService,
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private dataService: StesDataRestService,
        protected facade: FacadeService,
        private ammHelper: AmmHelper,
        private dmsService: DmsService,
        private stesInfobarService: AvamStesInfoBarService,
        private roboHelpService: RoboHelpService,
        protected readonly modalService: NgbModal,
        protected router: Router,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.ammEntscheidTypeCode = this.ammMassnahmenType;

        const onSaveObs = new Observable<boolean>(subscriber => {
            if (!this.buchungForm.controls.benutzer.value) {
                this.bearbeitung.appendCurrentUser();
            }
            this.onSave(() => {
                subscriber.next(true);
                this.wizardService.notFirstEntry = true;
            });
        });

        const onPreviousObs = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            subscriber.next(true);
            subscriber.complete();
        });

        this.wizardService.setOnNextStep(onSaveObs);
        this.wizardService.setOnPreviousStep(onPreviousObs);
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.buchungForm = this.createForm();

        this.route.data.subscribe(data => {
            this.isWizard = data.wizard;
            if (!this.isWizard) {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];

                    this.route.queryParamMap.subscribe(param => {
                        this.geschaeftsfallId = +param.get('gfId');
                        this.entscheidId = param.get('entscheidId') ? +param.get('entscheidId') : null;
                        this.wizardService.setMassnahmeCode(this.ammMassnahmenType);
                        this.getData();
                        this.showSideNavItems();
                    });
                });
                this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
                    this.stesInfobarService.sendDataToInfobar({ title: this.getNonWizardUeberschrift(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                });
            } else {
                this.stesId = this.wizardService.getStesId().toString();
                this.geschaeftsfallId = this.wizardService.gfId;

                this.subscribeWizardToFormChanges();
                this.getData();

                this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
                    this.stesInfobarService.sendDataToInfobar({ title: this.getUeberschrift() });
                });
            }

            this.configureToolbox();
        });
        super.ngOnInit();
    }

    isOurLabel(message) {
        return message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS_IN_ANGEBOT);
    }

    isOurUrl(): boolean {
        return true;
    }

    cancel() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
    }

    createForm(): FormGroup {
        return this.formBuilder.group(
            {
                ergaenzendeAngaben: null,
                gueltigVon: null,
                gueltigBis: null,
                durchLamPrufen: null,
                massnahmenNr: null,
                unternehmen: null,
                verantwortlichePerson: null,
                teilnehmer: null,
                teilnehmerVon: null,
                gesuchseingang: [null, [DateValidator.isDateInFutureNgx, DateValidator.dateValidNgx]],
                durchfuehrungVon: [null, [Validators.required, DateValidator.dateValidNgx, DateValidator.dateFormatNgx]],
                durchfuehrungBis: [null, [Validators.required, DateValidator.dateValidNgx, DateValidator.dateFormatNgx]],
                anzahlKurstage: [null, [Validators.required, NumberValidator.isPositiveInteger, NumberValidator.val131]],
                anzahlLektionen: [null, [NumberValidator.isPositiveInteger, NumberValidator.val131]],
                verfuegbarkeit: [null, Validators.required],
                vormittags: new FormArray([
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false)
                ]),
                nachmittags: new FormArray([
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false),
                    new FormControl(false)
                ]),
                kurszeiten: null,
                benutzer: [null, Validators.required],
                durchfuehrungsNr: null,
                buchungsNr: null,
                vorgaenger: null,
                nachfolger: null,
                buchungsStatus: [null, Validators.required],
                zustimmungLam: null
            },
            {
                validators: [
                    DateValidator.rangeBetweenDates('durchfuehrungVon', 'durchfuehrungBis', 'val201'),
                    DateValidator.val186('durchfuehrungVon', 'durchfuehrungBis', 'anzahlKurstage'),
                    DateValidator.checkPeriodGreaterThan12('durchfuehrungVon', 'durchfuehrungBis'),
                    NumberValidator.checkDaysMoreThanLessons('anzahlKurstage', 'anzahlLektionen') // week validators more to be implemented
                ]
            }
        );
    }

    mapToForm(data: AmmBuchungParamDTO) {
        this.clearCheckboxes = false;
        const buchungObject = data.ammBuchungSession;
        const teilnehmerVon = this.getTeilnehmerVon(data);

        let buchungsNr = null;
        let gesuchseingang = null;

        if (buchungObject) {
            buchungsNr = buchungObject.buchungsNr;
            gesuchseingang = this.facade.formUtilsService.parseDate(buchungObject.gesuchseingang);
        }

        return {
            ergaenzendeAngaben: this.facade.dbTranslateService.translate(data.ergaenzendeAngaben, 'name'),
            gueltigVon: this.facade.formUtilsService.parseDate(data.gueltigVon),
            gueltigBis: this.facade.formUtilsService.parseDate(data.gueltigBis),
            durchLamPrufen: data.pruefenDurchLam,
            massnahmenNr: data.massnahmeId,
            unternehmen: data.unternehmenObject,
            verantwortlichePerson: data.benutzerDetailDTO,
            teilnehmer: data.anzahlTeilnehmer,
            teilnehmerVon,
            gesuchseingang,
            durchfuehrungVon:
                this.isWizard && !this.wizardService.notFirstEntry
                    ? this.facade.formUtilsService.parseDate(data.gueltigVon)
                    : this.facade.formUtilsService.parseDate(data.durchfuehrungVon),
            durchfuehrungBis:
                this.isWizard && !this.wizardService.notFirstEntry
                    ? this.facade.formUtilsService.parseDate(data.gueltigBis)
                    : this.facade.formUtilsService.parseDate(data.durchfuehrungBis),
            anzahlKurstage: data.anzahlKurstage,
            anzahlLektionen: data.anzahlLektionen,
            verfuegbarkeit: data.zeitplanObject ? (data.zeitplanObject.verfuegbarkeitObject ? data.zeitplanObject.verfuegbarkeitObject.codeId.toString() : null) : null,
            vormittags: this.setVormittags(data.zeitplanObject),
            nachmittags: this.setNachmittags(data.zeitplanObject),
            kurszeiten: data.zeitplanObject ? this.facade.dbTranslateService.translate(data.zeitplanObject, 'arbeitszeit') : null,
            benutzer: buchungObject.benutzerDetailDTO,
            durchfuehrungsNr: data.durchfuehrungsId,
            buchungsNr,
            vorgaenger: null,
            nachfolger: null,
            buchungsStatus: this.facade.formUtilsService.getCodeIdByCode(this.buchungsStatusOptionsUnmapped, buchungObject.statusObject.code),
            zustimmungLam: data.zustimmungLam !== null ? +data.zustimmungLam : ''
        };
    }

    getTeilnehmerVon(data: AmmBuchungParamDTO): string {
        const teilnehmer = data.anzahlTeilnehmer;
        const teilnehmerVon = data.maxTeilnehmer;
        const applicable = data.maxTeilnehmerApplicable;

        if (applicable && teilnehmerVon && teilnehmerVon > 0) {
            if (teilnehmerVon - teilnehmer <= 0) {
                this.showButtonWeiter = false;
            }
            return teilnehmerVon.toString();
        }

        return AmmConstants.VALUE_NOT_APPLICABLE;
    }

    getVorgaengerObject(): AmmStesGeschaeftsfallDTO {
        const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);

        return buchungObject && buchungObject.ammGeschaeftsfallObject && buchungObject.ammGeschaeftsfallObject.vorgaengerObject
            ? buchungObject.ammGeschaeftsfallObject.vorgaengerObject
            : null;
    }

    getData() {
        this.activateSpinner();
        forkJoin<BaseResponseWrapperListCodeDTOWarningMessages, CodeDTO[], BaseResponseWrapperAmmBuchungParamDTOWarningMessages, CodeDTO[]>([
            this.ammDataService.getBuchungsStati(this.geschaeftsfallId, this.ammMassnahmenType),
            this.dataService.getCode(DomainEnum.VERFUEGBARKEITAMM),
            this.ammDataService.getAmmBuchungParam(this.geschaeftsfallId, this.wizardService.getMassnahmeCode(), this.stesId, this.wizardService.getMassnahmeId()),
            this.dataService.getFixedCode(DomainEnum.YES_NO_OPTIONS)
        ]).subscribe(
            ([status, verf, buchungData, yesNoLabels]) => {
                this.buchungsStatusOptionsUnmapped = status.data;
                this.buchungsStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(status.data);
                this.verfuegbarkeitOptions = this.facade.formUtilsService.mapDropdownKurztext(verf);
                this.yesNoOptions = this.facade.formUtilsService.mapDropdownKurztext(yesNoLabels);
                this.buchungForm.setValidators([
                    this.buchungForm.validator,
                    AmmValidators.requiredWeekDays(
                        'vormittags',
                        'nachmittags',
                        'verfuegbarkeit',
                        this.facade.formUtilsService.getCodeIdByCode(this.verfuegbarkeitOptions, VerfuegbarkeitAMMCodeEnum.WOCHENPLAN)
                    )
                ]);
                if (buchungData.data) {
                    this.updateForm(buchungData.data);
                    this.currentMassnahmeId = buchungData.data.massnahmeId;

                    if (this.buchungData.ammBuchungSession.ammGeschaeftsfallObject) {
                        this.vorgaengerEntscheidId = this.ammHelper.getEntscheidId(this.buchungData.ammBuchungSession.ammGeschaeftsfallObject.vorgaengerObject);
                        this.nachfolgerEntscheidId = this.ammHelper.getEntscheidId(this.buchungData.ammBuchungSession.ammGeschaeftsfallObject.nachfolgerObject);
                        this.vorgaengerGfId = this.buchungData.ammBuchungSession.ammGeschaeftsfallObject.vorgaengerId;
                        this.nachvolgerGfId = this.buchungData.ammBuchungSession.ammGeschaeftsfallObject.nachfolgerId;
                    }
                    const buchungObj = this.ammHelper.getAmmBuchung(this.buchungData);
                    this.setPersonalBeraterSuchenTokens(buchungObj);
                    this.showZustimmungLam = this.buchungData.pruefenDurchLam;
                    if (!this.isWizard) {
                        if (buchungObj.ammGeschaeftsfallObject) {
                            this.basisNr = buchungObj.ammGeschaeftsfallObject.basisNr;
                        }
                        this.stesInfobarService.sendLastUpdate(buchungObj);
                        this.stesInfobarService.addItemToInfoPanel(this.infobarBasisNr);
                        this.stesInfobarService.sendDataToInfobar({
                            title: this.getNonWizardUeberschrift(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name'))
                        });
                    } else {
                        this.stesInfobarService.sendDataToInfobar({ title: this.getUeberschrift() });
                        if (!this.wizardService.notFirstEntry) {
                            this.setDefaultValues(buchungObj);
                        }
                        this.wizardService.unternehmenId = buchungData.data.unternehmenObject.unternehmenId;
                    }
                    this.getButttonsAndStatus();
                } else {
                    this.deactivateSpinner();
                }
            },
            () => {
                this.deactivateSpinner();
            }
        );
    }

    getButttonsAndStatus() {
        forkJoin<BaseResponseWrapperListCodeDTOWarningMessages, BaseResponseWrapperCollectionIntegerWarningMessages>([
            this.ammDataService.getBuchungsStati(this.geschaeftsfallId, this.ammMassnahmenType),
            this.ammDataService.getAmmBuchungButtons(this.buchungData.durchfuehrungsId, this.ammMassnahmenType, this.stesId.toString(), this.geschaeftsfallId)
        ]).subscribe(
            ([status, buttonRes]) => {
                this.buchungsStatusOptionsUnmapped = status.data;
                this.buchungsStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(status.data);
                this.buttons.next(buttonRes.data);
                this.deactivateSpinner();
            },
            () => {
                this.deactivateSpinner();
            }
        );
    }

    getUeberschrift(): string {
        const wizardBezeichnung = this.facade.translateService.instant('amm.massnahmen.label.massnahmeBuchen');
        const buchung = this.facade.translateService.instant('amm.nutzung.label.buchung');
        const massnahmenLabel = this.facade.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const title = this.facade.dbTranslateService.translateWithOrder(this.buchungData.titel, 'name');
        const erfassenTranslatedLabel = this.facade.translateService.instant('amm.nutzung.alttext.erfassen');

        return `${wizardBezeichnung} - ${buchung} ${massnahmenLabel} ${title} ${erfassenTranslatedLabel}`;
    }

    getNonWizardUeberschrift(title?) {
        const massnahmenLabel = this.facade.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const durchfuehrungTranslatedLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.grunddatenbuchung');

        if (title) {
            return `${massnahmenLabel} ${title} - ${durchfuehrungTranslatedLabel}`;
        } else {
            return `${massnahmenLabel} - ${durchfuehrungTranslatedLabel}`;
        }
    }

    setVormittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moV, zeitplanObject.diV, zeitplanObject.miV, zeitplanObject.doV, zeitplanObject.frV, zeitplanObject.saV, zeitplanObject.soV];
    }

    setNachmittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moN, zeitplanObject.diN, zeitplanObject.miN, zeitplanObject.doN, zeitplanObject.frN, zeitplanObject.saN, zeitplanObject.soN];
    }

    updateForm(buchungData: AmmBuchungParamDTO) {
        if (buchungData) {
            this.isReadonly = this.ammHelper.getAmmBuchung(buchungData).gesperrt;
            this.buchungData = buchungData;
            this.buchungForm.reset(this.mapToForm(buchungData));
            this.disabledValueBewirtschafter = this.ammHelper.getAmmBuchung(buchungData).teilweiseGesperrt;
        }
    }

    /**
     * Check if form is dirty and notifiy DeactivationGuard.
     *
     * @memberof BuchungAngebotComponent
     */
    canDeactivate() {
        return this.buchungForm.dirty;
    }

    onDmsClick() {
        this.facade.fehlermeldungenService.closeMessage();
        const reqDto: DmsContextSensitiveDossierDTO = {
            stesId: +this.stesId,
            uiNumber: StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_INDIV_IM_ANGEBOT,
            language: this.facade.dbTranslateService.getCurrentLang(),
            documentId: this.currentMassnahmeId
        };

        this.dmsService.openDMSWindowWithParams(reqDto);
    }

    configureToolbox() {
        let toolboxConfig: ToolboxConfiguration[] = [];

        if (this.isWizard) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        } else {
            toolboxConfig = ToolboxConfig.getAmmBearbeitenConfig();
        }

        this.facade.toolboxService.sendConfiguration(
            toolboxConfig,
            this.channel,
            ToolboxDataHelper.createForBuchung(+this.stesId, this.geschaeftsfallId, this.massnahmeId, this.ammMassnahmenType, this.entscheidId)
        );

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (this.isWizard && action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_INDIV_IM_ANGEBOT);
            }
            if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.geschaeftsfallId, +buchungObject.ammBuchungId);
            }
            if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(buchungObject.ammBuchungId, AvamCommonValueObjectsEnum.T_AMM_BUCHUNGSESSION);
            }
        });
    }

    openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId.toString();
        comp.type = objType;
    }

    openDmsCopyModal(geschaeftsfallId: number, buchungNr: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_STES_AMM;
        comp.id = geschaeftsfallId.toString();
        comp.nr = buchungNr.toString();
    }

    back() {
        this.wizardService.movePrev();
    }

    setDefaultValues(buchungObj: any) {
        this.bearbeitung.appendCurrentUser();
        this.buchungForm.controls.buchungsStatus.setValue(this.facade.formUtilsService.getCodeIdByCode(this.buchungsStatusOptionsUnmapped, AmmGeschaeftsstatusCode.PENDENT));
        this.buchungForm.controls.verfuegbarkeit.setValue(this.facade.formUtilsService.getCodeIdByCode(this.verfuegbarkeitOptions, VerfuegbarkeitAMMCodeEnum.VOLLZEIT));

        if (buchungObj) {
            this.buchungForm.controls.anzahlKurstage.setValue(buchungObj.anzahlKurstage);
            this.buchungForm.controls.anzahlLektionen.setValue(buchungObj.anzahlLektionen);
        }
    }

    next() {
        this.wizardService.moveNext();
    }

    onSave(onDone?) {
        if (!this.buchungForm.controls.benutzer.value) {
            this.bearbeitung.appendCurrentUser();
        }

        const buchungData = this.mapToDTO();
        this.facade.fehlermeldungenService.closeMessage();

        if (this.buchungForm.valid) {
            this.activateSpinner();

            this.ammDataService
                .saveIndividuellImAngebot(
                    buchungData,
                    this.ammMassnahmenType,
                    this.stesId.toString(),
                    this.geschaeftsfallId,
                    this.massnahmeId,
                    this.facade.translateService.currentLang
                )
                .subscribe(
                    response => {
                        if (response.data) {
                            const buchungObject = this.ammHelper.getAmmBuchung(response.data);
                            this.wizardService.gfId = buchungObject.ammGeschaeftsfallId;

                            this.updateForm(response.data);
                            if (!this.isWizard) {
                                this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                            }

                            if (onDone) {
                                onDone();
                            }
                            this.buttons.next(null);
                            this.getButttonsAndStatus();
                        } else {
                            this.deactivateSpinner();
                        }
                    },
                    () => {
                        this.deactivateSpinner();
                        if (!this.isWizard) {
                            this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                        }
                    }
                );
        } else {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
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
     * @memberof BuchungAngebotComponent
     */
    onGeschaeftsfallLoeschen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        this.ammDataService.geschaeftsfallLoeschen(this.stesId.toString(), this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    this.buchungForm.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));

                    const vorgaenger = this.getVorgaengerObject();

                    if (vorgaenger) {
                        this.navigateToGeschaeftfall(vorgaenger);
                    } else {
                        this.facade.navigationService.hideNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType));
                        this.router.navigate([`stes/details/${this.stesId}/amm/uebersicht`]);
                    }
                } else {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                }

                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            },
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            }
        );
    }

    onGeschaeftsfallErsetzen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.buchungErsetzen(this.geschaeftsfallId.toString()).subscribe(
            response => {
                if (response.data) {
                    const newGeschaeftsfallId = response.data.geschaeftsfallId;
                    if (newGeschaeftsfallId !== +this.geschaeftsfallId) {
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.nutzung.feedback.buchungersetzt'));
                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG.replace(':type', this.ammMassnahmenType)}`], {
                            queryParams: {
                                gfId: newGeschaeftsfallId,
                                entscheidId: response.data.entscheidId
                            }
                        });
                    } else {
                        this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                    }
                } else {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            error => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    onZuruecknehmen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.zuruecknehmenBuchung(+this.geschaeftsfallId, this.ammMassnahmenType, this.facade.translateService.currentLang).subscribe(
            res => {
                if (res.data && res.data.ammBuchungSession) {
                    this.isReadonly = res.data.ammBuchungSession.gesperrt;
                    this.updateForm(res.data);

                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    this.buttons.next(null);
                    this.getButttonsAndStatus();
                } else {
                    this.buttons.next(null);
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                    this.deactivateSpinnerAndScrollTop();
                }
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    navigateToGeschaeftfall(vorgaenger: AmmStesGeschaeftsfallDTO) {
        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG.replace(':type', this.ammMassnahmenType)}`], {
            queryParams: {
                gfId: vorgaenger.ammGeschaeftsfallId,
                entscheidId: this.ammHelper.getEntscheidId(vorgaenger)
            }
        });
    }

    mapToDTO(): AmmBuchungParamDTO {
        const buchungData: AmmBuchungParamDTO = JSON.parse(JSON.stringify(this.buchungData));
        const buchungObject = this.ammHelper.getAmmBuchung(buchungData);
        const unternehmen = this.buchungForm.controls.unternehmen['unternehmenAutosuggestObject'];
        buchungData.ergaenzendeAngaben = {
            nameDe: this.buchungForm.controls.ergaenzendeAngaben.value,
            nameFr: this.buchungForm.controls.ergaenzendeAngaben.value,
            nameIt: this.buchungForm.controls.ergaenzendeAngaben.value
        };
        buchungData.durchfuehrungsId = this.buchungForm.controls.durchfuehrungsNr.value;
        buchungData.durchfuehrungVon = this.facade.formUtilsService.parseDate(this.buchungForm.controls.durchfuehrungVon.value);
        buchungData.durchfuehrungBis = this.facade.formUtilsService.parseDate(this.buchungForm.controls.durchfuehrungBis.value);
        buchungObject.buchungVon = this.facade.formUtilsService.parseDate(this.buchungForm.controls.durchfuehrungVon.value);
        buchungObject.buchungBis = this.facade.formUtilsService.parseDate(this.buchungForm.controls.durchfuehrungBis.value);
        buchungData.gueltigVon = this.facade.formUtilsService.parseDate(this.buchungForm.controls.gueltigVon.value);
        buchungData.gueltigBis = this.facade.formUtilsService.parseDate(this.buchungForm.controls.gueltigBis.value);
        buchungData.benutzerDetailDTO = this.buchungForm.controls.verantwortlichePerson['benutzerObject'];
        buchungObject.benutzerDetailDTO = this.buchungForm.controls.benutzer['benutzerObject'];
        buchungData.unternehmenObject = { unternehmenId: unternehmen.unternehmenId, name1: unternehmen.name1 };
        buchungObject.buchungsNr = this.buchungForm.controls.buchungsNr.value;
        buchungObject.statusId = this.buchungForm.controls.buchungsStatus.value;
        buchungObject.statusObject.codeId = this.buchungForm.controls.buchungsStatus.value;
        buchungObject.statusObject.code = this.getStatusCode(this.buchungForm.controls.buchungsStatus.value);
        buchungObject['gesuchseingang'] = this.facade.formUtilsService.parseDate(this.buchungForm.controls.gesuchseingang.value);
        buchungData.pruefenDurchLam = this.buchungForm.controls.durchLamPrufen.value ? this.buchungForm.controls.durchLamPrufen.value : false;
        buchungData.zustimmungLam = this.buchungForm.controls.zustimmungLam.value !== '' ? !!+this.buchungForm.controls.zustimmungLam.value : null;
        buchungData.anzahlKurstage = this.buchungForm.controls.anzahlKurstage.value;
        buchungObject['anzahlKurstage'] = this.buchungForm.controls.anzahlKurstage.value;
        buchungObject['anzahlLektionen'] = this.buchungForm.controls.anzahlLektionen.value;
        buchungData.anzahlLektionen = Number(this.buchungForm.controls.anzahlLektionen.value);
        buchungData.zeitplanObject.arbeitszeitDe = this.buchungForm.controls.kurszeiten.value;
        buchungData.zeitplanObject.arbeitszeitFr = this.buchungForm.controls.kurszeiten.value;
        buchungData.zeitplanObject.arbeitszeitIt = this.buchungForm.controls.kurszeiten.value;
        buchungData.zeitplanObject.verfuegbarkeitObject.codeId = this.buchungForm.controls.verfuegbarkeit.value;
        buchungData.zeitplanObject.moV = this.buchungForm.controls.vormittags.value[0];
        buchungData.zeitplanObject.diV = this.buchungForm.controls.vormittags.value[1];
        buchungData.zeitplanObject.miV = this.buchungForm.controls.vormittags.value[2];
        buchungData.zeitplanObject.doV = this.buchungForm.controls.vormittags.value[3];
        buchungData.zeitplanObject.frV = this.buchungForm.controls.vormittags.value[4];
        buchungData.zeitplanObject.saV = this.buchungForm.controls.vormittags.value[5];
        buchungData.zeitplanObject.soV = this.buchungForm.controls.vormittags.value[6];
        buchungData.zeitplanObject.moN = this.buchungForm.controls.nachmittags.value[0];
        buchungData.zeitplanObject.diN = this.buchungForm.controls.nachmittags.value[1];
        buchungData.zeitplanObject.miN = this.buchungForm.controls.nachmittags.value[2];
        buchungData.zeitplanObject.doN = this.buchungForm.controls.nachmittags.value[3];
        buchungData.zeitplanObject.frN = this.buchungForm.controls.nachmittags.value[4];
        buchungData.zeitplanObject.saN = this.buchungForm.controls.nachmittags.value[5];
        buchungData.zeitplanObject.soN = this.buchungForm.controls.nachmittags.value[6];
        return buchungData;
    }

    cancelWizard() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
    }

    onReset() {
        if (this.buchungForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.buchungForm.reset(this.mapToForm(this.buchungData));

                if (this.isWizard && !this.wizardService.notFirstEntry) {
                    this.setDefaultValues(this.ammHelper.getAmmBuchung(this.buchungData));
                }
            });
        }
    }

    ngOnDestroy(): void {
        this.facade.toolboxService.sendConfiguration([]);

        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (!this.isWizard) {
            this.facade.fehlermeldungenService.closeMessage();
            this.stesInfobarService.removeItemFromInfoPanel(this.infobarBasisNr);
            this.stesInfobarService.sendLastUpdate({}, true);
        }
        super.ngOnDestroy();
    }

    private subscribeWizardToFormChanges() {
        if (this.isWizard) {
            this.wizardService.isDirty.buchung = this.buchungForm.dirty;
            this.buchungForm.valueChanges.subscribe(value => {
                this.wizardService.isDirty.buchung = this.buchungForm.dirty;
            });
        }
    }

    private getStatusCode(codeId: string) {
        return this.facade.formUtilsService.getCodeByCodeId(this.buchungsStatusOptions, codeId);
    }

    private activateSpinner() {
        if (this.isWizard) {
            this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        } else {
            this.facade.spinnerService.activate(this.channel);
        }
    }

    private deactivateSpinner() {
        if (this.isWizard) {
            this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
        } else {
            this.deactivateSpinnerAndScrollTop();
        }
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private showSideNavItems() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });

        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_KOSTEN.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
    }

    private setPersonalBeraterSuchenTokens(buchungObj: AmmBuchungSessionDTO | AmmBuchungPraktikumsstelleDTO | AmmBuchungArbeitsplatzkategorieDTO) {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = buchungObj.ownerId ? buchungObj.ownerId : currentUser.benutzerstelleId;

        if (currentUser) {
            this.massnahmenverantwortungSuchenTokens = {
                berechtigung: Permissions.AMM_NUTZUNG_MASSNAHME_BEWIRTSCHAFTEN,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                benutzerstelleId
            };
            this.bearbeiterSuchenTokens = {
                berechtigung: Permissions.AMM_NUTZUNG_BUCHUNG_BEARBEITEN,
                myBenutzerstelleId: benutzerstelleId,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                benutzerstelleId
            };
        }
    }

    private getmassnahmeObject(buchungObject: AmmBuchungSessionDTO) {
        return buchungObject.sessionObject ? buchungObject.sessionObject.massnahmeObject : null;
    }
}
