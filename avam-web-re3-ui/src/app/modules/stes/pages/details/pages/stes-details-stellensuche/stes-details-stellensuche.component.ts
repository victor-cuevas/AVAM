import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators, FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, iif, Subscription } from 'rxjs'; //NOSONAR
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomainEnum } from 'src/app/shared/enums/domain.enum';
import { BaseFormBuilder, HttpFormStateEnum, ToolboxService } from 'src/app/shared';
import { StellensucheFormbuilder } from 'src/app/shared/formbuilders/stellensuche.formbuilder';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { filter, takeUntil } from 'rxjs/operators';
import { DeactivationGuarded } from 'src/app/shared/services/can-deactive-guard.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { MobilitaetCodeEnum } from '@app/shared/enums/domain-code/mobilitaet-code.enum';
import { ArbeitszeitCodeEnum } from '@app/shared/enums/domain-code/arbeitszeit-code.enum';
import PrintHelper from '@shared/helpers/print.helper';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { NumberValidator } from '@shared/validators/number-validator';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { StaatDTO } from '@dtos/staatDTO';
import { AvamUnternehmenAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-unternehmen-autosuggest/avam-unternehmen-autosuggest.component';
import { BurOertlicheEinheitDTO } from '@dtos/burOertlicheEinheitDTO';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { UnternehmenPopupDTO } from '@dtos/unternehmenPopupDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-details-stellensuche',
    templateUrl: './stes-details-stellensuche.component.html',
    styleUrls: ['./stes-details-stellensuche.component.scss'],
    providers: [ObliqueHelperService]
})
export class StesDetailsStellensucheComponent extends Unsubscribable implements OnInit, OnDestroy, BaseFormBuilder, DeactivationGuarded, AfterViewInit {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('avamUnternehmenAutosuggest') avamUnternehmenAutosuggest: AvamUnternehmenAutosuggestComponent;
    stesId: string;
    split = false;
    isMobile: string;
    stellensucheForm: FormGroup;
    arbeitsForm: FormGroup;
    arbeitsOrtForm: FormGroup;
    mobiliteatForm: FormGroup;
    arbeitgeberForm: FormGroup;
    anstellungFrom: FormGroup;
    besondereArbeitsform: FormGroup;

    /**
     * the unternehmen - data.unternehmen  || data.letzterArbeitgeberBurObject
     */
    currentUnternehmen: UnternehmenPopupDTO | BurOertlicheEinheitDTO | UnternehmenDTO;
    letzteAktualisierung: any;
    stellensucheFormbuilder: StellensucheFormbuilder;
    arbeitFormCheckbox: any[] = [];
    arbeitSelectOptions: any[] = [];
    mobiliteatSelectOptions: any[] = [];
    fuehrerausweisKategorieList: any[] = [];
    fuehrerAusweisKatList: any[] = [];
    isAnmeldung: boolean;
    stellensucheChannel = 'stellensuche';
    autosuggestData: any;
    beschaeftigungsgradDefaultWert = 100;
    arbeitszeitDefaultWert: string;
    langChangeSubscription: Subscription;
    besondereArbeitsformenArray: FormArray = new FormArray([]);
    translatedLabels: string[];
    permissions: typeof Permissions = Permissions;
    private dataSubscription: Subscription;
    private stellensucheToolboxId = 'stellensuche';
    private nextFlag = false;

    constructor(
        private formBuilder: FormBuilder,
        private dataService: StesDataRestService,
        private route: ActivatedRoute,
        private router: Router,
        private translateService: TranslateService,
        private wizardService: WizardService,
        private obliqueHelper: ObliqueHelperService,
        private stesInfobarService: AvamStesInfoBarService,
        private facade: FacadeService
    ) {
        super();
        SpinnerService.CHANNEL = this.stellensucheChannel;
        ToolboxService.CHANNEL = this.stellensucheChannel;
    }

