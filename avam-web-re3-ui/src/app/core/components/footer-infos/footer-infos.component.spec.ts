import { ToolboxService } from '@app/shared';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterInfosComponent } from './footer-infos.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MockTranslatePipe } from '../../../../../tests/helpers';
import { EnvironmentRestService } from '../../http/environment-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs/internal/observable/of';
import { ActivatedRouteSnapshot, ActivationEnd, Data, Router } from '@angular/router';
import { MessageBus } from '@shared/services/message-bus';

describe('FooterInfosComponent', () => {
    const formNumberConst = '123';
    let component: FooterInfosComponent;
    let fixture: ComponentFixture<FooterInfosComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FooterInfosComponent, MockTranslatePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                EnvironmentRestService,
                ToolboxService,
                HttpClient,
                HttpHandler,
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
                                data: { formNumber: formNumberConst } as Data,
                                outlet: 'bla',
                                component: null
                            } as ActivatedRouteSnapshot)
                        ),
                        navigate: jasmine.createSpy('navigate')
                    }
                },
                MessageBus
            ],
            imports: [RouterTestingModule.withRoutes([])]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FooterInfosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set footer-info getFormNumber', () => {
        expect(component.getFormNumber()).toBe(formNumberConst + ' - ');
    });
});
