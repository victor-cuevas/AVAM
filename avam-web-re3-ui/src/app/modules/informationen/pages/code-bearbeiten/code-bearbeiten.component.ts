import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-code-bearbeiten',
    templateUrl: './code-bearbeiten.component.html'
})
export class CodeBearbeitenComponent implements OnInit {
    navPath = 'informationen';
    sideMenu = 'codeNavItems';

    constructor(private router: Router) {}

    ngOnInit() {}

    cancel() {
        this.router.navigate([`informationen/verzeichnisse/code/suchen`]);
    }
}
