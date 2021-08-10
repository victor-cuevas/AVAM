import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BenutzerstellenQueryDTO } from 'src/app/shared/models/dtos-generated/benutzerstellenQueryDTO';
// prettier-ignore
import { BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages } from
        'src/app/shared/models/dtos-generated/baseResponseWrapperListBenutzerstelleResultDTOWarningMessages';
import { VollzugsregionDTO } from 'src/app/shared/models/dtos-generated/vollzugsregionDTO';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { BaseResponseWrapperBenutzerstelleResultDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperBenutzerstelleResultDTOWarningMessages';
import { alertChannelParam } from '@app/shared/components/alert/alert-channel-query-param';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { BaseResponseWrapperVollzugsregionDTOWarningMessages } from '@dtos/baseResponseWrapperVollzugsregionDTOWarningMessages';
import { BaseResponseWrapperIntegerWarningMessages } from '@dtos/baseResponseWrapperIntegerWarningMessages';
import { BerufDTO } from '@dtos/berufDTO';
import { BaseResponseWrapperBerufBearbeitenDTOWarningMessages } from '@dtos/baseResponseWrapperBerufBearbeitenDTOWarningMessages';

@Injectable({
    providedIn: 'root'
})
export class BenutzerstellenRestService {
    constructor(private http: HttpClient) {}

    getBenutzerstellen(
        benutzerstellenQueryDTO: BenutzerstellenQueryDTO,
        language: string,
        channel?: string
    ): Observable<BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages> {
        return this.http
            .post<any>(setBaseUrl(`/rest/common/benutzerstellen-suchen/${language}`), benutzerstellenQueryDTO, { params: alertChannelParam(channel) })
            .pipe(catchError(handleError));
    }

    getBenutzerstelleById(benutzerstelleId: number): Observable<BaseResponseWrapperBenutzerstelleResultDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperBenutzerstelleResultDTOWarningMessages>(setBaseUrl(`/rest/common/benutzerstellen/${benutzerstelleId}`))
            .pipe(catchError(handleError));
    }

    getBenutzerstelleInfo(benutzerstellenQueryDTO: BenutzerstellenQueryDTO, language: string): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/common/benutzerstelle-info-suchen/${language}`), benutzerstellenQueryDTO).pipe(catchError(handleError));
    }

    getVollzugsregionen(language: string, searchText: string): Observable<VollzugsregionDTO[]> {
        searchText = encodeURIComponent(searchText);
        return this.http.get<any>(setBaseUrl(`/rest/common/vollzugsregion-suchen/${language}/${searchText}`)).pipe(catchError(handleError));
    }

    postVollzugsregion(dto: VollzugsregionDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/benutzerwaltung/vollzugsregion`), dto).pipe(catchError(handleError));
    }

    putVollzugsregion(dto: VollzugsregionDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.put<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/benutzerwaltung/vollzugsregion`), dto).pipe(catchError(handleError));
    }

    getVollzugsregionById(id: string): Observable<BaseResponseWrapperVollzugsregionDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperVollzugsregionDTOWarningMessages>(setBaseUrl(`/rest/benutzerwaltung/vollzugsregion/${id}`)).pipe(catchError(handleError));
    }

    getNextBerufNr(): Observable<BaseResponseWrapperIntegerWarningMessages> {
        return this.http.get<BaseResponseWrapperIntegerWarningMessages>(setBaseUrl(`/rest/benutzerwaltung/beruf/nextID`)).pipe(catchError(handleError));
    }

    postBeruf(beruf: BerufDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/benutzerwaltung/beruf`), beruf).pipe(catchError(handleError));
    }

    getBeruf(id: number): Observable<BaseResponseWrapperBerufBearbeitenDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperBerufBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/benutzerwaltung/beruf/${id}`)).pipe(catchError(handleError));
    }

    putBeruf(beruf: BerufDTO): Observable<BaseResponseWrapperBerufBearbeitenDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperBerufBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/benutzerwaltung/beruf`), beruf).pipe(catchError(handleError));
    }
}
