import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@core/services/authentication.service';
import { Router } from '@angular/router';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { takeUntil } from 'rxjs/operators';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { DateValidator } from '@shared/validators/date-validator';
import { ToolboxService } from '@app/shared';
import { Subject } from 'rxjs';
import { KontrollperiodeSuchenParamDTO } from '@dtos/kontrollperiodeSuchenParamDTO';
import { StesAbmResponseDTO } from '@dtos/stesAbmResponseDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { BaseResponseWrapperListStesAbmResponseDTOWarningMessages } from '@dtos/baseResponseWrapperListStesAbmResponseDTOWarningMessages';
import { KontrollperiodenStesSuchenComponent } from '@stes/pages/kontrollperioden/kontrollperioden-stes-suchen/kontrollperioden-stes-suchen.component';
import { StesCommonSearchComponent } from '@shared/components/stes-common-search/stes-common-search.component';
// prettier-ignore
import {
    MassnahmenverantwortungBenutzerstelleSearchComponent
} from '@shared/components/massnahmenverantwortung-benutzerstelle-search/massnahmenverantwortung-benutzerstelle-search.component';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { Unsubscribable } from 'oblique-reactive';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-fehlender-kontrollperioden-stes-suchen',
    templateUrl: './fehlender-kontrollperioden-stes-suchen.component.html',
    styleUrls: ['./fehlender-kontrollperioden-stes-suchen.component.scss'],
    providers: [SearchSessionStorageService]
})
export class FehlenderKontrollperiodenStesSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('baseSearchComponent') baseSearchComponent: StesCommonSearchComponent;
    @ViewChild('stesAutosuggestSearchComponent') stesAutosuggestSearchComponent: MassnahmenverantwortungBenutzerstelleSearchComponent;
    readonly stateKey = 'fehlender-kontrollperioden-stes-suchen-stateKey';
    public permissions: typeof Permissions = Permissions;

    public searchForm: FormGroup;
    dataSource = [];
    sortField = 'name';
    columns = [
        {
            columnDef: 'name',
            header: 'stes.label.kontrollperiode-suchen.name',
            cell: (element: any) => `${element.name}`,
            sortable: true
        },
        {
            columnDef: 'vorname',
            header: 'stes.label.kontrollperiode-suchen.vorname',
            cell: (element: any) => `${element.vorname}`
        },
        {
            columnDef: 'abmeldedatum',
            header: 'stes.label.kontrollperiode-suchen.abmeldedatum',
            cell: (element: any) => `${element.abmeldedatum}`
        },
        {
            columnDef: 'personalberater',
            header: 'common.label.personalberater',
            cell: (element: any) => `${element.personalberater}`
        },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    lastUpdate: StesAbmResponseDTO[];
    private static cacheStateKey = 'fehlender-kontrollperioden-search-cache';
    private unsubscribe$ = new Subject();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private dataService: StesDataRestService,
        private authenticationService: AuthenticationService,
        private fehlermeldungenService: FehlermeldungenService,
        private searchSessionStorageService: SearchSessionStorageService
    ) {
        super();
    }

    public ngOnInit(): void {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.onResetEvent());

        this.baseSearchComponent.manageSpinners(true, true);

        this.generateForm();

        this.baseSearchComponent.manageSpinners(false, false);
    }

    ngAfterViewInit(): void {
        const state = this.searchSessionStorageService.restoreStateByKey(FehlenderKontrollperiodenStesSuchenComponent.cacheStateKey);
        if (state) {
            this.searchForm.patchValue(state.fields);
            this.patchDateValue(state.fields);
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
        this.router.navigate([`stes/details/${row.stesID}/kontrollperioden`]);
    }

    onResetEvent() {
        this.searchForm.reset();
        this.searchForm.controls['kontrollperiode'].setValue(KontrollperiodenStesSuchenComponent.getPreviousMonthDate());
        this.stesAutosuggestSearchComponent.setInitialBenutzerCode(this.authenticationService.getLoggedUser());
        this.fehlermeldungenService.closeMessage();

        this.dataSource = [];
        this.searchSessionStorageService.restoreDefaultValues(this.stateKey);
        this.baseSearchComponent.searchDone = false;

        this.searchForm.markAsPristine();
        this.searchForm.markAsUntouched();
    }

    public onSearchEvent(triggeredByStoredState?: boolean): void {
        if (this.searchForm.valid) {
            if (!triggeredByStoredState) {
                this.storeState();
            }
            this.baseSearchComponent.searchDone = false;
            this.fehlermeldungenService.closeMessage();
            const searchDTO = this.mapToSearchDTO();
            this.baseSearchComponent.manageSpinners(true);
            this.dataService
                .searchKontrollperioden(searchDTO)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                    (response: BaseResponseWrapperListStesAbmResponseDTOWarningMessages) => {
                        this.lastUpdate = response.data;
                        this.setTableData(response.data);
                        this.baseSearchComponent.manageSpinners(false);
                        this.baseSearchComponent.searchDone = true;
                    },
                    () => {
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

    public setTableData(data?: StesAbmResponseDTO[]): void {
        if (data) {
            this.dataSource = data ? data.map((row, index) => this.createRow(row, index)) : [];
        } else {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        }
    }

    private mapToSearchDTO(): KontrollperiodeSuchenParamDTO {
        return {
            kontrollperiodeNichtErfasst: true,
            kontrollPeriode: this.searchForm.controls['kontrollperiode'].value,
            benutzerDetail: this.getCorrectPersonalberaterValue(),
            benutzerstelleCode: this.stesAutosuggestSearchComponent.benutzerCode
        };
    }

    private createRow(responseDTO: StesAbmResponseDTO, index: number) {
        const abmeldedatum = responseDTO.stesAbmeldungDatumRAV || '';
        return {
            id: index,
            name: responseDTO.stesName,
            vorname: responseDTO.stesVorname,
            abmeldedatum,
            personalberater: `${responseDTO.sachbearbeiterName} ${responseDTO.sachbearbeiterVorname} (${responseDTO.sachbearbeiterLogin})`,
            stesID: responseDTO.stesID
        };
    }

    private generateForm(): void {
        this.searchForm = this.fb.group({
            kontrollperiode: [
                KontrollperiodenStesSuchenComponent.getPreviousMonthDate(),
                [Validators.required, DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]
            ],
            personalberater: null,
            benutzerstellenId: null
        });
    }

    private storeState() {
        const storage: any = this.searchForm.value;
        storage.personalberater = this.getCorrectPersonalberaterValue();
        this.searchSessionStorageService.storeFieldsByKey(FehlenderKontrollperiodenStesSuchenComponent.cacheStateKey, storage);
    }

    private getCorrectPersonalberaterValue(): any {
        const value = this.searchForm.controls.personalberater.value;
        if (value && typeof value === 'string') {
            return this.searchForm.controls.personalberater['benutzerObject'];
        }
        return value ? value : null;
    }

    private patchDateValue(fields: any) {
        if (fields.kontrollperiode) {
            this.searchForm.controls.kontrollperiode.setValue(new Date(fields.kontrollperiode));
        }
    }
}
