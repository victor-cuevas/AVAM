import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { BaseResponseWrapperListDomainDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListDomainDTOWarningMessages';
import { CodeSuchenParamDTO } from '@app/shared/models/dtos-generated/codeSuchenParamDTO';
import { DomainSuchenParamDTO } from '@app/shared/models/dtos-generated/domainSuchenParamDTO';
import { handleError } from '@app/shared/services/handle-error.function';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CodeDataRestService {
    constructor(private http: HttpClient) {}

    codeDomainSearch(data: DomainSuchenParamDTO): Observable<BaseResponseWrapperListDomainDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListDomainDTOWarningMessages>(setBaseUrl(`/rest/common/domain/search`), data).pipe(catchError(handleError));
    }

    searchCode(param: CodeSuchenParamDTO): Observable<BaseResponseWrapperListCodeDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListCodeDTOWarningMessages>(setBaseUrl('/rest/common/code/search'), param).pipe(catchError(handleError));
    }
}
