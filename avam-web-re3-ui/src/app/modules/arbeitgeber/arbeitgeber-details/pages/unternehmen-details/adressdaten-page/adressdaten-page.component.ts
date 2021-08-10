import { Component, ViewChild } from '@angular/core';
import { UnternehmenAdressdatenComponent } from '@shared/components/unternehmen/unternehmen-daten/adressdaten/adressdaten.component';

@Component({
    selector: 'avam-adressdaten-page',
    templateUrl: './adressdaten-page.component.html',
    styles: []
})
export class AdressdatenPageComponent {
    @ViewChild('element') element: UnternehmenAdressdatenComponent;

    canDeactivate() {
        return this.element.canDeactivate();
    }
}
