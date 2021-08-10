import { TestBed, inject } from '@angular/core/testing';
import { StepService } from './step-service';

describe('Service: StepService', () => {
    let stepService: StepService;
    let testSteps = [
        { stepId: '1', stepLable: 'A', stepProperties: { isDefault: 'false', isActive: 'false', isDisabled: 'false', isValid: 'false', stepTitle: 'undefined' } },
        { stepId: '2', stepLable: 'B', stepProperties: { isDefault: 'false', isActive: 'false', isDisabled: 'false', isValid: 'false', stepTitle: 'undefined' } },
        { stepId: '3', stepLable: 'C', stepProperties: { isDefault: 'false', isActive: 'false', isDisabled: 'false', isValid: 'false', stepTitle: 'undefined' } },
        { stepId: '4', stepLable: '1', stepProperties: { isDefault: 'false', isActive: 'false', isDisabled: 'false', isValid: 'false', stepTitle: 'undefined' } }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({}).compileComponents();

        stepService = TestBed.get(StepService);
        stepService.stepInfoList.push(stepService.createStepInfo('1', [], ['1']));
        stepService.stepInfoList.push(stepService.createStepInfo('2', [], ['2']));
        stepService.stepInfoList.push(stepService.createStepInfo('3', [], ['3']));
        stepService.stepInfoList.push(stepService.createStepInfo('4', ['3'], ['4']));
        stepService.stepInfoList.push(stepService.createStepInfo('5', ['3'], ['5']));
        stepService.stepInfoList.push(stepService.createStepInfo('6', ['3'], ['6']));
        stepService.stepInfoList.push(stepService.createStepInfo('7', ['3'], ['7']));
        stepService.stepInfoList.push(stepService.createStepInfo('8', ['3'], ['8']));
    });

    it('should ...', inject([StepService], (service: StepService) => {
        expect(service).toBeTruthy();
    }));

    it('should update stepList', () => {
        stepService.setStepList(testSteps);
        expect(stepService.stepList.length !== 0).toEqual(true);
    });

    it('should be set to Active and Enabled', () => {
        stepService.setStepList(testSteps);
        expect(stepService.stepList[0].stepProperties.isActive).toEqual(true);
        expect(stepService.stepList[0].stepProperties.isDisabled).toEqual(false);
    });

    it('should move to next step and return to previous', () => {
        stepService.setStepList(testSteps);
        stepService.moveToPreviousStep();
        expect(stepService.currentStepId).toEqual('1');
        stepService.moveToNextStep();
        stepService.moveToNextStep();
        stepService.moveToPreviousStep();
        expect(stepService.currentStepId).toEqual('3');
        stepService.moveToNextStep();
        expect(stepService.currentStepId).toEqual('4');
        stepService.moveToPreviousStep();
        expect(stepService.currentStepId).toEqual('3');
        stepService.currentStepId = '8';
        stepService.moveToNextStep();
    });

    it('stepId send/subscribe stepId', () => {
        stepService.sendChangeStep('5');
        stepService.observeChangeStep().subscribe(stepId => {
            expect(stepId).toEqual('5');
        });
    });

    it('stepId send/subscribe stesId', () => {
        stepService.sendStesId('1');
        stepService.observeStesId().subscribe(stesId => {
            expect(stesId).toEqual('1');
        });
    });
});
