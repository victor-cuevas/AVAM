import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { Component, ElementRef, Host, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { forkJoin, iif, Subscription } from 'rxjs';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { FormPersonalienHelperService } from 'src/app/shared/services/forms/form-personalien-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomainEnum } from 'src/app/shared/enums/domain.enum';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseFormBuilder, HttpFormStateEnum, ToolboxService } from 'src/app/shared';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { DateValidator } from 'src/app/shared/validators/date-validator';
import { ZasAbgleichResponse } from '@shared/models/dtos/stes-zas-abgleich-response';
import { ZasAbgleichRequest } from '@shared/models/dtos/stes-zas-abgleich-request';
import { StesZasAbgleichService } from '@stes/services/stes-zas-abgleich.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { SvNummerValidator } from '@shared/validators/sv-nummer-validator';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { AufenthaltsstatusCodeEnum } from '@app/shared/enums/domain-code/aufenthaltsstatus-code.enum';
import PrintHelper from '@shared/helpers/print.helper';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDetailsPaths } from '@shared/enums/stes-navigation-paths.enum';
import { EmailValidator } from '@shared/validators/email-validator';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { StesStoreService } from '@app/modules/stes/stes-store.service';
import { StesSchlagwortDTO } from '@dtos/stesSchlagwortDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-details-personalien',
    templateUrl: './stes-details-personalien.component.html',
    styleUrls: ['./stes-details-personalien.component.scss'],
    providers: [ObliqueHelperService]
})
export class StesDetailsPersonalienComponent extends Unsubscribable implements OnInit, OnDestroy, BaseFormBuilder, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('modalZasAbgleichen') modalZasAbgleichen: ElementRef;
    @ViewChild('modalZasListAbgleichen') modalZasListAbgleichen: ElementRef;
    isAnmeldung: boolean;
    isReadOnly: boolean;
    zasTakeOverUsed: boolean;
    istZuestaendig: boolean;

    stesId: string;
    personalienForm: FormGroup;
    personalienChannel = 'personalien';

    /**
     * gui entry with 'id'
     */
    landDefaultWert: any;
    letzterzasabgleichParagraph = '';

    permissions: typeof Permissions = Permissions;
    isZasAbgleichDisabled: boolean;

    public options = [];
    public personalienData: any = {};
    public geschlechtDropdownLables: any[] = [];
    public zivilstandDropdownLables: any[] = [];
    public aufenthaltsstatusDropdownLables: any[] = [];
    public schlagworteList: any[] = [];
    private schlagworte: CodeDTO[] = [];
    private observeClickActionSub: Subscription;
    private dataServiceSub: Subscription;
    private zasDataSubscription: Subscription;
    private personalienToolboxId = 'personalien';
    private letzterzasabgleichParagraphReset = '';
    private readonly dateFormat = 'DD.MM.YYYY';
    private oldNationalitaetId;
    private oldNationalitaetObject;
    private oldVersichertenNrList;
    private storeData;
    private oldAhvAk;

    constructor(
        private facade: FacadeService,
        private formBuilder: FormBuilder,
        private formPersonalienHelper: FormPersonalienHelperService,
        private dataService: StesDataRestService,
        private route: ActivatedRoute,
        private readonly modalService: NgbModal,
        private interactionService: StesComponentInteractionService,
        private router: Router,
        private stesZasAbgleichService: StesZasAbgleichService,
        private wizardService: WizardService,
        @Host() @Optional() public f: DisableControlDirective,
        private stesInfobarService: AvamStesInfoBarService,
        private stesStore: StesStoreService,
        private obliqueHelperService: ObliqueHelperService
    ) {
        super();
        SpinnerService.CHANNEL = this.personalienChannel;
        ToolboxService.CHANNEL = this.personalienChannel;
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesPersonalien' });
        this.facade.spinnerService.activate(this.personalienChannel);
        this.route.parent.data.subscribe(data => {
            this.isAnmeldung = data.isAnmeldung;
            if (this.isAnmeldung) {
                this.route.paramMap.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
                    this.stesId = params.get('stesId');
                    this.reloadPage();
                    this.setValidators();
                });
            } else {
                this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
                    if (!this.stesId || this.stesId !== params['stesId']) {
                        this.stesId = params['stesId'];
                        this.reloadPage();
                        this.setValidators();
                    }
                });
            }
        });

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.facade.openModalFensterService.openHistoryModal(this.stesId, AvamCommonValueObjectsEnum.T_STES);
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_STES_PERSONALIEN, this.stesId);
            }
        });

        this.stesStore.data$.subscribe((stes: any) => {
            if (stes.length > 0) {
                this.storeData = stes[0].data;
            }
        });
        this.checkLandAutosugestChanged();
        this.facade.navigationService.showNavigationTreeRoute(StesDetailsPaths.PERSONALIEN);
    }

    subscribeToWizard() {
        this.wizardService.setFormIsDirty(this.personalienForm.dirty);
        this.personalienForm.valueChanges.subscribe(value => {
            this.wizardService.setFormIsDirty(this.personalienForm.dirty);
        });
    }

    reloadPage() {
        this.personalienForm = this.formPersonalienHelper.createForm(this.formBuilder, this.isAnmeldung);
        if (this.isAnmeldung) {
            this.subscribeToWizard();
        }
        this.configureToolbox();

        this.zasDataSubscription = this.stesZasAbgleichService.getTakeOverZasEventEmitter().subscribe((response: ZasAbgleichResponse) => {
            this.takeOverZas(response);
        });

        this.getData();
    }

    canDeactivate(): boolean {
        return this.personalienForm.dirty;
    }

    configureToolbox() {
        let toolboxConfig: ToolboxConfiguration[];

        if (this.isAnmeldung) {
            toolboxConfig = ToolboxConfig.getStesAnmeldungConfig();
        } else {
            toolboxConfig = ToolboxConfig.getDefaultConfig();
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }
        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.personalienToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId), !this.isAnmeldung);
    }

    /**
     * relies on correctly given landDefaultWert
     */
    getData() {
        const getBearbeitenSub = this.dataService.getPersonalienBearbeiten(this.stesId);
        const getAnmeldenSub = this.dataService.getPersonalienAnmelden(this.stesId, this.facade.translateService.currentLang);
        forkJoin(
            this.dataService.getStaaten('de', 'Schweiz'),
            iif(() => this.isAnmeldung, getAnmeldenSub, getBearbeitenSub),
            this.dataService.getCode(DomainEnum.AUFENHALTSSTATUS),
            this.dataService.getCode(DomainEnum.GESCHLECHT),
            this.dataService.getCode(DomainEnum.ZIVILSTAND),
            this.dataService.getSchlagworte(StatusEnum.AKTIV)
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([staatenList, response, aufenthaltsstatus, geschlechtData, zivilstandData, schlagworte]) => {
                    this.landDefaultWert = staatenList[0];
                    this.landDefaultWert.id = this.landDefaultWert.staatId;
                    this.landDefaultWert.value = this.facade.dbTranslateService.translate(this.landDefaultWert, 'name');
                    this.schlagworte = schlagworte;

                    if (response.data) {
                        this.personalienData = this.isAnmeldung ? response.data : response.data.stesPersonalienDTO;
                        this.istZuestaendig = response.data.istZuestaendig;
                        this.geschlechtDropdownLables = this.facade.formUtilsService.mapDropdownKurztext(geschlechtData);
                        this.zivilstandDropdownLables = this.facade.formUtilsService.mapDropdownKurztext(zivilstandData);
                        this.aufenthaltsstatusDropdownLables = this.facade.formUtilsService.mapDropdownKurztext(aufenthaltsstatus);
                        this.schlagworteList = this.setFunktionMultiselectOptions(this.schlagworte, this.personalienData.schlagwortSTESListe).slice();
                        this.personalienForm.setValue(this.formPersonalienHelper.mapToForm(this.personalienData));
                        this.letzterzasabgleichParagraph = this.formatDateNgx(this.personalienData.personStesObject.letzterZASAbgleich);
                        this.letzterzasabgleichParagraphReset = this.letzterzasabgleichParagraph;
                        const wohnadresseForm = this.personalienForm.controls.wohnadresseForm as FormGroup;

                        if (this.isAnmeldung && !wohnadresseForm.controls.land.value) {
                            this.setLand(this.landDefaultWert);
                        }
                        this.personalienForm.markAsPristine();

                        this.setFormValidation(this.personalienData.leistungsimportEUEFTA);
                        this.interactionService.updateDetailsHeader(this.stesId);
                        this.wizardService.formHttpState.next(HttpFormStateEnum.GET_SUCCESS);
                        this.isReadOnly = !this.isZASEditable() || this.isAnmeldung;
                        this.enableEmailSend();
                        if (!this.isAnmeldung) {
                            this.stesInfobarService.sendLastUpdate(this.personalienData);
                        }
                    } else if (response.warning) {
                        this.wizardService.formHttpState.next(HttpFormStateEnum.GET_FAIL);
                    }

                    this.facade.spinnerService.deactivate(this.personalienChannel);
                    this.isZasAbgleichDisabled = false;
                },
                () => {
                    this.wizardService.formHttpState.next(HttpFormStateEnum.GET_FAIL);
                    this.facade.spinnerService.deactivate(this.personalienChannel);
                }
            );
    }

    ngOnDestroy() {
        this.facade.toolboxService.sendConfiguration([]);
        this.observeClickActionSub.unsubscribe();
        this.stesInfobarService.sendLastUpdate({}, true);
        this.enableEmailSend(this.personalienData.email);

        if (!this.isAnmeldung) {
            this.facade.fehlermeldungenService.closeMessage();
        }

        if (this.zasDataSubscription) {
            this.zasDataSubscription.unsubscribe();
        }

        super.ngOnDestroy();
    }

    reset() {
        if (this.personalienForm.dirty || this.zasTakeOverUsed) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.schlagworteList = this.setFunktionMultiselectOptions(this.schlagworte, this.personalienData.schlagwortSTESListe).slice();
                if (this.oldNationalitaetId) {
                    this.personalienData.personStesObject.nationalitaetId = this.oldNationalitaetId;
                }
                if (this.oldNationalitaetObject) {
                    this.personalienData.personStesObject.nationalitaetObject = this.oldNationalitaetObject;
                }

                if (this.oldVersichertenNrList) {
                    this.personalienData.personStesObject.versichertenNrList = this.oldVersichertenNrList;
                }

                if (this.oldAhvAk) {
                    this.personalienData.personStesObject.ahvAk = this.oldAhvAk;
                }

                this.personalienForm.reset(this.formPersonalienHelper.mapToForm(this.personalienData));
                this.setFormValidation(this.personalienData.leistungsimportEUEFTA);
                if (this.isAnmeldung && this.personalienData.landWohnadresseID === 0) {
                    this.setLand(this.landDefaultWert);
                }
                this.enableEmailSend();
                if (this.zasTakeOverUsed) {
                    this.isReadOnly = !this.isZASEditable() || this.isAnmeldung;
                    this.letzterzasabgleichParagraph = this.letzterzasabgleichParagraphReset;
                    if (this.isZASEditable()) {
                        (this.personalienForm.get('personenstammdaten') as FormGroup).controls.svNr.clearValidators();
                        (this.personalienForm.get('personenstammdaten') as FormGroup).controls.svNr.reset();
                        (this.personalienForm.get('personenstammdaten') as FormGroup).controls.svNr.setValidators(SvNummerValidator.svNummberValid);
                    }
                }
            });
        }
    }

    cancel() {
        this.facade.fehlermeldungenService.closeMessage();
        this.router.navigate(['/home']);
    }

    save(onSuccess?, onFailure?) {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.personalienForm.controls.personenstammdaten.value.svNr && !this.letzterzasabgleichParagraph) {
            this.facade.fehlermeldungenService.showMessage('stes.error.anmeldung.svnrohnezasabgleich', 'danger');
            this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_FAIL);
            if (onFailure) {
                onFailure();
            }
        } else if (this.personalienForm.valid) {
            this.saveValidData(onSuccess, onFailure);
        } else {
            this.ngForm.onSubmit(undefined);
            this.wizardService.activeWizard();
            this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_FAIL);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private saveValidData(onSuccess, onFailure) {
        this.facade.spinnerService.activate(this.personalienChannel);

        if (!this.isAnmeldung) {
            this.storeSelectedGeschlecht();
        }
        const createBearbeitenSub = this.dataService.createPersonalienBearbeiten(
            this.stesId,
            this.formPersonalienHelper.mapToDTO(this.personalienData, this.personalienForm, false, this.landDefaultWert.id),
            this.facade.translateService.currentLang
        );
        const createAnmeldenSub = this.dataService.createPersonalienAnmelden(
            this.stesId,
            this.formPersonalienHelper.mapToDTO(this.personalienData, this.personalienForm, true, this.landDefaultWert.id),
            this.facade.translateService.currentLang
        );

        this.dataServiceSub = iif(() => this.isAnmeldung, createAnmeldenSub, createBearbeitenSub).subscribe(
            response => {
                if (response.data) {
                    this.personalienData = response.data;
                    this.schlagworteList = this.setFunktionMultiselectOptions(this.schlagworte, response.data.schlagwortSTESListe).slice();
                    this.personalienForm.reset(this.formPersonalienHelper.mapToForm(this.personalienData));
                    this.letzterzasabgleichParagraphReset = this.formatDateNgx(this.personalienData.personStesObject.letzterZASAbgleich);
                    this.enableEmailSend();
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.interactionService.updateDetailsHeader(this.stesId);
                    if (!this.isAnmeldung) {
                        this.stesInfobarService.sendLastUpdate(this.personalienData);
                    }
                    this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_SUCCESS);
                    if (onSuccess) {
                        onSuccess();
                    }
                    this.isReadOnly = !this.isZASEditable() || this.isAnmeldung;
                    this.wizardService.setFormIsDirty(false);
                } else if (response.warning) {
                    this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_FAIL);
                    if (onFailure) {
                        onFailure();
                    }
                }
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.personalienChannel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.personalienChannel);
                OrColumnLayoutUtils.scrollTop();
                this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_NO_RESPONCE);
                if (onFailure) {
                    onFailure();
                }
            }
        );
    }

    isZASEditable(): boolean {
        if (this.personalienData && this.personalienData.personStesObject && this.personalienData.personStesObject.svNrFromZas) {
            return false;
        }

        return true;
    }

    openZasAbgleichen() {
        this.facade.fehlermeldungenService.closeMessage();
        if (!this.personalienData.personStesObject) {
            return;
        }
        const zasAbgleichRequest: ZasAbgleichRequest = {
            stesId: Number(this.stesId),
            personenNr: this.personalienData.personStesObject ? this.personalienData.personStesObject.personenNr : null,
            nationalitaetId: this.personalienData.personStesObject.nationalitaetId,
            nationalitaet: this.personalienData.personStesObject ? this.personalienData.personStesObject.nationalitaetObject : null,
            geschlechtDropdownLables: this.geschlechtDropdownLables,
            personenstammdaten: this.personalienForm.get('personenstammdaten'),
            letzterZASAbgleich: this.personalienData.personStesObject ? this.formatDateNgx(this.personalienData.personStesObject.letzterZASAbgleich) : null
        } as ZasAbgleichRequest;

        this.stesZasAbgleichService.createZasAbgleich(zasAbgleichRequest);
    }

    getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    disableEmailSend() {
        this.facade.toolboxService.sendEmailAddress('');
    }

    changeSvNr() {
        this.isZasAbgleichDisabled = (this.personalienForm.get('personenstammdaten') as FormGroup).controls.svNr.invalid;
    }

    enableEmailSend(email?: string) {
        const emailAddress = email ? email : this.personalienForm.value.kontaktangaben.email;
        this.facade.toolboxService.sendEmailAddress(emailAddress ? emailAddress : '');
    }

    public checkAufenthaltbis() {
        const aufenhaltsbewilligung = this.personalienForm.get('aufenhaltsbewilligung') as FormGroup;
        const aufenthaltBisControl = aufenhaltsbewilligung.controls.aufenthaltbis;
        aufenthaltBisControl.clearValidators();
        switch (Number(aufenhaltsbewilligung.controls.aufenthaltsstatus.value)) {
            case Number(this.facade.formUtilsService.getCodeIdByCode(this.aufenthaltsstatusDropdownLables, AufenthaltsstatusCodeEnum.B_EUEFTA_AUFENTHALTSBEWILLIGUNG)):
            case Number(this.facade.formUtilsService.getCodeIdByCode(this.aufenthaltsstatusDropdownLables, AufenthaltsstatusCodeEnum.B_AUFENTHALTSBEWILLIGUNG)):
            case Number(this.facade.formUtilsService.getCodeIdByCode(this.aufenthaltsstatusDropdownLables, AufenthaltsstatusCodeEnum.B_AUFENTHALTSBEWILLIGUNG_FLUECHTLINGE)):
            case Number(this.facade.formUtilsService.getCodeIdByCode(this.aufenthaltsstatusDropdownLables, AufenthaltsstatusCodeEnum.F_VORLAEFIG_AUFGENOMMENE_AUSLAENDER)):
            case Number(this.facade.formUtilsService.getCodeIdByCode(this.aufenthaltsstatusDropdownLables, AufenthaltsstatusCodeEnum.F_VORLAEFIG_AUFGENOMMENE_FLUECHTLINGE)):
            case Number(this.facade.formUtilsService.getCodeIdByCode(this.aufenthaltsstatusDropdownLables, AufenthaltsstatusCodeEnum.L_EUEFTA_KURZAUFENTHALTSBEWILLIGUNG)):
            case Number(this.facade.formUtilsService.getCodeIdByCode(this.aufenthaltsstatusDropdownLables, AufenthaltsstatusCodeEnum.L_KURZAUFENTHALTSBEWILLIGUNG)):
                aufenthaltBisControl.setValidators([DateValidator.dateFormatNgx, Validators.required, DateValidator.dateValidNgx]);
                break;
            default:
                aufenthaltBisControl.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
                break;
        }
        aufenthaltBisControl.updateValueAndValidity();
    }

    takeOverZas(zasAbgleichResponse: ZasAbgleichResponse): void {
        if (!this.zasTakeOverUsed) {
            this.oldNationalitaetId = this.personalienData.personStesObject.nationalitaetId;
            this.oldNationalitaetObject = this.personalienData.personStesObject.nationalitaetObject;
            this.oldVersichertenNrList = this.personalienData.personStesObject.versichertenNrList;
            this.oldAhvAk = this.personalienData.personStesObject.ahvAk;
        }

        this.personalienData.personStesObject.nationalitaetId = zasAbgleichResponse.nationalitaetId;
        this.personalienData.personStesObject.nationalitaetObject = zasAbgleichResponse.nationalitaet;
        this.personalienData.personStesObject.versichertenNrList = zasAbgleichResponse.versichertenNrList;
        this.letzterzasabgleichParagraph = this.formatDateNgx(new Date());
        this.personalienData.personStesObject.letzterZASAbgleich = this.facade.formUtilsService.transformDateToTimestamps(new Date());
        this.personalienData.personStesObject.ahvAk = zasAbgleichResponse.ahvAk;
        this.isReadOnly = true;
        this.zasTakeOverUsed = true;
        this.personalienForm.markAsDirty();

        if (zasAbgleichResponse && this.landDefaultWert && zasAbgleichResponse.nationalitaet.staatId === this.landDefaultWert.id) {
            this.clearAufenthaltsbewilligung();
        }
    }

    next(onDone?) {
        this.wizardService.deactiveWizard();
        this.save(
            onSuccess => {
                this.wizardService.activeWizard();
                this.wizardService.moveNext();
                this.wizardService.validateStep(true);
            },
            onFailure => {
                this.wizardService.activeWizard();
                this.wizardService.validateStep(false);
            }
        );
    }

    prev() {
        this.wizardService.movePrev();
    }

    validAufenthaltsstatus(): boolean {
        const personenstammdaten = this.personalienForm.get('personenstammdaten') as FormGroup;
        const result = (this.personalienForm.get('personenstammdaten') as FormGroup).controls.nationalitaet.value;
        const upperNationName = typeof result === 'string' ? result.toUpperCase() : '';
        const isSchweizeLandString =
            this.landDefaultWert &&
            (upperNationName === this.landDefaultWert.nameDe.toUpperCase() ||
                upperNationName === this.landDefaultWert.nameIt.toUpperCase() ||
                upperNationName === this.landDefaultWert.nameFr.toUpperCase());
        if (
            personenstammdaten.controls.nationalitaet['landAutosuggestObject'] &&
            this.landDefaultWert &&
            (personenstammdaten.controls.nationalitaet['landAutosuggestObject'].staatId === this.landDefaultWert.id || isSchweizeLandString)
        ) {
            return true;
        }

        return false;
    }

    setLand(value) {
        const wohnadresseForm = this.personalienForm.get('wohnadresseForm') as FormGroup;
        wohnadresseForm.controls.land.setValue(value);
    }

    setFormValidation(isChecked: boolean) {
        this.checkAufenthaltbis();
        if (!this.validAufenthaltsstatus()) {
            const aufenthaltsStatus = (this.personalienForm.get('aufenhaltsbewilligung') as FormGroup).get('aufenthaltsstatus');
            aufenthaltsStatus.clearValidators();
            if (aufenthaltsStatus.value === 0) {
                aufenthaltsStatus.setValue('');
            }
            if (!isChecked) {
                aufenthaltsStatus.setValidators([Validators.required]);
            }
            aufenthaltsStatus.updateValueAndValidity();
        } else {
            this.clearAufenthaltsbewilligung();
        }
    }

    formatWithDots() {
        const personenstammdaten = this.personalienForm.get('personenstammdaten') as FormGroup;
        this.facade.formUtilsService.formatDateWithDots(personenstammdaten.controls.geburtsdatum);
    }

    private setFunktionMultiselectOptions(funktionInitialCodeList: CodeDTO[], schlagwortSTESListe: StesSchlagwortDTO[]): CoreMultiselectInterface[] {
        const mappedOptions = funktionInitialCodeList.map(this.multiselectMapper);
        mappedOptions.forEach(element => {
            if (schlagwortSTESListe.some(el => el.schlagwortId === element.id)) {
                element.value = true;
            }
        });
        schlagwortSTESListe.forEach(stesSchlagwort => {
            if (stesSchlagwort.schlagwortObject && !stesSchlagwort.schlagwortObject.valid) {
                mappedOptions.push({
                    id: stesSchlagwort.schlagwortObject.schlagwortId,
                    textDe: stesSchlagwort.schlagwortObject.schlagwortDe,
                    textIt: stesSchlagwort.schlagwortObject.schlagwortIt,
                    textFr: stesSchlagwort.schlagwortObject.schlagwortFr,
                    value: true
                });
            }
        });
        return mappedOptions;
    }

    private multiselectMapper = (schlagwort: any) => {
        const element = schlagwort;

        return {
            id: element.schlagwortId,
            textDe: element.schlagwortDe,
            textIt: element.schlagwortIt,
            textFr: element.schlagwortFr,
            value: false
        };
    };

    private clearAufenthaltsbewilligung() {
        const aufenhaltsbewilligungForm = this.personalienForm.get('aufenhaltsbewilligung') as FormGroup;

        aufenhaltsbewilligungForm.controls.aufenthaltsstatus.clearValidators();
        aufenhaltsbewilligungForm.controls.aufenthaltsstatus.setValue(null);
        aufenhaltsbewilligungForm.controls.aufenthaltsstatus.updateValueAndValidity();
        aufenhaltsbewilligungForm.controls.aufenthaltbis.setValue(null);
        aufenhaltsbewilligungForm.controls.aufenthaltbis.clearValidators();
        aufenhaltsbewilligungForm.controls.aufenthaltbis.updateValueAndValidity();
        aufenhaltsbewilligungForm.controls.einreisedatum.setValue(null);
    }

    private formatDateNgx(value: string | Date | number): string {
        return this.facade.formUtilsService.formatDateNgx(value, this.dateFormat);
    }

    private setValidators() {
        this.personalienForm
            .get('kontaktangaben')
            .get('email')
            .setValidators(EmailValidator.isValidFormat);
    }

    private storeSelectedGeschlecht() {
        const selectedGeschlecht = this.geschlechtDropdownLables.find(x => x.codeId === Number(this.personalienForm.controls.personenstammdaten.value.geschlecht));
        this.storeData.geschlecht = selectedGeschlecht.code;
    }

    private checkLandAutosugestChanged() {
        const personenstammdaten = this.personalienForm.get('personenstammdaten') as FormGroup;
        personenstammdaten.controls.nationalitaet.valueChanges.subscribe(result => {
            const upperNationName = typeof result === 'string' ? result.toUpperCase() : '';
            const isSchweizStaatObject = result && result instanceof Object && this.landDefaultWert && result.staatId === this.landDefaultWert.id;
            const isSchweizeLandString =
                this.landDefaultWert &&
                (upperNationName === this.landDefaultWert.nameDe.toUpperCase() ||
                    upperNationName === this.landDefaultWert.nameIt.toUpperCase() ||
                    upperNationName === this.landDefaultWert.nameFr.toUpperCase());
            if (isSchweizStaatObject || isSchweizeLandString) {
                this.clearAufenthaltsbewilligung();
            }
        });
    }
}
