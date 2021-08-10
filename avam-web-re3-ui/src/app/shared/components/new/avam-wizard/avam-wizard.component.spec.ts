import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AvamWizardComponent } from './avam-wizard.component';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';

describe('WizardComponent', () => {
    let component: AvamWizardComponent;
    let fixture: ComponentFixture<AvamWizardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [FehlermeldungenService, { provide: TranslateService, useClass: TranslateServiceStub }],
            declarations: [AvamWizardComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamWizardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
