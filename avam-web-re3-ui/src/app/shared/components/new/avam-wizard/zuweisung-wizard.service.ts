import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ArbeitgeberPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ProfilvergleichDTO } from '@app/shared/models/dtos-generated/profilvergleichDTO';

export enum Environment {
    STES = 'Stes',
    OSTE = 'Oste'
}

@Injectable()
export class ZuweisungWizardService {
    list: any = [];
    currentStep: number;
    environment: Environment;
    osteId: number;
    stesId: number;
    unternehmenId: number;
    profilvergleich: ProfilvergleichDTO;

    constructor(private router: Router) {}

    changeStep(stepId) {
        this.deactiveSteps();

        this.list.toArray()[stepId].isActive = true;
        this.list.toArray()[stepId].isDisabled = false;
        this.list.toArray()[stepId].isDirty = true;
    }

    deactiveSteps() {
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

    movePosition(clickedStep: number) {
        switch (clickedStep) {
            case 0:
                this[`navigateTo${this.environment}`](1);
                break;
            case 1:
                this[`navigateTo${this.environment}`](2);
                break;
        }
    }

    navigateTo(stepNo: number) {
        this[`navigateTo${this.environment.toString()}`](stepNo);
    }

    navigateToOste(stepNo: number) {
        this.router.navigate([`arbeitgeber/details/${this.unternehmenId}/stellenangebote/stellenangebot/vermittlungen/erfassen/step${stepNo}`], {
            queryParams: stepNo === 1 ? { osteId: this.osteId } : { osteId: this.osteId, stesId: this.stesId }
        });
    }

    navigateToStes(stepNo: number) {
        this.router.navigate([`stes/${this.getStesId()}/${ArbeitgeberPaths.VERMITTLUNG_ERFASSEN}/step${stepNo}`]);
    }

    navigateToArbeitsvermittlung() {
        this[`navigateToArbeitsvermittlung${this.environment.toString()}`]();
    }

    navigateToArbeitsvermittlungOste() {
        this.router.navigate([`arbeitgeber/details/${this.unternehmenId}/stellenangebote/stellenangebot/vermittlungen`], {
            queryParams: { osteId: this.osteId }
        });
    }

    navigateToArbeitsvermittlungStes() {
        this.router.navigate([`stes/details/${this.getStesId()}/arbeitsvermittlungen`]);
    }

    navigateToBearbeiten(zuweisungId: number) {
        this[`navigateToBearbeiten${this.environment.toString()}`](zuweisungId);
    }

    navigateToBearbeitenOste(zuweisungId: number) {
        this.router.navigate([`arbeitgeber/details/${this.unternehmenId}/stellenangebote/stellenangebot/vermittlungen/bearbeiten`], {
            queryParams: { osteId: this.osteId, zuweisungId }
        });
    }

    navigateToBearbeitenStes(zuweisungId: number) {
        this.router.navigate([`stes/details/${this.stesId}/arbeitsvermittlungen/vermittlung-bearbeiten`], {
            queryParams: { zuweisungId }
        });
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

    makeStepsValid(currentStep: number) {
        for (let i = 0; i < currentStep; i++) {
            this.list.toArray()[i].isValid = true;
            this.list.toArray()[i].isDisabled = false;
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

    navigate(clickedStep) {
        this.router.navigateByUrl(this.list.toArray()[clickedStep].navigate);
    }

    setEnvironment(environment: Environment) {
        this.environment = environment;
    }

    setStesId(stesId: number) {
        this.stesId = stesId;
    }

    getStesId(): number {
        return this.stesId;
    }

    setUnternehmenId(unternehmenId: number) {
        this.unternehmenId = unternehmenId;
    }

    setOsteId(osteId: number) {
        this.osteId = osteId;
    }

    getOsteId(): number {
        return this.osteId;
    }

    setProfilvergleich(profilvergleich: ProfilvergleichDTO) {
        this.profilvergleich = profilvergleich;
    }

    getProfilvergleich(): ProfilvergleichDTO {
        return this.profilvergleich;
    }
}
