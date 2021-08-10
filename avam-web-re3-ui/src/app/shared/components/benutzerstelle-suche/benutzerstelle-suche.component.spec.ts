import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BenutzerstelleSucheComponent } from './benutzerstelle-suche.component';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { ToolboxService, DbTranslatePipe, VollzugsregionAutosuggestComponent, TextOverflowTooltipDirective, TextOverflowTooltipInputFieldDirective } from '@app/shared';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { MockTranslatePipe, MockTextControlClearDirective } from '@test_helpers/index';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { SpinnerService } from 'oblique-reactive';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { FacadeService } from '@shared/services/facade.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { ActivatedRouteSnapshot, ActivationEnd, Data, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageBus } from '@shared/services/message-bus';

export class TranslateServiceStub {
    public currentLang = 'de';
    onLangChange = new EventEmitter();
    public instant(key: any): any {
        return key;
    }
}

export class NgbModalStub {
    public open(key: any, options?: any): any {
        return { result: of(key).toPromise() };
    }
}

describe('BenutzerstelleSucheComponent', () => {
    let component: BenutzerstelleSucheComponent;
    let fixture: ComponentFixture<BenutzerstelleSucheComponent>;
    let serviceToolboxService: ToolboxService;
    let serviceDataRestService: StesDataRestService;
    let ngbModalStub: NgbModalStub;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                BenutzerstelleSucheComponent,
                MockTranslatePipe,
                MockTextControlClearDirective,
                DbTranslatePipe,
                DisableControlDirective,
                VollzugsregionAutosuggestComponent,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective
            ],
            imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule, NgbTooltipModule.forRoot(), RouterTestingModule.withRoutes([])],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                ToolboxService,
                { provide: NgbModal, useClass: NgbModal },
                { provide: TranslateService, useClass: TranslateServiceStub },
                DatePipe,
                SpinnerService,
                StesDataRestService,
                FacadeService,
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
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
                                data: { formNumber: 1 } as Data,
                                outlet: 'bla',
                                component: null
                            } as ActivatedRouteSnapshot)
                        ),
                        navigate: jasmine.createSpy('navigate')
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BenutzerstelleSucheComponent);
        serviceToolboxService = TestBed.get(ToolboxService);
        serviceDataRestService = TestBed.get(StesDataRestService);
        ngbModalStub = TestBed.get(NgbModal);
        formBuilder = TestBed.get(FormBuilder);
        component = fixture.componentInstance;
        component.uebergebeneDaten = { benutzerstellentyp: '9410', vollzugsregiontyp: '9409', status: '1404' } as BenutzerstelleSucheParamsModel;
        component.ngOnInit();
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should test onTextClear', () => {
        component.searchForm = formBuilder.group({
            statusId: '',
            benutzerstelle: '',
            strasse: 'Test strasse',
            strasseNr: '',
            plzOrt: null,
            kantonId: '',
            benutzerstelleIdVon: '',
            benutzerstelleIdBis: '',
            benutzerstelleTypId: '',
            vollzugsregion: null,
            vollzugsregionTypeId: ''
        });

        component.onTextClear('strasse');
        expect(component.searchForm.controls.strasse.value).toBeNull();
    });

    it('should test reset', () => {
        component.searchForm = formBuilder.group({
            statusId: '1404',
            benutzerstelle: '',
            strasse: 'Test strasse',
            strasseNr: 'sasd',
            plzOrt: null,
            kantonId: '1234',
            benutzerstelleIdVon: 'TestBis',
            benutzerstelleIdBis: 'TestVon',
            benutzerstelleTypId: '9410',
            vollzugsregion: null,
            vollzugsregionTypeId: '9409'
        });

        const resetFormResult = {
            statusId: '1404',
            benutzerstelle: '',
            strasse: '',
            strasseNr: '',
            plzOrt: null,
            kantonId: '',
            benutzerstelleIdVon: '',
            benutzerstelleIdBis: '',
            benutzerstelleTypId: '9410',
            vollzugsregion: null,
            vollzugsregionTypeId: '9409'
        };

        component.reset();

        expect(component.searchForm.value).toEqual(resetFormResult);
        expect(component.benutzerstellenData).toEqual([]);
    });
});
