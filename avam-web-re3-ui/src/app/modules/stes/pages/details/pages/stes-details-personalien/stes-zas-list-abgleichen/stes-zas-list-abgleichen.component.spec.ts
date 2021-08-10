import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesZasListAbgleichenComponent } from './stes-zas-list-abgleichen.component';
import { StaatDTO } from '@dtos/staatDTO';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SpinnerService } from 'oblique-reactive';
import { RouterTestingModule } from '@angular/router/testing';
import { DbTranslateService } from '../../../../../../../shared/services/db-translate.service';
import { DatePipe } from '@angular/common';
import { MockTranslatePipe } from '../../../../../../../../../tests/helpers';
import { MessageKey, MessageValues, WarningMessagesDTO } from '../../../../../../../shared/models/dtos/warning-messages-dto';
import { ToolboxService } from '../../../../../../../shared';
import { StesFormNumberEnum } from '../../../../../../../shared/enums/stes-form-number.enum';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { StesZasDTO } from '@shared/models/dtos-generated/stesZasDTO';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';

describe('StesZasListAbgleichenComponent', () => {
    let component: StesZasListAbgleichenComponent;
    let fixture: ComponentFixture<StesZasListAbgleichenComponent>;
    let dbTranslateServiceStub: DbTranslateServiceStub;
    let stesZasResponseDTO: BaseResponseWrapperListStesZasDTOWarningMessages;

    const nat = { staatId: 1, code: '100', iso2Code: 'CH', iso3Code: 'CHE', nameDe: 'Schweiz', nameFr: 'Suisse', nameIt: 'Svizzera' } as StaatDTO;
    const geschlechtDropdownLablesMock = [
        { codeId: 1057, labelDe: 'weiblich', labelFr: 'féminin', labelIt: 'femminile' },
        { codeId: 1056, labelDe: 'männlich', labelFr: 'masculin', labelIt: 'maschile' }
    ];

    beforeEach(() => {
        stesZasResponseDTO = {
            data: [],
            warning: [{ key: MessageKey.WARNING, values: { key: 'bla' } as MessageValues } as WarningMessagesDTO]
        } as BaseResponseWrapperListStesZasDTOWarningMessages;
        for (let i = 1; i < 20; i++) {
            stesZasResponseDTO.data.push({
                personenNr: String(i),
                namePersReg: 'Meier' + String(i),
                vornamePersReg: 'Susanne',
                nationalitaetObject: nat,
                nationalitaetId: 1,
                geschlechtId: 1057,
                geburtsDatum: new Date(12312323),
                letzterZASAbgleich: new Date(12312312),
                personStesId: 1,
                versichertenNrList: [
                    {
                        personVersichertenNrId: 1,
                        personStesId: 1,
                        versichertenNr: '7566142172751',
                        istAktuelleVersichertenNr: true
                    } as PersonVersichertenNrDTO,
                    {
                        personVersichertenNrId: 2,
                        personStesId: 1,
                        versichertenNr: '7566142172752',
                        istAktuelleVersichertenNr: false
                    } as PersonVersichertenNrDTO
                ]
            } as StesZasDTO);
        }
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesZasListAbgleichenComponent, MockTranslatePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [DatePipe, { provide: DbTranslateService, useClass: DbTranslateServiceStub }, SpinnerService, ToolboxService],
            imports: [RouterTestingModule.withRoutes([])]
        }).compileComponents();
    }));

    beforeEach(() => {
        dbTranslateServiceStub = TestBed.get(DbTranslateService);
        fixture = TestBed.createComponent(StesZasListAbgleichenComponent);
        component = fixture.componentInstance;
        component.zasResponse = stesZasResponseDTO;
        component.geschlechtDropdownLables = geschlechtDropdownLablesMock;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.results.length).toBe(19);
        expect(component.getFormNr()).toBe(StesFormNumberEnum.ZAS_TREFFERLISTE);
    });
});
