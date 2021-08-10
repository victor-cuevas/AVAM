import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { BurOertlicheEinheitXDTO } from '@app/shared/models/dtos-generated/burOertlicheEinheitXDTO';
import { UnternehmenPopupDTO } from '@app/shared/models/dtos-generated/unternehmenPopupDTO';

@Component({
    selector: 'avam-unternehmen-suche-result-table',
    templateUrl: './avam-unternehmen-suche-result-table.component.html'
})
export class AvamUnternehmenSucheResultTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() printModal = false;

    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();

    /**
     * Configuration of the result table.
     *
     * @memberof AvamUnternehmenSucheResultTableComponent
     */
    columns = [
        { columnDef: 'name', header: 'stes.label.name', cell: (element: any) => `${element.name}`, sortable: true },
        { columnDef: 'strasse', header: 'common.label.strassenr', cell: (element: any) => `${element.strasse}`, sortable: true },
        { columnDef: 'plzOrt', header: 'stes.label.plzort', cell: (element: any) => `${element.plzOrt}`, sortable: true },
        { columnDef: 'land', header: 'stes.label.land', cell: (element: any) => `${element.land}`, sortable: true },
        { columnDef: 'uidOrganisationId', header: 'unternehmen.label.uidnummer', cell: (element: any) => element, width: '165px', sortable: true },
        { columnDef: 'status', header: 'unternehmen.label.burstatus', cell: (element: any) => `${element.status}`, width: '110px', sortable: true },
        { columnDef: 'sucheAvam', header: 'unternehmen.label.sucheavam', cell: (element: any) => `${element.sucheAvam}`, width: '105px', sortable: true },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '60px' }
    ];
    displayedColumns = [];

    constructor(public activeModal: NgbActiveModal, private translateService: TranslateService, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        if (this.printModal) {
            this.columns = this.columns.filter(c => c.columnDef !== 'action');
        }
        this.displayedColumns = this.columns.map(c => c.columnDef);
    }

    itemSelected(item: BurOertlicheEinheitXDTO | UnternehmenPopupDTO) {
        this.activeModal.close(item);
    }

    getUidTooltip(unternehmen: BurOertlicheEinheitXDTO | UnternehmenPopupDTO): string {
        const betriebsart: string = this.dbTranslateService.translate(unternehmen, 'betriebsart');
        const burNr: string = String((unternehmen as UnternehmenPopupDTO).burNr || (unternehmen as BurOertlicheEinheitXDTO).localId);
        const burText: string = this.translateService.instant('unternehmen.label.burnummer');
        return betriebsart && burNr ? `${betriebsart} / ${burText} ${burNr}` : '';
    }
}
