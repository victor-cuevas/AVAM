import { forkJoin, iif, Subscription } from 'rxjs'; //NOSONAR
import { DeactivationGuarded } from './../../../../../../shared/services/can-deactive-guard.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { DomainEnum } from 'src/app/shared/enums/domain.enum';
import { FormUtilsService } from 'src/app/shared/services/forms/form-utils.service';
import { GrunddatenFormbuilder } from 'src/app/shared/formbuilders/grunddaten.formbuilder';
import { ActivatedRoute, Router } from '@angular/router';
import { AbbrechenModalComponent, BaseFormBuilder, HttpFormStateEnum, ToolboxService } from 'src/app/shared';
import { map, takeUntil } from 'rxjs/operators';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { OpenModalFensterService } from 'src/app/shared/services/open-modal-fenster.service';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';

import { TranslateService } from '@ngx-translate/core';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { DbTranslateService } from '../../../../../../shared/services/db-translate.service';
import { StesErwerbssituationComponent } from './stes-erwerbssituation/stes-erwerbssituation.component';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AbbrechenModalActionCallback } from '@app/shared/classes/abbrechen-modal-action-dismiss-only-current';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { LeistungsbezugCodeEnum } from '@app/shared/enums/domain-code/leistungsbezug-code.enum';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import PrintHelper from '@shared/helpers/print.helper';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { KantonalearbeitslosenhilfeCodeEnum } from '@shared/enums/domain-code/kantonale-arbeitslosen-hilfe-code.enum';
import { BenutzerstellenRestService } from '@core/http/benutzerstellen-rest.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { StesAnmeldungsartCodeEnum } from '@app/shared/enums/domain-code/stes-anmeldungsart-code.enum';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-details-grunddaten',
    templateUrl: './stes-details-grunddaten.component.html',
    styleUrls: ['./stes-details-grunddaten.component.scss'],
    providers: [ObliqueHelperService]
})
export class StesDetailsGrunddatenComponent extends Unsubscribable implements OnInit, OnDestroy, BaseFormBuilder, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('modalErwerbssituation') modalErwerbssituation: ElementRef;
    @ViewChild('modalZahlstelleSuchen') modalZahlstelleSuchen: ElementRef;
    @ViewChild('pBeraterAutosuggest') pBeraterAutosuggest: AvamPersonalberaterAutosuggestComponent;

    grunddatenForm: FormGroup;

    anmeldungForm: FormGroup;
    zustaendigkeitForm: FormGroup;
    erwerbssituationAForm: FormGroup;
    hoechsteAausbildungForm: FormGroup;
    leistungsbezugForm: FormGroup;
    sachbearbeitungalkForm: FormGroup;
    zentralerdruckFForm: FormGroup;
    vermittlungsstoppForm: FormGroup;
    grunddatenFormbuilder: GrunddatenFormbuilder;
    stesId: string;
    alkZahlstelleNr: string;
    kurzname: string;
    isAnmeldung: boolean;
    letzteAktualisierung: any;
    avpProduzierenDisable = true;
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;
    isAnmeldungsartRavWechsel = false;

    leistungsbezugOptions: any[] = [];
    erwerbssituationbeianmeldungOptions: any[] = [];
    kantonalearbeitslosenhilfeOptions: any[] = [];
    transferAnAlkTextDTO: CodeDTO[] = [];
    grunddatenChannel = 'grunddaten';
    benutzerSuchenTokens: {} = {};

    benutzerStelleLabels: string[] = [];
    permissions: typeof Permissions = Permissions;

    private observeClickActionSub: Subscription;
    private translateSubscription: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private fehlermeldungenService: FehlermeldungenService,
        private toolboxService: ToolboxService,
        private route: ActivatedRoute,
        private facade: FacadeService,
        private router: Router,
        private readonly modalService: NgbModal,
        private dataService: StesDataRestService,
        private readonly benutzerstellenRestService: BenutzerstellenRestService,
        private openModalFensterService: OpenModalFensterService,
        private readonly notificationService: NotificationService,
        private translateService: TranslateService,
        private spinnerService: SpinnerService,
        private interactionService: StesComponentInteractionService,
        private dbTranslateService: DbTranslateService,
        private wizardService: WizardService,
        private resetDialogService: ResetDialogService,
        private obliqueHelper: ObliqueHelperService,
        private stesInfobarService: AvamStesInfoBarService,
        private authenticationService: AuthenticationService
    ) {
        super();
        SpinnerService.CHANNEL = this.grunddatenChannel;
        ToolboxService.CHANNEL = this.grunddatenChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesGrunddaten' });
        this.spinnerService.activate(this.grunddatenChannel);
        this.grunddatenFormbuilder = new GrunddatenFormbuilder(this.formBuilder, this.facade.formUtilsService, this.translateService, this.dbTranslateService);

        this.route.parent.data.subscribe(response => {
            this.isAnmeldung = response.isAnmeldung;
            this.grunddatenForm = this.grunddatenFormbuilder.initForm(this.isAnmeldung);
            if (this.isAnmeldung) {
                this.route.paramMap.subscribe(params => {
                    this.stesId = params.get('stesId');
                });
            } else {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];
                });
            }
            if (this.isAnmeldung) {
                this.subscribeToWizard();
            }

            this.observeClickActionSub = this.toolboxService.observeClickAction(this.grunddatenChannel).subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
                if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.stesId, AvamCommonValueObjectsEnum.T_STES);
                }
            });
        });

        this.defineFormGroups();
        this.subscriptionToolboxFooter();
        this.getData();
        this.benutzerSuchenTokens = this.getBenutzerSuchenTokens();
        this.benutzerStelleLabels = StesDetailsGrunddatenComponent.getBenutzerStelleLabels();
    }

    public static getBenutzerStelleLabels() {
        const benutzerstelleLabels: string[] = [];

        benutzerstelleLabels.push(
            'benutzerverwaltung.label.benutzerstellenid',
            'common.label.benutzerstelle',
            'benutzerverwaltung.label.standortadresse',

            'common.label.typ',
            'common.label.arbeitssprache',
            'common.label.telefon',
            'common.label.email'
        );

        return benutzerstelleLabels;
    }

    /**
     * loads the BenutzerstelleDetailInfoDTO
     */
    benutzerStelleDataFunction = (term: string) => {
        const query = { name: term, gueltigkeit: 'active' };
        return this.benutzerstellenRestService.getBenutzerstelleInfo(query, this.translateService.currentLang);
    };

    subscribeTranslateService() {
        this.translateSubscription = this.translateService.onLangChange.subscribe(() => {
            const translateObj = {
                erwerbssituationarbeitsmarktsituation: {
                    erwerbssituationaktuell: this.dbTranslateService.translate(this.letzteAktualisierung.erwerbssituationAktuell, 'text'),

                    erwerbssituationberechnet: this.dbTranslateService.translate(this.letzteAktualisierung.erwerbssituationBerechnet, 'text'),
                    arbeitsmarktsituationberechnet: this.dbTranslateService.translate(this.letzteAktualisierung.arbeitsmarktsituationBerechnet, 'text')
                },
                hoechsteabgeschlosseneausbildung: {
                    hoechsteausbildung: this.dbTranslateService.translate(this.letzteAktualisierung.hoechsteAbgeschlosseneAusbildung, 'text')
                }
            };
            this.grunddatenForm.patchValue(translateObj);
        });
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        this.stesInfobarService.sendLastUpdate({}, true);

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.translateSubscription) {
            this.translateSubscription.unsubscribe();
        }

        this.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    canDeactivate(): boolean {
        return this.grunddatenForm.dirty;
    }

    onLeistungsbezugSelect(event: any) {
        const leistungsbezugAleBezuegerCode = this.facade.formUtilsService.getCodeIdByCode(this.leistungsbezugOptions, LeistungsbezugCodeEnum.LEISTUNGSBEZUGALEBEZUEGER);
        const leistungsbezugNicht = this.facade.formUtilsService.getCodeIdByCode(this.leistungsbezugOptions, LeistungsbezugCodeEnum.LEISTUNGSBEZUGNICHT);

        if (event === leistungsbezugAleBezuegerCode || event === leistungsbezugNicht || this.leistungsbezugForm.pristine) {
            this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.disable();
            this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.reset();
        } else {
            this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.enable();
            this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.setValidators(Validators.required);
            this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.reset();
        }
        this.validateAvpProduzieren(null);
    }

    validateAvpProduzieren(data: any) {
        if (data) {
            this.updateAvpFromDTO(data);
        } else {
            this.updateAvpFromForm();
        }
    }

    subscribeToWizard() {
        this.wizardService.setFormIsDirty(this.grunddatenForm.dirty);
        this.grunddatenForm.valueChanges.subscribe(value => {
            this.wizardService.setFormIsDirty(this.grunddatenForm.dirty);
        });
    }

    openErwerbssituation() {
        this.fehlermeldungenService.closeMessage();
        const modalRef = this.modalService.open(StesErwerbssituationComponent, {
            ariaLabelledBy: 'modal-basic-title',
            windowClass: 'avam-modal-xl',
            backdrop: 'static',
            beforeDismiss: () => {
                if (modalRef.componentInstance as StesErwerbssituationComponent) {
                    const shouldClose = (modalRef.componentInstance as StesErwerbssituationComponent).canClose();
                    if (!shouldClose) {
                        const modalRefAbbrechen = this.modalService.open(AbbrechenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
                        modalRefAbbrechen.componentInstance.setModalAction(new AbbrechenModalActionCallback(modalRefAbbrechen));
                        modalRefAbbrechen.result.then(
                            result => {
                                modalRef.close(result);
                                return true;
                            },
                            () => {}
                        );

                        return false;
                    }
                } else {
                    return true;
                }
            }
        });

        if (modalRef.componentInstance) {
            modalRef.componentInstance.stesId = this.stesId;
        }
    }

    openZahlstelleSuchen() {
        this.modalService.open(this.modalZahlstelleSuchen, { ariaLabelledBy: 'zahlstelle-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    fillDataZahlstelle(eventData: any) {
        this.leistungsbezugForm.controls.alk.setValue({
            id: eventData.zahlstelleId,
            inputElementOneValue: eventData.alkZahlstellenNr,
            inputElementTwoValue: eventData.kurzname
        });
        this.grunddatenForm.markAsDirty();
    }

    reset() {
        if (this.grunddatenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.disable();
                this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.setValidators(null);
                this.zentralerdruckFForm.controls.avpproduzieren.disable();
                this.fehlermeldungenService.closeMessage();
                this.updateForm(this.letzteAktualisierung, false);
            });
        }
    }

    cancel() {
        this.fehlermeldungenService.closeMessage();
        this.router.navigate(['/home']);
    }

    save(onSuccess?, onFailure?) {
        this.fehlermeldungenService.closeMessage();

        if (this.grunddatenForm.valid) {
            this.spinnerService.activate(this.grunddatenChannel);

            const createBearbeitenSub = this.dataService.createGrunddatenBearbeiten(
                this.stesId,
                this.grunddatenFormbuilder.mapToDTO(this.letzteAktualisierung, this.grunddatenForm)
            );
            const createAnmeldenSub = this.dataService.createGrunddatenAnmelden(this.stesId, this.grunddatenFormbuilder.mapToDTO(this.letzteAktualisierung, this.grunddatenForm));

            iif(() => this.isAnmeldung, createAnmeldenSub, createBearbeitenSub)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    response => {
                        if (response.data) {
                            this.updateForm(response.data, true);
                            this.interactionService.updateDetailsHeader(this.stesId);
                            if (!this.isAnmeldung) {
                                this.stesInfobarService.sendLastUpdate(response.data);
                            }
                            this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_SUCCESS);
                            if (onSuccess) {
                                onSuccess();
                            }
                        } else if (response.warning) {
                            this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_FAIL);
                            if (onFailure) {
                                onFailure();
                            }
                        }
                        this.wizardService.setFormIsDirty(this.grunddatenForm.dirty);
                        OrColumnLayoutUtils.scrollTop();
                        this.spinnerService.deactivate(this.grunddatenChannel);
                    },
                    () => {
                        this.spinnerService.deactivate(this.grunddatenChannel);
                        OrColumnLayoutUtils.scrollTop();

                        this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_NO_RESPONCE);
                        if (onFailure) {
                            onFailure();
                        }
                    }
                );
        } else {
            this.ngForm.onSubmit(undefined);
            this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_FAIL);
            this.wizardService.activeWizard();
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    getData() {
        const getBearbeitenSub = this.dataService.getGrunddatenBearbeiten(this.stesId);
        const getAnmeldenSub = this.dataService.getGrunddatenAnmelden(this.stesId);

        forkJoin<any, any, any, any, any>([
            //NOSONAR
            this.dataService.getCode(DomainEnum.ERWERBSSITUATIONBEIANMELDUNG),
            this.dataService.getCode(DomainEnum.LEISTUNGSBEZUG),
            this.dataService.getCode(DomainEnum.KANTONALEARBEITSLOSENHILFE),
            this.dataService.getCode(DomainEnum.TRANSFER_ALK),
            iif(() => this.isAnmeldung, getAnmeldenSub, getBearbeitenSub)
        ])
            .pipe(
                map(([dataErwerbssituation, dataLeistungsbezug, dataKantonaleAhilfe, transferAnAlk, responseGrunddaten]) => {
                    this.erwerbssituationbeianmeldungOptions = this.facade.formUtilsService.mapDropdownKurztext(dataErwerbssituation);
                    this.leistungsbezugOptions = this.facade.formUtilsService.mapDropdownKurztext(dataLeistungsbezug);
                    dataKantonaleAhilfe.shift();
                    this.kantonalearbeitslosenhilfeOptions = this.facade.formUtilsService.mapDropdownKurztext(dataKantonaleAhilfe);
                    this.transferAnAlkTextDTO = transferAnAlk;
                    this.updateForm(responseGrunddaten.data, false);
                    this.isAnmeldungsartRavWechsel = responseGrunddaten.data.anmeldungsArtObject.code === StesAnmeldungsartCodeEnum.STES_ANMELDUNGSART_RAVWECHSEL;
                    if (!this.isAnmeldung) {
                        this.stesInfobarService.sendLastUpdate(responseGrunddaten.data);
                    }
                })
            )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                () => {
                    this.wizardService.formHttpState.next(HttpFormStateEnum.GET_SUCCESS);
                    this.subscribeTranslateService();
                },
                () => {
                    this.spinnerService.deactivate(this.grunddatenChannel);
                    this.wizardService.formHttpState.next(HttpFormStateEnum.GET_NO_RESPONCE);
                }
            );
    }

    updateForm(data: any, onSave: boolean) {
        if (data) {
            this.letzteAktualisierung = data;
            this.grunddatenForm.reset(this.grunddatenFormbuilder.mapToForm(this.letzteAktualisierung));
            this.fetchBenutzerstelle(this.zustaendigkeitForm.value.personalberater);

            if (onSave) {
                this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            }
        }

        if (this.isAnmeldung) {
            if (!onSave) {
                if (data && data.personalberater) {
                    this.zustaendigkeitForm.controls.personalberater.setValue(data.personalberater);
                } else {
                    this.pBeraterAutosuggest.appendCurrentUser();
                }

                this.zustaendigkeitForm.controls.personalberater.markAsPristine();
            }
        }

        this.spinnerService.deactivate(this.grunddatenChannel);

        this.completeUpdateForm(data);
    }

    buildTransferAnAlk(): string {
        return this.leistungsbezugForm.controls.transferanalk.value
            ? `${this.dbTranslateService.translate(this.transferAnAlkTextDTO.find(c => c.code === '1'), 'text')} ${this.leistungsbezugForm.controls.transferanalk.value}`
            : this.dbTranslateService.translate(this.transferAnAlkTextDTO.find(c => c.code === '0'), 'text');
    }

    stringToNgbDate(date: string) {
        const splittedDate = date.split('.', 3);
        return new NgbDate(+splittedDate[2], +splittedDate[1], +splittedDate[0]);
    }

    defineFormGroups() {
        this.anmeldungForm = this.grunddatenForm.get('anmeldung') as FormGroup;
        this.zustaendigkeitForm = this.grunddatenForm.get('zustaendigkeit') as FormGroup;
        this.erwerbssituationAForm = this.grunddatenForm.get('erwerbssituationarbeitsmarktsituation') as FormGroup;
        this.hoechsteAausbildungForm = this.grunddatenForm.get('hoechsteabgeschlosseneausbildung') as FormGroup;
        this.leistungsbezugForm = this.grunddatenForm.get('leistungsbezug') as FormGroup;
        this.sachbearbeitungalkForm = this.grunddatenForm.get('sachbearbeitungalk') as FormGroup;
        this.zentralerdruckFForm = this.grunddatenForm.get('zentralerdruckformulare') as FormGroup;
        this.vermittlungsstoppForm = this.grunddatenForm.get('vermittlungsstopp') as FormGroup;
    }

    fetchBenutzerstelle(event) {
        if (event && event.benutzerstelleId && event.benutzerstelleId !== -1) {
            let benuStelle;

            this.benutzerstellenRestService.getBenutzerstelleById(event.benutzerstelleId).subscribe(response => {
                if (response.data) {
                    benuStelle = response.data;
                    this.zustaendigkeitForm.controls.benutzerstelle.setValue(benuStelle);
                }
            });
        }
    }

    subscriptionToolboxFooter() {
        this.configureToolbox();

        this.openModalFensterService
            .getModalFensterToOpen()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(id => {
                this.openZahlstelleSuchen();
            });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = this.isAnmeldung ? ToolboxConfig.getStesAnmeldungConfig() : ToolboxConfig.getDefaultConfig();
        this.toolboxService.sendConfiguration(toolboxConfig, this.grunddatenChannel, ToolboxDataHelper.createForStellensuchende(this.stesId), !this.isAnmeldung);
    }

    next() {
        this.wizardService.deactiveWizard();
        this.save(
            onSuccess => {
                this.wizardService.setIsBerufErfassenStep(false);
                this.wizardService.activeWizard();
                this.wizardService.moveNext();
                this.wizardService.validateStep(true);
            },
            onFailure => {
                this.wizardService.activeWizard();
            }
        );
    }

    prev() {
        this.wizardService.movePrev();
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private getBenutzerSuchenTokens() {
        const currentUser = this.authenticationService.getLoggedUser();

        if (currentUser) {
            return {
                berechtigung: Permissions.STES_ANMELDEN_BEARBEITEN,
                myBenutzerstelleId: currentUser.benutzerstelleId,
                myVollzugsregionTyp: DomainEnum.STES,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV
            };
        }

        return null;
    }

    private completeUpdateForm(data: any) {
        if (data && data.shouldDisableZahlstelle) {
            this.leistungsbezugForm.controls.alk.disable();
        }
        if (data && data.kantonaleArbeitslosenhilfe && data.kantonaleArbeitslosenhilfe.codeId) {
            this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.enable();
        }
        if (data) {
            this.validateAvpProduzieren(data);
        }
    }

    private updateAvpFromDTO(data: any) {
        const leistungsbezugValue = data.leistungsbezug ? '' + data.leistungsbezug.codeId : null;
        const kantonalearbeitslosenhilfeValue = data.kantonaleArbeitslosenhilfe ? '' + data.kantonaleArbeitslosenhilfe.codeId : null;
        this.avpProduzierenDisable = this.calculateAvpDisable(leistungsbezugValue, kantonalearbeitslosenhilfeValue, data.leistungsimportEUEFTA);
    }

    private updateAvpFromForm() {
        const leistungsbezugValue = this.leistungsbezugForm.controls.leistungsbezug.value;
        const kantonalearbeitslosenhilfeValue = this.leistungsbezugForm.controls.kantonalearbeitslosenhilfe.value;
        const leistungsimportEUEFTAValue = this.leistungsbezugForm.controls.leistungsimportEUEFTA.value;
        const codeId = this.facade.formUtilsService.getCodeIdByCode(this.leistungsbezugOptions, LeistungsbezugCodeEnum.LEISTUNGSBEZUGALEBEZUEGER);
        if (leistungsbezugValue === codeId && !kantonalearbeitslosenhilfeValue && !leistungsimportEUEFTAValue) {
            this.zentralerdruckFForm.controls.avpproduzieren.setValue(true);
        } else {
            this.zentralerdruckFForm.controls.avpproduzieren.reset();
        }
        this.avpProduzierenDisable = this.calculateAvpDisable(leistungsbezugValue, kantonalearbeitslosenhilfeValue, leistungsimportEUEFTAValue);
    }

    private calculateAvpDisable(leistungsbezugValue: string, kantonalearbeitslosenhilfeValue: string, leistungsimportEUEFTAValue: boolean): boolean {
        const leistungsbezugNichtArbeitslos = this.facade.formUtilsService.getCodeIdByCode(this.leistungsbezugOptions, LeistungsbezugCodeEnum.LEISTUNGSBEZUGNICHT);
        const leistungsbezugKeineALE = this.facade.formUtilsService.getCodeIdByCode(this.leistungsbezugOptions, LeistungsbezugCodeEnum.LEISTUNGSBEZUGKEINEALE);
        const leistungsbezugALEAusgesteuert = this.facade.formUtilsService.getCodeIdByCode(this.leistungsbezugOptions, LeistungsbezugCodeEnum.LEISTUNGSBEZUGALEAM);
        const kantonalearbeitslosenhilfeCondition = this.getKantonalearbeitslosenhilfeCondition(kantonalearbeitslosenhilfeValue);
        return (
            leistungsimportEUEFTAValue ||
            (!leistungsbezugValue && !kantonalearbeitslosenhilfeValue) ||
            (leistungsbezugValue === leistungsbezugNichtArbeitslos && !kantonalearbeitslosenhilfeValue) ||
            (leistungsbezugValue === leistungsbezugKeineALE && kantonalearbeitslosenhilfeCondition) ||
            (leistungsbezugValue === leistungsbezugALEAusgesteuert && kantonalearbeitslosenhilfeCondition)
        );
    }

    private getKantonalearbeitslosenhilfeCondition(kantonalearbeitslosenhilfeValue: string): boolean {
        const kantonaleArbeitslosenhilfeAusgesteuert = this.facade.formUtilsService.getCodeIdByCode(
            this.kantonalearbeitslosenhilfeOptions,
            KantonalearbeitslosenhilfeCodeEnum.AUSGESTEUERT
        );
        const kantonaleArbeitslosenhilfeNichtBeziehen = this.facade.formUtilsService.getCodeIdByCode(
            this.kantonalearbeitslosenhilfeOptions,
            KantonalearbeitslosenhilfeCodeEnum.KEINBEZUG
        );
        return (
            !kantonalearbeitslosenhilfeValue ||
            kantonalearbeitslosenhilfeValue === kantonaleArbeitslosenhilfeAusgesteuert ||
            kantonalearbeitslosenhilfeValue === kantonaleArbeitslosenhilfeNichtBeziehen
        );
    }
}
