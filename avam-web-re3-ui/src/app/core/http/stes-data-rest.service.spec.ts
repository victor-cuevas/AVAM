import { TestBed } from '@angular/core/testing';
import { StesDataRestService } from '../../core/http/stes-data-rest.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { Zahlstelle } from 'src/app/shared/models/zahlstelle.model';
import { StesHeaderDTO } from '@dtos/stesHeaderDTO';
import { UnternehmenQueryDTO } from '@dtos/unternehmenQueryDTO';
import { StatusEnum } from '@shared/classes/fixed-codes';

describe('StesDataRestService', () => {
    let httpTestingController: HttpTestingController;
    const baseUrl: string = environment.baseUrl;

    const headerUrl = baseUrl + '/rest/stes/1/de/header';
    const aktualisierungUrl = baseUrl + '/stes/aktualisierung';
    const getPersonalienUrlAnmelden = baseUrl + '/rest/stes/1/personalien/anmelden/de';
    const getPersonalienUrlBearbeiten = baseUrl + '/rest/stes/1/personalien/bearbeiten';
    const grunddatenAnmeldenUrl = baseUrl + '/rest/stes/1/grunddaten/anmelden';
    const grunddatenBearbeitenUrl = baseUrl + '/rest/stes/1/grunddaten/bearbeiten';
    const zusatzadresseUrl = baseUrl + '/rest/stes/1/zusatzadresse';
    const staatSuchenUrl = baseUrl + '/rest/common/staat-suchen/de/Ch';
    const nogaSuchenUrl = baseUrl + '/rest/common/noga-suchen/de/x01';
    const personalienCreateUrlBearbeiten = baseUrl + '/rest/stes/1/personalien/bearbeiten/de';
    const personalienCreateUrlAnmelden = baseUrl + '/rest/stes/1/personalien/anmelden/de';
    const plzUrlOrt = baseUrl + '/rest/common/plz-suchen/ort/de/de';
    const plzUrlPlzNr = baseUrl + '/rest/common/plz-suchen/plz/de/3000';
    const zahlstelleUrl = baseUrl + '/rest/common/zahlstellen-suchen';
    const schlagwortSuchenUrl = baseUrl + '/rest/common/schlagworte';
    const zasAbgleichUrl = baseUrl + '/rest/stes/zas';
    const unternehmenSuchenUrl = baseUrl + '/rest/common/unternehmen-suchen';
    const rahmenfristenUrl = baseUrl + '/rest/stes/1/rahmenfristen';
    const berufsdatenUrl = baseUrl + '/rest/stes/1/berufsdaten/86';
    const personenstammdatenUrl = baseUrl + '/rest/common/personenstammdaten';
    const fixedCodesUrl = baseUrl + '/rest/common/fixed-code/STATUS';
    const zasAbgleichMock: any = {
        data: [
            {
                personenNr: '123345',
                nationalitaetObject: {
                    staatId: 1,
                    code: null,
                    iso2Code: '',
                    iso3Code: '',
                    nameDe: 'Schweiz',
                    nameFr: null,
                    nameIt: null
                },
                nationalitaetId: 1,
                geschlechtId: 1,
                geburtsDatum: 2354546246,
                letzterZASAbgleich: 1330124400000,
                personStesId: 1234,
                versichertenNrList: [
                    {
                        personVersichertenNrId: 0,
                        personStesId: 1234,
                        versichertenNr: '1223435',
                        istAktuelleVersichertenNr: true
                    }
                ],
                name: 'Name',
                vorname: 'Vorname'
            }
        ],
        warning: null
    };
    const letzteAktualisierungMock = {
        alk: '02',
        angabenVersichertePerson: false,
        anmeldedatumGemeinde: null,
        anmeldedatumRav: 1546473600000,
        arbeitsmarktsituationBerechnet: { codeId: 9569, textDe: 'Arbeitslose', textFr: 'Chômeurs', textIt: 'Disoccupati' },
        benutzerstelle: {
            benutzerId: 87,
            benuStelleNameDe: 'seco-Direktion für Arbeit   Arbeitsmarkt/Arbeitslosen-  versicherung',
            benuStelleNameFr: 'seco-Direction du travail   Marché du travail/Assurance chômage',
            benuStelleNameIt: 'seco-Direzione del lavoro   Mercato del lavoro/Assicurzione contro la disoccupazione'
        },
        email: null,
        erwerbssituationAktuell: { codeId: 9549, textDe: 'Arbeitslos', textFr: 'Au chômage', textIt: 'Disoccupato' },
        erwerbssituationBeiAnmeldung: { codeId: 9543, textDe: 'Erstmals auf Stellensuche', textFr: "Pour la 1ère fois à la recherche d'emploi", textIt: 'Ricerca primo impiego' },
        erwerbssituationBerechnet: {
            codeId: 9555,
            textDe: 'Ganzarbeitslose, bei gesuchtem Beschäftigungsgrad >= 90%',
            textFr: "Chômeurs complets, à un taux d'occupation recherché >= 90 %",
            textIt: 'Totalmente disoccupati, con grado di occupazione ricercato >= 90%'
        },
        hoechsteAbgeschlosseneAusbildung: {
            codeId: 9512,
            textDe: 'Tertiär - Bachelor Fachhochschule od. äq.',
            textFr: 'Degré tertiaire – Bachelor haute école spécialisée ou équivalent',
            textIt: 'Livello terziario – Bachelor scuola universitaria professionale o equivalente'
        },
        kantonaleArbeitslosenhilfe: null,
        leistungsbezug: {
            codeId: 1132,
            textDe: 'ALE-Bezüger oder AM-TN (Arbeitslosenentschädigung)',
            textFr: 'pers. recevant IC ou participt MT (ind. de chôm.)',
            textIt: 'beneficiario ID o partec. ML (indenn. di disocc.)'
        },
        nachweisPersoenlicheArbeitsbemuehungen: true,
        name: null,
        ravWechsel: null,
        stellenantrittAb: 1548979200000,
        telefon: null,
        transferAnAlk: null,
        vermittlungsstopp: false,
        vorname: null,
        zahlstelle: { zahlstelleId: 4, kurznameDe: 'Bern', kurznameFr: 'Bern', kurznameIt: 'Bern' },
        zahlstelleNr: '000'
    };

    const testHeader: StesHeaderDTO = {
        name: 'David',
        vorname: 'Ryan',
        strasse: 'Holzweg',
        hausnummer: '33',
        plz: { postleitzahl: '3007', plzId: 3007, ortDe: 'Bern', ortFr: 'Berne', ortIt: 'Berna' },
        stesId: 'AD001314',
        alk: '02000',
        personalberaterVorname: 'Johannes',
        personalberaterName: 'Mayer',
        stesBenutzerEmail: 'Ryan.David@stes.com',
        stesBenutzerLogin: 'ryan.david',
        stesBenutzerVorname: 'Ryan',
        stesBenutzerName: 'David',
        datumLetzteAktualisierung: null,
        aktiv: true
    };

    const testAktualisierung = {
        ame: 'Müller',
        vorname: 'Peter',
        benutzerLogin: 'mueller.peter',
        datumLetzeAktualisierung: '2005-05-12T00:00:00.0000Z'
    };

    const personalienMock = {
        nameAVAM: 'Meier',
        vornameAVAM: 'Heinz',
        postfachWohnadresse: { plzId: 342, postleitzahl: 3000, ortDe: 'Bern', ortFr: 'Berne', ortIt: 'Berna' },
        strasseWohnadresse: null,
        hausNrWohnadresse: null,
        faxNr: null,
        telNrGeschaeft: null,
        telNrPrivat: '',
        mobileNr: '',
        email: null,
        schlagwortSTESListe: [],
        leistungsimportEUEFTA: false,
        aufenthaltsStatusID: 0,
        aufenthaltBis: null,
        einreiseDatum: null,
        personStesObject: {
            personenNr: '20000041',
            namePersReg: 'Meier',
            vornamePersReg: 'Heinz',
            geburtsDatum: 3715200000,
            geschlechtId: 1056,
            nationalitaetObject: { staatId: 1, code: '100', iso2Code: 'CH', iso3Code: 'CHE', nameDe: 'Schweiz', nameFr: 'Suisse', nameIt: 'Svizzera' },
            zivilstandId: 1487,
            letzterZASAbgleich: null,
            svNrFromZas: null
        },
        postfachNrWohnadresse: 0
    };

    const plzTestResult = [
        {
            plzId: 4436,
            postleitzahl: 1026,
            ortDe: 'Denges',
            ortFr: 'Denges',
            ortIt: 'Denges'
        }
    ];

    const testZahlstelleData: Zahlstelle = {
        zahlstelleId: '1',
        alkNr: '01',
        alkZahlstellenNr: '01000',
        zahlstelleNr: '000',
        kassenstatus: '1',
        kurznameDe: 'Zürich',
        kurznameFr: 'Zürich',
        kurznameIt: 'Zürich',
        standStrasse: '33 Zürcherstrasse 8',
        plz: {
            plzId: 606,
            postleitzahl: 8405,
            ortDe: 'Winterthur',
            ortFr: 'Winterthur',
            ortIt: 'Winterthur'
        }
    };

    const testRahmenfristenData = {
        rahmenfristId: 123,
        anspruch: {
            codeId: 1,
            textDe: 'Anspruchberechtigt',
            textFr: 'Anspruchberechtigt',
            textIt: 'Anspruchberechtigt'
        },
        alkNr: '60',
        zahlstelleNr: '725',
        datumRahmenfristVon: new Date('01.08.2014'),
        datumRahmenfristBis: new Date('31.07.2016')
    };

    const unternehmenQueryDTO: UnternehmenQueryDTO = {
        avamSuche: true,
        burNr: '',
        kundenberater: null,
        land: { staatId: 1, code: null, iso2Code: 'CH', iso3Code: null, nameDe: 'Schweiz', nameFr: null, nameIt: null },
        language: 'de',
        name: '',
        plzDTO: {
            plzId: 1,
            ortDe: 'Bern',
            postleitzahl: '3000'
        },
        strasse: '',
        sucheUmliegend: false,
        sucheWortBeliebig: false,
        uid: '',
        unternehmenStatusId: 1431
    };

    const unternehmenMock = [
        {
            name: 'test1 test2 test3',
            name1: 'test1',
            name2: 'test2',
            name3: 'test3',
            nogaCode: '433401',
            nogaDe: 'Malerei',
            nogaFr: 'Peinture',
            nogaId: 9870,
            nogaIt: 'Pittura',
            nogaTextDe: null,
            nogaTextFr: null,
            nogaTextIt: null,
            ortAusland: null,
            ortDe: 'Bern',
            ortFr: 'Berne',
            ortIt: 'Berna',
            plz: '3000',
            plzAusland: null,
            staatDe: 'Schweiz',
            staatFr: 'Suisse',
            staatId: 1,
            staatIt: 'Svizzera',
            statusDe: 'aktiv',
            statusFr: 'actif',
            statusId: 1431,
            statusIt: 'attivo',
            strasse: '',
            strasseNr: '',
            uidOrganisationId: null,
            unternehmenId: '21'
        }
    ];
    const PersonenstammdatenDTOMock = {
        personenNr: '12312312321',
        namePersReg: 'Name',
        vornamePersReg: 'Vorname',
        geburtsDatum: new Date(),
        svNrFromZas: '1213123',
        geschlecht: null,
        zivilStand: null
    };

    const fixedCodesMock = [
        {
            codeId: 1,
            textDe: 'StatusDe',
            textFr: 'StatusFr',
            textIt: 'StatusIt',
            kurznameDe: 'kurzStatusDe',
            kurznameFr: 'kurzStatusFr',
            kurznameIt: 'kurzStatusIt'
        }
    ];

    let service: StesDataRestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [StesDataRestService]
        });
        httpTestingController = TestBed.get(HttpTestingController);
        service = TestBed.get(StesDataRestService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(httpTestingController).toBeTruthy();
    });

    it('can test HttpClient.get for stes header', () => {
        service.getStesHeader('de', '1').subscribe(data => {
            expect(data).toEqual(testHeader);
        });

        const req = httpTestingController.expectOne(headerUrl);

        expect(req.request.method).toEqual('GET');

        req.flush(testHeader);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for stes zahlstelle component', () => {
        service.getAllZahlstellen().subscribe(data => {
            expect(data).toEqual(testZahlstelleData);
        });

        const req = httpTestingController.expectOne(zahlstelleUrl);

        expect(req.request.method).toEqual('GET');

        req.flush(testZahlstelleData);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error', done => {
        const emsg = '404 error';

        service.getStesHeader('de', '1').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(headerUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes createPersonalien bearbeiten', () => {
        const testId = '1';
        service.createPersonalienBearbeiten(testId, personalienMock, 'de').subscribe(data => {
            expect(data).toEqual(personalienMock);
        });

        const req = httpTestingController.expectOne(personalienCreateUrlBearbeiten);

        expect(req.request.method).toEqual('POST');

        req.flush(personalienMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in stes createPersonalien bearbeiten', done => {
        const emsg = '404 error';
        const testId = '1';

        service.createPersonalienBearbeiten(testId, personalienMock, 'de').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(personalienCreateUrlBearbeiten);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes createPersonalien anmelden', () => {
        const testId = '1';
        service.createPersonalienAnmelden(testId, personalienMock, 'de').subscribe(data => {
            expect(data).toEqual(personalienMock);
        });

        const req = httpTestingController.expectOne(personalienCreateUrlAnmelden);

        expect(req.request.method).toEqual('POST');

        req.flush(personalienMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in stes createPersonalien anmelden', done => {
        const emsg = '404 error';
        const testId = '1';

        service.createPersonalienAnmelden(testId, personalienMock, 'de').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(personalienCreateUrlAnmelden);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for 404 error in stes bearbeiten grunddaten', done => {
        const emsg = '404 error';

        service.getGrunddatenBearbeiten('1').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(grunddatenBearbeitenUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes bearbeiten grunddaten', () => {
        service.getGrunddatenBearbeiten('1').subscribe(data => {
            expect(data).toEqual(letzteAktualisierungMock);
        });

        const req = httpTestingController.expectOne(grunddatenBearbeitenUrl);

        expect(req.request.method).toEqual('GET');

        req.flush(letzteAktualisierungMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in stes anmelden grunddaten', done => {
        const emsg = '404 error';

        service.getGrunddatenAnmelden('1').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(grunddatenAnmeldenUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes anmelden grunddaten', () => {
        service.getGrunddatenAnmelden('1').subscribe(data => {
            expect(data).toEqual(letzteAktualisierungMock);
        });

        const req = httpTestingController.expectOne(grunddatenAnmeldenUrl);

        expect(req.request.method).toEqual('GET');

        req.flush(letzteAktualisierungMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in stes grunddaten anmelden', done => {
        const emsg = '404 error';

        service.createGrunddatenAnmelden('1', letzteAktualisierungMock).subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(grunddatenAnmeldenUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for 404 error in stes grunddaten bearbeiten', done => {
        const emsg = '404 error';

        service.createGrunddatenBearbeiten('1', letzteAktualisierungMock).subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(grunddatenBearbeitenUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes grunddaten anmelden', () => {
        service.createGrunddatenAnmelden('1', letzteAktualisierungMock).subscribe(data => {
            expect(data).toEqual(letzteAktualisierungMock);
        });

        const req = httpTestingController.expectOne(grunddatenAnmeldenUrl);

        expect(req.request.method).toEqual('POST');

        req.flush(letzteAktualisierungMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for stes grunddaten bearbeiten', () => {
        service.createGrunddatenBearbeiten('1', letzteAktualisierungMock).subscribe(data => {
            expect(data).toEqual(letzteAktualisierungMock);
        });

        const req = httpTestingController.expectOne(grunddatenBearbeitenUrl);

        expect(req.request.method).toEqual('POST');

        req.flush(letzteAktualisierungMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in getZusatzadrese', done => {
        const emsg = '404 error';

        service.getZusatzadresse('1').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(zusatzadresseUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes zusatzadresse', () => {
        service.getZusatzadresse('1').subscribe(data => {
            expect(data).toEqual(letzteAktualisierungMock);
        });

        const req = httpTestingController.expectOne(zusatzadresseUrl);

        expect(req.request.method).toEqual('GET');

        req.flush(letzteAktualisierungMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in getPersonalien bearbeiten', done => {
        const emsg = '404 error';

        service.getPersonalienBearbeiten('1').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(getPersonalienUrlBearbeiten);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes getPersonalien bearbeiten', () => {
        service.getPersonalienBearbeiten('1').subscribe(data => {
            expect(data).toEqual(personalienMock);
        });

        const req = httpTestingController.expectOne(getPersonalienUrlBearbeiten);

        expect(req.request.method).toEqual('GET');

        req.flush(personalienMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in getPersonalien anmelden', done => {
        const emsg = '404 error';

        service.getPersonalienAnmelden('1', 'de').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(getPersonalienUrlAnmelden);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes getPersonalien anmelden', () => {
        service.getPersonalienAnmelden('1', 'de').subscribe(data => {
            expect(data).toEqual(personalienMock);
        });

        const req = httpTestingController.expectOne(getPersonalienUrlAnmelden);

        expect(req.request.method).toEqual('GET');

        req.flush(personalienMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in getStaaten', done => {
        const emsg = '404 error';

        service.getStaaten('de', 'Ch').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(staatSuchenUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes getStaaten', () => {
        service.getStaaten('de', 'Ch').subscribe(data => {
            expect(data).toEqual(letzteAktualisierungMock);
        });

        const req = httpTestingController.expectOne(staatSuchenUrl);

        expect(req.request.method).toEqual('GET');

        req.flush(letzteAktualisierungMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for plz', () => {
        service.getPlzByOrt('de', 'de').subscribe(data => {
            expect(data).toEqual(plzTestResult);
        });

        const req = httpTestingController.expectOne(plzUrlOrt);

        expect(req.request.method).toEqual('GET');

        req.flush(plzTestResult);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in plz', done => {
        const emsg = '404 error';

        service.getPlzByOrt('de', 'de').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(plzUrlOrt);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for plz number', () => {
        service.getPlzByNumber('de', 3000).subscribe(data => {
            expect(data).toEqual(plzTestResult);
        });

        const req = httpTestingController.expectOne(plzUrlPlzNr);

        expect(req.request.method).toEqual('GET');

        req.flush(plzTestResult);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in plz number', done => {
        const emsg = '404 error';

        service.getPlzByNumber('de', 3000).subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(plzUrlPlzNr);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for 404 error in getNoga', done => {
        const emsg = '404 error';

        service.getNoga('de', 'x01').subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(nogaSuchenUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes getNoga', () => {
        service.getNoga('de', 'x01').subscribe(data => {
            expect(data).toEqual(letzteAktualisierungMock);
        });

        const req = httpTestingController.expectOne(nogaSuchenUrl);

        expect(req.request.method).toEqual('GET');

        req.flush(letzteAktualisierungMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in getSchlagworte', done => {
        const emsg = '404 error';

        service.getSchlagworte(StatusEnum.ALL).subscribe(
            data => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(schlagwortSuchenUrl + '?gueltigkeit=all&geschaeftsart=1&useBenutzer=false');
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('can test HttpClient.get for stes getSchlagworte', () => {
        service.getSchlagworte(StatusEnum.AKTIV).subscribe(data => {
            expect(data).toEqual(letzteAktualisierungMock);
        });

        const req = httpTestingController.expectOne(schlagwortSuchenUrl + '?gueltigkeit=active&geschaeftsart=1&useBenutzer=false');

        expect(req.request.method).toEqual('GET');

        req.flush(letzteAktualisierungMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for stes getRahmenfristen', () => {
        service.getRahmenfristen('1').subscribe(data => {
            expect(data).toEqual(testRahmenfristenData);
        });

        const req = httpTestingController.expectOne(rahmenfristenUrl);

        expect(req.request.method).toEqual('GET');

        req.flush(testRahmenfristenData);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for deleteBerufsqualifikation', () => {
        service.deleteBerufsqualifikation('1', '86').subscribe(data => {
            expect(data).toEqual(unternehmenMock);
        });

        const req = httpTestingController.expectOne(berufsdatenUrl);
        expect(req.request.method).toEqual('DELETE');

        req.flush(unternehmenMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in deleteBerufsqualifikation', done => {
        const emsg = '404 error';

        service.deleteBerufsqualifikation('1', '86').subscribe(
            () => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(berufsdatenUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

    it('get Personenstammdaten', () => {
        service.getPersonenstammdaten(PersonenstammdatenDTOMock).subscribe(data => {
            expect(data).toEqual(PersonenstammdatenDTOMock);
        });

        const req = httpTestingController.expectOne(personenstammdatenUrl);
        expect(req.request.method).toEqual('POST');

        req.flush(PersonenstammdatenDTOMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for Fixed codes', () => {
        service.getFixedCode('STATUS').subscribe(data => {
            expect(data).toEqual(fixedCodesMock);
        });

        const req = httpTestingController.expectOne(fixedCodesUrl);
        expect(req.request.method).toEqual('GET');

        req.flush(fixedCodesMock);

        httpTestingController.verify();
    });

    it('can test HttpClient.get for 404 error in getFixedCodes', done => {
        const emsg = '404 error';

        service.getFixedCode('STATUS').subscribe(
            () => fail('should have failed with the 404 error'),
            error => {
                expect(error).toEqual('Something bad happened; please try again later.');
                done();
            }
        );

        const req = httpTestingController.expectOne(fixedCodesUrl);
        req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });
});
