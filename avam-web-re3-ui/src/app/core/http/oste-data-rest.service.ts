import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { OsteDTO } from '@shared/models/dtos-generated/osteDTO';
import { OsteSearchParamsDTO } from '@shared/models/dtos-generated/osteSearchParamsDTO';
import { BaseResponseWrapperListOsteSearchResultDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListOsteSearchResultDTOWarningMessages';
import { BaseResponseWrapperOsteDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperOsteDTOWarningMessages';
import { BaseResponseWrapperListSprachkenntnisDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListSprachkenntnisDTOWarningMessages';
import { BaseResponseWrapperListOsteBerufsqualifikationViewDTOWarningMessages } from '@dtos/baseResponseWrapperListOsteBerufsqualifikationViewDTOWarningMessages';
import { BaseResponseWrapperOsteHeaderParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperOsteHeaderParamDTOWarningMessages';
import { alertChannelParam } from '@app/shared/components/alert/alert-channel-query-param';
import { BaseResponseWrapperListMatchingOsteOverviewDTOWarningMessages } from '@dtos/baseResponseWrapperListMatchingOsteOverviewDTOWarningMessages';
import { MatchingtreffernOsteSuchenParamDTO } from '@dtos/matchingtreffernOsteSuchenParamDTO';
import { VermittlungNichtGeeignetProOSTEParam } from '@dtos/vermittlungNichtGeeignetProOSTEParam';
import { BaseResponseWrapperBooleanWarningMessages } from '@dtos/baseResponseWrapperBooleanWarningMessages';
import { BaseResponseWrapperListOsteUebersichtParamDTOWarningMessages } from '@dtos/baseResponseWrapperListOsteUebersichtParamDTOWarningMessages';
import { BaseResponseWrapperOsteBearbeitenDTOWarningMessages } from '@dtos/baseResponseWrapperOsteBearbeitenDTOWarningMessages';
import { OsteStellenangabenParamDTO } from '@dtos/osteStellenangabenParamDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { OsteBewerbungParamDTO } from '@dtos/osteBewerbungParamDTO';
import { OsteBewirtschaftungParamDTO } from '@dtos/osteBewirtschaftungParamDTO';
import { BerufMeldepflichtSuchenParamDTO } from '@dtos/berufMeldepflichtSuchenParamDTO';
import { BaseResponseWrapperListMeldepflichtDTOWarningMessages } from '@dtos/baseResponseWrapperListMeldepflichtDTOWarningMessages';
import { BerufDTO } from '@dtos/berufDTO';
import { BaseResponseWrapperListBerufsqualifikationDTOWarningMessages } from '@dtos/baseResponseWrapperListBerufsqualifikationDTOWarningMessages';
import { BaseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages } from '@dtos/baseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages';
import { OsteSuchenParamDTO } from '@dtos/osteSuchenParamDTO';
import { BaseResponseWrapperListOsteSuchresultatParamDTOWarningMessages } from '@dtos/baseResponseWrapperListOsteSuchresultatParamDTOWarningMessages';
import { OsteAnforderungenBearbeitenDTO } from '@dtos/osteAnforderungenBearbeitenDTO';
import { BaseResponseWrapperOsteEgovParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteEgovParamDTOWarningMessages';
import { OsteEgovParamDTO } from '@dtos/osteEgovParamDTO';
import { BerufSuchenParamDTO } from '@dtos/berufSuchenParamDTO';
import { BaseResponseWrapperListBerufMeldepflichtViewDTOWarningMessages } from '@dtos/baseResponseWrapperListBerufMeldepflichtViewDTOWarningMessages';

@Injectable()
export class OsteDataRestService {
    constructor(private http: HttpClient) {}

    getOsteHeader(osteId: string, locale: string, channel?: string): Observable<BaseResponseWrapperOsteHeaderParamDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteHeaderParamDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/header/${locale}`), { params: alertChannelParam(channel) });
    }

    searchByOste(osteId: string): Observable<OsteDTO> {
        return this.http.get<any>(setBaseUrl(`/rest/oste/${osteId}`)).pipe(catchError(handleError));
    }

    getOsteAnforderungen(osteId: string): Observable<BaseResponseWrapperOsteBearbeitenDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/anforderungen-anzeigen`)).pipe(catchError(handleError));
    }

    getStellenangebote(searchParams: OsteSearchParamsDTO, locale: string): Observable<BaseResponseWrapperListOsteSearchResultDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListOsteSearchResultDTOWarningMessages>(setBaseUrl(`/rest/oste/search/${locale}`), searchParams);
    }

    searchStellenangebotMeldepflichtigenBerufeList(searchParams: BerufMeldepflichtSuchenParamDTO): Observable<BaseResponseWrapperListMeldepflichtDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListMeldepflichtDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/stellenangebot/liste-meldepflicht`), searchParams)
            .pipe(catchError(handleError));
    }

    getOsteBewerbung(osteId: string): Observable<BaseResponseWrapperOsteDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/bewerbung`));
    }

    getOsteBewirtschaftung(osteId: string): Observable<BaseResponseWrapperOsteDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/bewirtschaftung`)).pipe(catchError(handleError));
    }

    getOsteBasisangaben(osteId: string): Observable<BaseResponseWrapperOsteDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/basisangaben`)).pipe(catchError(handleError));
    }

    getOsteSprachkenntnisse(osteId: string, locale: string): Observable<BaseResponseWrapperListSprachkenntnisDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListSprachkenntnisDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/sprachkenntnisse/${locale}`)).pipe(catchError(handleError));
    }

    getOsteBerufsbildung(osteId: string): Observable<BaseResponseWrapperListOsteBerufsqualifikationViewDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListOsteBerufsqualifikationViewDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/berufsbildung`)).pipe(catchError(handleError));
    }

    getOsteBerufsqualifikation(osteId: string): Observable<BaseResponseWrapperListBerufsqualifikationDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListBerufsqualifikationDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/berufsqualifikation`)).pipe(catchError(handleError));
    }

    getMatchingtreffernOste(searchParams: MatchingtreffernOsteSuchenParamDTO, locale: string): Observable<BaseResponseWrapperListMatchingOsteOverviewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListMatchingOsteOverviewDTOWarningMessages>(setBaseUrl(`/rest/oste/matchingtreffern/${locale}`), searchParams)
            .pipe(catchError(handleError));
    }

    removeVermittlungNichtGeeignetProOSTE(param: VermittlungNichtGeeignetProOSTEParam): Observable<BaseResponseWrapperBooleanWarningMessages> {
        return this.http.put<BaseResponseWrapperBooleanWarningMessages>(setBaseUrl(`/rest/oste/nichtgeeignet`), param).pipe(catchError(handleError));
    }

    getOsteByUnternehmenId(unternehmenId: string): Observable<BaseResponseWrapperListOsteUebersichtParamDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/oste/arbeitgeber/${unternehmenId}`)).pipe(catchError(handleError));
    }

    getOsteBewirtschaftungOwner(osteId: string): Observable<BaseResponseWrapperOsteBearbeitenDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/bewirtschaftung-anzeigen`)).pipe(catchError(handleError));
    }

    getOsteBasisangabenOwner(osteId: string): Observable<BaseResponseWrapperOsteBearbeitenDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/basisangaben-anzeigen`)).pipe(catchError(handleError));
    }

    osteBasisangabenSpeichern(basisangaben: OsteStellenangabenParamDTO): Observable<BaseResponseWrapperOsteBearbeitenDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperOsteBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/oste/basisangaben`), basisangaben).pipe(catchError(handleError));
    }

    removeOste(osteId: string) {
        return this.http.delete<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/oste/${osteId}`)).pipe(catchError(handleError));
    }

    osteBewirschaftungSpeichern(bewirschaftung: OsteBewirtschaftungParamDTO): Observable<BaseResponseWrapperOsteBearbeitenDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperOsteBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/oste/bewirtschaftung`), bewirschaftung).pipe(catchError(handleError));
    }

    getOsteBewerbungOwner(osteId: string): Observable<BaseResponseWrapperOsteBearbeitenDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/bewerbung-anzeigen`)).pipe(catchError(handleError));
    }

    osteUmteilen(osteId: number, unternehmenId: number): Observable<BaseResponseWrapperOsteDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperOsteDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/umteilen/${unternehmenId}`), null).pipe(catchError(handleError));
    }

    osteBewerbungSpeichern(bewerbung: OsteBewerbungParamDTO): Observable<BaseResponseWrapperOsteBearbeitenDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperOsteBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/oste/bewerbung`), bewerbung).pipe(catchError(handleError));
    }

    getAnalogMeldepflichtBerufe(berufValue: BerufDTO | string): Observable<BaseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages> {
        let params = new HttpParams();
        params = params.append('paramType', typeof berufValue === 'string' || berufValue.berufId === -1 ? 'bezeichnung' : 'berufId');
        params = params.append('param', typeof berufValue === 'string' ? berufValue : berufValue.berufId === -1 ? berufValue.bezeichnungMaDe : `${berufValue.berufId}`);
        return this.http
            .get<BaseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages>(setBaseUrl(`/rest/common/berufmeldepflicht/analog-search`), { params })
            .pipe(catchError(handleError));
    }

    getAehnlichBerufe(paraType: string, param: string): Observable<BaseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages> {
        let params = new HttpParams();
        params = params.append('paramType', paraType);
        params = params.append('param', param);
        return this.http
            .get<BaseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages>(setBaseUrl(`/rest/common/berufmeldepflicht/analog-search`), { params })
            .pipe(catchError(handleError));
    }

    getBeruf(berufSuchenParamDTO: BerufSuchenParamDTO): Observable<BaseResponseWrapperListBerufMeldepflichtViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListBerufMeldepflichtViewDTOWarningMessages>(setBaseUrl(`/rest/common/berufmeldepflicht/search`), berufSuchenParamDTO)
            .pipe(catchError(handleError));
    }

    searchOste(osteSuchenParamDTO: OsteSuchenParamDTO): Observable<BaseResponseWrapperListOsteSuchresultatParamDTOWarningMessages> {
        return this.http.post(setBaseUrl(`/rest/oste/suchen`), osteSuchenParamDTO).pipe(catchError(handleError));
    }

    osteAnforderungenSpeichern(osteAnforderungenBearbeitenDTO: OsteAnforderungenBearbeitenDTO): Observable<BaseResponseWrapperOsteBearbeitenDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperOsteBearbeitenDTOWarningMessages>(setBaseUrl(`/rest/oste/anforderungen`), osteAnforderungenBearbeitenDTO)
            .pipe(catchError(handleError));
    }

    getOsteEgovParamByOsteEgovId(osteEgovId: string, unternehmenId: string): Observable<BaseResponseWrapperOsteEgovParamDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperOsteEgovParamDTOWarningMessages>(setBaseUrl(`/rest/osteegov/${osteEgovId}/osteEgovParam`), { params: { unternehmenId } })
            .pipe(catchError(handleError));
    }

    checkOsteStep(dto: OsteEgovParamDTO, step: number): Observable<BaseResponseWrapperOsteEgovParamDTOWarningMessages | BaseResponseWrapperLongWarningMessages> {
        return this.http
            .post<BaseResponseWrapperOsteEgovParamDTOWarningMessages | BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/osteegov/step-${step}`), dto)
            .pipe(catchError(handleError));
    }
}
