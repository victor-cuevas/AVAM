import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@app/shared/services/handle-error.function';
import { Observable } from 'rxjs';
import { BudgetSuchenParamDTO } from '@app/shared/models/dtos-generated/budgetSuchenParamDTO';
import { BaseResponseWrapperListBudgetDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListBudgetDTOWarningMessages';
import { BaseResponseWrapperBudgetDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperBudgetDTOWarningMessages';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { BaseResponseWrapperElementKategorieDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperElementKategorieDTOWarningMessages';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { BaseResponseWrapperAmmStrukturAggregatDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmStrukturAggregatDTOWarningMessages';
import { BudgetDTO } from '@app/shared/models/dtos-generated/budgetDTO';
import { BaseResponseWrapperListTeilBudgetDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListTeilBudgetDTOWarningMessages';
import { BaseResponseWrapperTeilBudgetDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperTeilBudgetDTOWarningMessages';
import { BaseResponseWrapperListeKopieParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListeKopieParamDTOWarningMessages';
import { ListeKopieParamDTO } from '@app/shared/models/dtos-generated/listeKopieParamDTO';
import { BaseResponseWrapperListKantonDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListKantonDTOWarningMessages';
import { TeilbudgetErstellenParamDTO } from '@app/shared/models/dtos-generated/teilbudgetErstellenParamDTO';
import { TeilbudgetSuchenParamDTO } from '@app/shared/models/dtos-generated/teilbudgetSuchenParamDTO';
import { AmmStrukturAggregatDTO } from '@app/shared/models/dtos-generated/ammStrukturAggregatDTO';
import { TeilbudgetStrukturWrapperDTO } from '@app/shared/models/dtos-generated/teilbudgetStrukturWrapperDTO';

@Injectable()
export class AmmBudgetierungRestService {
    constructor(private http: HttpClient) {}

    search(param: BudgetSuchenParamDTO): Observable<BaseResponseWrapperListBudgetDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListBudgetDTOWarningMessages>(setBaseUrl('/rest/amm/budgetierung/budget/search'), param).pipe(catchError(handleError));
    }

    createNewBudget(year: number, locale: string): Observable<BaseResponseWrapperListeKopieParamDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListeKopieParamDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/new/year/${year}/${locale}`), null)
            .pipe(catchError(handleError));
    }

    copyBudget(budgetId: number, year: number, locale: string): Observable<BaseResponseWrapperListeKopieParamDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListeKopieParamDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/${budgetId}/new/year/${year}/${locale}`), null)
            .pipe(catchError(handleError));
    }

    getBudget(budgetId: number): Observable<BaseResponseWrapperBudgetDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/${budgetId}`)).pipe(catchError(handleError));
    }

    getBudgetStruktur(budgetId: number): Observable<BaseResponseWrapperAmmStrukturAggregatDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmStrukturAggregatDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/${budgetId}/struktur`))
            .pipe(catchError(handleError));
    }

    getAvailableStati(statuscode: string): Observable<BaseResponseWrapperListCodeDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListCodeDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/status/${statuscode}/stati`)).pipe(catchError(handleError));
    }

    getAvailableActionButtons(budgetId: number, statuscode: string): Observable<BaseResponseWrapperListButtonsEnumWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListButtonsEnumWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/${budgetId}/status/${statuscode}/buttons`))
            .pipe(catchError(handleError));
    }

    getElementkategorieByOrganisation(organisation: string): Observable<BaseResponseWrapperElementKategorieDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperElementKategorieDTOWarningMessages>(setBaseUrl(`/rest/amm/administration/elementkategorie/${organisation}`))
            .pipe(catchError(handleError));
    }

    exportBudget(budgetId: number): Observable<HttpResponse<Blob>> {
        return this.http
            .get<Blob>(setBaseUrl(`/rest/amm/budgetierung/budget/${budgetId}/export`), {
                observe: 'response',
                responseType: 'blob' as 'json'
            })
            .pipe(catchError(handleError));
    }

    exportTeilbudget(teilbudgetId: number): Observable<HttpResponse<Blob>> {
        return this.http
            .get<Blob>(setBaseUrl(`/rest/amm/budgetierung/teilbudget/${teilbudgetId}/export`), {
                observe: 'response',
                responseType: 'blob' as 'json'
            })
            .pipe(catchError(handleError));
    }

    exportBudgetvergleich(listeKopieParam: ListeKopieParamDTO, locale: string): Observable<HttpResponse<Blob>> {
        return this.http
            .post<Blob>(setBaseUrl(`/rest/amm/budgetierung/budget/vergleich/export/${locale}`), listeKopieParam, {
                observe: 'response',
                responseType: 'blob' as 'json'
            })
            .pipe(catchError(handleError));
    }

    updateBudget(budget: BudgetDTO, locale: string): Observable<BaseResponseWrapperBudgetDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/${locale}`), budget).pipe(catchError(handleError));
    }

    budgetFreigeben(budget: BudgetDTO, locale: string): Observable<BaseResponseWrapperBudgetDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/freigeben/${locale}`), budget).pipe(catchError(handleError));
    }

    budgetZuruecknehmen(budget: BudgetDTO, locale: string): Observable<BaseResponseWrapperBudgetDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/zuruecknehmen/${locale}`), budget)
            .pipe(catchError(handleError));
    }

    budgetUeberarbeiten(budget: BudgetDTO, locale: string): Observable<BaseResponseWrapperBudgetDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/ueberarbeiten/${locale}`), budget)
            .pipe(catchError(handleError));
    }

    budgetErsetzen(budget: BudgetDTO, locale: string): Observable<BaseResponseWrapperBudgetDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/ersetzen/${locale}`), budget).pipe(catchError(handleError));
    }

    deleteBudget(budgetId: number): Observable<BaseResponseWrapperBudgetDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/${budgetId}`)).pipe(catchError(handleError));
    }

    getTeilbudgets(budgetId: number): Observable<BaseResponseWrapperListTeilBudgetDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListTeilBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/${budgetId}/teilbudget`)).pipe(catchError(handleError));
    }

    getTeilbudget(teilbudgetId: number): Observable<BaseResponseWrapperTeilBudgetDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperTeilBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/teilbudget/${teilbudgetId}`)).pipe(catchError(handleError));
    }

    getTeilbudgetStruktur(teilbudgetId: number): Observable<BaseResponseWrapperAmmStrukturAggregatDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmStrukturAggregatDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/teilbudget/${teilbudgetId}/struktur`))
            .pipe(catchError(handleError));
    }

    searchTeilbudgets(param: TeilbudgetSuchenParamDTO): Observable<BaseResponseWrapperListTeilBudgetDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListTeilBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/teilbudget/search`), param).pipe(catchError(handleError));
    }

    getTeilbudgetSearchAvailableButtons(budgetId: number): Observable<BaseResponseWrapperListButtonsEnumWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListButtonsEnumWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/budget/${budgetId}/teilbudget/buttons`))
            .pipe(catchError(handleError));
    }

    getTeilbudgetBearbeitenAvailableButtons(teilbudgetId: number): Observable<BaseResponseWrapperListButtonsEnumWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListButtonsEnumWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/teilbudget/${teilbudgetId}/buttons`))
            .pipe(catchError(handleError));
    }

    getBudgetierungsrelevanteKantone(): Observable<BaseResponseWrapperListKantonDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListKantonDTOWarningMessages>(setBaseUrl(`/rest/common/kantone/budgetierung`)).pipe(catchError(handleError));
    }

    deleteTeilbudget(teilbudgetId: number): Observable<BaseResponseWrapperTeilBudgetDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperTeilBudgetDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/teilbudget/${teilbudgetId}`)).pipe(catchError(handleError));
    }

    createNewTeilbudget(teilbudgetErfassenParam: TeilbudgetErstellenParamDTO): Observable<BaseResponseWrapperListeKopieParamDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListeKopieParamDTOWarningMessages>(setBaseUrl(`/rest/amm/budgetierung/teilbudget/new`), teilbudgetErfassenParam)
            .pipe(catchError(handleError));
    }

    teilbudgetBerechnen(teilbudgetId: number, struktur: AmmStrukturAggregatDTO): Observable<BaseResponseWrapperAmmStrukturAggregatDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAmmStrukturAggregatDTOWarningMessages>(
                setBaseUrl(`/rest/amm/budgetierung/teilbudget/${teilbudgetId}/budgetwerte/calculate`),
                struktur
            )
            .pipe(catchError(handleError));
    }

    updateTeilbudget(teilbudgetStruktur: TeilbudgetStrukturWrapperDTO): Observable<BaseResponseWrapperAmmStrukturAggregatDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmStrukturAggregatDTOWarningMessages>(setBaseUrl('/rest/amm/budgetierung/teilbudget/budgetwerte/'), teilbudgetStruktur)
            .pipe(catchError(handleError));
    }
}
