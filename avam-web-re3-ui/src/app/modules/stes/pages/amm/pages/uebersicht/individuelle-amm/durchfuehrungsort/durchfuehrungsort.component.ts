import { AmmConstants } from '@app/shared/enums/amm-constants';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective } from '@angular/forms';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService } from 'oblique-reactive';
import { AmmnutzungWizardService } from '@app/shared/components/new/avam-wizard/ammnutzung-wizard.service';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { AmmDurchfuehrungsortDTO } from '@app/shared/models/dtos-generated/ammDurchfuehrungsortDTO';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';
import { AmmKontaktpersonDTO } from '@app/shared/models/dtos-generated/ammKontaktpersonDTO';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { Subscription, Subject, Observable, forkJoin } from 'rxjs';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { BaseResponseWrapperCollectionIntegerWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionIntegerWarningMessages';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';

import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { takeUntil, first } from 'rxjs/operators';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { KontaktpersonRestService } from '@app/core/http/kontaktperson-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-durchfuehrungsort',
    templateUrl: './durchfuehrungsort.component.html',
    styleUrls: ['./durchfuehrungsort.component.scss']
})
export class DurchfuehrungsortComponent extends AmmCloseableAbstract implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobarBasisNr') infobarBasisNr: TemplateRef<any>;

    durchfuehrungsortForm: FormGroup;

    /**
     * Current component channel.
     *
     * @memberof DurchfuehrungsortComponent
     */
    channel = 'DurchfuehrungsortChannel';
    buchungData: AmmBuchungParamDTO;
    isWizard: boolean;
    geschaeftsfallId: number;
    ammMassnahmenType: string;
    unternehmenId: number;
    isKontaktpersonSelected = false;
    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;

    basisNr: number;
    entscheidId: number;
    switzerland: StaatDTO;
    isKontakpersonCleared = false;

    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    buttons: Subject<any[]> = new Subject();
    isReadOnly: boolean;
    kontaktPersonObject: KontakteViewDTO;
    kontaktPersonenList: AmmKontaktpersonDTO[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        protected router: Router,
        private wizardService: AmmnutzungWizardService,
        private stesDataRestService: StesDataRestService,
        private ammRestService: AmmRestService,
        protected facade: FacadeService,
        protected readonly modalService: NgbModal,
        private stesInfobarService: AvamStesInfoBarService,
        private ammHelper: AmmHelper,
        private kontaktpersonRestService: KontaktpersonRestService,
        private authService: AuthenticationService,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);

        const onSaveObs = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            this.wizardService.durchfuehrungsortFormValues = this.mapToDTO();

            if (this.durchfuehrungsortForm.controls.land) {
                this.wizardService.durchfuehrungsortFormValues.land = this.durchfuehrungsortForm.controls.land['landAutosuggestObject'];
            }
            this.wizardService.stesId = this.stesId;
            subscriber.next(true);
        });

        this.wizardService.setOnPreviousStep(onSaveObs);

        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.createFormGroup();
        this.subscribeToWizard();
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
                        this.updateFormNumber();
                        this.getData();
                        this.showSideNavItems();
                    });
                });
            } else {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];
                    this.ammMassnahmenType = params['type'];
                    this.updateFormNumber();
                    this.route.paramMap.subscribe(param => {
                        this.geschaeftsfallId = parseInt(param.get('gfId'), 10);
                        this.getData();
                    });
                });
                this.isKontaktpersonSelected = false;
                this.updateKontaktpersonInfo();
            }
        });
        this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            if (this.isWizard) {
                if (this.buchungData) {
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                }
            } else {
                if (this.buchungData) {
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureNonWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                } else {
                    this.stesInfobarService.sendDataToInfobar({ title: this.configureNonWizardInfobar() });
                }
            }
        });
        this.configureToolbox();
        super.ngOnInit();
    }

    configureNonWizardInfobar(title?) {
        const massnahmeLabel = this.facade.translateService.instant(this.wizardService.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const durchfuehrungTranslatedLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.durchfuehrungsort');

        if (title) {
            return `${massnahmeLabel} ${title} - ${durchfuehrungTranslatedLabel}`;
        } else {
            return `${massnahmeLabel} - ${durchfuehrungTranslatedLabel}`;
        }
    }

    configureWizardInfobar(title) {
        const massnahmeLabel = this.facade.translateService.instant(this.wizardService.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const durchfuehrungTranslatedLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.durchfuehrungsort');
        const erfassen = this.facade.translateService.instant('amm.nutzung.alttext.erfassen');

        return `${massnahmeLabel} ${title} ${erfassen} - ${durchfuehrungTranslatedLabel}`;
    }

    isOurLabel(message) {
        return (
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_AP) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_BP)
        );
    }

    isOurUrl(): boolean {
        return true;
    }

    getData() {
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);

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

                        const buchungObj = this.ammHelper.getAmmBuchung(this.buchungData);
                        if (buchungObj.ammGeschaeftsfallObject) {
                            this.basisNr = buchungObj.ammGeschaeftsfallObject.basisNr;
                        }

                        if (!this.isWizard) {
                            this.stesInfobarService.sendLastUpdate(this.buchungData.dfOrtObject);
                            this.stesInfobarService.sendDataToInfobar({
                                title: this.configureNonWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name'))
                            });
                            this.stesInfobarService.addItemToInfoPanel(this.infobarBasisNr);
                            this.isKontaktpersonSelected = this.isKontaktPersonSelected();

                            this.isReadOnly = this.buchungData.readonly;
                            this.isAnbieterInfoChanged(buchungParamData.data.dfOrtObject);
                            this.getButtons(buchungParamData.data);
                        } else {
                            this.stesInfobarService.sendDataToInfobar({
                                title: this.configureWizardInfobar(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name'))
                            });
                        }

                        if (this.isWizard && this.wizardService.durchfuehrungsortFormValues) {
                            this.durchfuehrungsortForm.patchValue(this.mapToForm(this.wizardService.durchfuehrungsortFormValues));

                            if (this.durchfuehrungsortForm.controls.kontaktperson.value) {
                                this.isKontaktpersonSelected = true;
                            }
                            this.isAnbieterInfoChanged(this.wizardService.durchfuehrungsortFormValues);
                        }
                    }

                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                },
                () => {
                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                }
            );
    }

    updateForm(data: AmmBuchungParamDTO) {
        this.buchungData = data;
        if (data && data.dfOrtObject) {
            this.durchfuehrungsortForm.reset(this.mapToForm(data.dfOrtObject));
        }
    }

    updateKontaktpersonInfo() {
        if (this.wizardService.lastAnbieterId && this.authService.hasAnyPermission([Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN])) {
            this.kontaktpersonRestService.getKontaktpersonenByUnternehmenId(this.wizardService.lastAnbieterId).subscribe(kontakte => {
                this.kontaktPersonenList = kontakte.data.map(this.ammHelper.kontaktpersonMapper);
            });
        }
    }

    isAnbieterInfoChanged(dfOrtObject) {
        if (!this.isWizard) {
            if (dfOrtObject && this.ammHelper.isAddressDifferentFromAnbieter(dfOrtObject, this.switzerland)) {
                this.facade.fehlermeldungenService.showMessage('amm.message.abweichungstandortadresse', 'info');
                OrColumnLayoutUtils.scrollTop();
            }
        } else {
            if (dfOrtObject && this.isAddressDifferentFromAnbieterWizard(dfOrtObject, this.switzerland)) {
                this.facade.fehlermeldungenService.showMessage('amm.message.abweichungstandortadresse', 'info');
                OrColumnLayoutUtils.scrollTop();
            }
        }

        if (dfOrtObject && this.isKontaktpersonInfoDifferentFromAnbieter(dfOrtObject)) {
            this.facade.fehlermeldungenService.showMessage('amm.message.abweichungkontaktperson', 'info');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    isKontaktpersonInfoDifferentFromAnbieter(dfOrtFormValues: any): boolean {
        return this.isWizard
            ? this.ammHelper.isKontaktpersonInfoDifferentFromAnbieterWizard(
                  dfOrtFormValues.ammKontaktpersonObject,
                  this.isKontaktpersonSelected,
                  this.kontaktPersonenList,
                  this.wizardService.kontaktpersonId
              )
            : this.ammHelper.isKontaktpersonInfoDifferentFromAnbieterBearbeiten(
                  dfOrtFormValues.ammKontaktpersonObject,
                  this.isKontaktpersonSelected,
                  this.buchungData.kontaktpersonOriginalObject
              );
    }

    isAddressDifferentFromAnbieterWizard(data, switzerland: StaatDTO) {
        let isDifferent = false;
        const anbieter: UnternehmenDTO = this.buchungData.dfOrtObject.unternehmenObject;
        if (anbieter) {
            let isPlzChanged = false;
            const plz = data.plzObject;
            const land = data.landObject;
            if (land && land.iso2Code === switzerland.iso2Code) {
                isPlzChanged = plz.plzId !== anbieter.plz.plzId;
            } else {
                isPlzChanged = data.auslPlz !== anbieter.plzAusland || data.ortAusland !== anbieter.ortAusland;
            }
            isDifferent = this.areStrasseOrHausNummerChanged(data, anbieter) || land.staatId !== anbieter.staat.staatId || isPlzChanged || this.isNameChanged(data, anbieter);
        }
        return isDifferent;
    }

    isNameChanged(data, anbieter: UnternehmenDTO): boolean {
        const isName1Changed = this.isNameLineChanged(data.ugname1, anbieter.name1);
        const isName2Changed = this.isNameLineChanged(data.ugname2, anbieter.name2);
        const isName3Changed = this.isNameLineChanged(data.ugname3, anbieter.name3);

        return isName1Changed || isName2Changed || isName3Changed;
    }

    isNameLineChanged(ugName: string, anbieterName: string): boolean {
        const isOnlyOnePresent = !!ugName !== !!anbieterName;
        const areBothPresentAndDifferent = !!ugName && !!anbieterName && ugName.toLowerCase() !== anbieterName.toLowerCase();

        return isOnlyOnePresent || areBothPresentAndDifferent;
    }

    areStrasseOrHausNummerChanged(data, anbieter: UnternehmenDTO): boolean {
        return (
            (data.strasse ? data.strasse.toLowerCase() : '') !== (anbieter.strasse ? anbieter.strasse.toLowerCase() : '') ||
            (data.hausNummer ? data.hausNummer.toLowerCase() : '') !== (anbieter.strasseNr ? anbieter.strasseNr.toLowerCase() : '')
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
            email: kontaktperson.email
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
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
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
                        const buchungObject = this.ammHelper.getAmmBuchung(response.data);

                        this.updateForm(response.data);

                        if (!this.isWizard) {
                            this.getButtons(response.data);
                            this.stesInfobarService.sendLastUpdate(this.buchungData.dfOrtObject);
                            this.isAnbieterInfoChanged(this.buchungData.dfOrtObject);
                            this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                        }

                        if (this.isWizard) {
                            this.wizardService.isDirty.buchung = false;
                            this.wizardService.isDirty.beschreibung = false;
                            this.wizardService.isDirty.durchfuehrungsort = false;
                            this.wizardService.notFirstEntry = false;

                            const entscheidId = this.ammHelper.getEntscheidId(buchungObject.ammGeschaeftsfallObject);

                            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType)}`], {
                                queryParams: { gfId: buchungObject.ammGeschaeftsfallId, entscheidId }
                            });
                        }
                    }

                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                },
                () => {
                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                }
            );
        } else {
            this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        if (this.isWizard) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        } else {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        }

        this.facade.toolboxService.sendConfiguration(
            toolboxConfig,
            this.channel,
            ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId),
            !this.isWizard
        );

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);

            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.geschaeftsfallId, +buchungObject.ammBuchungId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.buchungData.dfOrtObject.durchfuehrungsortId, AvamCommonValueObjectsEnum.T_DURCHFUEHRUNGSORT);
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

    anbieterdatenUebernehmen() {
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
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
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            },
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            }
        );
    }

    cancel() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
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
        if (this.durchfuehrungsortForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                if (this.isWizard && this.wizardService.durchfuehrungsortFormValues) {
                    this.durchfuehrungsortForm.reset(this.mapToForm(this.wizardService.durchfuehrungsortFormValues));
                    this.isAnbieterInfoChanged(this.wizardService.durchfuehrungsortFormValues);
                } else {
                    this.durchfuehrungsortForm.reset(this.mapToForm(this.buchungData.dfOrtObject));
                    this.isAnbieterInfoChanged(this.buchungData.dfOrtObject);
                }

                this.isKontaktpersonSelected = this.isKontaktPersonSelected();
                this.isKontakpersonCleared = false;
            });
        }
    }

    ngOnDestroy() {
        this.langChangeSubscription.unsubscribe();

        if (!this.isWizard) {
            this.stesInfobarService.removeItemFromInfoPanel(this.infobarBasisNr);
            this.stesInfobarService.sendLastUpdate({}, true);
            this.facade.fehlermeldungenService.closeMessage();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        super.ngOnDestroy();
    }

    /**
     * Check if form is dirty and notifiy DeactivationGuard.
     *
     * @memberof BeschreibungComponent
     */
    canDeactivate() {
        return this.durchfuehrungsortForm.dirty;
    }

    private subscribeToWizard() {
        if (this.isWizard) {
            this.wizardService.isDirty.durchfuehrungsort = this.durchfuehrungsortForm.dirty;
            this.durchfuehrungsortForm.valueChanges.subscribe(value => {
                this.wizardService.isDirty.durchfuehrungsort = this.durchfuehrungsortForm.dirty;
            });
        }
    }

    private showSideNavItems() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });

        if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS || this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths.INDIVIDUELL_KOSTEN.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        } else if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_BP) {
            this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BP_KOSTEN.replace(':type', this.ammMassnahmenType), {
                gfId: this.geschaeftsfallId,
                entscheidId: this.entscheidId
            });
        }

        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
    }

    private clearAmmKontaktPerson() {
        this.isKontakpersonCleared = true;
        this.isKontaktpersonSelected = false;

        return {
            kontaktperson: null,
            name: null,
            vorname: null,
            telefon: null,
            mobile: null,
            fax: null,
            email: null
        };
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

    private updateFormNumber() {
        const num = this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS ? StesFormNumberEnum.DURCHSFUEHRUNGSORT : StesFormNumberEnum.DURCHSFUEHRUNGSORT_AP_BP;
        this.facade.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: num });
    }

    private isKontaktPersonSelected(): boolean {
        return this.buchungData.dfOrtObject.ammKontaktpersonObject && !!this.buchungData.dfOrtObject.ammKontaktpersonObject.kontaktId;
    }
}
