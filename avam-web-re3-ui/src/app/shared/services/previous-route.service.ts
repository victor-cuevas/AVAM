import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class PreviousRouteService {
    private previousUrl: string;

    constructor(private router: Router) {
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.previousUrl = event.url;
            }
        });
    }

    public getPreviousUrl() {
        return this.previousUrl;
    }
}
