import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { GenericConfirmComponent } from '@app/shared';
import { KostenverteilschluesselCode } from '@app/shared/enums/domain-code/kostenverteilschluessel-code.enum';
import { AufteilungBudgetjahrDTO } from '@app/shared/models/dtos-generated/aufteilungBudgetjahrDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ControllingwerteHandlerService, CtrlTableRowTypes, CtrlwerteTableData, CtrlwerteTableDataRow } from './controllingwerte-handler.service';
import { ControllingwerteReactiveFormsService } from './controllingwerte-reactive-forms.service';

@Component({
    selector: 'avam-controllingwerte-table',
    templateUrl: './controllingwerte-table.component.html',
    styleUrls: ['./controllingwerte-table.component.scss'],
    providers: [ControllingwerteHandlerService, ControllingwerteReactiveFormsService]
})
export class ControllingwerteTableComponent implements OnInit, OnChanges {
    @Input() tableData: CtrlwerteTableData;
    @Input() forPrint = false;
    @Output() onDeleteRow: EventEmitter<CtrlwerteTableDataRow> = new EventEmitter<CtrlwerteTableDataRow>();
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    formArray: FormArray;
    kantonOptions;
    institutionOptions;
    kostenverteilschluesselOptions;
    columns = [
        { columnDef: 'jahrOrGeldgeber', header: 'amm.ctrlwerte.label.budgetjahrgeldgeber', cell: (element: any) => element.jahrOrGeldgeber },
        { columnDef: 'kanton', header: '', cell: (element: any) => element.kanton },
        { columnDef: 'chf', header: 'common.label.chf', cell: (element: any) => element.chf },
        { columnDef: 'tnTage', header: 'common.label.tntage', cell: (element: any) => element.tnTage },
        { columnDef: 'teilnehmer', header: 'common.label.tn', cell: (element: any) => element.teilnehmer },
        { columnDef: 'prozent', header: 'common.label.prozentzeichen', cell: (element: any) => element.prozent },
        { columnDef: 'action', header: '', width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    dataSource: CtrlwerteTableDataRow[];
    rowTypes = CtrlTableRowTypes;
    manuellId: number;
    prozentualId: number;
    tableModified = false;

    constructor(
        private handler: ControllingwerteHandlerService,
        private modalService: NgbModal,
        private facade: FacadeService,
        private obliqueHelperService: ObliqueHelperService
    ) {
        this.formGroup = handler.reactiveForms.controllwertForm;
        this.formArray = this.formGroup.controls.rows as FormArray;
    }

    public ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;

        if (this.forPrint) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }
    }

    public mapData(data: CtrlwerteTableData) {
        this.kantonOptions = this.handler.mapKantonDropdown(data.kantone);
        this.institutionOptions = this.facade.formUtilsService.mapDropdownKurztext(data.institution);
        this.kostenverteilschluesselOptions = this.facade.formUtilsService.mapDropdownKurztext(data.kostenverteilschluessel);
        this.prozentualId = data.kostenverteilschluessel.find(item => item.code === KostenverteilschluesselCode.PROZENTUAL).codeId;
        this.manuellId = data.kostenverteilschluessel.find(item => item.code === KostenverteilschluesselCode.MANUELL).codeId;
        this.dataSource = data.ctrlwerte;
        while (this.formArray.length !== 0) {
            this.formArray.removeAt(0);
        }

        if (data.panelFormData) {
            this.formGroup.patchValue(this.handler.mapToForm(data.panelFormData));
        }

        this.dataSource.forEach((el, index) => {
            this.formArray.push(this.handler.reactiveForms.createNewRow(el, this.tableData.supportNegativeChf));
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.tableData.currentValue) {
            this.mapData(changes.tableData.currentValue);
        }
    }

    public deleteRow(row, i) {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                if (row.newEntry) {
                    this.formArray.removeAt(this.formArray.value.findIndex(el => el.tableId === row.tableId));
                    this.dataSource = this.dataSource.filter(el => el.tableId !== row.tableId);
                }

                this.onDeleteRow.emit(row);
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    public onAddRow() {
        const insertIndex = this.findinsertIndex();
        const el = this.handler.getRowDefaultValues(this.institutionOptions);
        this.formArray.insert(insertIndex, this.handler.reactiveForms.createNewRow(el, this.tableData.supportNegativeChf));
        this.dataSource.splice(insertIndex, 0, el);
        this.dataSource = [...this.dataSource];
        this.formGroup.updateValueAndValidity();
        this.tableModified = true;
    }

    public customTrackByFunction(index: number, item: any) {
        return item.tableId;
    }

    public createTableData(data: AufteilungBudgetjahrDTO, institutions: CodeDTO[]): CtrlwerteTableDataRow[] {
        return this.handler.createTableData(data, institutions);
    }

    public getKostenverteilschluesselCode(): string {
        return this.handler.getKostenverteilschluesselCode(this.formGroup.controls.kostenverteilschluessel.value, this.tableData.kostenverteilschluessel);
    }

    public mergeDataForBE(beTableData: AufteilungBudgetjahrDTO): AufteilungBudgetjahrDTO {
        return this.handler.mergeDataForBE(beTableData, this.formArray, this.tableData.institution);
    }

    private findinsertIndex(): number {
        let index = this.dataSource.length;
        for (let i = 0; i < this.dataSource.length; ++i) {
            if (this.dataSource[i].editable) {
                index = i;
                break;
            }
        }
        return index;
    }
}
