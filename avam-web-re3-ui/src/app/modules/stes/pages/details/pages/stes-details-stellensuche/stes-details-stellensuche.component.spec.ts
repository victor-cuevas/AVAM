import { StesDetailsStellensucheComponent } from '@stes/pages/details';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockTextControlClearDirective, MockTranslatePipe } from '../../../../../../../../tests/helpers';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, Subscriber } from 'rxjs';
import { NgbModal, NgbPopoverModule, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ParagraphComponent } from 'src/app/shared/components/paragraph/paragraph.component';
import { TextareaComponent } from 'src/app/shared/components/textarea/textarea.component';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { CloseTabDirective, DbTranslatePipe, ObjectIteratorPipe, TextOverflowTooltipDirective, ToolboxService, PermissionDirective } from 'src/app/shared';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { UnternehmenDataService } from 'src/app/shared/services/unternehmen-data.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { CustomPopoverDirective } from '@shared/directives/custom-popover.directive';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { APP_BASE_HREF, DatePipe, Location } from '@angular/common';
import { CoreSliderComponent } from '@app/library/core/core-slider/core-slider.component';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { MessageBus } from '@shared/services/message-bus';
import { AvamInfoIconBtnComponent } from '@app/shared/components/avam-info-icon-btn/avam-info-icon-btn.component';
import { AvamUnternehmenAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-unternehmen-autosuggest/avam-unternehmen-autosuggest.component';
import { FacadeService } from '@shared/services/facade.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';

const locationStub: Partial<Location> = { subscribe: () => new Subscriber() };

export class TranslateServiceStub {
    public onLangChange: EventEmitter<LangChangeEvent> = new EventEmitter();
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
}

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

describe('StesDetailsStellensucheComponent', () => {
    const letzteAktualisierungMock = {
        data: {
            anstellungBisDatum: 1550793600000,
            arbeitszeitDetail: 'Test text for Arbeitszeit - Detailangaben:',
            arbeitszeitId: 587,
            fahrzeugVerfuegbar: true,
            letzterAGBekannt: false,
            letzterArbeitgeberBurObject: null,
            mobilitaetId: '1173',
            stellenAntrittAbDatum: 1548979200000,
            unternehmen: null,
            vermittlungsGrad: 100,
            wohnortwechselMoeglich: false,
            arbeitsformenList: [
                { code: { codeId: 582, textDe: 'test1', textFr: 'test2', textIt: 'test3' } },
                { code: { codeId: 583, textDe: 'test1', textFr: 'test2', textIt: 'test3' } },
                { code: { codeId: 584, textDe: 'test1', textFr: 'test2', textIt: 'test3' } },
                { code: { codeId: 585, textDe: 'test1', textFr: 'test2', textIt: 'test3' } },
                { code: { codeId: 586, textDe: 'test1', textFr: 'test2', textIt: 'test3' } }
            ],
            arbeitsortList: [{ regionId: 12, regionDe: 'Bern', regionFr: 'Berne', regionIt: 'Berna' }],
            fuehrerAusweisKatList: [{ codeId: 924, textDe: 'B1', textFr: 'B1', textIt: 'B1' }],
            letzterAgNoga: {
                nogaId: 9870,
                nogaCodeUp: '111',
                textlangDe: 'Malerei',
                textlangFr: 'Peinture',
                textlangIt: 'Pittura'
            },
            teatigkeitBranche: {
                nogaId: 1,
                nogaCodeUp: 11,
                value: 'test_b'
            },
            stesGrossregionList: [
                {
                    code: -1,
                    kanton: '',
                    merkmal: '',
                    regionDe: '',
                    regionFr: '',
                    regionId: -1,
                    regionIt: ''
                }
            ]
        }
    };

    let component: StesDetailsStellensucheComponent;
    let fixture: ComponentFixture<StesDetailsStellensucheComponent>;
    let ngbModalStub: NgbModalStub;
    let fehlermeldungService: FehlermeldungenService;
    let toolboxService: ToolboxService;
    let serviceDataRestService: StesDataRestService;
    let formBuilder: FormBuilder;
    let facade: FacadeService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesDetailsStellensucheComponent,
                CustomPopoverDirective,
                MockTranslatePipe,
                ObjectIteratorPipe,
                ParagraphComponent,
                TextareaComponent,
                AvamInfoIconBtnComponent,
                MockTextControlClearDirective,
                CloseTabDirective,
                DbTranslatePipe,
                CoreSliderComponent,
                TextOverflowTooltipDirective,
                DisableControlDirective,
                NgbTooltip,
                PermissionDirective
            ],
            imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, FormsModule, NgbPopoverModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                StesDataRestService,
                ToolboxService,
                AuthenticationService,
                AuthenticationRestService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: NgbModal, useClass: NgbModal },
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
                UnternehmenRestService,
                { provide: NotificationService, useClass: MockNotificationService },
                SpinnerService,
                UnternehmenDataService,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: Location, useValue: locationStub },
                { provide: APP_BASE_HREF, useValue: '/' },
                MessageBus,
                FacadeService,
                AuthenticationService,
                AuthenticationRestService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        ngbModalStub = TestBed.get(NgbModal);
        toolboxService = TestBed.get(ToolboxService);
        fehlermeldungService = TestBed.get(FehlermeldungenService);
        fixture = TestBed.createComponent(StesDetailsStellensucheComponent);
        component = fixture.componentInstance;
        component.isMobile = 'test';
        serviceDataRestService = TestBed.get(StesDataRestService);
        component.letzteAktualisierung = letzteAktualisierungMock;
        const arbeitSelectOptions: any[] = [{ codeId: 587, textDe: 'test1' }, { codeId: 588, textDe: 'test2' }];

        component.mobiliteatSelectOptions = [
            { codeId: 1174, textDe: 'test1', textFr: null, textIt: null, textKey: null, value: false, code: '4' },
            { codeId: 1173, textDe: 'test2', textFr: null, textIt: null, textKey: null, value: false, code: '1' }
        ];
        component.arbeitSelectOptions = arbeitSelectOptions;
        formBuilder = TestBed.get(FormBuilder);
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should unsubscribe on destroy', () => {
        component['observeClickActionSubFooter'] = of(true).subscribe();
        component['observeClickActionSub'] = of(true).subscribe();
        component['dataSubscription'] = of(true).subscribe();
        component['stellensucheSub'] = of(true).subscribe();

        component.ngOnDestroy();

        expect(component['observeClickActionSubFooter'].closed).toBeTruthy();
        expect(component['observeClickActionSub'].closed).toBeTruthy();
        expect(component['dataSubscription'].closed).toBeTruthy();
        expect(component['stellensucheSub'].closed).toBeTruthy();
    });

    it('should be mobile', () => {
        component.setMobiliteat(1174);
        expect(component.isMobile).toEqual('stes.multiselect.mobiliteat.moeglich');
        component.setMobiliteat(1173);
        expect(component.isMobile).toEqual('stes.multiselect.mobiliteat.nichtmoeglich');
    });

    it('should on speichern', () => {
        component.stellensucheForm.setErrors({ incorrect: true });
        component.save();
    });

    it('should onCheckboxSelected', () => {
        const arbeitgeberForm = component.stellensucheForm.get('arbeitgeberForm') as FormGroup;

        arbeitgeberForm.controls.letzterAGBekannt.setValue(true);
        component.onCheckboxSelected(false);
        expect(arbeitgeberForm.controls.teatigkeitBranche.value).toBeNull();

        arbeitgeberForm.controls.letzterAGBekannt.setValue(false);
        component.onCheckboxSelected(false);
        expect(arbeitgeberForm.controls.name1.value).toBeNull();
    });

    it('should add validator', () => {
        component.arbeitgeberForm.controls.letzterAGBekannt.setValue(true);
        component.checkBekanntUnternehmen();
        const arbeitgeberForm = component.stellensucheForm.get('arbeitgeberForm') as FormGroup;

        expect(arbeitgeberForm.controls.name1.validator).not.toBeNull();
    });

    it('load Data', () => {
        spyOn(serviceDataRestService, 'getCode').and.returnValue(
            of([
                {
                    codeId: 1,
                    textDe: 'test',
                    textFr: 'test',
                    textIt: 'test',
                    code: '1'
                }
            ])
        );
        component.getData();

        expect(component.mobiliteatSelectOptions).toEqual([
            {
                codeId: 1174,
                textDe: 'test1',
                textFr: null,
                textIt: null,
                textKey: null,
                value: false,
                code: '4'
            },
            {
                codeId: 1173,
                textDe: 'test2',
                textFr: null,
                textIt: null,
                textKey: null,
                value: false,
                code: '1'
            }
        ]);
    });

    it('should update formAktualisieren', () => {
        component.avamUnternehmenAutosuggest = {
            selectFromSuchePlus: item => {}
        } as AvamUnternehmenAutosuggestComponent;
        const arbeitgeberForm = component.stellensucheForm.get('arbeitgeberForm') as FormGroup;
        arbeitgeberForm.controls.teatigkeitBranche.setValue({
            nogaId: 1,
            nogaCodeUp: 11,
            value: 'test_b'
        });
        component.formAktualisieren(letzteAktualisierungMock.data, false);

        expect(component.letzteAktualisierung).toEqual(letzteAktualisierungMock.data);
    });

    it('should update onSpeichern', () => {
        component.stellensucheForm = formBuilder.group({
            test: 1,
            test1: 'null'
        });
        spyOn(component.stellensucheFormbuilder, 'mapToDTO').and.returnValue(letzteAktualisierungMock);
        spyOn(serviceDataRestService, 'createStellensucheBearbeiten').and.returnValue(of(letzteAktualisierungMock));

        component.save();

        expect(component.letzteAktualisierung).toEqual(letzteAktualisierungMock);
    });
});
