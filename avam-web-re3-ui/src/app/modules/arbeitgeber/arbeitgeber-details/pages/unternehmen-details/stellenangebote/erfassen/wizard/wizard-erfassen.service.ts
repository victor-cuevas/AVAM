import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { SpinnerService } from 'oblique-reactive';
import { OsteDTO } from '@dtos/osteDTO';
import { OsteAnlegenParamDTO } from '@dtos/osteAnlegenParamDTO';
import { SprachkenntnisDTO } from '@dtos/sprachkenntnisDTO';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { OsteBerufsbildungEntryParamDTO } from '@dtos/osteBerufsbildungEntryParamDTO';

@Injectable()
export class WizardErfassenService {
    list: any = [];
    currentStep: number;
    unternehmenId: string;
    osteErfassenParam = {
        step1: false,
        step2: false,
        step3: false,
        step4: false
    };
    osteDTO: OsteDTO;
    osteAnlegeParamDTO: OsteAnlegenParamDTO;
    osteId;
    sprachkenntnisDTO: SprachkenntnisDTO[];
    berufeDTO: OsteBerufsbildungEntryParamDTO[];
    unternehmenDto: UnternehmenResponseDTO;

    constructor(private router: Router, private spinnerService: SpinnerService) {}

    resetData() {
        this.osteErfassenParam = {
            step1: false,
            step2: false,
            step3: false,
            step4: false
        };
        this.setOsteId(null);
        this.setOsteDTO(null);
        this.setOsteAnlegeParamDTO(null);
        this.setSprachkenntnisDTO(null);
        this.setUnternehmenDTO(null);
    }

    setOsteId(id) {
        this.osteId = id;
    }

    setOsteDTO(osteDTO: OsteDTO) {
        this.osteDTO = osteDTO;
    }

    setOsteAnlegeParamDTO(osteAnlegenParamDTO: OsteAnlegenParamDTO) {
        this.osteAnlegeParamDTO = osteAnlegenParamDTO;
    }

    setSprachkenntnisDTO(sprachkenntnisDTO: SprachkenntnisDTO[]) {
        this.sprachkenntnisDTO = sprachkenntnisDTO;
    }

    setOsteBerufsbildungEntryParamDTO(berufe: OsteBerufsbildungEntryParamDTO[]) {
        this.berufeDTO = berufe;
    }

    setUnternehmenDTO(unternehmenDto: UnternehmenResponseDTO) {
        this.unternehmenDto = unternehmenDto;
    }

    getUnternehmenDTO() {
        return this.unternehmenDto;
    }

    movePosition(clickedStep: number) {
        switch (clickedStep) {
            case 0:
                this.navigateTo(1, this.osteId || null);
                break;
            case 1:
                this.navigateTo(2, this.osteId || null);
                break;
            case 2:
                this.navigateTo(3, this.osteId || null);
                break;
            case 3:
                this.navigateTo(4, this.osteId || null);
                break;
        }
    }

    selectCurrentStep(currentStep: number) {
        if (currentStep >= 0 && currentStep < this.list.length) {
            this.deactiveSteps();
            this.makeStepsValid(currentStep);
            this.list.toArray()[currentStep].isDirty = true;
            this.list.toArray()[currentStep].isActive = true;
            this.list.toArray()[currentStep].isDisabled = false;
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

    activateSpinner(channel: string) {
        this.spinnerService.activate(channel);
        this.deactivateWizard();
    }

    deactivateSpinner(channel: string) {
        this.spinnerService.deactivate(channel);
        this.activateWizard();
        OrColumnLayoutUtils.scrollTop();
    }

    navigateTo(stepNo: number, osteId?: number) {
        this.router.navigate([`arbeitgeber/details/${this.unternehmenId}/stellenangebote/erfassen/step${stepNo}`], { queryParams: { osteId } });
    }

    navigateToOsteUebersicht() {
        this.router.navigate([`arbeitgeber/details/${this.unternehmenId}/stellenangebote`]);
    }

    private activateWizard() {
        if (this.list) {
            this.list.forEach(step => {
                step.isLoading = false;
            });
        }
    }

    private deactivateWizard() {
        if (this.list) {
            this.list.forEach(step => {
                step.isLoading = true;
            });
        }
    }
}
