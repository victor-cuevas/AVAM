import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { Observable, Subscription, of } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbbrechenModalComponent } from '../../abbrechen-modal/abbrechen-modal.component';
import { AbbrechenModalActionCallback } from '@app/shared/classes/abbrechen-modal-action-dismiss-only-current';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';

@Injectable()
export class MassnahmeBuchenWizardService implements OnDestroy {
    stesId = 0;
    list: any = [];
    currentStep: number;
    massnahmeId = 0;
    massnahmeCode = '';
    gfId = 0;
    kontaktpersonId: number;
    unternehmenId: number;
    onNext: Observable<boolean>;
    onNextSubscription: Subscription;
    onPrevious: Observable<boolean>;
    onPreviousSubscription: Subscription;
    routerOptions = [AMMPaths.ANGEBOT_SUCHEN, '', AMMPaths.KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG_ERFASSEN, AMMPaths.KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT_ERFASSEN];
    notFirstEntry = false;
    isDirty = {
        buchung: false,
        beschreibung: false,
        durchfuehrungsort: false
    };
    beschreibungFormValues: any;
    durchfuehrungsortFormValues: any;

    constructor(
        private router: Router,
        private spinnerService: SpinnerService,
        private ammDataService: AmmRestService,
        private modalService: NgbModal,
        private fehlermeldungenService: FehlermeldungenService
    ) {}

    setStesId(stesId: number) {
        this.stesId = stesId;
    }

    getStesId(): number {
        return this.stesId;
    }

    setMassnahmeId(massnahmeId: number) {
        this.massnahmeId = massnahmeId;
    }

    getMassnahmeId(): number {
        return this.massnahmeId;
    }

    setMassnahmeCode(massnahmeCode: string) {
        this.massnahmeCode = massnahmeCode;
    }

    getMassnahmeCode(): string {
        return this.massnahmeCode;
    }

    setStep2Url(url: any) {
        this.routerOptions[1] = url;
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
        if (clickedStep === 0 && this.shouldDelete()) {
            this.confirmDeleteGF(clickedStep);
        } else {
            this.changeStep(clickedStep);
        }
    }

    changeStep(clickedStep: number) {
        if (clickedStep === 0) {
            this.clearOldValues();
            this.initSteps();
            this.setOnPreviousStep(null);
        }

        if (this.currentStep < clickedStep) {
            if (!this.onNext) {
                this.wizardOnMove(clickedStep);
            } else {
                this.onNextSubscription = this.onNext.subscribe(moveNext => {
                    if (moveNext) {
                        this.wizardOnMove(clickedStep);
                    }
                });
            }
        } else {
            if (!this.onPrevious) {
                this.wizardOnMove(clickedStep);
            } else {
                this.onPreviousSubscription = this.onPrevious.subscribe(movePrevious => {
                    if (movePrevious) {
                        this.wizardOnMove(clickedStep);
                    }
                });
            }
        }
    }

    selectCurrentStep(selectedStep: number) {
        if (selectedStep >= 0 && selectedStep < this.list.length) {
            const stepList = this.list.toArray();
            stepList[this.currentStep].isActive = false;

            for (let step = this.currentStep; step < selectedStep; step++) {
                stepList[step].isValid = true;
            }

            stepList[selectedStep].isValid = false;
            stepList[selectedStep].isActive = true;
            stepList[selectedStep].isDisabled = false;
            stepList[selectedStep].isDirty = true;
            this.currentStep = selectedStep;
            stepList[this.currentStep].stepEnter.emit(this.currentStep);
            this.makeStepInvalid(selectedStep);
            this.navigateStep(selectedStep);
        }
    }

