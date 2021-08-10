import { of, Subscription } from 'rxjs';
import { StesDetailsZusatzadresseComponent } from '../..';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalStub } from '../stes-details-grunddaten/stes-details-grunddaten.component.spec';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { MockTextControlClearDirective, MockTranslatePipe } from '../../../../../../../../tests/helpers';
import {
    AbbrechenModalComponent,
    CloseTabDirective,
    DbTranslatePipe,
    FormUtilsService,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    ToolboxService,
    PermissionDirective
} from 'src/app/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal, NgbModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { MessageBus } from '@shared/services/message-bus';
import { RouterTestingModule } from '@angular/router/testing';

class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        of(key);
    }
}

describe('StesDetailsZusatzadresseComponent', () => {
    let component: StesDetailsZusatzadresseComponent;
    let fixture: ComponentFixture<StesDetailsZusatzadresseComponent>;
    let serviceDataRestService: StesDataRestService;
    let formBuilder: FormBuilder;
    let ngbModalStub: NgbModalStub;
    let fehlermeldungSubscription: Subscription;
    let fehlermeldungService: FehlermeldungenService;

    const testAktualisierung = {
        data: {
            zusatzadressenTypID: 1,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 1000,
            plzObject: {
                plzId: 1,
                postleitzahl: 3000,
                ortDe: 'Bern',
                ortFr: 'Bern',
                ortIt: 'Bern'
            },
            staatObject: {
                staatId: 1,
                code: 'AA',
                iso2Code: 'CH',
                iso3Code: 'AAA',
                nameDe: 'Schweiz',
                nameFr: 'SAssss',
                nameIt: 'AAAAAA'
            },
            privatTelefon: '+234234',
            korrespondenzAdresse: true
        }
    };

    const testPersonalienData = {
        data: {
            aufenthaltBis: null,
            aufenthaltsStatusID: 0,
            einreiseDatum: null,
            email: null,
            faxNr: null,
            hausNrWohnadresse: '12',
            leistungsimportEUEFTA: false,
            mobileNr: '',
            nameAVAM: 'Meier',
            gemeindeNr: 'sssad',
            personStesObject: {
                geburtsDatum: 71193600000,
                geschlechtId: 1057,
                letzterZASAbgleich: null,
                namePersReg: 'Meier',
                nationalitaetObject: {
                    staatId: 1,
                    code: '100',
                    iso2Code: 'CH',
                    iso3Code: 'CHE',
                    nameDe: 'Schweiz'
                },
                personenNr: '20000042',
                svNrFromZas: null,
                vornamePersReg: 'Susanne',
                zivilstandId: 1487
            },
            postfachNrWohnadresse: 1213,
            postfachWohnadresse: {
                ortDe: 'Bern',
                ortFr: 'Berne',
                ortIt: 'Berna',
                plzId: 342,
                postleitzahl: 3000
            },
            schlagwortSTESListe: Array(0),
            strasseWohnadresse: 'Geor',
            telNrGeschaeft: null,
            telNrPrivat: '',
            vornameAVAM: 'Susanne'
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesDetailsZusatzadresseComponent,
                MockTranslatePipe,
                CloseTabDirective,
                MockTextControlClearDirective,
                DbTranslatePipe,
                AbbrechenModalComponent,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective,
                PermissionDirective
            ],
            imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, NgbModule, NgbTooltipModule.forRoot(), NgbPopoverModule.forRoot()],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                ObliqueHelperService,
                StesDataRestService,
                ToolboxService,
                [FehlermeldungenService],
                FormBuilder,
                { provide: NotificationService, useClass: MockNotificationService },
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
                { provide: TranslateService, useClass: TranslateServiceStub },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        }
                    }
                },
                SpinnerService,
                NgbModal,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                FormUtilsService
            ]
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: [AbbrechenModalComponent]
                }
            })
            .compileComponents();
    }));

    beforeEach(() => {
        formBuilder = TestBed.get(FormBuilder);
        serviceDataRestService = TestBed.get(StesDataRestService);
        fixture = TestBed.createComponent(StesDetailsZusatzadresseComponent);
        ngbModalStub = TestBed.get(NgbModal);
        fehlermeldungService = TestBed.get(FehlermeldungenService);
        component = fixture.componentInstance;
        const adresstypen: any[] = [
            { codeId: 26, textDe: 'test1', textFr: null, textIt: null, textKey: null, value: false, code: '1' },
            { codeId: 27, textDe: 'test2', textFr: null, textIt: null, textKey: null, value: false, code: '3' }
        ];
        component.zusatzadressTypen = adresstypen;
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should unsubscribe on destroy', () => {
        component['observeClickActionSub'] = of(true).subscribe();
        component['observeClickActionSubFooter'] = of(true).subscribe();
        component['dataSubscription'] = of(true).subscribe();

        component.ngOnDestroy();

        expect(component['observeClickActionSub'].closed).toBeTruthy();
        expect(component['observeClickActionSubFooter'].closed).toBeTruthy();
        expect(component['dataSubscription'].closed).toBeTruthy();
    });

    it('should create form', () => {
        const testFormBuilder = new FormBuilder();
        const zusatzadresseForm = testFormBuilder.group({
            zusatzadressenTypID: null,
            name: null,
            vorname: null,
            strasse: null,
            strasseNr: null,
            postfachNr: null,
            plz: formBuilder.group({
                postleitzahl: null,
                ort: null
            }),
            staat: null,
            privatTelefon: null,
            korrespondenzAdresse: null
        });
        component.ngOnInit();
        expect(JSON.stringify(component.zusatzadresseForm.value)).toBe(JSON.stringify(zusatzadresseForm.value));
    });

    it('show Korrespondenzadresse Warning if checked', () => {
        component.zusatzadresseForm.controls.korrespondenzAdresse.setValue(true);
        component.zusatzadresseForm.controls.zusatzadressenTypID.setValue(27);

        fehlermeldungSubscription = fehlermeldungService.getMessage().subscribe(message => {
            if (message) {
                expect(message.text).toEqual('stes.error.bearbeiten.herkunftsadressenichtkorreadresse');
                expect(message.type).toEqual('warning');
            }
        });

        component.validateKorrespondenzAdresse();
        fehlermeldungSubscription.unsubscribe();
    });

    it('should validateKorrespondezAdresse be false', () => {
        component.zusatzadresseForm.controls.korrespondenzAdresse.setValue(true);
        component.zusatzadresseForm.controls.zusatzadressenTypID.setValue('27');

        const result = component.validateKorrespondenzAdresse();
        expect(result).toEqual(false);
    });

    it('zurueckSetzen', () => {
        component.zusatzadresseForm.markAsDirty();
        const zusatzadresseForm = {
            zusatzadressenTypID: null,
            name: null,
            vorname: null,
            strasse: null,
            strasseNr: null,
            postfachNr: null,
            plz: { ort: null, postleitzahl: null },
            staat: null,
            privatTelefon: null,
            korrespondenzAdresse: null
        };
        spyOn(component.zusatzadresseFormbuilder, 'mapToForm').and.returnValue(zusatzadresseForm);

        component.reset();

        expect(component.zusatzadresseForm.value).toEqual(zusatzadresseForm);
    });

    it('should call Speichern rest service', () => {
        const zusatzadresseFormMock = formBuilder.group({
            zusatzadressenTypID: 1,
            name: null,
            vorname: null,
            strasse: null,
            strasseNr: null,
            postfachNr: 1,
            plz: { ort: null, postleitzahl: null },
            staat: null,
            privatTelefon: null,
            korrespondenzAdresse: true
        });
        const spy = spyOn(serviceDataRestService, 'createZusatzadresse').and.callThrough();

        component.letzteAktualisierung = testAktualisierung.data;
        component.zusatzadresseForm = zusatzadresseFormMock;
        component.save();

        expect(spy).toHaveBeenCalled();
    });

    it('should not update formAktualisieren', () => {
        const componentLetzteAktualisierung = component.letzteAktualisierung;
        component.updateForm(null, false);

        expect(component.letzteAktualisierung).toEqual(componentLetzteAktualisierung);
    });

    it('should update formAktualisieren', () => {
        const testAktualisierungMock = {
            zusatzadressenTypID: 1,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 1000,
            plzId: 1,
            plzObject: {
                plzId: 1,
                postleitzahl: 3000,
                ortDe: 'Bern',
                ortFr: 'Bern',
                ortIt: 'Bern'
            },
            staatObject: {
                staatId: 1,
                code: 'AA',
                iso2Code: 'CH',
                iso3Code: 'AAA',
                nameDe: 'Schweiz',
                nameFr: 'SAssss',
                nameIt: 'AAAAAA'
            },
            privatTelefon: '+234234',
            korrespondenzAdresse: true
        };
        component.updateForm(testAktualisierungMock, false);

        expect(component.letzteAktualisierung).toEqual(testAktualisierungMock);
    });

    it('should update onSpeichern', () => {
        const testAktualisierungMock = {
            data: {
                zusatzadressenTypID: 1,
                name: null,
                vorname: null,
                strasse: 'Morgenstrasse',
                strasseNr: '14A',
                postfachNr: 1000,
                plzId: 1,
                plzObject: {
                    plzId: 1,
                    postleitzahl: 3000,
                    ortDe: 'Bern',
                    ortFr: 'Bern',
                    ortIt: 'Bern'
                },
                staatObject: null,
                privatTelefon: null,
                korrespondenzAdresse: true
            }
        };

        component.zusatzadresseForm = formBuilder.group({
            zusatzadressenTypID: 1,
            name: null,
            vorname: null,
            strasse: null,
            strasseNr: null,
            postfachNr: 1,
            plzId: 1,
            plz: { ort: null, postleitzahl: null },
            ort: null,
            staat: null,
            privatTelefon: null,
            korrespondenzAdresse: true
        });
        spyOn(component.zusatzadresseFormbuilder, 'mapToDTO').and.returnValue(testAktualisierungMock);
        spyOn(serviceDataRestService, 'createZusatzadresse').and.returnValue(of(testAktualisierungMock));

        component.save();

        expect(component.letzteAktualisierung).toEqual(testAktualisierungMock.data);
    });
});
