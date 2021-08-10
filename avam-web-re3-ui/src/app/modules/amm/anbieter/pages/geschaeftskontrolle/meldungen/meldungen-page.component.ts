import { Component } from '@angular/core';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';

@Component({
    selector: 'avam-meldungen-page',
    templateUrl: './meldungen-page.component.html'
})
export class MeldungenPageComponent {
    geschaeftsbereichCode: typeof GekobereichCodeEnum = GekobereichCodeEnum;
}
