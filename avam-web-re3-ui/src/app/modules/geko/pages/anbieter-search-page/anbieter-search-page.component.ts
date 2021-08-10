import { Component } from '@angular/core';

@Component({
    selector: 'avam-geko-anbieter-search-page',
    templateUrl: './anbieter-search-page.component.html'
})
export class AnbieterSearchPageComponent {
    static readonly CACHE_STATE_KEY = 'geko-anbieter-search-cache';
    readonly key = AnbieterSearchPageComponent.CACHE_STATE_KEY;
}
