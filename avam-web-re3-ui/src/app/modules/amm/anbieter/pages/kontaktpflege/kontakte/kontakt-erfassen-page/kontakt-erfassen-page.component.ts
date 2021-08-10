import { Component, ViewChild } from '@angular/core';
import { KontaktErfassenComponent } from '@shared/components/unternehmen/kontaktpflege/kontakte/kontakt-erfassen/kontakt-erfassen.component';

@Component({
    selector: 'avam-kontakt-erfassen-page',
    templateUrl: './kontakt-erfassen-page.component.html',
    styleUrls: []
})
export class KontaktErfassenPageComponent {
    @ViewChild('element') element: KontaktErfassenComponent;

    canDeactivate(): boolean {
        return this.element.canDeactivate();
    }
}
