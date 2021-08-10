import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { AvamWizardStepComponent } from './avam-wizard-step.component';

import { DbTranslatePipe } from '@app/shared';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, Subscriber } from 'rxjs';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { APP_BASE_HREF, Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';

let locationStub: Partial<Location> = { subscribe: () => new Subscriber() };

describe('AvamWizardStepComponent', () => {
    let component: AvamWizardStepComponent;
    let fixture: ComponentFixture<AvamWizardStepComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamWizardStepComponent, MockTranslatePipe, DbTranslatePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
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
                {
                    provide: Router,
                    useValue: {
                        events: of({})
                    }
                },
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: Location, useValue: locationStub },
                { provide: APP_BASE_HREF, useValue: '/' }
            ],
            imports: [NgbTooltipModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamWizardStepComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
