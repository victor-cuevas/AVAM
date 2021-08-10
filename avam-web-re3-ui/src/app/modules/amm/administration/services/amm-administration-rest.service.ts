import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseResponseWrapperListElementKategorieDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListElementKategorieDTOWarningMessages';
import { BaseResponseWrapperStrukturElementDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStrukturElementDTOWarningMessages';
import { StrukturElementQueryParams } from '@app/shared/models/dtos-generated/strukturElementQueryParams';
import { handleError } from '@app/shared/services/handle-error.function';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StrukturFilterDTO } from '../components/struktur-filter/struktur-filter.component';
import { BaseResponseWrapperStrukturElementRechteDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStrukturElementRechteDTOWarningMessages';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { alertChannelParam } from '@app/shared/components/alert/alert-channel-query-param';
import { BaseResponseWrapperListStrukturElementDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStrukturElementDTOWarningMessages';

@Injectable()
export class AmmAdministrationRestService {
    constructor(private http: HttpClient) {}

    getAllElementCategories(): Observable<BaseResponseWrapperListElementKategorieDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListElementKategorieDTOWarningMessages>(setBaseUrl('/rest/amm/administration/elementkategorie/all')).pipe(catchError(handleError));
    }

    searchAllStruktur(strukturFilterDTO: StrukturFilterDTO): Observable<BaseResponseWrapperStrukturElementDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStrukturElementDTOWarningMessages>(setBaseUrl('/rest/amm/administration/structurelement/all/search'), strukturFilterDTO)
            .pipe(catchError(handleError));
    }

    getExcelExport(queryParams: StrukturElementQueryParams, locale: string): Observable<HttpResponse<Blob>> {
        return this.http
            .post<Blob>(setBaseUrl(`/rest/amm/administration/elementkategorie/export/${locale}`), queryParams, {
                observe: 'response',
                responseType: 'blob' as 'json'
            })
            .pipe(catchError(handleError));
    }

    getNewElementInitialValue(elementkategorieId: number, strukturelementId: number): Observable<BaseResponseWrapperStrukturElementDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperStrukturElementDTOWarningMessages>(
                setBaseUrl(`/rest/amm/administration/elementkategorie/${elementkategorieId}/structurelement/${strukturelementId}/child/new`)
            )
            .pipe(catchError(handleError));
    }

    getStrukturElementById(strukturelementId: number): Observable<BaseResponseWrapperStrukturElementDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperStrukturElementDTOWarningMessages>(setBaseUrl(`/rest/amm/administration/strukturelement/${strukturelementId}`))
            .pipe(catchError(handleError));
    }

    getStrukturElementRechte(elementkategorieId: number, strukturelementId: number): Observable<BaseResponseWrapperStrukturElementRechteDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperStrukturElementRechteDTOWarningMessages>(
                setBaseUrl(`/rest/amm/administration/elementkategorie/${elementkategorieId}/structurelement/${strukturelementId}/rights`)
            )
            .pipe(catchError(handleError));
    }

    getStrukturElementPath(elementId: number): Observable<any> {
        return this.http.get(setBaseUrl(`/rest/amm/administration/path/element/${elementId}`)).pipe(catchError(handleError));
    }

    saveStrukturElement(strukturelement: StrukturElementDTO, channel?: string): Observable<BaseResponseWrapperStrukturElementDTOWarningMessages> {
        return this.http.post(setBaseUrl('/rest/amm/administration/structurelement'), strukturelement, { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    updateStrukturElement(strukturelement: StrukturElementDTO, channel?: string): Observable<BaseResponseWrapperStrukturElementDTOWarningMessages> {
        return this.http.put(setBaseUrl('/rest/amm/administration/structurelement'), strukturelement, { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    deleteStrukturElement(elementkategorieId: number, strukturelementId: number, channel?: string): Observable<any> {
        return this.http
            .delete<any>(setBaseUrl(`/rest/amm/administration/elementkategorie/${elementkategorieId}/structurelement/${strukturelementId}`), { params: alertChannelParam(channel) })
            .pipe(catchError(handleError));
    }

    getGesetzlicheMassnahmentypListeOhneSpez(gueltigVon: Date): Observable<BaseResponseWrapperListStrukturElementDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListStrukturElementDTOWarningMessages>(setBaseUrl('/rest/amm/administration/structurelement/gesetzliche/search'), gueltigVon)
            .pipe(catchError(handleError));
    }
}
