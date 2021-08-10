import { Component } from '@angular/core';
import { KontaktpersonSearchUnternehmenPlaceholderEnum } from '@shared/components/unternehmen/kontaktperson-search/kontaktperson-search-unternehmen-placeholder.enum';

@Component({
    selector: 'avam-kontaktperson-suchen-page',
    templateUrl: './kontaktperson-suchen-page.component.html',
    styles: []
})
export class KontaktpersonSuchenPageComponent {
    readonly unternehmenPlaceholder = KontaktpersonSearchUnternehmenPlaceholderEnum.ANBIETER;
}
