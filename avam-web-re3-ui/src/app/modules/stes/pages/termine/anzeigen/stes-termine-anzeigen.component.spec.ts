import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesTermineAnzeigenComponent } from '@stes/pages/termine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { DbTranslatePipe, ToolboxService, PermissionDirective } from '../../../../../shared';
import { StesTerminRestService } from '@core/http/stes-termin-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService } from 'oblique-reactive';
import { of } from 'rxjs';
import { StesTerminDTO } from '@dtos/stesTerminDTO';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { StesInfotagModalComponent } from '@stes/components';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { InfotagRestService } from '@core/http/infotag-rest.service';
import { InfotagService } from '@shared/services/infotag.service';
import { MessageBus } from '@shared/services/message-bus';
import { StesInfotagBuchenService } from '@stes/services/stes-infotag-buchen.service';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { NavigationService } from '@shared/services/navigation-service';
import { NgbModalStub } from '@test_helpers/ngb-modal-stub';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { FacadeService } from '@shared/services/facade.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';

describe('StesTermineComponent', () => {
    let component: StesTermineAnzeigenComponent;
    let fixture: ComponentFixture<StesTermineAnzeigenComponent>;
    let serviceToolboxService: ToolboxService;
    let ngbModalStub: NgbModalStub;
    const terminMock: StesTerminDTO[] = [
        {
            art: {
                codeId: 1412,
                textDe: 'Beratungsgespräch',
                textFr: 'Entretien de conseil',
                textIt: 'Colloquio di consulenza'
            },
            beginn: new Date(1560333600000),
            ende: new Date(1560337200000),
            kontaktperson: 'Bucko, Gunda',
            status: {
                codeId: 1415,
                textDe: 'geplant',
                textFr: 'planifié',
                textIt: 'pianificato'
            },
            stesId: 1,
            stesIdAvam: 'AD000001',
            stesTerminId: 4,
            zeitVonBis: null
        }
    ];

    beforeEach(async(() => {
        TestBed.overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [StesInfotagModalComponent]
            }
        });
        TestBed.configureTestingModule({
            declarations: [MockTranslatePipe, StesInfotagModalComponent, StesTermineAnzeigenComponent, PermissionDirective],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                ToolboxService,
                StesTerminRestService,
                DbTranslatePipe,
                HttpClient,
                HttpHandler,
                { provide: TranslateService, useClass: TranslateServiceStub },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ id: 222 }) }
                    }
                },
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                SpinnerService,
                NgbModal,
                InfotagService,
                InfotagRestService,
                { provide: NavigationService, useClass: NavigationServiceStub },
                MessageBus,
                StesInfotagBuchenService,
                AmmRestService,
                StesDataRestService,
                FacadeService,
                AuthenticationService,
                AuthenticationRestService
            ],
            imports: [NgbModule, RouterTestingModule.withRoutes([])]
        }).compileComponents();
    }));

    beforeEach(() => {
        serviceToolboxService = TestBed.get(ToolboxService);
        fixture = TestBed.createComponent(StesTermineAnzeigenComponent);
        component = fixture.componentInstance;
        ngbModalStub = TestBed.get(NgbModal);
        fixture.detectChanges();
    });

    it('should test functions', () => {
        expect(component).toBeTruthy();

        component.tableData = [];
        component.terminResultsData = [];
        component.loadTableData();
        expect(component.contentNumber).toEqual(0);

        component.terminResultsData = terminMock;
        component.loadTableData();
        expect(component.contentNumber).toEqual(1);

        // component.editTerminData(eventMock);
        // component.termineErfassen();

        spyOn(ngbModalStub, 'open').and.callThrough();
        component.infotagBuchen();
        expect(ngbModalStub.open).toHaveBeenCalled();

        component['fehlermeldungenSubscription'] = of(true).subscribe();
        component.ngOnDestroy();
        expect(component['fehlermeldungenSubscription'].closed).toBeTruthy();
    });
});
