import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { WizardStepComponent } from './wizard-step.component';
import { TranslateService, TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { StepService } from '../step-service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockTranslatePipe } from '../../../../../../tests/helpers';

describe('WizardStepComponent', () => {
    let component: WizardStepComponent;
    let stepService: StepService;
    let fixture: ComponentFixture<WizardStepComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WizardStepComponent, MockTranslatePipe],
            providers: [
                StepService
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
            imports: [TranslateModule.forRoot({
                loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
            })]
        })
            .compileComponents();

    }));

    beforeEach(() => {

        fixture = TestBed.createComponent(WizardStepComponent);
        component = fixture.componentInstance;
        stepService = TestBed.get(StepService);
        fixture.detectChanges();

    });

    it('should call service', () => {
        spyOn(stepService, 'clickedStep');

        component.onClick();

        expect(stepService.clickedStep).toHaveBeenCalled();
    });

    it('should populate inputs', () => {
        component.stepId = "test";
        expect(component.stepId).toEqual("test");

        component.stepLable = "test";
        expect(component.stepLable).toEqual("test");

        component.stepTitle = "test";
        expect(component.stepTitle).toEqual("test");

        component.stepClass = "test";
        expect(component.stepClass).toEqual("test");
    });

    it('should create service', () => {
        component.stepProperties.isDisabled = true;
        spyOn(stepService, 'clickedStep');

        component.onClick();
    });

});
