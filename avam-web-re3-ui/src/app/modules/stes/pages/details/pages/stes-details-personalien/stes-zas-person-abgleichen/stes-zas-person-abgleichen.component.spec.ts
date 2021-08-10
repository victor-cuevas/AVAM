import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
    AutosuggestInputComponent,
    CloseTabDirective,
    DbTranslatePipe,
    FormPersonalienHelperService,
    FormUtilsService,
    GemeindeAutosuggestComponent,
    ToolboxService,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    ObjectIteratorPipe
} from '@shared/index';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbButtonsModule, NgbModal, NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalStub } from '../../stes-details-grunddaten/stes-details-grunddaten.component.spec';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import { StaatDTO } from '@dtos/staatDTO';
import { StesZasPersonAbgleichenComponent } from './stes-zas-person-abgleichen.component';
import { ZasAbgleichRequest } from '@shared/models/dtos/stes-zas-abgleich-request';
import { StesZasAbgleichService } from '@stes/services/stes-zas-abgleich.service';
import { StesZasRestService } from '@core/http/stes-zas-rest.service';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { MessageKey } from '@shared/models/dtos/warning-messages-dto';
import { ActivatedRoute, ActivatedRouteSnapshot, ActivationEnd, Data, Router } from '@angular/router';
import { of } from 'rxjs';
import { StesZasDTO } from '@shared/models/dtos-generated/stesZasDTO';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';
import { AvamInfoIconBtnComponent } from '@app/shared/components/avam-info-icon-btn/avam-info-icon-btn.component';

describe('StesZasPersonAbgleichenComponent', () => {
    const formNumber = '123';
    let component: StesZasPersonAbgleichenComponent;
    let fixture: ComponentFixture<StesZasPersonAbgleichenComponent>;
    let ngbModalStub: NgbModalStub;
    let notificationServiceStub: NotificationServiceStub;
    let translateServiceStub: TranslateServiceStub;
    let dbTranslateServiceStub: DbTranslateServiceStub;

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
                StesZasPersonAbgleichenComponent,
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
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                ToolboxService,
                FormPersonalienHelperService,
                FormBuilder,
                FormUtilsService,
                SpinnerService,
                StesZasRestService,
                StesZasAbgleichService,
                { provide: NotificationService, useClass: NotificationServiceStub },
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                {
                    provide: NG_VALUE_ACCESSOR,
                    multi: true,
                    useExisting: forwardRef(() => StesZasPersonAbgleichenComponent)
                },
                {
                    provide: Router,
                    useValue: {
                        url: '/bla',
                        events: of(
                            new ActivationEnd({
                                pathFromRoot: null,
                                paramMap: null,
                                queryParamMap: null,
                                children: null,
                                firstChild: null,
                                parent: null,
                                root: null,
                                routeConfig: null,
                                url: null,
                                params: null,
                                queryParams: null,
                                fragment: 'bla',
                                data: { formNumber } as Data,
                                outlet: 'bla',
                                component: null
                            } as ActivatedRouteSnapshot)
                        ),
                        navigate: jasmine.createSpy('navigate')
                    }
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        }
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesZasPersonAbgleichenComponent);
        ngbModalStub = TestBed.get(NgbModal);
        notificationServiceStub = TestBed.get(NotificationService);
        translateServiceStub = TestBed.get(TranslateService);
        dbTranslateServiceStub = TestBed.get(DbTranslateService);
    });

    it('personNrNotInZas', () => {
        component = fixture.componentInstance;
        component.zasResponse = zasResponseMock;
        component.zasResponse.data[0].versichertenNrList[0].versichertenNr = '7566142172752';
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
        fixture.detectChanges();

        expect(component.stesZasDTO).not.toBe(null);
        expect(component.stesZasDTO).toBe(zasResponseMock.data[0]);
        expect(component.isTakeOverButtonDisabled).toBeFalsy();
        expect(component.getFormNr()).toBe(StesFormNumberEnum.ZAS_ABGLEICH);
    });

    it('personNrInZas', () => {
        component = fixture.componentInstance;
        component.zasResponse = zasResponseMock;
        component.zasResponse.warning = [{ key: MessageKey.WARNING, values: { key: '1' } }];
        component.zasResponse.data[0].versichertenNrList[0].versichertenNr = '7566142172751';
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
        fixture.detectChanges();

        expect(component.stesZasDTO).not.toBe(null);
        expect(component.stesZasDTO).toBe(zasResponseMock.data[0]);
        expect(component.isTakeOverButtonDisabled).toBeTruthy();
        expect(component.getFormNr()).toBe(StesFormNumberEnum.ZAS_ABGLEICH);
    });
});

class TranslateServiceStub {
    public currentLang = 'de';

    public instant(key: any): any {
        return key;
    }
}

class NotificationServiceStub {
    // used to send message to specific channel
    broadcast() {
        /**/
    }

    send() {
        /**/
    }

    error() {
        /**/
    }

    warning() {
        /**/
    }

    success() {
        /**/
    }
}
