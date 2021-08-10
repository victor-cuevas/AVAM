import { AbstractAufgabenResult } from '@shared/classes/abstract-aufgaben-result';
import { GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { AufgabenTableComponent, AufgabeTableRow } from '@shared/components/aufgaben-table/aufgaben-table.component';
import { FacadeService } from '@shared/services/facade.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-aufgaben-search-result',
    templateUrl: './aufgaben-search-result.component.html'
})
export class AufgabenSearchResultComponent extends AbstractAufgabenResult implements OnInit {
    static readonly STATE_KEY = 'aufgaben-search-table-state-key';
    @Output() onOpenAufgabe: EventEmitter<any> = new EventEmitter();
    @ViewChild('aufgabenTable') aufgabenTable: AufgabenTableComponent;
    readonly toolboxChannel = 'gekoAufgabenSearchResults';
    readonly toolboxId = 'gekoAufgaben';
    stateKey = AufgabenSearchResultComponent.STATE_KEY;

    constructor(protected gekoAufgabenService: GekoAufgabenService, protected facade: FacadeService, private searchSession: SearchSessionStorageService) {
        super(gekoAufgabenService, facade);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.configureToolbox(ToolboxConfig.getGekoAufgabenSearchConfig(), this.stateKey);
    }

    openAufgabe(row: AufgabeTableRow): void {
        this.onOpenAufgabe.emit(row);
    }

    reset(): void {
        this.resultsData = [];
        this.searchDone = false;
        this.searchSession.restoreDefaultValues(this.stateKey);
    }
}
