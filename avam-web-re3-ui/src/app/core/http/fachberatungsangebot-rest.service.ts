import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages } from '@dtos/baseResponseWrapperListFachberatungsangebotViewDTOWarningMessages';
import { FachberatungParamDTO } from '@dtos/fachberatungParamDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { FachberatungSuchenParamDTO } from '@dtos/fachberatungSuchenParamDTO';
import { BaseResponseWrapperFachberatungParamDTOWarningMessages } from '@dtos/baseResponseWrapperFachberatungParamDTOWarningMessages';

@Injectable()
export class FachberatungsangeboteRestService {
    private static readonly BASE_URL = '/rest/stes/fachberatungsangebot';

    constructor(private http: HttpClient) {}

    search(searchParam: FachberatungSuchenParamDTO): Observable<BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages>(setBaseUrl(`${FachberatungsangeboteRestService.BASE_URL}`), searchParam)
            .pipe(catchError(handleError));
    }

    searchBy(unternehmenId: string): Observable<BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages>(setBaseUrl(`${FachberatungsangeboteRestService.BASE_URL}/${unternehmenId}`))
            .pipe(catchError(handleError));
    }

    create(fachberatungsangebot: FachberatungParamDTO, language: string): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http
            .post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`${FachberatungsangeboteRestService.BASE_URL}/create/${language}`), fachberatungsangebot)
            .pipe(catchError(handleError));
    }

    update(fachberatungsangebot: FachberatungParamDTO, language: string): Observable<BaseResponseWrapperFachberatungParamDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperFachberatungParamDTOWarningMessages>(setBaseUrl(`${FachberatungsangeboteRestService.BASE_URL}/update/${language}`), fachberatungsangebot)
            .pipe(catchError(handleError));
    }

    getByFachberatungsangebotId(unternehmenId: string, fachberatungsangebotId: number, language: string): Observable<BaseResponseWrapperFachberatungParamDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperFachberatungParamDTOWarningMessages>(
                setBaseUrl(`${FachberatungsangeboteRestService.BASE_URL}/${unternehmenId}/${fachberatungsangebotId}/${language}`)
            )
            .pipe(catchError(handleError));
    }

    deleteFachberatungsangebotById(fachberatungsangebotId: number): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`${FachberatungsangeboteRestService.BASE_URL}/${fachberatungsangebotId}`));
    }
}
