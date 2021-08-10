import { BaseResponseWrapperStrukturElementDTOWarningMessages } from '@dtos/baseResponseWrapperStrukturElementDTOWarningMessages';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { handleError } from '@app/shared/services/handle-error.function';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { PlanungSuchenParameterDTO } from '@dtos/planungSuchenParameterDTO';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { BaseResponseWrapperPlanungSuchenParameterDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperPlanungSuchenParameterDTOWarningMessages';

@Injectable()
export class AmmPlanungRestService {
    constructor(private http: HttpClient) {}

    searchWithParams(params: PlanungSuchenParameterDTO): Observable<BaseResponseWrapperStrukturElementDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperStrukturElementDTOWarningMessages>(setBaseUrl('/rest/amm/akqusition/planung/search'), params).pipe(catchError(handleError));
    }

    getPlanungSuchenParameterDtoById(id: number, maskPrefix: ElementPrefixEnum): Observable<BaseResponseWrapperPlanungSuchenParameterDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperPlanungSuchenParameterDTOWarningMessages>(setBaseUrl(`/rest/amm/akqusition/planung/${id}/${maskPrefix}`))
            .pipe(catchError(handleError));
    }
}
