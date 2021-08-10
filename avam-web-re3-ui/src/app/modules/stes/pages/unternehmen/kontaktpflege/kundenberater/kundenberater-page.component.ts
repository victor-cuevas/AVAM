import { Component, ViewChild } from '@angular/core';
import { KundenberaterComponent } from '@shared/components/unternehmen/kontaktpflege/kundenberater/kundenberater.component';

@Component({
    selector: 'avam-kundenberater-page',
    template: '<avam-kundenberater #element></avam-kundenberater>',
    styleUrls: []
})
export class KundenberaterPageComponent {
    @ViewChild('element') element: KundenberaterComponent;

    canDeactivate() {
        return this.element.canDeactivate();
    }
}
