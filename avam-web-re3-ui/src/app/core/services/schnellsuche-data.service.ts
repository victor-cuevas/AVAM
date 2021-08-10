import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SchnellsucheRestService } from '../http/schnellsuche-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SchnellsucheDataService {
    constructor(private schnellsucheRestService: SchnellsucheRestService, private dbTranslateService: DbTranslateService) {}

    searchForStes(searchText: string): Observable<any> {
        const language: string = this.dbTranslateService.getCurrentLang();
        return this.schnellsucheRestService.searchForStes(language, searchText).pipe(map(this.mapStes()));
    }

    searchForArbeitgeber(searchText: string): Observable<any> {
        const language: string = this.dbTranslateService.getCurrentLang();
        return this.schnellsucheRestService.searchForArbeitgeber(language, searchText).pipe(map(this.mapUnternemhemn()));
    }

    searchForAnbieter(searchText: string): Observable<any> {
        const language: string = this.dbTranslateService.getCurrentLang();
        return this.schnellsucheRestService.searchForAnbieter(language, searchText).pipe(map(this.mapUnternemhemn()));
    }

    searchForFachberatung(searchText: string): Observable<any> {
        const language: string = this.dbTranslateService.getCurrentLang();
        return this.schnellsucheRestService.searchForFachberatung(language, searchText).pipe(map(this.mapUnternemhemn()));
    }

    private mapStes() {
        return a => {
            return a.data.map(item => {
                return {
                    stesId: item.stesId,
                    name: item.name,
                    vorname: item.vorname,
                    geburtsdatum: item.geburtsdatum,
                    strasseUndNummer: item.strasseUndNummer,
                    plz: item.plz,
                    ortDe: item.ortDe,
                    ortFr: item.ortFr,
                    ortIt: item.ortIt,
                    mobile: item.mobile,
                    telefonPrivat: item.telefonPrivat,
                    email: item.email
                };
            });
        };
    }

    private mapUnternemhemn() {
        return a => {
            return a.data.map(item => {
                let name1 = this.stripToEmpty(item.name1);
                let name2 = this.stripToEmpty(item.name2);
                let name3 = this.stripToEmpty(item.name3);
                let strasse = this.stripToEmpty(item.strasse);
                let strasseNr = this.stripToEmpty(item.strasseNr);
                return {
                    unternehmenId: item.unternehmenId,
                    name: `${name1} ${name2} ${name3}`.trim(),
                    strasseNummer: `${strasse} ${strasseNr}`,
                    plz: this.stripToEmpty(item.postleitzahl),
                    ort: this.stripToEmpty(this.dbTranslateService.translate(item, 'ort')),
                    staat: this.stripToEmpty(this.dbTranslateService.translate(item, 'staat')),
                    burNr: this.stripToEmpty(item.burId),
                    uid: this.formatUID(item.uidCategory, item.uid),
                    telefon: this.stripToEmpty(item.telefonNr)
                };
            });
        };
    }

    private stripToEmpty(value: any) {
        return value != null ? value.toString() : '';
    }
    
    private formatUID(uidCategory, uidOrganisationId) {
        return uidCategory && uidOrganisationId ? `${uidCategory}-${uidOrganisationId.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';
    }

    translate(object: any, propertyPrefix: string): string {
        return this.dbTranslateService.translate(object, propertyPrefix);
    }
}
