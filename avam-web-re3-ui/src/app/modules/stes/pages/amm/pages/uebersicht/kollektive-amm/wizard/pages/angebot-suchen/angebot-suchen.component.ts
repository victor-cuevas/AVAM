import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { FormUtilsService, RoboHelpService } from '@app/shared';
import { StatusEnum } from '@app/shared/classes/fixed-codes';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmAngebotSuchenParamDTO } from '@app/shared/models/dtos-generated/ammAngebotSuchenParamDTO';
import { AmmAngebotSuchenQueryParams } from '@app/shared/models/dtos-generated/ammAngebotSuchenQueryParams';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { BaseResponseWrapperListVollzugsregionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListVollzugsregionDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { RegionSuchenParamDTO } from '@app/shared/models/dtos-generated/regionSuchenParamDTO';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { VollzugsregionDTO } from '@app/shared/models/dtos-generated/vollzugsregionDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { AmmAngebotMassnahmenListeDTO } from '@dtos/ammAngebotMassnahmenListeDTO';
import { BaseResponseWrapperListAmmAngebotMassnahmenListeDTOWarningMessages } from '@dtos/baseResponseWrapperListAmmAngebotMassnahmenListeDTOWarningMessages';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { AngebotsdatenSichtenComponent } from '../../components/angebotsdaten-sichten/angebotsdaten-sichten.component';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-angebot-suchen',
    templateUrl: './angebot-suchen.component.html',
    styleUrls: ['./angebot-suchen.component.scss']
})
export class AngebotSuchenComponent implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    spinnerChannel = 'angebot-suchen-channel';
    toolboxChannel = 'angebot-suchen-toolbox';
    permissions: typeof Permissions = Permissions;

    dataSource;
    angebotSuchenForm: FormGroup;
    massnahmentypOptions = [];
    vollzugsregionOptions = [];
    vollzugsregione = [];
    userVollzugsregion: VollzugsregionDTO;
    stesHeader: StesHeaderDTO;
    langChangeSubscription: Subscription;
    toolboxSubscription: Subscription;
    disableInputs = false;
    durchfuehrungsregionParams: RegionSuchenParamDTO = {
        gueltigkeit: StatusEnum.ALL
    };
    get stesId() {
        return this.wizardService.getStesId();
    }

    constructor(
        private wizardService: MassnahmeBuchenWizardService,
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private roboHelpService: RoboHelpService,
        private stesInfobarService: AvamStesInfoBarService,
        private dataService: StesDataRestService,
        private translate: TranslateService,
        private resetDialogService: ResetDialogService,
        private ammRestService: AmmRestService,
        private fehlermeldungenService: FehlermeldungenService,
        private dbTranslate: DbTranslateService,
        private authenticationService: AuthenticationService,
        private datePipe: DatePipe,
        private router: Router,
        private ammHelper: AmmHelper,
        private facade: FacadeService,
        private searchSession: SearchSessionStorageService
    ) {
        ToolboxService.CHANNEL = this.toolboxChannel;
        SpinnerService.CHANNEL = this.spinnerChannel;
    }

    ngOnInit() {
        this.checkNavigationState();
        this.wizardService.setOnNextStep(null);
        this.angebotSuchenForm = this.createFormGroup();
        this.stesInfobarService.sendDataToInfobar({ title: this.setUeberschrift() });
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();
        this.getData();
        this.langChangeSubscription = this.subscribeToLangChange();
    }

    checkNavigationState() {
        const state = window.history.state;

        if (state && state.clearSearchState) {
            this.searchSession.clearStorageByKey(this.spinnerChannel);
        }
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group(
            {
                titel: '',
                ergaenzendeAngaben: '',
                massnahmentyp: null,
                durchfuehrungsNr: [null, [NumberValidator.isPositiveInteger]],
                arbeitgeber: null,
                postleitzahl: null,
                region: null,
                regionView: '',
                von: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                bis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                beurteilungskriterium: null,
                beurteilungskriteriumId: null,
                beschaeftigungseinheitNr: [null, [NumberValidator.isPositiveInteger]],
                massnahmenNr: [null, [NumberValidator.isPositiveInteger]],
                ort: null,
                land: null,
                vollzugsregion: ['']
            },
            {
                validators: [DateValidator.rangeBetweenDates('von', 'bis', 'val201', true, true)]
            }
        );
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.toolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.MASSNAHME_ANGEBOT_SUCHEN_DETAILSUCHE);
            }
        });
    }

    setUeberschrift(): string {
        return `${this.translate.instant('amm.massnahmen.label.massnahmeBuchen')} - ${this.translate.instant('amm.massnahmen.subnavmenuitem.angebotWaehlen')}`;
    }

    subscribeToLangChange(): Subscription {
        return this.translate.onLangChange.subscribe(() => {
            if (this.dataSource.length > 0) {
                this.search();
                return;
            }

            this.stesInfobarService.sendDataToInfobar({ title: this.setUeberschrift() });
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.toolboxChannel, undefined, false);
    }

    getData() {
        this.wizardService.activateSpinnerAndDisableWizard(this.spinnerChannel);
        const user = this.authenticationService.getLoggedUser();

        forkJoin<
            StesHeaderDTO,
            BaseResponseWrapperListCodeDTOWarningMessages,
            BaseResponseWrapperListVollzugsregionDTOWarningMessages,
            BaseResponseWrapperListVollzugsregionDTOWarningMessages
        >([
            this.dataService.getStesHeader(this.wizardService.getStesId().toString(), this.translate.currentLang),
            this.ammRestService.getMassnahmenartenOptions(),
            this.dataService.getVollzugsregion({ vollzugsregionTypeCode: DomainEnum.AMM }),
            this.dataService.getVollzugsregion({
                benutzerstelleDTO: !!user
                    ? {
                          code: user.benutzerstelleCode,
                          benutzerstelleId: user.benutzerstelleId
                      }
                    : undefined,
                vollzugsregionTypeCode: DomainEnum.AMM
            })
        ]).subscribe(
            ([stesHeader, massnahmenartenOptions, vollzugsregionOptions, userVollzugsregion]) => {
                this.stesHeader = stesHeader;
                this.userVollzugsregion = userVollzugsregion.data[0];
                this.massnahmentypOptions = this.facade.formUtilsService.mapDropdownKurztext(massnahmenartenOptions.data);
                this.vollzugsregione = vollzugsregionOptions.data;
                this.vollzugsregionOptions = vollzugsregionOptions.data.map(option => this.multiselectMapper(option));

                const state = this.searchSession.restoreStateByKey(this.spinnerChannel);
                if (state) {
                    this.angebotSuchenForm.reset(this.mapToForm(state.fields));
                    if (state.fields.vollzugsregion) {
                        this.vollzugsregionOptions.forEach(option => {
                            option.value = state.fields.vollzugsregion.some(selected => selected.id === option.id && selected.value === true);
                        });
                    }
                    this.angebotSuchenForm.markAsDirty();
                    this.search();
                }

                this.wizardService.deactivateSpinnerAndEnableWizard(this.spinnerChannel);
            },
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.spinnerChannel);
            }
        );
    }

    mapToForm(state) {
        return {
            ...state,
            bis: state.bis ? moment(state.bis).toDate() : null,
            von: state.von ? moment(state.von).toDate() : null,
            land: state.landObject ? state.landObject : null,
            postleitzahl: state.plzObject ? state.plzObject : null,
            arbeitgeber: state.arbeitgeberObject ? state.arbeitgeberObject : null
        };
    }

    search() {
        if (this.angebotSuchenForm.invalid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            return;
        }

        this.fehlermeldungenService.closeMessage();
        this.wizardService.activateSpinnerAndDisableWizard(this.spinnerChannel);
        this.ammRestService.getAngeboten(this.mapSearchParams(this.angebotSuchenForm)).subscribe(
            (resp: BaseResponseWrapperListAmmAngebotMassnahmenListeDTOWarningMessages) => {
                this.searchSession.storeFieldsByKey(this.spinnerChannel, {
                    ...this.angebotSuchenForm.value,
                    vollzugsregion: this.angebotSuchenForm.controls.vollzugsregion.value,
                    landObject: this.angebotSuchenForm.controls.land['landAutosuggestObject'].nameDe ? this.angebotSuchenForm.controls.land['landAutosuggestObject'] : undefined,
                    plzObject: this.angebotSuchenForm['plzWohnAdresseObject'].ort ? this.angebotSuchenForm['plzWohnAdresseObject'] : undefined,
                    arbeitgeberObject: this.angebotSuchenForm.controls.arbeitgeber['unternehmenAutosuggestObject'].name1
                        ? this.angebotSuchenForm.controls.arbeitgeber['unternehmenAutosuggestObject']
                        : undefined
                });
                this.dataSource = this.sortByVollzugsregion(resp.data ? resp.data : []).map((element: AmmAngebotMassnahmenListeDTO) => this.createRow(element));
                this.stesInfobarService.sendDataToInfobar({ title: this.setUeberschrift(), tableCount: this.dataSource.length });

                this.wizardService.deactivateSpinnerAndEnableWizard(this.spinnerChannel);
            },
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.spinnerChannel);
            }
        );
    }

    mapSearchParams(form: FormGroup): AmmAngebotSuchenQueryParams {
        return {
            suchenParam: this.mapFilters(form),
            selectedIds: this.mapVollzugsregionen(form)
        };
    }

    mapFilters(form: FormGroup): AmmAngebotSuchenParamDTO {
        if (form.value.massnahmenNr) {
            return {
                massnahmenNr: form.value.massnahmenNr ? form.value.massnahmenNr : '',
                durchfuehrungsNummer: '',
                beschaeftigungseinheitNr: ''
            };
        }

        if (form.value.durchfuehrungsNr) {
            return {
                durchfuehrungsNummer: form.value.durchfuehrungsNr ? form.value.durchfuehrungsNr : '',
                massnahmenNr: '',
                beschaeftigungseinheitNr: ''
            };
        }

        if (form.value.beschaeftigungseinheitNr) {
            return {
                beschaeftigungseinheitNr: form.value.beschaeftigungseinheitNr ? form.value.beschaeftigungseinheitNr : '',
                durchfuehrungsNummer: '',
                massnahmenNr: ''
            };
        }

        return this.getAllFilters(form);
    }

    getAllFilters(form: FormGroup): AmmAngebotSuchenParamDTO {
        return {
            titel: form.value.titel,
            bemerkung: form.value.ergaenzendeAngaben,
            massnahmeCode: form.value.massnahmentyp,
            durchfuehrungsNummer: '',
            anbieterId: form.controls.arbeitgeber['unternehmenAutosuggestObject'].unternehmenId > 0 ? form.controls.arbeitgeber['unternehmenAutosuggestObject'].unternehmenId : 0,
            anbieterName: form.controls.arbeitgeber['unternehmenAutosuggestObject'].name1 ? form.controls.arbeitgeber['unternehmenAutosuggestObject'].name1 : '',
            plzId: form['plzWohnAdresseObject'] && form['plzWohnAdresseObject'].plzId > 0 ? form['plzWohnAdresseObject'].plzId : 0,
            region: form.value.region,
            beginnVon: this.facade.formUtilsService.parseDate(form.value.von),
            beginnBis: this.facade.formUtilsService.parseDate(form.value.bis),
            problemfeldId: form.value.beurteilungskriteriumId ? form.value.beurteilungskriteriumId : 0,
            vollzugsregionId: 0,
            beschaeftigungseinheitNr: '',
            massnahmenNr: '',
            landId: this.getLandId(form.controls.land),
            strukturelementId: 0,
            elementkategorieId: 0,
            strukturelementMassnahmen: null,
            infotagStrukturelementId: 0,
            suchregionIdList: null,
            grossregionIdList: null,
            individuell: null
        };
    }

    getLandId(landControl: AbstractControl): number {
        return landControl['landAutosuggestObject'] && landControl['landAutosuggestObject'].staatId && landControl['landAutosuggestObject'].staatId > 0
            ? landControl['landAutosuggestObject'].staatId
            : 0;
    }

    mapVollzugsregionen(form: FormGroup): number[] {
        let selected = [];
        if (form && form.value && form.value.vollzugsregion) {
            selected = [...form.value.vollzugsregion].filter(element => element.value).map(element => element.id);
        }

        return selected.length > 0 ? selected : this.vollzugsregionOptions.map(element => element.id);
    }

    sortByVollzugsregion(arr: AmmAngebotMassnahmenListeDTO[]): AmmAngebotMassnahmenListeDTO[] {
        const fromUserRegion = [];
        const fromOtherRegion = [];
        arr.forEach((element: AmmAngebotMassnahmenListeDTO) => {
            if (element.regionDe && this.userVollzugsregion) {
                (element.regionDe.toLocaleLowerCase() === this.userVollzugsregion.nameDe.toLocaleLowerCase() ? fromUserRegion : fromOtherRegion).push(element);
            } else {
                fromOtherRegion.push(element);
            }
        });
        return fromUserRegion.sort(this.sortByTitel).concat(fromOtherRegion.sort(this.sortByTitel));
    }

    sortByTitel = (a: AmmAngebotMassnahmenListeDTO, b: AmmAngebotMassnahmenListeDTO): number => {
        return this.dbTranslate.translateWithOrder(a, 'titel').toLocaleLowerCase() < this.dbTranslate.translateWithOrder(b, 'titel').toLocaleLowerCase()
            ? -1
            : this.dbTranslate.translateWithOrder(a, 'titel').toLocaleLowerCase() > this.dbTranslate.translateWithOrder(b, 'titel').toLocaleLowerCase()
            ? 1
            : 0;
    };

    createRow(element: AmmAngebotMassnahmenListeDTO) {
        const { datum, datumView } = this.mapDateCol(element);
        return {
            titel: this.dbTranslate.translateWithOrder(element, 'titel'),
            arbeitgeber: element.anbieter,
            durchfuerungsort: element.ortDe ? this.dbTranslate.translate(element, 'ort') : element.auslOrt,
            vollzugsregion: element.regionDe ? this.dbTranslate.translate(element, 'region') : '',
            datum,
            datumView,
            lektionen: element.lektionen,
            plaetze: this.setPlacesCol(element),
            massnahmenId: element.massnahmenId,
            massnahmeCode: element.massnahmeCode
        };
    }

    mapDateCol(element: AmmAngebotMassnahmenListeDTO): { datum: Date; datumView: string } {
        const isKurs = this.isKurs(element);
        const today = new Date();
        const from = moment(element.datumVon);
        const to = moment(element.datumBis);
        const infinite = new Date(9999, 11, 31);

        if (!isKurs) {
            if (from.isBefore(today, 'day')) {
                if (to.isSame(infinite, 'day')) {
                    return { datum: this.facade.formUtilsService.parseDate(infinite), datumView: this.translate.instant('common.label.immer') };
                }
                return {
                    datum: this.facade.formUtilsService.parseDate(element.datumBis),
                    datumView: `${this.translate.instant('common.label.bis')} ${this.datePipe.transform(this.facade.formUtilsService.parseDate(element.datumBis), 'dd.MM.yyyy')}`
                };
            } else if (to.isSame(infinite, 'day')) {
                return {
                    datum: this.facade.formUtilsService.parseDate(element.datumVon),
                    datumView: `${this.translate.instant('common.label.ab')} ${this.datePipe.transform(this.facade.formUtilsService.parseDate(element.datumVon), 'dd.MM.yyyy')}`
                };
            }
        }
        return {
            datum: this.facade.formUtilsService.parseDate(element.datumVon),
            datumView: `${this.datePipe.transform(this.facade.formUtilsService.parseDate(element.datumVon), 'dd.MM.yyyy')} - ${this.datePipe.transform(
                this.facade.formUtilsService.parseDate(element.datumBis),
                'dd.MM.yyyy'
            )}`
        };
    }

    isKurs(element) {
        return element.massnahmeCode === AmmMassnahmenCode.KURS || element.massnahmeCode === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT;
    }

    setPlacesCol(element: AmmAngebotMassnahmenListeDTO): string {
        if (element.massnahmeCode === AmmMassnahmenCode.KURS) {
            return `${element.plaetzeBelegt}/${element.plaetzeUeberbucht}/${element.plaetzeWarteliste}`;
        }
        if (element.massnahmeCode === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            return `-`;
        }
        return `${element.plaetzeBelegt}/${element.plaetzeUeberbucht}`;
    }

    reset() {
        if (this.angebotSuchenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.angebotSuchenForm.reset();
                this.vollzugsregionOptions = this.vollzugsregione.map(option => this.multiselectMapper(option));
                this.disableInputs = false;
            });
        }
    }

    cancel() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
    }

    onItemSelected({ massnahmenId, massnahmeCode }) {
        this.wizardService.setMassnahmeCode(massnahmeCode);
        this.wizardService.setMassnahmeId(massnahmenId);

        switch (this.wizardService.getMassnahmeCode()) {
            case AmmMassnahmenCode.KURS: {
                this.handleKurs();
                break;
            }
            case AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT: {
                this.handleKursIndivImAngebot();
                break;
            }
            case AmmMassnahmenCode.AP:
            case AmmMassnahmenCode.BP:
            case AmmMassnahmenCode.UEF:
            case AmmMassnahmenCode.PVB:
            case AmmMassnahmenCode.SEMO: {
                this.handleOtherMassnahmen();
                break;
            }
            default:
                break;
        }
    }

    handleKurs() {
        this.ammRestService
            .getAmmBuchungParam(null, this.wizardService.getMassnahmeCode(), this.stesId, this.wizardService.getMassnahmeId())
            .subscribe((resp: BaseResponseWrapperAmmBuchungParamDTOWarningMessages) => {
                if (resp.data) {
                    const gfId = this.ammHelper.getAmmBuchung(resp.data).ammGeschaeftsfallId;
                    const entscheidId = this.ammHelper.getEntscheidId(resp.data.ammBuchungSession.ammGeschaeftsfallObject);

                    if (gfId > 0) {
                        this.router.navigate([`stes/details/${this.stesId}/amm/uebersicht/${this.wizardService.getMassnahmeCode()}/buchung-kollektiv`], {
                            queryParams: { gfId, entscheidId }
                        });
                    } else {
                        this.wizardService.setStep2Url(AMMPaths.KOLLEKTIV_KURS_ERFASSEN);
                        this.wizardService.moveNext();
                    }
                }
            });
    }

    handleKursIndivImAngebot() {
        this.ammRestService
            .getAmmBuchungParam(null, this.wizardService.getMassnahmeCode(), this.stesId, this.wizardService.getMassnahmeId())
            .subscribe((resp: BaseResponseWrapperAmmBuchungParamDTOWarningMessages) => {
                if (resp.data) {
                    const gfId = this.ammHelper.getAmmBuchung(resp.data).ammGeschaeftsfallId;
                    if (gfId > 0) {
                        this.router.navigate([`stes/details/${this.stesId}/amm/uebersicht/${this.wizardService.getMassnahmeCode()}/buchung-kurs-indiv-im-angebot`], {
                            queryParams: { gfId }
                        });
                    } else {
                        this.wizardService.setStep2Url(AMMPaths.KURS_INDIV_IM_ANGEBOT_ERFASSEN);
                        this.wizardService.showStepsThreeAndFour(true);
                        this.wizardService.moveNext();
                    }
                }
            });
    }

    handleOtherMassnahmen() {
        this.wizardService.setStep2Url(AMMPaths.PSAK_ERFASSEN);
        this.wizardService.moveNext();
    }

    onItemOpened({ massnahmenId, massnahmeCode }) {
        this.fehlermeldungenService.closeMessage();
        const modalRef = this.modalService.open(AngebotsdatenSichtenComponent, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' });
        modalRef.componentInstance.stesId = this.stesId;
        modalRef.componentInstance.massnahmenCode = massnahmeCode;
        modalRef.componentInstance.massnahmenId = massnahmenId;
    }

    durchfuehrungsregionSelected(region) {
        this.angebotSuchenForm.controls.regionView.setValue(this.dbTranslate.translate(region.data, 'region'));
        this.angebotSuchenForm.controls.region.setValue(region.data);
        this.angebotSuchenForm.markAsDirty();
    }

    beurteilungskriteriumSelected(kriterium) {
        this.angebotSuchenForm.controls.beurteilungskriterium.setValue(this.dbTranslate.translate(kriterium, 'text'));
        this.angebotSuchenForm.controls.beurteilungskriteriumId.setValue(kriterium.codeId);
        this.angebotSuchenForm.markAsDirty();
    }

    openModal(content) {
        this.modalService.open(content, { ariaLabelledBy: 'regionen-basic-title', windowClass: 'modal-md', backdrop: 'static' });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    multiselectMapper = (element: VollzugsregionDTO) => {
        return {
            id: element.vollzugsregionId,
            textDe: element.nameDe,
            textIt: element.nameIt,
            textFr: element.nameFr,
            value: this.userVollzugsregion ? element.vollzugsregionId === this.userVollzugsregion.vollzugsregionId : false,
            fullData: element
        };
    };

    onKeypressInput(event) {
        if (event.key === 'Tab' || event.key === 'Enter') {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
    }

    onChangeRegionInput(event) {
        if (event.target.value === '') {
            this.angebotSuchenForm.controls.region.setValue(null);
        }
    }

    onChangeKriteriumInput(event) {
        if (event.target.value === '') {
            this.angebotSuchenForm.controls.beurteilungskriteriumId.setValue(null);
        }
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const shouldDisableInputs = event.target ? event.target.value : event;
        this.disableInputs = shouldDisableInputs ? true : false;
    }

    ngOnDestroy() {
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }
        this.fehlermeldungenService.closeMessage();

        this.toolboxService.sendConfiguration([]);
    }
}
