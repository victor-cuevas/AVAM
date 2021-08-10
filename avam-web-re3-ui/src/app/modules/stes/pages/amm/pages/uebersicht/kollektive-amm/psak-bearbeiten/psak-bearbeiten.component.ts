import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { NavigationService } from '@app/shared/services/navigation-service';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { MessageBus } from '@app/shared/services/message-bus';
import { Subscription, forkJoin, Subject } from 'rxjs';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { PsakFormHandler } from './psak-form-handler';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { ToolboxService, RoboHelpService, DmsService, FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { SpinnerService, NotificationService } from 'oblique-reactive';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { DmsContextSensitiveDossierDTO } from '@app/shared/models/dtos-generated/dmsContextSensitiveDossierDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AmmBuchungArbeitsplatzkategorieDTO } from '@app/shared/models/dtos-generated/ammBuchungArbeitsplatzkategorieDTO';
import { AmmBuchungPraktikumsstelleDTO } from '@app/shared/models/dtos-generated/ammBuchungPraktikumsstelleDTO';
import { TranslateService } from '@ngx-translate/core';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { filter, map, first } from 'rxjs/operators';
import { StringHelper } from '@app/shared/helpers/string.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-psak-bearbeiten',
    templateUrl: './psak-bearbeiten.component.html',
    styleUrls: ['./psak-bearbeiten.component.scss'],
    providers: [PsakFormHandler]
})
export class PsakBearbeitenComponent extends AmmCloseableAbstract implements OnInit, OnDestroy {
    @ViewChild('bearbeitung') bearbeitung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('infobarTemp') infobarTemp: TemplateRef<any>;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    channel = 'psak-channel';
    durchfuehrungsLabel = 'amm.massnahmen.label.durchfuehrungsnr';
    unternehmenLabel = 'amm.massnahmen.label.anbieter';

    geschaeftsfallId: string;
    entscheidId: string;
    buchungId: number;
    massnahmeId: number;
    massnahmenType: string;
    buchungObject: AmmBuchungArbeitsplatzkategorieDTO | AmmBuchungPraktikumsstelleDTO;
    lastData: AmmBuchungParamDTO;
    vorgaengerBuchungsNr: number;
    vorgaengerEntscheidId: number;
    nachfolgerBuchungsNr: number;
    nachfolgerEntscheidId: number;
    bearbeiterSuchenTokens: {};
    isGesperrt = false;
    basisNr: number;

    massnahmeForm: FormGroup;

