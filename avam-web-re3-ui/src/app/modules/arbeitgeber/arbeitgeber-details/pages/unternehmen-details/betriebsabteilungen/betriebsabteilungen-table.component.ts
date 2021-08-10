import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormGroupDirective, ValidatorFn, Validators } from '@angular/forms';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { BetriebsabteilungDTO } from '@dtos/betriebsabteilungDTO';
import { NumberValidator } from '@shared/validators/number-validator';
import { FocusHelper } from '@modules/arbeitgeber/shared/utils/focus-helper';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FacadeService } from '@shared/services/facade.service';
import { TableEvent, TableHelper } from '@shared/helpers/table.helper';

@Component({
    selector: 'avam-betriebsabteilungen-table',
    templateUrl: './betriebsabteilungen-table.component.html',
    styleUrls: ['./betriebsabteilungen-table.component.scss']
})
export class BetriebsabteilungenTableComponent implements OnInit, OnDestroy {
    @Input() parentForm: FormGroup;
    @Input() alvAnerkanntOptions: DropdownOption[] = [];
    @Input() forPrinting = false;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input() set betriebsabteilungen(values: BetriebsabteilungDTO[]) {
        this.updateBetriebsabteilung(values);
    }
    get betriebsabteilungen(): BetriebsabteilungDTO[] {
        return this.betriebsabteilungDtos;
    }

    readonly ABTEILUNG_NAME_COLUMN = 'abteilungName';
    readonly ABTEILUNG_NR_COLUMN = 'abteilungNr';
    readonly ALV_ANERKANNT_COLUMN = 'alvAnerkannt';

    formArray: FormArray;
    columns = [
        { columnDef: this.ABTEILUNG_NAME_COLUMN, header: 'kaeswe.label.betriebsabteilung' },
        { columnDef: this.ABTEILUNG_NR_COLUMN, header: 'kaeswe.label.nr' },
        { columnDef: this.ALV_ANERKANNT_COLUMN, header: 'kaeswe.label.alvanerkannt' },
        { columnDef: TableHelper.ACTIONS, header: '' }
    ];
    headers = this.columns.map(c => c.columnDef);

    private static readonly YES_CODE = '1';
    private static readonly NO_CODE = '0';
    private static readonly GESAMTBETRIEB_NR = 0;
    private static readonly FORM_NAME = 'betriebsabteilungen';
    private static readonly FIRST_INPUT_ID = 'abteilungName0';

    private betriebsabteilungDtos: BetriebsabteilungDTO[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private facadeService: FacadeService,
        private changeDetectorRef: ChangeDetectorRef,
        private obliqueHelper: ObliqueHelperService,
        private tableHelper: TableHelper<BetriebsabteilungDTO>
    ) {}

    ngOnInit(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        if (this.forPrinting) {
            this.headers = this.headers.filter(d => d !== TableHelper.ACTIONS);
        }
    }

    ngOnDestroy(): void {
        if (this.forPrinting) {
            this.parentForm.removeControl(BetriebsabteilungenTableComponent.getFormName(true));
            this.parentForm.setControl(BetriebsabteilungenTableComponent.getFormName(false), this.formArray);
        }
    }

    addRow(): void {
        const currentBetriebsabteilungen: BetriebsabteilungDTO[] = this.getCurrentBetriebsabteilungen();
        currentBetriebsabteilungen.unshift(BetriebsabteilungenTableComponent.createRow());
        this.betriebsabteilungen = currentBetriebsabteilungen;
        FocusHelper.inputFocus(BetriebsabteilungenTableComponent.FIRST_INPUT_ID);
        this.forceMarkAsDirty();
    }

    deleteRow(rowIndex: number): void {
        this.facadeService.openModalFensterService.deleteModal(() => {
            const currentBetriebsabteilungen: BetriebsabteilungDTO[] = this.getCurrentBetriebsabteilungen();
            currentBetriebsabteilungen.splice(rowIndex, 1);
            this.betriebsabteilungen = currentBetriebsabteilungen;
            this.forceMarkAsDirty();
        });
    }

    isReadOnly(row: BetriebsabteilungDTO): boolean {
        return !!row.betriebsabteilungId;
    }

    isGesamtbetrieb(row: BetriebsabteilungDTO): boolean {
        return row.betriebsabteilungId && row.abteilungNr === BetriebsabteilungenTableComponent.GESAMTBETRIEB_NR;
    }

    updateBetriebsabteilung(values: BetriebsabteilungDTO[]) {
        if (!values) {
            return;
        }
        this.setFormArray();
        this.betriebsabteilungDtos = values;
        this.updateFormArray();
    }

