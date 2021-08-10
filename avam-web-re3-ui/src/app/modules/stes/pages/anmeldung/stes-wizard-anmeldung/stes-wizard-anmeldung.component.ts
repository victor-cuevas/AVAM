import { Component, OnInit } from '@angular/core';
import { StepService } from 'src/app/shared/components/wizard/step-service';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';

@Component({
    selector: 'app-stes-wizard-anmeldung',
    templateUrl: './stes-wizard-anmeldung.component.html',
    styleUrls: ['./stes-wizard-anmeldung.component.scss']
})
export class StesWizardAnmeldungComponent extends Unsubscribable implements OnInit {
    showBerufsdaten: boolean;

    constructor(private stepService: StepService, private wizardService: WizardService) {
        super();
        this.wizardService
            .observeBerufsdaten()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(show => {
                this.showBerufsdaten = show;
            });
    }

    ngOnInit() {
        this.stepService.stepInfoList.push(this.stepService.createStepInfo('1', [], ['1']));
        this.stepService.stepInfoList.push(this.stepService.createStepInfo('2', [], ['2']));
        this.stepService.stepInfoList.push(this.stepService.createStepInfo('3', [], ['3']));
        this.stepService.stepInfoList.push(this.stepService.createStepInfo('4', ['3'], ['4']));
        this.stepService.stepInfoList.push(this.stepService.createStepInfo('5', ['3'], ['5']));
        this.stepService.stepInfoList.push(this.stepService.createStepInfo('6', ['3'], ['6']));
        this.stepService.stepInfoList.push(this.stepService.createStepInfo('7', ['3'], ['7']));
        this.stepService.stepInfoList.push(this.stepService.createStepInfo('8', ['3'], ['8']));
    }

    hideBerufErfassen(): boolean {
        return this.stepService.currentStepId !== '6';
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
