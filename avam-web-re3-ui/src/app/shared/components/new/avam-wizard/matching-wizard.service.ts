import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ArbeitgeberPaths, StesMatchingprofilPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ProfilvergleichDTO } from '@app/shared/models/dtos-generated/profilvergleichDTO';
import { Environment } from '@shared/components/new/avam-wizard/zuweisung-wizard.service';

@Injectable()
export class MatchingWizardService {
    list: any = [];
    currentStep: number;
    stesMatchingProfilId = 0;
    osteMatchingProfilId = 0;
    stesId = 0;
    osteId = 0;
    unternehmenId = 0;
    profilvergleich: ProfilvergleichDTO;
    environment: Environment;

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
                this.navigateStep1();
                break;
        }
    }

    navigateStep1() {
        this[`navigateTo${this.environment.toString()}`](1);
    }

    navigateStep2() {
        this[`navigateTo${this.environment.toString()}`](2);
    }

    navigateToMatching() {
        this[`navigateToMatching${this.environment.toString()}`]();
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

    setStesId(stesId: number) {
        this.stesId = stesId;
    }

    getStesId(): number {
        return this.stesId;
    }

    setOsteId(osteId: number) {
        this.osteId = osteId;
    }

    getOsteId(): number {
        return this.osteId;
    }

    setStesMatchingProfilId(stesMatchingProfilId: number) {
        this.stesMatchingProfilId = stesMatchingProfilId;
    }

    getStesMatchingProfilId(): number {
        return this.stesMatchingProfilId;
    }

    setProfilvergleich(profilvergleich: ProfilvergleichDTO) {
        this.profilvergleich = profilvergleich;
    }

    getProfilvergleich(): ProfilvergleichDTO {
        return this.profilvergleich;
    }

    setUnternehmenId(unternehmenId: number) {
        this.unternehmenId = unternehmenId;
    }

    getUnternehmenId(): number {
        return this.unternehmenId;
    }

    setEnvironment(environment: Environment) {
        this.environment = environment;
    }

    setOsteMatchingProfilId(osteMatchingProfilId: number) {
        this.osteMatchingProfilId = osteMatchingProfilId;
    }

    getOsteMatchingProfilId(): number {
        return this.osteMatchingProfilId;
    }

    navigateToVermittlung(zuweisungId: number) {
        this[`navigateToVermittlung${this.environment.toString()}`](zuweisungId);
    }

    private navigateToStes(stepNo: number) {
        switch (stepNo) {
            case 1:
                this.router.navigate([
                    `stes/${this.stesId}/${StesMatchingprofilPaths.MATCHINGPROFIL}/${this.stesMatchingProfilId}/${StesMatchingprofilPaths.VERMITTLUNG_ERFASSEN}/${
                        this.osteId
                    }/step1`
                ]);
                break;
            default:
                this.router.navigate([
                    `stes/${this.stesId}/${StesMatchingprofilPaths.MATCHINGPROFIL}/${this.stesMatchingProfilId}/${StesMatchingprofilPaths.VERMITTLUNG_ERFASSEN}/${
                        this.osteId
                    }/step2`
                ]);
                break;
        }
    }

    private navigateToOste(stepNo: number) {
        switch (stepNo) {
            case 1:
                this.router.navigate(
                    [
                        `${ArbeitgeberPaths.ARBEITGEBER_DETAILS}/${this.unternehmenId}/${ArbeitgeberPaths.STELLENANGEBOTE_MATCHINGPROFIL}/${
                            StesMatchingprofilPaths.VERMITTLUNG_ERFASSEN
                        }/step1`
                    ],
                    {
                        queryParams: { stesId: this.stesId, osteId: this.osteId, osteMatchingProfilId: this.osteMatchingProfilId }
                    }
                );
                break;
            default:
                this.router.navigate(
                    [
                        `${ArbeitgeberPaths.ARBEITGEBER_DETAILS}/${this.unternehmenId}/${ArbeitgeberPaths.STELLENANGEBOTE_MATCHINGPROFIL}/${
                            StesMatchingprofilPaths.VERMITTLUNG_ERFASSEN
                        }/step2`
                    ],
                    {
                        queryParams: { stesId: this.stesId, osteId: this.osteId, osteMatchingProfilId: this.osteMatchingProfilId }
                    }
                );
                break;
        }
    }

    private navigateToMatchingStes() {
        this.router.navigate([`stes/details/${this.getStesId()}/matchingprofil`]);
    }

    private navigateToMatchingOste() {
        this.router.navigate([`${ArbeitgeberPaths.ARBEITGEBER_DETAILS}/${this.unternehmenId}/${ArbeitgeberPaths.STELLENANGEBOTE_MATCHINGPROFIL}`], {
            queryParams: { osteId: this.osteId }
        });
    }

    private navigateToVermittlungStes(id: number) {
        this.router.navigate([`stes/details/${this.getStesId()}/arbeitsvermittlungen/vermittlung-bearbeiten`], {
            queryParams: { zuweisungId: id }
        });
    }

    private navigateToVermittlungOste(id: number) {
        this.router.navigate([`${ArbeitgeberPaths.ARBEITGEBER_DETAILS}/${this.unternehmenId}/${ArbeitgeberPaths.STELLENANGEBOTE_STELLEANGEBOT_VERMITTLUNG_BEARBEITEN}`], {
            queryParams: { osteId: this.osteId, zuweisungId: id }
        });
    }
}
