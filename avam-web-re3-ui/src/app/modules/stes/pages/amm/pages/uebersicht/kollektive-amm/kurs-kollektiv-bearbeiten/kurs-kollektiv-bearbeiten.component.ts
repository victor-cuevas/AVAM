import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { Subscription, forkJoin, Subject } from 'rxjs';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { RoboHelpService, DmsService } from '@app/shared';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { KursKollectiveFormHandler } from './kurs-kollectiv-form-handler';
import { SpinnerService } from 'oblique-reactive';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { DmsContextSensitiveDossierDTO } from '@app/shared/models/dtos-generated/dmsContextSensitiveDossierDTO';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { WarningMessagesDTO } from '@app/shared/models/dtos/warning-messages-dto';
import { StringHelper } from '@app/shared/helpers/string.helper';
import { first } from 'rxjs/operators';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';
import { AmmMassnahmenCode } from '@shared/enums/domain-code/amm-massnahmen-code.enum';

@Component({
    selector: 'avam-kurs-kollektiv-bearbeiten',
    templateUrl: './kurs-kollektiv-bearbeiten.component.html',
    styleUrls: ['./kurs-kollektiv-bearbeiten.component.scss'],
    providers: [KursKollectiveFormHandler]
})
export class KursKollektivBearbeitenComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('bearbeitung') bearbeitung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    spinnerChannel = 'kursKollektiveBearbeitenChannel';

    geschaeftsfallId: string;
    entscheidId: string;
    ammMassnahmenType: string;
    buchungId: number;
    massnahmeId: number;
    durchfuerungsId: number;
    vorgaengerEntscheidId: number;
    nachfolgerEntscheidId: number;
    vorgaengerGfId: number;
    nachvolgerGfId: number;
    basisNr: number;

    toolboxSubscription: Subscription;

    toolboxChannel = 'kollektiveBuchungBearbeiten';
    clearCheckboxes = true;

    kollektiveBearbeitenForm: FormGroup;

    bearbeiterSearchTokens = {};
    verfuegbarkeitOptions = [];
    durchfuehrungskriteriumOptions = [];
    statusOptions = [];
    statiData: CodeDTO[];

    isGesperrt = false;
    lastData: AmmBuchungParamDTO;
    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    langChangeSubscription: Subscription;
    validationSub: Subscription;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(
        private route: ActivatedRoute,
        private stesInfobarService: AvamStesInfoBarService,
        protected router: Router,
        private roboHelpService: RoboHelpService,
        private formHandler: KursKollectiveFormHandler,
        private ammDataService: AmmRestService,
        private translateService: TranslateService,
        private dmsService: DmsService,
        private obliqueHelper: ObliqueHelperService,
        private resetDialogService: ResetDialogService,
        private ammHelper: AmmHelper,
        protected interactionService: StesComponentInteractionService,
        protected facade: FacadeService
    ) {
        super(facade, router, interactionService);
        ToolboxService.CHANNEL = this.toolboxChannel;
        SpinnerService.CHANNEL = this.spinnerChannel;
    }

    ngOnInit() {
        this.showValidationsFromErfassen();
        this.obliqueHelper.ngForm = this.ngForm;
        this.kollektiveBearbeitenForm = this.formHandler.createForm();
        this.getParams();
        this.toolboxSubscription = this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.validationSub = this.formHandler.subscribeToValGroup(this.kollektiveBearbeitenForm.controls.validationGroup as FormGroup);
        super.ngOnInit();
    }

    showValidationsFromErfassen() {
        const state = window.history.state;

        if (state && state.warnings) {
            state.warnings.forEach((warning: WarningMessagesDTO) => {
                this.showWarningMessage(warning);
            });
        }
    }

    getParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];

            this.route.paramMap.subscribe(param => {
                this.ammMassnahmenType = param.get('type');
                this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];
            });

            this.route.queryParamMap.subscribe(param => {
                this.geschaeftsfallId = param.get('gfId');
                this.entscheidId = param.get('entscheidId');
                this.clearCheckboxes = true;
                this.getData();
                this.setSideNavigation();
            });
        });
    }

    isOurLabel(message) {
        return true;
    }

    isOurUrl(): boolean {
        return true;
    }

    subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.toolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                window.print();
            } else if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_KOLLEKTIV);
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_STES_AMM, this.geschaeftsfallId, this.entscheidId.toString());
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.facade.openModalFensterService.openHistoryModal(this.buchungId.toString(), AvamCommonValueObjectsEnum.T_AMM_BUCHUNGSESSION);
            }
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

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.toolboxChannel, this.prepareToolboxData());
    }

    prepareToolboxData(): DokumentVorlageToolboxData {
        const targetEntity = DokumentVorlageActionDTO.TargetEntityEnum.KURSBUCHUNG;
        const categories: VorlagenKategorie[] = [VorlagenKategorie.AMM_KURS_BUCHUNG, VorlagenKategorie.AMM_KURSBESCHREIBUNG];

        return ToolboxDataHelper.createForAmm(targetEntity, categories, +this.stesId, +this.geschaeftsfallId, this.massnahmeId, +this.entscheidId);
    }

    setSideNavigation() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.TEILNEHMERWARTELISTE.replace(':type', this.ammMassnahmenType), {
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

    ngOnDestroy(): void {
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        if (this.validationSub) {
            this.validationSub.unsubscribe();
        }

        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }

        this.stesInfobarService.sendLastUpdate({}, true);
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.facade.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    getData() {
        this.facade.spinnerService.activate(this.spinnerChannel);

        forkJoin<BaseResponseWrapperListCodeDTOWarningMessages, BaseResponseWrapperAmmBuchungParamDTOWarningMessages>(
            this.ammDataService.getBuchungsStati(+this.geschaeftsfallId, this.ammMassnahmenType),
            this.ammDataService.getAmmBuchungParam(this.geschaeftsfallId, this.ammMassnahmenType, this.stesId)
        ).subscribe(
            ([stati, buchung]) => {
                this.massnahmeId = buchung.data.massnahmeId;
                this.durchfuerungsId = buchung.data.durchfuehrungsId;
                this.buttons.next(null);
                this.getButtons();
                this.configureToolbox();

                this.lastData = buchung.data;
                if (this.lastData.ammBuchungSession.ammGeschaeftsfallObject) {
                    this.vorgaengerEntscheidId = this.ammHelper.getEntscheidId(this.lastData.ammBuchungSession.ammGeschaeftsfallObject.vorgaengerObject);
                    this.nachfolgerEntscheidId = this.ammHelper.getEntscheidId(this.lastData.ammBuchungSession.ammGeschaeftsfallObject.nachfolgerObject);

                    this.vorgaengerGfId = this.lastData.ammBuchungSession.ammGeschaeftsfallObject.vorgaengerId;
                    this.nachvolgerGfId = this.lastData.ammBuchungSession.ammGeschaeftsfallObject.nachfolgerId;
                }

                this.statiData = stati.data;
                this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(stati.data);
                const buchungData = buchung.data.ammBuchungSession;

                this.bearbeiterSearchTokens = this.formHandler.getBearbeiterSearchTokens(buchungData.ownerId);

                const kriterium = [buchung.data.durchfuehrungskriteriumObject];
                this.durchfuehrungskriteriumOptions = this.facade.formUtilsService.mapDropdownKurztext(kriterium);

                const verfuegbarkeit = [buchung.data.zeitplanObject.verfuegbarkeitObject];
                this.verfuegbarkeitOptions = this.facade.formUtilsService.mapDropdownKurztext(verfuegbarkeit);

                this.clearCheckboxes = false;
                this.kollektiveBearbeitenForm.patchValue(this.formHandler.mapToForm(buchung.data, true));
                this.isGesperrt = buchungData.gesperrt;

                this.geschaeftsfallId = buchungData.ammGeschaeftsfallId.toString();
                this.buchungId = buchungData.ammBuchungId;
                this.stesInfobarService.sendLastUpdate(buchungData);

                const ueberschrift = this.setUeberschrift(this.facade.dbTranslateService.translateWithOrder(buchung.data.titel, 'name'));
                this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
                this.basisNr = buchung.data.ammBuchungSession.ammGeschaeftsfallObject.basisNr;
                this.stesInfobarService.addItemToInfoPanel(this.infobartemp);

                this.facade.spinnerService.deactivate(this.spinnerChannel);
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    setUeberschrift(titel: string): string {
        const massnahmenLabel = this.facade.dbTranslateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);

        return `${massnahmenLabel} ${titel} - ${this.facade.dbTranslateService.instant('amm.massnahmen.subnavmenuitem.grunddatenbuchung')}`;
    }

    getButtons() {
        this.ammDataService.getAmmBuchungButtons(this.durchfuerungsId, this.ammMassnahmenType, this.stesId, +this.geschaeftsfallId).subscribe(res => {
            this.buttons.next(res.data);
        });
    }

    subscribeToLangChange() {
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            const ueberschrift = this.setUeberschrift(this.facade.dbTranslateService.translateWithOrder(this.lastData.titel, 'name'));
            this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
        });
    }

    canDeactivate() {
        return this.kollektiveBearbeitenForm.dirty;
    }

    onDmsClick() {
        this.facade.fehlermeldungenService.closeMessage();
        const reqDto: DmsContextSensitiveDossierDTO = {
            stesId: +this.stesId,
            uiNumber: StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_KOLLEKTIV,
            language: this.facade.dbTranslateService.getCurrentLang(),
            documentId: this.massnahmeId
        };

        this.dmsService.openDMSWindowWithParams(reqDto);
    }

    onReset() {
        if (this.kollektiveBearbeitenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.kollektiveBearbeitenForm.patchValue(this.formHandler.mapToForm(this.lastData, true));
            });
        }
    }

    openDeleteDialog() {
        this.facade.openModalFensterService.deleteModal(() => {
            this.onDelete();
        });
    }

    onDelete() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.spinnerChannel);

        this.ammDataService.deleteGeschaeftsfall(this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    this.kollektiveBearbeitenForm.markAsPristine();
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengeloescht'));
                    if (this.vorgaengerGfId) {
                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType)}`], {
                            queryParams: {
                                gfId: this.vorgaengerGfId,
                                entscheidId: this.vorgaengerEntscheidId
                            }
                        });
                    } else {
                        this.facade.navigationService.hideNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType));
                        this.router.navigate([`stes/details/${this.stesId}/amm/uebersicht`]);
                    }
                } else {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
                }
                this.facade.navigationService.hideNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType));

                this.deactivateSpinnerAndScrollTop();
            },
            error => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgeloescht'));
            }
        );
    }

    onErsetzen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.spinnerChannel);

        this.ammDataService.buchungErsetzen(this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    const newGeschaeftsfallId = response.data.geschaeftsfallId;
                    if (newGeschaeftsfallId !== +this.geschaeftsfallId) {
                        this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.nutzung.feedback.buchungersetzt'));
                        this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType)}`], {
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

    onSave() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.spinnerChannel);

        if (!this.kollektiveBearbeitenForm.controls.bearbeitung.value) {
            this.bearbeitung.appendCurrentUser();
        }

        if (this.kollektiveBearbeitenForm.valid) {
            this.ammDataService
                .saveKollektivKurs(
                    +this.stesId,
                    this.ammMassnahmenType,
                    this.massnahmeId,
                    +this.geschaeftsfallId,
                    this.facade.dbTranslateService.getCurrentLang(),
                    this.formHandler.mapToDTO(this.kollektiveBearbeitenForm, this.lastData, this.statiData)
                )
                .subscribe(
                    response => {
                        if (response.data) {
                            this.lastData = response.data;
                            this.kollektiveBearbeitenForm.markAsPristine();
                            this.getButtons();
                            this.kollektiveBearbeitenForm.patchValue(this.formHandler.mapToForm(this.lastData, true));
                            this.isGesperrt = this.lastData.ammBuchungSession.gesperrt;
                            this.stesInfobarService.sendLastUpdate(this.lastData);
                            this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                        }
                        this.deactivateSpinnerAndScrollTop();
                    },
                    () => {
                        this.deactivateSpinnerAndScrollTop();
                        this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                    }
                );
        } else {
            this.deactivateSpinnerAndScrollTop();
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    onZuruecknehmen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.spinnerChannel);

        this.ammDataService.zuruecknehmenBuchung(+this.geschaeftsfallId, this.ammMassnahmenType, this.translateService.currentLang).subscribe(
            res => {
                if (res.data && res.data.ammBuchungSession) {
                    this.lastData = res.data;
                    this.isGesperrt = res.data.ammBuchungSession.gesperrt;
                    this.kollektiveBearbeitenForm.controls.status.setValue(res.data.ammBuchungSession.statusId);
                    this.buttons.next(null);
                    this.getButtons();
                    this.kollektiveBearbeitenForm.patchValue(this.formHandler.mapToForm(this.lastData, true));

                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                } else {
                    this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                }
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    private showWarningMessage(message) {
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
            this.facade.fehlermeldungenService.showMessage(errorMessage, message.key.toLowerCase());
        } else {
            this.facade.fehlermeldungenService.showMessage(message.values.key, message.key.toLowerCase());
        }
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.spinnerChannel);
        OrColumnLayoutUtils.scrollTop();
    }
}
