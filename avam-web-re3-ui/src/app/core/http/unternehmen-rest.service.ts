import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { UnternehmenDetailsDTO } from '@shared/models/dtos-generated/unternehmenDetailsDTO';
import { UnternehmenErfassenDTO } from '@dtos/unternehmenErfassenDTO';
import { BaseResponseWrapperListUnternehmenResultDTOWarningMessages } from '@dtos/baseResponseWrapperListUnternehmenResultDTOWarningMessages';
import { ErweiterteSucheDTO } from '@shared/models/dtos/erweiterte-suche-dto.interface';
import { UnternehmenSuchenDTO } from '@dtos/unternehmenSuchenDTO';
import { BaseResponseWrapperUnternehmenResponseDTOWarningMessages } from '@dtos/baseResponseWrapperUnternehmenResponseDTOWarningMessages';
import { BaseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages } from '@dtos/baseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { BaseResponseWrapperListMutationsAntragBfsDTOWarningMessages } from '@dtos/baseResponseWrapperListMutationsAntragBfsDTOWarningMessages';
import { BaseResponseWrapperMutationsAntragBfsDTOWarningMessages } from '@dtos/baseResponseWrapperMutationsAntragBfsDTOWarningMessages';
import { BaseResponseWrapperUnternehmenErfassenDTOWarningMessages } from '@dtos/baseResponseWrapperUnternehmenErfassenDTOWarningMessages';
import { BaseResponseWrapperListMitteilungBfsDTOWarningMessages } from '@dtos/baseResponseWrapperListMitteilungBfsDTOWarningMessages';
import { BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages } from '@dtos/baseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages';
import { BaseResponseWrapperArbeitgeberGeschaeftsgangDTOWarningMessages } from '@dtos/baseResponseWrapperArbeitgeberGeschaeftsgangDTOWarningMessages';
import { BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages } from '@dtos/baseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages';
import { MitteilungBfsDTO } from '@dtos/mitteilungBfsDTO';
import { BaseResponseWrapperListSchlagwortDTOWarningMessages } from '@dtos/baseResponseWrapperListSchlagwortDTOWarningMessages';
import { BaseResponseWrapperArbeitgeberDTOWarningMessages } from '@dtos/baseResponseWrapperArbeitgeberDTOWarningMessages';
import { ArbeitgeberDTO } from '@dtos/arbeitgeberDTO';
import { BaseResponseWrapperListBeschaeftigterBerufDTOWarningMessages } from '@dtos/baseResponseWrapperListBeschaeftigterBerufDTOWarningMessages';
import { BaseResponseWrapperMitteilungBfsDTOWarningMessages } from '@dtos/baseResponseWrapperMitteilungBfsDTOWarningMessages';
import { BeschaeftigterBerufDTO } from '@dtos/beschaeftigterBerufDTO';
import { BaseResponseWrapperUnternehmenBearbeitenDTOWarningMessages } from '@dtos/baseResponseWrapperUnternehmenBearbeitenDTOWarningMessages';
import { BaseResponseWrapperBeschaeftigterBerufDTOWarningMessages } from '@dtos/baseResponseWrapperBeschaeftigterBerufDTOWarningMessages';
import { BaseResponseWrapperListSchnellzuweisungListeViewDTOWarningMessages } from '@dtos/baseResponseWrapperListSchnellzuweisungListeViewDTOWarningMessages';
import { BaseResponseWrapperListBetriebsabteilungDTOWarningMessages } from '@dtos/baseResponseWrapperListBetriebsabteilungDTOWarningMessages';
import { BaseResponseWrapperZuweisungContainerDTOWarningMessages } from '@dtos/baseResponseWrapperZuweisungContainerDTOWarningMessages';
import { BaseResponseWrapperListZuweisungListeViewDTOWarningMessages } from '@dtos/baseResponseWrapperListZuweisungListeViewDTOWarningMessages';
import { BaseResponseWrapperZuweisungDTOWarningMessages } from '@dtos/baseResponseWrapperZuweisungDTOWarningMessages';
import { BaseResponseWrapperListOsteMatchingProfilDTOWarningMessages } from '@dtos/baseResponseWrapperListOsteMatchingProfilDTOWarningMessages';
import { MatchingTrefferOsteSuchParamDTO } from '@dtos/matchingTrefferOsteSuchParamDTO';
import { BaseResponseWrapperListMatchingStesDetailDTOWarningMessages } from '@dtos/baseResponseWrapperListMatchingStesDetailDTOWarningMessages';
import { BetriebsabteilungDTO } from '@dtos/betriebsabteilungDTO';
import { OsteAnlegenParamDTO } from '@dtos/osteAnlegenParamDTO';
import { SchlagwortDTO } from '@dtos/schlagwortDTO';
import { ALERT_CHANNEL } from '@shared/components/alert/alert-constants';
import { BaseResponseWrapperOsteAnlegenParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteAnlegenParamDTOWarningMessages';
import { alertChannelParam } from '@app/shared/components/alert/alert-channel-query-param';
import { JobroomSuchenParamDTO } from '@dtos/jobroomSuchenParamDTO';
import { BaseResponseWrapperListIOsteEgovDTOWarningMessages } from '@dtos/baseResponseWrapperListIOsteEgovDTOWarningMessages';
import { BaseResponseWrapperOsteDTOWarningMessages } from '@dtos/baseResponseWrapperOsteDTOWarningMessages';
import { BaseResponseWrapperOsteEgovDTOWarningMessages } from '@dtos/baseResponseWrapperOsteEgovDTOWarningMessages';
import { JobroomAblehnenParamDTO } from '@dtos/jobroomAblehnenParamDTO';
import { BaseResponseWrapperListBurBetriebeProUidXDTOWarningMessages } from '@dtos/baseResponseWrapperListBurBetriebeProUidXDTOWarningMessages';

@Injectable()
export class UnternehmenRestService {
    constructor(private http: HttpClient) {}

    getUnternehmenById(id: string, channel?: string): Observable<UnternehmenDTO> {
        return this.http
            .get<any>(setBaseUrl(`/rest/common/unternehmen-suchen/${id}`), {
                params: alertChannelParam(channel)
            })
            .pipe(catchError(handleError));
    }

    getUnternehmenDetailsById(unternehmenId: number): Observable<UnternehmenDetailsDTO> {
        return this.http.get<any>(setBaseUrl(`/rest/common/unternehmen-suchen/details/${unternehmenId}`)).pipe(catchError(handleError));
    }

    getExtraCriteriaInfo(contextId: string): Observable<ErweiterteSucheDTO> {
        return this.http.get<ErweiterteSucheDTO>(setBaseUrl(`/rest/common/enhancedsearch/${contextId}`)).pipe(catchError(handleError));
    }

    searchDoppelErfasstUnternehmen(unternehmenQueryDTO: UnternehmenErfassenDTO): Observable<BaseResponseWrapperListUnternehmenResultDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListUnternehmenResultDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/erfassen/standortadresse`), unternehmenQueryDTO)
            .pipe(catchError(handleError));
    }

    createUnternehmen(unternehmenDTO: UnternehmenErfassenDTO, isOsteEgov: boolean, channel?: string): Observable<BaseResponseWrapperListUnternehmenResultDTOWarningMessages> {
        let params = new HttpParams().set('isOsteEgov', String(isOsteEgov));
        if (channel) {
            params = params.set(ALERT_CHANNEL, channel);
        }
        return this.http
            .post<BaseResponseWrapperListUnternehmenResultDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/erfassen/fertigstellen`), unternehmenDTO, { params })
            .pipe(catchError(handleError));
    }

    getUnternehmenDataById(id: string): Observable<BaseResponseWrapperUnternehmenResponseDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperUnternehmenResponseDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/${id}`)).pipe(catchError(handleError));
    }

    searchUnternehmen(searchDTO: UnternehmenSuchenDTO): Observable<BaseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/suchen`), searchDTO)
            .pipe(catchError(handleError));
    }

    getUnternehmenIdByBurOrEnheitNummer(burOrEnheitId: string): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.get<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/common/unternehmen/burorenheit/${burOrEnheitId}`)).pipe(catchError(handleError));
    }

    getBurDataByUnternehmenId(unternehmenId: number, type: string): Observable<BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages> {
        const params = new HttpParams().set('responseType', type);
        return this.http
            .get<BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/bur-daten/${unternehmenId}`), { params })
            .pipe(catchError(handleError));
    }

    getMutationsAntraege(unternehmenId: number): Observable<BaseResponseWrapperListMutationsAntragBfsDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListMutationsAntragBfsDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/${unternehmenId}/mutationsantraege`))
            .pipe(catchError(handleError));
    }

    getMutationAntrag(unternehmenId: string, mutationId: string): Observable<BaseResponseWrapperMutationsAntragBfsDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperMutationsAntragBfsDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/${unternehmenId}/mutationsantraege/${mutationId}`))
            .pipe(catchError(handleError));
    }

    getMitteilungen(unternehmenId: string): Observable<BaseResponseWrapperListMitteilungBfsDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListMitteilungBfsDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/${unternehmenId}/mitteilungen`))
            .pipe(catchError(handleError));
    }

    getMitteilung(unternehmenId: string, mitteilungId: string): Observable<BaseResponseWrapperMitteilungBfsDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperMitteilungBfsDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/${unternehmenId}/mitteilungen/${mitteilungId}`))
            .pipe(catchError(handleError));
    }

    mitteilungBeantworten(mitteilungBfsId: string): Observable<BaseResponseWrapperMitteilungBfsDTOWarningMessages> {
        const endpointUrl = `/rest/common/unternehmen/mitteilungen/${mitteilungBfsId}/beantworten`;
        return this.http.post<BaseResponseWrapperMitteilungBfsDTOWarningMessages>(setBaseUrl(endpointUrl), null).pipe(catchError(handleError));
    }

    postMutationsAntrageBeantwortet(unternehmenId: string, mutationId: string): Observable<BaseResponseWrapperMutationsAntragBfsDTOWarningMessages> {
        const endpointUrl = `/rest/common/unternehmen/${unternehmenId}/mutationsantraege/${mutationId}/beantworten`;
        return this.http.post<BaseResponseWrapperMutationsAntragBfsDTOWarningMessages>(setBaseUrl(endpointUrl), null).pipe(catchError(handleError));
    }

    sendMitteilung(unternehmenId: string, mitteilungBfsDTO: MitteilungBfsDTO): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http
            .post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/common/unternehmen/${unternehmenId}/mitteilungen`), mitteilungBfsDTO)
            .pipe(catchError(handleError));
    }

    getBurUnternehmenErfassenDTOByBurOrEnheitId(burOrtEinheitId: number): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/unternehmen/burorenheit/modal/${burOrtEinheitId}`)).pipe(catchError(handleError));
    }

    deleteUnternehmenById(id: string): Observable<BaseResponseWrapperUnternehmenResponseDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperUnternehmenResponseDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/${id}`)).pipe(catchError(handleError));
    }

    updateUnternehmen(currentUnternehmen: UnternehmenResponseDTO, locale: string): Observable<BaseResponseWrapperUnternehmenBearbeitenDTOWarningMessages> {
        const url: string = setBaseUrl(`/rest/common/unternehmen/standortadresse/${locale}`);
        return this.http.put<BaseResponseWrapperUnternehmenBearbeitenDTOWarningMessages>(url, currentUnternehmen).pipe(catchError(handleError));
    }

    sendBurMutationsantrag(neuUnternehmen: UnternehmenErfassenDTO, locale: string): Observable<BaseResponseWrapperUnternehmenErfassenDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperUnternehmenErfassenDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/burmutationsantrag/${locale}`), neuUnternehmen)
            .pipe(catchError(handleError));
    }

    getGeschaeftsStatistikByUnternehmenId(id: string, locale, startDate?: string, endDate?: string): Observable<BaseResponseWrapperArbeitgeberGeschaeftsgangDTOWarningMessages> {
        let params = new HttpParams().set('unternehmenId', id);
        if (startDate && endDate) {
            params = params.append('datumVon', startDate);
            params = params.append('datumBis', endDate);
        }
        return this.http.get<any>(setBaseUrl(`/rest/arbeitgeber/geschaeftsstatistik/${locale}`), { params }).pipe(catchError(handleError));
    }

    getBurAdresseUnternehmen(unternehmenId: number): Observable<BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/buradresseuebernehmen/${unternehmenId}`))
            .pipe(catchError(handleError));
    }

    updateBurAdresseUnternehmen(currentUnternehmen: UnternehmenResponseDTO, locale: string): Observable<BaseResponseWrapperUnternehmenResponseDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperUnternehmenResponseDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/buradresseuebernehmen/${locale}`), currentUnternehmen)
            .pipe(catchError(handleError));
    }

    getRAVStellenangebote(id: string, startDate: string, endDate: string): Observable<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages> {
        let params = new HttpParams().set('unternehmenId', id);
        params = params.append('datumVon', startDate);
        params = params.append('datumBis', endDate);
        return this.http
            .get<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages>(setBaseUrl('/rest/arbeitgeber/geschaeftsstatistik/stellenangebote'), { params })
            .pipe(catchError(handleError));
    }

    getNeuerArbeitsgeber(id: string, startDate: string, endDate: string, locale: string): Observable<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages> {
        let params = new HttpParams().set('unternehmenId', id);
        params = params.append('datumVon', startDate);
        params = params.append('datumBis', endDate);
        return this.http
            .get<any>(setBaseUrl(`/rest/arbeitgeber/geschaeftsstatistik/neuerArbeitgeber/${locale}`), {
                params
            })
            .pipe(catchError(handleError));
    }

    getStesZwischenverdienst(id: string, startDate: string, endDate: string, locale: string): Observable<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages> {
        let params = new HttpParams().set('unternehmenId', id);
        params = params.append('datumVon', startDate);
        params = params.append('datumBis', endDate);
        return this.http
            .get<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/geschaeftsstatistik/zwischenverdienst/${locale}`), {
                params
            })
            .pipe(catchError(handleError));
    }

    getStesLetzterArbeitgeber(
        id: string,
        startDate: string,
        endDate: string,
        locale: string
    ): Observable<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages> {
        let params = new HttpParams().set('unternehmenId', id);
        params = params.append('datumVon', startDate);
        params = params.append('datumBis', endDate);
        return this.http
            .get<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/geschaeftsstatistik/letzterArbeitgeber/${locale}`), {
                params
            })
            .pipe(catchError(handleError));
    }

    getEinarbeitungZuschuss(id: string, startDate: string, endDate: string, locale: string): Observable<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages> {
        let params = new HttpParams().set('unternehmenId', id);
        params = params.append('datumVon', startDate);
        params = params.append('datumBis', endDate);
        return this.http
            .get<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/geschaeftsstatistik/einarbeitungszuschuss/${locale}`), {
                params
            })
            .pipe(catchError(handleError));
    }

    getAusbildungsZuschuss(id: string, startDate: string, endDate: string, locale: string): Observable<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages> {
        let params = new HttpParams().set('unternehmenId', id);
        params = params.append('datumVon', startDate);
        params = params.append('datumBis', endDate);
        return this.http
            .get<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/geschaeftsstatistik/ausbildungszuschuss/${locale}`), {
                params
            })
            .pipe(catchError(handleError));
    }

    getAusbildungsPraktika(id: string, startDate: string, endDate: string, locale: string): Observable<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages> {
        let params = new HttpParams().set('unternehmenId', id);
        params = params.append('datumVon', startDate);
        params = params.append('datumBis', endDate);
        return this.http
            .get<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/geschaeftsstatistik/ausbildungspraktika/${locale}`), {
                params
            })
            .pipe(catchError(handleError));
    }

    getSchlagworteFromArbeitgeber(): Observable<BaseResponseWrapperListSchlagwortDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListSchlagwortDTOWarningMessages>(setBaseUrl('/rest/common/schlagworte/arbeitgeber')).pipe(catchError(handleError));
    }

    getArbeitgeberAkquisitionByUnternehmenId(unternehmenId: string): Observable<BaseResponseWrapperArbeitgeberDTOWarningMessages> {
        const params = new HttpParams().set('unternehmenId', unternehmenId);
        return this.http.get<BaseResponseWrapperArbeitgeberDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/`), { params }).pipe(catchError(handleError));
    }

    saveArbeitgeber(currentArbeitgeber: ArbeitgeberDTO): Observable<BaseResponseWrapperArbeitgeberDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperArbeitgeberDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber`), currentArbeitgeber).pipe(catchError(handleError));
    }

    getBerufspraktika(id: string, startDate: string, endDate: string, locale: string): Observable<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages> {
        let params = new HttpParams().set('unternehmenId', id);
        params = params.append('datumVon', startDate);
        params = params.append('datumBis', endDate);
        return this.http
            .get<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/geschaeftsstatistik/berufspraktika/${locale}`), { params })
            .pipe(catchError(handleError));
    }

    getArbeitgeberBeschaeftigterBerufByUnternehmenId(id: string): Observable<BaseResponseWrapperListBeschaeftigterBerufDTOWarningMessages> {
        const params = new HttpParams().set('unternehmenId', id);
        return this.http
            .get<BaseResponseWrapperListBeschaeftigterBerufDTOWarningMessages>(setBaseUrl('/rest/arbeitgeber/beschaeftigterBeruf'), { params })
            .pipe(catchError(handleError));
    }

    saveBeschaeftigterBeruf(dto: BeschaeftigterBerufDTO, locale: string): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/arbeitgeber/beschaeftigterBeruf/${locale}`), dto).pipe(catchError(handleError));
    }

    getBeschaeftigterBeruf(beschaeftigterBerufId: string): Observable<BaseResponseWrapperBeschaeftigterBerufDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperBeschaeftigterBerufDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/beschaeftigterBeruf/${beschaeftigterBerufId}`))
            .pipe(catchError(handleError));
    }

    deleteBeschaeftigterBeruf(beschaeftigterBerufId: string): Observable<BaseResponseWrapperBeschaeftigterBerufDTOWarningMessages> {
        return this.http
            .delete<BaseResponseWrapperBeschaeftigterBerufDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/beschaeftigterBeruf/${beschaeftigterBerufId}`))
            .pipe(catchError(handleError));
    }

    updateBeschaeftigterBeruf(dto: BeschaeftigterBerufDTO, berufIdToEdit: number, locale: string): Observable<BaseResponseWrapperLongWarningMessages> {
        const params = new HttpParams().set('berufIdToEdit', berufIdToEdit.toString());
        return this.http.put<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/arbeitgeber/beschaeftigterBeruf/${locale}`), dto, { params }).pipe(catchError(handleError));
    }

    getSchnellzuweisungen(unternehmenId: number): Observable<BaseResponseWrapperListSchnellzuweisungListeViewDTOWarningMessages> {
        const params = new HttpParams().set('unternehmenId', unternehmenId.toString());
        return this.http
            .get<BaseResponseWrapperListSchnellzuweisungListeViewDTOWarningMessages>(setBaseUrl('/rest/arbeitgeber/stellenvermittlung'), { params })
            .pipe(catchError(handleError));
    }

    getBetriebsabteilungen(unternehmenId: number): Observable<BaseResponseWrapperListBetriebsabteilungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListBetriebsabteilungDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/${unternehmenId}/betriebsabteilungen`))
            .pipe(catchError(handleError));
    }

    saveBetriebsabteilungen(unternehmenId: number, betriebsabteilungen: BetriebsabteilungDTO[]): Observable<BaseResponseWrapperListBetriebsabteilungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListBetriebsabteilungDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/${unternehmenId}/betriebsabteilungen`), betriebsabteilungen)
            .pipe(catchError(handleError));
    }

    getZuweisung(osteId: string, zuweisungId: string): Observable<BaseResponseWrapperZuweisungContainerDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperZuweisungContainerDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/zuweisung/${zuweisungId}`)).pipe(catchError(handleError));
    }

    getZuweisungen(osteId: string): Observable<BaseResponseWrapperListZuweisungListeViewDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListZuweisungListeViewDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/zuweisung`)).pipe(catchError(handleError));
    }

    profileSenden(osteId: string, zuweisungId: string, language: string): Observable<BaseResponseWrapperZuweisungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperZuweisungDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/zuweisung/${zuweisungId}/sendProfilMail/${language}`))
            .pipe(catchError(handleError));
    }

    getMatichingProfile(osteId: string): Observable<BaseResponseWrapperListOsteMatchingProfilDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListOsteMatchingProfilDTOWarningMessages>(setBaseUrl(`/rest/oste/${osteId}/matchingprofil`)).pipe(catchError(handleError));
    }

    searchMatchingprofilTreffen(dto: MatchingTrefferOsteSuchParamDTO): Observable<BaseResponseWrapperListMatchingStesDetailDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListMatchingStesDetailDTOWarningMessages>(setBaseUrl(`/rest/oste/matchingprofil`), dto).pipe(catchError(handleError));
    }

    checkOsteStep(dto: OsteAnlegenParamDTO, currentStep: number): Observable<BaseResponseWrapperOsteAnlegenParamDTOWarningMessages | BaseResponseWrapperLongWarningMessages> {
        return this.http
            .post<BaseResponseWrapperOsteAnlegenParamDTOWarningMessages | BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/oste/step-${currentStep + 1}`), dto)
            .pipe(catchError(handleError));
    }

    getSchlagworteFromOste(gueltigkeit: string): Observable<Array<SchlagwortDTO>> {
        return this.http.get<any>(setBaseUrl(`/rest/common/schlagworte/oste/${gueltigkeit}`)).pipe(catchError(handleError));
    }

    searchJobroomMeldungen(dto: JobroomSuchenParamDTO): Observable<BaseResponseWrapperListIOsteEgovDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListIOsteEgovDTOWarningMessages>(setBaseUrl(`/rest/osteegov/jobroom/suchen`), dto).pipe(catchError(handleError));
    }

    getOsteByEgovId(id: number): Observable<BaseResponseWrapperOsteDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteDTOWarningMessages>(setBaseUrl(`/rest/osteegov/osteByEgovID/${id}`)).pipe(catchError(handleError));
    }

    getExcelReport(data: JobroomSuchenParamDTO): Observable<HttpResponse<Blob>> {
        return this.http
            .post<Blob>(setBaseUrl(`/rest/osteegov/jobroom/excelExport`), data, {
                observe: 'response',
                responseType: 'blob' as 'json'
            })
            .pipe(catchError(handleError));
    }

    getOsteegovById(id: number): Observable<BaseResponseWrapperOsteEgovDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperOsteEgovDTOWarningMessages>(setBaseUrl(`/rest/osteegov/${id}`)).pipe(catchError(handleError));
    }

    rejectMeldung(id: number, dto: JobroomAblehnenParamDTO, channel: string): Observable<BaseResponseWrapperLongWarningMessages> {
        const params = new HttpParams().set(ALERT_CHANNEL, channel);
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/osteegov/${id}/ablehnen`), dto, { params }).pipe(catchError(handleError));
    }

    forwardMeldung(osteEgovId: number, benutzerstelleCode: string, channel: string): Observable<BaseResponseWrapperLongWarningMessages> {
        const params = new HttpParams().set(ALERT_CHANNEL, channel);
        return this.http
            .put<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/osteegov/${osteEgovId}/weiterleiten/${benutzerstelleCode}`), null, { params })
            .pipe(catchError(handleError));
    }

    getArbeitgeberForJobRoom(osteEgovId: number): Observable<BaseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages>(setBaseUrl(`/rest/common/unternehmen/suchen/jobroom/egov/${osteEgovId}`))
            .pipe(catchError(handleError));
    }

    getBetriebeByUID(uidCat: string, uidOrganisationId: number): Observable<BaseResponseWrapperListBurBetriebeProUidXDTOWarningMessages> {
        const params = new HttpParams().set('uidCat', uidCat).set('uidOrganisationId', String(uidOrganisationId));
        return this.http
            .get<BaseResponseWrapperListBurBetriebeProUidXDTOWarningMessages>(setBaseUrl('/rest/common/unternehmen/bur-daten/betriebesichten'), { params })
            .pipe(catchError(handleError));
    }
}
