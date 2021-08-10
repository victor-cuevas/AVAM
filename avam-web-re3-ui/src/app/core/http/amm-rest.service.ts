import { BaseResponseWrapperListTeilnehmerDTOWarningMessages } from './../../shared/models/dtos-generated/baseResponseWrapperListTeilnehmerDTOWarningMessages';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseResponseWrapperAmmGesuchFseDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmGesuchFseDTOWarningMessages';
import { setBaseUrl } from '@app/shared/services/setBaseUrl.function';
import { catchError } from 'rxjs/operators';
import { handleError } from '@app/shared/services/handle-error.function';
import { AmmGesuchFseDTO } from '@app/shared/models/dtos-generated/ammGesuchFseDTO';
import { BaseResponseWrapperAmmGesuchEazDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmGesuchEazDTOWarningMessages';
import { AmmGesuchEazDTO } from '@app/shared/models/dtos-generated/ammGesuchEazDTO';
import { BaseResponseWrapperAmmKostenAzDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmKostenAzDTOWarningMessages';
import { AmmKostenAzDTO } from '@app/shared/models/dtos-generated/ammKostenAzDTO';
import { BaseResponseWrapperCollectionIntegerWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionIntegerWarningMessages';
import { BaseResponseWrapperAmmEntscheidDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmEntscheidDTOWarningMessages';
import { AmmEntscheidDTO } from '@app/shared/models/dtos-generated/ammEntscheidDTO';
import { BaseResponseWrapperLongWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperLongWarningMessages';
import { BaseResponseWrapperAmmGesuchAzDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmGesuchAzDTOWarningMessages';
import { AmmGesuchAzDTO } from '@app/shared/models/dtos-generated/ammGesuchAzDTO';
import { BaseResponseWrapperBooleanWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperBooleanWarningMessages';
import { BaseResponseWrapperListAmmStesGeschaeftsfallDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListAmmStesGeschaeftsfallDTOWarningMessages';
import { BaseResponseWrapperAmmGesuchPewoDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmGesuchPewoDTOWarningMessages';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AmmGesuchPewoDTO } from '@app/shared/models/dtos-generated/ammGesuchPewoDTO';
import { BaseResponseWrapperAmmKostenFseDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmKostenFseDTOWarningMessages';
import { AmmKostenFseDTO } from '@app/shared/models/dtos-generated/ammKostenFseDTO';
import { BaseResponseWrapperAmmKostenEazDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmKostenEazDTOWarningMessages';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { AmmKostenEazDTO } from '@app/shared/models/dtos-generated/ammKostenEazDTO';
import { BaseResponseWrapperAmmKostenPewoDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmKostenPewoDTOWarningMessages';
import { AmmKostenPewoDTO } from '@app/shared/models/dtos-generated/ammKostenPewoDTO';
import { BaseResponseWrapperCollectionCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionCodeDTOWarningMessages';
import { AmmKostenKursDTO } from '@app/shared/models/dtos-generated/ammKostenKursDTO';
import { BaseResponseWrapperAmmKostenKursDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmKostenKursDTOWarningMessages';
import { BaseResponseWrapperAmmKostenSpesenDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmKostenSpesenDTOWarningMessages';
import { BaseResponseWrapperListAmmAngebotMassnahmenListeDTOWarningMessages } from '@dtos/baseResponseWrapperListAmmAngebotMassnahmenListeDTOWarningMessages';
import { AmmAngebotSuchenQueryParams } from '@app/shared/models/dtos-generated/ammAngebotSuchenQueryParams';
import { AmmKostenSpesenDTO } from '@app/shared/models/dtos-generated/ammKostenSpesenDTO';
import { BaseResponseWrapperAmmKostenBpDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmKostenBpDTOWarningMessages';
import { AmmKostenBpDTO } from '@app/shared/models/dtos-generated/ammKostenBpDTO';
import { BaseResponseWrapperAmmGeschaeftHandleWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmGeschaeftHandleWarningMessages';
import { BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages';
import { BaseResponseWrapperListElementKategorieDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListElementKategorieDTOWarningMessages';
import { BaseResponseWrapperAmmAnbieterDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmAnbieterDTOWarningMessages';
import { AmmAnbieterDTO } from '@app/shared/models/dtos-generated/ammAnbieterDTO';
import { BaseResponseWrapperAmmDurchfuehrungsortDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmDurchfuehrungsortDTOWarningMessages';
import { alertChannelParam } from '@app/shared/components/alert/alert-channel-query-param';

@Injectable()
export class AmmRestService {
    constructor(private http: HttpClient) {}

    getStesAmmMassnahmen(stesId: string): Observable<any> {
        return this.http.get<any>(setBaseUrl(`/rest/amm/stes-geschaeftsfall/${stesId}/massnahmen`)).pipe(catchError(handleError));
    }

    getAmmStesGeschaeftsfall(stesId: string): Observable<BaseResponseWrapperListAmmStesGeschaeftsfallDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/amm/stes-geschaeftsfall/${stesId}`)).pipe(catchError(handleError));
    }

    geschaeftsfallLoeschen(stesId: string, geschaeftsfallId: number): Observable<BaseResponseWrapperBooleanWarningMessages> {
        return this.http.delete<BaseResponseWrapperBooleanWarningMessages>(setBaseUrl(`/rest/amm/stes-geschaeftsfall/${stesId}/${geschaeftsfallId}`)).pipe(catchError(handleError));
    }

    geschaeftsfallErsetzen(stesId: string, geschaeftsfallId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http
            .put<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/amm/stes-geschaeftsfall/${stesId}/${geschaeftsfallId}/ersetzen`), {})
            .pipe(catchError(handleError));
    }

    getButtonsAmmGesuch(stesId: string, geschaeftsfallId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http
            .get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/stes-geschaeftsfall/${stesId}/${geschaeftsfallId}/gesuch-buttons`))
            .pipe(catchError(handleError));
    }

    // AZ Gesuch
    getGesuchAz(stesId: string, ammGeschaeftsfallId: number): Observable<BaseResponseWrapperAmmGesuchAzDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmGesuchAzDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-az/${stesId}/${ammGeschaeftsfallId}`))
            .pipe(catchError(handleError));
    }

    createGesuchAz(stesId: string): Observable<BaseResponseWrapperAmmGesuchAzDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmGesuchAzDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-az/${stesId}`), {}).pipe(catchError(handleError));
    }

    updateGesuchAz(stesId: string, language: string, ammGesuchAzDTO: AmmGesuchAzDTO): Observable<BaseResponseWrapperAmmGesuchAzDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmGesuchAzDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-az/${stesId}/${language}`), ammGesuchAzDTO)
            .pipe(catchError(handleError));
    }

    zuruecknehmenGesuchAz(stesId: string, geschaeftsfallId: number): Observable<BaseResponseWrapperAmmGesuchAzDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmGesuchAzDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-az/${stesId}/${geschaeftsfallId}/zuruecknehmen`), {})
            .pipe(catchError(handleError));
    }

    folgegesuchErstellenAz(stesId: string, geschaeftsfallId: number): Observable<BaseResponseWrapperAmmGesuchAzDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperAmmGesuchAzDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-az/${stesId}/${geschaeftsfallId}`), {})
            .pipe(catchError(handleError));
    }

    // AZ Kosten
    getKostenAz(ammEntscheidId: number): Observable<BaseResponseWrapperAmmKostenAzDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAmmKostenAzDTOWarningMessages>(setBaseUrl(`/rest/amm/az/kosten/${ammEntscheidId}`)).pipe(catchError(handleError));
    }

    createKostenAz(ammEntscheidId: number, ammKostenAzDTO: AmmKostenAzDTO): Observable<BaseResponseWrapperAmmKostenAzDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmKostenAzDTOWarningMessages>(setBaseUrl(`/rest/amm/az/kosten/${ammEntscheidId}`), ammKostenAzDTO).pipe(catchError(handleError));
    }

    updateKostenAz(ammEntscheidId: number, ammKostenAzDTO: AmmKostenAzDTO): Observable<BaseResponseWrapperAmmKostenAzDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenAzDTOWarningMessages>(setBaseUrl(`/rest/amm/az/kosten/${ammEntscheidId}`), ammKostenAzDTO).pipe(catchError(handleError));
    }

    berechnenKostenAz(ammEntscheidId: number, ammKostenAzDTO: AmmKostenAzDTO): Observable<BaseResponseWrapperAmmKostenAzDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmKostenAzDTOWarningMessages>(setBaseUrl(`/rest/amm/az/kosten/${ammEntscheidId}/berechnen`), ammKostenAzDTO)
            .pipe(catchError(handleError));
    }

    getButtonsKostenAz(ammEntscheidId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http.get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/az/kosten/${ammEntscheidId}/buttons`)).pipe(catchError(handleError));
    }

    // EAZ Gesuch
    getGesuchEaz(stesId: string, ammGeschaeftsfallId: number): Observable<BaseResponseWrapperAmmGesuchEazDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmGesuchEazDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-eaz/${stesId}/${ammGeschaeftsfallId}`))
            .pipe(catchError(handleError));
    }

    createGesuchEaz(stesId: string): Observable<BaseResponseWrapperAmmGesuchEazDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmGesuchEazDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-eaz/${stesId}`), {}).pipe(catchError(handleError));
    }

    updateGesuchEaz(stesId: string, language: string, ammGesuchEazDTO: AmmGesuchEazDTO): Observable<BaseResponseWrapperAmmGesuchEazDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmGesuchEazDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-eaz/${stesId}/${language}`), ammGesuchEazDTO)
            .pipe(catchError(handleError));
    }

    zuruecknehmenGesuchEaz(stesId: string, geschaeftsfallId: number): Observable<BaseResponseWrapperAmmGesuchEazDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmGesuchEazDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-eaz/${stesId}/${geschaeftsfallId}/zuruecknehmen`), {})
            .pipe(catchError(handleError));
    }

    // EAZ Kosten
    getKostenEaz(ammEntscheidId: number): Observable<BaseResponseWrapperAmmKostenEazDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAmmKostenEazDTOWarningMessages>(setBaseUrl(`/rest/amm/eaz/kosten/${ammEntscheidId}`)).pipe(catchError(handleError));
    }

    createKostenEaz(eazKostenDTO: AmmKostenEazDTO): Observable<BaseResponseWrapperAmmKostenEazDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmKostenEazDTOWarningMessages>(setBaseUrl(`/rest/amm/eaz/kosten`), eazKostenDTO).pipe(catchError(handleError));
    }

    updateKostenEaz(eazKostenDTO: AmmKostenEazDTO): Observable<BaseResponseWrapperAmmKostenEazDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenEazDTOWarningMessages>(setBaseUrl(`/rest/amm/eaz/kosten`), eazKostenDTO).pipe(catchError(handleError));
    }

    berechnenKostenEaz(eazKostenDTO: AmmKostenEazDTO): Observable<BaseResponseWrapperAmmKostenEazDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenEazDTOWarningMessages>(setBaseUrl(`/rest/amm/eaz/kosten/berechnen`), eazKostenDTO).pipe(catchError(handleError));
    }

    getButtonsKostenEaz(ammEntscheidId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http.get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/eaz/kosten/${ammEntscheidId}/buttons`)).pipe(catchError(handleError));
    }

    // FSE Gesuch
    getGesuchFse(stesId: string, ammGeschaeftsfallId: number): Observable<BaseResponseWrapperAmmGesuchFseDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmGesuchFseDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-fse/${stesId}/${ammGeschaeftsfallId}`))
            .pipe(catchError(handleError));
    }

    createGesuchFse(stesId: string): Observable<BaseResponseWrapperAmmGesuchFseDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmGesuchFseDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-fse/${stesId}`), {}).pipe(catchError(handleError));
    }

    updateGesuchFse(stesId: string, ammGesuchFseDTO: AmmGesuchFseDTO): Observable<BaseResponseWrapperAmmGesuchFseDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmGesuchFseDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-fse/${stesId}`), ammGesuchFseDTO).pipe(catchError(handleError));
    }

    zuruecknehmenGesuchFse(stesId: string, geschaeftsfallId: number): Observable<BaseResponseWrapperAmmGesuchFseDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmGesuchFseDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-fse/${stesId}/${geschaeftsfallId}/zuruecknehmen`), {})
            .pipe(catchError(handleError));
    }

    // FSE Kosten
    getKostenFse(ammEntscheidId: number): Observable<BaseResponseWrapperAmmKostenFseDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAmmKostenFseDTOWarningMessages>(setBaseUrl(`/rest/amm/fse/kosten/${ammEntscheidId}`)).pipe(catchError(handleError));
    }

    createKostenFse(fseKostenDTO: AmmKostenFseDTO): Observable<BaseResponseWrapperAmmKostenFseDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmKostenFseDTOWarningMessages>(setBaseUrl(`/rest/amm/fse/kosten`), fseKostenDTO).pipe(catchError(handleError));
    }

    updateKostenFse(fseKostenDTO: AmmKostenFseDTO): Observable<BaseResponseWrapperAmmKostenFseDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenFseDTOWarningMessages>(setBaseUrl(`/rest/amm/fse/kosten`), fseKostenDTO).pipe(catchError(handleError));
    }

    berechnenKostenFse(fseKostenDTO: AmmKostenFseDTO): Observable<BaseResponseWrapperAmmKostenFseDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenFseDTOWarningMessages>(setBaseUrl(`/rest/amm/fse/kosten/berechnen`), fseKostenDTO).pipe(catchError(handleError));
    }

    getButtonsKostenFse(ammEntscheidId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http.get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/fse/kosten/${ammEntscheidId}/buttons`)).pipe(catchError(handleError));
    }

    // PEWO Gesuch
    getGesuchPewo(stesId: string, ammGeschaeftsfallId: number): Observable<BaseResponseWrapperAmmGesuchPewoDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmGesuchPewoDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-pewo/${stesId}/${ammGeschaeftsfallId}`))
            .pipe(catchError(handleError));
    }

    createGesuchPewo(stesId: string): Observable<BaseResponseWrapperAmmGesuchPewoDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmGesuchPewoDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-pewo/${stesId}`), {}).pipe(catchError(handleError));
    }

    updateGesuchPewo(stesId: string, ammGesuchPewoDTO: AmmGesuchPewoDTO): Observable<BaseResponseWrapperAmmGesuchPewoDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmGesuchPewoDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-pewo/${stesId}`), ammGesuchPewoDTO)
            .pipe(catchError(handleError));
    }

    zuruecknehmenGesuchPewo(stesId: string, geschaeftsfallId: number): Observable<BaseResponseWrapperAmmGesuchPewoDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmGesuchPewoDTOWarningMessages>(setBaseUrl(`/rest/amm/stes-gesuch-pewo/${stesId}/${geschaeftsfallId}/zuruecknehmen`), {});
    }

    // PEWO Kosten
    getKostenPewo(ammEntscheidId: number): Observable<BaseResponseWrapperAmmKostenPewoDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAmmKostenPewoDTOWarningMessages>(setBaseUrl(`/rest/amm/pewo/kosten/${ammEntscheidId}`)).pipe(catchError(handleError));
    }

    createKostenPewo(ammKostenPewoDTO: AmmKostenPewoDTO): Observable<BaseResponseWrapperAmmKostenPewoDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmKostenPewoDTOWarningMessages>(setBaseUrl(`/rest/amm/pewo/kosten`), ammKostenPewoDTO).pipe(catchError(handleError));
    }

    updateKostenPewo(ammKostenPewoDTO: AmmKostenPewoDTO): Observable<BaseResponseWrapperAmmKostenPewoDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenPewoDTOWarningMessages>(setBaseUrl(`/rest/amm/pewo/kosten`), ammKostenPewoDTO).pipe(catchError(handleError));
    }

    berechnenKostenPewo(ammKostenPewoDTO: AmmKostenPewoDTO): Observable<BaseResponseWrapperAmmKostenPewoDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenPewoDTOWarningMessages>(setBaseUrl(`/rest/amm/pewo/kosten/berechnen`), ammKostenPewoDTO).pipe(catchError(handleError));
    }

    getButtonsKostenPewo(ammEntscheidId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http.get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/pewo/kosten/${ammEntscheidId}/buttons`)).pipe(catchError(handleError));
    }

    // AZ, EAZ, FSE, PEWO Entscheid
    getAmmEntscheid(ammEntscheidId: number): Observable<BaseResponseWrapperAmmEntscheidDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAmmEntscheidDTOWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${ammEntscheidId}`)).pipe(catchError(handleError));
    }

    updateAmmEntscheid(ammEntscheidDTO: AmmEntscheidDTO): Observable<BaseResponseWrapperAmmEntscheidDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmEntscheidDTOWarningMessages>(setBaseUrl(`/rest/amm/entscheid`), ammEntscheidDTO).pipe(catchError(handleError));
    }

    freigebenAmmEntscheid(ammEntscheidId: number): Observable<BaseResponseWrapperAmmEntscheidDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmEntscheidDTOWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${ammEntscheidId}/freigeben`), {}).pipe(catchError(handleError));
    }

    ueberarbeitenAmmEntscheid(ammEntscheidId: number): Observable<BaseResponseWrapperAmmEntscheidDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmEntscheidDTOWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${ammEntscheidId}/ueberarbeiten`), {})
            .pipe(catchError(handleError));
    }

    zuruecknehmenAmmEntscheid(ammEntscheidId: number): Observable<BaseResponseWrapperAmmEntscheidDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmEntscheidDTOWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${ammEntscheidId}/zuruecknehmen`), {})
            .pipe(catchError(handleError));
    }

    loeschenAmmEntscheid(ammEntscheidId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.delete<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${ammEntscheidId}`)).pipe(catchError(handleError));
    }

    ersetzenAmmEntscheid(ammEntscheidId: number): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.put<BaseResponseWrapperLongWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${ammEntscheidId}/ersetzen`), {}).pipe(catchError(handleError));
    }

    getButtonsAmmEntscheid(ammEntscheidId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http.get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${ammEntscheidId}/buttons`)).pipe(catchError(handleError));
    }

    getAmmEntscheidGruende(massnahme: string, entscheidArt: string): Observable<BaseResponseWrapperCollectionCodeDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperCollectionCodeDTOWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${massnahme}/${entscheidArt}/gruende`))
            .pipe(catchError(handleError));
    }

    getAmmEntscheidArten(massnahmenTyp: string, entscheidId: number): Observable<BaseResponseWrapperCollectionCodeDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperCollectionCodeDTOWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${massnahmenTyp}/${entscheidId}/arten`))
            .pipe(catchError(handleError));
    }

    getAmmEntscheidTypen(massnahmenTyp: string): Observable<BaseResponseWrapperCollectionCodeDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperCollectionCodeDTOWarningMessages>(setBaseUrl(`/rest/amm/entscheid/${massnahmenTyp}/typen`)).pipe(catchError(handleError));
    }

    getAmmBuchungParam(geschaeftsfallId: any, massnahmeTyp: any, stesId: any, massnahmeId?: any): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        return this.http
            .get(setBaseUrl(`/rest/amm/kurs/buchung`), { params: this.buildAmmGeschaeftHandleParams(geschaeftsfallId, massnahmeTyp, stesId, massnahmeId) })
            .pipe(catchError(handleError));
    }

    updateDurchfuehrungsortAmmBuchungParam(
        buchungParam: AmmBuchungParamDTO,
        stesId: string,
        massnahmeType: string,
        geschaeftsfallId: number,
        locale: string
    ): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmBuchungParamDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/durchfuehrungsort/update/locale/${locale}`), buchungParam, {
                params: this.buildAmmGeschaeftHandleParams(geschaeftsfallId, massnahmeType, stesId)
            })
            .pipe(catchError(handleError));
    }

    getButtonsDurchfuehrungsort(gfId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http
            .get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/kurs/durchfuehrungsort/geschaeftsfall/${gfId}/buttons`))
            .pipe(catchError(handleError));
    }

    zuruecknehmenBuchung(geschaeftsfallId: number, massnahmeTyp: string, locale: string): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        const params = new HttpParams().set('geschaeftsfallId', geschaeftsfallId.toString()).set('massnahmeTyp', massnahmeTyp);
        return this.http.post(setBaseUrl(`/rest/amm/kurs/buchung/zuruecknehmen/locale/${locale}`), null, { params }).pipe(catchError(handleError));
    }

    getBeschreibungAmmBuchungParam(gfId: number, massnahmeTyp: string): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        return this.http.get(setBaseUrl(`/rest/amm/kurs/beschreibung/geschaeftsfall/${gfId}/massnahme-typ/${massnahmeTyp}`)).pipe(catchError(handleError));
    }

    updateBeschreibungAmmBuchungParam(
        buchungParam: AmmBuchungParamDTO,
        massnahmeTyp: string,
        stesId: string,
        language: string
    ): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        return this.http.put(setBaseUrl(`/rest/amm/kurs/beschreibung/stes/${stesId}/massnahme-typ/${massnahmeTyp}/${language}`), buchungParam).pipe(catchError(handleError));
    }

    saveBpApIndividuel(
        buchungParam: AmmBuchungParamDTO,
        massnahmeTyp: string,
        massnahmeId: number,
        stesId: string,
        geschaeftsfallId: number,
        locale: string
    ): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        const params = new HttpParams()
            .set('stesId', stesId)
            .set('geschaeftsfallId', geschaeftsfallId.toString())
            .set('massnahmeTyp', massnahmeTyp)
            .set('massnahmeId', massnahmeId.toString());

        return this.http
            .post<BaseResponseWrapperAmmBuchungParamDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/buchung/bpap/save/locale/${locale}`), buchungParam, { params })
            .pipe(catchError(handleError));
    }

    saveKursIndividuel(
        buchungParam: AmmBuchungParamDTO,
        massnahmeTyp: string,
        massnahmeId: number,
        stesId: string,
        geschaeftsfallId: number,
        locale: string
    ): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        const params = new HttpParams()
            .set('stesId', stesId)
            .set('geschaeftsfallId', geschaeftsfallId.toString())
            .set('massnahmeTyp', massnahmeTyp)
            .set('massnahmeId', massnahmeId.toString());

        return this.http
            .post<BaseResponseWrapperAmmBuchungParamDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/buchung/individuell/save/locale/${locale}`), buchungParam, { params })
            .pipe(catchError(handleError));
    }

    saveIndividuellImAngebot(
        buchungParam: AmmBuchungParamDTO,
        massnahmeTyp: string,
        stesId: string,
        geschaeftsfallId: number,
        massnahmeId: number,
        locale: string
    ): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        const params = new HttpParams()
            .set('stesId', stesId)
            .set('geschaeftsfallId', geschaeftsfallId.toString())
            .set('massnahmeTyp', massnahmeTyp)
            .set('massnahmeId', massnahmeId.toString());
        return this.http
            .post<BaseResponseWrapperAmmBuchungParamDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/buchung/imangebot/save/locale/${locale}`), buchungParam, { params })
            .pipe(catchError(handleError));
    }

    getGesetzlicherTypId(code: string): Observable<BaseResponseWrapperLongWarningMessages> {
        return this.http.get(setBaseUrl(`/rest/amm/administration/gesetzlichertypid/code/${code}`)).pipe(catchError(handleError));
    }

    getStrukturElementPath(elementId: number, channel?: string): Observable<any> {
        return this.http.get(setBaseUrl(`/rest/amm/administration/path/element/${elementId}`), { params: alertChannelParam(channel) }).pipe(catchError(handleError));
    }

    getBuchungsStati(gfId: number, massnahmeTyp: string): Observable<BaseResponseWrapperListCodeDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListCodeDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/buchung/buchungsstati/geschaeftsfall/${gfId}/massnahme-typ/${massnahmeTyp}`))
            .pipe(catchError(handleError));
    }

    saveKollektivKurs(
        stesId: number,
        massnahmeTyp: string,
        massnahmeId: number,
        geschaeftsfallId: number,
        locale: string,
        data: AmmBuchungParamDTO
    ): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        const urlParams = new HttpParams()
            .set('geschaeftsfallId', geschaeftsfallId ? geschaeftsfallId.toString() : '0')
            .set('stesId', stesId.toString())
            .set('massnahmeTyp', massnahmeTyp)
            .set('massnahmeId', massnahmeId.toString());

        return this.http.post<BaseResponseWrapperAmmBuchungParamDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/buchung/kollektiv/save/locale/${locale}`), data, {
            params: urlParams
        });
    }

    saveBuchungPsAk(
        stesId: any,
        massnahmeTyp: any,
        massnahmeId: any,
        geschaeftsfallId: number,
        locale: string,
        data: AmmBuchungParamDTO
    ): Observable<BaseResponseWrapperAmmBuchungParamDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmBuchungParamDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/buchung/psak/save/locale/${locale}`), data, {
            params: this.buildAmmGeschaeftHandleParams(geschaeftsfallId, massnahmeTyp, stesId, massnahmeId)
        });
    }

    // Kurs Individuell, Kurs Individuell im Angebot Kosten
    getKostenIndividuell(ammEntscheidId: number): Observable<BaseResponseWrapperAmmKostenKursDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAmmKostenKursDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/kosten/entscheid/${ammEntscheidId}`)).pipe(catchError(handleError));
    }

    getButtonsKostenIndividuell(ammEntscheidId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http
            .get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/kurs/kosten/entscheid/${ammEntscheidId}/buttons`))
            .pipe(catchError(handleError));
    }

    createKostenIndividuell(ammKostenKursDTO: AmmKostenKursDTO): Observable<BaseResponseWrapperAmmKostenKursDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmKostenKursDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/kosten`), ammKostenKursDTO).pipe(catchError(handleError));
    }

    updateKostenIndividuell(ammKostenKursDTO: AmmKostenKursDTO): Observable<BaseResponseWrapperAmmKostenKursDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenKursDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/kosten`), ammKostenKursDTO).pipe(catchError(handleError));
    }

    berechnenKostenIndividuell(ammKostenKursDTO: AmmKostenKursDTO): Observable<BaseResponseWrapperAmmKostenKursDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenKursDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/kosten/berechnen`), ammKostenKursDTO).pipe(catchError(handleError));
    }

    uebernehmenKostenIndividuell(ammEntscheidId: number): Observable<BaseResponseWrapperAmmKostenKursDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmKostenKursDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/kosten/entscheid/${ammEntscheidId}/uebernehmen`))
            .pipe(catchError(handleError));
    }

    // Kosten Spesen
    getKostenSpesen(ammEntscheidId: number): Observable<BaseResponseWrapperAmmKostenSpesenDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAmmKostenSpesenDTOWarningMessages>(setBaseUrl(`/rest/amm/spesen/kosten/entscheid/${ammEntscheidId}`)).pipe(catchError(handleError));
    }

    getButtonsKostenSpesen(ammEntscheidId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http
            .get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/spesen/kosten/entscheid/${ammEntscheidId}/buttons`))
            .pipe(catchError(handleError));
    }

    createKostenSpesen(ammKostenSpesenDTO: AmmKostenSpesenDTO): Observable<BaseResponseWrapperAmmKostenSpesenDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmKostenSpesenDTOWarningMessages>(setBaseUrl(`/rest/amm/spesen/kosten`), ammKostenSpesenDTO).pipe(catchError(handleError));
    }

    updateKostenSpesen(ammKostenSpesenDTO: AmmKostenSpesenDTO): Observable<BaseResponseWrapperAmmKostenSpesenDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenSpesenDTOWarningMessages>(setBaseUrl(`/rest/amm/spesen/kosten`), ammKostenSpesenDTO).pipe(catchError(handleError));
    }

    berechnenKostenSpesen(ammKostenSpesenDTO: AmmKostenSpesenDTO): Observable<BaseResponseWrapperAmmKostenSpesenDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmKostenSpesenDTOWarningMessages>(setBaseUrl(`/rest/amm/spesen/kosten/berechnen`), ammKostenSpesenDTO)
            .pipe(catchError(handleError));
    }

    getMassnahmenartenOptions(): Observable<BaseResponseWrapperListCodeDTOWarningMessages> {
        return this.http.get(setBaseUrl(`/rest/amm/kurs/buchung/massnahmenarten`)).pipe(catchError(handleError));
    }

    getAngeboten(params: AmmAngebotSuchenQueryParams): Observable<BaseResponseWrapperListAmmAngebotMassnahmenListeDTOWarningMessages> {
        return this.http
            .post<BaseResponseWrapperListAmmAngebotMassnahmenListeDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/buchung/suchen/angeboten`), params)
            .pipe(catchError(handleError));
    }

    // Berufspraktikum Kosten
    getKostenBp(ammEntscheidId: number): Observable<BaseResponseWrapperAmmKostenBpDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAmmKostenBpDTOWarningMessages>(setBaseUrl(`/rest/amm/bp/kosten/entscheid/${ammEntscheidId}`)).pipe(catchError(handleError));
    }

    getButtonsKostenBp(ammEntscheidId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        return this.http
            .get<BaseResponseWrapperCollectionIntegerWarningMessages>(setBaseUrl(`/rest/amm/bp/kosten/entscheid/${ammEntscheidId}/buttons`))
            .pipe(catchError(handleError));
    }

    updateKostenBp(ammKostenBpDTO: AmmKostenBpDTO): Observable<BaseResponseWrapperAmmKostenBpDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenBpDTOWarningMessages>(setBaseUrl(`/rest/amm/bp/kosten`), ammKostenBpDTO).pipe(catchError(handleError));
    }

    berechnenKostenBp(ammKostenBpDTO: AmmKostenBpDTO): Observable<BaseResponseWrapperAmmKostenBpDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmKostenBpDTOWarningMessages>(setBaseUrl(`/rest/amm/bp/kosten/berechnen`), ammKostenBpDTO).pipe(catchError(handleError));
    }

    createKostenBp(ammKostenBpDTO: AmmKostenBpDTO): Observable<BaseResponseWrapperAmmKostenBpDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperAmmKostenBpDTOWarningMessages>(setBaseUrl(`/rest/amm/bp/kosten`), ammKostenBpDTO).pipe(catchError(handleError));
    }

    asalDatenUebernehmenKostenBp(ammKostenBpDTO: AmmKostenBpDTO): Observable<BaseResponseWrapperAmmKostenBpDTOWarningMessages> {
        return this.http
            .put<BaseResponseWrapperAmmKostenBpDTOWarningMessages>(setBaseUrl(`/rest/amm/bp/kosten/asal-daten-uebernehmen`), ammKostenBpDTO)
            .pipe(catchError(handleError));
    }

    // Kurs kollektiv
    getTeilnehmerliste(stesId: string, gfId: number, massnahmeTyp: string, massnahmeId: number): Observable<BaseResponseWrapperListTeilnehmerDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListTeilnehmerDTOWarningMessages>(
                setBaseUrl(`/rest/amm/kurs/teilnehmerliste/stes/${stesId}/geschaeftsfall/${gfId}/massnahme-typ/${massnahmeTyp}/massnahmeId/${massnahmeId}`)
            )
            .pipe(catchError(handleError));
    }

    getWarteliste(stesId: string, gfId: number, massnahmeTyp: string, massnahmeId: number): Observable<BaseResponseWrapperListTeilnehmerDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperListTeilnehmerDTOWarningMessages>(
                setBaseUrl(`/rest/amm/kurs/teilnehmerliste/warteliste/stes/${stesId}/geschaeftsfall/${gfId}/massnahme-typ/${massnahmeTyp}/massnahmeId/${massnahmeId}`)
            )
            .pipe(catchError(handleError));
    }

    deleteGeschaeftsfall(gfId: string): Observable<BaseResponseWrapperBooleanWarningMessages> {
        const params = new HttpParams().set('geschaeftsfallId', gfId);

        return this.http.delete<BaseResponseWrapperBooleanWarningMessages>(setBaseUrl(`/rest/amm/kurs/buchung`), { params }).pipe(catchError(handleError));
    }

    buchungErsetzen(gfId: string): Observable<BaseResponseWrapperAmmGeschaeftHandleWarningMessages> {
        const params = new HttpParams().set('geschaeftsfallId', gfId);

        return this.http.post<BaseResponseWrapperAmmGeschaeftHandleWarningMessages>(setBaseUrl(`/rest/amm/kurs/buchung/ersetzen`), null, { params }).pipe(catchError(handleError));
    }

    getAmmBuchungButtons(massnahmeId: number, massnahmeTyp: string, stesId: string, geschaeftsfallId: number): Observable<BaseResponseWrapperCollectionIntegerWarningMessages> {
        const params = new HttpParams()
            .set('massnahmeId', massnahmeId.toString())
            .set('massnahmeTyp', massnahmeTyp)
            .set('stesId', stesId)
            .set('geschaeftsfallId', geschaeftsfallId.toString());

        return this.http.get(setBaseUrl(`/rest/amm/kurs/buchung/buttons/search`), { params }).pipe(catchError(handleError));
    }

    anbieterUebernehmen(massnahmeTyp: string, geschaeftsfallId: number): Observable<BaseResponseWrapperAmmDurchfuehrungsortDTOWarningMessages> {
        const params = new HttpParams().set('massnahmeTyp', massnahmeTyp).set('geschaeftsfallId', geschaeftsfallId.toString());

        return this.http.get(setBaseUrl(`/rest/amm/kurs/durchfuehrungsort/uebernehmen`), { params }).pipe(catchError(handleError));
    }

    getAmmTeilnehmerplaetze(gfId: number, massnahmeTyp: string, stesId: string): Observable<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages> {
        return this.http
            .get<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages>(
                setBaseUrl(`/rest/amm/kurs/teilnehmerplaetze/geschaeftsfall/${gfId}/massnahme-typ/${massnahmeTyp}/stes/${stesId}`)
            )
            .pipe(catchError(handleError));
    }

    getAmmTeilnehmerplaetzeNextMonth(
        geschaeftsfallId: number,
        massnahmeTyp: string,
        month: number,
        year: number,
        stesId: string
    ): Observable<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages> {
        const params = new HttpParams()
            .set('geschaeftsfallId', geschaeftsfallId.toString())
            .set('massnahmeTyp', massnahmeTyp)
            .set('stesId', stesId);

        return this.http
            .get<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/teilnehmerplaetze/month/${month}/year/${year}/next-month`), { params })
            .pipe(catchError(handleError));
    }

    getAmmTeilnehmerplaetzePreviousMonth(
        geschaeftsfallId: number,
        massnahmeTyp: string,
        month: number,
        year: number,
        stesId: string
    ): Observable<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages> {
        const params = new HttpParams()
            .set('geschaeftsfallId', geschaeftsfallId.toString())
            .set('massnahmeTyp', massnahmeTyp)
            .set('stesId', stesId);

        return this.http
            .get<BaseResponseWrapperAmmTeilnehmerplatzlisteDTOWarningMessages>(setBaseUrl(`/rest/amm/kurs/teilnehmerplaetze/month/${month}/year/${year}/previous-month`), {
                params
            })
            .pipe(catchError(handleError));
    }

    getElementkategoriesByAuthorizationKeyScope(scope: string): Observable<BaseResponseWrapperListElementKategorieDTOWarningMessages> {
        return this.http.get<any>(setBaseUrl(`/rest/amm/administration/elementkategorie/keyscope/${scope}`)).pipe(catchError(handleError));
    }

    getAnbieter(unternehmenId: number): Observable<BaseResponseWrapperAmmAnbieterDTOWarningMessages> {
        return this.http.get<BaseResponseWrapperAmmAnbieterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/${unternehmenId}`)).pipe(catchError(handleError));
    }

    updateAnbieterZertifikate(dto: AmmAnbieterDTO): Observable<BaseResponseWrapperAmmAnbieterDTOWarningMessages> {
        return this.http.put<BaseResponseWrapperAmmAnbieterDTOWarningMessages>(setBaseUrl(`/rest/amm/anbieter/certificates`), dto).pipe(catchError(handleError));
    }

    private buildAmmGeschaeftHandleParams(geschaeftsfallId: any, massnahmeTyp: any, stesId: any, massnahmeId?: any) {
        return new HttpParams()
            .set('geschaeftsfallId', geschaeftsfallId ? `${geschaeftsfallId}` : ``)
            .set('massnahmeTyp', massnahmeTyp ? `${massnahmeTyp}` : ``)
            .set('massnahmeId', massnahmeId ? `${massnahmeId}` : ``)
            .set('stesId', `${stesId}`);
    }
}
