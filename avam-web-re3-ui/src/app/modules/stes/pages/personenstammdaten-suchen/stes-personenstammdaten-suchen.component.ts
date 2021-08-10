import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableHeaderObject } from 'src/app/shared/components/table/table.header.object';
import { SortOrderEnum } from 'src/app/shared/enums/sort-order.enum';
import { Subscription } from 'rxjs';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { Router } from '@angular/router';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { DbTranslateService } from 'src/app/shared/services/db-translate.service';
import { FormUtilsService, ToolboxService } from 'src/app/shared';
import { StepService } from 'src/app/shared/components/wizard/step-service';
import { GeburtsdatumValidator } from 'src/app/shared/validators/geburtsdatum-validator';
import { SvNummerValidator } from 'src/app/shared/validators/sv-nummer-validator';
import { TextValidator } from 'src/app/shared/validators/text-validator';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { StringHelper } from '@shared/helpers/string.helper';
import PrintHelper from '@shared/helpers/print.helper';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { StesStoreService } from '@stes/stes-store.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { StesPersonenstammdatenModel } from './stes-personenstammdaten-cache.model';

@Component({
    selector: 'app-stes-personenstammdaten-suchen',
    templateUrl: './stes-personenstammdaten-suchen.component.html',
    styleUrls: ['./stes-personenstammdaten-suchen.component.scss'],
    providers: [SearchSessionStorageService]
})
export class StesPersonenstammdatenSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    searchForm: FormGroup;
    headers: TableHeaderObject[] = [];
    personenstammdatenData: any[] = [];
    personenstammdatenDataFromBE: any[];
    defaultSort = { column: 'zasNameVorname', direction: SortOrderEnum.ASCENDING };
    stesDataRestServiceSub: Subscription;
    observeClickActionSub: Subscription;
    personenstammdatenSucheChannel = 'personenstammdatenSuche';
    enableSuchen: boolean;
    zasvorname: AbstractControl;
    geburtsdatum: AbstractControl;
    svnr: AbstractControl;
    redirectWithMessage: boolean;
    searchDone: boolean;
    showInfoMessage: boolean;
    isNeuanmeldungHidden = true;

    cache: StesPersonenstammdatenModel;
    protected sort = { column: 'zasNameVorname', direction: SortOrderEnum.ASCENDING };

    constructor(
        protected router: Router,
        protected toolboxService: ToolboxService,
        protected stepService: StepService,
        protected formBuilder: FormBuilder,
        protected formUtils: FormUtilsService,
        protected stesDataRestService: StesDataRestService,
        protected dbTranslateService: DbTranslateService,
        protected spinnerService: SpinnerService,
        protected wizardService: WizardService,
        protected fehlermeldungenService: FehlermeldungenService,
        protected stesStoreService: StesStoreService,
        protected stateService: SearchSessionStorageService
    ) {
        super();
        ToolboxService.CHANNEL = 'personenstammdatenSuchen';
        SpinnerService.CHANNEL = this.personenstammdatenSucheChannel;
    }

    ngOnInit() {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.getCacheState();
        this.initForm();
        this.configureToolbox();
        this.setRequiredFields();
        this.wizardService.initSteps();
        this.stesStoreService.removeStes();
    }

    ngOnDestroy() {
        if (!this.redirectWithMessage) {
            this.fehlermeldungenService.closeMessage();
        }

        this.observeClickActionSub.unsubscribe();
        super.ngOnDestroy();
    }

    initForm() {
        this.searchForm = this.formBuilder.group({
            zasvorname: '',
            geburtsdatum: '',
            svnr: ['', SvNummerValidator.svNummberValid]
        });
        this.zasvorname = this.searchForm.controls.zasvorname;
        this.geburtsdatum = this.searchForm.controls.geburtsdatum;
        this.svnr = this.searchForm.controls.svnr;
    }

    addHeaders() {
        this.headers.push(new TableHeaderObject('stes.label.svnr', 'svnr'));
        this.headers.push(new TableHeaderObject('stes.label.zasNameVorname', 'zasNameVorname'));
        this.headers.push(new TableHeaderObject('stes.label.geburtsdatum', 'geburtsdatum'));
        this.headers.push(new TableHeaderObject('stes.label.geschlecht', 'geschlecht'));
        this.headers.push(new TableHeaderObject('stes.label.zivilstand', 'zivilstand'));
    }

    onSubmit() {
        this.fehlermeldungenService.closeMessage();
        const requestDto = this.mapToDTO();
        this.spinnerService.activate(this.personenstammdatenSucheChannel);
        this.stesDataRestServiceSub = this.stesDataRestService
            .getPersonenstammdaten(requestDto)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    this.personenstammdatenData = [];
                    if (response.data) {
                        this.searchDone = true;
                        this.personenstammdatenDataFromBE = response.data;
                        response.data.forEach(dto => {
                            this.personenstammdatenData.push(this.buildModel(dto));
                        });
                    }
                    this.spinnerService.deactivate(this.personenstammdatenSucheChannel);

                    this.checkIsNeuAnmeldung();

                    this.stateService.storeFieldsByKey(this.personenstammdatenSucheChannel, {
                        requestDto,
                        searchForm: this.searchForm,
                        data: response.data,
                        sort: this.defaultSort
                    });
                },
                () => {
                    this.spinnerService.deactivate(this.personenstammdatenSucheChannel);
                }
            );
    }

    mapToDTO() {
        return {
            personenNr: '',
            namePersReg: '',
            vornamePersReg:
                !this.searchForm.controls.zasvorname.value || this.searchForm.controls.zasvorname.value.length === 0 ? null : this.searchForm.controls.zasvorname.value.trim(),
            geburtsDatum: this.getGeburtsdatum(),
            svNrFromZas: !this.searchForm.controls.svnr.value || this.searchForm.controls.svnr.value.length === 0 ? null : this.searchForm.controls.svnr.value.trim(),
            geschlecht: null,
            zivilStand: null
        };
    }

    buildModel(personstammdatenDTO) {
        return {
            svnr: personstammdatenDTO.svNrFromZas,
            zasNameVorname: `${personstammdatenDTO.namePersReg}, ${personstammdatenDTO.vornamePersReg}`,
            geburtsdatum: personstammdatenDTO.geburtsDatum,
            geschlecht: this.dbTranslateService.translate(personstammdatenDTO.geschlechtObject, 'text'),
            zivilstand: this.dbTranslateService.translate(personstammdatenDTO.zivilstandObject, 'text'),
            personStesId: personstammdatenDTO.personStesId
        };
    }

    configureToolbox() {
        const toolboxConfig = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true), new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)];

        this.toolboxService.sendConfiguration(toolboxConfig, '', null, false);

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    reset() {
        this.clearValidators();
        this.searchForm.reset();
        this.personenstammdatenData = [];
        this.isNeuanmeldungHidden = true;
        this.fehlermeldungenService.closeMessage();
        this.searchDone = false;
    }

    cancel() {
        this.fehlermeldungenService.closeMessage();
        this.router.navigate(['/home/start-page']);
    }

    callPersonenstammdaten(stateObj?) {
        if (!stateObj) {
            const state = { state: { vornamePersReg: this.zasvorname.value, geburtsDatum: this.geburtsdatum.value } };
            this.moveNext(state);
            this.wizardService.validateStep(true);
        } else {
            if (stateObj.state.istDatenschutz) {
                this.fehlermeldungenService.showMessage('stes.error.persongeschuetzt', 'danger');
                OrColumnLayoutUtils.scrollTop();
            } else {
                this.spinnerService.activate(this.personenstammdatenSucheChannel);
                this.stesDataRestServiceSub = this.stesDataRestService
                    .getPersonenstammdatenById(stateObj.state.personStesId)
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(
                        response => {
                            if (response.data.stesID) {
                                this.redirectWithMessage = true;
                                this.wizardService.setFormIsDirty(false);
                                this.router.navigate([`stes/details/${response.data.stesID}/personalien`]);
                            } else {
                                this.moveNext(stateObj);
                                this.wizardService.validateStep(true);
                            }
                            this.spinnerService.deactivate(this.personenstammdatenSucheChannel);
                        },
                        () => {
                            this.spinnerService.deactivate(this.personenstammdatenSucheChannel);
                        }
                    );
            }
        }
    }

    setRequiredFields() {
        this.searchForm.valueChanges.subscribe(value => {
            if (value.zasvorname || value.geburtsdatum) {
                this.zasvorname.setValidators([Validators.required, TextValidator.validateTextWithAsterisk('invalidZasVornameEingabe')]);
                this.zasvorname.updateValueAndValidity({ onlySelf: true });
                this.geburtsdatum.setValidators([
                    Validators.required,
                    GeburtsdatumValidator.formatValidator,
                    GeburtsdatumValidator.anmeldungDateValidator,
                    GeburtsdatumValidator.dateSmallerThanTodayValidator,
                    GeburtsdatumValidator.dateMonthAndDayValidator,
                    GeburtsdatumValidator.dateAnmeldungValidator
                ]);
                this.geburtsdatum.updateValueAndValidity({ onlySelf: true });
            } else if (!value.zasvorname && !value.geburtsDatum) {
                this.clearValidators();
            }

            if (value.svnr) {
                this.zasvorname.disable({ onlySelf: true });
                this.geburtsdatum.disable({ onlySelf: true });
            } else {
                this.zasvorname.enable({ onlySelf: true });
                this.geburtsdatum.enable({ onlySelf: true });
            }
            this.disableSuchenButton();
        });
    }

    clearValidators() {
        if (this.zasvorname) {
            this.zasvorname.clearValidators();
            this.zasvorname.updateValueAndValidity({ onlySelf: true });
        }
        if (this.geburtsdatum) {
            this.geburtsdatum.clearValidators();
            this.geburtsdatum.updateValueAndValidity({ onlySelf: true });
        }
    }

    disableSuchenButton() {
        if (!this.zasvorname.value && !this.geburtsdatum.value && !this.svnr.value) {
            this.enableSuchen = false;
        } else if (this.zasvorname.valid && this.geburtsdatum.valid) {
            this.enableSuchen = true;
        } else if (this.zasvorname.disabled && this.geburtsdatum.disabled && this.svnr.valid) {
            this.enableSuchen = true;
        } else {
            this.enableSuchen = false;
        }
    }

    receiveData(personStesId) {
        const personenstammdatenObj = this.personenstammdatenDataFromBE.find(x => x.personStesId === personStesId);
        let stateObj: any;

        if (personenstammdatenObj) {
            stateObj = {
                state: {
                    namePersReg: personenstammdatenObj.namePersReg,
                    vornamePersReg: personenstammdatenObj.vornamePersReg,
                    geburtsDatum: personenstammdatenObj.geburtsDatum,
                    svNrFromZas: personenstammdatenObj.svNrFromZas,
                    zivilstandObject: personenstammdatenObj.zivilstandObject,
                    geschlechtObject: personenstammdatenObj.geschlechtObject,
                    nationalitaetObject: personenstammdatenObj.nationalitaetObject,
                    personStesId: personenstammdatenObj.personStesId,
                    istDatenschutz: personenstammdatenObj.istDatenschutz,
                    personenNr: personenstammdatenObj.personenNr,
                    versichertenNrList: personenstammdatenObj.versichertenNrList,
                    letzterZASAbgleich: personenstammdatenObj.letzterZASAbgleich,
                    istZASAbgleichErforderlich: personenstammdatenObj.istZASAbgleichErforderlich,
                    ahvAk: personenstammdatenObj.ahvAk,
                    ojbVersion: personenstammdatenObj.ojbVersion
                }
            };
        }

        this.callPersonenstammdaten(stateObj);
    }

    submitIfSuchenEnabled() {
        if (this.enableSuchen) {
            this.onSubmit();
        }
    }

    formatWithDots() {
        this.formUtils.formatDateWithDots(this.searchForm.controls.geburtsdatum);
    }

    protected getCacheState(): void {
        this.cache = this.stateService.restoreStateByKey(this.personenstammdatenSucheChannel) || {};

        if (this.cache && this.cache.sort) {
            this.defaultSort = this.cache.sort;
        } else {
            this.defaultSort = this.sort;
            this.cache.sort = this.defaultSort;
        }
    }

    protected hasNoCache(): boolean {
        return !this.cache;
    }

    protected moveNext(state, hasNoCache?) {
        this.wizardService.moveNext(state);
    }

    protected checkValueAndLength(field: any) {
        return field.value && field.value.length > 0;
    }

    protected checkIsNeuAnmeldung() {
        if (this.checkValueAndLength(this.searchForm.controls.zasvorname) && this.checkValueAndLength(this.searchForm.controls.geburtsdatum)) {
            this.isNeuanmeldungHidden = false;
            this.showInfoMessage = true;
        } else {
            this.isNeuanmeldungHidden = true;
            this.showInfoMessage = false;
        }
    }

    private getGeburtsdatum(): string {
        if (!this.searchForm.controls.geburtsdatum.value || this.searchForm.controls.geburtsdatum.value.length === 0) {
            return null;
        } else {
            const value: string = this.searchForm.controls.geburtsdatum.value;
            return StringHelper.replaceAll(value, '00.', '');
        }
    }
}
