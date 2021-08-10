import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { StesHeaderDTO } from '@shared/models/dtos-generated/stesHeaderDTO';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Zahlstelle } from 'src/app/shared/models/zahlstelle.model';
import { RegionDTO } from '@dtos/regionDTO';
import { UnternehmenQueryDTO } from '@dtos/unternehmenQueryDTO';
import { BaseResponseWrapperStesDatenfreigabeDTOWarningMessages } from 'src/app/shared/models/dtos-generated/baseResponseWrapperStesDatenfreigabeDTOWarningMessages';
import { BaseResponseWrapperStesRahmenfristDTOWarningMessages } from 'src/app/shared/models/dtos-generated/baseResponseWrapperStesRahmenfristDTOWarningMessages';
import { CodeDTO } from 'src/app/shared/models/dtos-generated/codeDTO';
import { StesZwischenverdienstDetailsDTO } from '@app/shared/models/dtos-generated/stesZwischenverdienstDetailsDTO';
import { BaseResponseWrapperListStesZwischenverdienstDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesZwischenverdienstDTOWarningMessages';
import { handleError } from '@shared/services/handle-error.function';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { BaseResponseWrapperListStesLeistungsexporteDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesLeistungsexporteDTOWarningMessages';
import { HistorisierungDTO } from '@app/shared/models/dtos-generated/historisierungDTO';
import { StesLeistungsexportDetailsDTO } from '@app/shared/models/dtos-generated/stesLeistungsexportDetailsDTO';
import { BaseResponseWrapperListStesAusgangslageDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesAusgangslageDTOWarningMessages';
import { BaseResponseWrapperStesLeistungsexportDetailsDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesLeistungsexportDetailsDTOWarningMessages';
import { BaseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages';
import { BaseResponseWrapperListStesWdgZielDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesWdgZielDTOWarningMessages';
import { BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesAusgangslageDetailsDTOWarningMessages';
import { BaseResponseWrapperListStesWdgAktionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesWdgAktionDTOWarningMessages';
import { StesWdgAktionDTO } from '@app/shared/models/dtos-generated/stesWdgAktionDTO';
import { BaseResponseWrapperListBeurteilungselListeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListBeurteilungselListeDTOWarningMessages';
import { BaseResponseWrapperStesWdgAktionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesWdgAktionDTOWarningMessages.ts';
import { BaseResponseWrapperStesWdgZielDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesWdgZielDTOWarningMessages';
import { BaseResponseWrapperListStesWdgZielElListeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesWdgZielElListeDTOWarningMessages';
import { StesWdgZielDTO } from '@app/shared/models/dtos-generated/stesWdgZielDTO';
import { StesAusgangslageDetailsDTO } from '@app/shared/models/dtos-generated/stesAusgangslageDetailsDTO';
import { BaseResponseWrapperListZuwFachberatungViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListZuwFachberatungViewDTOWarningMessages';
import { FachberatungSuchenParamDTO } from '@app/shared/models/dtos-generated/fachberatungSuchenParamDTO';
import { BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListFachberatungsangebotViewDTOWarningMessages';
import { SchnellzuweisungDTO } from '@app/shared/models/dtos-generated/schnellzuweisungDTO';
import { BaseResponseWrapperSchnellzuweisungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperSchnellzuweisungDTOWarningMessages';
import { BaseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages } from '@dtos/baseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages';
import { BaseResponseWrapperListStesUebersichtZwischenverdienstDTOWarningMessages } from '@dtos/baseResponseWrapperListStesUebersichtZwischenverdienstDTOWarningMessages';
import { BaseResponseWrapperFachberatungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperFachberatungParamDTOWarningMessages';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { ZuweisungFachberatungParamDTO } from '@app/shared/models/dtos-generated/zuweisungFachberatungParamDTO';
import { BaseResponseWrapperZuwFachberatungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperZuwFachberatungDTOWarningMessages';
import { BaseResponseWrapperBenutzerDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperBenutzerDTOWarningMessages';
import { BaseResponseWrapperTBenutzerDetailDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperTBenutzerDetailDTOWarningMessages';
import { BaseResponseWrapperListBenutzerDetailDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListBenutzerDetailDTOWarningMessages';
import { BaseResponseWrapperPruefResultatLEWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperPruefResultatLEWarningMessages';
import { BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListBenutzerstelleResultDTOWarningMessages';
import { BaseResponseWrapperZuweisungOsteErfassenParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperZuweisungOsteErfassenParamDTOWarningMessages';
import { KantonDTO } from '@shared/models/dtos-generated/kantonDTO';
import { ProfilvergleichQueryParamsDTO } from '@app/shared/models/dtos-generated/profilvergleichQueryParamsDTO';
import { BaseResponseWrapperProfilvergleichDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperProfilvergleichDTOWarningMessages';
import { ZuweisungOsteErfassenParamDTO } from '@app/shared/models/dtos-generated/zuweisungOsteErfassenParamDTO';
import { BaseResponseWrapperZuweisungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperZuweisungDTOWarningMessages';

import { BaseResponseWrapperZuweisungViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperZuweisungViewDTOWarningMessages';
import { ZuweisungDTO } from '@app/shared/models/dtos-generated/zuweisungDTO';
import { StesVmfStellungnahmeDTO } from '@shared/models/dtos-generated/stesVmfStellungnahmeDTO';
import { BaseResponseWrapperListUnternehmenPopupDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListUnternehmenPopupDTOWarningMessages';
import { StesMatchingOverviewRequestParams } from '@app/shared/models/dtos-generated/stesMatchingOverviewRequestParams';
import { BaseResponseWrapperListMatchingStesOverviewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListMatchingStesOverviewDTOWarningMessages';
import { BaseResponseWrapperListVollzugsregionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListVollzugsregionDTOWarningMessages';
import { StesVmfEntscheidDTO } from '@shared/models/dtos-generated/stesVmfEntscheidDTO';
import { BaseResponseWrapperListStesMatchingprofilDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesMatchingprofilDTOWarningMessages';
import { VollzugsregionSuchenParamDTO } from '@app/shared/models/dtos-generated/vollzugsregionSuchenParamDTO';
import { BaseResponseWrapperStrukturElementDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStrukturElementDTOWarningMessages';
import { StrukturElementQueryParams } from '@app/shared/models/dtos-generated/strukturElementQueryParams';
import { StesMatchingprofilDTO } from '@app/shared/models/dtos-generated/stesMatchingprofilDTO';
import { BaseResponseWrapperListChIscoBerufDetailsDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListChIscoBerufDetailsDTOWarningMessages';
import { MatchingTrefferStesSuchParamDTO } from '@app/shared/models/dtos-generated/matchingTrefferStesSuchParamDTO';
import { ElementKategorieQueryParams } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { BaseResponseWrapperListElementKategorieDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListElementKategorieDTOWarningMessages';
import { VermittlungNichtGeeignetParam } from '@app/shared/models/dtos-generated/vermittlungNichtGeeignetParam';
import { BaseResponseWrapperBooleanWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperBooleanWarningMessages';
import { BaseResponseWrapperBurOertlicheEinheitDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperBurOertlicheEinheitDTOWarningMessages';
import { BaseResponseWrapperListArbeitsbemuehungenDTOWarningMessages } from '@dtos/baseResponseWrapperListArbeitsbemuehungenDTOWarningMessages';
import { ArbeitsbemuehungenDTO } from '@dtos/arbeitsbemuehungenDTO';
import { KontrollperiodeSuchenParamDTO } from '@dtos/kontrollperiodeSuchenParamDTO';
import { BaseResponseWrapperListStesAbmResponseDTOWarningMessages } from '@dtos/baseResponseWrapperListStesAbmResponseDTOWarningMessages';
import { BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages } from '@dtos/baseResponseWrapperArbeitsbemuehungenDTOWarningMessages';
import { GeKoAbzumeldendeStesSearchParamsDTO } from '@dtos/geKoAbzumeldendeStesSearchParamsDTO';
import { BaseResponseWrapperListGeKoAbzumeldendeStesSearchResponseDTOWarningMessages } from '@dtos/baseResponseWrapperListGeKoAbzumeldendeStesSearchResponseDTOWarningMessages';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';

import { BaseResponseWrapperStesBerufsdatenListDTOWarningMessages } from '@dtos/baseResponseWrapperStesBerufsdatenListDTOWarningMessages';
import { BerufMeldepflichtViewDTO } from '@dtos/berufMeldepflichtViewDTO';
import { BerufDTO } from '@dtos/berufDTO';
import { BaseResponseWrapperListStesVMDTOWarningMessages } from '@dtos/baseResponseWrapperListStesVMDTOWarningMessages';
import { StesFuerZuweisungSuchenParamDTO } from '@dtos/stesFuerZuweisungSuchenParamDTO';
import { alertChannelParam } from '@app/shared/components/alert/alert-channel-query-param';
import { ALERT_CHANNEL } from '@app/shared/components/alert/alert-constants';
import { RegionSuchenParamDTO } from '@dtos/regionSuchenParamDTO';
import { BaseResponseWrapperListRegionDTOWarningMessages } from '@dtos/baseResponseWrapperListRegionDTOWarningMessages';
import { StellungnahmeSanktionDTO } from '@dtos/stellungnahmeSanktionDTO';
import { EntscheidSanktionDTO } from '@dtos/entscheidSanktionDTO';
import { HistorySuchenParamDTO } from '@dtos/historySuchenParamDTO';
import { VermittlungsfaehigkeitDTO } from '@dtos/vermittlungsfaehigkeitDTO';
import { BaseResponseWrapperListAmmGeschaeftHandleDTOWarningMessages } from '@dtos/baseResponseWrapperListAmmGeschaeftHandleDTOWarningMessages';
import { BaseResponseWrapperListMeldepflichtDTOWarningMessages } from '@dtos/baseResponseWrapperListMeldepflichtDTOWarningMessages';
import { BaseResponseWrapperStringWarningMessages } from '@dtos/baseResponseWrapperStringWarningMessages';
import { BaseResponseWrapperCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCodeDTOWarningMessages';

@Injectable()
export class StesDataRestService {
    allZahlstellenUrl = setBaseUrl('/rest/common/zahlstellen-suchen');
    MAX_AUTOSUGGEST_RESULTS = 50;

    constructor(private http: HttpClient) {}

    getStesHeader(id: string, language: string, channel?: string): Observable<StesHeaderDTO> {
        return this.http.get<StesHeaderDTO>(setBaseUrl(`/rest/stes/${language}/${id}/header`), { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    getAllZahlstellen(): Observable<Zahlstelle[]> {
        return this.http.get<Zahlstelle[]>(this.allZahlstellenUrl).pipe(catchError(handleError));
    }

    getZahlstelleByNummer(language: string, zahlstelleNr: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/zahlstellen-suchen/${language}/nummer/${zahlstelleNr}`)).pipe(catchError(handleError));
    }

    getZahlstelleByKurzname(language: string, kurzname: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/zahlstellen-suchen/${language}/kurzname/${kurzname}`)).pipe(catchError(handleError));
    }

    getZahlstelleDetailsById(language: string, id: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/zahlstellen-suchen/${language}/alk-id/${id}`));
    }

    getAllRegionen(): Observable<RegionDTO[]> {
        return this.http.get<RegionDTO[]>(setBaseUrl('/rest/common/region-suchen')).pipe(catchError(handleError));
    }

    getAllKantone(channel?: string): Observable<KantonDTO[]> {
        return this.http.get<KantonDTO[]>(setBaseUrl('/rest/common/region-suchen/kantone'), { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    searchRegionsByParams(params: RegionSuchenParamDTO): Observable<BaseResponseWrapperListRegionDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListRegionDTOWarningMessages>(setBaseUrl('/rest/common/region/search'), params).pipe(catchError(handleError));
    }

    getGrunddatenAnmelden(id: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/grunddaten/anmelden`)).pipe(catchError(handleError));
    }

    getGrunddatenBearbeiten(id: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/grunddaten/bearbeiten`)).pipe(catchError(handleError));
    }

    createGrunddatenAnmelden(id: string, grunddatenToSave: any): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${id}/grunddaten/anmelden`), grunddatenToSave).pipe(catchError(handleError));
    }

    createGrunddatenBearbeiten(id: string, grunddatenToSave: any): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${id}/grunddaten/bearbeiten`), grunddatenToSave).pipe(catchError(handleError));
    }

    getCode(domain: string, channel?: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/domain/${domain}/codes`), { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    getActiveCodeByDomain(domain: string): Observable<CodeDTO[]> {
        return this.http.get<CodeDTO[]>(setBaseUrl(`/rest/common/domain/${domain}/codes/active`)).pipe(catchError(handleError));
    }

    getCodeById(id: number): Observable<BaseResponseWrapperCodeDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperCodeDTOWarningMessages>(setBaseUrl(`/rest/common/code/${id}`)).pipe(catchError(handleError));
    }

    getFixedCode(domain: string, channel?: string): Observable<CodeDTO[]> {
        return this.http.get<any>(setBaseUrl(`/rest/common/fixed-code/${domain}`), { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    codeSearch(domain: string, code: string): Observable<CodeDTO> {
        return this.http.get<CodeDTO>(setBaseUrl(`/rest/common/domain/${domain}/code/${code}`)).pipe(catchError(handleError));
    }

    getZusatzadresse(id: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/zusatzadresse`)).pipe(catchError(handleError));
    }

    createZusatzadresse(id: string, zusatzadresseToSave: any): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${id}/zusatzadresse`), zusatzadresseToSave).pipe(catchError(handleError));
    }

    getGemeindeByName(language: string, searchText: string): Observable<any> {
        searchText = encodeURIComponent(searchText);
        return this.http.get<any>(setBaseUrl(`/rest/common/gemeinde-suchen/name/${language}/${searchText}`)).pipe(catchError(handleError));
    }

    getGemeindeByNumber(language: string, searchNumber: number): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/gemeinde-suchen/nummer/${language}/${searchNumber}`)).pipe(catchError(handleError));
    }

    createPersonalienAnmelden(id: string, personalienToSave: any, language: string): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${id}/personalien/anmelden/${language}`), personalienToSave).pipe(catchError(handleError));
    }

    createPersonalienBearbeiten(id: string, personalienToSave: any, language: string): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${id}/personalien/bearbeiten/${language}`), personalienToSave).pipe(catchError(handleError));
    }

    getPersonalienBearbeiten(id: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/personalien/bearbeiten`)).pipe(catchError(handleError));
    }

    getPersonalienAnmelden(id: string, language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/personalien/anmelden/${language}`)).pipe(catchError(handleError));
    }

    searchAllBerufe(gueltigkeitStatus: string): Observable<BerufMeldepflichtViewDTO[]> {
        return this.http.get<BerufDTO[]>(setBaseUrl(`/rest/common/berufe/searchAll/${gueltigkeitStatus}`)).pipe(catchError(handleError));
    }

    searchBerufsgruppe(berufsgruppeTokens: any): Observable<BaseResponseWrapperListChIscoBerufDetailsDTOWarningMessages> {
        const params = new HttpParams()
            .set('q', berufsgruppeTokens['q'])
            .set('language', berufsgruppeTokens['language'])
            .set('limit', berufsgruppeTokens['limit'] ? berufsgruppeTokens['limit'] : this.MAX_AUTOSUGGEST_RESULTS);

        return this.http.get<BaseResponseWrapperListChIscoBerufDetailsDTOWarningMessages>(setBaseUrl('/rest/common/chiscoberuf/search'), { params }).pipe(catchError(handleError));
    }

    getStaaten(language: string, searchText: string): Observable<any> {
        searchText = encodeURIComponent(searchText);
        return this.http.get<any>(setBaseUrl(`/rest/common/staat-suchen/${language}/${searchText}`)).pipe(catchError(handleError));
    }

    getStaatByISOCode(isoCode: string, channel?: string): Observable<StaatDTO> {
        return this.http.get<StaatDTO>(setBaseUrl(`/rest/common/staat/${isoCode}`), { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    getStaatSwiss(channel?: string): Observable<StaatDTO> {
        return this.getStaatByISOCode('CH', channel);
    }

    getPlzByOrt(language: string, searchText: string): Observable<any> {
        searchText = encodeURIComponent(searchText);
        return this.http.get<any>(setBaseUrl(`/rest/common/plz-suchen/ort/${language}/${searchText}`)).pipe(catchError(handleError));
    }

    getPlzByNumber(language: string, searchNumber: number): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/plz-suchen/plz/${language}/${searchNumber}`)).pipe(catchError(handleError));
    }

    searchBenutzer(benutzerSuchenTokens: any): Observable<BaseResponseWrapperListBenutzerDetailDTOWarningMessages> {
        let params = new HttpParams()
            .set('q', benutzerSuchenTokens['q'])
            .set('selectedStati', benutzerSuchenTokens['selectedStati'])
            .set('limit', benutzerSuchenTokens['limit'] ? benutzerSuchenTokens['limit'] : this.MAX_AUTOSUGGEST_RESULTS);
        if (benutzerSuchenTokens['kantonKuerzel']) {
            params = params.set('kantonKuerzel', benutzerSuchenTokens['kantonKuerzel']);
        }

        return this.http.get<BaseResponseWrapperListBenutzerDetailDTOWarningMessages>(setBaseUrl('/rest/common/benutzerdetail/search'), { params }).pipe(catchError(handleError));
    }

    searchBenutzerAusVollzugsregion(benutzerSuchenTokens: any): Observable<BaseResponseWrapperListBenutzerDetailDTOWarningMessages> {
        let params = new HttpParams();

        if (benutzerSuchenTokens['berechtigung']) {
            params = params.set('berechtigung', benutzerSuchenTokens['berechtigung']);
        }

        if (benutzerSuchenTokens['myVollzugsregionTyp']) {
            params = params.set('myVollzugsregionTyp', benutzerSuchenTokens['myVollzugsregionTyp']);
        }

        if (benutzerSuchenTokens['benutzerstelleId']) {
            params = params.set('benutzerstelleId', benutzerSuchenTokens['benutzerstelleId']);
        }

        if (benutzerSuchenTokens['kantonKuerzel']) {
            params = params.set('kantonKuerzel', benutzerSuchenTokens['kantonKuerzel']);
        }

        if (benutzerSuchenTokens['filterBenutzerstelleCode']) {
            params = params.set('filterBenutzerstelleCode', benutzerSuchenTokens['filterBenutzerstelleCode']);
        }

        params = params
            .set('q', benutzerSuchenTokens['q'])
            .set('myBenutzerstelleId', benutzerSuchenTokens['myBenutzerstelleId'])
            .set('stati', benutzerSuchenTokens['stati'])
            .set('limit', benutzerSuchenTokens['limit'] ? benutzerSuchenTokens['limit'] : this.MAX_AUTOSUGGEST_RESULTS);

        return this.http
            .get<BaseResponseWrapperListBenutzerDetailDTOWarningMessages>(setBaseUrl('/rest/common/vollzugsregion/benutzerdetail/search'), { params })
            .pipe(catchError(handleError));
    }

    searchBenutzerstelleAusVollzugsregion(benutzerstelleSuchenTokens: any): Observable<BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages> {
        const params = new HttpParams()
            .set('q', benutzerstelleSuchenTokens['q'])
            .set('benutzerstelleId', benutzerstelleSuchenTokens['benutzerstelleId'])
            .set('vollzugsregionTyp', benutzerstelleSuchenTokens['vollzugsregionTyp'])
            .set('limit', benutzerstelleSuchenTokens['limit'] ? benutzerstelleSuchenTokens['limit'] : this.MAX_AUTOSUGGEST_RESULTS);

        return this.http
            .get<BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages>(setBaseUrl('/rest/common/vollzugsregion/benutzerstellen/search'), { params })
            .pipe(catchError(handleError));
    }

    getBenutzer(benutzerId: number): Observable<BaseResponseWrapperBenutzerDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperBenutzerDTOWarningMessages>(setBaseUrl(`/rest/common/benutzer/${benutzerId}`)).pipe(catchError(handleError));
    }

    getBenutzerByLogin(benutzerLogin: string): Observable<BaseResponseWrapperBenutzerDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperBenutzerDTOWarningMessages>(setBaseUrl(`/rest/common/benutzer/login/${benutzerLogin}`)).pipe(catchError(handleError));
    }

    getBenutzerDetail(benutzerDetailId: number): Observable<BaseResponseWrapperTBenutzerDetailDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperTBenutzerDetailDTOWarningMessages>(setBaseUrl(`/rest/common/benutzerdetail/${benutzerDetailId}`)).pipe(catchError(handleError));
    }

    getNoga(language: string, searchText: string): Observable<any> {
        searchText = encodeURIComponent(searchText);
        return this.http.get<any>(setBaseUrl(`/rest/common/noga-suchen/${language}/${searchText}`)).pipe(catchError(handleError));
    }

    getAbmeldung(id: string, language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/abmelden/${language}`)).pipe(catchError(handleError));
    }

    createAbmeldung(id: string, language: string, boToSave: any): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${id}/abmelden/${language}`), boToSave).pipe(catchError(handleError));
    }

    deleteAbmeldung(id: string, language: string, abmeldungId: string): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/stes/${id}/abmelden/${language}/${abmeldungId}`)).pipe(catchError(handleError));
    }

    getStellensucheAnmelden(id: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/stellensuche/anmelden`)).pipe(catchError(handleError));
    }

    getStellensucheBearbeiten(id: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${id}/stellensuche/bearbeiten`)).pipe(catchError(handleError));
    }

    createStellensucheAnmelden(id: string, stellensucheToSave: any): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${id}/stellensuche/anmelden`), stellensucheToSave).pipe(catchError(handleError));
    }
    createStellensucheBearbeiten(id: string, stellensucheToSave: any): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${id}/stellensuche/bearbeiten`), stellensucheToSave).pipe(catchError(handleError));
    }

    getSchlagworte(gueltigkeit: string, geschaeftsart = '1', useBenutzer = false): Observable<any> {
        let params = new HttpParams().set('gueltigkeit', gueltigkeit);
        params = params.append('geschaeftsart', geschaeftsart);
        params = params.append('useBenutzer', useBenutzer.toString());
        return this.http.get<any>(setBaseUrl(`/rest/common/schlagworte`), { params }).pipe(catchError(handleError));
    }

    getRegion(language: string, searchText: string): Observable<any> {
        searchText = encodeURIComponent(searchText);
        return this.http.get<any>(setBaseUrl(`/rest/common/region-suchen/${language}/${searchText}`)).pipe(catchError(handleError));
    }

    getErwerbssituationBerechnet(stesId: string, channel?: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/erwerbssituation/${stesId}/berechnet`), { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    getAllRegions(language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/region-suchen`)).pipe(catchError(handleError));
    }

    getErwerbssituationAktuell(stesId: string, channel?: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/erwerbssituation/${stesId}/aktuell`), { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    createErwerbssituation(stesId: string, erwAktuellList: any, channel?: string): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/common/erwerbssituation/${stesId}`), erwAktuellList, { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    getSprachkenntnisseAnmelden(stesId: string, language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/sprachkenntnisse/${language}/anmelden`)).pipe(catchError(handleError));
    }

    getSprachkenntnisseBearbeiten(stesId: string, language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/sprachkenntnisse/${language}/bearbeiten`)).pipe(catchError(handleError));
    }

    getSprachen(language: string, searchText: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/sprache-suchen/${language}/${searchText}`)).pipe(catchError(handleError));
    }

    getRahmenfristen(stesId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/rahmenfristen`)).pipe(catchError(handleError));
    }

    getRahmenfristById(rahmenfristId: string, stesId: string): Observable<BaseResponseWrapperStesRahmenfristDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperStesRahmenfristDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/rahmenfristen/${rahmenfristId}`)).pipe(catchError(handleError));
    }

    getAuszahlungProRahmenfristen(personStesId: number, stesRahmenfristId: number): Observable<BaseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/rahmenfristen/${personStesId}/${stesRahmenfristId}`)).pipe(catchError(handleError));
    }

    getAuszahlungFuerZwischenverdienst(personStesId: number, stesRahmenfristId: number): Observable<BaseResponseWrapperListStesUebersichtZwischenverdienstDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/rahmenfristen/zwischenverdienst/${personStesId}/${stesRahmenfristId}`)).pipe(catchError(handleError));
    }

    getZaehlerstand(rahmenfristId: string): Observable<BaseResponseWrapperStesRahmenfristDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperStesRahmenfristDTOWarningMessages>(setBaseUrl(`/rest/stes/rahmenfristen/${rahmenfristId}/zaehlerstand`))
            .pipe(catchError(handleError));
    }

    getAuszug(stesId: string, language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/amm/stes-uebersicht/${stesId}/${language}`)).pipe(catchError(handleError));
    }

    saveSprachkenntnisse(stesId: string, language: string, sprachkenntnisseAktuell: any): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${stesId}/sprachkenntnisse/${language}`), sprachkenntnisseAktuell).pipe(catchError(handleError));
    }

    searchAvamUnternehmen(unternehmenQueryDTO: UnternehmenQueryDTO, channel?: string): Observable<BaseResponseWrapperListUnternehmenPopupDTOWarningMessages> {
        const path = unternehmenQueryDTO.avamSuche ? '/rest/common/unternehmen/avam/search' : '/rest/common/unternehmen/bur/search';
        return this.http.post<any>(setBaseUrl(path), unternehmenQueryDTO, { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    getBurOrtEinheitById(burOrtEinheitId: number): Observable<BaseResponseWrapperBurOertlicheEinheitDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/common/unternehmen/bur/${burOrtEinheitId}`)).pipe(catchError(handleError));
    }

    getBerufsdaten(stesId: string): Observable<BaseResponseWrapperStesBerufsdatenListDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperStesBerufsdatenListDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/berufsdaten`)).pipe(catchError(handleError));
    }

    createBerufsdaten(stesId: string, berufsdatenToSave: any, language: string): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${stesId}/berufsdaten/${language}`), berufsdatenToSave).pipe(catchError(handleError));
    }

    getBerufsqualifikation(stesId: string, berufsqualifikationId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/berufsdaten/${berufsqualifikationId}`)).pipe(catchError(handleError));
    }

    deleteBerufsqualifikation(stesId: string, berufsqualifikationId: string): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/stes/${stesId}/berufsdaten/${berufsqualifikationId}`)).pipe(catchError(handleError));
    }

    updateBerufsqualifikation(stesId: string, language: string, berufToUpdate: any): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesId}/berufsdaten/${language}`), berufToUpdate).pipe(catchError(handleError));
    }

    validateBerufsdaten(stesId: string, language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/berufsdaten/validate/${language}`)).pipe(catchError(handleError));
    }

    getPersonenstammdaten(personstammdatenDTO): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/common/personenstammdaten`), personstammdatenDTO).pipe(catchError(handleError));
    }

    getPersonenstammdatenById(personStesId): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/common/personenstammdaten/${personStesId}`)).pipe(catchError(handleError));
    }

    createPersonenstammdaten(personstammdatenDTO): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/common/personenstammdaten/erfassen`), personstammdatenDTO).pipe(catchError(handleError));
    }

    getDatenfreigabe(stesId: string, channel?: string): Observable<BaseResponseWrapperStesDatenfreigabeDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperStesDatenfreigabeDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/datenfreigabe`), { params: alertChannelParam(channel) })
            .pipe(catchError(handleError));
    }

    createDatenfreigabe(stesId: string, stesDatenfreigabeDTO: any): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${stesId}/datenfreigabe`), stesDatenfreigabeDTO).pipe(catchError(handleError));
    }

    updateDatenfreigabe(stesId: string, stesDatenfreigabeDTO: any): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesId}/datenfreigabe`), stesDatenfreigabeDTO).pipe(catchError(handleError));
    }

    getLeistungsexporte(stesId: string): Observable<BaseResponseWrapperListStesLeistungsexporteDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/leistungsexporte`)).pipe(catchError(handleError));
    }

    getLeistungsexportePreufResult(stesId: string): Observable<BaseResponseWrapperPruefResultatLEWarningMessages> {
        return this.http.get<BaseResponseWrapperPruefResultatLEWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/leistungsexporte/preufen`)).pipe(catchError(handleError));
    }

    getLeistungsexportById(leistungsexportId: string): Observable<BaseResponseWrapperStesLeistungsexportDetailsDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/leistungsexporte/${leistungsexportId}`)).pipe(catchError(handleError));
    }

    createLeistungsexporte(stesLeistungsexportDetailsDTO: StesLeistungsexportDetailsDTO): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/leistungsexporte`), stesLeistungsexportDetailsDTO).pipe(catchError(handleError));
    }

    deleteLeistungsexport(stesId: string, leistungsexportId: string): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/leistungsexporte/${leistungsexportId}`)).pipe(catchError(handleError));
    }

    updateLeistungsexport(stesLeistungsexportDetailsDTO: StesLeistungsexportDetailsDTO): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/leistungsexporte`), stesLeistungsexportDetailsDTO).pipe(catchError(handleError));
    }

    getZwischenverdienste(stesId: string): Observable<BaseResponseWrapperListStesZwischenverdienstDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListStesZwischenverdienstDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/zwischenverdienste`)).pipe(catchError(handleError));
    }

    getZwischenverdienstById(zwischenverdienstId: string): Observable<BaseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages>(setBaseUrl(`/rest/zwischenverdienste/${zwischenverdienstId}`))
            .pipe(catchError(handleError));
    }

    createZwischenverdienst(
        zwischenVerdienstDTO: StesZwischenverdienstDetailsDTO,
        language: string
    ): Observable<BaseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages>(setBaseUrl(`/rest/zwischenverdienste/${language}`), zwischenVerdienstDTO)
            .pipe(catchError(handleError));
    }

    updateZwischenverdienst(stesZwischenverdienstDetailsDTO: StesZwischenverdienstDetailsDTO, language: string): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/zwischenverdienste/${language}`), stesZwischenverdienstDetailsDTO).pipe(catchError(handleError));
    }

    deleteZwischenverdienst(zwischenverdienstId: string): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/zwischenverdienste/${zwischenverdienstId}`)).pipe(catchError(handleError));
    }

    getHistory(searchParam: HistorySuchenParamDTO): Observable<HistorisierungDTO> {
        return this.http.post<HistorisierungDTO>(setBaseUrl(`/rest/common/historisierung`), searchParam).pipe(catchError(handleError));
    }

    stesErfassenAktivieren(stesId: string, language: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/aktivieren/${language}`)).pipe(catchError(handleError));
    }

    getAusgangslage(stesId: string): Observable<BaseResponseWrapperListStesAusgangslageDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListStesAusgangslageDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/ausgangslage`)).pipe(catchError(handleError));
    }

    getAusgangslageDetails(ausgangslageId: number): Observable<BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages>(setBaseUrl(`/rest/ausgangslage/${ausgangslageId}`)).pipe(catchError(handleError));
    }

    deleteAusgangslage(ausgangslageId: number): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/ausgangslage/${ausgangslageId}`)).pipe(catchError(handleError));
    }

    createAusgangslage(ausgangslage: StesAusgangslageDetailsDTO, language: string): Observable<BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages>(setBaseUrl(`/rest/ausgangslage/${language}`), ausgangslage)
            .pipe(catchError(handleError));
    }

    updateAusgangslage(ausgangslage: StesAusgangslageDetailsDTO, language: string): Observable<BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperStesAusgangslageDetailsDTOWarningMessages>(setBaseUrl(`/rest/ausgangslage/${language}`), ausgangslage)
            .pipe(catchError(handleError));
    }

    getWiedereingliederungsziele(stesId: string): Observable<BaseResponseWrapperListStesWdgZielDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListStesWdgZielDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/wdgziele`)).pipe(catchError(handleError));
    }

    getWDGAktionen(stesId: string): Observable<BaseResponseWrapperListStesWdgAktionDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListStesWdgAktionDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/wdgaktionen`)).pipe(catchError(handleError));
    }

    getWdgAktionById(wdgAktionId: string): Observable<BaseResponseWrapperStesWdgAktionDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperStesWdgAktionDTOWarningMessages>(setBaseUrl(`/rest/wdgaktionen/${wdgAktionId}`)).pipe(catchError(handleError));
    }

    createWDGAktion(stesWdgAktionDTO: StesWdgAktionDTO): Observable<BaseResponseWrapperStesWdgAktionDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperStesWdgAktionDTOWarningMessages>(setBaseUrl(`/rest/wdgaktionen`), stesWdgAktionDTO).pipe(catchError(handleError));
    }

    deleteWDGAktion(wdgAktionId: string): Observable<BaseResponseWrapperStesWdgAktionDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperStesWdgAktionDTOWarningMessages>(setBaseUrl(`/rest/wdgaktionen/${wdgAktionId}`)).pipe(catchError(handleError));
    }

    updateWDGAktion(stesWdgAktionDTO: StesWdgAktionDTO): Observable<BaseResponseWrapperStesWdgAktionDTOWarningMessages> {
        return this.http.put<any>(setBaseUrl(`/rest/wdgaktionen}`), stesWdgAktionDTO).pipe(catchError(handleError));
    }

    getRahmenfrist(stesId: number): Observable<BaseResponseWrapperStesRahmenfristDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperStesRahmenfristDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/aktuelleRahmenfrist`)).pipe(catchError(handleError));
    }

    getBeurteilungsElementListe(stesId: string): Observable<BaseResponseWrapperListBeurteilungselListeDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListBeurteilungselListeDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/beurteilungselementliste`))
            .pipe(catchError(handleError));
    }

    getWdgZielById(wdgZielId: string): Observable<BaseResponseWrapperStesWdgZielDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperStesWdgZielDTOWarningMessages>(setBaseUrl(`/rest/wdgziele/${wdgZielId}`)).pipe(catchError(handleError));
    }

    getWdgZielListeById(stesId: string): Observable<BaseResponseWrapperListStesWdgZielElListeDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListStesWdgZielElListeDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/wdgzielelementliste`)).pipe(catchError(handleError));
    }

    createWdgZiel(wdgZiel: StesWdgZielDTO): Observable<BaseResponseWrapperStesWdgZielDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperStesWdgZielDTOWarningMessages>(setBaseUrl('/rest/wdgziele'), wdgZiel).pipe(catchError(handleError));
    }

    updateWdgZiel(wdgZiel: StesWdgZielDTO): Observable<BaseResponseWrapperStesWdgZielDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperStesWdgZielDTOWarningMessages>(setBaseUrl(`/rest/wdgziele`), wdgZiel).pipe(catchError(handleError));
    }

    deleteWdgZielById(wdgZielId: string): Observable<BaseResponseWrapperStesWdgZielDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperStesWdgZielDTOWarningMessages>(setBaseUrl(`/rest/wdgziele/${wdgZielId}`)).pipe(catchError(handleError));
    }

    getFachberatungen(stesId: string): Observable<BaseResponseWrapperListZuwFachberatungViewDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListZuwFachberatungViewDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/zuwfachberatungen`)).pipe(catchError(handleError));
    }

    getFachberatungsangebote(searchParams: FachberatungSuchenParamDTO): Observable<BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListFachberatungsangebotViewDTOWarningMessages>(setBaseUrl(`/rest/fachberatungsangebote/search`), searchParams)
            .pipe(catchError(handleError));
    }

    createZuweisungFachberatung(dto: ZuweisungFachberatungParamDTO, locale: string): Observable<BaseResponseWrapperZuwFachberatungDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperZuwFachberatungDTOWarningMessages>(setBaseUrl(`/rest/fachberatung/${locale}`), dto).pipe(catchError(handleError));
    }

    updateZuweisungFachberatung(dto: ZuweisungFachberatungParamDTO, locale: string): Observable<BaseResponseWrapperZuwFachberatungDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperZuwFachberatungDTOWarningMessages>(setBaseUrl(`/rest/zuwfachberatungen/${locale}`), dto).pipe(catchError(handleError));
    }

    deleteZuweisungFachberatung(id: string): Observable<BaseResponseWrapperZuwFachberatungDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperZuwFachberatungDTOWarningMessages>(setBaseUrl(`/rest/fachberatung/${id}`)).pipe(catchError(handleError));
    }

    getFachberatungsangebotParam(fachberatungsangebotId: string, locale: string): Observable<BaseResponseWrapperFachberatungParamDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperFachberatungParamDTOWarningMessages>(setBaseUrl(`/rest/fachberatungsangebot/${fachberatungsangebotId}/${locale}`))
            .pipe(catchError(handleError));
    }

    createSchnellzuweisung(schnellzuweisung: SchnellzuweisungDTO, lang: string): Observable<BaseResponseWrapperSchnellzuweisungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperSchnellzuweisungDTOWarningMessages>(setBaseUrl(`/rest/schnellzuweisungen/${lang}`), schnellzuweisung)
            .pipe(catchError(handleError));
    }

    deleteSchnellzuweisung(schnellzuweisung: SchnellzuweisungDTO): Observable<BaseResponseWrapperSchnellzuweisungDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperSchnellzuweisungDTOWarningMessages>(setBaseUrl(`/rest/schnellzuweisungen/delete`), schnellzuweisung).pipe(catchError(handleError));
    }

    getZuwFachberatung(id: string, locale: string): Observable<BaseResponseWrapperZuwFachberatungDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperZuwFachberatungDTOWarningMessages>(setBaseUrl(`/rest/zuwfachberatungen/${id}/${locale}`)).pipe(catchError(handleError));
    }

    getSchnellzuweisung(schnellzuweisungId: string): Observable<BaseResponseWrapperSchnellzuweisungDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperSchnellzuweisungDTOWarningMessages>(setBaseUrl(`/rest/schnellzuweisungen/${schnellzuweisungId}`)).pipe(catchError(handleError));
    }

    updateSchnellzuweisung(schnellzuweisung: SchnellzuweisungDTO, lang: string): Observable<BaseResponseWrapperSchnellzuweisungDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperSchnellzuweisungDTOWarningMessages>(setBaseUrl(`/rest/schnellzuweisungen/${lang}`), schnellzuweisung).pipe(catchError(handleError));
    }

    getZuweisungOste(stesId: string, osteId: number) {
        return this.http
            .get<BaseResponseWrapperZuweisungOsteErfassenParamDTOWarningMessages>(setBaseUrl(`/rest/zuweisungoste/oste/${osteId}/stes/${stesId}`))
            .pipe(catchError(handleError));
    }

    // Vmf Sachverhalte
    getVmfSachverhalte(stesId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte`)).pipe(catchError(handleError));
    }

    createVmfSachverhalt(stesVmfSachverhaltDTO: VermittlungsfaehigkeitDTO): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${stesVmfSachverhaltDTO.stesId}/vmf/sachverhalte`), stesVmfSachverhaltDTO).pipe(catchError(handleError));
    }

    updateVmfSachverhalt(stesVmfSachverhaltDTO: VermittlungsfaehigkeitDTO): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesVmfSachverhaltDTO.stesId}/vmf/sachverhalte`), stesVmfSachverhaltDTO).pipe(catchError(handleError));
    }

    deleteVmfSachverhalt(stesId: string, sachverhaltId: string): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}`)).pipe(catchError(handleError));
    }

    getVmfSachverhaltById(stesId: string, sachverhaltId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}`)).pipe(catchError(handleError));
    }

    ersetzenVmfSachverhalt(stesId: string, sachverhaltId: string): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/ersetzen`), null).pipe(catchError(handleError));
    }

    zuruecknehmenSachverhalt(stesId: string, sachverhaltId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/zuruecknehmen`)).pipe(catchError(handleError));
    }

    putVmfSachverhaltFreigegeben(stesId: string, sachverhaltId: string): Observable<any> {
        return this.http.put(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/freigeben`), null).pipe(catchError(handleError));
    }

    putSachverhaltUeberbereit(sachverhaltId: string, stesVmfSachverhaltDTO: VermittlungsfaehigkeitDTO): Observable<any> {
        return this.http
            .put(setBaseUrl(`/rest/stes/${stesVmfSachverhaltDTO.stesId}/vmf/sachverhalte/${sachverhaltId}/ueberarbeiten`), stesVmfSachverhaltDTO)
            .pipe(catchError(handleError));
    }

    // Vmf Stellungnahmen

    createVmfStellungnahme(stesId: string, sachverhaltId: string, stesVmfStellungnahmeDTO: StesVmfStellungnahmeDTO): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/stellungnahme`), stesVmfStellungnahmeDTO).pipe(catchError(handleError));
    }

    getVmfStellungnahmebyId(stesId: string, sachverhaltId: string, stellungnahmeId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/stellungnahme/${stellungnahmeId}`)).pipe(catchError(handleError));
    }

    updateVmfStellungnahme(stesId: string, sachverhaltId: string, stesVmfStellungnahmeDTO: StesVmfStellungnahmeDTO): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/stellungnahme`), stesVmfStellungnahmeDTO).pipe(catchError(handleError));
    }

    deleteVmfStellungnahme(stesId: string, sachverhaltId: string, stellungnahmeId: string): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/stellungnahme/${stellungnahmeId}`)).pipe(catchError(handleError));
    }

    // Vmf Entscheide

    getVmfEntscheidbyId(stesId: string, sachverhaltId: string, entscheidId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/entscheid/${entscheidId}`)).pipe(catchError(handleError));
    }

    createVmfEntscheid(stesId: string, sachverhaltId: string, stesVmfEntscheidDTO: StesVmfEntscheidDTO): Observable<any> {
        return this.http.post<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/entscheid`), stesVmfEntscheidDTO).pipe(catchError(handleError));
    }

    updateVmfEntscheid(stesId: string, sachverhaltId: string, stesVmfEntscheidDTO: StesVmfEntscheidDTO): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/entscheid`), stesVmfEntscheidDTO).pipe(catchError(handleError));
    }

    deleteVmfEntscheid(stesId: string, sachverhaltId: string, entscheidId: string): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/entscheid/${entscheidId}`)).pipe(catchError(handleError));
    }

    freigebenVmfEntscheid(stesId: string, sachverhaltId: string, entscheidId: string): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/entscheid/${entscheidId}/freigeben`), null).pipe(catchError(handleError));
    }

    zuruecknehmenVmfEntscheid(stesId: string, sachverhaltId: string, entscheidId: string): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/entscheid/${entscheidId}/zuruecknehmen`), null).pipe(catchError(handleError));
    }

    ueberarbeitenVmfEntscheid(stesId: string, sachverhaltId: string, entscheidId: string): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/entscheid/${entscheidId}/ueberarbeiten`), null).pipe(catchError(handleError));
    }

    ersetzenVmfEntscheid(stesId: string, sachverhaltId: string, entscheidId: string): Observable<any> {
        return this.http.put<any>(setBaseUrl(`/rest/stes/${stesId}/vmf/sachverhalte/${sachverhaltId}/entscheid/${entscheidId}/ersetzen`), null).pipe(catchError(handleError));
    }

    // Sanktion Sachverhalt
    getSanktionen(stesId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte`)).pipe(catchError(handleError));
    }

    getSanktionSachverhaltById(stesId: string, sachverhaltId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}`)).pipe(catchError(handleError));
    }

    saveSanktionSachverhalt(stesId: string, sachverhalt: any): Observable<any> {
        return this.http.post(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte`), sachverhalt).pipe(catchError(handleError));
    }

    updateSanktionSachverhalt(stesId: string, sachverhalt: any): Observable<any> {
        return this.http.put(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte`), sachverhalt).pipe(catchError(handleError));
    }

    deleteSanktionSachverhalt(stesId: string, sachverhaltId: string): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}`)).pipe(catchError(handleError));
    }

    // Sanktion Stellungnahme

    getSanktionStellungnahmeById(stesId: string, sachverhaltId: string, stellungnahmeId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/stellungnahme/${stellungnahmeId}`)).pipe(catchError(handleError));
    }

    saveSanktionStellungnahme(stesId: string, sachverhaltId: string, stellungnahme: StellungnahmeSanktionDTO): Observable<any> {
        return this.http.post(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/stellungnahme`), stellungnahme).pipe(catchError(handleError));
    }

    updateSanktionStellungnahme(stesId: string, sachverhaltId: string, stellungnahme: StellungnahmeSanktionDTO): Observable<any> {
        return this.http.put(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/stellungnahme`), stellungnahme).pipe(catchError(handleError));
    }

    deleteSanktionStellungnahme(stesId: string, sachverhaltId: string, stellungnahmeId: string): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/stellungnahme/${stellungnahmeId}`)).pipe(catchError(handleError));
    }

    // Sanktion Entscheid

    getSanktionEntscheidById(stesId: string, sachverhaltId: string, entscheidId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/entscheid/${entscheidId}`)).pipe(catchError(handleError));
    }

    saveSanktionEntscheid(stesId: string, sachverhaltId: string, entscheid: EntscheidSanktionDTO): Observable<any> {
        return this.http.post(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/entscheid`), entscheid).pipe(catchError(handleError));
    }

    updateSanktionEntscheid(stesId: string, sachverhaltId: string, entscheid: EntscheidSanktionDTO): Observable<any> {
        return this.http.put(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/entscheid`), entscheid).pipe(catchError(handleError));
    }

    deleteSanktionEntscheid(stesId: string, sachverhaltId: string, entscheid: EntscheidSanktionDTO): Observable<any> {
        return this.http
            .delete(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/entscheid/${entscheid.entscheidSanktionId}`))
            .pipe(catchError(handleError));
    }

    ueberarbeitenSanktionEntscheid(stesId: string, sachverhaltId: string, entscheid: EntscheidSanktionDTO): Observable<any> {
        return this.http
            .put(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/entscheid/${entscheid.entscheidSanktionId}/ueberarbeiten`), entscheid)
            .pipe(catchError(handleError));
    }

    zuruecknehmenSanktionEntscheid(stesId: string, sachverhaltId: string, entscheid: EntscheidSanktionDTO): Observable<any> {
        return this.http
            .put(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/entscheid/${entscheid.entscheidSanktionId}/zuruecknehmen`), entscheid)
            .pipe(catchError(handleError));
    }

    ersetzenSanktionEntscheid(stesId: string, sachverhaltId: string, entscheid: EntscheidSanktionDTO): Observable<any> {
        return this.http
            .put(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/entscheid/${entscheid.entscheidSanktionId}/ersetzen`), entscheid)
            .pipe(catchError(handleError));
    }

    freigebenSanktionEntscheid(stesId: string, sachverhaltId: string, entscheid: EntscheidSanktionDTO): Observable<any> {
        return this.http
            .put(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${sachverhaltId}/entscheid/${entscheid.entscheidSanktionId}/freigeben`), null)
            .pipe(catchError(handleError));
    }

    // Kontrollperioden

    getKontrollperioden(stesId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/kontrollperiode`)).pipe(catchError(handleError));
    }

    getKontrollperiodeById(stesId: string, kontrollperiodeId: string): Observable<BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/kontrollperiode/${kontrollperiodeId}`)).pipe(catchError(handleError));
    }

    searchKontrollperioden(searchDTO: KontrollperiodeSuchenParamDTO): Observable<BaseResponseWrapperListStesAbmResponseDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListStesAbmResponseDTOWarningMessages>(setBaseUrl('/rest/stes/kontrollperiode/suchen'), searchDTO).pipe(catchError(handleError));
    }

    deleteKontrollperiode(stesId: string, kontrollperiodeId: string): Observable<BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages> {
        return this.http
            .delete<BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/kontrollperiode/${kontrollperiodeId}`))
            .pipe(catchError(handleError));
    }

    getKontrollperiode(stesId: string): Observable<BaseResponseWrapperListArbeitsbemuehungenDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListArbeitsbemuehungenDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/kontrollperiode`)).pipe(catchError(handleError));
    }

    createKontrollperiode(stesId: string, kontrollperiode: ArbeitsbemuehungenDTO): Observable<any> {
        return this.http.post<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/kontrollperiode`), kontrollperiode).pipe(catchError(handleError));
    }

    updateKontrollperiode(stesId: string, kontrollperiode: ArbeitsbemuehungenDTO): Observable<BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/kontrollperiode`), kontrollperiode)
            .pipe(catchError(handleError));
    }

    getDefaultDataForKontrollperiode(stesId: string, kontrollperiode: string): Observable<any> {
        const params = new HttpParams().set('kontrollperiodeDate', kontrollperiode);
        return this.http
            .get<BaseResponseWrapperArbeitsbemuehungenDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/kontrollperiode/erfassen`), { params })
            .pipe(catchError(handleError));
    }

    searchAbzumeldendeStes(searchDTO: GeKoAbzumeldendeStesSearchParamsDTO): Observable<BaseResponseWrapperListGeKoAbzumeldendeStesSearchResponseDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListGeKoAbzumeldendeStesSearchResponseDTOWarningMessages>(setBaseUrl('/rest/geko/searchAbzumeldendeStes'), searchDTO)
            .pipe(catchError(handleError));
    }

    searchAmmGeschaefteByNr(paramType: string, searchNr: string): Observable<BaseResponseWrapperListAmmGeschaeftHandleDTOWarningMessages> {
        return this.http.get(setBaseUrl(`/rest/amm/stes-geschaeftsfall/suchen/${paramType}/${searchNr}`)).pipe(catchError(handleError));
    }

    getProfilvergleichWithoutMatchingprofil(
        profilvergleichParamsDTO: ProfilvergleichQueryParamsDTO,
        locale: string
    ): Observable<BaseResponseWrapperProfilvergleichDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperProfilvergleichDTOWarningMessages>(setBaseUrl(`/rest/profilvergleich/search/profil/none/${locale}`), profilvergleichParamsDTO)
            .pipe(catchError(handleError));
    }

    getProfilvergleichWithStesMatchingprofil(profilvergleichParamsDTO: ProfilvergleichQueryParamsDTO): Observable<BaseResponseWrapperProfilvergleichDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperProfilvergleichDTOWarningMessages>(setBaseUrl(`/rest/profilvergleich/search/profil/stes`), profilvergleichParamsDTO)
            .pipe(catchError(handleError));
    }

    getProfilvergleichWithOsteMatchingprofil(profilvergleichParamsDTO: ProfilvergleichQueryParamsDTO): Observable<BaseResponseWrapperProfilvergleichDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperProfilvergleichDTOWarningMessages>(setBaseUrl(`/rest/profilvergleich/search/profil/oste`), profilvergleichParamsDTO)
            .pipe(catchError(handleError));
    }

    getProfilvergleichByZuweisungId(zuweisungId: string, locale: string, channel?: string): Observable<BaseResponseWrapperProfilvergleichDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperProfilvergleichDTOWarningMessages>(setBaseUrl(`/rest/profilvergleich/search/zuweisungId/${zuweisungId}/${locale}`), {
                params: alertChannelParam(channel)
            })
            .pipe(catchError(handleError));
    }

    createZuweisung(zuweisungDTO: ZuweisungOsteErfassenParamDTO): Observable<BaseResponseWrapperZuweisungDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperZuweisungDTOWarningMessages>(setBaseUrl(`/rest/zuweisungoste`), zuweisungDTO).pipe(catchError(handleError));
    }

    getZuweisung(zuweisungId: string): Observable<BaseResponseWrapperZuweisungDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperZuweisungDTOWarningMessages>(setBaseUrl(`/rest/zuweisung/${zuweisungId}`)).pipe(catchError(handleError));
    }

    deleteZuweisung(zuweisungId: string): Observable<BaseResponseWrapperZuweisungDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperZuweisungDTOWarningMessages>(setBaseUrl(`/rest/zuweisung/${zuweisungId}`)).pipe(catchError(handleError));
    }

    updateZuweisung(locale: string, type: string, zuweisungDTO: ZuweisungDTO): Observable<BaseResponseWrapperZuweisungDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperZuweisungDTOWarningMessages>(setBaseUrl(`/rest/zuweisung/${type}/${locale}`), zuweisungDTO).pipe(catchError(handleError));
    }

    getZuweisungView(zuweisungId: string): Observable<BaseResponseWrapperZuweisungViewDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperZuweisungViewDTOWarningMessages>(setBaseUrl(`/rest/zuweisungview/${zuweisungId}`)).pipe(catchError(handleError));
    }

    getMatchingprofil(stesId: string): Observable<BaseResponseWrapperListStesMatchingprofilDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListStesMatchingprofilDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/matchingprofil/`)).pipe(catchError(handleError));
    }

    getVollzugsregion(vollzugsregion: VollzugsregionSuchenParamDTO): Observable<BaseResponseWrapperListVollzugsregionDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListVollzugsregionDTOWarningMessages>(setBaseUrl(`/rest/common/vollzugsregion-suchen`), vollzugsregion)
            .pipe(catchError(handleError));
    }

    searchMatchingStesOverview(dto: StesMatchingOverviewRequestParams, locale: string): Observable<BaseResponseWrapperListMatchingStesOverviewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListMatchingStesOverviewDTOWarningMessages>(setBaseUrl(`/rest/matchingstesoverview/search/${locale}`), dto)
            .pipe(catchError(handleError));
    }

    getStrukturElement(strukturElementQueryParams: StrukturElementQueryParams, channel?: string): Observable<BaseResponseWrapperStrukturElementDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStrukturElementDTOWarningMessages>(setBaseUrl(`/rest/amm/administration/structurelement/search`), strukturElementQueryParams, {
                params: alertChannelParam(channel)
            })
            .pipe(catchError(handleError));
    }

    getElementKategorie(elementKategorieQueryParams: ElementKategorieQueryParams, channel?: string): Observable<BaseResponseWrapperListElementKategorieDTOWarningMessages> {
        let params = new HttpParams().set('type', elementKategorieQueryParams.type);
        if (elementKategorieQueryParams.elementKategorieId) {
            params = params.append('elementKategorieId', elementKategorieQueryParams.elementKategorieId);
        }
        if (elementKategorieQueryParams.berechtigungsKey) {
            params = params.append('berechtigungsKey', elementKategorieQueryParams.berechtigungsKey);
        }
        if (channel) {
            params = params.append(ALERT_CHANNEL, channel);
        }
        return this.http
            .get<BaseResponseWrapperListElementKategorieDTOWarningMessages>(setBaseUrl(`/rest/amm/administration/elementkategorie/search/`), { params })
            .pipe(catchError(handleError));
    }

    updateMatchingprofil(stesId: string, matchingprofil: StesMatchingprofilDTO[]): Observable<BaseResponseWrapperListStesMatchingprofilDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperListStesMatchingprofilDTOWarningMessages>(setBaseUrl(`/rest/stes/${stesId}/matchingprofil`), matchingprofil)
            .pipe(catchError(handleError));
    }

    getMatchingprofilTreffer(locale: string, matchingtrefferDTO: MatchingTrefferStesSuchParamDTO): Observable<BaseResponseWrapperListStesMatchingprofilDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListStesMatchingprofilDTOWarningMessages>(setBaseUrl(`/rest/matchingprofil-treffer-stes/${locale}`), matchingtrefferDTO)
            .pipe(catchError(handleError));
    }

    addVermittlungNichtGeeignet(params: VermittlungNichtGeeignetParam) {
        return this.http.post<BaseResponseWrapperBooleanWarningMessages>(setBaseUrl(`/rest/profilvergleich/vermittlung-nicht-geeignet`), params).pipe(catchError(handleError));
    }

    removeVermittlungNichtGeeignet(object: VermittlungNichtGeeignetParam) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: object
        };
        return this.http.delete<any>(setBaseUrl(`/rest/vermittlung-nicht-geeignet`), options).pipe(catchError(handleError));
    }

    getSachverhalteByType(stesId: string, type: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/stes/${stesId}/sanktionen/sachverhalte/${type}`)).pipe(catchError(handleError));
    }

    searchArbeitgeberStellenvermitllung(searchDTO: StesFuerZuweisungSuchenParamDTO): Observable<BaseResponseWrapperListStesVMDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListStesVMDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/stellenvermittlung`), searchDTO).pipe(catchError(handleError));
    }

    searchArbeitgeberStellenvermitllungWizard(searchDTO: StesFuerZuweisungSuchenParamDTO): Observable<BaseResponseWrapperListStesVMDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperListStesVMDTOWarningMessages>(setBaseUrl(`/rest/stes/arbeitsvermittlung/search`), searchDTO).pipe(catchError(handleError));
    }

    getMEIListeDatum(): Observable<BaseResponseWrapperStringWarningMessages> {
        return this.http.get<BaseResponseWrapperStringWarningMessages>(setBaseUrl(`/rest/arbeitgeber/stellenangebot/meiliste/datum`)).pipe(catchError(handleError));
    }

    searchMeldepflichtListeByBeruf(searchDTO: BerufDTO): Observable<BaseResponseWrapperListMeldepflichtDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListMeldepflichtDTOWarningMessages>(setBaseUrl(`/rest/arbeitgeber/stellenangebot/stellenmeldepflicht-pruefen`), searchDTO)
            .pipe(catchError(handleError));
    }
}
