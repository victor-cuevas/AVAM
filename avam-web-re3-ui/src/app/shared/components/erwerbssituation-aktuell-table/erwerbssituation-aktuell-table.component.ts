import { FormUtilsService } from './../../services/forms/form-utils.service';
import { Component, OnInit, Input, Renderer2, Output, EventEmitter, ViewChild } from '@angular/core';
import { TableHeaderObject } from '../table/table.header.object';
import { FormGroup, FormControl, FormArray, Validators, FormGroupDirective } from '@angular/forms';
import { DateValidator } from '../../validators/date-validator';

/**
 * even the table is only used once - its placed  in shared
 * (clean-up of FormUtilsService import leads to 'circular dependency')
 */
@Component({
    selector: 'app-erwerbssituation-aktuell-table',
    templateUrl: './erwerbssituation-aktuell-table.component.html',
    styleUrls: ['./erwerbssituation-aktuell-table.component.scss']
})
export class ErwerbssituationAktuellTableComponent implements OnInit {
    @Input() id: string;
    @Input() tableHeaders: TableHeaderObject[];
    @Input() dropdownOptions: any[];
    @Output() emitter = new EventEmitter();
    @Output() editEmitter = new EventEmitter();
    @Input() aktuellForm: any;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    isFieldEditable: boolean[] = [];

    constructor(private renderer: Renderer2, private formUtils: FormUtilsService) {}

    ngOnInit() {
        this.getControls().forEach(() => {
            this.isFieldEditable.push(false);
        });
    }

    emitEditRowStoring() {
        this.ngForm.onSubmit(undefined);

        if (this.aktuellForm.get('header').valid) {
            const selectedItem = this.dropdownOptions.find(option => option.codeId.toString() === this.aktuellForm.get('header').value.dropdownAktuell);
            const formGroup = new FormGroup({
                dropdownAktuell: new FormControl(selectedItem.codeId, [Validators.required]),
                gueltigAb: new FormControl(this.aktuellForm.get('header').value.gueltigAb, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx])
            });
            this.getControls().push(formGroup);
            this.isFieldEditable.push(false);
            this.emitter.emit({ dropdownOptionSelected: selectedItem, gueltigAb: this.aktuellForm.get('header').value.gueltigAb });
            this.clearEditRow();
        }
    }

    clearEditRow() {
        this.ngForm.resetForm();
        this.aktuellForm.get('header').reset();
        this.isFieldEditable = [];
    }

    resetEditedRow(index: number) {
        this.editEmitter.emit({ id: index, resetRow: true });
    }

    toggleButtonVisibility(event: any) {
        const btns = event.target.querySelectorAll('.buttonOnHover');

        if (btns) {
            for (const btn of btns) {
                if (btn) {
                    if (event.type === 'mouseenter') {
                        this.renderer.removeClass(btn, 'd-none');
                    } else if (event.type === 'mouseleave') {
                        this.renderer.addClass(btn, 'd-none');
                    }
                }
            }
        }
    }

    getControl(index: number) {
        return this.aktuellForm.get('items').controls[index];
    }

    getControls() {
        return (this.aktuellForm.get('items') as FormArray).controls;
    }

    getDate(value) {
        if (value instanceof Date) {
            return this.formUtils.formatDateNgx(value, 'DD.MM.YYYY');
        }

        return value;
    }

    getDropDownOption(value) {
        const selectedItem = this.dropdownOptions.find(option => option.codeId.toString() === value.toString());
        return selectedItem;
    }

    onRemoveRow(index: number) {
        this.isFieldEditable.splice(index, 1);
        this.editEmitter.emit({ id: index });
    }

    onEdit(index: number) {
        if (!this.isFieldEditable.some(field => field)) {
            this.aktuellForm.controls.items.markAsDirty();
            this.isFieldEditable[index] = true;
        }
    }

    onSaveEdit(index: number) {
        if (this.getControl(index).valid) {
            const editedControl = this.getControl(index);
            const selectedItem = this.dropdownOptions.find(option => option.codeId.toString() === editedControl.value.dropdownAktuell.toString());
            this.editEmitter.emit({ dropdownOptionSelected: selectedItem, gueltigAb: editedControl.value.gueltigAb, id: index });
            this.isFieldEditable[index] = false;
        }
    }
}
