import { Component, ViewChild } from '@angular/core';
import { KontaktPersonErfassenComponent } from '@shared/components/unternehmen/kontaktpflege/kontaktpersonen/kontakt-person-erfassen/kontakt-person-erfassen.component';

@Component({
    selector: 'avam-kontakt-person-erfassen-page',
    templateUrl: './kontakt-person-erfassen-page.component.html',
    styleUrls: []
})
export class KontaktPersonErfassenPageComponent {
    @ViewChild('element') element: KontaktPersonErfassenComponent;

    canDeactivate() {
        return this.element.canDeactivate();
    }
}
