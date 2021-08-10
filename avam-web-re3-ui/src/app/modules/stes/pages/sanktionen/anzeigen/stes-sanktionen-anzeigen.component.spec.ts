import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesSanktionenAnzeigenComponent } from './stes-sanktionen-anzeigen.component';
import { Subject, of } from 'rxjs';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { PermissionDirective } from '@app/shared/directives/permissions.directive';
import { ToolboxService } from '@app/shared/services/toolbox.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@stes/pages/leistungsexporte/leistungsexporte.component.spec';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviousRouteService } from '@shared/services/previous-route.service';

class PreviousRouteServiceStub {
    private previousUrl = '/sanktionen';

    public getPreviousUrl(): string {
        return this.previousUrl;
    }
}

xdescribe('StesSanktionenAnzeigenComponent', () => {
    let component: StesSanktionenAnzeigenComponent;
    let fixture: ComponentFixture<StesSanktionenAnzeigenComponent>;
    let stesDataRestService: StesDataRestService;
    const router = {
        navigate: jasmine.createSpy('navigate')
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesSanktionenAnzeigenComponent, MockTranslatePipe, PermissionDirective],
            imports: [HttpClientTestingModule, RouterTestingModule, NgbModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                ToolboxService,
                StesDataRestService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                {
                    provide: PreviousRouteService,
                    useClass: PreviousRouteServiceStub
                },
                {
                    provide: Router,
                    useValue: router
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ id: 222 }) }
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesSanktionenAnzeigenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        stesDataRestService = TestBed.get(StesDataRestService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call Sachverhalt erfassen', () => {
        const spyOpenSachVerhaltErfassen = spyOn(component, 'navigateTo').and.callThrough();
        component.navigateTo('arbeitsbemuehungen-erfassen');
        expect(spyOpenSachVerhaltErfassen).toHaveBeenCalled();
    });

    it('should get sanktionen data from restService', () => {
        const responseSubject = new Subject();
        spyOn(stesDataRestService, 'getSanktionen').and.returnValue(responseSubject);
        component.getData();
        expect(stesDataRestService.getSanktionen).toHaveBeenCalledTimes(1);
    });
});
