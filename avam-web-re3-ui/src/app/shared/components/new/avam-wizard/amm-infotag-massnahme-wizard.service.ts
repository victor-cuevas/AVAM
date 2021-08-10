import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { Observable, Subscription } from 'rxjs';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';

@Injectable()
export class AmmInfotagMassnahmeWizardService implements OnDestroy {
    massnahmeDto: MassnahmeDTO;
    infotagDto: SessionDTO;
    spracheOptions: CodeDTO[];
    grunddatenForm: FormGroup;
    beschreibungForm: any;
    infobarKurzel: string;
    wizardCompleted = false;
    navigateInside = false;
    isMassnahme = false;
    massnahmeId: number;
    dfeCopyId: number;

    list: any;
    currentStep: number;
    onNext: Observable<boolean>;
    onPrevious: Observable<boolean>;
    onNextSubsctription: Subscription;
    onPreviousSubsctription: Subscription;
    private routerOptions = ['grunddaten', 'beschreibung'];
    constructor(private router: Router, private fehlermeldungenService: FehlermeldungenService) {}

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
        this.navigateInside = true;
        this.fehlermeldungenService.closeMessage();

        if (this.currentStep === clickedStep) {
            return;
        }

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
        // Infotag Massnahme Wizard
        if (this.isMassnahme) {
            this.router.navigate([`amm/infotag/massnahme/erfassen/${this.routerOptions[stepId]}`]);
            // Copy Infotag Wizard
        } else if (this.dfeCopyId) {
            this.router.navigate([`amm/infotag/massnahme/${this.massnahmeId}/infotag/erfassen/${this.routerOptions[stepId]}`], {
                queryParams: {
                    dfeId: this.dfeCopyId
                }
            });
            // New Infotag Wizard
        } else {
            this.router.navigate([`amm/infotag/massnahme/${this.massnahmeId}/infotag/erfassen/${this.routerOptions[stepId]}`]);
        }
    }

    ngOnDestroy(): void {
        if (this.onNextSubsctription) {
            this.onNextSubsctription.unsubscribe();
        }
        if (this.onPreviousSubsctription) {
            this.onPreviousSubsctription.unsubscribe();
        }
        this.massnahmeDto = undefined;
        this.infotagDto = undefined;
        this.spracheOptions = undefined;
        this.grunddatenForm = undefined;
        this.beschreibungForm = undefined;
        this.infobarKurzel = undefined;
        this.wizardCompleted = false;
        this.navigateInside = false;
        this.isMassnahme = false;
        this.massnahmeId = undefined;
        this.dfeCopyId = undefined;
    }

    cancel() {
        this.fehlermeldungenService.closeMessage();
        if (!this.isMassnahme) {
            this.router.navigate([`amm/infotag/massnahme/${this.massnahmeId}/infotage`]);
            return;
        }

        this.router.navigate(['/home/start-page']);
    }

    getMassnahmeUnternehmen() {
        if (this.massnahmeDto && this.massnahmeDto.ammAnbieterObject) {
            return this.massnahmeDto.ammAnbieterObject.unternehmen;
        }

        return undefined;
    }

    getInfotagUnternehmen() {
        if (this.infotagDto && this.infotagDto.durchfuehrungsortObject) {
            return this.infotagDto.durchfuehrungsortObject.unternehmenObject;
        }

        return undefined;
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
