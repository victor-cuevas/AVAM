import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Permissions } from '@shared/enums/permissions.enum';
import { StesCommonSearchComponent } from '@shared/components/stes-common-search/stes-common-search.component';
import { Subject } from 'rxjs';
import { AuthenticationService } from '@core/services/authentication.service';
import { GeKoAbzumeldendeStesSearchResponseDTO } from '@dtos/geKoAbzumeldendeStesSearchResponseDTO';
import { GeKoAbzumeldendeStesSearchParamsDTO } from '@dtos/geKoAbzumeldendeStesSearchParamsDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { takeUntil } from 'rxjs/operators';
import { BaseResponseWrapperListGeKoAbzumeldendeStesSearchResponseDTOWarningMessages } from '@dtos/baseResponseWrapperListGeKoAbzumeldendeStesSearchResponseDTOWarningMessages';
import { DateValidator } from '@shared/validators/date-validator';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { Router } from '@angular/router';
//prettier-ignore
import {
    MassnahmenverantwortungBenutzerstelleSearchComponent
} from '@shared/components/massnahmenverantwortung-benutzerstelle-search/massnahmenverantwortung-benutzerstelle-search.component';
import * as moment from 'moment';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { Unsubscribable } from 'oblique-reactive';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-geko-abzumeldende-search',
    templateUrl: './geko-abzumeldende-search.component.html',
    styleUrls: ['./geko-abzumeldende-search.component.scss']
})
export class GekoAbzumeldendeSearchComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    static readonly CACHE_STATE_KEY = 'geko-abzumeldende-search-cache-state-key';
    static readonly TABLE_STATE_KEY = 'geko-abzumeldende-search-table-state-key';
    @ViewChild('baseSearchComponent') baseSearchComponent: StesCommonSearchComponent;
    @ViewChild('stesAutosuggestSearchComponent') stesAutosuggestSearchComponent: MassnahmenverantwortungBenutzerstelleSearchComponent;

    public permissions: typeof Permissions = Permissions;
    stateKey = GekoAbzumeldendeSearchComponent.TABLE_STATE_KEY;
    public searchForm: FormGroup;
    lastUpdate: any;

    dataSource = [];
    sortField = 'letzteAktualisierung';
    columns = [
        { columnDef: 'stesID', header: 'stes.label.stesid', cell: (element: any) => `${element.stesID}` },
        { columnDef: 'name', header: 'unternehmen.label.name', cell: (element: any) => `${element.name}` },
        { columnDef: 'vorname', header: 'unternehmen.label.vorname', cell: (element: any) => `${element.vorname}` },
        { columnDef: 'letzteAktualisierung', header: 'common.label.letzteaktualisierung', cell: (element: any) => `${element.letzteAktualisierung}`, sortable: true },
        { columnDef: 'geschaeftsbereich', header: 'geko.label.geschaeftsbereich', cell: (element: any) => `${element.geschaeftsbereich}` },
        { columnDef: 'personalberater', header: 'geko.label.istBerater', cell: (element: any) => `${element.personalberater}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    private unsubscribe$ = new Subject();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private dbTranslateService: DbTranslateService,
        private stesDataRestService: StesDataRestService,
        private fehlermeldungenService: FehlermeldungenService,
        private authenticationService: AuthenticationService,
        private searchSession: SearchSessionStorageService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.baseSearchComponent.manageSpinners(true, true);
        this.generateForm();
        this.baseSearchComponent.manageSpinners(false, false);
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.onResetEvent());
    }

    public ngAfterViewInit(): void {
        const state = this.searchSession.restoreStateByKey(GekoAbzumeldendeSearchComponent.CACHE_STATE_KEY);

        if (state) {
            this.searchForm.patchValue({
                bearbeitetVon: state.fields['bearbeitetVon'] ? new Date(state.fields['bearbeitetVon']) : null,
                bearbeitetBis: state.fields['bearbeitetBis'] ? new Date(state.fields['bearbeitetBis']) : null,
                personalberater: state.fields['personalberater'],
                benutzerstellenId: state.fields['benutzerstellenId']
            });
            setTimeout(() => {
                this.onSearchEvent();
            }, 100);
        } else {
            this.setCurrentLoggedUserForAutosuggestDto();
        }
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        super.ngOnDestroy();
    }

    public onResetEvent(): void {
        this.searchForm.reset();
        this.setCurrentLoggedUserForAutosuggestDto();
        this.stesAutosuggestSearchComponent.setInitialBenutzerCode(this.authenticationService.getLoggedUser());
        this.searchForm.markAsPristine();
        this.searchForm.markAsUntouched();
        this.searchSession.clearStorageByKey(GekoAbzumeldendeSearchComponent.CACHE_STATE_KEY);
        this.dataSource = [];
        this.baseSearchComponent.searchDone = false;
        this.searchSession.restoreDefaultValues(this.stateKey);
    }

    public onSearchEvent(): void {
        this.fehlermeldungenService.closeMessage();
        if (this.searchForm.valid) {
            const searchDTO = this.mapToDTO();
            this.baseSearchComponent.searchDone = false;
            this.baseSearchComponent.manageSpinners(true);
            this.stesDataRestService
                .searchAbzumeldendeStes(searchDTO)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                    (response: BaseResponseWrapperListGeKoAbzumeldendeStesSearchResponseDTOWarningMessages) => {
                        const storage = {
                            bearbeitetVon: this.searchForm.get('bearbeitetVon').value,
                            bearbeitetBis: this.searchForm.get('bearbeitetBis').value,
                            personalberater:
                                this.searchForm.get('personalberater')['benutzerObject'].benutzerId !== -1 ? this.searchForm.get('personalberater')['benutzerObject'] : null,
                            benutzerstellenId: this.searchForm.get('benutzerstellenId')['benutzerstelleObject'].code
                        };
                        this.lastUpdate = response.data;
                        this.searchSession.storeFieldsByKey(GekoAbzumeldendeSearchComponent.CACHE_STATE_KEY, storage);
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

    public onNavigationEvent(row: any) {
        this.router.navigate([`stes/details/${row.stesId}/personalien`]);
    }

    public setTableData(data?: GeKoAbzumeldendeStesSearchResponseDTO[]) {
        if (data) {
            this.dataSource = data ? data.map((row, index) => this.createRow(row, index)) : [];
        } else {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        }
    }

    private mapToDTO(): GeKoAbzumeldendeStesSearchParamsDTO {
        return {
            erstelltVon: this.getValueDate(this.searchForm.controls['bearbeitetVon'].value),
            erstelltBis: this.getValueDate(this.searchForm.controls['bearbeitetBis'].value),
            benutzerDetail: this.searchForm.controls.personalberater.value ? this.searchForm.controls.personalberater['benutzerObject'] : null,
            benutzerstelleCode: this.stesAutosuggestSearchComponent.benutzerCode
        };
    }

    private getValueDate(value: any): Date {
        if (value instanceof Date) {
            return value;
        } else {
            const momentDate = moment(value, ['DD-MM-YYYY']);
            return momentDate.toDate();
        }
    }

    private createRow(responseDTO: GeKoAbzumeldendeStesSearchResponseDTO, index: number) {
        const letzteAktualisierung = responseDTO.tstLetzteAenderung || '';
        const geschaeftsbereich = this.dbTranslateService.translate(responseDTO.geschaeftsbereich, 'text') || '';
        const personalberater =
            responseDTO.personalberaterName && responseDTO.personalberaterVorname && responseDTO.personalberaterLogin && responseDTO.benuStelleCode
                ? `${responseDTO.personalberaterName}, ${responseDTO.personalberaterVorname} (${responseDTO.personalberaterLogin} ${responseDTO.benuStelleCode})`
                : '';

        return {
            id: index,
            stesID: responseDTO.stesIdAVAM,
            name: responseDTO.stesName,
            vorname: responseDTO.stesVorname,
            letzteAktualisierung,
            geschaeftsbereich,
            personalberater,
            stesId: responseDTO.stesId
        };
    }

    private generateForm(): void {
        this.searchForm = this.fb.group(
            {
                benutzerstellenId: null,
                bearbeitetVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                bearbeitetBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                personalberater: null
            },
            {
                validator: DateValidator.rangeBetweenDates('bearbeitetVon', 'bearbeitetBis', 'val201')
            }
        );
    }

    private setCurrentLoggedUserForAutosuggestDto() {
        const currentUser = this.authenticationService.getLoggedUser();

        const currentLoggedUserForAutosuggestDto = {
            benutzerLogin: currentUser.benutzerLogin,
            nachname: currentUser.name,
            vorname: currentUser.vorname,
            benuStelleCode: currentUser.benutzerstelleCode,
            benutzerId: currentUser.benutzerId,
            benutzerDetailId: currentUser.benutzerDetailId
        };

        this.stesAutosuggestSearchComponent.updatePersonalberater(currentLoggedUserForAutosuggestDto);
        this.searchForm.controls['personalberater'].setValue(currentLoggedUserForAutosuggestDto);
    }
}
