import { PlanwertSuchenParameterDTO } from '@dtos/planwertSuchenParameterDTO.ts';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PlanwertDTO } from '@dtos/planwertDTO';
import { LeistungsvereinbarungDTO } from '@dtos/leistungsvereinbarungDTO';
//prettier-ignore
import { VwErfassenTableDataRow } 
from '@app/modules/amm/anbieter/pages/unternehmen-details/vertragswert-erfassen-wizard/components/vertragswert-erfassen-tree-table/vertragswert-erfassen-tree-table.component';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { VertragswertDTO } from '@dtos/vertragswertDTO';
import { INodeState } from '@app/library/wrappers/data/avam-generic-tree-table/node-state.interface';

@Injectable()
export class VertragswertErfassenWizardService implements OnDestroy {
    list: any;
    currentStep: number;
    onNext: Observable<boolean>;
    onPrevious: Observable<boolean>;
    onNextSubsctription: Subscription;
    onPreviousSubsctription: Subscription;
    isWizardNext = false;
    channel = 'vertragswert-erfassen-wizard';
    anbieterId: number;
    planwertTableData: PlanwertDTO[];
    selectedPlanwert: PlanwertDTO;
    leistungsvereinbarungId: number;
    leistungsvereinbarungDTO: LeistungsvereinbarungDTO;
    selectedTreeTableItem: VwErfassenTableDataRow;
    hasTreeTableState: boolean;
    isPlanwertUebernehmenCheckedState: boolean;
    tableDataState: TreeNodeInterface[];
    lastTreeTableSelection: VwErfassenTableDataRow;
    planwertSuchenParameterDTO: PlanwertSuchenParameterDTO;
    detailDtoState: VertragswertDTO;
    detailUsedTreeTableItem: VwErfassenTableDataRow;
    detailUsedPlanwert: PlanwertDTO;
    displayLeaveConfirmation = false;
    expansionState: INodeState[];
    private routerOptions = ['objekt-auswaehlen', 'planwert-auswaehlen', 'detail'];

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
        this.router.navigate([`amm/anbieter/${this.anbieterId}/vertragswert/erfassen/${this.routerOptions[stepId]}`], {
            queryParams: { lvId: this.leistungsvereinbarungId }
        });
    }

    resetValues() {
        this.currentStep = undefined;
        this.list = undefined;
        this.isWizardNext = undefined;
        this.onNext = undefined;
        this.onPrevious = undefined;
        this.onNextSubsctription = undefined;
        this.onPreviousSubsctription = undefined;
        this.channel = undefined;
        this.hasTreeTableState = undefined;
        this.isPlanwertUebernehmenCheckedState = undefined;
        this.tableDataState = undefined;
        this.planwertSuchenParameterDTO = undefined;
        this.lastTreeTableSelection = undefined;
        this.detailDtoState = undefined;
        this.detailUsedTreeTableItem = undefined;
        this.detailUsedPlanwert = undefined;
        this.anbieterId = undefined;
        this.planwertTableData = undefined;
        this.selectedPlanwert = undefined;
        this.leistungsvereinbarungId = undefined;
        this.leistungsvereinbarungDTO = undefined;
        this.selectedTreeTableItem = undefined;
        this.displayLeaveConfirmation = undefined;
        this.expansionState = undefined;
    }

    ngOnDestroy(): void {
        if (this.onNextSubsctription) {
            this.onNextSubsctription.unsubscribe();
        }
        if (this.onPreviousSubsctription) {
            this.onPreviousSubsctription.unsubscribe();
        }
    }

    disableStep(step: number) {
        this.list.toArray()[step].isDisabled = true;
    }

    enableStep(step: number) {
        this.list.toArray()[step].isDisabled = false;
    }

    wizardOnMove(clickedStep: number) {
        this.selectCurrentStep(clickedStep);
    }

    private makeStepInvalid(step: number) {
        for (let i = step; i < this.list.length; i++) {
            this.list.toArray()[i].isValid = false;
        }
    }
}
