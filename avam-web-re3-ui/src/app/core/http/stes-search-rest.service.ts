import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StesSucheQueryDTO } from '@dtos/stesSucheQueryDTO';
import { ErweiterteSucheDTO } from '@shared/models/dtos/erweiterte-suche-dto.interface';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { BaseResponseWrapperListStesSucheResultDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesSucheResultDTOWarningMessages';

@Injectable()
export class StesSearchRestService {
    constructor(private http: HttpClient, private dbTranslateService: DbTranslateService) {}

    searchStes(paramsToSearch: StesSucheQueryDTO): Observable<BaseResponseWrapperListStesSucheResultDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListStesSucheResultDTOWarningMessages>(setBaseUrl(`/rest/stes/suche`), paramsToSearch).pipe(catchError(handleError));
    }

    getExtraCriteriaOptions(): Observable<ErweiterteSucheDTO> {
        return this.http.get<ErweiterteSucheDTO>(setBaseUrl(`/rest/common/enhancedsearch/stes`)).pipe(catchError(handleError));
    }

    getExtraCriteriaForAktionen(contextId): Observable<ErweiterteSucheDTO> {
        return this.http.get<ErweiterteSucheDTO>(setBaseUrl(`/rest/common/enhancedsearch/${contextId}`)).pipe(catchError(handleError));
    }

    getGemeinde(language: string, searchText: string): Observable<any> {
        searchText = encodeURIComponent(searchText);
        return this.http.get<any>(setBaseUrl(`/rest/common/gemeinde-suchen/text/${language}/${searchText}`)).pipe(
            catchError(handleError),
            map(itemList => {
                return itemList.map(item => {
                    const baseInfo = item.gemeindeBaseInfo;
                    return {
                        gemeindeBaseInfo: {
                            bfsNummer: baseInfo.bfsNummer,
                            gemeindeId: baseInfo.gemeindeId,
                            nameDe: baseInfo.nameDe,
                            nameFr: baseInfo.nameFr,
                            nameIt: baseInfo.nameIt
                        },
                        kanton: item.kanton,
                        ortschaftsbezeichnung: item.ortschaftsbezeichnung,
                        plz: item.plz,
                        value: `${baseInfo.bfsNummer} / ${this.dbTranslateService.translate(baseInfo, 'name')} / ${item.plz} / ${item.ortschaftsbezeichnung} / ${item.kanton}`
                    };
                });
            })
        );
    }
}
