import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ArbeitsstelleSweDTO } from '@dtos/arbeitsstelleSweDTO';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FocusHelper } from '@modules/arbeitgeber/shared/utils/focus-helper';
import { NumberValidator } from '@shared/validators/number-validator';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { FacadeService } from '@shared/services/facade.service';
import { TableHelper } from '@shared/helpers/table.helper';
import { DateValidator } from '@shared/validators/date-validator';

@Component({
    selector: 'avam-swe-meldung-arbeitsstellen-table',
    templateUrl: './swe-meldung-arbeitsstellen-table.component.html',
    styleUrls: ['./swe-meldung-arbeitsstellen-table.component.scss']
})
export class SweMeldungArbeitsstellenTableComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() forPrinting = false;

    @Input() entscheidSweOptions: DropdownOption[] = [];
    @Input() readOnly = false;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    @Input()
    set arbeitsstellen(values: ArbeitsstelleSweDTO[]) {
        if (!values) {
            return;
        }

        this.createFormArrayIfDoesntExist();
        this.arbeitstellenDtos = values;
        this.updateFormArray();
    }

    get arbeitsstellen(): ArbeitsstelleSweDTO[] {
        return this.arbeitstellenDtos;
    }

    @Input()
    set required(value: boolean) {
        this._required = value;
        this.updateFormArray();
    }

    get required(): boolean {
        return this._required;
    }

    private _required: boolean;

    formArray: FormArray;
    columns = [
        { columnDef: 'anmeldeDatum', header: 'kaeswe.label.meldedatum', sortable: true },
        { columnDef: 'arbeitsstelle', header: 'kaeswe.label.arbeitsstelle', sortable: true },
        { columnDef: 'anzahlBetroffene', header: 'kaeswe.label.anzahlbetroffene', sortable: true },
        { columnDef: 'entscheidSweId', header: 'kaeswe.label.entscheidswe', sortable: true },
        { columnDef: 'actions', header: '', width: '60px' }
    ];
    headers = this.columns.map(c => c.columnDef);

    private static readonly FORM_NAME = 'arbeitsstellen';
    private static readonly FIRST_INPUT_ID = 'anmeldeDatum0';

    private arbeitstellenDtos: ArbeitsstelleSweDTO[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private facadeService: FacadeService,
        private changeDetectorRef: ChangeDetectorRef,
        private obliqueHelper: ObliqueHelperService
    ) {}

    ngOnInit(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        if (this.forPrinting) {
            this.headers = this.headers.filter(d => d !== TableHelper.ACTIONS);
        }
    }

    ngOnDestroy(): void {
        if (this.forPrinting) {
            this.parentForm.removeControl(SweMeldungArbeitsstellenTableComponent.getFormName(true));
            this.parentForm.setControl(SweMeldungArbeitsstellenTableComponent.getFormName(false), this.formArray);
        }
    }

    private static getFormName(forPrinting: boolean): string {
        return forPrinting ? `${SweMeldungArbeitsstellenTableComponent.FORM_NAME}${TableHelper.PRINT_STATE_SUFFIX}` : SweMeldungArbeitsstellenTableComponent.FORM_NAME;
    }

    addRow(): void {
        const currentArbeitsstellen: ArbeitsstelleSweDTO[] = this.getCurrentArbeitsstellen();
        currentArbeitsstellen.unshift(this.createRow());
        this.arbeitsstellen = currentArbeitsstellen;
        FocusHelper.inputFocus(SweMeldungArbeitsstellenTableComponent.FIRST_INPUT_ID);
        this.forceMarkAsDirty();
    }

    deleteRow(rowIndex: number): void {
        this.facadeService.openModalFensterService.deleteModal(() => {
            const currentArbeitsstellen: ArbeitsstelleSweDTO[] = this.getCurrentArbeitsstellen();
            currentArbeitsstellen.splice(rowIndex, 1);
            this.arbeitsstellen = currentArbeitsstellen;
            this.forceMarkAsDirty();
        });
    }

    private static setValidators(control: AbstractControl, newValidator: ValidatorFn | ValidatorFn[] | null): void {
        control.setValidators(newValidator);
        control.updateValueAndValidity();
    }

    private createRow(): ArbeitsstelleSweDTO {
        return {
            arbeitsstelleSweId: null,
            anmeldeDatum: new Date(),
            arbeitsstelle: null,
            anzahlBetroffene: null,
            entscheidSweId: null
        };
    }

    private createFormGroup(arbeitsstelle: ArbeitsstelleSweDTO): FormGroup {
        return this.formBuilder.group({
            arbeitsstelleSweId: arbeitsstelle.arbeitsstelleSweId,
            anmeldeDatum: [arbeitsstelle.anmeldeDatum, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            arbeitsstelle: [arbeitsstelle.arbeitsstelle, [Validators.maxLength(255)]],
            anzahlBetroffene: [arbeitsstelle.anzahlBetroffene, [NumberValidator.isPositiveIntegerWithMaxLength(10)]],
            entscheidSweId: arbeitsstelle.entscheidSweId
        });
    }

    private updateFormArray(): void {
        if (!this.formArray) {
            return;
        }
        this.updateFormArrayControls();
        this.correctFormArray();
        this.updateFormArrayValidators();
    }

    private updateFormArrayControls(): void {
        this.arbeitsstellen.forEach((arbeitsstelle: ArbeitsstelleSweDTO, index: number) => {
            const group = this.createFormGroup(arbeitsstelle);
            if (!this.formArray.controls[index]) {
                this.formArray.push(group);
            } else {
                this.formArray.controls[index].setValue(group.value);
            }
        });
    }

    private correctFormArray(): void {
        if (this.formArray.length > this.arbeitsstellen.length) {
            for (let i = this.formArray.length - 1; i >= this.arbeitsstellen.length; i -= 1) {
                this.formArray.removeAt(i);
            }
        }
    }

    private updateFormArrayValidators(): void {
        this.formArray.controls.forEach(form => {
            const group = form as FormGroup;
            SweMeldungArbeitsstellenTableComponent.setValidators(group.controls.anmeldeDatum, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            SweMeldungArbeitsstellenTableComponent.setValidators(
                group.controls.arbeitsstelle,
                this.required ? [Validators.required, Validators.maxLength(255)] : [Validators.maxLength(255)]
            );
            SweMeldungArbeitsstellenTableComponent.setValidators(
                group.controls.anzahlBetroffene,
                this.required
                    ? [Validators.required, NumberValidator.isPositiveIntegerWithMaxLength(10) as ValidatorFn]
                    : [NumberValidator.isPositiveIntegerWithMaxLength(10) as ValidatorFn]
            );
            SweMeldungArbeitsstellenTableComponent.setValidators(group.controls.entscheidSweId, this.required ? [Validators.required] : []);
        });
    }

    private forceMarkAsDirty(): void {
        // No other way to make form dirty when using formArray.
        setTimeout(() => {
            this.changeDetectorRef.detectChanges();
            this.formArray.markAsDirty();
        }, 0);
    }

    private createFormArrayIfDoesntExist(): void {
        const formName: string = SweMeldungArbeitsstellenTableComponent.getFormName(this.forPrinting);
        if (!this.parentForm.contains(formName)) {
            this.formArray = this.formBuilder.array([]);
            this.parentForm.setControl(formName, this.formArray);
        }
    }

    private getCurrentArbeitsstellen(): ArbeitsstelleSweDTO[] {
        const arbeitsstellen: ArbeitsstelleSweDTO[] = [];
        const rowsFormGroups = (this.parentForm.controls.arbeitsstellen as FormArray).controls;
        rowsFormGroups.forEach((row: FormGroup) => {
            const arbeitsstelle = {
                arbeitsstelleSweId: row.controls.arbeitsstelleSweId.value,
                anmeldeDatum: row.controls.anmeldeDatum.value,
                arbeitsstelle: row.controls.arbeitsstelle.value,
                anzahlBetroffene: row.controls.anzahlBetroffene.value,
                entscheidSweId: row.controls.entscheidSweId.value
            } as ArbeitsstelleSweDTO;
            arbeitsstellen.push(arbeitsstelle);
        });
        return arbeitsstellen;
    }

    sortFunction(event: any) {
        this.arbeitsstellen = event.data.sort((data1, data2) => {
            const value1 = data1[event.field];
            const value2 = data2[event.field];
            return event.order * (value1 < value2 ? -1 : value1 > value2 ? 1 : 0);
        });
    }

    isReadOnly(): boolean {
        return this.forPrinting || this.readOnly;
    }

    public onValueChange(rowIndex: number, column: string, event?: any) {
        const control = this.formArray.controls[rowIndex];
        const dto = this.arbeitstellenDtos[rowIndex];

        switch (column) {
            case 'anmeldeDatum':
                dto.anmeldeDatum = event ? event : control.value.anmeldeDatum;
                break;

            case 'arbeitsstelle':
                dto.arbeitsstelle = control.value.arbeitsstelle;
                break;

            case 'anzahlBetroffene':
                dto.anzahlBetroffene = control.value.anzahlBetroffene;
                break;

            case 'entscheidSweId':
                dto.entscheidSweId = event ? event : control.value.entscheidSweId;
                break;
        }
    }
}
