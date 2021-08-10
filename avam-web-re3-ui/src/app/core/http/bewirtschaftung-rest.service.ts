import { BaseResponseWrapperBooleanWarningMessages } from '@dtos/baseResponseWrapperBooleanWarningMessages';
import { BeschaeftigungseinheitDTO } from '@dtos/beschaeftigungseinheitDTO';
import { SessionKostenDTO } from '@app/shared/models/dtos-generated/sessionKostenDTO';
import { SessionDTO } from '@dtos/sessionDTO';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { handleError } from '@app/shared/services/handle-error.function';
import { AmmBeschreibungDTO } from '@dtos/ammBeschreibungDTO';
import { ProduktSuchenParamDTO } from '@dtos/produktSuchenParamDTO';
import { MassnahmeSuchenParamDTO } from '@dtos/massnahmeSuchenParamDTO';
import { BaseResponseWrapperCollectionXProduktDTOWarningMessages } from '@dtos/baseResponseWrapperCollectionXProduktDTOWarningMessages';
import { BaseResponseWrapperProduktDTOWarningMessages } from '@dtos/baseResponseWrapperProduktDTOWarningMessages';
import { BaseResponseWrapperListMassnahmeViewDTOWarningMessages } from '@dtos/baseResponseWrapperListMassnahmeViewDTOWarningMessages';
import { BaseResponseWrapperAmmBeschreibungDTOWarningMessages } from '@dtos/baseResponseWrapperAmmBeschreibungDTOWarningMessages';
import { DurchfuehrungseinheitSuchenParamDTO } from '@dtos/durchfuehrungseinheitSuchenParamDTO';
import { ProduktDTO } from '@dtos/produktDTO';
import { MassnahmeDTO } from '@dtos/massnahmeDTO';
import { BaseResponseWrapperMassnahmeDTOWarningMessages } from '@dtos/baseResponseWrapperMassnahmeDTOWarningMessages';
import { BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages } from '@dtos/baseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages';
import { BaseResponseWrapperDurchfuehrungsortDTOWarningMessages } from '@dtos/baseResponseWrapperDurchfuehrungsortDTOWarningMessages';
import { DurchfuehrungsortDTO } from '@dtos/durchfuehrungsortDTO';
import { BaseResponseWrapperSessionKostenDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperSessionKostenDTOWarningMessages';
import { BaseResponseWrapperSessionDTOWarningMessages } from '@dtos/baseResponseWrapperSessionDTOWarningMessages';
import { AmmTeilnehmerlisteBuchungenParamDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteBuchungenParamDTO';
import { BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages } from '@dtos/baseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages';
import { BaseResponseWrapperCollectionReservationDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionReservationDTOWarningMessages';
import { ReservationDTO } from '@app/shared/models/dtos-generated/reservationDTO';
import { BaseResponseWrapperStandortDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStandortDTOWarningMessages';
import { StandortDTO } from '@dtos/standortDTO';
import { BaseResponseWrapperListKantonDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListKantonDTOWarningMessages';
import { BaseResponseWrapperListPlanwertDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListPlanwertDTOWarningMessages';
import { BaseResponseWrapperPlanwertDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperPlanwertDTOWarningMessages';
import { BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages';
import { TeilnehmerlisteExportParamDto } from '@app/shared/models/dtos-generated/teilnehmerlisteExportParamDto';
import { PlanwertDTO } from '@app/shared/models/dtos-generated/planwertDTO';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAufteilungBudgetjahrDTOWarningMessages';
import { AufteilungBudgetjahrDTO } from '@app/shared/models/dtos-generated/aufteilungBudgetjahrDTO';
import { BaseResponseWrapperListTeilnehmerDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListTeilnehmerDTOWarningMessages';

@Injectable()
export class BewirtschaftungRestService {
    constructor(private http: HttpClient) {}

    searchProdukt(produktSuchenParam: ProduktSuchenParamDTO): Observable<BaseResponseWrapperCollectionXProduktDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperCollectionXProduktDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/produkt/search`), produktSuchenParam)
            .pipe(catchError(handleError));
    }

    searchDfe(durchfuehrungseinheitSuchenParamDTO: DurchfuehrungseinheitSuchenParamDTO): Observable<BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/search`), durchfuehrungseinheitSuchenParamDTO)
            .pipe(catchError(handleError));
    }

    searchMassnahme(massnahmeSuchenParam: MassnahmeSuchenParamDTO): Observable<BaseResponseWrapperListMassnahmeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListMassnahmeViewDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/massnahme/search`), massnahmeSuchenParam)
            .pipe(catchError(handleError));
    }

    createMassnahme(produktId: number): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/massnahme/produkt/${produktId}`), {}).pipe(catchError(handleError));
    }

    deleteMassnahme(massnahmeId: number): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/amm/massnahmen/massnahme/${massnahmeId}`)).pipe(catchError(handleError));
    }

    getMassnahmenByProdukt(produktSuchenParam: ProduktSuchenParamDTO): Observable<BaseResponseWrapperListMassnahmeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListMassnahmeViewDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/produkt/massnahmen`), produktSuchenParam)
            .pipe(catchError(handleError));
    }

    getDfeByMassnahmeId(massnahmeSuchenParam: MassnahmeSuchenParamDTO): Observable<BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListDurchfuehrungseinheitListeViewDTOWarningMessages>(
                setBaseUrl(`/rest/amm/massnahmen/massnahme/durchfuehrungseinheiten`),
                massnahmeSuchenParam
            )
            .pipe(catchError(handleError));
    }

    getProdukt(produktId: number): Observable<BaseResponseWrapperProduktDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperProduktDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/produkt/${produktId}`)).pipe(catchError(handleError));
    }

    saveProdukt(produktDto: ProduktDTO): Observable<BaseResponseWrapperProduktDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperProduktDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/produkt`), produktDto).pipe(catchError(handleError));
    }

    getProduktBeschreibung(produktId: number): Observable<BaseResponseWrapperAmmBeschreibungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmBeschreibungDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/produkt/${produktId}/beschreibung`))
            .pipe(catchError(handleError));
    }

    saveProduktBeschreibung(beschreibungDTO: AmmBeschreibungDTO, produktId: number): Observable<BaseResponseWrapperAmmBeschreibungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAmmBeschreibungDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/produkt/${produktId}/beschreibung`), beschreibungDTO)
            .pipe(catchError(handleError));
    }

    deleteProdukt(produktId: number): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/amm/massnahmen/produkt/${produktId}`)).pipe(catchError(handleError));
    }

    getMassnahmeBeschreibung(massnahmeId: number): Observable<BaseResponseWrapperAmmBeschreibungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmBeschreibungDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/massnahme/${massnahmeId}/beschreibung`))
            .pipe(catchError(handleError));
    }

    getMassnahme(massnahmeId: number): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/massnahme/${massnahmeId}`)).pipe(catchError(handleError));
    }

    saveMassnahme(massnahmeDto: MassnahmeDTO): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/massnahme`), massnahmeDto).pipe(catchError(handleError));
    }

    saveMassnahmeBeschreibung(beschreibungDTO: AmmBeschreibungDTO, massnahmeId: number): Observable<BaseResponseWrapperAmmBeschreibungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAmmBeschreibungDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/massnahme/${massnahmeId}/beschreibung`), beschreibungDTO)
            .pipe(catchError(handleError));
    }

    getMassnahmeDurchfuehrungsort(massnahmeId: number): Observable<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/massnahme/${massnahmeId}/durchfuehrungsort`))
            .pipe(catchError(handleError));
    }

    saveMassnahmeDurchfuehrungsort(durchfuehrungsortDTO: DurchfuehrungsortDTO, massnahmeId: number): Observable<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/massnahme/${massnahmeId}/durchfuehrungsort`), durchfuehrungsortDTO)
            .pipe(catchError(handleError));
    }

    anbieterdatenUebernehmenMassnahme(massnahmeId: number): Observable<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/anbieter-uebernehmen/massnahme/${massnahmeId}`), {})
            .pipe(catchError(handleError));
    }

    anbieterdatenUebernehmenDfe(dfeId: number): Observable<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/anbieter-uebernehmen/dfe/${dfeId}`), {})
            .pipe(catchError(handleError));
    }

    anbieterdatenUebernehmenBe(beId: number): Observable<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/anbieter-uebernehmen/be/${beId}`), {})
            .pipe(catchError(handleError));
    }

    getMassnahmeKosten(massnahmeId: number): Observable<BaseResponseWrapperSessionKostenDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperSessionKostenDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/kosten/massnahme/${massnahmeId}`)).pipe(catchError(handleError));
    }

    saveMassnahmeKosten(massnahmeId: number, kostenDto: SessionKostenDTO): Observable<BaseResponseWrapperSessionKostenDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperSessionKostenDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/kosten`), kostenDto).pipe(catchError(handleError));
    }

    insAngebotUebernehmen(massnahmeId: number): Observable<BaseResponseWrapperMassnahmeDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperMassnahmeDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/massnahme/${massnahmeId}/ins-angebot-uebernehmen`), {})
            .pipe(catchError(handleError));
    }

    createDfeSession(massnahmeId: number): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/${massnahmeId}/session`), {}).pipe(catchError(handleError));
    }

    getDfeSession(dfeId: number): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/${dfeId}/session`)).pipe(catchError(handleError));
    }

    saveDfeSession(sessionDto: SessionDTO): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/session`), sessionDto).pipe(catchError(handleError));
    }

    getDfeBeschreibung(dfeId: number): Observable<BaseResponseWrapperAmmBeschreibungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmBeschreibungDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/durchfuehrungseinheit/${dfeId}/beschreibung`))
            .pipe(catchError(handleError));
    }

    saveDfeBeschreibung(beschreibungDTO: AmmBeschreibungDTO, dfeId: number): Observable<BaseResponseWrapperAmmBeschreibungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAmmBeschreibungDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/durchfuehrungseinheit/${dfeId}/beschreibung`), beschreibungDTO)
            .pipe(catchError(handleError));
    }

    getBeBeschreibung(beId: number): Observable<BaseResponseWrapperAmmBeschreibungDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmBeschreibungDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/beschaeftigungseinheit/${beId}/beschreibung`))
            .pipe(catchError(handleError));
    }

    saveBeBeschreibung(beschreibungDTO: AmmBeschreibungDTO, beId: number): Observable<BaseResponseWrapperAmmBeschreibungDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAmmBeschreibungDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/beschaeftigungseinheit/${beId}/beschreibung`), beschreibungDTO)
            .pipe(catchError(handleError));
    }

    getDfeWarteliste(teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO): Observable<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/warteliste`), teilnehmerlisteParams)
            .pipe(catchError(handleError));
    }

    dfeWartelisteUmbuchen(
        teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO,
        dfeId: number,
        checkboxes: number[]
    ): Observable<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages> {
        let params = new HttpParams();
        params = params.append('checkboxTableValues', checkboxes.join(', '));

        return this.http
            .post<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages>(
                setBaseUrl(`/rest/amm/massnahmen/dfe/${dfeId}/warteliste/umbuchen`),
                teilnehmerlisteParams,
                { params }
            )
            .pipe(catchError(handleError));
    }

    getReservationen(dfeId: number, massnahmeId: number): Observable<BaseResponseWrapperCollectionReservationDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperCollectionReservationDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahme/${massnahmeId}/dfe/${dfeId}/reservationen`))
            .pipe(catchError(handleError));
    }

    saveReservationen(reservationenArrayDto: Array<ReservationDTO>, dfeId: number, massnahmeId: number): Observable<BaseResponseWrapperCollectionReservationDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperCollectionReservationDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahme/${massnahmeId}/dfe/${dfeId}/reservationen`), reservationenArrayDto)
            .pipe(catchError(handleError));
    }

    getAllKantoneForBudgetierung(): Observable<BaseResponseWrapperListKantonDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListKantonDTOWarningMessages>(setBaseUrl(`/rest/common/kantone/budgetierung`)).pipe(catchError(handleError));
    }

    getDfeDurchfuehrungsort(dfeId: number): Observable<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/${dfeId}/durchfuehrungsort`))
            .pipe(catchError(handleError));
    }

    saveDfeDurchfuehrungsort(durchfuehrungsortDTO: DurchfuehrungsortDTO, dfeId: number): Observable<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/${dfeId}/durchfuehrungsort`), durchfuehrungsortDTO)
            .pipe(catchError(handleError));
    }

    getBeDurchfuehrungsort(beId: number): Observable<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/beschaeftigungseinheit/${beId}/durchfuehrungsort`))
            .pipe(catchError(handleError));
    }

    saveBeDurchfuehrungsort(durchfuehrungsortDTO: DurchfuehrungsortDTO, beId: number): Observable<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperDurchfuehrungsortDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/beschaeftigungseinheit/${beId}/durchfuehrungsort`), durchfuehrungsortDTO)
            .pipe(catchError(handleError));
    }

    deleteDfeSession(dfeId: number): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/amm/massnahmen/dfe/${dfeId}/session`)).pipe(catchError(handleError));
    }

    getMassnahmeDfeTeilnehmerliste(teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO): Observable<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages> {
        const path = teilnehmerlisteParams.massnahmeId ? '/rest/amm/massnahmen/massnahme/teilnehmerliste' : '/rest/amm/massnahmen/kurs/teilnehmerliste';

        return this.http.post<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages>(setBaseUrl(path), teilnehmerlisteParams).pipe(catchError(handleError));
    }

    getStandortTeilnehmerliste(teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO): Observable<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/standort/teilnehmerliste`), teilnehmerlisteParams)
            .pipe(catchError(handleError));
    }

    getBeschaeftigungseinheitTeilnehmerliste(
        teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO
    ): Observable<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages>(
                setBaseUrl(`/rest/amm/massnahmen/beschaeftigungseinheit/teilnehmerliste`),
                teilnehmerlisteParams
            )
            .pipe(catchError(handleError));
    }

    massnahmeDfeTeilnehmerlisteUmbuchen(
        teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO,
        dfeId: number,
        checkboxes: number[]
    ): Observable<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages> {
        let params = new HttpParams();
        params = params.append('checkboxTableValues', checkboxes.join(', '));

        return this.http
            .post<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages>(
                setBaseUrl(`/rest/amm/massnahmen/dfe/${dfeId}/teilnehmerliste/umbuchen`),
                teilnehmerlisteParams,
                { params }
            )
            .pipe(catchError(handleError));
    }

    massnahmeDfeTeilnehmerlisteSpeichern(
        teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO,
        dfeId: number,
        automatisheWarteliste: boolean
    ): Observable<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages> {
        let params = new HttpParams();
        params = params.append('autoNachrueckenChecked', automatisheWarteliste.toString());

        return this.http
            .post<BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages>(
                setBaseUrl(`/rest/amm/massnahmen/dfe/${dfeId}/teilnehmerliste/speichern`),
                teilnehmerlisteParams,
                { params }
            )
            .pipe(catchError(handleError));
    }

    getStandortWithBeschaeftigungseinheiten(produktId: number, massnahmeId: number, dfeId: number): Observable<BaseResponseWrapperStandortDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperStandortDTOWarningMessages>(
                setBaseUrl(`/rest/amm/produkte/${produktId}/massnahmen/${massnahmeId}/dfe-standorte/${dfeId}/with-beschaeftigungseinheiten`)
            )
            .pipe(catchError(handleError));
    }

    getBeschaeftigungseinheit(beId: number): Observable<BaseResponseWrapperStandortDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperStandortDTOWarningMessages>(setBaseUrl(`/rest/amm/produkte/massnahmen/dfe-standorte/beschaeftigungseinheiten/${beId}`))
            .pipe(catchError(handleError));
    }

    createBeschaeftigungseinheit(dfeId: number): Observable<BaseResponseWrapperStandortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStandortDTOWarningMessages>(setBaseUrl(`/rest/amm/produkte/massnahmen/dfe-standorte/beschaeftigungseinheiten/${dfeId}`), {})
            .pipe(catchError(handleError));
    }

    saveBeschaeftigungseinheit(beDto: BeschaeftigungseinheitDTO): Observable<BaseResponseWrapperStandortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStandortDTOWarningMessages>(setBaseUrl(`/rest/amm/produkte/massnahmen/dfe-standorte/beschaeftigungseinheiten`), beDto)
            .pipe(catchError(handleError));
    }

    deleteBeschaeftigungseinheit(beId: number): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/amm/produkte/massnahmen/dfe-standorte/beschaeftigungseinheiten/${beId}`)).pipe(catchError(handleError));
    }

    entscheideErsrellenDfeSession(sessionDto: SessionDTO): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/session/entscheide-erstellen`), sessionDto)
            .pipe(catchError(handleError));
    }

    getTeilnehmerExport(teilnehmerlisteExportParamDto: TeilnehmerlisteExportParamDto): Observable<HttpResponse<any>> {
        const path = `/rest/amm/massnahmen/teilnehmerliste/export`;

        return this.http
            .post<any>(setBaseUrl(path), teilnehmerlisteExportParamDto, {
                observe: 'response',
                responseType: 'blob' as 'json'
            })
            .pipe(catchError(handleError));
    }

    absagenDfeSession(sessionDto: SessionDTO): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/session/absagen`), sessionDto).pipe(catchError(handleError));
    }

    createDfeStandort(produktId: number, massnahmeId: number): Observable<BaseResponseWrapperStandortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStandortDTOWarningMessages>(setBaseUrl(`/rest/amm/produkte/${produktId}/massnahmen/${massnahmeId}/dfe-standorte`), {})
            .pipe(catchError(handleError));
    }

    getDfeStandort(produktId: number, massnahmeId: number, dfeId: number): Observable<BaseResponseWrapperStandortDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperStandortDTOWarningMessages>(setBaseUrl(`/rest/amm/produkte/${produktId}/massnahmen/${massnahmeId}/dfe-standorte/${dfeId}`))
            .pipe(catchError(handleError));
    }

    saveDfeStandort(standortDto: StandortDTO, language: string): Observable<BaseResponseWrapperStandortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStandortDTOWarningMessages>(
                setBaseUrl(
                    `/rest/amm/produkte/${standortDto.massnahmeObject.produktObject.produktId}/massnahmen/${standortDto.massnahmeObject.massnahmeId}/dfe-standorte/${
                        standortDto.durchfuehrungsId
                    }/${language}`
                ),
                standortDto
            )
            .pipe(catchError(handleError));
    }

    verwaltenDfeStandort(produktId: number, massnahmeId: number, dfeId: number): Observable<BaseResponseWrapperStandortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStandortDTOWarningMessages>(setBaseUrl(`/rest/amm/produkte/${produktId}/massnahmen/${massnahmeId}/dfe-standorte/${dfeId}/verwalten`), {})
            .pipe(catchError(handleError));
    }

    aufhebenDfeStandort(produktId: number, massnahmeId: number, dfeId: number): Observable<BaseResponseWrapperStandortDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperStandortDTOWarningMessages>(setBaseUrl(`/rest/amm/produkte/${produktId}/massnahmen/${massnahmeId}/dfe-standorte/${dfeId}/aufheben`), {})
            .pipe(catchError(handleError));
    }

    deleteDfeStandort(produktId: number, massnahmeId: number, dfeId: number): Observable<any> {
        return this.http.delete<any>(setBaseUrl(`/rest/amm/produkte/${produktId}/massnahmen/${massnahmeId}/dfe-standorte/${dfeId}`)).pipe(catchError(handleError));
    }

    getStandortHoldsPraktikumsstellen(produktId: number, massnahmeId: number): Observable<BaseResponseWrapperBooleanWarningMessages> {
        return this.http
            .get<BaseResponseWrapperBooleanWarningMessages>(setBaseUrl(`/rest/amm/produkte/${produktId}/massnahmen/${massnahmeId}/dfe-standorte/holds-praktikumsstellen`))
            .pipe(catchError(handleError));
    }

    getProduktPlanwerteList(produktId: number): Observable<BaseResponseWrapperListPlanwertDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/produkt/${produktId}/planwerte`)).pipe(catchError(handleError));
    }

    getMassnahmePlanwerteList(massnahmeId: number): Observable<BaseResponseWrapperListPlanwertDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/massnahme/${massnahmeId}/planwerte`)).pipe(catchError(handleError));
    }

    getDfePlanwerteList(dfeId: number): Observable<BaseResponseWrapperListPlanwertDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/dfe/${dfeId}/planwerte`)).pipe(catchError(handleError));
    }

    kopierenDfeSession(dfeId: number): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperSessionDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/dfe/${dfeId}/session/kopieren`), {}).pipe(catchError(handleError));
    }

    getProduktPlanwert(produktId: number): Observable<BaseResponseWrapperPlanwertDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/produkt/${produktId}/planwert/new`)).pipe(catchError(handleError));
    }

    getMassnahmePlanwert(massnahmeId: number): Observable<BaseResponseWrapperPlanwertDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/massnahme/${massnahmeId}/planwert/new`)).pipe(catchError(handleError));
    }

    getStandortPlanwert(dfeId: number): Observable<BaseResponseWrapperPlanwertDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/standort/${dfeId}/planwert/new`)).pipe(catchError(handleError));
    }

    getKursPlanwert(dfeId: number): Observable<BaseResponseWrapperPlanwertDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/kurs/${dfeId}/planwert/new`)).pipe(catchError(handleError));
    }

    getMassnahmeTeilnehmerplaetzeByDfeId(dfeId: number): Observable<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/teilnehmerplaetze/dfeId/${dfeId}`))
            .pipe(catchError(handleError));
    }

    getMassnahmeTeilnehmerplaetzeNextMonthByDfeId(dfeId: number, month: number, year: number): Observable<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages>(
                setBaseUrl(`/rest/amm/massnahmen/teilnehmerplaetze/dfeId/${dfeId}/month/${month}/year/${year}/next-month`)
            )
            .pipe(catchError(handleError));
    }

    getMassnahmeTeilnehmerplaetzePreviousMonthByDfeId(dfeId: number, month: number, year: number): Observable<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages>(
                setBaseUrl(`/rest/amm/massnahmen/teilnehmerplaetze/dfeId/${dfeId}/month/${month}/year/${year}/previous-month`)
            )
            .pipe(catchError(handleError));
    }

    getMassnahmeTeilnehmerplaetzeByBeId(beId: number): Observable<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages>(setBaseUrl(`/rest/amm/massnahmen/teilnehmerplaetze/beId/${beId}`))
            .pipe(catchError(handleError));
    }

    getMassnahmeTeilnehmerplaetzeNextMonthByBeId(beId: number, month: number, year: number): Observable<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages>(
                setBaseUrl(`/rest/amm/massnahmen/teilnehmerplaetze/beId/${beId}/month/${month}/year/${year}/next-month`)
            )
            .pipe(catchError(handleError));
    }

    getMassnahmeTeilnehmerplaetzePreviousMonthByBeId(beId: number, month: number, year: number): Observable<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages>(
                setBaseUrl(`/rest/amm/massnahmen/teilnehmerplaetze/beId/${beId}/month/${month}/year/${year}/previous-month`)
            )
            .pipe(catchError(handleError));
    }

    calculatePlanwert(planwert: PlanwertDTO): Observable<BaseResponseWrapperPlanwertDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/planwert/calculate`), planwert).pipe(catchError(handleError));
    }

    savePlanwert(planwert: PlanwertDTO): Observable<BaseResponseWrapperPlanwertDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/planwert`), planwert).pipe(catchError(handleError));
    }

    deletePlanwert(planwertId: number): Observable<BaseResponseWrapperPlanwertDTOWarningMessages> {
        return this.http.delete<BaseResponseWrapperPlanwertDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/planwert/${planwertId}`)).pipe(catchError(handleError));
    }

    getProduktButtons(produktId: number): Observable<BaseResponseWrapperListButtonsEnumWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListButtonsEnumWarningMessages>(setBaseUrl(`/rest/amm/planung/produkt/${produktId}/planwerte/buttons`))
            .pipe(catchError(handleError));
    }

    getDfeButtons(dfeId: number): Observable<BaseResponseWrapperListButtonsEnumWarningMessages> {
        return this.http.get<BaseResponseWrapperListButtonsEnumWarningMessages>(setBaseUrl(`/rest/amm/planung/dfe/${dfeId}/planwerte/buttons`)).pipe(catchError(handleError));
    }

    getMassnahmeButtons(massnahmeId: number): Observable<BaseResponseWrapperListButtonsEnumWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListButtonsEnumWarningMessages>(setBaseUrl(`/rest/amm/planung/massnahme/${massnahmeId}/planwerte/buttons`))
            .pipe(catchError(handleError));
    }

    getPlanwertControllingwerte(planwertId: number): Observable<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages>(setBaseUrl(`/rest/amm/planung/planwert/${planwertId}/controllingwerte`))
            .pipe(catchError(handleError));
    }

    savePlanwertControllingwerte(
        planwertId: number,
        kostenverteilschluessel: string,
        aufteilungBudgetjahr: AufteilungBudgetjahrDTO
    ): Observable<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages>(
                setBaseUrl(`/rest/amm/planung/planwert/${planwertId}/kostenverteilschluessel/${kostenverteilschluessel}/controllingwerte`),
                aufteilungBudgetjahr
            )
            .pipe(catchError(handleError));
    }

    deletePlanwertControllingwerteRow(
        planwertId: number,
        geldgeberId: number,
        aufteilungBudgetjahr: AufteilungBudgetjahrDTO
    ): Observable<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages> {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: aufteilungBudgetjahr
        };

        return this.http
            .delete<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages>(
                setBaseUrl(`/rest/amm/planung/planwert/${planwertId}/controllingwerte/geldgeber/${geldgeberId}`),
                options
            )
            .pipe(catchError(handleError));
    }

    calculatePlanwertControllingwerte(
        planwertId: number,
        kostenverteilschluessel: string,
        budjetJahr: AufteilungBudgetjahrDTO
    ): Observable<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAufteilungBudgetjahrDTOWarningMessages>(
                setBaseUrl(`/rest/amm/planung/planwert/${planwertId}/kostenverteilschluessel/${kostenverteilschluessel}/controllingwerte/berechnen`),
                budjetJahr
            )
            .pipe(catchError(handleError));
    }

    getKursTeilnehmerlisteForDM(dfeId: number): Observable<BaseResponseWrapperListTeilnehmerDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperListTeilnehmerDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/teilnehmerliste/dfeId/${dfeId}`)).pipe(catchError(handleError));
    }

    getKursWartelisteForDM(dfeId: number): Observable<BaseResponseWrapperListTeilnehmerDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListTeilnehmerDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/teilnehmerliste/warteliste/dfeId/${dfeId}`))
            .pipe(catchError(handleError));
    }
}
