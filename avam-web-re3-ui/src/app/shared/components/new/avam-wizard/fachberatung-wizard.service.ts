import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FachberatungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { FachberatungParamDTO } from '@app/shared/models/dtos-generated/fachberatungParamDTO';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class FachberatungWizardService {
    currentStep: number;
    list: any = [];
    private stesId: number;
    private fachberatungsangebotId: number;
    private fachberatungsangebot: FachberatungParamDTO;
    private searchFormData: FormGroup;
    private identischeZuweisungVorhanden = false;

    constructor(private router: Router) {}

    initSteps() {
        this.currentStep = 0;
        this.deactiveSteps();
        this.list.first.isActive = true;
        this.list.first.isDirty = true;
        this.list.first.isDisabled = false;
    }

    selectCurrentStep(currentStep: number) {
        if (currentStep >= 0 && currentStep < this.list.length) {
            this.deactiveSteps();
            this.makeStepsValid(currentStep);
            this.list.toArray()[currentStep].isActive = true;
            this.list.toArray()[currentStep].isDisabled = false;
            this.list.toArray()[currentStep].isDirty = true;
            this.currentStep = currentStep;
        }
    }

    setStesId(stesId: number) {
        this.stesId = stesId;
    }

    setFachberatungsangebotId(fachberatungsangebotId: number) {
        this.fachberatungsangebotId = fachberatungsangebotId;
    }

    movePosition(clickedStep: number) {
        switch (clickedStep) {
            case 0:
                this.navigateStep1();
                break;
            case 1:
                this.navigateStep2();
                break;
        }
    }

    navigateStep1() {
        this.router.navigate([`stes/${this.stesId}/${FachberatungPaths.FACHBERATUNG_ERFASSEN}/step1`]);
    }

    navigateStep2() {
        this.router.navigate([`/stes/${this.stesId}/${FachberatungPaths.FACHBERATUNG_ERFASSEN}/step2/fachberatungsangebot/${this.fachberatungsangebotId}`]);
    }

    navigateZuwFachberatungen() {
        this.router.navigate([`stes/details/${this.stesId}/${FachberatungPaths.FACHBERATUNGEN}`]);
    }

    setFachberatungsangebot(fachberatungsangebot: FachberatungParamDTO) {
        this.fachberatungsangebot = fachberatungsangebot;
    }

    getFachberatungsangebot(): FachberatungParamDTO {
        return this.fachberatungsangebot;
    }

    setSearchForm(searchForm) {
        this.searchFormData = searchForm;
    }

    getSearchForm() {
        return this.searchFormData;
    }

    setIdentischeZuweisungVorhanden(flag: boolean) {
        this.identischeZuweisungVorhanden = flag;
    }

    getIdentischeZuweisungVorhanden(): boolean {
        return this.identischeZuweisungVorhanden;
    }

    private deactiveSteps() {
        this.list.forEach(step => {
            step.isActive = false;
            step.isDefault = false;
            step.isDirty = false;
            step.isDisabled = true;
            step.isInvalid = false;
            step.isLoading = false;
            step.isValid = false;
        });
    }

    private makeStepsValid(currentStep: number) {
        for (let i = 0; i < currentStep; i++) {
            this.list.toArray()[i].isValid = true;
            this.list.toArray()[i].isDisabled = false;
        }
    }
}
