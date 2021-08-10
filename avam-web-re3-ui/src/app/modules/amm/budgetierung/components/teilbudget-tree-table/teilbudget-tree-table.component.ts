import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { FormGroup, FormBuilder, FormGroupDirective } from '@angular/forms';
import { NodeData } from '../../models/budget-tree-models';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { AmmStrukturAggregatDTO } from '@app/shared/models/dtos-generated/ammStrukturAggregatDTO';
import { BudgetwertDTO } from '@app/shared/models/dtos-generated/budgetwertDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-teilbudget-tree-table',
    templateUrl: './teilbudget-tree-table.component.html',
    styleUrls: ['./teilbudget-tree-table.component.scss']
})
export class TeilbudgetTreeTableComponent implements OnInit, OnChanges {
    @Input() dataSource: TreeNodeInterface[];
    @Input() readonly: boolean;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    data: TreeNodeInterface[];
    options = { initialExpansionLevel: 999 };
    formGroup: FormGroup;
    columns = [
        { columnDef: 'elementName', header: 'common.label.massnahmeart', cell: (element: any) => `${element.elementName}` },
        { columnDef: 'chf', header: 'amm.zahlungen.label.chf', cell: (element: any) => `${element.chf}` },
        { columnDef: 'saldoChf', header: 'common.label.saldochf', cell: (element: any) => `${element.saldoChf}` },
        { columnDef: 'tnTage', header: 'common.label.tntage', cell: (element: any) => `${element.tnTage}` },
        { columnDef: 'saldoTnTage', header: 'common.label.saldotntage', cell: (element: any) => `${element.saldoTnTage}` },
        { columnDef: 'tn', header: 'common.label.tn', cell: (element: any) => `${element.tn}` },
        { columnDef: 'saldoTn', header: 'common.label.saldotn', cell: (element: any) => `${element.saldoTn}` },
        { columnDef: 'tagesPreis', header: 'common.label.chftag', cell: (element: any) => `${element.tagesPreis}` },
        { columnDef: 'tnPreis', header: 'common.label.chftn', cell: (element: any) => `${element.tnPreis}` }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor(private formBuilder: FormBuilder, private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.formGroup = this.formBuilder.group({});
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dataSource.currentValue) {
            if (!this.readonly) {
                this.buildFormArray(this.dataSource[0]);
            }
            this.data = this.dataSource;
        }
    }

    mapToDTO(struktur: AmmStrukturAggregatDTO): AmmStrukturAggregatDTO {
        for (const group of Object.keys(this.formGroup.controls)) {
            const fg = this.formGroup.get(group) as FormGroup;
            if (fg.controls.chf.value !== '0' || fg.controls.tnTage.value !== '0' || fg.controls.tn.value !== '0') {
                struktur.additionalData = { ...struktur.additionalData, [fg.controls.id.value]: this.mapBudgetwert(fg) };
            }
        }

        return struktur;
    }

    private buildFormArray(strukturelement: TreeNodeInterface) {
        //push and map controls
        this.formGroup.addControl(strukturelement.id, this.getRowFormGroup(strukturelement.data));
        strukturelement.children.forEach(element => {
            this.buildFormArray(element);
        });
    }

    private getRowFormGroup(data: NodeData) {
        return this.formBuilder.group({
            id: data.strukturelementId,
            chf: [data.chf, NumberValidator.isPositiveInteger],
            tnTage: [data.tnTage, NumberValidator.isPositiveInteger],
            tn: [data.tn, NumberValidator.isPositiveInteger]
        });
    }

    private mapBudgetwert(formGroup: FormGroup): BudgetwertDTO[] {
        return [{ chf: formGroup.value.chf, tnTage: formGroup.value.tnTage, tn: formGroup.value.tn }];
    }
}
