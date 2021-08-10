import { AmmConstants } from '@app/shared/enums/amm-constants';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { AmmDurchfuehrungsortDTO } from '@app/shared/models/dtos-generated/ammDurchfuehrungsortDTO';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';
import { AmmKontaktpersonDTO } from '@app/shared/models/dtos-generated/ammKontaktpersonDTO';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { BaseResponseWrapperCollectionIntegerWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionIntegerWarningMessages';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { takeUntil } from 'rxjs/operators';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { RoboHelpService } from '@app/shared';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { KontaktpersonRestService } from '@app/core/http/kontaktperson-rest.service';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-durchfuehrungsort-angebot',
    templateUrl: './durchfuehrungsort-angebot.component.html',
    styleUrls: ['./durchfuehrungsort-angebot.component.scss']
})
export class DurchfuehrungsortAngebotComponent extends AmmCloseableAbstract implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobarBasisNr') infobarBasisNr: TemplateRef<any>;

    durchfuehrungsortForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof DurchfuehrungsortAngebotComponent
     */
    channel = 'DurchfuehrungsortImAngebotChannel';
    buchungData: AmmBuchungParamDTO;
    geschaeftsfallId: number;
    ammMassnahmenType: string;
    unternehmenId: number;
    isKontaktpersonSelected = false;
    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;
    switzerland: StaatDTO;

    basisNr: number;
    entscheidId: number;
    isWizard: boolean;
    isKontakpersonCleared = false;
    kontaktPersonObject: KontakteViewDTO;
    kontaktPersonenList: AmmKontaktpersonDTO[] = [];

    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    buttons: Subject<any[]> = new Subject();
    isReadOnly: boolean;
    permissions: typeof Permissions = Permissions;
    ammMassnahmenCodes: typeof AmmMassnahmenCode = AmmMassnahmenCode;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        protected router: Router,
        private wizardService: MassnahmeBuchenWizardService,
        private stesDataRestService: StesDataRestService,
        private ammRestService: AmmRestService,
        private stesInfobarService: AvamStesInfoBarService,
        private ammHelper: AmmHelper,
        private roboHelpService: RoboHelpService,
        private kontaktpersonRestService: KontaktpersonRestService,
        protected interactionService: StesComponentInteractionService,
        protected facade: FacadeService
    ) {
        super(facade, router, interactionService);

        const onPreviousObs = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            this.wizardService.durchfuehrungsortFormValues = this.durchfuehrungsortForm.getRawValue();
            if (this.durchfuehrungsortForm.controls.land) {
                this.wizardService.durchfuehrungsortFormValues.land = this.durchfuehrungsortForm.controls.land['landAutosuggestObject'];
            }
            subscriber.next(true);
            subscriber.complete();
        });

        this.wizardService.setOnPreviousStep(onPreviousObs);

        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.createFormGroup();
        this.subscribeWizardToFormChanges();

        this.route.data.subscribe(data => {
            this.isWizard = data.wizard;

            if (!this.isWizard) {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];

                    this.route.queryParamMap.subscribe(param => {
                        this.geschaeftsfallId = +param.get('gfId');
                        this.entscheidId = param.get('entscheidId') ? +param.get('entscheidId') : null;
                    });

                    this.route.paramMap.subscribe(param => {
                        this.ammMassnahmenType = param.get('type');
                        this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];
                        this.getData();

                        this.showSideNavItems();
                    });
                });
            } else {
                this.updateKontaktpersonInfo();

                this.stesId = this.wizardService.getStesId().toString();
                this.geschaeftsfallId = this.wizardService.gfId;
                this.ammMassnahmenType = this.wizardService.getMassnahmeCode();

                this.getData();
            }
        });

        this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            if (this.buchungData) {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
            } else {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobar() });
            }
        });

        this.configureToolbox();
        this.updateFormNumber();
        super.ngOnInit();
    }

    updateFormNumber() {
        if (this.ammMassnahmenType !== AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            this.facade.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: StesFormNumberEnum.DURCHSFUEHRUNGSORT_KOLLEKTIV });
        }
    }

    updateKontaktpersonInfo() {
        if (this.wizardService.unternehmenId && this.facade.authenticationService.hasAnyPermission([Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN])) {
            this.kontaktpersonRestService.getKontaktpersonenByUnternehmenId(this.wizardService.unternehmenId).subscribe(kontakte => {
                this.kontaktPersonenList = kontakte.data.map(this.ammHelper.kontaktpersonMapper);
            });
        }
    }

    configureInfobar(title?) {
        if (this.isWizard) {
            const wizardBezeichnung = this.facade.translateService.instant('amm.massnahmen.label.massnahmeBuchen');
            const durchfuehrungsort = this.facade.translateService.instant('amm.massnahmen.label.durchfuehrungsort');
            const massnahmenLabel = this.facade.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
            const titel = this.facade.dbTranslateService.translateWithOrder(this.buchungData.titel, 'name');
            const erfassenTranslatedLabel = this.facade.translateService.instant('amm.nutzung.alttext.erfassen');

            return `${wizardBezeichnung} - ${durchfuehrungsort} ${massnahmenLabel} ${titel} ${erfassenTranslatedLabel}`;
        } else {
            const massnahmeLabel = this.facade.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
            const durchfuehrungTranslatedLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.durchfuehrungsort');

            if (title) {
                return `${massnahmeLabel} ${title} - ${durchfuehrungTranslatedLabel}`;
            } else {
                return `${massnahmeLabel} - ${durchfuehrungTranslatedLabel}`;
            }
        }
    }

    isOurLabel(message) {
        return message.data.label === this.facade.dbTranslateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
    }

    isOurUrl(): boolean {
        return this.cancelChecksIndiv() || this.cancelChecksKollektiv();
    }

    getData() {
        this.activateSpinner();

        forkJoin<BaseResponseWrapperAmmBuchungParamDTOWarningMessages, StaatDTO>([
            //NOSONAR
            this.ammRestService.getAmmBuchungParam(this.geschaeftsfallId, this.ammMassnahmenType, this.stesId),
            this.stesDataRestService.getStaatSwiss()
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([buchungParamData, swiss]) => {
                    if (buchungParamData.data) {
                        this.isKontakpersonCleared = false;
                        this.switzerland = swiss;
                        this.updateForm(buchungParamData.data);
                        this.unternehmenId = buchungParamData.data.unternehmenObject && buchungParamData.data.unternehmenObject.unternehmenId;
                        this.isReadOnly = this.buchungData.readonly;
                        this.isKontaktpersonSelected = this.isKontaktPersonSelected();

                        this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });

                        if (!this.isWizard) {
                            const buchungObj = this.ammHelper.getAmmBuchung(this.buchungData);
                            if (buchungObj && buchungObj.ammGeschaeftsfallObject) {
                                this.basisNr = buchungObj.ammGeschaeftsfallObject.basisNr;
                            }

                            this.stesInfobarService.sendLastUpdate(this.buchungData.dfOrtObject);
                            this.stesInfobarService.addItemToInfoPanel(this.infobarBasisNr);

                            this.getButtons(buchungParamData.data);
                            this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                        }

                        if (this.wizardService.durchfuehrungsortFormValues) {
                            this.durchfuehrungsortForm.patchValue(this.wizardService.durchfuehrungsortFormValues);
                            if (this.durchfuehrungsortForm.controls.kontaktperson.value) {
                                this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                            }
                        }
                    }

                    this.deactivateSpinner();
                },
                () => {
                    this.deactivateSpinner();
                }
            );
    }

    updateForm(data: AmmBuchungParamDTO) {
        this.buchungData = data;
        if (data && data.dfOrtObject) {
            this.durchfuehrungsortForm.reset(this.mapToForm(data.dfOrtObject));

            if (this.ammHelper.isAddressDifferentFromAnbieter(data.dfOrtObject, this.switzerland)) {
                this.facade.fehlermeldungenService.showMessage('amm.message.abweichungstandortadresse', 'info');
                OrColumnLayoutUtils.scrollTop();
            }

            const kontaktpersonData = this.isWizard ? this.wizardService.durchfuehrungsortFormValues : this.buchungData.dfOrtObject.ammKontaktpersonObject;

            if (kontaktpersonData && this.isKontaktpersonInfoDifferentFromAnbieter(kontaktpersonData)) {
                this.facade.fehlermeldungenService.showMessage('amm.message.abweichungkontaktperson', 'info');
                OrColumnLayoutUtils.scrollTop();
            }
        }
    }

    isKontaktpersonInfoDifferentFromAnbieter(kontaktpersonFormValues: any): boolean {
        return this.isWizard
            ? this.ammHelper.isKontaktpersonInfoDifferentFromAnbieterWizard(
                  kontaktpersonFormValues,
                  this.isKontaktpersonSelected,
                  this.kontaktPersonenList,
                  this.wizardService.kontaktpersonId
              )
            : this.ammHelper.isKontaktpersonInfoDifferentFromAnbieterBearbeiten(
                  kontaktpersonFormValues,
                  this.isKontaktpersonSelected,
                  this.buchungData.kontaktpersonOriginalObject
              );
    }

    createFormGroup() {
        this.durchfuehrungsortForm = this.formBuilder.group({
            name1: null,
            name2: null,
            name3: null,
            strasse: null,
            strasseNr: null,
            raum: null,
            plz: this.formBuilder.group({
                postleitzahl: null,
                ort: null
            }),
            land: null,
            ergaenzendeAngaben: null,
            kontaktperson: null,
            name: null,
            vorname: null,
            telefon: [null, PhoneValidator.isValidFormatWarning],
            mobile: [null, PhoneValidator.isValidFormatWarning],
            fax: [null, PhoneValidator.isValidFormatWarning],
            email: [null, EmailValidator.isValidFormat]
        });
    }

    mapToForm(data: AmmDurchfuehrungsortDTO) {
        const form = {
            name1: data.ugname1,
            name2: data.ugname2,
            name3: data.ugname3,
            strasse: data.strasse,
            strasseNr: data.hausNummer,
            raum: data.raum,
            plz: {
                postleitzahl: data.plzObject ? data.plzObject : data.auslPlz || '',
                ort: data.plzObject ? data.plzObject : data.auslOrt || ''
            },
            land: data.landObject,
            ergaenzendeAngaben: data.bemerkung
        };

        const ammKontaktperson = this.mapAmmKontaktpersonObject(data.ammKontaktpersonObject);

        return { ...form, ...ammKontaktperson };
    }

    mapAmmKontaktpersonObject(ammKontaktpersonObject: AmmKontaktpersonDTO) {
        return {
            kontaktperson: this.setKontaktPerson(ammKontaktpersonObject),
            name: ammKontaktpersonObject ? ammKontaktpersonObject.name : null,
            vorname: ammKontaktpersonObject ? ammKontaktpersonObject.vorname : null,
            telefon: ammKontaktpersonObject ? ammKontaktpersonObject.telefon : null,
            mobile: ammKontaktpersonObject ? ammKontaktpersonObject.mobile : null,
            fax: ammKontaktpersonObject ? ammKontaktpersonObject.fax : null,
            email: ammKontaktpersonObject ? ammKontaktpersonObject.email : null
        };
    }

    setKontaktPerson(ammKontaktpersonObject: AmmKontaktpersonDTO) {
        if (ammKontaktpersonObject) {
            const name = ammKontaktpersonObject.name ? ammKontaktpersonObject.name : '';
            const vorname = ammKontaktpersonObject.vorname ? ammKontaktpersonObject.vorname : '';

            return `${name}${name && vorname ? ', ' : ''}${vorname}`;
        } else {
            return null;
        }
    }

    onKontaktpersonClear() {
        this.isKontaktpersonSelected = false;
        this.kontaktPersonObject = null;
        this.isKontakpersonCleared = true;
        this.durchfuehrungsortForm.patchValue({
            kontaktperson: null,
            name: null,
            vorname: null,
            telefon: null,
            mobile: null,
            fax: null,
            email: null
        });

        if (this.isWizard) {
            this.wizardService.kontaktpersonId = null;
        }
    }

    kontaktpersonSelected(kontaktperson: KontakteViewDTO) {
        this.isKontaktpersonSelected = true;
        this.durchfuehrungsortForm.markAsDirty();
        this.kontaktPersonObject = kontaktperson;

        if (this.isWizard) {
            this.wizardService.kontaktpersonId = kontaktperson.kontaktpersonId;
        }

        this.durchfuehrungsortForm.patchValue({
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            telefon: kontaktperson.telefonNr,
            mobile: kontaktperson.mobileNr,
            fax: kontaktperson.telefaxNr,
            email: kontaktperson.email,
            kontaktId: kontaktperson.kontaktpersonId
        });
    }

    mapToDTO(): AmmDurchfuehrungsortDTO {
        const ammDurchfuehrungsortDTO: AmmDurchfuehrungsortDTO = { ...this.buchungData.dfOrtObject };

        ammDurchfuehrungsortDTO.ugname1 = this.durchfuehrungsortForm.controls.name1.value;
        ammDurchfuehrungsortDTO.ugname2 = this.durchfuehrungsortForm.controls.name2.value;
        ammDurchfuehrungsortDTO.ugname3 = this.durchfuehrungsortForm.controls.name3.value;
        ammDurchfuehrungsortDTO.strasse = this.durchfuehrungsortForm.controls.strasse.value;
        ammDurchfuehrungsortDTO.hausNummer = this.durchfuehrungsortForm.controls.strasseNr.value;
        ammDurchfuehrungsortDTO.raum = this.durchfuehrungsortForm.controls.raum.value;
        ammDurchfuehrungsortDTO.plzObject = this.durchfuehrungsortForm.controls.plz['plzWohnAdresseObject']
            ? this.durchfuehrungsortForm.controls.plz['plzWohnAdresseObject']
            : null;
        ammDurchfuehrungsortDTO.auslPlz = this.durchfuehrungsortForm.controls.plz['plzWohnAdresseObject']
            ? this.durchfuehrungsortForm.controls.plz['plzWohnAdresseObject'].plzWohnadresseAusland
            : null;
        ammDurchfuehrungsortDTO.auslOrt = this.durchfuehrungsortForm.controls.plz['plzWohnAdresseObject']
            ? this.durchfuehrungsortForm.controls.plz['plzWohnAdresseObject'].ortWohnadresseAusland
            : null;
        ammDurchfuehrungsortDTO.landObject = this.durchfuehrungsortForm.controls.land['landAutosuggestObject'];
        ammDurchfuehrungsortDTO.landId = this.durchfuehrungsortForm.controls.land['landAutosuggestObject'].staatId;
        ammDurchfuehrungsortDTO.bemerkung = this.durchfuehrungsortForm.controls.ergaenzendeAngaben.value;

        if (this.isKontakpersonCleared) {
            ammDurchfuehrungsortDTO.ammKontaktpersonId = AmmConstants.UNDEFINED_LONG_ID;
        }

        ammDurchfuehrungsortDTO.ammKontaktpersonObject = this.ammHelper.initializeKperson(
            this.durchfuehrungsortForm,
            ammDurchfuehrungsortDTO,
            this.kontaktPersonObject,
            this.isKontakpersonCleared
        );

        return ammDurchfuehrungsortDTO;
    }

    onSave() {
        this.activateSpinner();

        this.facade.fehlermeldungenService.closeMessage();
        if (this.durchfuehrungsortForm.valid) {
            const ammBuchungParam: AmmBuchungParamDTO = JSON.parse(JSON.stringify(this.buchungData));
            const currentLanguage = this.facade.translateService.currentLang;

            ammBuchungParam.dfOrtObject = this.mapToDTO();

            this.ammRestService.updateDurchfuehrungsortAmmBuchungParam(ammBuchungParam, this.stesId, this.ammMassnahmenType, this.geschaeftsfallId, currentLanguage).subscribe(
                response => {
                    if (response.data) {
                        this.isKontakpersonCleared = false;
                        this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                        if (!this.isWizard) {
                            this.updateForm(response.data);
                            this.stesInfobarService.sendLastUpdate(this.buchungData.dfOrtObject);
                            this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                        } else {
                            this.entscheidId = response.data.ammBuchungSession.ammGeschaeftsfallObject.allAmmEntscheid.find(
                                entscheid => entscheid.ammGeschaeftsfallId === this.geschaeftsfallId
                            ).ammEntscheidId;

                            this.wizardService.isDirty.buchung = false;
                            this.wizardService.isDirty.beschreibung = false;
                            this.wizardService.isDirty.durchfuehrungsort = false;
                            this.wizardService.notFirstEntry = false;

                            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG.replace(':type', this.ammMassnahmenType)}`], {
                                queryParams: { gfId: this.geschaeftsfallId, entscheidId: this.entscheidId }
                            });
                        }
                    }

                    this.deactivateSpinner();
                },
                () => {
                    this.deactivateSpinner();
                    if (!this.isWizard) {
                        this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                    }
                }
            );
        } else {
            this.deactivateSpinner();
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    onTextClear(name: string) {
        this.durchfuehrungsortForm.get(name).reset();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        if (!this.isWizard) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
            if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
                toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
            }
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId));

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);

            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.geschaeftsfallId, +buchungObject.ammBuchungId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.buchungData.dfOrtObject.durchfuehrungsortId, AvamCommonValueObjectsEnum.T_DURCHFUEHRUNGSORT);
            } else if (this.isWizard && action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.DURCHSFUEHRUNGSORT_IM_ANGEBOT);
            }
        });
    }

    openHistoryModal(objId: number, objType: string) {
        this.facade.openModalFensterService.openHistoryModal(objId.toString(), objType);
    }

    openDmsCopyModal(geschaeftsfallId: number, buchungNr: number) {
        this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_STES_AMM, geschaeftsfallId.toString(), buchungNr.toString());
    }

    anbieterdatenUebernehmen() {
        this.facade.spinnerService.activate(this.channel);
        this.facade.fehlermeldungenService.closeMessage();

        this.ammRestService.anbieterUebernehmen(this.ammMassnahmenType, this.geschaeftsfallId).subscribe(
            response => {
                if (response.data) {
                    const unternehmenObj = response.data.unternehmenObject;
                    this.durchfuehrungsortForm.patchValue({
                        name1: unternehmenObj.name1,
                        name2: unternehmenObj.name2,
                        name3: unternehmenObj.name3,
                        strasse: unternehmenObj.strasse,
                        strasseNr: unternehmenObj.strasseNr,
                        raum: null,
                        plz: {
                            postleitzahl: unternehmenObj.plz ? unternehmenObj.plz : unternehmenObj.plzAusland || '',
                            ort: unternehmenObj.plz ? unternehmenObj.plz : unternehmenObj.ortAusland || ''
                        },
                        land: unternehmenObj.staat,
                        ...this.mapAmmKontaktpersonObject(response.data.ammKontaktpersonObject)
                    });

                    this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                }

                this.durchfuehrungsortForm.markAsDirty();
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    cancel() {
        if (this.cancelChecksIndiv() || this.cancelChecksKollektiv()) {
            this.router.navigate([`stes/details/${this.stesId}/amm/uebersicht`]);
        }
    }

    cancelChecksIndiv() {
        return (
            this.router.url.includes(AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_KOSTEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType))
        );
    }

    cancelChecksKollektiv() {
        return (
            this.router.url.includes(AMMPaths.PSAK_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.TEILNEHMERPLAETZE.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.TEILNEHMERWARTELISTE.replace(':type', this.ammMassnahmenType))
        );
    }

    cancelWizard() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
    }

    canDeactivate() {
        return this.durchfuehrungsortForm.dirty;
    }

    back() {
        this.wizardService.movePrev();
    }

    /**
     * Reset form.
     *
     * @memberof DurchfuehrungsortComponent
     */
    onReset() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.canDeactivate()) {
            this.facade.resetDialogService.reset(() => {
                if (this.wizardService.durchfuehrungsortFormValues) {
                    this.durchfuehrungsortForm.reset(this.wizardService.durchfuehrungsortFormValues);
                } else {
                    this.durchfuehrungsortForm.reset(this.mapToForm(this.buchungData.dfOrtObject));
                }

                this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                this.isKontakpersonCleared = false;
            });
        }
    }

    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        if (!this.isWizard) {
            this.stesInfobarService.removeItemFromInfoPanel(this.infobarBasisNr);
            this.stesInfobarService.sendLastUpdate({}, true);
            this.facade.fehlermeldungenService.closeMessage();
        }

        super.ngOnDestroy();
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
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
    private subscribeWizardToFormChanges() {
        if (this.isWizard) {
            this.wizardService.isDirty.durchfuehrungsort = this.durchfuehrungsortForm.dirty;
            this.durchfuehrungsortForm.valueChanges.subscribe(() => {
                this.wizardService.isDirty.durchfuehrungsort = this.durchfuehrungsortForm.dirty;
            });
        }
    }

    private showSideNavItems() {
        switch (this.ammMassnahmenType) {
            case AmmMassnahmenCode.KURS:
                this.showNavigationTreeRoute(AMMPaths.AMM_GENERAL);
                this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_BUCHUNG);
                this.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG);
                this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG);
                this.showNavigationTreeRoute(AMMPaths.TEILNEHMERWARTELISTE);
                this.showNavigationTreeRoute(AMMPaths.SPESEN);
                this.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID);
                break;
            case AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT:
                this.showNavigationTreeRoute(AMMPaths.AMM_GENERAL);
                this.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG);
                this.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG);
                this.showNavigationTreeRoute(AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT);
                this.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_KOSTEN);
                this.showNavigationTreeRoute(AMMPaths.SPESEN);
                this.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID);
                break;
            case AmmMassnahmenCode.AP:
            case AmmMassnahmenCode.BP:
            case AmmMassnahmenCode.UEF:
            case AmmMassnahmenCode.SEMO:
            case AmmMassnahmenCode.PVB:
                this.showNavigationTreeRoute(AMMPaths.AMM_GENERAL);
                this.showNavigationTreeRoute(AMMPaths.PSAK_BUCHUNG);
                this.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG);
                this.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG);
                this.showNavigationTreeRoute(AMMPaths.TEILNEHMERPLAETZE);
                //BSP23
                if (this.ammMassnahmenType === AmmMassnahmenCode.BP) {
                    this.showNavigationTreeRoute(AMMPaths.BP_KOSTEN);
                }
                this.showNavigationTreeRoute(AMMPaths.SPESEN);
                this.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID);
                break;
            default:
                break;
        }
    }

    private showNavigationTreeRoute(path) {
        this.facade.navigationService.showNavigationTreeRoute(path.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
    }

    private getButtons(data: AmmBuchungParamDTO) {
        if (!data.readonly) {
            this.ammRestService.getButtonsDurchfuehrungsort(this.geschaeftsfallId).subscribe((buttonRes: BaseResponseWrapperCollectionIntegerWarningMessages) => {
                this.buttons.next(buttonRes.data);
            });
        } else {
            this.buttons.next(null);
        }
    }

    private isKontaktPersonSelected(): boolean {
        /**
         * The first if statement checks if ammMassnahmenType is Kurs kollektiv.
         * If it is Kontaktperson is always read-only
         */
        if (this.ammMassnahmenType === AmmMassnahmenCode.KURS) {
            return false;
        }

        return this.buchungData.dfOrtObject.ammKontaktpersonObject && !!this.buchungData.dfOrtObject.ammKontaktpersonObject.kontaktId;
    }
}
