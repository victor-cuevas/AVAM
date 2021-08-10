import { Component } from '@angular/core';

@Component({
    selector: 'avam-geko-arbeitgeber-search-page',
    templateUrl: './arbeitgeber-search-page.component.html'
})
export class ArbeitgeberSearchPageComponent {
    static readonly CACHE_STATE_KEY = 'geko-arbeitgeber-search-cache';
    readonly key = ArbeitgeberSearchPageComponent.CACHE_STATE_KEY;
}
