import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseResponseWrapperListStrukturElementDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStrukturElementDTOWarningMessages';
import { handleError } from '@app/shared/services/handle-error.function';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { PlanwertSuchenParameterDTO } from '@app/shared/models/dtos-generated/planwertSuchenParameterDTO';
import { BaseResponseWrapperListPlanwertViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListPlanwertViewDTOWarningMessages';

@Injectable()
export class AmmPlanwertRestService {
    constructor(private http: HttpClient) {}

    searchPlanwerte(params: PlanwertSuchenParameterDTO): Observable<BaseResponseWrapperListPlanwertViewDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListStrukturElementDTOWarningMessages>(setBaseUrl('/rest/amm/planung/planwert/search'), params).pipe(catchError(handleError));
    }

    getPlanwert(planwertId: number, shouldCalculate: boolean): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/amm/planung/planwert/${planwertId}/${shouldCalculate}`)).pipe(catchError(handleError));
    }
}
