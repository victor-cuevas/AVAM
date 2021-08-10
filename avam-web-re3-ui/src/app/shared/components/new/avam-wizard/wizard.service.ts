import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { HttpFormStateEnum } from './httpFormStateEnum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbbrechenModalComponent } from '../../abbrechen-modal/abbrechen-modal.component';
import { StesComponentInteractionService } from '@app/shared/services/stes-component-interaction.service';
import { AbbrechenModalActionWizard } from '@app/shared/classes/abbrechen-modal-action-wizard';
import { Location, PopStateEvent } from '@angular/common';
import { filter } from 'rxjs/operators';
import { StepService } from '@shared/components/wizard/step-service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';

@Injectable({
    providedIn: 'root'
})
export class WizardService {
    list: any = [];
    currentStep: number;
    isDirty = false;
    formHttpState: Subject<any> = new Subject();
    stepCounter: number;
    burfsdatenSubject = new Subject<boolean>();
    reloadSubject = new Subject<boolean>();
    changeStepSubject = new Subject<number>();
    stesId: any;
    private popState = false;
    private urlHistory: string[] = [];
    private stepMap: Map<number, { state?: any; hasNoCache?: boolean }> = new Map();
    private berufErfassenStep = false;

    constructor(
        private router: Router,
        private modalService: NgbModal,
        private interactionService: StesComponentInteractionService,
        private locationService: Location,
        private fehlermeldungService: FehlermeldungenService
    ) {
        this.listenBackwardNavigation();
    }

    setFormIsDirty(isDirty: boolean) {
        this.isDirty = isDirty;
    }

    isFormDirty() {
        return this.isDirty;
    }

    setIsBerufErfassenStep(isBerufErfassenStep: boolean) {
        this.berufErfassenStep = isBerufErfassenStep;
    }

    isBerufErfassenStep(): boolean {
        return this.berufErfassenStep;
    }

    moveNext(state?, hasNoCache?: boolean) {
        this.updateStepInfo(hasNoCache, state);
        const nextStep = this.currentStep + 1;
        if (nextStep !== this.list.toArray().length) {
            if (this.list.toArray()[nextStep].skipStep) {
                this.skipStep(nextStep);
                this.movePosition(nextStep + 1, false, state, hasNoCache);
                this.list.toArray()[nextStep].stepEnter.emit(nextStep);
            } else {
                this.movePosition(nextStep, false, state, hasNoCache);
                this.list.toArray()[nextStep].stepEnter.emit(nextStep);
            }
        }
    }

    movePrev(hasNoCache?: boolean) {
        this.updateStepInfo(hasNoCache);
        const prevStep = this.currentStep - 1;

        if (prevStep !== -1) {
            if (this.list.toArray()[prevStep].skipStep) {
                return;
            }

            if (!this.list.toArray()[prevStep].isDisabled) {
                this.movePosition(prevStep, null, null, hasNoCache);
            }
        }
    }

    movePrevStammD() {
        this.updateStepInfo(null);
        if (this.isDirty) {
            this.openModal(this.currentStep - 1);
        } else {
            window.history.back();
        }
    }

    movePosition(clickedStep, click?: boolean, state?, hasNoCache?: boolean) {
        const isBackward = this.currentStep > clickedStep;
        const isFormDirty = this.isDirty ? this.isDirty : null;
        const prevStep = clickedStep - 1;

        if (isFormDirty && isBackward) {
            this.openModal(clickedStep);
        } else {
            if (clickedStep - this.currentStep > 1 && !this.list.toArray()[prevStep].skipStep) {
                this.stepCounter = clickedStep - this.currentStep;

                const httpState = this.formHttpState.subscribe(res => {
                    if (res === HttpFormStateEnum.GET_SUCCESS) {
                        this.stepCounter = this.stepCounter - 1;
                        if (this.stepCounter === 0) {
                            httpState.unsubscribe();
                        }
                    } else if (
                        res === HttpFormStateEnum.SAVE_FAIL ||
                        res === HttpFormStateEnum.SAVE_NO_RESPONCE ||
                        res === HttpFormStateEnum.GET_FAIL ||
                        res === HttpFormStateEnum.GET_NO_RESPONCE
                    ) {
                        return;
                    }
                });
                return;
            } else {
                this.changeStep(clickedStep);
                this.navigate(state, clickedStep, hasNoCache);
                this.currentStep = clickedStep;
            }
        }
    }

