import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AmmBeschreibungDTO } from '@app/shared/models/dtos-generated/ammBeschreibungDTO';
import { FormGroup } from '@angular/forms';
import { NodeData } from '../../massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';

@Injectable()
export class AmmProduktErfassenWizardService implements OnDestroy {
    list: any;
    currentStep: number;
    onNext: Observable<boolean>;
    onPrevious: Observable<boolean>;
    onNextSubsctription: Subscription;
    onPreviousSubsctription: Subscription;
    produktId = 0;
    beschreibungDTOState: AmmBeschreibungDTO;
    erfassungsspracheIdBeschreibungState: number;
    erfassungsspracheIdGrunddatenState: number;
    isWizardNext = false;
    grunddatenForm: FormGroup;
    produktTitelObject: any;
    savedElementkategorieAmtObject: ElementKategorieDTO;
    savedStrukturelementGesetzObject: StrukturElementDTO;
    channel = 'produkt-erfassen-wizard';
    private routerOptions = ['grunddaten', 'beschreibung'];

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
        this.router.navigate([`amm/bewirtschaftung/produkt/erfassen/${this.routerOptions[stepId]}`]);
    }

    resetValues() {
        this.currentStep = undefined;
        this.list = undefined;
        this.produktId = 0;
        this.beschreibungDTOState = undefined;
        this.erfassungsspracheIdBeschreibungState = undefined;
        this.erfassungsspracheIdGrunddatenState = undefined;
        this.isWizardNext = false;
        this.grunddatenForm = undefined;
        this.produktTitelObject = undefined;
        this.savedStrukturelementGesetzObject = undefined;
        this.savedElementkategorieAmtObject = undefined;
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
