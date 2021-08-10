import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
// prettier-ignore
import { BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages } from 
    '@dtos/baseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages';
import { InfotagMassnahmeDurchfuehrungseinheitRequestDTO } from '@shared/models/dtos-generated/infotagMassnahmeDurchfuehrungseinheitRequestDTO';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { handleError } from '@shared/services/handle-error.function';
import { InfotagZuweisungSaveDTO } from '@shared/models/dtos-generated/infotagZuweisungSaveDTO';
import { BaseResponseWrapperLongWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperLongWarningMessages';
import { BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages } from '@dtos/baseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages';
import { BaseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages } from '@dtos/baseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages';

@Injectable()
export class InfotagRestService {
    constructor(private http: HttpClient) {}

    getDurchfuehrungseinheiten(
        request: InfotagMassnahmeDurchfuehrungseinheitRequestDTO
    ): Observable<BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages>(setBaseUrl('/rest/stes/infotag/durchfuehrungseinheiten'), request)
            .pipe(catchError(handleError));
    }

    getBuchungTeilnehmerListe(
        isBuchung: boolean,
        stesId: string,
        geschaeftsfallId: string,
        language: string
    ): Observable<BaseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages>(
                setBaseUrl(`/rest/stes/infotag/teilnehmerliste/${isBuchung}/${stesId}/${geschaeftsfallId}/${language}`)
            )
            .pipe(catchError(handleError));
    }

    getGrunddaten(isBuchung: boolean, stesId: string, infotagId: string, language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/infotag/buchunggrunddaten/${isBuchung}/${stesId}/${infotagId}/${language}`)).pipe(catchError(handleError));
    }

    buchen(request: InfotagZuweisungSaveDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl('/rest/stes/infotag/buchen'), request).pipe(catchError(handleError));
    }

    updateBuchung(request: InfotagZuweisungSaveDTO): Observable<any> {
        return this.http.post<any>(setBaseUrl('/rest/stes/infotag/buchungupdaten'), request).pipe(catchError(handleError));
    }

    getOrtUndBeschreibung(
        isBuchung: boolean,
        stesId: string,
        geschaeftsfallId: number,
        language: string
    ): Observable<BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages>(
                setBaseUrl(`/rest/stes/infotag/ortbeschreibung/${isBuchung}/${stesId}/${geschaeftsfallId}/${language}`)
            )
            .pipe(catchError(handleError));
    }

    loeschen(geschaeftsfallId: string): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.delete(setBaseUrl(`/rest/stes/infotag/${geschaeftsfallId}`)).pipe(catchError(handleError));
    }
}
