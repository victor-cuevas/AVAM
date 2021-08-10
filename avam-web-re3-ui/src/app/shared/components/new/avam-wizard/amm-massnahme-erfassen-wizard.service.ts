import { DurchfuehrungsortDTO } from '@dtos/durchfuehrungsortDTO';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ElementKategorieDTO } from '@dtos/elementKategorieDTO';
import { StrukturElementDTO } from '@dtos/strukturElementDTO';
import { FormGroup } from '@angular/forms';
import { MultilanguageTitle } from '@app/shared/helpers/amm.helper';
import { AmmBeschreibungDTO } from '@dtos/ammBeschreibungDTO';

@Injectable()
export class AmmMassnahmeErfassenWizardService implements OnDestroy {
    list: any;
    currentStep: number;
    onNext: Observable<boolean>;
    onPrevious: Observable<boolean>;
    onNextSubsctription: Subscription;
    onPreviousSubsctription: Subscription;
    isWizardNext = false;
    channel = 'massnahme-erfassen-wizard';
    erfassungsspracheIdGrunddatenState: number;
    massnahmeId: number;
    produktId: number;
    massnahmeTitelObject: MultilanguageTitle;
    produktTitelObject: MultilanguageTitle;
    unternehmenObject: UnternehmenDTO;
    zulassungstypObject: CodeDTO;
    savedElementkategorieAmtObject: ElementKategorieDTO;
    savedStrukturelementGesetzObject: StrukturElementDTO;
    erfassungsspracheIdBeschreibungState: number;
    grunddatenForm: FormGroup;
    beschreibungDTOState: AmmBeschreibungDTO;
    durchfuehrungsortDTOState: DurchfuehrungsortDTO;
    hasAnbieterChanged: boolean;
    kpersonId: number;
    private routerOptions = ['grunddaten', 'beschreibung', 'durchfuehrungsort'];

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
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahme/erfassen/${this.routerOptions[stepId]}`]);
    }

    resetValues() {
        this.currentStep = undefined;
        this.list = undefined;
        this.isWizardNext = false;
        this.erfassungsspracheIdGrunddatenState = undefined;
        this.erfassungsspracheIdBeschreibungState = undefined;
        this.massnahmeId = undefined;
        this.produktId = undefined;
        this.massnahmeTitelObject = undefined;
        this.produktTitelObject = undefined;
        this.unternehmenObject = undefined;
        this.zulassungstypObject = undefined;
        this.savedElementkategorieAmtObject = undefined;
        this.savedStrukturelementGesetzObject = undefined;
        this.grunddatenForm = undefined;
        this.beschreibungDTOState = undefined;
        this.durchfuehrungsortDTOState = undefined;
        this.hasAnbieterChanged = false;
        this.kpersonId = undefined;
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
