import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { debounceTime, filter, finalize, takeUntil } from 'rxjs/operators';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { BaseResponseWrapperListOsteMatchingProfilDTOWarningMessages } from '@dtos/baseResponseWrapperListOsteMatchingProfilDTOWarningMessages';
import { MatchingprofilCodeEnum } from '@shared/enums/domain-code/matchingprofil-code.enum';
import { TranslateService } from '@ngx-translate/core';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { OsteNavigationHelperService } from '@modules/arbeitgeber/arbeitgeber-details/services/oste-navigation-helper.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
// prettier-ignore
import {
    MatchingprofilAnzeigenTableComponent
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/matchinprofil/matchingprofil-anzeigen-table/matchingprofil-anzeigen-table.component';
import { MatchingTrefferOsteSuchParamDTO } from '@dtos/matchingTrefferOsteSuchParamDTO';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ZustaendigkeitsbereichCodeEnum } from '@shared/enums/domain-code/zustaendigkeitsbereich-code.enum';
import { BaseResponseWrapperListMatchingStesDetailDTOWarningMessages } from '@dtos/baseResponseWrapperListMatchingStesDetailDTOWarningMessages';
import { MatchingStesDetailDTO } from '@dtos/matchingStesDetailDTO';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-matchingprofil-bearbeiten',
    templateUrl: './matchingprofil.component.html',
    styleUrls: ['./matchingprofil.component.scss']
})
export class MatchingprofilComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    get berufeOptions(): FormArray {
        return this.matchingProfilForm.controls['berufeOptions'] as FormArray;
    }
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('matchingprofilAnzeigenTable') matchingprofilAnzeigenTable: MatchingprofilAnzeigenTableComponent;
    @ViewChild('matchingprofilAnzeigenTableModel') matchingprofilAnzeigenTableModal: MatchingprofilAnzeigenTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    statusOptions: CodeDTO[] = [];
    zeitraumOptions: CodeDTO[] = [];
    multiselectOptions = [];
    zustandichkeitFilteredOptions = [{}];
    beschaeftigungsgradVonBisOptions = [];
    beschaeftigungsgradBisOptions = [];
    vollzugsregOste = [{}];
    dropdownDisabled: boolean;
    statusDropdownDisabled: boolean;
    berufe = [];
    osteId: string;
    unternehmenId: string;
    channel = 'matchingprofil';
    matchingProfilForm: FormGroup;
    updateMatchingprofilData: BaseResponseWrapperListOsteMatchingProfilDTOWarningMessages;
    KEINEANFORDERUNG = 'arbeitgeber.oste.message.keineanforderung';
    matchingTreffenData: MatchingStesDetailDTO[] = [];
    filteredData: MatchingStesDetailDTO[] = [];
    snapshot;
    hideButtonSelector: any;

    beschaeftigungsgradVonTooltip: number;
    beschaeftigungsgradBisTooltip: number;

    private matchingProfilChannel: 'matchingProfilChannel';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private stesDataRestService: StesDataRestService,
        private contentService: ContentService,
        private unternehmenService: UnternehmenRestService,
        private changeDetector: ChangeDetectorRef,
        private translateService: TranslateService,
        private osteSideNavHelper: OsteNavigationHelperService,
        private infopanelService: AmmInfopanelService,
        private osteService: OsteDataRestService,
        private modalService: NgbModal,
        private facadeService: FacadeService
    ) {
        super();
        ToolboxService.CHANNEL = this.matchingProfilChannel;
        this.infopanelService.updateInformation({ tableCount: undefined });
    }

    public ngOnInit() {
        this.infopanelService.updateInformation({ subtitle: 'stes.subnavmenuitem.matching.matchingliste' });
        this.contentService.setVisibility(false);
        this.getRouteParams();
        this.generateForm();
        this.saveOnChanges();
        this.initToolbox();
        this.setSubscriptions();
    }

    public ngAfterViewInit(): void {
        this.getInitialData();
        this.setBeschaeftigungsgradBisOptions();
        setTimeout(() => {
            this.hideButtonSelector = document.querySelector('.column-toggle-left');
            this.hideButtonSelector.click();
        }, 10);
    }

    public ngOnDestroy(): void {
        this.contentService.setVisibility(true);
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.resetConfiguration();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.infopanelService.sendLastUpdate({}, true);
        super.ngOnDestroy();
    }

    public infoIconData(index: number) {
        return this.berufe[index].verwandteBerufe.split(',');
    }

    public getBerufOptions(i: number): FormGroup {
        return this.berufeOptions.at(i) as FormGroup;
    }

    public isEmpty(formName): boolean {
        return this.matchingProfilForm.controls[formName].value !== this.translateService.instant(this.KEINEANFORDERUNG);
    }

    public setBeschaeftigungsgradBisOptions() {
        this.matchingProfilForm.controls['beschaeftigungsgradVon'].valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(el => {
            this.beschaeftigungsgradVonTooltip = el;
            if (el || el === 0) {
                this.beschaeftigungsgradBisOptions = this.beschaeftigungsgradVonBisOptions.filter(element => element.value >= +el);
                const isVonGreatherThanBis = parseInt(el, 10) > parseInt(this.matchingProfilForm.controls.beschaeftigungsgradBis.value, 10);
                if (this.beschaeftigungsgradBisOptions.length === 1 || isVonGreatherThanBis) {
                    this.matchingProfilForm.controls.beschaeftigungsgradBis.setValue(el);
                }
                this.updateTableInformation();
                this.matchingProfilForm.markAsPristine();
            }
        });
        this.matchingProfilForm.controls['beschaeftigungsgradBis'].valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(el => {
            this.beschaeftigungsgradBisTooltip = el;
            if (el || el === 0) {
                this.updateTableInformation();
                this.matchingProfilForm.markAsPristine();
            }
        });
    }

    public onSelectItem(event: any) {
        this.router.navigate([`./vermittlung-erfassen/step1`], {
            relativeTo: this.route,
            queryParams: {
                stesId: event.stesId,
                osteId: this.osteId,
                osteMatchingProfilId: event.fullData.osteMatchingProfilId
            }
        });
    }

    public openRemoveVermittlingNichtGeeignetDialog(stesId) {
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
                this.vermittlungEntfernen(stesId);
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
    }

    public vermittlungEntfernen(stesId: number) {
        this.facadeService.spinnerService.activate(this.channel);
        this.osteService
            .removeVermittlungNichtGeeignetProOSTE({
                osteId: +this.osteId,
                stesIds: [stesId]
            })
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                () => {
                    this.searchResults();
                    this.facadeService.spinnerService.deactivate(this.channel);
                    this.facadeService.notificationService.success(this.facadeService.dbTranslateService.instant('common.message.markierungentfernt'));
                },
                () => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    this.facadeService.notificationService.error(this.facadeService.dbTranslateService.instant('common.message.datennichtgeloescht'));
                }
            );
    }

    private setMapToForm(dto, translateKey) {
        return this.facadeService.dbTranslateService.translate(dto, translateKey) || this.facadeService.dbTranslateService.instant('arbeitgeber.oste.message.keineanforderung');
    }

    private getRouteParams() {
        this.route.parent.params.subscribe(parentData => {
            this.unternehmenId = parentData['unternehmenId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.osteId = params.get('osteId');
            this.osteSideNavHelper.setFirstLevelNav();
        });
    }

    private generateForm(): void {
        this.matchingProfilForm = this.fb.group({
            status: null,
            zeitraum: null,
            faehigkeitenSkills: null,
            beschaeftigungsgradVon: null,
            beschaeftigungsgradBis: null,
            zustaendichkeitsBereich: [null],
            arbeitsort: false,
            arbeitsortInput: null,
            beschaeftigungsgrad: false,
            beschaeftigungsgradInput: null,
            sprachkenntnisse: false,
            sprachkenntnisseInput: null,
            geschlecht: false,
            geschlechtInput: null,
            alter: false,
            alterInput: null,
            besondereArbeitsformen: false,
            besondereArbeitsformenInput: null,
            fuehrerausweiskategorie: false,
            fuehrerausweiskategorieInput: null,
            privatesFahrzeug: false,
            privatesFahrzeugInput: null,
            berufeOptions: this.fb.array([])
        });
    }

    private getInitialData(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.beschaeftigungsgradVonBisOptions = this.getbeschaeftigungsgradVonBisArrayNumber();
        this.beschaeftigungsgradBisOptions = this.getbeschaeftigungsgradVonBisArrayNumber();
        forkJoin<CodeDTO[], CodeDTO[], CodeDTO[], any, any>([
            this.stesDataRestService.getCode(DomainEnum.STATUS_OSTE),
            this.stesDataRestService.getCode(DomainEnum.TREFFER_SEIT),
            this.stesDataRestService.getCode(DomainEnum.ZUSTAENDIGKEIT),
            this.stesDataRestService.getVollzugsregion({ vollzugsregionTypeCode: DomainEnum.STES }),
            this.unternehmenService.getMatichingProfile(this.osteId)
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([status, zeitraum, zustaendigkeit, vollzugsregion, matchingprofil]) => {
                    if (zustaendigkeit) {
                        this.zustandichkeitFilteredOptions = zustaendigkeit.filter(
                            el => el.code !== MatchingprofilCodeEnum.VOLLZUGSREGION && el.code !== MatchingprofilCodeEnum.GANZESCHWEIZ
                        );
                    }
                    if (vollzugsregion) {
                        this.vollzugsregOste = vollzugsregion.data.filter(el => el.code !== DomainEnum.SECOSTES);
                        this.multiselectOptions = this.zustandichkeitFilteredOptions
                            .map(el => this.mapZustaendigkeit(el))
                            .concat(this.vollzugsregOste.map(el => this.mapVollzugsregion(el)));
                        this.multiselectOptions.forEach(element => {
                            element.value = element.id === +this.facadeService.formUtilsService.getCodeIdByCode(zustaendigkeit, ZustaendigkeitsbereichCodeEnum.EIGENER_KANTON);
                        });
                    }
                    if (matchingprofil && matchingprofil.data) {
                        this.dropdownDisabled = matchingprofil.data[0].statusActive;
                        this.infopanelService.sendLastUpdate(matchingprofil.data[0]);
                        matchingprofil.data.forEach(() => {
                            this.berufeOptions.push(this.createBerufOptionGroup());
                        });
                        this.updateMatchingprofilData = matchingprofil;
                        this.matchingProfilForm.reset(this.mapToForm(matchingprofil));
                        this.statusDropdownDisabled = matchingprofil.data[0].statusDropdownDisabled;
                    }
                    if (status && matchingprofil.data) {
                        this.statusOptions = this.facadeService.formUtilsService.mapDropdownKurztext(status).filter(item => item.code !== MatchingprofilCodeEnum.STATUSABGEMELDET);
                        if (matchingprofil.data[0].statusActive) {
                            this.matchingProfilForm.controls.status.setValue(MatchingprofilCodeEnum.STATUSAKTIV);
                        } else {
                            this.matchingProfilForm.controls.status.setValue(MatchingprofilCodeEnum.STATUSINAKTIV);
                        }
                        this.changeDetector.detectChanges();
                    }
                    this.zeitraumOptions = zeitraum.map(this.customPropertyMapper);

                    this.matchingProfilForm.controls.beschaeftigungsgradVon.setValue(this.beschaeftigungsgradVonBisOptions[0].value);
                    this.matchingProfilForm.controls.beschaeftigungsgradBis.setValue(this.beschaeftigungsgradVonBisOptions[this.beschaeftigungsgradVonBisOptions.length - 1].value);
                    if (window.history.state && window.history.state.zeitraum) {
                        this.matchingProfilForm.controls.zeitraum.setValue(window.history.state.zeitraum);
                    }
                    this.searchResults();
                },
                () => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            );
    }

    private customPropertyMapper(element: CodeDTO) {
        return {
            code: element.code,
            codeId: element.codeId,
            value: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    }

    private mapZustaendigkeit(element: CodeDTO) {
        return {
            id: element.codeId,
            textDe: element.kurzTextDe,
            textIt: element.kurzTextIt,
            textFr: element.kurzTextFr,
            value: false,
            fullData: element
        };
    }

    private mapVollzugsregion(element: any) {
        return {
            id: element.vollzugsregionId,
            textDe: element.nameDe,
            textIt: element.nameIt,
            textFr: element.nameFr,
            value: false,
            fullData: element
        };
    }

    private getbeschaeftigungsgradVonBisArrayNumber(): any[] {
        const array = [];
        for (let i = 0; i <= 100; i += 5) {
            const obj = {
                value: i,
                labelFr: i,
                labelIt: i,
                labelDe: i
            };
            array.push(obj);
        }
        return array;
    }

    private createBerufOptionGroup(): FormGroup {
        return this.fb.group({
            berufName: true,
            aehnlicheBerufe: false,
            qualifikation: false,
            erfahrung: false,
            ausbildungsniveau: false
        });
    }

    private mapToForm(data) {
        this.setBerufe(data);
        const map = {
            arbeitsort: data.data[0].arbeitsOrtChecked,
            arbeitsortInput: this.setMapToForm(data.data[0], 'arbeitsort'),
            alter: data.data[0].idealAlterChecked,
            alterInput:
                data.data[0].alterVon || data.data[0].alterBis
                    ? `${this.facadeService.dbTranslateService.instant('stes.label.von')} ` +
                      `${data.data[0].alterVon} ` +
                      `${this.facadeService.dbTranslateService.instant('stes.label.bis')} ` +
                      `${data.data[0].alterBis} `
                    : this.facadeService.dbTranslateService.instant('arbeitgeber.oste.message.keineanforderung'),
            beschaeftigungsgrad: data.data[0].beschaeftigungsgradChecked,
            beschaeftigungsgradInput: data.data[0].beschaeftigungsgrad
                ? data.data[0].beschaeftigungsgrad
                : this.facadeService.dbTranslateService.instant('arbeitgeber.oste.message.keineanforderung'),
            sprachkenntnisse: data.data[0].sprachenChecked,
            sprachkenntnisseInput: this.setMapToForm(data.data[0], 'sprachen'),
            geschlecht: data.data[0].geschlechtChecked,
            geschlechtInput: this.setMapToForm(data.data[0], 'geschlecht'),
            besondereArbeitsformen: data.data[0].besondereArbeitsformenDe ? data.data[0].besondArbFormenChecked : false,
            besondereArbeitsformenInput: data.data[0].besondereArbeitsformenDe
                ? this.facadeService.dbTranslateService.translate(data.data[0], 'besondereArbeitsformen')
                : this.facadeService.dbTranslateService.instant('arbeitgeber.oste.message.keineanforderung'),
            fuehrerausweiskategorie: data.data[0].fuehrerAusweisKatChecked,
            fuehrerausweiskategorieInput: this.setMapToForm(data.data[0], 'fuehrerausweisKat'),
            privatesFahrzeug: data.data[0].privatFahrzeugChecked,
            privatesFahrzeugInput: data.data[0].privatFahrzeug
                ? this.facadeService.dbTranslateService.instant('common.label.jaklein')
                : this.facadeService.dbTranslateService.instant('common.label.neinklein'),
            berufeOptions: this.mapBerufeOptions(data.data),
            zustaendichkeitsBereich: this.multiselectOptions
        };
        return map;
    }

    private setBerufe(data) {
        this.berufe = [];
        data.data.forEach((el, index) => {
            this.berufe.push({
                osteMatchingProfilId: el.osteMatchingProfilId,
                beruf: this.facadeService.dbTranslateService.translate(el, 'beruf'),
                verwandteBerufe: this.setMapToForm(el, 'verwandteBerufe'),
                qualifikation: this.setMapToForm(el.qualifikationCodeDTO, 'text'),
                erfahrung: el.erfahrungCodeDTO
                    ? this.facadeService.dbTranslateService.translate(el.erfahrungCodeDTO, 'text')
                    : this.facadeService.dbTranslateService.instant('common.label.keineangaben'),
                ausbildungsNiveau: this.setMapToForm(el.ausbildungsNiveauCodeDTO, 'text'),
                verwandteBerufeKurz: el.verwandteBerufeDe
                    ? this.facadeService.dbTranslateService
                          .translate(el, 'verwandteBerufe')
                          .split(',')
                          .splice(0, 3)
                    : this.facadeService.dbTranslateService.instant('arbeitgeber.oste.message.keineanforderung'),
                verwandteBerufeFlag: !el.verwandteBerufeDe ? true : false,
                qualifikationFlag: !el.qualifikationCodeDTO ? true : false,
                erfahrungFlag: !el.erfahrungCodeDTO ? true : false,
                ausbildungsniveauFlag: !el.ausbildungsNiveauCodeDTO ? true : false
            });
        });
    }

    private mapToFormOnSave(data, formData) {
        this.setBerufe(data);
        const map = {
            arbeitsort: formData.arbeitsort,
            arbeitsortInput: this.setMapToForm(data.data[0], 'arbeitsort'),
            alter: formData.alter,
            alterInput:
                data.data[0].alterVon || data.data[0].alterBis
                    ? `${this.facadeService.dbTranslateService.instant('stes.label.von')} ` +
                      `${data.data[0].alterVon} ` +
                      `${this.facadeService.dbTranslateService.instant('stes.label.bis')} ` +
                      `${data.data[0].alterBis} `
                    : this.facadeService.dbTranslateService.instant('arbeitgeber.oste.message.keineanforderung'),
            beschaeftigungsgrad: formData.beschaeftigungsgrad,
            beschaeftigungsgradInput: data.data[0].beschaeftigungsgrad
                ? data.data[0].beschaeftigungsgrad
                : this.facadeService.dbTranslateService.instant('arbeitgeber.oste.message.keineanforderung'),
            sprachkenntnisse: formData.sprachkenntnisse,
            sprachkenntnisseInput: this.setMapToForm(data.data[0], 'sprachen'),
            geschlecht: formData.geschlecht,
            geschlechtInput: this.setMapToForm(data.data[0], 'geschlecht'),
            besondereArbeitsformen: formData.besondereArbeitsformen,
            besondereArbeitsformenInput: data.data[0].besondereArbeitsformenDe
                ? this.facadeService.dbTranslateService.translate(data.data[0], 'besondereArbeitsformen')
                : this.facadeService.dbTranslateService.instant('arbeitgeber.oste.message.keineanforderung'),
            fuehrerausweiskategorie: formData.fuehrerausweiskategorie,
            fuehrerausweiskategorieInput: this.setMapToForm(data.data[0], 'fuehrerausweisKat'),
            privatesFahrzeug: formData.privatesFahrzeug,
            privatesFahrzeugInput: data.data[0].privatFahrzeug
                ? this.facadeService.dbTranslateService.instant('common.label.jaklein')
                : this.facadeService.dbTranslateService.instant('common.label.neinklein'),
            berufeOptions: this.mapBerufeOptionsOnSave(formData.berufeOptions)
        };
        return map;
    }

    private setSubscriptions() {
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.matchingProfilForm.patchValue(this.mapToFormOnSave(this.updateMatchingprofilData, this.snapshot));
            this.matchingProfilForm.markAsPristine();
            this.matchingprofilAnzeigenTable.setData(this.matchingTreffenData);
        });
    }

    private mapBerufeOptionsOnSave(data) {
        return data.map(el => {
            return {
                berufName: true,
                aehnlicheBerufe: el.aehnlicheBerufe,
                qualifikation: el.qualifikation,
                erfahrung: el.erfahrung,
                ausbildungsniveau: el.ausbildungsniveau
            };
        });
    }

    private mapBerufeOptions(data) {
        return data.map(el => {
            return {
                berufName: true,
                aehnlicheBerufe: el.verwandteBerufeChecked,
                qualifikation: el.qualifikationChecked,
                erfahrung: el.erfahrungChecked,
                ausbildungsniveau: el.ausbildungsNiveauChecked
            };
        });
    }

    private searchResults() {
        this.unternehmenService
            .searchMatchingprofilTreffen(this.mapToDTO())
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                })
            )
            .subscribe((response: BaseResponseWrapperListMatchingStesDetailDTOWarningMessages) => {
                if (response.data) {
                    this.snapshot = this.matchingProfilForm.value;
                    this.stringSort({ data: response.data, order: this.matchingprofilAnzeigenTable.baseTableConfig.config.sortOrder }, 'name');
                    this.stringSort({ data: response.data, order: this.matchingprofilAnzeigenTable.baseTableConfig.config.sortOrder }, 'wohnort');
                    this.booleanSort(response.data, this.matchingprofilAnzeigenTable.baseTableConfig.config.sortOrder, 'gesucht');
                    this.matchingTreffenData = response.data;
                    if (this.statusOptions) {
                        if (this.matchingProfilForm.controls.status.value === MatchingprofilCodeEnum.STATUSAKTIV) {
                            this.dropdownDisabled = true;
                        } else if (this.matchingProfilForm.controls.status.value === MatchingprofilCodeEnum.STATUSINAKTIV) {
                            this.dropdownDisabled = false;
                        }
                    }
                    this.updateTableInformation();
                }
            });
    }

    private updateTableInformation() {
        this.filteredData = this.filterByVermittlunsgrad();
        this.matchingprofilAnzeigenTable.setData(this.filteredData);
        this.infopanelService.updateInformation({ tableCount: this.filteredData.length });
    }

    private filterByVermittlunsgrad(): MatchingStesDetailDTO[] {
        const von = +this.matchingProfilForm.controls.beschaeftigungsgradVon.value;
        const bis = +this.matchingProfilForm.controls.beschaeftigungsgradBis.value;
        return this.matchingTreffenData.filter(item => item.vermittlungsgrad >= von && item.vermittlungsgrad <= bis);
    }

    private stringSort(event, prop) {
        event.data.sort((value1, value2) => {
            return value1[prop].localeCompare(value2[prop]) * event.order;
        });
    }

    private booleanSort(data, order, prop) {
        data.sort((val1, val2) => {
            return val1[prop] === val2[prop] ? 0 : val1[prop] ? -1 : 1 * order;
        });
    }

    private saveOnChanges() {
        this.matchingProfilForm.valueChanges
            .pipe(debounceTime(1500))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                () => {
                    if (this.matchingProfilForm.dirty) {
                        this.facadeService.spinnerService.activate(this.channel);
                        this.facadeService.notificationService.success('common.message.datengespeichert');
                        this.searchResults();
                    }
                },
                () => {
                    this.facadeService.spinnerService.deactivate();
                }
            );
    }

    private mapToDTO(): MatchingTrefferOsteSuchParamDTO {
        const matchingprofil = this.matchingProfilForm.controls;
        const zustandichkeit = [];
        const vollzugsregOste = [];
        if (this.matchingProfilForm.controls.zustaendichkeitsBereich && this.matchingProfilForm.controls.zustaendichkeitsBereich.value) {
            this.matchingProfilForm.controls.zustaendichkeitsBereich.value.forEach(el => {
                if (el.value) {
                    if (el.fullData.codeId) {
                        zustandichkeit.push(`${el.fullData.code}`);
                    } else {
                        vollzugsregOste.push(el.fullData.vollzugsregionId);
                    }
                }
            });
        }
        const berufList = this.berufe.map((el, index) => {
            return {
                stesMatchingprofilId: el.osteMatchingProfilId,
                verwandeteBerufe: this.berufeOptions.at(index) ? this.berufeOptions.at(index).value.aehnlicheBerufe : null,
                qualifikation: this.berufeOptions.at(index) ? this.berufeOptions.at(index).value.qualifikation : null,
                erfahrung: this.berufeOptions.at(index) ? this.berufeOptions.at(index).value.erfahrung : null,
                ausbildungsniveau: this.berufeOptions.at(index) ? this.berufeOptions.at(index).value.ausbildungsniveau : null
            };
        });
        return {
            osteId: +this.osteId,
            statusId: +this.facadeService.formUtilsService.getCodeIdByCode(this.statusOptions, matchingprofil.status.value),
            skills: matchingprofil.faehigkeitenSkills.value,
            zeitlicheEinschraenkung: matchingprofil.zeitraum.value,
            zustaendigkeitsbereichScopes: zustandichkeit,
            zustaendigkeitsbereichVollzugsregionen: vollzugsregOste,
            arbeitsort: matchingprofil.arbeitsort.value,
            beschaeftigungsgrad: matchingprofil.beschaeftigungsgrad.value,
            sprache: matchingprofil.sprachkenntnisse.value,
            geschlecht: matchingprofil.geschlecht.value,
            idealAlter: matchingprofil.alter.value,
            besondereArbeitsformen: matchingprofil.besondereArbeitsformen.value,
            fuehrerausweisErforderlich: matchingprofil.fuehrerausweiskategorie.value,
            fahrzeugErforderlich: matchingprofil.privatesFahrzeug.value,
            osteMatchingprofiles: berufList
        };
    }

    private initToolbox() {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() =>
                this.modalService.open(this.modalPrint, {
                    windowClass: 'avam-modal-xl',
                    ariaLabelledBy: 'modal-basic-title',
                    centered: true,
                    backdrop: 'static'
                })
            );
        this.facadeService.toolboxService.sendConfiguration(
            ToolboxConfig.getMatchingProfilConfig(),
            this.matchingProfilChannel,
            ToolboxDataHelper.createForAmmGeschaeftsfall(null, +this.osteId)
        );
    }
}
