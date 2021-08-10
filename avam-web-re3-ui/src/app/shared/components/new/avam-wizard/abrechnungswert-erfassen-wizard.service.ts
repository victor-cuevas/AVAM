import { Injectable, OnDestroy, TemplateRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AbrechnungswertBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungswertBearbeitenParameterDTO';
import { FormGroup } from '@angular/forms';

@Injectable()
export class AbrechnungswertErfassenWizardService implements OnDestroy {
    list: any;
    currentStep: number;
    onNext: Observable<boolean>;
    onPrevious: Observable<boolean>;
    onNextSubsctription: Subscription;
    onPreviousSubsctription: Subscription;
    isWizardNext = false;
    channel = 'abrechnungswert-erfassen-wizard';
    panelTemplate: TemplateRef<any>;
    anbieterId: number;
    leistungsvereinbarungId: number;
    abrechnungswertParam: AbrechnungswertBearbeitenParameterDTO;
    abrechnungswertId: number;
    grunddatenForm: FormGroup;
    vertragswertId: number;
    private routerOptions = ['grunddaten', 'kosten'];

    constructor(private router: Router) {}

    setOnNextStep(onNext: Observable<boolean>) {
        this.onNext = onNext;
    }

    setOnPreviousStep(onPrevious: Observable<boolean>) {
        this.onPrevious = onPrevious;
    }

    moveNext() {
        const nextStep = this.currentStep + 1;
        if (nextStep < this.list.toArray().length) {
            this.movePosition(nextStep);
        }
    }

    movePrev() {
        const prevStep = this.currentStep - 1;

        if (prevStep > -1) {
            this.movePosition(prevStep);
        }
    }

    movePosition(clickedStep: number) {
        if (this.currentStep < clickedStep) {
            this.onNextSubsctription = this.onNext.subscribe(moveNext => {
                if (moveNext) {
                    this.wizardOnMove(clickedStep);
                }
            });
        } else {
            this.onPreviousSubsctription = this.onPrevious.subscribe(movePrevious => {
                if (movePrevious) {
                    this.wizardOnMove(clickedStep);
                }
            });
        }
    }

    initSteps() {
        this.currentStep = 0;
        this.list.forEach(element => {
            element.isActive = false;
            element.isDefault = false;
            element.isDirty = false;
            element.isDisabled = true;
            element.isInvalid = false;
            element.isLoading = false;
            element.isValid = false;
        });
        this.list.first.isActive = true;
        this.list.first.isDirty = true;
        this.list.first.isDisabled = false;
    }

    selectCurrentStep(selectedStep: number) {
        if (selectedStep >= 0 && selectedStep < this.list.length) {
            const stepList = this.list.toArray();
            stepList[this.currentStep].isActive = false;
            stepList[this.currentStep].isValid = true;
            stepList[selectedStep].isValid = false;
            stepList[selectedStep].isActive = true;
            stepList[selectedStep].isDisabled = false;
            stepList[selectedStep].isDirty = true;
            this.currentStep = selectedStep;
            this.makeStepInvalid(selectedStep);
            this.navigateStep(selectedStep);
        }
    }

    navigateStep(stepId) {
        this.router.navigate(
            [`amm/anbieter/${this.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/erfassen/${this.routerOptions[stepId]}`],
            {
                queryParams: { lvId: this.leistungsvereinbarungId, vertragswertId: this.vertragswertId }
            }
        );
    }

    resetValues() {
        this.currentStep = undefined;
        this.list = undefined;
        this.isWizardNext = false;
        this.onNext = undefined;
        this.onPrevious = undefined;
        this.onNextSubsctription = undefined;
        this.onPreviousSubsctription = undefined;
        this.channel = undefined;
    }

    ngOnDestroy(): void {
        if (this.onNextSubsctription) {
            this.onNextSubsctription.unsubscribe();
        }
        if (this.onPreviousSubsctription) {
            this.onPreviousSubsctription.unsubscribe();
        }
    }

    private wizardOnMove(clickedStep: number) {
        this.selectCurrentStep(clickedStep);
    }

    private makeStepInvalid(step: number) {
        for (let i = step; i < this.list.length; i++) {
            this.list.toArray()[i].isValid = false;
        }
    }
}
