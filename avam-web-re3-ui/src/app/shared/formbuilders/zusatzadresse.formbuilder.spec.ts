import { async, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ZusatzadresseFormbuilder } from './zusatzadresse.formbuilder';
import { of } from 'rxjs/index';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '../services/db-translate.service';

class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        of(key);
    }
}
describe('ZusatzadresseFormbuilder', () => {
    const letzteAktualisierungMock = {
        zusatzadressenTypID: 1,
        name: 'Peter',
        vorname: 'Heinz',
        strasse: 'Morgenstrasse',
        strasseNr: '14A',
        postfachNr: 0,
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
        korrespondenzAdresse: true,
        ortZusatzAusland: '',
        plzZusatzAusland: ''
    };

    let zusatzadresseFormbuilder: ZusatzadresseFormbuilder;
    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: FormBuilder, useValue: formBuilder }, { provide: TranslateService, useClass: TranslateServiceStub }]
        }).compileComponents();

        const dbTranslateSevice = TestBed.get(DbTranslateService);
        zusatzadresseFormbuilder = new ZusatzadresseFormbuilder(formBuilder, dbTranslateSevice);
    }));

    it('should initForm', () => {
        const zusatzadresseForm: FormGroup = zusatzadresseFormbuilder.initForm();

        expect(zusatzadresseForm.controls.zusatzadressenTypID.value).toBeNull();
    });

    it('should map to DTO', () => {
        const zusatzadresseForm: FormGroup = formBuilder.group({
            zusatzadressenTypID: 1,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 0,
            plz: { inputElementOneValue: 123, inputElementTwoValue: '123', id: '-1' },
            staat: null,
            privatTelefon: '+234234',
            korrespondenzAdresse: true
        });
        zusatzadresseForm.controls.zusatzadressenTypID.setValue(1);
        const zusatzadresseToSave = zusatzadresseFormbuilder.mapToDTO(letzteAktualisierungMock, zusatzadresseForm);

        expect(zusatzadresseToSave).toEqual(letzteAktualisierungMock);
    });

    it('should map to Form', () => {
        const letzteAktualisierungTestMock = {
            zusatzadressenTypID: 1,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 0,
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

        expect(zusatzadresseFormbuilder.mapToForm(letzteAktualisierungTestMock)).toEqual({
            korrespondenzAdresse: true,
            name: 'Peter',
            plz: {
                ort: { ortDe: 'Bern', ortFr: 'Bern', ortIt: 'Bern', plzId: 1, postleitzahl: 3000 },
                postleitzahl: { ortDe: 'Bern', ortFr: 'Bern', ortIt: 'Bern', plzId: 1, postleitzahl: 3000 }
            },
            postfachNr: null,
            privatTelefon: '+234234',
            staat: { code: 'AA', iso2Code: 'CH', iso3Code: 'AAA', nameDe: 'Schweiz', nameFr: 'SAssss', nameIt: 'AAAAAA', staatId: 1 },
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            vorname: 'Heinz',
            zusatzadressenTypID: 1
        });
    });

    it('should test for no plz and  no staat in mapToForm', () => {
        const testAktualisierung = {
            zusatzadressenTypID: 1,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 1000,
            plzObject: null,
            staatObject: null,
            privatTelefon: '+234234',
            korrespondenzAdresse: true,
            ortZusatzAusland: '',
            plzZusatzAusland: ''
        };

        expect(zusatzadresseFormbuilder.mapToForm(testAktualisierung)).toEqual({
            korrespondenzAdresse: true,
            name: 'Peter',
            plz: { ort: '', postleitzahl: '' },
            postfachNr: 1000,
            privatTelefon: '+234234',
            staat: null,
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            vorname: 'Heinz',
            zusatzadressenTypID: 1
        });
    });

    it('should test for plz and staat in mapToDto', () => {
        const testAktualisierungMock = {
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
            korrespondenzAdresse: true,
            ortZusatzAusland: '',
            plzZusatzAusland: ''
        };

        const zusatzadresseForm: FormGroup = formBuilder.group({
            zusatzadressenTypID: 1,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 1000,
            plz: {
                id: -1,
                inputElementOneValue: '',
                inputElementTwoValue: ''
            },
            ort: null,
            staat: null,
            privatTelefon: '+234234',
            korrespondenzAdresse: null,
            ortZusatzAusland: '',
            plzZusatzAusland: ''
        });
        zusatzadresseForm.controls.zusatzadressenTypID.setValue(1);
        const zusatzadresseToSave = zusatzadresseFormbuilder.mapToDTO(testAktualisierungMock, zusatzadresseForm);

        expect(zusatzadresseToSave.staatObject).toBeUndefined();
        expect(zusatzadresseToSave.korrespondenzAdresse).toBeFalsy();
    });

    it('should test for no zusatzadressenTypId in form', () => {
        const testAktualisierung = {
            zusatzadressenTypID: 0,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 0,
            plzObject: null,
            staatObject: null,
            privatTelefon: '+234234',
            korrespondenzAdresse: true
        };

        const zusatzadresseDto = zusatzadresseFormbuilder.mapToForm(testAktualisierung);

        expect(zusatzadresseDto.zusatzadressenTypID === null);
    });

    it('should test for no postfachNr in form', () => {
        const testAktualisierung = {
            zusatzadressenTypID: 0,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 0,
            plzObject: null,
            staatObject: null,
            privatTelefon: '+234234',
            korrespondenzAdresse: true
        };

        const zusatzadresseDto = zusatzadresseFormbuilder.mapToForm(testAktualisierung);

        expect(zusatzadresseDto.postfachNr === '');
    });

    it('should test autosuggestInput', () => {
        const testAktualisierung = {
            zusatzadressenTypID: 0,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 0,
            plzObject: null,
            staatObject: {
                id: '229',
                iso2Code: 'AT',
                iso3Code: 'AUT',
                nameDe: 'Österreich',
                nameFr: 'Autriche',
                nameIt: 'Austria',
                staatId: 2
            },
            privatTelefon: '+234234',
            korrespondenzAdresse: true
        };

        const zusatzadresseForm = zusatzadresseFormbuilder.mapToForm(testAktualisierung);
        const zusatzadresseStaatObj = testAktualisierung.staatObject;

        expect(zusatzadresseForm.staat).toEqual(zusatzadresseStaatObj);
    });

    it('should test autosuggestInput', () => {
        const testAktualisierung = {
            zusatzadressenTypID: 0,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 0,
            plzObject: null,
            staatObject: {
                code: null,
                iso2Code: 666,
                iso3Code: null,
                nameDe: null,
                nameFr: null,
                nameIt: null,
                staatId: 1
            },
            privatTelefon: '+234234',
            korrespondenzAdresse: true
        };

        const zusatzadresseForm = zusatzadresseFormbuilder.mapToForm(testAktualisierung);
        const zusatzadresseStaatObj = testAktualisierung.staatObject;

        expect(zusatzadresseForm.staat).toEqual(zusatzadresseStaatObj);
    });

    it('should test reset DTO', () => {
        const resetDTO = {
            zusatzadressenTypID: null,
            name: null,
            vorname: null,
            strasse: null,
            strasseNr: null,
            postfachNr: null,
            plzObject: null,
            staatObject: null,
            privatTelefon: null,
            korrespondenzAdresse: false,
            ortZusatzAusland: null,
            plzZusatzAusland: null
        };

        const testAktualisierungMock = {
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
        };

        const zusatzadresseToSave = zusatzadresseFormbuilder.mapToDTO(testAktualisierungMock, null);
        expect(zusatzadresseToSave).toEqual(resetDTO);
    });

    it('should test if form is not empty', () => {
        const zusatzadresseForm: FormGroup = formBuilder.group({
            zusatzadressenTypID: null,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 1000,
            plz: {
                id: -1,
                inputElementOneValue: null,
                inputElementTwoValue: null
            },
            ort: null,
            staat: null,
            privatTelefon: '+234234',
            korrespondenzAdresse: false
        });

        expect(zusatzadresseFormbuilder.isFormEmpty(zusatzadresseForm)).toBeFalsy();
    });

    it('should test if form is empty', () => {
        const zusatzadresseForm: FormGroup = formBuilder.group({
            zusatzadressenTypID: null,
            name: null,
            vorname: null,
            strasse: null,
            strasseNr: null,
            postfachNr: null,
            plz: null,
            ort: null,
            staat: null,
            privatTelefon: null,
            korrespondenzAdresse: false
        });

        expect(zusatzadresseFormbuilder.isFormEmpty(zusatzadresseForm)).toBeTruthy();
    });

    it('should test if plz is empty', () => {
        const zusatzadresseForm: FormGroup = formBuilder.group({
            zusatzadressenTypID: 1,
            name: 'Peter',
            vorname: 'Heinz',
            strasse: 'Morgenstrasse',
            strasseNr: '14A',
            postfachNr: 1000,
            plz: {
                id: '-1',
                inputElementOneValue: null,
                inputElementTwoValue: null
            },
            ort: null,
            staat: null,
            privatTelefon: '+234234',
            korrespondenzAdresse: null
        });

        expect(zusatzadresseFormbuilder.isPlzEmpty(zusatzadresseForm.controls.plz.value)).toBeTruthy();
    });
});
