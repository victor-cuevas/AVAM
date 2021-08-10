import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

class StepInfo {
    public availableNextSteps: string[];
    private id: string;
    private parentId: string[];

    constructor(id, parentId, availableNextSteps) {
        this.id = id;
        this.availableNextSteps = availableNextSteps;
        this.parentId = parentId;
    }

    getId() {
        return this.id;
    }

    getParentId() {
        return this.parentId;
    }

    getAvailableNextSteps() {
        return this.availableNextSteps;
    }
}

@Injectable({
    providedIn: 'root'
})
export class StepService {
    public stepList: any = [];
    public stepInfoList: StepInfo[] = [];
    public currentStepId: string;
    private changePageSubject = new Subject<any>();
    private stesIdSubject = new Subject<string>();
    private burfsdatenSubject = new Subject<boolean>();

    constructor() {}

    createStepInfo(id, parentId?, availableNextSteps?) {
        return new StepInfo(id, parentId, availableNextSteps);
    }

    setStepList(step) {
        this.stepList = step;
        this.clickedStep('1');
    }

    clickedStep(id: string, state?: any) {
        const stepsToActivate: string[] = [];
        this.stepInfoList
            .find(element => element.getId() === id)
            .getParentId()
            .forEach(parent => {
                stepsToActivate.push(parent);
            });
        stepsToActivate.push(id);
        this.activateSteps(stepsToActivate);
        this.enableAvailableSteps(id);
        this.currentStepId = id;
        this.sendChangeStep(this.currentStepId, state);
    }

    moveToNextStep(state?: any) {
        let nextStepId = Number.parseInt(this.currentStepId) + 1;

        if (nextStepId <= 8) {
            if (nextStepId !== 3) {
                this.stepInfoList
                    .find(step => step.getId() === this.currentStepId)
                    .getAvailableNextSteps()
                    .forEach(st => {
                        if (
                            !this.stepInfoList
                                .find(_st => _st.getId() === String(nextStepId))
                                .getAvailableNextSteps()
                                .includes(st)
                        ) {
                            this.stepInfoList.find(_st => _st.getId() === String(nextStepId)).availableNextSteps.push(st);
                        }
                    });
                this.stepInfoList
                    .find(step => step.getId() === String(nextStepId))
                    .getAvailableNextSteps()
                    .forEach(step => {
                        if (
                            !this.stepInfoList
                                .find(st => st.getId() === step)
                                .getAvailableNextSteps()
                                .includes(String(nextStepId))
                        ) {
                            this.stepInfoList.find(st => st.getId() === step).availableNextSteps.push(String(nextStepId));
                        }
                    });
            }
            this.clickedStep(String(nextStepId), state);
        }
    }

    moveToPreviousStep() {
        let prevStep = Number.parseInt(this.currentStepId) - 1;

        if (prevStep > 0) {
            if (
                this.stepInfoList
                    .find(step => step.getId() === this.currentStepId)
                    .getAvailableNextSteps()
                    .includes(String(prevStep))
            ) {
                this.clickedStep(String(prevStep));
            }
        }
    }

    sendChangeStep(event: string, currState?: any) {
        this.changePageSubject.next({ stepId: event, state: currState });
    }

    observeChangeStep(): Observable<any> {
        return this.changePageSubject.asObservable();
    }

    sendStesId(event: string) {
        this.stesIdSubject.next(event);
    }

    observeStesId(): Observable<string> {
        return this.stesIdSubject.asObservable();
    }

    showBerufsdaten(show: boolean) {
        this.burfsdatenSubject.next(show);
    }

    observeBerufsdaten(): Observable<boolean> {
        return this.burfsdatenSubject.asObservable();
    }

    private activateSteps(stepIds: string[]) {
        this.stepList.forEach(element => {
            stepIds.includes(element.stepId) ? (element.stepProperties.isActive = true) : (element.stepProperties.isActive = false);
        });
    }

    private enableAvailableSteps(id: string) {
        let curentStepInfo = this.stepInfoList.find(element => element.getId() === id);
        this.stepList.forEach(step => {
            curentStepInfo.getAvailableNextSteps().includes(step.stepId) ? (step.stepProperties.isDisabled = false) : (step.stepProperties.isDisabled = true);
        });
    }
}
