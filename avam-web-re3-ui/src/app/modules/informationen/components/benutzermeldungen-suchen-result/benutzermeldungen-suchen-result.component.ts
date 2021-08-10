import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BenutzerMeldungViewDTO } from '@dtos/benutzerMeldungViewDTO';

@Component({
    selector: 'avam-benutzermeldungen-suchen-result',
    templateUrl: './benutzermeldungen-suchen-result.component.html'
})
export class BenutzermeldungenSuchenResultComponent {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @Input() stateKey: string;
    @Input('showBadge') showBadge: boolean;
    @Input('resultsData') resultsData: BenutzerMeldungViewDTO[];
    @Output() onOpenBenutzermeldung: EventEmitter<BenutzerMeldungViewDTO> = new EventEmitter();

    constructor() {}

    openBenutzermeldung($event: BenutzerMeldungViewDTO) {
        this.onOpenBenutzermeldung.emit($event);
    }
}