    verfuegbarkeitOptions = [];
    verfuegbarkeitDTOs: CodeDTO[];
    statusOptions = [];
    statusDTOs: CodeDTO[];
    clearCheckboxes = true;
    showAvailabilityWarningMornings = false;
    showAvailabilityWarningAfternoons = false;
    verfuegbarkeitMornings = [];
    verfuegbarkeitAfternoons = [];

    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    toolboxSubscription: Subscription;
    langChangeSubscription: Subscription;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(
        private route: ActivatedRoute,
        private navigationService: NavigationService,
        private messageBus: MessageBus,
        private dbTranslateService: DbTranslateService,
        protected router: Router,
        private psakFormHandler: PsakFormHandler,
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private roboHelpService: RoboHelpService,
        private dmsService: DmsService,
        private fehlermeldungenService: FehlermeldungenService,
        private stesRestService: StesDataRestService,
        private ammRestService: AmmRestService,
        private notificationService: NotificationService,
        private spinnerService: SpinnerService,
        private ammHelper: AmmHelper,
        private stesInfobarService: AvamStesInfoBarService,
        private translateService: TranslateService,
        protected facade: FacadeService,
        private resetDialogService: ResetDialogService,
        private obliqueHelper: ObliqueHelperService,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.massnahmeForm = this.psakFormHandler.createFormGroup();
        this.getParams();
        this.toolboxSubscription = this.subscribeToToolbox();

        this.langChangeSubscription = this.subscribeToLangChange();
        super.ngOnInit();
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                window.print();
            } else if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.MASSNAHME_BUCHEN);
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.geschaeftsfallId, this.entscheidId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                if (this.massnahmenType === AmmMassnahmenCode.AP || this.massnahmenType === AmmMassnahmenCode.BP) {
                    this.openHistoryModal(this.buchungId, AvamCommonValueObjectsEnum.T_AMM_BUCHUNGPRAKTIKUMSSTELLE);
                } else {
                    this.openHistoryModal(this.buchungId, AvamCommonValueObjectsEnum.T_AMM_BUCHUNGARBEITSPLATZKATEGORIE);
                }
            }
        });
    }

    subscribeToLangChange(): Subscription {
        return this.translateService.onLangChange.subscribe(() => {
            this.massnahmeForm.patchValue({
                ergaenzendeAngaben: this.lastData.ergaenzendeAngaben ? this.dbTranslateService.translateWithOrder(this.lastData.ergaenzendeAngaben, 'name') : null,
                taetigkeit: this.lastData.taetigkeit ? this.lastData.taetigkeit : null,
                arbeitszeiten: this.lastData.zeitplanObject ? this.dbTranslateService.translateWithOrder(this.lastData.zeitplanObject, 'arbeitszeit') : null,
                abfederung: this.lastData.sozialeAbfederung ? this.dbTranslateService.instant('i18n.common.yes') : this.dbTranslateService.instant('i18n.common.no'),
                arbeitszeitenBuchung: this.buchungObject['zeitplanObject'] ? this.dbTranslateService.translateWithOrder(this.buchungObject['zeitplanObject'], 'arbeitszeit') : null
            });
            const ueberschrift = this.getUeberschrift(this.dbTranslateService.translateWithOrder(this.lastData.titel, 'name'));
            this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.prepareToolboxData());
    }

    prepareToolboxData(): DokumentVorlageToolboxData {
        let targetEntity: DokumentVorlageActionDTO.TargetEntityEnum = null;
        const categories: VorlagenKategorie[] = [VorlagenKategorie.AMM_BESCHAEFTIGUNGSEINHEIT];

        switch (this.massnahmenType) {
            case AmmMassnahmenCode.AP:
                targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.APBUCHUNG;
                categories.push(VorlagenKategorie.AMM_BUCHUNG_AP);
                break;
            case AmmMassnahmenCode.BP:
                targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.BPBUCHUNG;
                categories.push(VorlagenKategorie.AMM_BUCHUNG_BP);
                break;
            case AmmMassnahmenCode.UEF:
                targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.UEFBUCHUNG;
                categories.push(VorlagenKategorie.AMM_BUCHUNG_UEF);
                break;
            case AmmMassnahmenCode.PVB:
                targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.PVBBUCHUNG;
                categories.push(VorlagenKategorie.AMM_BUCHUNG_PVB);
                break;
            case AmmMassnahmenCode.SEMO:
                targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.SEMOBUCHUNG;
                categories.push(VorlagenKategorie.AMM_BUCHUNG_SEMO);
                break;
        }

        return ToolboxDataHelper.createForAmm(targetEntity, categories, +this.stesId, +this.geschaeftsfallId, this.massnahmeId, +this.entscheidId);
    }

    openDmsCopyModal(gfId: string, nr: string) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_STES_AMM;
        comp.id = gfId;
        comp.nr = nr;
    }

    openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }

    isOurLabel(message) {
        return this.isTypePsAk(message.data.label);
    }

    isOurUrl(): boolean {
        return this.isRoutePsAk(this.router.url);
    }

    cancel() {
        if (this.isRoutePsAk(this.router.url)) {
            this.router.navigate([`stes/details/${this.stesId}/amm/uebersicht`]);
        }
    }

    getParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];

            this.route.paramMap.subscribe(param => {
                this.massnahmenType = param.get('type');
                this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.massnahmenType)];
            });

            this.route.queryParamMap.subscribe(param => {
                this.geschaeftsfallId = param.get('gfId');
                this.entscheidId = param.get('entscheidId');

                this.getData();

                this.setSideNavigation();
            });
        });

        const state = window.history.state;
        if (state && state.warningMessages) {
            this.showWarningMessages(state.warningMessages);
        }
    }

    getData() {
        this.spinnerService.activate(this.channel);
        forkJoin(
            this.stesRestService.getCode(DomainEnum.VERFUEGBARKEITAMM),
            this.ammRestService.getBuchungsStati(+this.geschaeftsfallId, this.massnahmenType),
            this.ammRestService.getAmmBuchungParam(this.geschaeftsfallId, this.massnahmenType, this.stesId)
        ).subscribe(
            ([verfuegbarkeit, status, ammBuchungParam]) => {
                this.verfuegbarkeitOptions = verfuegbarkeit
                    ? this.facade.formUtilsService.mapDropdownKurztext(verfuegbarkeit).filter(el => el.code !== VerfuegbarkeitAMMCodeEnum.UNTERSCHIEDLICH)
                    : [];
                this.verfuegbarkeitDTOs = verfuegbarkeit;
                this.massnahmeForm
                    .get('anwesenheitGroup')
                    .setValidators([
                        AmmValidators.requiredWeekDays(
                            'anwesenheitVormittags',
                            'anwesenheitNachmittags',
                            'anwesenheit',
                            this.facade.formUtilsService.getCodeIdByCode(this.verfuegbarkeitOptions, VerfuegbarkeitAMMCodeEnum.WOCHENPLAN)
                        ),
                        AmmValidators.check289and290('anwesenheitVormittags', 'anwesenheitNachmittags', 'beschaeftigungsgrad', 'beschaeftigungsgradMax')
                    ]);
                this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(status.data);
                this.statusDTOs = status.data;
                if (ammBuchungParam.data) {
                    this.lastData = ammBuchungParam.data;
                    this.massnahmeId = ammBuchungParam.data.massnahmeId;
                    this.clearCheckboxes = false;
                    this.massnahmeForm.reset(this.mapToForm(ammBuchungParam.data));
                    this.validateAvailability();
                    this.bearbeiterSuchenTokens = this.psakFormHandler.getBearbeiterSuchenTokens(this.buchungObject.ownerId);
                    this.buchungId = this.buchungObject.ammBuchungId;
                    this.basisNr = this.buchungObject.ammGeschaeftsfallObject.basisNr;
                    this.isGesperrt = this.buchungObject.gesperrt;
                    if (this.buchungObject.ammGeschaeftsfallObject && this.buchungObject.ammGeschaeftsfallObject.vorgaengerObject) {
                        this.vorgaengerEntscheidId = this.ammHelper.getEntscheidId(this.buchungObject.ammGeschaeftsfallObject.vorgaengerObject);
                        this.vorgaengerBuchungsNr = this.ammHelper.getAmmBuchung(this.buchungObject.ammGeschaeftsfallObject.vorgaengerObject).buchungsNr;
                    }
                    if (this.buchungObject.ammGeschaeftsfallObject && this.buchungObject.ammGeschaeftsfallObject.nachfolgerObject) {
                        this.nachfolgerEntscheidId = this.ammHelper.getEntscheidId(this.buchungObject.ammGeschaeftsfallObject.nachfolgerObject);
                        this.nachfolgerBuchungsNr = this.ammHelper.getAmmBuchung(this.buchungObject.ammGeschaeftsfallObject.nachfolgerObject).buchungsNr;
                    }
                    this.checkBSP(ammBuchungParam.data, this.buchungObject);
                    this.stesInfobarService.addItemToInfoPanel(this.infobarTemp);
                    this.stesInfobarService.sendLastUpdate(this.buchungObject);
                    const ueberschrift = this.getUeberschrift(this.dbTranslateService.translateWithOrder(ammBuchungParam.data.titel, 'name'));
                    this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
                    this.configureToolbox();
                    //enable buttons
                    this.getButtons();
                }
                this.spinnerService.deactivate(this.channel);
            },
            error => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    mapToForm(kollektiveBuchung: AmmBuchungParamDTO) {
        this.buchungObject = this.ammHelper.getAmmBuchung(kollektiveBuchung);
        return {
            ergaenzendeAngaben: kollektiveBuchung.ergaenzendeAngaben ? this.dbTranslateService.translateWithOrder(kollektiveBuchung.ergaenzendeAngaben, 'name') : null,
            taetigkeit: kollektiveBuchung.taetigkeit ? kollektiveBuchung.taetigkeit : null,
            durchfuehrungsnr: kollektiveBuchung.durchfuehrungsId,
            verfuegbarkeit: this.psakFormHandler.getVerfugbarkeitId(kollektiveBuchung.zeitplanObject),
            vormittags: this.psakFormHandler.setVormittags(kollektiveBuchung.zeitplanObject),
            nachmittags: this.psakFormHandler.setNachmittags(kollektiveBuchung.zeitplanObject),
            arbeitszeiten: kollektiveBuchung.zeitplanObject ? this.dbTranslateService.translateWithOrder(kollektiveBuchung.zeitplanObject, 'arbeitszeit') : null,
            abfederung: kollektiveBuchung.sozialeAbfederung ? this.dbTranslateService.instant('i18n.common.yes') : this.dbTranslateService.instant('i18n.common.no'),
            vorstellungsgespraech: kollektiveBuchung.vorstellungsgespraechTest,
            anbieter: kollektiveBuchung.unternehmenObject,
            massnahmenverantwortung: kollektiveBuchung.benutzerDetailDTO,
            buchungsnr: this.psakFormHandler.getBuchungsNr(this.buchungObject),
            bearbeitung: this.buchungObject.benutzerDetailDTO,
            dateRangeGroup: {
                durchfuehrungVon: this.facade.formUtilsService.parseDate(kollektiveBuchung.gueltigVon),
                durchfuehrungBis: this.facade.formUtilsService.parseDate(kollektiveBuchung.gueltigBis),
                buchungVon: this.facade.formUtilsService.parseDate(this.buchungObject.buchungVon),
                buchungBis: this.facade.formUtilsService.parseDate(this.buchungObject.buchungBis)
            },
            anwesenheitGroup: {
                anwesenheit: this.psakFormHandler.getVerfugbarkeitId(this.buchungObject['zeitplanObject']),
                anwesenheitVormittags: this.psakFormHandler.setVormittags(this.buchungObject['zeitplanObject']),
                anwesenheitNachmittags: this.psakFormHandler.setNachmittags(this.buchungObject['zeitplanObject']),
                beschaeftigungsgrad: this.buchungObject['beschaeftigungsgrad'],
                beschaeftigungsgradMax: kollektiveBuchung.beschaeftigungsgradMax
            },
            arbeitszeitenBuchung: this.buchungObject['zeitplanObject'] ? this.dbTranslateService.translateWithOrder(this.buchungObject['zeitplanObject'], 'arbeitszeit') : null,
            status: this.buchungObject.statusObject.codeId
        };
    }

    getButtons() {
        this.ammRestService.getAmmBuchungButtons(this.lastData.durchfuehrungsId, this.massnahmenType, this.stesId, +this.geschaeftsfallId).subscribe(res => {
            this.buttons.next(res.data);
        });
    }

    getUeberschrift(titel: string): string {
        const massnahmenLabel = this.dbTranslateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.massnahmenType).label);

        return `${massnahmenLabel} ${titel} - ${this.dbTranslateService.instant('amm.massnahmen.subnavmenuitem.grunddatenbuchung')}`;
    }

    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.massnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.PSAK_BUCHUNG.replace(':type', this.massnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG.replace(':type', this.massnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.massnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.navigationService.showNavigationTreeRoute(AMMPaths.TEILNEHMERPLAETZE.replace(':type', this.massnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        //BSP23
        if (this.massnahmenType === AmmMassnahmenCode.BP) {
            this.navigationService.showNavigationTreeRoute(AMMPaths.BP_KOSTEN.replace(':type', this.massnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        }
        this.navigationService.showNavigationTreeRoute(AMMPaths.SPESEN.replace(':type', this.massnahmenType), { gfId: this.geschaeftsfallId, entscheidId: this.entscheidId });
        this.navigationService.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.massnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
    }

    canDeactivate() {
        return this.massnahmeForm.dirty;
    }

    isTypePsAk(label: string): boolean {
        return (
            label === this.dbTranslateService.instant(AMMLabels.PVB) ||
            label === this.dbTranslateService.instant(AMMLabels.UEF) ||
            label === this.dbTranslateService.instant(AMMLabels.SEMO) ||
            label === this.dbTranslateService.instant(AMMLabels.KOLLEKTIV_AP) ||
            label === this.dbTranslateService.instant(AMMLabels.KOLLEKTIV_BP)
        );
    }

    isRoutePsAk(url): boolean {
        return (
            url.includes(AMMPaths.AMM_GENERAL.replace(':type', this.massnahmenType)) ||
            url.includes(AMMPaths.PSAK_BUCHUNG.replace(':type', this.massnahmenType)) ||
            url.includes(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.massnahmenType)) ||
            url.includes(AMMPaths.TEILNEHMERPLAETZE.replace(':type', this.massnahmenType)) ||
            url.includes(AMMPaths.SPESEN.replace(':type', this.massnahmenType)) ||
            url.includes(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.massnahmenType))
        );
    }

    showWarningMessages(data) {
        data.forEach(message => {
            const errorMessageHeader = message.values.key ? `${this.translateService.instant(message.values.key)}` : '';

            if (message.values.values) {
                const errorMessage = StringHelper.stringFormatter(
                    errorMessageHeader,
                    [...message.values.values].map(v => {
                        try {
                            return this.translateService.instant(v);
                        } catch (error) {
                            return v;
                        }
                    })
                );
                this.fehlermeldungenService.showMessage(errorMessage, message.key.toLowerCase());
                OrColumnLayoutUtils.scrollTop();
            } else {
                this.fehlermeldungenService.showMessage(message.values.key, message.key.toLowerCase());
                OrColumnLayoutUtils.scrollTop();
            }
        });
    }
    openDeleteDialog() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.onDelete();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    onDelete() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammRestService.deleteGeschaeftsfall(this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    this.massnahmeForm.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));

                    const vorgaengerGeschaeftsfallId = this.buchungObject.ammGeschaeftsfallObject ? this.buchungObject.ammGeschaeftsfallObject.vorgaengerId : null;
                    if (vorgaengerGeschaeftsfallId) {
                        const vorgaengerEntscheidId = this.ammHelper.getEntscheidId(this.buchungObject.ammGeschaeftsfallObject.vorgaengerObject);
                        const url = `stes/details/${this.stesId}/${AMMPaths.PSAK_BUCHUNG}`.replace(':type', this.massnahmenType);
                        this.router.navigate([url], {
                            queryParams: {
                                gfId: vorgaengerGeschaeftsfallId,
                                entscheidId: vorgaengerEntscheidId
                            }
                        });
                    } else {
                        //navigate to UI 0340-002 AMM-Uebersicht
                        this.cancel();
                    }
                    this.navigationService.hideNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.massnahmenType));
                } else {
                    this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            error => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgeloescht'));
            }
        );
    }

    onErsetzen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammRestService.buchungErsetzen(this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    const newGeschaeftsfallId = response.data.geschaeftsfallId;
                    if (newGeschaeftsfallId !== +this.geschaeftsfallId) {
                        this.notificationService.success(this.dbTranslateService.instant('amm.nutzung.feedback.buchungersetzt'));
                        const url = `stes/details/${this.stesId}/${AMMPaths.PSAK_BUCHUNG}`.replace(':type', this.massnahmenType);
                        this.router.navigate([url], {
                            queryParams: {
                                gfId: newGeschaeftsfallId,
                                entscheidId: response.data.entscheidId
                            }
                        });
                    } else {
                        this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                    }
                } else {
                    this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            error => {
                this.deactivateSpinnerAndScrollTop();
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    onZuruecknehmen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.ammRestService.zuruecknehmenBuchung(+this.geschaeftsfallId, this.massnahmenType, this.translateService.currentLang).subscribe(
            res => {
                if (res) {
                    this.lastData = res.data;
                    this.buchungObject = this.ammHelper.getAmmBuchung(res.data);
                    this.isGesperrt = this.buchungObject.gesperrt;
                    this.massnahmeForm.controls.status.setValue(this.buchungObject.statusId);
                    this.getButtons();

                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                } else {
                    this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    onReset() {
        if (this.massnahmeForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.massnahmeForm.reset(this.mapToForm(this.lastData));
            });
        }
    }

    onSave() {
        //BSP40
        if (this.massnahmeForm.controls.bearbeitung.value === '') {
            this.bearbeitung.appendCurrentUser();
        }

        this.fehlermeldungenService.closeMessage();

        if (!this.massnahmeForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.spinnerService.activate(this.channel);
        this.ammRestService
            .saveBuchungPsAk(
                this.stesId,
                this.massnahmenType,
                this.massnahmeId,
                +this.geschaeftsfallId,
                this.dbTranslateService.getCurrentLang(),
                this.psakFormHandler.mapToDTO(this.massnahmeForm, this.lastData, this.statusDTOs, this.verfuegbarkeitDTOs)
            )
            .subscribe(
                response => {
                    if (response.data) {
                        this.lastData = response.data;
                        this.massnahmeForm.reset(this.mapToForm(this.lastData));
                        this.isGesperrt = this.buchungObject.gesperrt;
                        this.getButtons();
                        this.stesInfobarService.sendLastUpdate(this.buchungObject);
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    } else {
                        this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                    }
                    this.deactivateSpinnerAndScrollTop();
                },
                error => {
                    this.deactivateSpinnerAndScrollTop();
                    this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                }
            );
    }

    validateAvailability() {
        const anwesenheitGroup = this.massnahmeForm.get('anwesenheitGroup') as FormGroup;
        this.verfuegbarkeitMornings = this.psakFormHandler.setVormittags(this.lastData.zeitplanObject);
        this.verfuegbarkeitAfternoons = this.psakFormHandler.setNachmittags(this.lastData.zeitplanObject);
        anwesenheitGroup.get('anwesenheitVormittags').valueChanges.subscribe((value: boolean[]) => {
            this.showAvailabilityWarningMornings = value.some((element, index) => element && !this.verfuegbarkeitMornings[index]);
        });
        anwesenheitGroup.get('anwesenheitNachmittags').valueChanges.subscribe((value: boolean[]) => {
            this.showAvailabilityWarningAfternoons = value.some((element, index) => element && !this.verfuegbarkeitAfternoons[index]);
        });
    }

    onDMSClick() {
        this.fehlermeldungenService.closeMessage();

        const reqDto: DmsContextSensitiveDossierDTO = {
            stesId: +this.stesId,
            uiNumber: StesFormNumberEnum.MASSNAHME_BUCHEN,
            language: this.dbTranslateService.getCurrentLang(),
            documentId: this.massnahmeId
        };

        this.dmsService.openDMSWindowWithParams(reqDto);
    }

    checkBSP(ammBuchungParam: AmmBuchungParamDTO, buchungObject: AmmBuchungPraktikumsstelleDTO | AmmBuchungArbeitsplatzkategorieDTO) {
        //check BSP1/BSP2
        if (ammBuchungParam.apkPraktikumsstelleVerwalten) {
            this.massnahmeForm.patchValue({ durchfuehrungsnr: ammBuchungParam.beschaeftigungseinheitId });
            this.durchfuehrungsLabel = ammBuchungParam.ammBuchungArbeitsplatzkategorie
                ? 'amm.massnahmen.label.arbeitsplatzkategorie.nummer'
                : 'amm.massnahmen.label.praktikumsstelle.nummer';
        }
        //check BSP3
        this.unternehmenLabel = buchungObject['buchungAufPraktikumsstelle'] ? 'amm.massnahmen.label.arbeitgeber' : this.unternehmenLabel;
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        this.stesInfobarService.removeItemFromInfoPanel(this.infobarTemp);
        this.stesInfobarService.sendLastUpdate({}, true);
        super.ngOnDestroy();
    }

    private deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }
}
