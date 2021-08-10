import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StesDetailsGrunddatenComponent } from './stes-details-grunddaten.component';
import { DbTranslateServiceStub, MockTextControlClearDirective, MockTranslatePipe } from '../../../../../../../../tests/helpers';
import { NgbModal, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { of, Subscriber } from 'rxjs';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { APP_BASE_HREF, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import {
    AbbrechenModalComponent,
    AlkZahlstelleAutosuggestComponent,
    CloseTabDirective,
    DbTranslatePipe,
    ToolboxService,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    PermissionDirective
} from 'src/app/shared';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageBus } from '@shared/services/message-bus';

export class NgbModalStub {
    public open(key: any, options?: any): any {
        return { result: of(key).toPromise() };
    }
}

class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

let locationStub: Partial<Location> = { subscribe: () => new Subscriber() };

describe('StesDetailsGrunddatenComponent', () => {
    const letzteAktualisierungMock = {
        alk: '02',
        angabenVersichertePerson: false,
        anmeldedatumGemeinde: null,
        anmeldedatumRav: 1546473600000,
        arbeitsmarktsituationBerechnet: {
            codeId: 9569,
            textDe: 'Arbeitslose',
            textFr: 'Chômeurs',
            textIt: 'Disoccupati'
        },
        benutzerstelle: {
            benuStelleCode: 'CHA20',
            benutzerId: 87,
            benuStelleNameDe: 'seco-Direktion für Arbeit   Arbeitsmarkt/Arbeitslosen-  versicherung',
            benuStelleNameFr: 'seco-Direction du travail   Marché du travail/Assurance chômage',
            benuStelleNameIt: 'seco-Direzione del lavoro   Mercato del lavoro/Assicurzione contro la disoccupazione'
        },
        email: null,
        erwerbssituationAktuell: { codeId: 9549, textDe: 'Arbeitslos', textFr: 'Au chômage', textIt: 'Disoccupato' },
        erwerbssituationBeiAnmeldung: {
            codeId: 9543,
            textDe: 'Erstmals auf Stellensuche',
            textFr: "Pour la 1ère fois à la recherche d'emploi",
            textIt: 'Ricerca primo impiego'
        },
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
        zahlstelleNr: '000',
        leistungsimportEUEFTA: true
    };

    let component: StesDetailsGrunddatenComponent;
    let fixture: ComponentFixture<StesDetailsGrunddatenComponent>;
    let fehlermeldungService: FehlermeldungenService;
    let ngbModalStub: NgbModalStub;
    let serviceDataRestService: StesDataRestService;
    let formBuilder: FormBuilder;
    let translateService: TranslateServiceStub;
    let store = {};

    const mockLocalStorage = {
        getItem: (key: string): string => {
            return key in store ? store[key] : null;
        },
        setItem: (key: string, value: string) => {
            store[key] = `${value}`;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesDetailsGrunddatenComponent,
                MockTranslatePipe,
                MockTextControlClearDirective,
                CloseTabDirective,
                AlkZahlstelleAutosuggestComponent,
                DbTranslatePipe,
                AbbrechenModalComponent,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective,
                PermissionDirective
            ],
            imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, NgbTooltipModule.forRoot(), NgbPopoverModule.forRoot()],
            providers: [
                FormBuilder,
                StesDataRestService,
                FehlermeldungenService,
                ToolboxService,
                MessageBus,
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: NotificationService, useClass: MockNotificationService },
                { provide: NgbModal, useClass: NgbModal },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                DatePipe,
                {
                    provide: Router,
                    useValue: {
                        events: of({})
                    }
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 }),
                            data: of({ isAnmeldung: true })
                        },
                        paramMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                SpinnerService,
                { provide: Location, useValue: locationStub },
                { provide: APP_BASE_HREF, useValue: '/' },
                AuthenticationService,
                AuthenticationRestService
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: [AbbrechenModalComponent]
                }
            })
            .compileComponents();
        spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
        spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
        const item = JSON.stringify({
            userDto: {
                benutzerstelleName: 'T7018',
                benutzerDetailId: 'T7018',
                benutzerLogin: 'T7018',
                id: 1,
                nachname: 'Meier',
                value: 'test',
                vorname: 'Lebron'
            }
        });
        localStorage.setItem('currentUser', item);
        fixture = TestBed.createComponent(StesDetailsGrunddatenComponent);
        fehlermeldungService = TestBed.get(FehlermeldungenService);
        ngbModalStub = TestBed.get(NgbModal);
        serviceDataRestService = TestBed.get(StesDataRestService);
        component = fixture.componentInstance;
        component.letzteAktualisierung = letzteAktualisierungMock;
        component.transferAnAlkTextDTO = [
            {
                code: '0',
                codeId: 1419,
                kurzTextDe: 'noch keine Daten übermittelt',
                kurzTextFr: 'données pas encore transmises',
                kurzTextIt: 'dati non ancora trasmessi',
                ojbVersion: 0,
                ownerId: 0,
                textDe: 'noch keine Daten übermittelt',
                textFr: 'données pas encore transmises',
                textIt: 'dati non ancora trasmessi'
            },
            {
                code: '1',
                codeId: 1420,
                kurzTextDe: 'Daten übermittelt am',
                kurzTextFr: 'données transmises le',
                kurzTextIt: 'dati trasmessi il',
                ojbVersion: 0,
                ownerId: 0,
                textDe: 'Daten übermittelt am',
                textFr: 'données transmises le',
                textIt: 'dati trasmessi il'
            }
        ];

        formBuilder = TestBed.get(FormBuilder);
        component.ngOnInit();
        fixture.detectChanges();
        translateService = TestBed.get(TranslateService);
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should unsubscribe on destroy', () => {
        component['observeClickActionSub'] = of(true).subscribe();
        component['observeClickActionSubFooter'] = of(true).subscribe();
        component['dataSubscription'] = of(true).subscribe();
        //component['translateService'] = of(true).subscribe();

        component.ngOnDestroy();

        expect(component['observeClickActionSub'].closed).toBeTruthy();
        expect(component['observeClickActionSubFooter'].closed).toBeTruthy();
        expect(component['dataSubscription'].closed).toBeTruthy();
    });

    it('form invalid when empty', () => {
        expect(component.grunddatenForm.valid).toBeFalsy();
    });

    it('anmeldedatumrav field validity', () => {
        const anmeldungFormGroup = component.grunddatenForm.get('anmeldung') as FormGroup;
        let errors = {};
        let anmeldedatumrav = anmeldungFormGroup.controls.anmeldedatumrav;
        errors = anmeldedatumrav.errors || {};

        expect(errors['required']).toBeTruthy();
    });

    it('stellenantrittab field validity', () => {
        const anmeldungFormGroup = component.grunddatenForm.get('anmeldung') as FormGroup;
        let errors = {};
        let stellenantrittab = anmeldungFormGroup.controls.stellenantrittab;
        errors = stellenantrittab.errors || {};

        expect(errors['required']).toBeTruthy();
    });

    it('leistungsbezug field validity', () => {
        const leistungsbezugFormGroup = component.grunddatenForm.get('leistungsbezug') as FormGroup;
        let errors = {};
        let leistungsbezug = leistungsbezugFormGroup.controls.leistungsbezug;
        errors = leistungsbezug.errors || {};
        expect(errors['required']).toBeTruthy();
    });

    it('personalberater field validity', () => {
        const zustaendigkeitFormGroup = component.grunddatenForm.get('zustaendigkeit') as FormGroup;
        let errors = {};
        let personalberater = zustaendigkeitFormGroup.controls.personalberater;
        errors = personalberater.errors || {};

        expect(errors['required']).toBeTruthy();
    });

    it('should fill alk and zahlstelle in form', () => {
        component.fillDataZahlstelle({
            zahlstelleId: 1,
            inputElementOneValue: '02000',
            inputElemenTwoValue: 'Bern'
        });

        expect(component.leistungsbezugForm.controls.alk.value.id).toEqual(1);
    });

    it('string to NgbDate', () => {
        expect(component.stringToNgbDate('20.12.2018')).toEqual({ day: 20, month: 12, year: 2018 });
    });

    it('validate Avp Produzieren', () => {
        const zentralerdruckFForm = component.grunddatenForm.get('zentralerdruckformulare') as FormGroup;
        zentralerdruckFForm.controls.avpproduzieren.enable();

        component.validateAvpProduzieren(letzteAktualisierungMock);
        expect(zentralerdruckFForm.controls.avpproduzieren.disabled).toBeFalsy();
    });

    it('definiere FormGroups', () => {
        component.defineFormGroups();

        expect(component.anmeldungForm).not.toBeUndefined();
        expect(component.zustaendigkeitForm).not.toBeUndefined();
        expect(component.erwerbssituationAForm).not.toBeUndefined();
        expect(component.hoechsteAausbildungForm).not.toBeUndefined();
        expect(component.leistungsbezugForm).not.toBeUndefined();
        expect(component.sachbearbeitungalkForm).not.toBeUndefined();
        expect(component.zentralerdruckFForm).not.toBeUndefined();
        expect(component.vermittlungsstoppForm).not.toBeUndefined();
    });

    it('should update formAktualisieren', () => {
        component.updateForm(letzteAktualisierungMock, true);

        expect(component.letzteAktualisierung).toEqual(letzteAktualisierungMock);
    });

    it('should update onSpeichern', () => {
        fixture.detectChanges();
        spyOn(component.grunddatenFormbuilder, 'mapToDTO').and.returnValue(letzteAktualisierungMock);
        spyOn(serviceDataRestService, 'createGrunddatenBearbeiten').and.returnValue(of(letzteAktualisierungMock));

        component.save();

        expect(component.letzteAktualisierung).toEqual(letzteAktualisierungMock);
    });
});
