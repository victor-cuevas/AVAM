import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { AvamWizardSubstepComponent } from './avam-wizard-substep.component';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { Router } from '@angular/router';
import { WizardService } from '../wizard.service';
import { APP_BASE_HREF, Location } from '@angular/common';
import { of, Subscriber } from 'rxjs';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';

let locationStub: Partial<Location> = { subscribe: () => new Subscriber() };

describe('AvamWizardSubstepComponent', () => {
    let component: AvamWizardSubstepComponent;
    let fixture: ComponentFixture<AvamWizardSubstepComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamWizardSubstepComponent, MockTranslatePipe],
            providers: [
                {
                    provide: Router,
                    useValue: {
                        events: of({})
                    }
                },
                WizardService,
                FehlermeldungenService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: Location, useValue: locationStub },
                { provide: APP_BASE_HREF, useValue: '/' }
            ],
            imports: [NgbTooltipModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamWizardSubstepComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
