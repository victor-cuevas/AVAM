import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@core/services/authentication.service';
import { Router } from '@angular/router';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { DateValidator } from '@shared/validators/date-validator';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { combineLatest, Subject } from 'rxjs';
import { KontrollperiodeSuchenParamDTO } from '@dtos/kontrollperiodeSuchenParamDTO';
import { StesAbmResponseDTO } from '@dtos/stesAbmResponseDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { BaseResponseWrapperListStesAbmResponseDTOWarningMessages } from '@dtos/baseResponseWrapperListStesAbmResponseDTOWarningMessages';
import { StesCommonSearchComponent } from '@shared/components/stes-common-search/stes-common-search.component';
// prettier-ignore
import {
    MassnahmenverantwortungBenutzerstelleSearchComponent
} from '@shared/components/massnahmenverantwortung-benutzerstelle-search/massnahmenverantwortung-benutzerstelle-search.component';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { FacadeService } from '@shared/services/facade.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-kontrollperioden-suchen',
    templateUrl: './kontrollperioden-stes-suchen.component.html',
    styleUrls: ['./kontrollperioden-stes-suchen.component.scss'],
    providers: [SearchSessionStorageService]
})
export class KontrollperiodenStesSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('baseSearchComponent') baseSearchComponent: StesCommonSearchComponent;
    @ViewChild('stesAutosuggestSearchComponent') stesAutosuggestSearchComponent: MassnahmenverantwortungBenutzerstelleSearchComponent;

    public statusOptionsLabels: any[] = [];
    public permissions: typeof Permissions = Permissions;

    public formConfiguration: {};
    public searchForm: FormGroup;
    dataSource = [];
    sortField = 'name';

    columns = [
        { columnDef: 'name', header: 'stes.label.kontrollperiode-suchen.name', cell: (element: any) => `${element.name}`, sortable: true },
        { columnDef: 'vorname', header: 'stes.label.kontrollperiode-suchen.vorname', cell: (element: any) => `${element.vorname}` },
        { columnDef: 'abmeldedatum', header: 'stes.label.kontrollperiode-suchen.abmeldedatum', cell: (element: any) => `${element.abmeldedatum}` },
        {
            columnDef: 'kontrollperiodesuchen',
            header: 'stes.label.kontrollperiode-suchen.kontrollperiode',
            cell: (element: any) => `${this.facadeService.formUtilsService.formatDateNgx(element.kontrollperiodesuchen, FormUtilsService.GUI_MONTH_DATE_FORMAT) || ''}`
        },
        { columnDef: 'status', header: 'stes.label.status', cell: (element: any) => `${element.status}` },
        { columnDef: 'eingangsdatum', header: 'stes.label.eingangsdatum', cell: (element: any) => `${element.eingangsdatum}` },
        { columnDef: 'scandatum', header: 'stes.label.kontrollperiode-suchen.scandatum', cell: (element: any) => `${element.scandatum}` },
        { columnDef: 'beurteilung', header: 'stes.label.beurteilung', cell: (element: any) => `${element.beurteilung}` },
        { columnDef: 'personalberater', header: 'common.label.personalberater', cell: (element: any) => `${element.personalberater}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    lastUpdate: any;

    private static cacheStateKey = 'kontrollperioden-search-cache';
    readonly stateKey = 'kontrollperioden-stes-suchen-stateKey';
    private statusValidationError: boolean;
    private checkboxValidationError: boolean;
    private unsubscribe$ = new Subject();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private dataService: StesDataRestService,
        private authenticationService: AuthenticationService,
        private fehlermeldungenService: FehlermeldungenService,
        private dbTranslateService: DbTranslateService,
        private searchSessionStorageService: SearchSessionStorageService,
        private facadeService: FacadeService
    ) {
        super();
    }

    static getPreviousMonthDate(): Date {
        return moment([new Date().getFullYear(), new Date().getMonth(), 1])
            .subtract(1, 'M')
            .toDate();
    }

    public ngOnInit(): void {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.onResetEvent());

        this.baseSearchComponent.manageSpinners(true, true);
        this.getData();
        this.generateForm();
        this.baseSearchComponent.manageSpinners(false, false);
    }

    ngAfterViewInit(): void {
        const state = this.searchSessionStorageService.restoreStateByKey(KontrollperiodenStesSuchenComponent.cacheStateKey);
        if (state) {
            this.searchForm.patchValue(state.fields);
            this.patchDateValues(state.fields);
            this.onSearchEvent(true);
        }
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        super.ngOnDestroy();
    }

    public onNavigationEvent(row: any) {
        ToolboxService.GESPEICHERTEN_LISTE_URL = this.router.url;
        this.router.navigate([`stes/details/${row.stesID}/kontrollperioden/bearbeiten`], {
            queryParams: { kontrollperiodeId: row.arbeitsbemuehungenID }
        });
    }

    onResetEvent(): void {
        this.searchForm.reset(this.formConfiguration);
        this.searchForm.controls['kontrollperiodeVon'].setValue(KontrollperiodenStesSuchenComponent.getPreviousMonthDate());
        this.searchForm.controls['kontrollperiodeBis'].setValue(KontrollperiodenStesSuchenComponent.getPreviousMonthDate());
        this.stesAutosuggestSearchComponent.setInitialBenutzerCode(this.authenticationService.getLoggedUser());
        this.fehlermeldungenService.closeMessage();

        this.dataSource = [];
        this.searchSessionStorageService.restoreDefaultValues(this.stateKey);
        this.baseSearchComponent.searchDone = false;

        this.searchForm.markAsPristine();
        this.searchForm.markAsUntouched();
    }

    public onSearchEvent(triggeredByStoredState?: boolean): void {
        this.checkBSP12Conditions();
        if (this.statusValidationError || this.checkboxValidationError) {
            OrColumnLayoutUtils.scrollTop();
        } else if (this.searchForm.valid) {
            if (!triggeredByStoredState) {
                this.storeState();
            }
            this.baseSearchComponent.searchDone = false;
            this.fehlermeldungenService.closeMessage();
            this.baseSearchComponent.manageSpinners(true);
            const searchDTO = this.mapToSearchDTO();
            this.dataService
                .searchKontrollperioden(searchDTO)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                    (response: BaseResponseWrapperListStesAbmResponseDTOWarningMessages) => {
                        this.lastUpdate = response.data;
                        this.setTableData(response.data);
                        OrColumnLayoutUtils.scrollTop();
                        this.baseSearchComponent.searchDone = true;
                        this.baseSearchComponent.manageSpinners(false);
                    },
                    () => {
                        OrColumnLayoutUtils.scrollTop();
                        this.baseSearchComponent.manageSpinners(false);
                        this.baseSearchComponent.searchDone = true;
                    }
                );
        } else {
            this.baseSearchComponent.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    public setTableData(data?: StesAbmResponseDTO[]) {
        if (data) {
            this.dataSource = data ? data.map((row, index) => this.createRow(row, index)) : [];
        } else {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        }
    }

    private mapToSearchDTO(): KontrollperiodeSuchenParamDTO {
        return {
            kontrollperiodeNichtErfasst: false,
            statusId: this.searchForm.controls['status'].value,
            vorArbeitslosigkeit: this.searchForm.controls['vorderarbeitslosigkeit'].value,
            waehrendArbeitslosigkeit: this.searchForm.controls['waehrendderarbeitslosigkeit'].value,
            kontrollPeriodeVon: this.searchForm.controls['kontrollperiodeVon'].value,
            kontrollPeriodeBis: this.getLastDayOfMonthDate(this.searchForm.controls['kontrollperiodeBis'].value),
            beurteilungGenuegend: this.searchForm.controls['genuegend'].value,
            beurteilungUngenuegend: this.searchForm.controls['ungenuegend'].value,
            beurteilungFehlenNichtKontrolliert: this.searchForm.controls['fehlennichtkontrolliert'].value,
            beurteilungFehlenKontrolliert: this.searchForm.controls['fehlenkontrolliert'].value,
            beurteilungVomNachweisBefreit: this.searchForm.controls['vomnachweisbefreit'].value,
            benutzerDetail: this.searchForm.controls.personalberater.value ? this.searchForm.controls.personalberater['benutzerObject'] : null,
            benutzerstelleCode: this.stesAutosuggestSearchComponent.benutzerCode
        };
    }

    private getLastDayOfMonthDate(date: Date): Date {
        return moment(date)
            .endOf('month')
            .toDate();
    }

    private createRow(responseDTO: StesAbmResponseDTO, index: number) {
        moment.locale(this.dbTranslateService.getCurrentLang());
        const abmeldedatum = responseDTO.stesAbmeldungDatumRAV || '';
        const kontrollperiodesuchen = responseDTO.datumKontrollPeriode;
        const status = this.dbTranslateService.translate(responseDTO.statusObject, 'kurzText');
        const eingangsdatum = responseDTO.datumEingang || '';
        const scandatum = responseDTO.datumScan || '';

        return {
            id: index,
            name: responseDTO.stesName,
            vorname: responseDTO.stesVorname,
            abmeldedatum,
            kontrollperiodesuchen,
            status,
            eingangsdatum,
            scandatum,
            beurteilung:
                responseDTO[
                    `beurteilungAbmKurztext${this.facadeService.translateService.currentLang[0].toUpperCase() + this.facadeService.translateService.currentLang[1].toUpperCase()}`
                ],
            personalberater: this.getPersonalberaterCellContent(responseDTO),
            stesID: responseDTO.stesID,
            arbeitsbemuehungenID: responseDTO.arbeitsbemuehungenID
        };
    }

    private getData(): void {
        this.baseSearchComponent.manageSpinners(true);
        this.dataService
            .getCode(DomainEnum.STATUS_ARBEITSBEMUEHUNG)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (stesStatus: CodeDTO[]) => {
                    this.statusOptionsLabels = this.facadeService.formUtilsService.mapDropdownKurztext(stesStatus);
                    this.baseSearchComponent.manageSpinners(false);
                },
                () => {
                    this.baseSearchComponent.manageSpinners(false);
                }
            );
    }

    private generateForm(): void {
        this.formConfiguration = {
            status: null,
            vorderarbeitslosigkeit: false,
            waehrendderarbeitslosigkeit: true,
            kontrollperiodeVon: KontrollperiodenStesSuchenComponent.getPreviousMonthDate(),
            kontrollperiodeBis: KontrollperiodenStesSuchenComponent.getPreviousMonthDate(),
            genuegend: false,
            ungenuegend: false,
            fehlennichtkontrolliert: true,
            fehlenkontrolliert: false,
            vomnachweisbefreit: false,
            personalberater: null,
            benutzerstellenId: null
        };

        this.searchForm = this.fb.group(this.formConfiguration, {
            validator: DateValidator.rangeBetweenDates('kontrollperiodeVon', 'kontrollperiodeBis', 'val201')
        });

        this.setControlValueAndValidators('kontrollperiodeVon');
        this.setControlValueAndValidators('kontrollperiodeBis');
        this.atLeastOneOfTheBeurteilungValuesIsChecked();
    }

    private setControlValueAndValidators(controlName: string): void {
        const control = this.searchForm.controls[controlName];
        control.setValidators([Validators.required, DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]);
        control.updateValueAndValidity();
    }

    private checkBSP12Conditions(): void {
        this.fehlermeldungenService.deleteMessage('stes.message.abmsuchenstatus', 'danger');
        if (
            !moment(this.searchForm.controls['kontrollperiodeVon'].value).isSame(moment(this.searchForm.controls['kontrollperiodeBis'].value)) &&
            !!this.searchForm.controls['status'].value
        ) {
            this.fehlermeldungenService.showMessage('stes.message.abmsuchenstatus', 'danger');
            this.statusValidationError = true;
        } else {
            this.statusValidationError = false;
        }
    }

    private atLeastOneOfTheBeurteilungValuesIsChecked(): void {
        const beurteilungControlNames = ['genuegend', 'ungenuegend', 'fehlennichtkontrolliert', 'fehlenkontrolliert', 'vomnachweisbefreit'];

        const beurteilungControlObservables = [];
        beurteilungControlNames.forEach((value: string) => beurteilungControlObservables.push(this.searchForm.controls[value].valueChanges));

        combineLatest(beurteilungControlObservables)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                if (beurteilungControlNames.filter(controlName => this.searchForm.controls[controlName].value).length === 0) {
                    this.fehlermeldungenService.showMessage('stes.message.abmsuchenkeinecheckbox', 'danger');
                    this.checkboxValidationError = true;
                } else {
                    this.fehlermeldungenService.deleteMessage('stes.message.abmsuchenkeinecheckbox', 'danger');
                    this.checkboxValidationError = false;
                }
            });
    }

    private storeState() {
        const storage: any = this.searchForm.value;
        if (storage.personalberater && typeof storage.personalberater === 'string') {
            storage.personalberater = this.getPersonalberaterValue(this.searchForm.controls['personalberater']);
        }
        this.searchSessionStorageService.storeFieldsByKey(KontrollperiodenStesSuchenComponent.cacheStateKey, storage);
    }

    private getPersonalberaterValue(control: AbstractControl): any {
        if (control.value) {
            return control['benutzerObject'];
        }
        return null;
    }

    private patchDateValues(fields: any) {
        if (fields.kontrollperiodeVon) {
            this.searchForm.controls.kontrollperiodeVon.setValue(new Date(fields.kontrollperiodeVon));
        }
        if (fields.kontrollperiodeBis) {
            this.searchForm.controls.kontrollperiodeBis.setValue(new Date(fields.kontrollperiodeBis));
        }
    }

    private getPersonalberaterCellContent(responseDTO: StesAbmResponseDTO): string {
        return responseDTO.personalberaterID
            ? `${responseDTO.personalberaterName} ${responseDTO.personalberaterVorname} (${responseDTO.personalberaterLogin} ${responseDTO.personalberaterBenutzerstelle})`
            : responseDTO.sachbearbeiterID
            ? `${responseDTO.sachbearbeiterName} ${responseDTO.sachbearbeiterVorname} (${responseDTO.sachbearbeiterLogin} ${responseDTO.sachbearbeiterBenutzerstelle})`
            : '';
    }
}
