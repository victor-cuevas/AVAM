import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StesCommonSearchComponent } from '@shared/components/stes-common-search/stes-common-search.component';
import { NumberValidator } from '@shared/validators/number-validator';
import { Permissions } from '@shared/enums/permissions.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { BaseResponseWrapperListAmmGeschaeftHandleDTOWarningMessages } from '@dtos/baseResponseWrapperListAmmGeschaeftHandleDTOWarningMessages';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { Router } from '@angular/router';
import { AmmMassnahmenCode as AmmMassCode } from '@shared/enums/domain-code/amm-massnahmen-code.enum';
import { AmmVierAugenStatusCode } from '@shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { AMMPaths } from '@shared/enums/stes-navigation-paths.enum';
import { AmmGeschaeftHandleDTO } from '@dtos/ammGeschaeftHandleDTO';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-amm-geschaeft-suchen',
    templateUrl: './amm-geschaeft-suchen.component.html',
    styleUrls: ['./amm-geschaeft-suchen.component.scss']
})
export class AmmGeschaeftSuchenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('baseSearchComponent') baseSearchComponent: StesCommonSearchComponent;

    public permissions: typeof Permissions = Permissions;

    readonly cacheStateKey = 'amm-geschaefte-stes-search-cache';
    readonly stateKey = 'amm-geschaefte-stes-suchen-stateKey';
    dataSource = [];
    sortField = 'namevorname';

    columns = [
        { columnDef: 'namevorname', header: 'stes.label.nameVorname', cell: (element: any) => `${element.namevorname}`, sortable: true },
        { columnDef: 'personennr', header: 'stes.label.personennr', cell: (element: any) => `${element.personennr}`, sortable: true },
        { columnDef: 'massnahme', header: 'amm.suchen.table.massnahme', cell: (element: any) => `${element.massnahme}`, sortable: true },
        { columnDef: 'bearbeitung', header: 'amm.suchen.table.bearbeitung', cell: (element: any) => `${element.bearbeitung}`, sortable: true },
        { columnDef: 'entscheidart', header: 'stes.label.ammentscheidart', cell: (element: any) => `${element.entscheidart}`, sortable: true },
        { columnDef: 'status', header: 'stes.label.status', cell: (element: any) => `${element.status}`, sortable: true },
        { columnDef: 'aktualisiertam', header: 'common.label.geaendertam', cell: (element: any) => `${element.aktualisiertam}`, sortable: true },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    public searchButtonDisabled = true;
    public searchForm: FormGroup;
    lastUpdate: any;

    private searchType: string;
    private unsubscribe$ = new Subject();

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private dataRestService: StesDataRestService,
        private searchSessionService: SearchSessionStorageService
    ) {
        super();
    }

    static isTypeSpeziell(type: string): boolean {
        return type === AmmMassCode.AZ || type === AmmMassCode.EAZ || type === AmmMassCode.FSE || type === AmmMassCode.PEWO;
    }

    static isTypePsAk(type: string): boolean {
        return type === AmmMassCode.BP || type === AmmMassCode.AP || type === AmmMassCode.UEF || type === AmmMassCode.PVB || type === AmmMassCode.SEMO;
    }

    static setBuchungNavigationRoute(mCode: string, stesId: number): string {
        if (mCode === AmmMassCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            return `stes/details/${stesId}/amm/uebersicht/${AmmMassCode.INDIVIDUELL_KURS_IM_ANGEBOT}/buchung-angebot`;
        } else if (mCode === AmmMassCode.KURS) {
            return `stes/details/${stesId}/amm/uebersicht/${AmmMassCode.KURS}/buchung-kollektiv`;
        } else if (AmmGeschaeftSuchenComponent.isTypePsAk(mCode)) {
            return `stes/details/${stesId}/amm/uebersicht/${mCode}/buchung-psak`;
        } else {
            return `stes/details/${stesId}/amm/uebersicht/${mCode}/buchung-individuell`;
        }
    }

    public ngOnInit(): void {
        this.generateForm();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.onResetEvent());
    }

    public ngAfterViewInit(): void {
        const state = this.searchSessionService.restoreStateByKey(this.cacheStateKey);
        if (state) {
            this.searchForm.patchValue(state.fields);
            this.onSearchEvent();
        }
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        super.ngOnDestroy();
    }

    public onNavigationEvent(row: any) {
        const geschaeftsfallId = row.geschaeftsfallId;
        const entscheidId = row.entscheidId;
        const mCode = row.mCode;
        const stesId = row.stesId;
        const gesuchBuchung = row.gesuchBuchung;
        let navRoute;

        if ('entscheidNr' === this.searchType) {
            if (AmmGeschaeftSuchenComponent.isTypeSpeziell(mCode)) {
                navRoute = `stes/details/${stesId}/amm/uebersicht/${mCode}/speziell-entscheid`;
            } else {
                navRoute = `stes/details/${stesId}/amm/uebersicht/${mCode}/bim-bem-entscheid`;
            }
        } else if ('basisNr' === this.searchType) {
            if (row.isStatusAktuellenEntscheidesPendent) {
                if (AmmGeschaeftSuchenComponent.isTypeSpeziell(mCode)) {
                    navRoute = `stes/details/${stesId}/${AMMPaths.UEBERSICHT}/${mCode}/gesuch`;
                } else {
                    navRoute = AmmGeschaeftSuchenComponent.setBuchungNavigationRoute(mCode, stesId);
                }
            } else {
                navRoute = `stes/details/${stesId}/${AMMPaths.UEBERSICHT}/${mCode}/speziell-entscheid`;
            }
        } else if (gesuchBuchung) {
            if (AmmGeschaeftSuchenComponent.isTypeSpeziell(mCode)) {
                navRoute = `stes/details/${stesId}/${AMMPaths.UEBERSICHT}/${mCode}/gesuch`;
            } else {
                navRoute = AmmGeschaeftSuchenComponent.setBuchungNavigationRoute(mCode, stesId);
            }
        } else {
            if (AmmGeschaeftSuchenComponent.isTypeSpeziell(mCode)) {
                if (row.isStatusAktuellenEntscheidesPendent) {
                    navRoute = `stes/details/${stesId}/${AMMPaths.UEBERSICHT}/${mCode}/gesuch`;
                } else {
                    navRoute = `stes/details/${stesId}/${AMMPaths.UEBERSICHT}/${mCode}/speziell-entscheid`;
                }
            } else {
                navRoute = `stes/details/${stesId}/${AMMPaths.UEBERSICHT}/${mCode}/bim-bem-entscheid`;
            }
        }

        this.router.navigate([navRoute], { queryParams: { gfId: geschaeftsfallId, entscheidId } });
    }

    public onResetEvent(): void {
        this.searchForm.reset();
        this.searchButtonDisabled = true;
        this.fehlermeldungenService.closeMessage();

        this.dataSource = [];
        this.searchSessionService.restoreDefaultValues(this.stateKey);
        this.baseSearchComponent.searchDone = false;
    }

    public onSearchEvent(): void {
        this.fehlermeldungenService.closeMessage();
        if (this.searchForm.valid) {
            this.storeState();
            this.baseSearchComponent.searchDone = false;
            const searchNr = this.getSearchParam();
            if (!!searchNr) {
                this.baseSearchComponent.manageSpinners(true);
                this.dataRestService
                    .searchAmmGeschaefteByNr(this.searchType, searchNr)
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe(
                        (response: BaseResponseWrapperListAmmGeschaeftHandleDTOWarningMessages) => {
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
            }
        } else {
            this.baseSearchComponent.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private storeState() {
        const storage: any = this.searchForm.value;
        this.searchSessionService.storeFieldsByKey(this.cacheStateKey, storage);
    }

    public setTableData(data?: AmmGeschaeftHandleDTO[]): void {
        if (data) {
            this.dataSource = data ? data.map((row, index) => this.createRow(row, index)) : [];
        } else {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        }
    }

    private getSearchParam(): string {
        let searchParam: string;
        const controlsWithValidValues = Object.keys(this.searchForm.controls).filter((controlName: string) => {
            const control = this.searchForm.controls[controlName];
            return !!control.value && control.value !== '' && control.valid;
        });

        if (controlsWithValidValues.length === 1) {
            this.searchType = controlsWithValidValues[0];
            searchParam = this.searchForm.controls[controlsWithValidValues[0]].value;
        }
        return searchParam;
    }

    private createRow(responseDTO: AmmGeschaeftHandleDTO, index: number) {
        const namevorname = `${responseDTO.stesName}, ${responseDTO.stesVorname}`;
        const massnahme = this.dbTranslateService.translate(responseDTO.massnahmenTyp, 'kurzText') || '';
        const entscheidart = this.dbTranslateService.translate(responseDTO.entscheidart, 'kurzText') || '';
        const status = this.dbTranslateService.translate(responseDTO.statusCode, 'kurzText') || '';
        const isStatusAktuellenEntscheidesPendent = responseDTO.statusAktuellenEntscheides.code === AmmVierAugenStatusCode.PENDENT;
        const aktualisiertam = responseDTO.aktualisiertAm || '';
        const bearbeitung = responseDTO.entscheidungDurchDetail;
        const bearbeitungDetail =
            !!bearbeitung && !!bearbeitung.benutzerLogin && !!bearbeitung.nachname && !!bearbeitung.vorname && bearbeitung.benuStelleCode
                ? `${bearbeitung.benutzerLogin} ${bearbeitung.nachname}, ${bearbeitung.vorname} ${bearbeitung.benuStelleCode}`
                : '';
        const geschaeftsfallId = responseDTO.geschaeftsfallId;
        const entscheidId = responseDTO.entscheidId;
        const mCode = responseDTO.massnahmenTyp.code;
        const stesId = responseDTO.stesId;
        const gesuchBuchung = responseDTO.gesuchBuchung;

        return {
            id: index,
            namevorname,
            personennr: responseDTO.personenNr,
            vorname: responseDTO.stesVorname,
            massnahme,
            bearbeitung: bearbeitungDetail,
            entscheidart,
            status,
            aktualisiertam,
            geschaeftsfallId,
            entscheidId,
            mCode,
            stesId,
            gesuchBuchung,
            isStatusAktuellenEntscheidesPendent
        };
    }

    private generateForm(): void {
        this.searchForm = this.fb.group({
            entscheidNr: [null, NumberValidator.checkValueConsistsOnNineNumbers],
            gesuchsNr: [null, NumberValidator.checkValueConsistsOnNineNumbers],
            buchungsNr: [null, NumberValidator.checkValueConsistsOnNineNumbers],
            basisNr: [null, NumberValidator.checkValueConsistsOnNineNumbers]
        });

        const formControlNames = Object.keys(this.searchForm.controls);
        this.searchForm.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            const emptyFields = formControlNames.filter((controlName: string) => {
                const controlValue = this.searchForm.controls[controlName].value;
                return !controlValue || controlValue === '';
            });

            emptyFields.forEach(
                emptyFields.length === formControlNames.length
                    ? (controlName: string) => {
                          this.searchForm.controls[controlName].enable({ emitEvent: false });
                          this.searchButtonDisabled = true;
                      }
                    : (controlName: string) => {
                          this.searchForm.controls[controlName].disable({ emitEvent: false });
                          this.searchButtonDisabled = false;
                      }
            );
        });
    }
}
