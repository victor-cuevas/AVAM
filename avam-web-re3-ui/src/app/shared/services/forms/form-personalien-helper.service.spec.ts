import { TestBed } from '@angular/core/testing';
import { FormPersonalienHelperService } from './form-personalien-helper.service';
import { FormUtilsService } from './form-utils.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '../../validators/date-validator';
import { of } from 'rxjs/index';
import { TranslateService } from '@ngx-translate/core';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        of(key);
    }
}

describe('FormPersonalienHelperService', () => {
    let service: FormPersonalienHelperService;

    const formBuilder = new FormBuilder();

    const personalienForm = {
        aufenhaltsbewilligung: {
            aufenthaltbis: null,
            aufenthaltsstatus: 0,
            einreisedatum: null,
            leistungsimporteuefta: false
        },
        kontaktangaben: { email: null, fax: null, mobile: '', telefongeschaeft: null, telefonprivat: '' },
        personenstammdaten: {
            geburtsdatum: { day: 4, month: 4, year: 1972 },
            geschlecht: 1057,
            nationalitaet: { id: 1, iso2Code: 'CH', value: 'Schweiz' },
            svNr: null,
            zasName: 'Meier',
            zasVorname: 'Susanne',
            zivilstand: 1487
        },
        wohnadresseForm: {
            gemeinde: null,
            land: null,
            name: 'Meier',
            plz: { ort: null, postleitzahl: null },
            postfach: 1213,
            strasse: 'Geor',
            strasseNr: '12',
            vorname: 'Susanne'
        },
        schlagworte: null
    };

    const testFormGroup = formBuilder.group({
        wohnadresseForm: formBuilder.group({
            name: [null, Validators.required],
            vorname: [null, Validators.required],
            strasse: [null, Validators.required],
            strasseNr: [null, Validators.required],
            postfach: null,
            plz: { ort: null, postleitzahl: null },
            land: [null, Validators.required],
            gemeindeBfsNr: [null, Validators.required],
            gemeindeName: [null, Validators.required]
        }),
        kontaktangaben: formBuilder.group({
            telefonprivat: null,
            telefongeschaeft: null,
            fax: null,
            mobile: null,
            email: null
        }),

        schlagworte: null,
        personenstammdaten: formBuilder.group({
            svNr: null,
            zasName: [null, Validators.required],
            zasVorname: [null, Validators.required],
            geschlecht: [null, Validators.required],
            zivilstand: [null, Validators.required],
            nationalitaet: [null, Validators.required],
            geburtsdatum: [null, [DateValidator.dateFormat, DateValidator.dateSmallerToday, Validators.required]],
            versichertenNrList: null
        }),
        aufenhaltsbewilligung: formBuilder.group({
            leistungsimporteuefta: null,
            aufenthaltsstatus: [null, Validators.required],
            aufenthaltbis: [null, Validators.required],
            einreisedatum: null
        })
    });

    const personalien = {
        aufenthaltBis: null,
        aufenthaltsStatusID: 0,
        einreiseDatum: null,
        email: null,
        faxNr: null,
        hausNrWohnadresse: '12',
        leistungsimportEUEFTA: false,
        mobileNr: '',
        nameAVAM: 'Meier',
        gemeindeWohnadresseID: 'test_id',
        gemeindeWohnadresseObject: null,
        personStesObject: {
            geburtsDatum: 71193600000,
            geschlechtId: 1057,
            letzterZASAbgleich: null,
            namePersReg: 'Meier',
            nationalitaetObject: { staatId: 1, code: '100', iso2Code: 'CH', iso3Code: 'CHE', nameDe: 'Schweiz' },
            personenNr: '20000042',
            svNrFromZas: null,
            vornamePersReg: 'Susanne',
            zivilstandId: 1487
        },
        postfachNrWohnadresse: 1213,
        postfachWohnadresse: { ortDe: 'Bern', ortFr: 'Berne', ortIt: 'Berna', plzId: 342, postleitzahl: 3000 },
        schlagwortSTESListe: null,
        schlagworteList: null,
        strasseWohnadresse: 'Geor',
        telNrGeschaeft: null,
        telNrPrivat: '',
        vornameAVAM: 'Susanne'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FormUtilsService, { provide: TranslateService, useClass: TranslateServiceStub }]
        }).compileComponents();
        service = TestBed.get(FormPersonalienHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create mapToDTO', () => {
        spyOn(service, 'mapToDTO').and.returnValue(personalien);

        expect(service.mapToDTO(personalien, testFormGroup, false, 1)).toEqual(personalien);
    });

    it('should create form', () => {
        expect(service.createForm(new FormBuilder(), false)).toBeInstanceOf(FormGroup);
        expect(service.createForm(new FormBuilder(), false).value).toEqual(testFormGroup.value);
    });
});
