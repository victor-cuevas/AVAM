import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { MatchingprofilCodeEnum } from '@app/shared/enums/domain-code/matchingprofil-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesMatchingprofilPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { MeldepflichtEnum, SuitableEnum } from '@app/shared/enums/table-icon-enums';

import { StringHelper } from '@app/shared/helpers/string.helper';
import { BaseResponseWrapperListStesMatchingprofilDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesMatchingprofilDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { MatchingOsteDetailDTO } from '@dtos/matchingOsteDetailDTO';
import { MatchingTrefferStesSuchParamDTO } from '@dtos/matchingTrefferStesSuchParamDTO';
import { StesMatchingprofilDTO } from '@app/shared/models/dtos-generated/stesMatchingprofilDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';

const stesMatchingChannel = 'matchingChannel';

@Component({
    selector: 'avam-stes-matchingprofil',
    templateUrl: './stes-matchingprofil.component.html',
    styleUrls: ['./stes-matchingprofil.component.scss']
})
export class StesMatchingprofilComponent implements OnInit, OnDestroy, AfterViewInit {
    static readonly STATE_KEY = 'stes-matchingprofil-cache-state-key';

    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    zeitraumOptions = [];
    statusOptions = [];
    zustandichkeitFilteredOptions = [{}];
    vollzugsregOste = [{}];
    multiselectOptions = [];
    berufe = [];

    matchingProfilForm: FormGroup;

    stesId: string;
    langChangeSubscription: Subscription;

    statusAktiv = MatchingprofilCodeEnum.STATUSAKTIV;
    statusInaktiv = MatchingprofilCodeEnum.STATUSINAKTIV;

    matchingChannel = stesMatchingChannel;

    currentStatus: string;
    dropdownDisabled: boolean;
    checkboxesDisabled: boolean;
    matchingprofilListeDisabled: boolean;

    hideButtonSelector: any;
    matchingTrefferData: Array<StesMatchingprofilDTO>;

    lastSelectedRowOsteId: number;

    updateMatchingprofilData: BaseResponseWrapperListStesMatchingprofilDTOWarningMessages;

    matchingProfilToolbox = 'matchingProfil';
    toolboxActionSub: Subscription;

    dataSource;

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private dbTranslateService: DbTranslateService,
        private dataService: StesDataRestService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private translateService: TranslateService,
        private spinnerService: SpinnerService,
        private changeDetector: ChangeDetectorRef,
        private translate: TranslateService,
        private router: Router,
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private stesInfobarService: AvamStesInfoBarService,
        private notificationService: NotificationService,
        private datePipe: DatePipe,
        private searchSession: SearchSessionStorageService,
        private interactionService: StesComponentInteractionService
    ) {
        SpinnerService.CHANNEL = this.matchingChannel;
        ToolboxService.CHANNEL = this.matchingProfilToolbox;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.initForm();
        this.loadProperties();
        this.configureToolbox();
        this.toolboxActionSub = this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.getData();
        this.saveOnChanges();
        this.hideButtonSelector = document.querySelector('.column-toggle-left');
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesMatching' });
        this.stesInfobarService.toggle(false);
        this.toggleErrorPanel(false);
    }

    ngAfterViewInit(): void {
        this.hideButtonSelector.click();
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.matchingProfilToolbox).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.matchingProfilToolbox, ToolboxDataHelper.createStesData(null, null, this.stesId));
    }

    initForm() {
        this.matchingProfilForm = this.formBuilder.group({
            matchingprofil: this.formBuilder.group({
                status: null,
                arbeitsort: false,
                beschaeftigungsgrad: false,
                sprachkenntnisse: false,
                geschlecht: false,
                alter: false,
                besondereArbeitsformen: false,
                fuehrerausweiskategorie: false,
                privatesFahrzeug: false,
                arbeitsortInput: null,
                beschaeftigungsgradInput: null,
                sprachkenntnisseInput: null,
                geschlechtInput: null,
                alterInput: null,
                besondereArbeitsformenInput: null,
                fuehrerausweiskategorieInput: null,
                privatesFahrzeugInput: null,
                berufeOptions: this.formBuilder.array([])
            }),

            filters: this.formBuilder.group({
                zustaendichkeitsBereich: [null],
                zeitraum: null,
                stellenbeschreibung: null,
                beschaeftigungsgradVon: 0,
                beschaeftigungsgradBis: 100
            })
        });
    }

    createBerufOptionGroup(): FormGroup {
        return this.formBuilder.group({
            berufName: true,
            aehnlicheBerufe: false,
            qualifikation: false,
            erfahrung: false,
            ausbildungsniveau: false
        });
    }

    getFormArray(): FormArray {
        return this.getMatchingprofilFormGroup().get('berufeOptions') as FormArray;
    }

    getMatchingprofilFormGroup(): FormGroup {
        return this.matchingProfilForm.get('matchingprofil') as FormGroup;
    }

    getFiltersFormGroup(): FormGroup {
        return this.matchingProfilForm.get('filters') as FormGroup;
    }

    mapZustaendigkeit = element => {
        return {
            id: element.codeId,
            textDe: element.textDe,
            textIt: element.textIt,
            textFr: element.textFr,
            value: false,
            fullData: element
        };
    };

    mapVollzugsregion = element => {
        return {
            id: element.vollzugsregionId,
            textDe: element.nameDe,
            textIt: element.nameIt,
            textFr: element.nameFr,
            value: false,
            fullData: element
        };
    };

    createRow(data) {
        return {
            nichtGeeignetTooltip: this.getMarkierungTooltip(data),
            osteId: data.osteId,
            nichtGeeignet: data.vermittlungNichtGeeignet ? SuitableEnum.NICHT_GEEIGNET : SuitableEnum.GEEIGNET,
            stesMatchingProfilId: data.stesMatchingProfilId,
            meldepflicht: this.getMeldepflichtStatus(data),
            taetigkeit: data.avamBerufDe ? `${this.dbTranslateService.translate(data, 'avamBeruf')}` : '',
            stellenbezeichnung: data.taetigkeitAnforderungen ? `${data.taetigkeitAnforderungen}` : '',
            beschaeftigungsgrad: data.pensumVon !== data.pensumBis ? `${data.pensumVon} - ${data.pensumBis}` : `${data.pensumBis}`,
            qualifikation: data.qualifikationDe ? `${this.dbTranslateService.translate(data, 'qualifikation')}` : '-',
            erfahrung: data.erfahrungDe ? `${this.dbTranslateService.translate(data, 'erfahrung')} ${this.translateService.instant('arbeitgeber.oste.label.erfahrung')}` : '',
            unternehmenName: data.unternehmen ? `${data.unternehmen}` : '',
            arbeitsort: data.arbeitsortPlzDe ? `${this.dbTranslateService.translate(data, 'arbeitsortPlz')}` : data.arbeitsortAuslOrt
        };
    }

    getMeldepflichtStatus(data: MatchingOsteDetailDTO) {
        return data.meldepflicht && !!data.sperrfristDatum
            ? data.meldepflicht && this.compareSperrfristDatum(data.sperrfristDatum)
                ? MeldepflichtEnum.UNTERLIEGT_LAUFEND
                : MeldepflichtEnum.UNTERLIEGT_ABGELAUFEN
            : MeldepflichtEnum.KEIN_MELDEPFLICHT;
    }

    compareSperrfristDatum(sperrfristDatum): boolean {
        const today = moment();
        const sperrfrist = moment(sperrfristDatum);
        return sperrfrist.isSameOrAfter(today, 'day');
    }

    getMarkierungTooltip(data: MatchingOsteDetailDTO) {
        const benutzer = data.benutzerDetail;
        if (benutzer) {
            const date = data.geaendertDatumEignung || data.erfasstDatumEignung;
            const text = this.dbTranslateService.instant('stes.matching.tooltip.vermittlungnichtgeeignet');

            return StringHelper.stringFormatter(text, [
                `${benutzer.benutzerLogin} ${benutzer.nachname}, ${benutzer.vorname} ${benutzer.benuStelleCode}`,
                `${this.datePipe.transform(date, 'dd.MM.yyyy')}`
            ]);
        }

        return '';
    }

    itemSelected(rowData) {
        ToolboxService.GESPEICHERTEN_LISTE_URL = this.router.url;
        this.router.navigate([
            `stes/${this.stesId}/${StesMatchingprofilPaths.MATCHINGPROFIL}/${rowData.stesMatchingProfilId}/${StesMatchingprofilPaths.VERMITTLUNG_ERFASSEN}/${rowData.osteId}/step1`
        ]);
    }

    vermittlungEntfernen() {
        this.spinnerService.activate(this.matchingChannel);
        this.dataService
            .removeVermittlungNichtGeeignet({
                osteIds: [this.lastSelectedRowOsteId],
                stesId: +this.stesId
            })
            .subscribe(
                () => {
                    this.updateTrefferData();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.markierungentfernt'));
                },
                () => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    openDeleteDialog(osteId) {
        const previousActiveElement: HTMLElement = document.activeElement as HTMLElement;
        const windowClass = 'vermittlung-erfassen-modal';
        const modalVermittlungRef: NgbModalRef = this.modalService.open(GenericConfirmComponent, {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static',
            windowClass
        });

        modalVermittlungRef.componentInstance.promptLabel = 'stes.matching.message.vermittlungNichtGeeignetEntfernen';
        modalVermittlungRef.componentInstance.primaryButton = 'stes.matching.button.jaEntfernen';
        modalVermittlungRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';

        modalVermittlungRef.result.then(result => {
            if (result) {
                this.vermittlungEntfernen();
            }
            setTimeout(() => {
                previousActiveElement.focus();
            });
        });

        setTimeout(() => {
            const modalElement: HTMLElement = document.querySelector(`.${windowClass}`);
            const closeButton: HTMLButtonElement = modalElement.querySelector('.btn-secondary');

            setTimeout(() => {
                closeButton.focus();
            });
        });

        this.lastSelectedRowOsteId = osteId;
    }

    loadProperties() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        if (window.history.state && window.history.state.zeitraum) {
            this.getFiltersFormGroup().patchValue({ zeitraum: window.history.state.zeitraum });
        }
    }

    subscribeToLangChange() {
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.getMatchingprofilFormGroup().patchValue(this.mapToForm(this.updateMatchingprofilData));
            this.updateFlags(this.updateMatchingprofilData);
            this.dataSource = [...this.matchingTrefferData].sort(this.sortByOrt).map(row => this.createRow(row));

            if (this.currentStatus) {
                this.getMatchingprofilFormGroup().controls.status.setValue(this.statusAktiv);
            } else {
                this.getMatchingprofilFormGroup().controls.status.setValue(this.statusInaktiv);
            }
        });
    }

    setMatchingtrefferData(): MatchingTrefferStesSuchParamDTO {
        const zustandichkeit = [];
        const vollzugsregOste = [];

        if (this.getFiltersFormGroup().controls.zustaendichkeitsBereich && this.getFiltersFormGroup().controls.zustaendichkeitsBereich.value) {
            this.getFiltersFormGroup().controls.zustaendichkeitsBereich.value.forEach(el => {
                if (el.value) {
                    if (el.fullData.codeId) {
                        zustandichkeit.push(el.fullData);
                    } else {
                        vollzugsregOste.push(el.fullData);
                    }
                }
            });
        }

        return {
            stesId: +this.stesId,
            zustaendigkeitsbereichScopes: zustandichkeit,
            zustaendigkeitsbereichVollzugsregionen: vollzugsregOste,
            zeitlicheEinschraenkung: {
                code: this.getFiltersFormGroup().controls.zeitraum.value ? this.getFiltersFormGroup().controls.zeitraum.value : 0
            },
            taetigkeitAnforderungen: this.getFiltersFormGroup().controls.stellenbeschreibung.value ? this.getFiltersFormGroup().controls.stellenbeschreibung.value : null,
            beschaeftigungsgradVon: this.getFiltersFormGroup().controls.beschaeftigungsgradVon.value ? +this.getFiltersFormGroup().controls.beschaeftigungsgradVon.value : 0,
            beschaeftigungsgradBis: this.getFiltersFormGroup().controls.beschaeftigungsgradBis.value ? +this.getFiltersFormGroup().controls.beschaeftigungsgradBis.value : 100
        };
    }

    getData() {
        this.spinnerService.activate(this.matchingChannel);
        forkJoin(
            this.dataService.getCode(DomainEnum.ZUSTAENDIGKEIT),
            this.dataService.getVollzugsregion({ vollzugsregionTypeCode: DomainEnum.OSTE }),
            this.dataService.getMatchingprofil(this.stesId),
            this.dataService.getCode(DomainEnum.TREFFER_SEIT),
            this.dataService.getCode(DomainEnum.STES_STATUS),
            this.dataService.getPersonalienBearbeiten(this.stesId)
        ).subscribe(
            ([zustaendigkeit, vollzugsregion, matchingprofil, trefferSeit, status, personalien]) => {
                if (zustaendigkeit) {
                    this.zustandichkeitFilteredOptions = zustaendigkeit.filter(
                        element => element.code !== MatchingprofilCodeEnum.VOLLZUGSREGION && element.code !== MatchingprofilCodeEnum.GANZESCHWEIZ
                    );
                }
                if (vollzugsregion) {
                    this.vollzugsregOste = vollzugsregion.data.filter(element => element.code !== DomainEnum.SECO_OSTE && element.code !== DomainEnum.SECO_STES);
                }
                if (personalien) {
                    this.toolboxService.sendEmailAddress(personalien.data.stesPersonalienDTO.email);
                }
                if (matchingprofil) {
                    this.dropdownDisabled = matchingprofil.data[0].statusDropdownDisabled;
                    this.checkboxesDisabled = matchingprofil.data[0].checkboxesDisabled;
                    this.matchingprofilListeDisabled = matchingprofil.data[0].matchingprofilListeDisabled;
                    const formArray = this.getFormArray();
                    matchingprofil.data.forEach(() => {
                        formArray.push(this.createBerufOptionGroup());
                    });

                    this.updatePageData(matchingprofil);
                    this.getMatchingprofilFormGroup().reset(this.mapToForm(matchingprofil));
                }
                if (trefferSeit) {
                    this.zeitraumOptions = trefferSeit.map(this.customPropertyMapper);
                }
                if (status) {
                    this.statusOptions = status.map(this.customPropertyMapper);
                    if (matchingprofil.data[0].statusB) {
                        this.getMatchingprofilFormGroup().controls.status.setValue(this.statusAktiv);
                    } else {
                        this.getMatchingprofilFormGroup().controls.status.setValue(this.statusInaktiv);
                    }
                    this.changeDetector.detectChanges();
                }
                this.getFilterData();

                this.updateTrefferData();

                this.deactivateSpinnerAndScrollToTop();
            },
            () => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    private getFilterData() {
        this.multiselectOptions = this.zustandichkeitFilteredOptions.map(el => this.mapZustaendigkeit(el)).concat(this.vollzugsregOste.map(el => this.mapVollzugsregion(el)));
        this.getFiltersFormGroup().controls.zustaendichkeitsBereich.setValue(this.multiselectOptions);

        const state = this.searchSession.restoreStateByKey(StesMatchingprofilComponent.STATE_KEY);
        if (state) {
            this.patchFilterData(state.fields);
        }
    }

    private patchFilterData(state) {
        this.getFiltersFormGroup()
            .get('zeitraum')
            .patchValue(state.zeitraum);

        this.getFiltersFormGroup()
            .get('stellenbeschreibung')
            .patchValue(state.stellenbeschreibung);

        this.getFiltersFormGroup()
            .get('beschaeftigungsgradVon')
            .patchValue(+state.beschaeftigungsgradVon);

        this.getFiltersFormGroup()
            .get('beschaeftigungsgradBis')
            .patchValue(+state.beschaeftigungsgradBis);

        this.multiselectOptions.forEach(el => {
            if (state.zustaendichkeitsBereich.includes(el.id)) {
                el.value = true;
            }
        });
    }

    saveOnChanges() {
        this.getMatchingprofilFormGroup()
            .valueChanges.pipe(debounceTime(1500))
            .subscribe(() => {
                if (this.getMatchingprofilFormGroup().dirty) {
                    this.spinnerService.activate(this.matchingChannel);

                    this.dataService.updateMatchingprofil(this.stesId, this.mapToDTO()).subscribe(
                        responseData => {
                            this.updatePageData(responseData);
                            this.updateTrefferData();
                            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        },
                        () => {
                            this.deactivateSpinnerAndScrollToTop();
                            this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                        }
                    );
                }
            });

        this.getFiltersFormGroup()
            .valueChanges.pipe(debounceTime(1500))
            .subscribe(
                () => {
                    if (this.getFiltersFormGroup().dirty) {
                        this.spinnerService.activate(this.matchingChannel);
                        this.storeFilterState();
                        this.updateTrefferData();
                    }
                },
                () => {
                    this.deactivateSpinnerAndScrollToTop();
                }
            );
    }

    storeFilterState(): void {
        const storage = {
            zustaendichkeitsBereich: this.getFiltersFormGroup()
                .get('zustaendichkeitsBereich')
                .value.filter(el => el.value === true)
                .map(el => el.id),
            zeitraum: this.getFiltersFormGroup().get('zeitraum').value,
            stellenbeschreibung: this.getFiltersFormGroup().get('stellenbeschreibung').value,
            beschaeftigungsgradVon: this.getFiltersFormGroup().get('beschaeftigungsgradVon').value,
            beschaeftigungsgradBis: this.getFiltersFormGroup().get('beschaeftigungsgradBis').value
        };

        this.searchSession.storeFieldsByKey(StesMatchingprofilComponent.STATE_KEY, storage);
    }

    updateTrefferData() {
        if (this.matchingprofilListeDisabled) {
            this.dataSource = [];
            this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesMatching', tableCount: 0 });
            this.deactivateSpinnerAndScrollToTop();
            return;
        }

        this.dataService.getMatchingprofilTreffer(this.translate.currentLang, this.setMatchingtrefferData()).subscribe(
            el => {
                this.dataSource = [...el.data].sort(this.sortByOrt).map(row => this.createRow(row));
                this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesMatching', tableCount: el.data.length });
                this.matchingTrefferData = el.data;
                this.deactivateSpinnerAndScrollToTop();
            },
            () => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    sortByOrt = (a: MatchingOsteDetailDTO, b: MatchingOsteDetailDTO): number => {
        const valueA = this.dbTranslateService.translateWithOrder(a, 'arbeitsortPlz');
        const valueB = this.dbTranslateService.translateWithOrder(b, 'arbeitsortPlz');
        if (valueA == null && valueB != null) {
            return -1;
        }
        if (valueA != null && valueB == null) {
            return 1;
        }
        if (valueA == null && valueB == null) {
            return 0;
        }
        return valueA.toLocaleLowerCase() < valueB.toLocaleLowerCase() ? -1 : valueA.toLocaleLowerCase() > valueB.toLocaleLowerCase() ? 1 : 0;
    };

    mapToDTO() {
        const matchingprofil = this.getMatchingprofilFormGroup().controls;

        return this.berufe.map((element, index) => {
            return {
                statusB: matchingprofil.status.value === this.statusAktiv ? true : false,
                arbeitsOrtB: matchingprofil.arbeitsort.value,
                arbeitsPensumB: matchingprofil.beschaeftigungsgrad.value,
                sprachenB: matchingprofil.sprachkenntnisse.value,
                geschlechtB: matchingprofil.geschlecht.value,
                idealAlterB: matchingprofil.alter.value,
                besondArbFormenB: matchingprofil.besondereArbeitsformen.value,
                fuehrerAusweisB: matchingprofil.fuehrerausweiskategorie.value,
                privatFahrzeugB: matchingprofil.privatesFahrzeug.value,

                verwandteBerufeB: this.getFormArray().at(index) ? this.getFormArray().at(index).value.aehnlicheBerufe : null,
                qualifikationB: this.getFormArray().at(index) ? this.getFormArray().at(index).value.qualifikation : null,
                erfahrungB: this.getFormArray().at(index) ? this.getFormArray().at(index).value.erfahrung : null,
                ausbildungsNiveauB: this.getFormArray().at(index) ? this.getFormArray().at(index).value.ausbildungsniveau : null,
                stesMatchingprofilId: element.stesMatchingprofilId,
                ojbVersion: this.updateMatchingprofilData.data[index].ojbVersion
            };
        });
    }

    toggleErrorPanel(show: boolean) {
        document.querySelectorAll('avam-alert')[0]['style'].display = show ? 'block' : 'none';
    }

    updateFlags(data) {
        if (data.data) {
            this.currentStatus = data.data[0].statusB;
            this.dropdownDisabled = data.data[0].statusDropdownDisabled;
            this.checkboxesDisabled = data.data[0].checkboxesDisabled;
            this.matchingprofilListeDisabled = data.data[0].matchingprofilListeDisabled;
            this.getMatchingprofilFormGroup().markAsPristine();
        }
    }

    mapToForm(data) {
        this.berufe = [];
        data.data.forEach(el => {
            this.berufe.push({
                stesMatchingprofilId: el.stesMatchingprofilId,
                beruf: this.dbTranslateService.translate(el, 'beruf'),
                verwandteBerufe: el.verwandteBerufeDe ? this.dbTranslateService.translate(el, 'verwandteBerufe') : this.dbTranslateService.instant('common.label.keineangaben'),
                qualifikation: el.qualifikation ? this.dbTranslateService.translate(el.qualifikation, 'text') : this.dbTranslateService.instant('common.label.keineangaben'),
                erfahrung: this.dbTranslateService.translate(el.erfahrung, 'text'),
                ausbildungsNiveau: this.dbTranslateService.translate(el.ausbildungsNiveau, 'text'),
                verwandteBerufeKurz: el.verwandteBerufeDe
                    ? this.dbTranslateService
                          .translate(el, 'verwandteBerufe')
                          .split(',')
                          .splice(0, 3)
                    : this.dbTranslateService.instant('common.label.keineangaben'),
                verwandteBerufeFlag: !el.verwandteBerufeDe ? true : false,
                qualifikationFlag: !el.qualifikation ? true : false
            });
        });

        const map = {
            alter: data.data[0].idealAlterB,
            alterInput: data.data[0].alter,
            arbeitsort: data.data[0].arbeitsOrtB,
            arbeitsortInput: this.dbTranslateService.translate(data.data[0], 'arbeitsort'),
            beschaeftigungsgrad: data.data[0].arbeitsPensumB,
            beschaeftigungsgradInput: `${data.data[0].beschaeftigungsgradfix} %`,
            sprachkenntnisse: data.data[0].sprachenB,
            sprachkenntnisseInput: this.dbTranslateService.translate(data.data[0], 'sprachen'),
            geschlecht: data.data[0].geschlechtB,
            geschlechtInput: this.dbTranslateService.translate(data.data[0], 'geschlecht'),
            fuehrerausweiskategorie: data.data[0].fuehrerAusweisB,
            fuehrerausweiskategorieInput: this.setMapToForm(data.data[0], 'fuehrerausweisKat'),
            besondereArbeitsformen: data.data[0].besondArbFormenB,
            besondereArbeitsformenInput: this.setMapToForm(data.data[0], 'besondereArbeitsformen'),

            privatesFahrzeug: data.data[0].privatFahrzeugB,
            privatesFahrzeugInput: data.data[0].privFahrzeug ? this.dbTranslateService.instant('common.label.jaklein') : this.dbTranslateService.instant('common.label.neinklein'),
            berufeOptions: this.mapBerufeOptions(data.data)
        };
        return map;
    }

    private setMapToForm(dto, translateKey) {
        return this.dbTranslateService.translate(dto, translateKey) || this.dbTranslateService.instant('common.label.keineangaben');
    }

    infoIconData(index: number) {
        return this.berufe[index].verwandteBerufe.split(',');
    }

    mapBerufeOptions(data) {
        return data.map(el => {
            return {
                berufName: true,
                aehnlicheBerufe: el.verwandteBerufeB,
                qualifikation: el.qualifikationB,
                erfahrung: el.erfahrungB,
                ausbildungsniveau: el.ausbildungsNiveauB
            };
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    ngOnDestroy() {
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        if (this.toolboxActionSub) {
            this.toolboxActionSub.unsubscribe();
        }
        this.stesInfobarService.toggle(true);
        this.toggleErrorPanel(true);
        this.stesInfobarService.sendLastUpdate({}, true);
        ToolboxService.GESPEICHERTEN_LISTE_URL = `/stes/details/${this.stesId}/matchingprofil`;
    }

    private updatePageData(matchingprofilData: BaseResponseWrapperListStesMatchingprofilDTOWarningMessages) {
        this.updateFlags(matchingprofilData);
        this.updateMatchingprofilData = matchingprofilData;
        this.interactionService.updateDetailsHeader(this.stesId);
        this.stesInfobarService.sendLastUpdate(matchingprofilData.data[0]);
    }

    private customPropertyMapper = (element: CodeDTO) => {
        return {
            value: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    };

    private deactivateSpinnerAndScrollToTop() {
        this.spinnerService.deactivate(this.matchingChannel);
        OrColumnLayoutUtils.scrollTop();
    }
}