    ngOnInit(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesStellensuche' });
        this.stellensucheFormbuilder = new StellensucheFormbuilder(this.formBuilder, this.facade.formUtilsService, this.translateService, this.facade.dbTranslateService);
        this.stellensucheForm = this.stellensucheFormbuilder.initForm();

        this.facade.spinnerService.activate(this.stellensucheChannel);

        this.setSubscriptions();
        this.defineFormGroups();
        this.onChanges();
        if (this.isAnmeldung) {
            this.subscribeToWizard();
        }

        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.translatedLabels = this.stellensucheFormbuilder.updateBesondereArbeitsformLabels();
        });
    }

    ngAfterViewInit(): void {
        this.getData();
    }

    ngOnDestroy(): void {
        this.facade.toolboxService.resetConfiguration();

        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }

        this.facade.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    canDeactivate(): boolean {
        return this.stellensucheForm.dirty;
    }

    //AVB-14620 will remove mothods connected to infoicon

    setSubscriptions(): void {
        this.route.parent.data.subscribe(data => {
            this.isAnmeldung = data.isAnmeldung;
        });

        if (this.isAnmeldung) {
            this.route.paramMap.subscribe(params => {
                this.stesId = params.get('stesId');
            });
        } else {
            this.route.parent.params.subscribe(params => {
                this.stesId = params['stesId'];
            });
        }

        this.configureToolbox();
        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
                if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.facade.openModalFensterService.openHistoryModal(this.stesId, AvamCommonValueObjectsEnum.T_STES);
                }
            });

        this.facade.messageBus
            .getData()
            .pipe(filter(message => message.type === 'stes-details-stellensuche'))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.data === 'got_arbeitsOrte') {
                    this.nextFlag = true;
                }
            });

        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            if (this.currentUnternehmen) {
                if (this.currentUnternehmen.hasOwnProperty('unternehmenId')) {
                    this.translateUnternehmenAvam(this.currentUnternehmen);
                } else {
                    this.translateUnternehmenBur(this.currentUnternehmen);
                }
            }
        });
    }

    translateUnternehmenAvam(data: any): void {
        if (data.nogaDTO) {
            this.arbeitgeberForm.controls.land.setValue(this.facade.dbTranslateService.translate(data.staat, 'name'));
            this.arbeitgeberForm.controls.plz.setValue(`${data.plz.postleitzahl} ${this.facade.dbTranslateService.translate(data.plz, 'ort')}`);
            this.arbeitgeberForm.controls.branche.setValue(`${data.nogaDTO.nogaCodeUp} / ${this.facade.dbTranslateService.translate(data.nogaDTO, 'textlang')}`);
        } else {
            this.arbeitgeberForm.controls.land.setValue(this.facade.dbTranslateService.translate(data, 'staat'));
            this.arbeitgeberForm.controls.plz.setValue(`${data.plz} ${this.facade.dbTranslateService.translate(data, 'ort')}`);
            this.arbeitgeberForm.controls.branche.setValue(`${data.nogaCode} / ${this.facade.dbTranslateService.translate(data, 'noga')}`);
        }
    }

    translateUnternehmenBur(data: any): void {
        if (data.hasOwnProperty('letzterAGLand')) {
            if (data.letzterAGLand) {
                this.arbeitgeberForm.controls.land.setValue(this.facade.dbTranslateService.translate(data.letzterAGLand, 'name'));
            } else {
                this.facade.spinnerService.activate(this.stellensucheChannel);
                this.dataService.getStaatByISOCode(data.countryIdIso2).subscribe(
                    (staat: StaatDTO) => {
                        this.arbeitgeberForm.controls.land.setValue(this.facade.dbTranslateService.translate(staat, 'name'));
                        this.facade.spinnerService.deactivate(this.stellensucheChannel);
                    },
                    () => this.facade.spinnerService.deactivate(this.stellensucheChannel)
                );
            }
            if (data.letzterAGPlzDTO) {
                this.arbeitgeberForm.controls.plz.setValue(`${data.letzterAGPlzDTO.postleitzahl} ${this.facade.dbTranslateService.translate(data.letzterAGPlzDTO, 'ort')}`);
            } else {
                this.arbeitgeberForm.controls.plz.setValue(`${data.letzterAGPlz} ${data.letzterAGOrt}`);
            }
            this.arbeitgeberForm.controls.branche.setValue(`${data.nogaDTO.nogaCodeUp} / ${this.facade.dbTranslateService.translate(data.nogaDTO, 'textlang')}`);
        } else {
            this.facade.spinnerService.activate(this.stellensucheChannel);
            this.dataService.getStaatByISOCode(data.staatIsoCode).subscribe(
                (staat: StaatDTO) => {
                    this.arbeitgeberForm.controls.land.setValue(this.facade.dbTranslateService.translate(staat, 'name'));
                    this.arbeitgeberForm.controls.plz.setValue(`${data.plz} ${data.ort}`);
                    this.arbeitgeberForm.controls.branche.setValue(`${data.nogaCode} / ${this.facade.dbTranslateService.translate(data, 'nogaText')}`);
                    this.facade.spinnerService.deactivate(this.stellensucheChannel);
                },
                () => this.facade.spinnerService.deactivate(this.stellensucheChannel)
            );
        }
    }

    selectedUnternehmen(event): void {
        this.mapSelectedUnternehmenToForm(event);
    }

    mapSelectedUnternehmenToForm(data: any): void {
        if (data.hasOwnProperty('unternehmenId')) {
            this.setSelectedAvamUnternehmen(data);
        } else {
            this.setBurUnternehmen(data);
        }
    }

    setSelectedAvamUnternehmen(data: any): void {
        if (data.hasOwnProperty('burNr')) {
            this.arbeitgeberForm.controls.name2.setValue(data.name2);
            this.arbeitgeberForm.controls.name3.setValue(data.name3);
            this.arbeitgeberForm.controls.plz.setValue(`${data.plz} ${this.facade.dbTranslateService.translate(data, 'ort')}`);
            this.arbeitgeberForm.controls.land.setValue(this.facade.dbTranslateService.translate(data, 'staat'));
            this.arbeitgeberForm.controls.bur.setValue(data.burNr || data.provBurNr);
            this.arbeitgeberForm.controls.branche.setValue(`${data.nogaCode} / ${this.facade.dbTranslateService.translate(data, 'noga')}`);
            this.currentUnternehmen = data;
            this.checkBekanntUnternehmen();
        }
    }

    setBurUnternehmen(data: any): void {
        const isoCode = data.hasOwnProperty('countryIdISO2') ? data.countryIdISO2 : data.hasOwnProperty('staatIsoCode') ? data.staatIsoCode : null;
        if (isoCode) {
            this.facade.spinnerService.activate(this.stellensucheChannel);
            this.dataService.getStaatByISOCode(isoCode).subscribe(
                (staat: StaatDTO) => {
                    if (data.hasOwnProperty('letzterAGName1')) {
                        this.arbeitgeberForm.controls.name2.setValue(data.letzterAGName2);
                        this.arbeitgeberForm.controls.name3.setValue(data.letzterAGName3);
                    } else {
                        this.arbeitgeberForm.controls.name2.setValue(data.name2);
                        this.arbeitgeberForm.controls.name3.setValue(data.name3);
                    }
                    if (data.hasOwnProperty('letzterAGPlzDTO')) {
                        this.arbeitgeberForm.controls.plz.setValue(`${data.letzterAGPlzDTO.postleitzahl} ${this.facade.dbTranslateService.translate(data.letzterAGPlzDTO, 'ort')}`);
                    } else {
                        this.arbeitgeberForm.controls.plz.setValue(`${data.plz} ${data.ort}`);
                    }
                    this.arbeitgeberForm.controls.land.setValue(this.facade.dbTranslateService.translate(staat, 'name'));
                    if (data.hasOwnProperty('letzterAGBurNummer')) {
                        this.arbeitgeberForm.controls.bur.setValue(data.letzterAGBurNummer);
                    } else {
                        this.arbeitgeberForm.controls.bur.setValue(data.localId);
                    }
                    if (data.hasOwnProperty('nogaDTO')) {
                        this.arbeitgeberForm.controls.branche.setValue(`${data.nogaDTO.nogaCodeUp} / ${this.facade.dbTranslateService.translate(data.nogaDTO, 'textlang')}`);
                    } else {
                        this.arbeitgeberForm.controls.branche.setValue(`${data.nogaCode} / ${this.facade.dbTranslateService.translate(data, 'nogaText')}`);
                    }
                    this.currentUnternehmen = data;
                    this.checkBekanntUnternehmen();
                    this.facade.spinnerService.deactivate(this.stellensucheChannel);
                },
                () => this.facade.spinnerService.deactivate(this.stellensucheChannel)
            );
        }
    }

    onChangeSlider(target): void {
        if (Math.round(target.value) === 0) {
            this.arbeitsForm.controls.vermittlungsGrad.setValue(1);
            return;
        }
        this.arbeitsForm.controls.vermittlungsGrad.setValue(target.value);
    }

    onBlurSliderValue(target): void {
        const roundValue = Math.round(target.value);
        if (roundValue > 0) {
            this.arbeitsForm.controls.vermittlungsGrad.setValue(roundValue);
        }
    }

    defineFormGroups(): void {
        this.arbeitsForm = this.stellensucheForm.get('arbeitsForm') as FormGroup;
        this.arbeitsOrtForm = this.stellensucheForm.get('arbeitsOrtForm') as FormGroup;
        this.mobiliteatForm = this.stellensucheForm.get('mobiliteatForm') as FormGroup;
        this.arbeitgeberForm = this.stellensucheForm.get('arbeitgeberForm') as FormGroup;
        this.anstellungFrom = this.stellensucheForm.get('anstellungFrom') as FormGroup;
        this.besondereArbeitsform = this.stellensucheForm.get('besondereArbeitsform') as FormGroup;
        this.arbeitsForm.controls.vermittlungsGrad.setValidators([Validators.required, NumberValidator.isValidPercentage]);
        this.besondereArbeitsformenArray = this.stellensucheForm.get('besondereArbeitsform').get('checkboxes') as FormArray;
        this.translatedLabels = this.stellensucheFormbuilder.translatedLabels;
    }

    checkBekanntUnternehmen(): void {
        const letzterAGBekannt = this.arbeitgeberForm.controls.letzterAGBekannt.value;
        let codeGroup = '';

        if (letzterAGBekannt) {
            this.arbeitgeberForm.controls.name1.setValidators(Validators.required);
            this.arbeitgeberForm.controls.name1.updateValueAndValidity();
        } else {
            this.arbeitgeberForm.controls.name1.clearValidators();
            this.arbeitgeberForm.controls.name1.updateValueAndValidity();
        }

        if (this.arbeitgeberForm.controls.branche.value) {
            codeGroup = this.arbeitgeberForm.controls.branche.value.substring(0, 2);
        } else if (this.arbeitgeberForm.controls.teatigkeitBranche.value) {
            codeGroup = this.arbeitgeberForm.controls.teatigkeitBranche.value.nogaCodeUp.substring(0, 2);
        }

        const isCodeGroup78 = codeGroup === '78';

        if (!letzterAGBekannt || (letzterAGBekannt && isCodeGroup78)) {
            this.arbeitgeberForm.controls.teatigkeitBranche.setValidators(Validators.required);
            this.arbeitgeberForm.controls.teatigkeitBranche.updateValueAndValidity();
        } else {
            this.arbeitgeberForm.controls.teatigkeitBranche.clearValidators();
            this.arbeitgeberForm.controls.teatigkeitBranche.updateValueAndValidity();
        }
        this.onCheckboxSelected(isCodeGroup78);
    }

    subscribeToWizard(): void {
        this.wizardService.setFormIsDirty(this.stellensucheForm.dirty);
        this.stellensucheForm.valueChanges.subscribe(() => {
            this.wizardService.setFormIsDirty(this.stellensucheForm.dirty);
        });
    }

    onCheckboxSelected(isCodeGroup78: boolean): void {
        const letzterAGBekannt = this.arbeitgeberForm.controls.letzterAGBekannt.value;

        if (letzterAGBekannt) {
            if (!isCodeGroup78) {
                const arbeitgeberForm = this.stellensucheForm.get('arbeitgeberForm') as FormGroup;
                arbeitgeberForm.controls.teatigkeitBranche.setValue(null);
                arbeitgeberForm.controls.teatigkeitBranche['branchAutosuggestObj'] = null;
            }
        } else {
            this.clearUnternehmen();
        }
    }

    clearUnternehmen(): void {
        this.currentUnternehmen = null;
        this.arbeitgeberForm.controls.name1.setValue(null);
        this.arbeitgeberForm.controls.name2.setValue(null);
        this.arbeitgeberForm.controls.name3.setValue(null);
        this.arbeitgeberForm.controls.plz.setValue(null);
        this.arbeitgeberForm.controls.land.setValue(null);
        this.arbeitgeberForm.controls.bur.setValue(null);
        this.arbeitgeberForm.controls.branche.setValue(null);
    }

    setMobiliteat(value: number): void {
        const result = this.mobiliteatSelectOptions.find(v => v.codeId === Number(value));
        if (result !== undefined) {
            if (
                result.code === MobilitaetCodeEnum.MOBILITAET_IN_TEILEN_DER_SCHWEIZ ||
                result.code === MobilitaetCodeEnum.MOBILITAET_IN_DER_GANZEN_SCHWEIZ ||
                result.code === MobilitaetCodeEnum.MOBILITAET_AUCH_INS_AUSLAND
            ) {
                this.isMobile = this.translateService.instant('stes.multiselect.mobiliteat.moeglich');
            } else {
                this.isMobile = this.translateService.instant('stes.multiselect.mobiliteat.nichtmoeglich');
            }
        }
    }

    save(navigateForward?: boolean): void {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.stellensucheForm.valid) {
            this.facade.spinnerService.activate(this.stellensucheChannel);

            const createBearbeitenSub = this.dataService.createStellensucheBearbeiten(
                this.stesId,
                this.stellensucheFormbuilder.mapToDTO(this.letzteAktualisierung, this.stellensucheForm, this.currentUnternehmen, this.arbeitSelectOptions)
            );

            const createAnmeldenSub = this.dataService.createStellensucheAnmelden(
                this.stesId,
                this.stellensucheFormbuilder.mapToDTO(this.letzteAktualisierung, this.stellensucheForm, this.currentUnternehmen, this.arbeitSelectOptions)
            );

            this.dataSubscription = iif(() => this.isAnmeldung, createAnmeldenSub, createBearbeitenSub)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    response => {
                        if (response.warning) {
                            this.handleSaveWarning(navigateForward);
                        } else if (response.data) {
                            this.handleSaveOK(response, navigateForward);
                        }
                        OrColumnLayoutUtils.scrollTop();
                        this.stellensucheForm.markAsPristine();
                        this.facade.spinnerService.deactivate(this.stellensucheChannel);
                    },
                    () => {
                        this.handleSaveError(navigateForward);
                        OrColumnLayoutUtils.scrollTop();
                    }
                );
        } else {
            this.ngForm.onSubmit(undefined);
            this.wizardService.activeWizard();
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    handleSaveWarning(navigateForward: boolean): void {
        this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_FAIL);
        if (navigateForward) {
            this.wizardService.activeWizard();
        }
    }

    handleSaveOK(response: any, navigateForward: boolean): void {
        this.setAutosuggestData(response);
        this.formAktualisieren(response.data, true);
        this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_SUCCESS);
        if (navigateForward) {
            this.wizardService.activeWizard();
            this.wizardService.moveNext();
            this.wizardService.validateStep(true);
        }
    }

    handleSaveError(navigateForward: boolean): void {
        this.facade.spinnerService.deactivate(this.stellensucheChannel);
        this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_NO_RESPONCE);
        if (navigateForward) {
            this.wizardService.activeWizard();
        }
    }

    onChanges(): void {
        this.setMobiliteat(this.stellensucheForm.get('mobiliteatForm').get('mobilitaetId').value);
        this.stellensucheForm
            .get('mobiliteatForm')
            .get('mobilitaetId')
            .valueChanges.subscribe(val => {
                this.setMobiliteat(val);
            });
    }

    reset(): void {
        if (this.stellensucheForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.fuehrerAusweisKatList = this.setMultiselectOptions(this.fuehrerausweisKategorieList, this.letzteAktualisierung.fuehrerAusweisKatList).slice();
                this.stellensucheForm.reset(
                    this.stellensucheFormbuilder.mapToForm(this.letzteAktualisierung, this.arbeitSelectOptions, this.arbeitFormCheckbox, this.fuehrerausweisKategorieList)
                );
                this.selectFromSuchePlus(this.letzteAktualisierung.unternehmen);

                if (this.letzteAktualisierung.vermittlungsGrad === 0) {
                    this.arbeitsForm.controls.vermittlungsGrad.setValue(this.beschaeftigungsgradDefaultWert);
                }

                if (this.letzteAktualisierung.arbeitszeitId === 0) {
                    this.arbeitsForm.controls.arbeitszeitId.setValue(this.arbeitszeitDefaultWert);
                }

                this.autosuggestData = this.letzteAktualisierung.stesGrossregionList.concat(this.letzteAktualisierung.stesSuchregionList);
                this.currentUnternehmen = this.letzteAktualisierung.unternehmen;
                this.checkBekanntUnternehmen();
                this.facade.fehlermeldungenService.closeMessage();
            });
        }
    }

    cancel(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.router.navigate(['/home']);
    }

    getData(): void {
        const getBearbeitenSub = this.dataService.getStellensucheBearbeiten(this.stesId);
        const getAnmeldenSub = this.dataService.getStellensucheAnmelden(this.stesId);

        forkJoin(
            this.dataService.getCode(DomainEnum.ARBEITSZEIT), //NOSONAR
            this.dataService.getCode(DomainEnum.MOBILITAET),
            this.dataService.getCode(DomainEnum.FUEHRERAUSWEIS_KATEGORIE),
            this.dataService.getCode(DomainEnum.ARBEITSFORM),
            this.dataService.getCode(DomainEnum.ARBEITSFORMSTES),
            iif(() => this.isAnmeldung, getAnmeldenSub, getBearbeitenSub)
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([arbeitszeitList, mobilitaetList, fuehrerausweisKategorieList, arbeitsformList, arbeitsformStes, response]) => {
                    this.arbeitSelectOptions = this.facade.formUtilsService.mapDropdownKurztext(arbeitszeitList);
                    this.mobiliteatSelectOptions = this.facade.formUtilsService.mapDropdownKurztext(mobilitaetList);
                    this.fuehrerausweisKategorieList = fuehrerausweisKategorieList;
                    this.setCheckboxes(arbeitsformList, arbeitsformStes);
                    this.setMobiliteat(this.stellensucheForm.get('mobiliteatForm').get('mobilitaetId').value);
                    this.setAutosuggestData(response);
                    this.arbeitszeitDefaultWert = this.facade.formUtilsService.getCodeIdByCode(arbeitszeitList, ArbeitszeitCodeEnum.GANZTAGS);
                    this.formAktualisieren(response.data, false);
                    this.stellensucheForm.markAsPristine();

                    this.wizardService.formHttpState.next(HttpFormStateEnum.GET_SUCCESS);
                    if (response.data && response.data.mobilitaetId === 0) {
                        this.nextFlag = true;
                    }
                },
                () => {
                    this.facade.spinnerService.deactivate(this.stellensucheChannel);
                    this.wizardService.formHttpState.next(HttpFormStateEnum.GET_NO_RESPONCE);
                }
            );
    }

    setAutosuggestData(response): void {
        if (response.data) {
            this.autosuggestData = response.data.stesGrossregionList.concat(response.data.stesSuchregionList);
        }
    }

    setCheckboxes(arbeitsformCheckbox, lehreCheckbox): void {
        const arbeitsformen = arbeitsformCheckbox;
        arbeitsformen.push(lehreCheckbox[0]);
        this.arbeitFormCheckbox = this.facade.formUtilsService.mapDropdownKurztext(arbeitsformen);
    }

    formAktualisieren(data: any, onSave: boolean): void {
        if (data !== null) {
            this.currentUnternehmen = data.unternehmen ? data.unternehmen : data.letzterArbeitgeberBurObject;
            this.letzteAktualisierung = data;
            this.fuehrerAusweisKatList = this.setMultiselectOptions(this.fuehrerausweisKategorieList, this.letzteAktualisierung.fuehrerAusweisKatList).slice();
            this.stellensucheForm.reset(
                this.stellensucheFormbuilder.mapToForm(this.letzteAktualisierung, this.arbeitSelectOptions, this.arbeitFormCheckbox, this.fuehrerausweisKategorieList)
            );
            this.formAktualisierenForSuchePlus(data);
            this.defineFormGroups();

            if (onSave) {
                this.facade.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
            }
        }

        if (this.isAnmeldung && !onSave) {
            if (!this.letzteAktualisierung || !this.letzteAktualisierung.vermittlungsGrad) {
                this.arbeitsForm.controls.vermittlungsGrad.setValue(this.beschaeftigungsgradDefaultWert);
            }
            if (!this.letzteAktualisierung || !this.letzteAktualisierung.arbeitszeitId) {
                this.arbeitsForm.controls.arbeitszeitId.setValue(this.arbeitszeitDefaultWert);
            }
            this.isMobile = this.translateService.instant('stes.multiselect.mobiliteat.nichtmoeglich');
        }

        this.facade.spinnerService.deactivate(this.stellensucheChannel);
        this.checkBekanntUnternehmen();
    }

    configureToolbox(): void {
        const toolboxConfig: ToolboxConfiguration[] = this.isAnmeldung ? ToolboxConfig.getStesAnmeldungConfig() : ToolboxConfig.getDefaultConfig();
        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.stellensucheToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId), !this.isAnmeldung);
    }

    next(): void {
        if (this.nextFlag) {
            this.wizardService.deactiveWizard();
            this.save(true);
        } else {
            this.facade.messageBus
                .getData()
                .pipe(filter(message => message.type === 'stes-details-stellensuche'))
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(message => {
                    if (message.data === 'got_arbeitsOrte') {
                        this.wizardService.deactiveWizard();
                        this.save(true);
                    }
                });
        }
    }

    prev(): void {
        this.wizardService.movePrev();
    }

    private formAktualisierenForSuchePlus(data: any): void {
        if (data.letzterArbeitgeberBurObject) {
            this.selectFromSuchePlus({
                ...this.currentUnternehmen,
                name1: data.letzterArbeitgeberBurObject.letzterAGName1
            });
        } else {
            this.selectFromSuchePlus(this.currentUnternehmen);
        }
    }

    private selectFromSuchePlus(unternehmen: any): void {
        if (this.avamUnternehmenAutosuggest && unternehmen) {
            this.avamUnternehmenAutosuggest.selectFromSuchePlus(unternehmen);
        }
    }

    private setMultiselectOptions(codeList: CodeDTO[], savedValues: any[]): CoreMultiselectInterface[] {
        const mappedOptions = codeList.map(this.multiselectMapper);
        mappedOptions.forEach(element => {
            if (savedValues.some(el => el.code.codeId === element.id)) {
                element.value = true;
            }
        });
        return mappedOptions;
    }

    private multiselectMapper = (item: any) => {
        const element = item;

        return {
            id: element.codeId,
            textDe: element.textDe,
            textIt: element.textIt,
            textFr: element.textFr,
            value: false
        };
    };
}
