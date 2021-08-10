import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Component({
    selector: 'avam-land-autosuggest-modal',
    templateUrl: './land-autosuggest-modal.component.html',
    styleUrls: ['./land-autosuggest-modal.component.scss']
})
export class LandAutosuggestModalComponent implements OnInit {
    @Input() countriesList: CodeDTO[] = [];
    @Output() emitZielstaat = new EventEmitter();
    tableData: { codeId: number; text: string }[];
    columns = [
        { columnDef: 'text', header: 'stes.label.zielstaat', cell: (element: any) => `${element.text}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    dataSource = [];
    sortField = 'text';

    constructor(private readonly modalService: NgbModal, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.setTableData();
    }

    setTableData() {
        this.dataSource = this.countriesList.map((country, index) => {
            return {
                id: index,
                codeId: country.codeId,
                text: this.dbTranslateService.translate(country, 'kurzText')
            };
        });
    }

    itemSelected(selectedRow: { codeId: number; text: string }) {
        const selectedCountry = this.countriesList.find(country => country.codeId === selectedRow.codeId);

        this.emitZielstaat.emit(selectedCountry);
        this.close();
    }

    close() {
        this.modalService.dismissAll();
    }
}
