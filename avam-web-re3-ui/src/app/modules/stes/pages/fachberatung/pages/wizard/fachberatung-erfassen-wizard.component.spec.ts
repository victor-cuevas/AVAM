import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FachberatungErfassenWizardComponent } from './fachberatung-erfassen-wizard.component';
import { MockTranslatePipe } from '@test_helpers/';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('FachberatungErfassenWizardComponent', () => {
    let component: FachberatungErfassenWizardComponent;
    let fixture: ComponentFixture<FachberatungErfassenWizardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [FachberatungErfassenWizardComponent, MockTranslatePipe],
            providers: [
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ stesId: 222 })
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FachberatungErfassenWizardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
