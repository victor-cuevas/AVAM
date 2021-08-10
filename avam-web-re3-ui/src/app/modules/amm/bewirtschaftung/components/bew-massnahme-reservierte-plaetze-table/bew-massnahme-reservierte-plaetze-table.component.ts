import { Component, ViewChild, OnChanges, OnInit, SimpleChanges, Output, EventEmitter, Input } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { BewMassnahmeReserviertePlaetzeTableReactiveFormsService } from './bew-massnahme-reservierte-plaetze-reactive-table-forms.service';
import { BewMassnahmeReserviertePlaetzeHandlerService, PlnwerteTableData, PlnwerteTableDataRow } from './bew-massnahme-reservierte-plaetze-handler.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FacadeService } from '@app/shared/services/facade.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { GenericConfirmComponent } from '@app/shared/components/generic-confirm/generic-confirm.component';

export enum COLUMN {
    institution = 'institution',
    kanton = 'kanton',
    verfall = 'verfall',
    teilnehmer = 'teilnehmer',
    status = 'status'
}
@Component({
    selector: 'avam-bew-massnahme-reservierte-plaetze-table',
    templateUrl: './bew-massnahme-reservierte-plaetze-table.component.html',
    providers: [BewMassnahmeReserviertePlaetzeTableReactiveFormsService, BewMassnahmeReserviertePlaetzeHandlerService]
})
export class BewMassnahmeReserviertePlaetzeTableComponent implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    @Input() tableData: PlnwerteTableData;
    @Output() onDeleteRow: EventEmitter<PlnwerteTableDataRow> = new EventEmitter<PlnwerteTableDataRow>();

    formGroup: FormGroup;
    formArray: FormArray;
    institutionOptions;
    kantonOptions;
    isNewLineAdded = false;

    columns = [
        { columnDef: 'institution', header: 'common.label.institution', cell: (element: any) => element.institution },
        { columnDef: 'kanton', header: 'common.label.kanton', cell: (element: any) => element.kanton },
        { columnDef: 'verfall', header: 'amm.massnahmen.label.verfallxtagevorbeginn', cell: (element: any) => element.verfall },
        { columnDef: 'teilnehmer', header: 'amm.massnahmen.label.anzahlteilnehmer', cell: (element: any) => element.teilnehmer },
        { columnDef: 'status', header: 'common.label.status', cell: (element: any) => element.status },
        { columnDef: 'action', header: '', width: '100px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);

    dataSource: PlnwerteTableDataRow[];

    constructor(
        public handler: BewMassnahmeReserviertePlaetzeHandlerService,
        private modalService: NgbModal,
        private facade: FacadeService,
        private obliqueHelperService: ObliqueHelperService
    ) {
        this.formGroup = handler.reactiveForms.form;
        this.formArray = this.formGroup.controls.rows as FormArray;
    }

    public ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.tableData.currentValue) {
            this.mapData(changes.tableData.currentValue);
        }
    }

    public mapData(data: PlnwerteTableData) {
        this.kantonOptions = this.handler.mapKantonDropdown(data.kantoneOptions);
        this.institutionOptions = this.facade.formUtilsService.mapDropdownKurztext(data.institutionOptions);
        this.dataSource = data.plnwerte;
        while (this.formArray.length !== 0) {
            this.formArray.removeAt(0);
        }

        this.dataSource.forEach((el, index) => {
            this.formArray.push(this.handler.reactiveForms.createNewRow(el));
        });
    }

    public customTrackByFunction(index: number, item: any) {
        return item.tableId;
    }

    public deleteRow(row, i) {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.formArray.removeAt(this.formArray.value.findIndex(el => el.tableId === row.tableId));
                this.dataSource = this.dataSource.filter(el => el.tableId !== row.tableId);
                this.formArray.markAsDirty();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    public onAddRow(index?) {
        const el = this.handler.getRowDefaultValues();
        this.formArray.insert(index + 1, this.handler.reactiveForms.createNewRow(el));
        this.dataSource.splice(index + 1, 0, el);
        this.dataSource = [...this.dataSource];
        this.formArray.markAsTouched();
        this.isNewLineAdded = true;
    }
}
