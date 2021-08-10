import { KurskostenZahlungCode } from '@app/shared/enums/domain-code/kurskosten-zahlung-code.enum';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AmmKostenKursDTO } from '@app/shared/models/dtos-generated/ammKostenKursDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { BaseResponseWrapperAmmKostenKursDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmKostenKursDTOWarningMessages';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin, Subject, iif } from 'rxjs';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { FormGroup, FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { SpinnerService } from 'oblique-reactive';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';

@Component({
    selector: 'avam-individuelle-kosten',
    templateUrl: './individuelle-kosten.component.html',
    providers: [ObliqueHelperService]
})
export class IndividuelleKostenComponent extends AmmCloseableAbstract implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    kostenData: AmmKostenKursDTO;
    ammMassnahmenType: string;
    geschaeftsfallId: number;
    entscheidId: number;
    kostenId: number;
    basisNr: number;
    entscheidNr: number;

    kostenForm: FormGroup;
    showPruefungsinstitution = false;
    readOnly = false;

    buttons: Subject<any[]> = new Subject();
    ammButtonTypesEnum = AmmButtonsTypeEnum;

    channel = 'individuelle-kosten-channel';
    allowedTypes: string[] = [AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT, AmmMassnahmenCode.INDIVIDUELL_KURS];
    kostenOptions: any[] = [];
    kostenOptionsNoPruefungsinstitution: any[] = [];

    langChangeSubscription: Subscription;
    observeClickActionSub: Subscription;
    buchungData: AmmBuchungParamDTO;

    constructor(
        private route: ActivatedRoute,
        protected router: Router,
        private formBuilder: FormBuilder,
        private obliqueHelper: ObliqueHelperService,
        private ammDataService: AmmRestService,
        private dataRestService: StesDataRestService,
        private stesInfobarService: AvamStesInfoBarService,
        private modalService: NgbModal,
        protected facade: FacadeService,
        private ammHelper: AmmHelper,
        protected interactionService: StesComponentInteractionService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.obliqueHelper.ngForm = this.ngForm;

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];

            this.route.queryParamMap.subscribe(param => {
                this.geschaeftsfallId = +param.get('gfId');
                this.entscheidId = param.get('entscheidId') ? +param.get('entscheidId') : null;
            });

            this.route.paramMap.subscribe(param => {
                this.ammMassnahmenType = param.get('type');
                this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];

                if (!this.allowedTypes.includes(this.ammMassnahmenType)) {
                    this.router.navigate(['/not-found']);
                }
            });
        });

        this.setSideNavigation();

        this.kostenForm = this.createFormGroup();

        this.getData();

        this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            if (this.buchungData) {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
            } else {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle() });
            }
        });
        super.ngOnInit();
    }

    isOurLabel(message) {
        return (
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_AP) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_KURS_IN_ANGEBOT) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.INDIVIDUELL_BP)
        );
    }

    isOurUrl(): boolean {
        return (
            this.router.url.includes(AMMPaths.INDIVIDUELL_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KURS_INDIV_IM_ANGEBOT_BUCHUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.INDIVIDUELL_KOSTEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType)) ||
            this.router.url.includes(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType))
        );
    }

    canDeactivate(): boolean {
        return this.kostenForm.dirty;
    }

    ngOnDestroy(): void {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        this.facade.fehlermeldungenService.closeMessage();
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);
        this.stesInfobarService.sendLastUpdate({}, true);
        this.facade.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    createFormGroup() {
        return this.formBuilder.group({
            kurskosten: [null, [NumberValidator.checkValueBetween0and99999, Validators.required]],
            material: [null, NumberValidator.checkValueBetween0and99999],
            pruefungsgebuehren: [null, NumberValidator.checkValueBetween0and99999],
            kurskostenAn: [null, Validators.required],
            materialAn: null,
            pruefungsgebuehrenAn: null,
            pruefungsinstitution: null
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin<BaseResponseWrapperAmmKostenKursDTOWarningMessages, CodeDTO[], BaseResponseWrapperAmmBuchungParamDTOWarningMessages>([
            this.ammDataService.getKostenIndividuell(this.entscheidId),
            this.dataRestService.getCode(DomainEnum.KURSKOSTEN_ZAHLUNG),
            this.ammDataService.getAmmBuchungParam(this.geschaeftsfallId, this.ammMassnahmenType, this.stesId)
        ]).subscribe(
            ([kostenResponse, kurskostenZahlungOptions, buchungResponse]) => {
                this.buttons.next(null);
                this.kostenOptions = this.facade.formUtilsService.mapDropdownKurztext(kurskostenZahlungOptions);
                this.kostenOptionsNoPruefungsinstitution = this.kostenOptions.filter(option => option.code !== KurskostenZahlungCode.PRUEFUNGSINSTITUTION);

                if (kostenResponse.data) {
                    this.kostenData = kostenResponse.data;
                    this.kostenId = this.kostenData.ammKostenId;

                    if (this.kostenId) {
                        this.stesInfobarService.sendLastUpdate(this.kostenData);
                    }

                    this.ammDataService.getButtonsKostenIndividuell(this.entscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });

                    this.kostenForm.reset(this.mapToForm(this.kostenData));
                    this.ammHelper.setAdditionalAmmKostenErrors(this.kostenData);
                }

                if (buchungResponse.data) {
                    this.buchungData = buchungResponse.data;
                    const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);
                    this.basisNr = buchungObject.ammGeschaeftsfallObject.basisNr;
                    this.entscheidNr = this.getEntscheidNr(buchungObject);

                    this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                    this.stesInfobarService.addItemToInfoPanel(this.infobartemp);

                    this.setReadOnlyFields();
                }

                this.configureToolbox();
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    mapToForm(kostenData: AmmKostenKursDTO) {
        const kostenFormData = {
            kurskosten: kostenData.kurskosten,
            material: kostenData.materialkosten,
            pruefungsgebuehren: kostenData.pruefungskosten,
            kurskostenAn: kostenData.kurskostenAnId ? kostenData.kurskostenAnId : null,
            materialAn: kostenData.materialkostenAnId ? kostenData.materialkostenAnId : null,
            pruefungsgebuehrenAn: kostenData.pruefungskostenAnId ? kostenData.pruefungskostenAnId : null,
            pruefungsinstitution: this.setPruefungsinstitution(kostenData)
        };

        return kostenFormData;
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        if (this.kostenId) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId));

        if (!this.observeClickActionSub) {
            this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.kostenId, AvamCommonValueObjectsEnum.T_AMM_KOSTEN_KURS);
                }
            });
        }
    }

    openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }

    /**
     * Trigger onSave.
     *
     * @memberof IndividuelleKostenComponent
     */
    onSave() {
        if (this.checkFormValid()) {
            this.facade.spinnerService.activate(this.channel);

            const kostenToSave = this.mapToDTO();
            const update = this.ammDataService.updateKostenIndividuell(kostenToSave);
            const create = this.ammDataService.createKostenIndividuell(kostenToSave);

            iif(() => (this.kostenData.ammKostenId ? true : false), update, create).subscribe(
                response => {
                    this.buttons.next(null);

                    this.ammDataService.getButtonsKostenIndividuell(this.entscheidId).subscribe(btnResponse => {
                        this.buttons.next(btnResponse.data);
                    });

                    if (response.data) {
                        this.kostenData = response.data;
                        this.kostenId = this.kostenData.ammKostenId;
                        this.kostenForm.reset(this.mapToForm(this.kostenData));
                        this.stesInfobarService.sendLastUpdate(this.kostenData);
                        this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                        this.ammHelper.setAdditionalAmmKostenErrors(this.kostenData);
                    } else {
                        this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                    }

                    this.configureToolbox();
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                    this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                }
            );
        }
    }

    onBerechnen() {
        if (this.checkFormValid()) {
            this.facade.fehlermeldungenService.closeMessage();
            this.facade.spinnerService.activate(this.channel);

            this.ammDataService.berechnenKostenIndividuell(this.mapToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.kostenData = response.data;
                        this.kostenForm.patchValue(this.mapToForm(this.kostenData));
                        this.ammHelper.setAdditionalAmmKostenErrors(this.kostenData);
                    }

                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                }
            );
        }
    }

    onLamWerteUebernehmen() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        this.ammDataService.uebernehmenKostenIndividuell(this.entscheidId).subscribe(
            response => {
                if (response.data) {
                    this.kostenData = response.data;
                    this.kostenForm.patchValue(this.mapToForm(this.kostenData));
                    this.kostenForm.markAsDirty();

                    this.toggleRequired(this.kostenForm.controls.material.value, 'materialAn');
                    this.toggleRequired(this.kostenForm.controls.pruefungsgebuehren.value, 'pruefungsgebuehrenAn');
                }

                this.deactivateSpinnerAndScrollTop();
                this.facade.fehlermeldungenService.showMessage('amm.nutzung.message.lamwerteuebernommen', 'info');
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    onReset() {
        if (this.kostenForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.getData();
            });
        }
    }

    togglePruefungsinstitutionVisibility(selectedOptionCodeId: number) {
        let optionCode: string;

        if (selectedOptionCodeId) {
            optionCode = this.facade.formUtilsService.getCodeByCodeId(this.kostenOptions, selectedOptionCodeId.toString());
        }

        this.showPruefungsinstitution = optionCode === KurskostenZahlungCode.PRUEFUNGSINSTITUTION;

        if (!this.showPruefungsinstitution) {
            this.kostenForm.controls.pruefungsinstitution.reset();
        }

        this.toggleRequired(this.showPruefungsinstitution, 'pruefungsinstitution');
    }

    toggleRequired(value: number | boolean, controlName: string) {
        if (value) {
            this.kostenForm.controls[controlName].setValidators(Validators.required);
        } else {
            this.kostenForm.controls[controlName].clearValidators();
        }
        this.updateValueAndValidity(controlName);
    }

    /**
     * Check for invalid fields.
     *
     * @memberof IndividuelleKostenComponent
     */
    checkFormValid() {
        this.facade.fehlermeldungenService.closeMessage();
        const isValid = this.kostenForm.valid;

        if (!isValid) {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }

        return isValid;
    }

    mapToDTO() {
        const kostenDataToSave = { ...this.kostenData };

        kostenDataToSave.kurskosten = this.kostenForm.controls.kurskosten.value;
        kostenDataToSave.kurskostenAnId = this.kostenForm.controls.kurskostenAn.value;
        kostenDataToSave.kurskostenAnObject = this.kostenOptions.find(option => option.codeId === +this.kostenForm.controls.kurskostenAn.value) as CodeDTO;
        kostenDataToSave.materialkosten = this.kostenForm.controls.material.value;
        kostenDataToSave.materialkostenAnId = this.kostenForm.controls.materialAn.value;
        kostenDataToSave.materialkostenAnObject = this.kostenOptions.find(option => option.codeId === +this.kostenForm.controls.materialAn.value) as CodeDTO;
        kostenDataToSave.pruefungskosten = this.kostenForm.controls.pruefungsgebuehren.value;
        kostenDataToSave.pruefungskostenAnId = this.kostenForm.controls.pruefungsgebuehrenAn.value;
        kostenDataToSave.pruefungskostenAnObject = this.kostenOptions.find(option => option.codeId === +this.kostenForm.controls.pruefungsgebuehrenAn.value) as CodeDTO;

        kostenDataToSave.pruefungsinstitutionObject = {
            unternehmenId: this.kostenForm.controls.pruefungsinstitution['unternehmenAutosuggestObject'].unternehmenId,
            name1: this.kostenForm.controls.pruefungsinstitution['unternehmenAutosuggestObject'].name1
        };

        return kostenDataToSave;
    }

    private deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private setReadOnlyFields() {
        const oldestStatusCode = this.getOldestEntscheidStatusCode();
        this.readOnly =
            oldestStatusCode === AmmVierAugenStatusCode.FREIGABEBEREIT ||
            oldestStatusCode === AmmVierAugenStatusCode.FREIGEGEBEN ||
            oldestStatusCode === AmmVierAugenStatusCode.ERSETZT;
    }

    private getOldestEntscheidStatusCode(): string {
        let statusCode = null;
        const buchungObject = this.ammHelper.getAmmBuchung(this.buchungData);
        const allAmmEntscheidArray = buchungObject.ammGeschaeftsfallObject.allAmmEntscheid;
        const allAmmEntscheidArrayLastIndex = allAmmEntscheidArray.length - 1;

        if (
            buchungObject &&
            buchungObject.ammGeschaeftsfallObject &&
            allAmmEntscheidArray &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex] &&
            allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject
        ) {
            statusCode = allAmmEntscheidArray[allAmmEntscheidArrayLastIndex].statusObject.code;
        }

        return statusCode;
    }

    private updateValueAndValidity(controlName: string) {
        this.kostenForm.controls[controlName].updateValueAndValidity();
    }

    private getEntscheidNr(buchungObject): number {
        let entscheidNr: number;

        if (buchungObject && buchungObject.ammGeschaeftsfallObject && buchungObject.ammGeschaeftsfallObject.allAmmEntscheid) {
            buchungObject.ammGeschaeftsfallObject.allAmmEntscheid.forEach(entscheid => {
                if (entscheid.ammEntscheidId === this.entscheidId) {
                    entscheidNr = entscheid.entscheidNr;
                }
            });
        }

        return entscheidNr;
    }

    private setSideNavigation() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        if (this.ammMassnahmenType === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
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
        } else {
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
        }

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

    private configureInfobarTitle(title?) {
        const massnahmenLabel = this.facade.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const kostenTranslatedLabel = this.facade.translateService.instant('amm.nutzung.label.kosten');

        return `${massnahmenLabel} ${title} - ${kostenTranslatedLabel}`;
    }

    private setPruefungsinstitution(kostenData: AmmKostenKursDTO) {
        return kostenData.pruefungsinstitutionObject ? (kostenData.pruefungsinstitutionObject.unternehmenId !== 0 ? kostenData.pruefungsinstitutionObject : null) : null;
    }
}
