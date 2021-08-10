import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@app/shared/services/handle-error.function';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { alertChannelParam } from '@app/shared/components/alert/alert-channel-query-param';
import { BaseResponseWrapperListDurchfuehrungseinheitDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListDurchfuehrungseinheitDTOWarningMessages';

@Injectable()
export class AbrechnungenRestService {
    constructor(private http: HttpClient) {}

    getDurchfuehrungseinheiten(abrechnungswertDTO: AbrechnungswertDTO, channel?: string): Observable<BaseResponseWrapperListDurchfuehrungseinheitDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListDurchfuehrungseinheitDTOWarningMessages>(
                setBaseUrl(`/rest/amm/anbieter/abrechnung/abrechnungswert/durchfuerhungseinheiten`),
                abrechnungswertDTO,
                { params: alertChannelParam(channel) }
            )
            .pipe(catchError(handleError));
    }
}