    makeStepsValid(currentStep: number) {
        for (let i = 0; i < currentStep; i++) {
            this.list.toArray()[i].isValid = true;
            this.list.toArray()[i].isDisabled = false;
        }
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

    initSteps() {
        this.currentStep = 0;
        this.list.forEach((element, index) => {
            element.isActive = false;
            element.isDefault = false;
            element.isDirty = false;
            element.isDisabled = true;
            element.isInvalid = false;
            element.isLoading = false;
            element.isValid = false;
            if (index > 1) {
                element.isVisible = false;
            }
        });
        this.list.first.isActive = true;
        this.list.first.isDirty = true;
        this.list.first.isDisabled = false;
        this.list.toArray()[this.currentStep].stepEnter.emit(this.currentStep);
    }

    navigateToAmm() {
        this.router.navigate([`stes/details/${this.getStesId()}/amm/uebersicht`]);
    }

    navigateStep(stepId: number) {
        this.router.navigate([`stes/${this.getStesId()}/massnahme-buchen/${this.routerOptions[stepId]}`.replace(':type', this.getMassnahmeCode())]);
    }

    setOnNextStep(onNext: Observable<boolean>) {
        this.onNext = onNext;
    }

    setOnPreviousStep(onPrev: Observable<boolean>) {
        this.onPrevious = onPrev;
    }

    showStepsThreeAndFour(visible: boolean) {
        this.list.forEach((element, index) => {
            if (index > 1) {
                element.isVisible = visible;
            }
        });
    }

    clearOldValues() {
        this.notFirstEntry = false;
        this.currentStep = undefined;
        this.massnahmeCode = undefined;
        this.gfId = 0;
        this.massnahmeId = 0;
        this.beschreibungFormValues = undefined;
        this.durchfuehrungsortFormValues = undefined;
        this.isDirty.buchung = false;
        this.isDirty.beschreibung = false;
        this.isDirty.durchfuehrungsort = false;
    }

    activateSpinnerAndDisableWizard(channel) {
        this.spinnerService.activate(channel);
        this.deactivateWizard();
    }

    deactivateSpinnerAndEnableWizard(channel, scroll = true) {
        this.spinnerService.deactivate(channel);
        this.activateWizard();
        if (scroll) {
            OrColumnLayoutUtils.scrollTop();
        }
    }

    delete(): Observable<boolean> {
        const gfId = this.gfId;
        const stesId = this.stesId;
        if (gfId && gfId !== AmmConstants.UNDEFINED_LONG_ID) {
            return new Observable(subscriber => {
                this.spinnerService.activate();
                this.ammDataService.geschaeftsfallLoeschen(stesId.toString(), gfId).subscribe(
                    () => {
                        this.clearOldValues();
                        this.spinnerService.deactivate();
                        subscriber.next(true);
                        subscriber.complete();
                    },
                    () => {
                        this.spinnerService.deactivate();
                    }
                );
            });
        } else {
            return of(true);
        }
    }

    shouldDelete(): boolean {
        return this.isDirty.buchung || this.isDirty.beschreibung || this.isDirty.durchfuehrungsort || this.notFirstEntry;
    }

    ngOnDestroy(): void {
        if (this.onNextSubscription) {
            this.onNextSubscription.unsubscribe();
        }

        if (this.onPreviousSubscription) {
            this.onPreviousSubscription.unsubscribe();
        }
    }

    private confirmDeleteGF(clickedStep: number) {
        const modalRef = this.modalService.open(AbbrechenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.componentInstance.setModalAction(new AbbrechenModalActionCallback(modalRef));
        modalRef.result.then(
            () => {
                this.delete().subscribe(() => {
                    this.changeStep(clickedStep);
                });
            },
            () => {
                return;
            }
        );
    }

    private wizardOnMove(clickedStep: number) {
        this.selectCurrentStep(clickedStep);
    }

    private makeStepInvalid(step: number) {
        for (let i = step; i < this.list.length; i++) {
            this.list.toArray()[i].isValid = false;
        }
    }

    private deactivateWizard() {
        if (this.list) {
            this.list.forEach(step => {
                step.isLoading = true;
            });
        }
    }

    private activateWizard() {
        if (this.list) {
            this.list.forEach(step => {
                step.isLoading = false;
            });
        }
    }
}
