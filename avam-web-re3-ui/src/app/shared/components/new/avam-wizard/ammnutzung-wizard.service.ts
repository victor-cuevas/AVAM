import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { SpinnerService } from 'oblique-reactive';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';

@Injectable()
export class AmmnutzungWizardService implements OnDestroy {
    notFirstEntry = false;
    beschreibungFirstEntry = false;
    lastAnbieterId: any;
    kontaktpersonId: number;
    list: any;
    isDirty = {
        buchung: false,
        beschreibung: false,
        durchfuehrungsort: false
    };
    currentStep: number;
    beschreibungFormValues: any;
    durchfuehrungsortFormValues: any;
    buchungToSave: AmmBuchungParamDTO;
    type: string;
    stesId: string;
    gfId;
    onNext: Observable<boolean>;
    onPrevious: Observable<boolean>;
    onNextSubsctription: Subscription;
    onPreviousSubsctription: Subscription;
    stepLabels = ['amm.massnahmen.subnavmenuitem.grunddatenbuchung', 'amm.massnahmen.subnavmenuitem.beschreibung', 'amm.massnahmen.subnavmenuitem.durchfuehrungsort'];
    ammMassnahmenToLabel = [
        { code: AmmMassnahmenCode.INDIVIDUELL_AP, label: 'amm.nutzung.title.АPIndividuell' },
        { code: AmmMassnahmenCode.INDIVIDUELL_BP, label: 'amm.nutzung.title.BPIndividuell' },
        { code: AmmMassnahmenCode.INDIVIDUELL_KURS, label: 'amm.nutzung.title.kursIndividuell' }
    ];
    private routerOptions = ['buchung', 'beschreibung', 'durchsfuhrungsort'];

    constructor(private router: Router, private translate: TranslateService, private spinnerService: SpinnerService, private fehlermeldungenService: FehlermeldungenService) {}

    setOnNextStep(onNext: Observable<boolean>) {
        this.onNext = onNext;
    }

    setOnPreviousStep(onPrevious: Observable<boolean>) {
        this.onPrevious = onPrevious;
    }

    getBuchung() {
        return this.buchungToSave;
    }

    setBuchung(buchung: AmmBuchungParamDTO) {
        this.buchungToSave = buchung;
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

    clearOldValues() {
        this.notFirstEntry = false;
        this.beschreibungFirstEntry = false;
        this.currentStep = undefined;
        this.beschreibungFormValues = undefined;
        this.durchfuehrungsortFormValues = undefined;
        this.buchungToSave = undefined;
        this.type = undefined;
        this.stesId = undefined;
        this.gfId = undefined;
        this.lastAnbieterId = undefined;
    }

    deactivateWizard() {
        if (this.list) {
            this.list.forEach(step => {
                step.isLoading = true;
            });
        }
    }

    activateWizard() {
        if (this.list) {
            this.list.forEach(step => {
                step.isLoading = false;
            });
        }
    }

    activateSpinnerAndDisableWizard(channel) {
        this.spinnerService.activate(channel);
        this.deactivateWizard();
    }

    deactivateSpinnerAndEnableWizard(channel) {
        this.spinnerService.deactivate(channel);
        this.activateWizard();
        OrColumnLayoutUtils.scrollTop();
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

    navigateZurAmmUebersicht() {
        this.fehlermeldungenService.closeMessage();
        this.router.navigate([`stes/details/${this.stesId}/amm/uebersicht`]);
    }

    navigateStep(stepId) {
        this.router.navigate([`stes/${this.stesId}/ammnutzung/${this.type}/${this.routerOptions[stepId]}/${this.gfId}`]);
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