    navigate(state, clickedStep, hasNoCache?: boolean) {
        if (hasNoCache) {
            this.locationService.replaceState(this.list.toArray()[0].navigate);
        }

        // stesId reset in the pre-stes anmelden steps (to avoid page-not-found)
        if (clickedStep <= 1) {
            this.stesId = null;
        }

        if (state) {
            this.router.navigateByUrl(this.list.toArray()[clickedStep].navigate, state);
        } else if (this.stesId) {
            this.router.navigateByUrl(`${this.list.toArray()[clickedStep].navigate}/${this.stesId}`);
        } else {
            this.router.navigateByUrl(this.list.toArray()[clickedStep].navigate);
        }
    }

    skipStep(stepId) {
        this.list.toArray()[stepId].isActive = true;
        this.list.toArray()[stepId].isDisabled = false;
    }

    deactiveSteps() {
        this.list.forEach(step => {
            if (!step.skipStep) {
                step.isActive = false;
            }
        });
    }

    deactiveWizard() {
        this.list.forEach(step => {
            step.isLoading = true;
        });
    }

    activeWizard() {
        this.list.forEach(step => {
            step.isLoading = false;
        });
    }

    changeStep(stepId) {
        this.deactiveSteps();
        this.list.toArray()[stepId].isActive = true;
        this.list.toArray()[stepId].isDisabled = false;
        this.list.toArray()[stepId].isDirty = true;
        this.changeStepSubject.next(stepId);
    }

    validateStep(isValid) {
        let prevStep = this.currentStep - 1;
        if (this.list.toArray()[prevStep].skipStep) {
            prevStep = this.currentStep;
        }
        if (isValid) {
            this.list.toArray()[prevStep].isValid = true;
        } else {
            this.list.toArray()[prevStep].isInvalid = true;
        }
    }

    openModal(clickedStep) {
        const modalRef = this.modalService.open(AbbrechenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.componentInstance.setModalAction(new AbbrechenModalActionWizard(this.interactionService, this.modalService));
        modalRef.result.then(
            result => {
                this.interactionService.navigateAwayStep.next(false);
            },
            reason => {
                return;
            }
        );

        const navigateAway = this.interactionService.navigateAwayStep.subscribe(res => {
            if (res) {
                this.changeStep(clickedStep);
                this.locationService.replaceState(this.list.toArray()[0].navigate);

                if (this.currentStep > 2) {
                    this.router.navigateByUrl(`${this.list.toArray()[clickedStep].navigate}/${this.stesId}`);
                } else if (this.currentStep === 1) {
                    window.history.back();
                } else {
                    this.router.navigateByUrl(this.list.toArray()[clickedStep].navigate);
                }

                this.currentStep = clickedStep;
            }
            navigateAway.unsubscribe();
        });
    }

    showBerufsdaten(show: boolean) {
        this.burfsdatenSubject.next(show);
    }

    observeBerufsdaten(): Observable<boolean> {
        return this.burfsdatenSubject.asObservable();
    }

    initSteps() {
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
        this.currentStep = 0;
        this.stepMap.clear();
        this.changeStepSubject.next(0);
        this.fehlermeldungService.closeMessage();
    }

    private listenBackwardNavigation(): void {
        this.locationService.subscribe((event: PopStateEvent) => {
            this.popState = true;
            if (this.urlHistory.lastIndexOf(event.url)) {
                this.urlHistory.push(event.url);
                if (this.currentStep > 1) {
                    const step = this.currentStep - 1;
                    if (this.stepMap.has(step)) {
                        this.movePrev(this.stepMap.get(step).hasNoCache);
                    } else {
                        this.movePrev();
                    }
                }
            }
        });
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
            if (!this.popState) {
                this.urlHistory = [this.router.url];
            }
            this.popState = false;
        });
    }

    private updateStepInfo(hasNoCacheParam: boolean, stateParam?: any): void {
        if (this.stepMap.has(this.currentStep)) {
            const o = this.stepMap.get(this.currentStep);
            if (stateParam) {
                o.state = stateParam;
            }
            if (hasNoCacheParam) {
                o.hasNoCache = hasNoCacheParam;
            }
            this.stepMap.delete(this.currentStep);
            this.stepMap.set(this.currentStep, o);
        } else {
            this.stepMap.set(this.currentStep, { state: stateParam, hasNoCache: hasNoCacheParam });
        }
    }
}