    private static getFormName(forPrinting: boolean): string {
        return forPrinting ? `${BetriebsabteilungenTableComponent.FORM_NAME}${TableHelper.PRINT_STATE_SUFFIX}` : BetriebsabteilungenTableComponent.FORM_NAME;
    }

    private static setValidators(control: AbstractControl, newValidator: ValidatorFn | ValidatorFn[] | null): void {
        control.setValidators(newValidator);
        control.updateValueAndValidity();
    }

    private static createRow(): BetriebsabteilungDTO {
        return {
            betriebsabteilungId: null,
            abteilungName: null,
            abteilungNr: null,
            alvAnerkannt: true
        } as BetriebsabteilungDTO;
    }

    private createFormGroup(betriebsAbteilung: BetriebsabteilungDTO): FormGroup {
        return this.formBuilder.group({
            betriebsabteilungId: betriebsAbteilung.betriebsabteilungId,
            abteilungName: betriebsAbteilung.abteilungName,
            abteilungNr: betriebsAbteilung.abteilungNr,
            alvAnerkannt: betriebsAbteilung.alvAnerkannt ? BetriebsabteilungenTableComponent.YES_CODE : BetriebsabteilungenTableComponent.NO_CODE
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
        this.betriebsabteilungen.forEach((betriebsAbteilung: BetriebsabteilungDTO, index: number) => {
            const group = this.createFormGroup(betriebsAbteilung);
            if (!this.formArray.controls[index]) {
                this.formArray.push(group);
            } else {
                this.formArray.controls[index].setValue(group.value);
            }
        });
    }

    private correctFormArray(): void {
        if (this.betriebsabteilungen.length && this.formArray.length && this.formArray.length > this.betriebsabteilungen.length) {
            for (let i = this.formArray.length - 1; i >= this.betriebsabteilungen.length; i -= 1) {
                this.formArray.removeAt(i);
            }
        }
    }

    private updateFormArrayValidators(): void {
        this.formArray.controls.forEach(form => {
            const group = form as FormGroup;
            BetriebsabteilungenTableComponent.setValidators(group.controls.abteilungName, Validators.required);
            BetriebsabteilungenTableComponent.setValidators(group.controls.abteilungNr, [Validators.required, NumberValidator.isNumberInRange(0, 99, 'betrabtnrnumerisch')]);
            BetriebsabteilungenTableComponent.setValidators(group.controls.alvAnerkannt, Validators.required);
        });
    }

    private forceMarkAsDirty(): void {
        // No other way to make form dirty when using formArray.
        setTimeout(() => {
            this.changeDetectorRef.detectChanges();
            this.formArray.markAsDirty();
        }, 0);
    }

    private setFormArray(): void {
        const formName: string = BetriebsabteilungenTableComponent.getFormName(this.forPrinting);
        if (!this.parentForm.contains(formName)) {
            this.formArray = this.formBuilder.array([]);
            this.parentForm.setControl(formName, this.formArray);
        }
    }

    getCurrentBetriebsabteilungen(form?: FormGroup): BetriebsabteilungDTO[] {
        const betriebsabteilungen: BetriebsabteilungDTO[] = [];
        const parent = form || this.parentForm;
        const rowsFormGroups = (parent.controls.betriebsabteilungen as FormArray).controls;
        rowsFormGroups.forEach((row: FormGroup) => {
            const betriebsabteilung = {
                betriebsabteilungId: row.controls.betriebsabteilungId.value,
                abteilungName: row.controls.abteilungName.value,
                abteilungNr: row.controls.abteilungNr.value,
                alvAnerkannt: row.controls.alvAnerkannt.value && row.controls.alvAnerkannt.value === BetriebsabteilungenTableComponent.YES_CODE
            } as BetriebsabteilungDTO;
            betriebsabteilungen.push(betriebsabteilung);
        });
        return betriebsabteilungen;
    }

    sortFunction(event: TableEvent<BetriebsabteilungDTO>) {
        switch (event.field) {
            case this.ABTEILUNG_NAME_COLUMN:
            case this.ABTEILUNG_NR_COLUMN:
                this.betriebsabteilungen = this.tableHelper.defaultSort(event);
                break;
            case this.ALV_ANERKANNT_COLUMN:
                const getAlvAnerkanntAsString = (b: BetriebsabteilungDTO) => (b.alvAnerkannt ? '0' : '1');
                this.betriebsabteilungen = this.tableHelper.sortWithCustomValue(event, getAlvAnerkanntAsString);
                break;
            default:
                break;
        }
    }
}
