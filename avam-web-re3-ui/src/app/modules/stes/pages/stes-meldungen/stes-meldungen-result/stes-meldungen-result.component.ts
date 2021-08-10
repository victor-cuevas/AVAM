import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GekoMeldungService } from '@modules/geko/services/geko-meldung.service';
import { GekoMeldungRestService } from '@core/http/geko-meldung-rest.service';
import { NotificationService } from 'oblique-reactive';
import { AbstractMeldungenResultForm, GeschaeftMeldungRow } from '@shared/classes/abstract-meldungen-result-form';
import { ToolboxService } from '@app/shared';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-stes-meldungen-result',
    templateUrl: './stes-meldungen-result.component.html',
    styleUrls: ['./stes-meldungen-result.component.scss']
})
export class StesMeldungenResultComponent extends AbstractMeldungenResultForm implements OnInit, OnDestroy {
    @Input() stateKey: string;

    constructor(
        private router: Router,
        protected modalService: NgbModal,
        protected gekoMeldungService: GekoMeldungService,
        protected gekoMeldungRestService: GekoMeldungRestService,
        protected readonly notificationService: NotificationService
    ) {
        super(modalService, gekoMeldungService, gekoMeldungRestService, notificationService);
    }

    isNameIncluded(): boolean {
        return false;
    }

    openCallback(row: GeschaeftMeldungRow) {
        ToolboxService.GESPEICHERTEN_LISTE_URL = this.router.url;
        super.openCallback(row);
    }

    loadTableData() {}
}
