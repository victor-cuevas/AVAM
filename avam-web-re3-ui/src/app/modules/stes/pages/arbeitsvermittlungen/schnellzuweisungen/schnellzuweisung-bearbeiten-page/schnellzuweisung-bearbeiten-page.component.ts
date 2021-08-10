import { Component, OnInit, ViewChild } from '@angular/core';
import { SchnellzuweisungenBearbeitenComponent } from '@shared/components/schnellzuweisungen-bearbeiten/schnellzuweisungen-bearbeiten.component';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'avam-schnellzuweisung-bearbeiten-page',
    templateUrl: './schnellzuweisung-bearbeiten-page.component.html',
    styleUrls: []
})
export class SchnellzuweisungBearbeitenPageComponent implements OnInit {
    @ViewChild('element') element: SchnellzuweisungenBearbeitenComponent;

    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit(): void {
        this.activatedRoute.parent.params.subscribe(params => {
            this.element.stesId = params['stesId'];
        });
    }

    canDeactivate() {
        return this.element.canDeactivate();
    }
}
