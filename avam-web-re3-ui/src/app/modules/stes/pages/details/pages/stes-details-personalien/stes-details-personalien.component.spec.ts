import { GemeindeAutosuggestComponent } from './../../../../../../shared/components/gemeinde-autosuggest/gemeinde-autosuggest.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesDetailsPersonalienComponent } from './stes-details-personalien.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgbModal, NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { MockTextControlClearDirective, MockTranslatePipe, NavigationServiceStub } from '../../../../../../../../tests/helpers';
import { FormPersonalienHelperService } from 'src/app/shared/services/forms/form-personalien-helper.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { of, Subscriber } from 'rxjs';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { NgbModalStub } from '../stes-details-grunddaten/stes-details-grunddaten.component.spec';
import {
    AbbrechenModalComponent,
    AutosuggestInputComponent,
    CloseTabDirective,
    DbTranslatePipe,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    ToolboxService,
    PermissionDirective,
    ObjectIteratorPipe
} from 'src/app/shared';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { StesZasAbgleichService } from '@stes/services/stes-zas-abgleich.service';
import { StesZasRestService } from '@core/http/stes-zas-rest.service';
import { MessageBus } from '@shared/services/message-bus';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { APP_BASE_HREF, Location } from '@angular/common';
import { NavigationService } from '@shared/services/navigation-service';
import { AvamInfoIconBtnComponent } from '@app/shared/components/avam-info-icon-btn/avam-info-icon-btn.component';
import { FacadeService } from '@shared/services/facade.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

const locationStub: Partial<Location> = { subscribe: () => new Subscriber() };

class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

describe('StesDetailsPersonalienComponent', () => {
    let component: StesDetailsPersonalienComponent;
    let fixture: ComponentFixture<StesDetailsPersonalienComponent>;
    let formPersonalienHelper: FormPersonalienHelperService;
    let dataService: StesDataRestService;
    let zasService: StesZasAbgleichService;
    let fehlermeldungenService: FehlermeldungenService;
    let ngbModalStub: NgbModalStub;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesDetailsPersonalienComponent,
                MockTextControlClearDirective,
                CloseTabDirective,
                AutosuggestInputComponent,
                GemeindeAutosuggestComponent,
                MockTranslatePipe,
                DbTranslatePipe,
                ObjectIteratorPipe,
                AvamInfoIconBtnComponent,
                AbbrechenModalComponent,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective,
                PermissionDirective
            ],
            imports: [
                ReactiveFormsModule,
                HttpClientTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateFakeLoader
                    }
                }),
                FormsModule,
                NgbModule,
                NgbPopoverModule
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                FormBuilder,
                ToolboxService,
                StesZasRestService,
                StesZasAbgleichService,
                StesDataRestService,
                FormPersonalienHelperService,
                NgbModal,
                MessageBus,
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
                { provide: NotificationService, useClass: MockNotificationService },
                SpinnerService,
                { provide: Location, useValue: locationStub },
                { provide: APP_BASE_HREF, useValue: '/' },
                { provide: NavigationService, useClass: NavigationServiceStub },
                AuthenticationService,
                AuthenticationRestService,
                ObliqueHelperService,
                FacadeService,
                SearchSessionStorageService
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
        fixture = TestBed.createComponent(StesDetailsPersonalienComponent);
        ngbModalStub = TestBed.get(NgbModal);
        formPersonalienHelper = TestBed.get(FormPersonalienHelperService);
        dataService = TestBed.get(StesDataRestService);
        zasService = TestBed.get(StesZasAbgleichService);
        fehlermeldungenService = TestBed.get(FehlermeldungenService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('speichern durch Service', () => {
        spyOn(component, 'save').and.callFake(() => {});
        component.save();
        expect(component.save).toBeCalled();
    });

    it('zurueckSetzen', () => {
        component.personalienForm.markAsDirty();
        component.reset();
        fixture.detectChanges();
        const ok = <HTMLElement>document.querySelector('#abbrechen-ok-button');
        ok.click();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(component.personalienForm.dirty).toBeFalsy();
        });
    });

    it('should ZAS abgleichen invoke openZasAbgleichen', () => {
        const spyOpenZasAbgleichen = spyOn(component, 'openZasAbgleichen').and.callThrough();
        component.openZasAbgleichen();
        expect(spyOpenZasAbgleichen).toHaveBeenCalled();
    });

    it('should isZASEditable positive', () => {
        component.personalienData = { personStesObject: { svNrFromZas: 'test' } };
        fixture.detectChanges();
        expect(component.isZASEditable()).toBeFalsy();
    });

    it('should isZASEditable negative', () => {
        component.personalienData = { personStesObject: { svNrFromZas: null } };
        fixture.detectChanges();
        expect(component.isZASEditable()).toBeTruthy();
    });

    it('should unsubscribe on destroy', () => {
        component['observeClickActionSub'] = of(true).subscribe();
        component['observeClickActionSubFooter'] = of(true).subscribe();
        component['dataServiceSub'] = of(true).subscribe();

        component.ngOnDestroy();

        expect(component['observeClickActionSub'].closed).toBeTruthy();
        expect(component['observeClickActionSubFooter'].closed).toBeTruthy();
        expect(component['dataServiceSub'].closed).toBeTruthy();
    });
});
