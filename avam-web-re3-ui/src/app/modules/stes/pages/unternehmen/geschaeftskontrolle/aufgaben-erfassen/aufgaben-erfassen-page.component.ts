import { Component, ViewChild } from '@angular/core';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { AufgabenErfassenComponent } from '@shared/components/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen.component';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';

@Component({
    selector: 'avam-fachberatungsstelle-aufgaben-erfassen-page',
    template: '<avam-geko-aufgaben-erfassen [bereich]="fachberatung" #erfassenComponent></avam-geko-aufgaben-erfassen>'
})
export class AufgabenErfassenPageComponent implements DeactivationGuarded {
    @ViewChild('erfassenComponent') erfassenComponent: AufgabenErfassenComponent;
    readonly fachberatung: GekobereichCodeEnum = GekobereichCodeEnum.GESCHAEFTSBEREICH_FACHBERATUNG;

    canDeactivate(): boolean {
        return this.erfassenComponent.canDeactivate();
    }
}
