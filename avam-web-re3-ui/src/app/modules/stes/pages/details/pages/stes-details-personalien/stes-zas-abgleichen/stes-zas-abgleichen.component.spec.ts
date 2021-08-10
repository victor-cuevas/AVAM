import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesZasAbgleichenComponent } from './stes-zas-abgleichen.component';
import {
    AutosuggestInputComponent,
    CloseTabDirective,
    DbTranslatePipe,
    GemeindeAutosuggestComponent,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    ObjectIteratorPipe
} from '../../../../../../../shared';
import { MockTextControlClearDirective, MockTranslatePipe } from '../../../../../../../../../tests/helpers';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbButtonsModule, NgbModal, NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalStub } from '../../stes-details-grunddaten/stes-details-grunddaten.component.spec';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import { StaatDTO } from '@dtos/staatDTO';
import { ZasAbgleichRequest } from '../../../../../../../shared/models/dtos/stes-zas-abgleich-request';
import { TranslateService } from '@ngx-translate/core';
import { StesZasDTO } from '@shared/models/dtos-generated/stesZasDTO';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';
import { AvamInfoIconBtnComponent } from '@app/shared/components/avam-info-icon-btn/avam-info-icon-btn.component';
class TranslateServiceStub {
    public currentLang = 'de';

    public instant(key: any): any {
        return key;
    }
}

describe('StesZasAbgleichenComponent', () => {
    let component: StesZasAbgleichenComponent;
    let fixture: ComponentFixture<StesZasAbgleichenComponent>;
    let ngbModalStub: NgbModalStub;

    const nat = { staatId: 1, code: '100', iso2Code: 'CH', iso3Code: 'CHE', nameDe: 'Schweiz', nameFr: 'Suisse', nameIt: 'Svizzera' } as StaatDTO;
    const geschlechtDropdownLablesMock = [
        { codeId: 1057, labelDe: 'weiblich', labelFr: 'féminin', labelIt: 'femminile' },
        { codeId: 1056, labelDe: 'männlich', labelFr: 'masculin', labelIt: 'maschile' }
    ];
    const zasResponseMock = {
        data: [
            {
                personenNr: '1',
                namePersReg: 'name',
                vornamePersReg: 'vorname',
                nationalitaetObject: nat,
                nationalitaetId: 1,
                geschlechtId: 1057,
                geburtsDatum: new Date(71193600000),
                letzterZASAbgleich: new Date(81193600000),
                personStesId: 1,
                versichertenNrList: [
                    {
                        personVersichertenNrId: 1,
                        personStesId: 1,
                        versichertenNr: '7566142172751',
                        istAktuelleVersichertenNr: true
                    } as PersonVersichertenNrDTO
                ]
            } as StesZasDTO
        ],
        warning: null
    } as BaseResponseWrapperListStesZasDTOWarningMessages;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, NgbButtonsModule, NgbPopoverModule],
            declarations: [
                StesZasAbgleichenComponent,
                MockTextControlClearDirective,
                CloseTabDirective,
                AutosuggestInputComponent,
                GemeindeAutosuggestComponent,
                MockTranslatePipe,
                DbTranslatePipe,
                ObjectIteratorPipe,
                AvamInfoIconBtnComponent,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective
            ],
            providers: [{ provide: TranslateService, useClass: TranslateServiceStub }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(StesZasAbgleichenComponent);
        ngbModalStub = TestBed.get(NgbModal);
    }));

    it('should create', () => {
        component = fixture.componentInstance;
        const formBuilder: FormBuilder = new FormBuilder();
        component.zasAbgleichRequest = {
            stesId: 1,
            personenNr: '1',
            nationalitaetId: 1,
            nationalitaet: nat,
            personenstammdaten: formBuilder.group({
                svNr: null,
                zasName: null,
                zasVorname: null,
                geschlecht: null,
                zivilstand: null,
                nationalitaet: null,
                geburtsdatum: null,
                versichertenNrList: null
            }),
            geschlechtDropdownLables: geschlechtDropdownLablesMock,
            letzterZASAbgleich: null
        } as ZasAbgleichRequest;
        component.zasAbgleichRequest.personenstammdaten.setValue({
            svNr: '7566142172751',
            zasName: 'Meier',
            zasVorname: 'Susanne',
            geschlecht: 1057,
            zivilstand: null,
            nationalitaet: nat,
            geburtsdatum: 123123,
            versichertenNrList: [
                {
                    personVersichertenNrId: 1,
                    personStesId: 1,
                    versichertenNr: '7566142172751',
                    istAktuelleVersichertenNr: true
                } as PersonVersichertenNrDTO
            ]
        });
        component.zasResponse = zasResponseMock;

        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(component.hasSvNr).toBeTruthy();
        expect(component.hasManyPersons).toBeFalsy();
    });
});
