import { async, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { MessageBus } from '@shared/services/message-bus';
import { navigationModel } from '@shared/models/navigation-model';
import { NavigationService } from '@shared/services/navigation-service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';

describe('NavigationComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavigationComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({}),
                        data: of({ subscribe: () => {} })
                    }
                },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                {
                    provide: Router,
                    useValue: {
                        config: [
                            {
                                path: of({ navItems: navigationModel.stes })
                            }
                        ]
                    }
                },
                MessageBus,
                AuthenticationService,
                AuthenticationRestService,
                {
                    provide: NavigationService,
                    useClass: NavigationServiceStub
                }
            ],
            imports: [HttpClientTestingModule, RouterTestingModule]
        }).compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(NavigationComponent);
        const component = fixture.debugElement.componentInstance;
        expect(component.activateAncestors).toBeFalsy();
        expect(component).toBeTruthy();
    });

    it('shows side navigation items', () => {
        const fixture = TestBed.createComponent(NavigationComponent);
        const component = fixture.debugElement.componentInstance;
        component.ngOnInit();
        // TODO: Verify items have been set
    });

    it('sets', () => {
        const fixture = TestBed.createComponent(NavigationComponent);
        const component = fixture.debugElement.componentInstance;

        component.navItems = navigationModel.stes;
    });

    // it('should labelFormatter', () => {
    // TODO: VERIFY TEST FUNCTION expect(component.labelFormatter({ item: { items: [] } })).toEqual('&bull;&ensp;undefined');
    // });
});
