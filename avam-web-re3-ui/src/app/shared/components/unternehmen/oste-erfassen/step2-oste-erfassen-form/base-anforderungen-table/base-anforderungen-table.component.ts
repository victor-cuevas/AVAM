import { Input, OnDestroy } from '@angular/core';
import { Unsubscribable } from 'oblique-reactive';
import { FormArray, FormGroup } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { FacadeService } from '@shared/services/facade.service';
import { SprachkenntnisDTO } from '@dtos/sprachkenntnisDTO';
import { OsteBerufsbildungEntryParamDTO } from '@dtos/osteBerufsbildungEntryParamDTO';

export abstract class BaseAnforderungenTableComponent extends Unsubscribable implements OnDestroy {
    jaNeinOptions: any[] = [{ value: 1, labelDe: 'ja', labelFr: 'oui', labelIt: 'sì' }, { value: 0, labelDe: 'nein', labelFr: 'non', labelIt: 'no' }];
    @Input() disableForm = false;
    tableForm: FormGroup;
    visible = true;
    dataSource = [];
    sortField: string;
    sortOrder: number;
    currentRows = 0;

    protected constructor(protected facade: FacadeService) {
        super();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    getFormGroupAt(index: number): FormGroup {
        const formArray = this.tableForm.controls.array as FormArray;
        return formArray.at(this.getFormGroupPositionByIndexControl(index)) as FormGroup;
    }

    onAddRowOnTop(keepPristine?: boolean) {
        this.currentRows++;
        (this.tableForm.controls.array as FormArray).insert(0, this.instantiateFormGroup());
        this.dataSource.unshift({ index: this.currentRows });
        this.reset();
        if (!keepPristine) {
            this.markDirty();
        }
    }

    openDeleteDialog(index: number): void {
        const modalRef = this.facade.openModalFensterService.openDeleteModal();
        modalRef.result.then(result => {
            if (result) {
                this.onDeleteRow(index);
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    onDeleteRow(index: number) {
        if (this.tableForm.controls.array['length'] !== 1) {
            this.dataSource.splice(this.dataSource.findIndex(v => v.index === index), 1);
            (this.tableForm.controls.array as FormArray).removeAt(this.getFormGroupPositionByIndexControl(index));
            this.reset();
            this.markDirty();
        } else {
            this.tableForm.controls.array['at'](0).reset();
            this.tableForm.markAsDirty();
        }
    }

    mapToTable(data: (SprachkenntnisDTO | OsteBerufsbildungEntryParamDTO)[]) {
        // remove previous elements
        this.dataSource = [];
        while (this.tableForm.controls.array['length']) {
            this.tableForm.controls.array['removeAt'](0);
        }
        // insert new elements
        if (!data || !data.length) {
            this.onAddRowOnTop(true);
        } else {
            data.forEach(element => {
                this.currentRows++;
                (this.tableForm.controls.array as FormArray).push(this.instantiateFormGroup(element));
                this.dataSource.push({ index: this.currentRows });
            });
        }

        this.reset();
    }

    sortFunction(sortEvent: any) {
        this.parseFormData();
        this.dataSource.sort((v1, v2) => {
            return !!v1[sortEvent.field] ? sortEvent.order * v1[sortEvent.field].localeCompare(v2[sortEvent.field]) : 0;
        });

        this.sortField = sortEvent.field;
        this.sortOrder = sortEvent.order;
        this.reset();
    }

    public recheckValidations() {
        const formArray = this.tableForm.controls.array as FormArray;
        for (let i = 0; i < formArray.length; i++) {
            const fg = formArray.at(i) as FormGroup;
            Object.keys(fg.controls).forEach(controlsKey => {
                fg.controls[controlsKey].patchValue(this.getValue(fg.controls[controlsKey]));
                fg.controls[controlsKey].markAsDirty();
                fg.controls[controlsKey].updateValueAndValidity();
            });
        }
    }

    private getValue(control) {
        let value;
        if (control['berufAutosuggestObject']) {
            if (!control['berufAutosuggestObject'].bezeichnungMaDe) {
                value = undefined;
            } else {
                value = control['berufAutosuggestObject'];
            }
        } else {
            value = control.value;
        }
        return value;
    }

    protected getFormGroupPositionByIndexControl(index: number): number {
        const formArray = this.tableForm.controls.array as FormArray;
        for (let i = 0; i < formArray.length; i++) {
            if (formArray.at(i).get('index').value === index) {
                return i;
            }
        }
        return -1;
    }

    protected filterIsValid = (element: CodeDTO) => {
        const currentCal = new Date();
        const currentGueltigBis = this.getCurrentByDate(element.gueltigBis);
        const currentGueltigAb = this.getCurrentByDate(element.gueltigAb);
        if (this.areBothDatesNull(currentGueltigAb, currentGueltigBis)) {
            return true;
        } else if (this.isGueltigBisBeforeCurrent(currentGueltigAb, currentGueltigBis, currentCal)) {
            return true;
        } else if (this.isGueltigAbAfterCurrent(currentGueltigAb, currentGueltigBis, currentCal)) {
            return true;
        } else {
            return this.currentDateIsBetweenGueltigAbAndGueltigBis(currentGueltigAb, currentGueltigBis, currentCal);
        }
    };

    private currentDateIsBetweenGueltigAbAndGueltigBis(currentGueltigAb, currentGueltigBis, currentCal) {
        const areNotNull = currentGueltigAb != null && currentGueltigBis != null;
        const currentBetweenAbAndBis = this.isFirstDateAfterSecondDate(currentCal, currentGueltigAb) && this.isFirstDateAfterSecondDate(currentGueltigBis, currentCal);
        return areNotNull && currentBetweenAbAndBis;
    }

    private isGueltigAbAfterCurrent(currentGueltigAb, currentGueltigBis, currentCal) {
        return currentGueltigAb != null && currentGueltigBis == null && this.isFirstDateAfterSecondDate(currentCal, currentGueltigAb);
    }

    private isGueltigBisBeforeCurrent(currentGueltigAb, currentGueltigBis, currentCal) {
        return currentGueltigAb == null && currentGueltigBis != null && this.isFirstDateAfterSecondDate(currentGueltigBis, currentCal);
    }

    private areBothDatesNull(currentGueltigAb, currentGueltigBis) {
        return currentGueltigAb == null && currentGueltigBis == null;
    }

    private isFirstDateAfterSecondDate(firstDate, secondDate) {
        return firstDate > secondDate;
    }

    private getCurrentByDate(time: any) {
        return time ? new Date(time) : null;
    }

    protected abstract parseFormData(): any;

    protected abstract instantiateFormGroup(data?: any): FormGroup;

    protected abstract reset(): void;

    protected abstract getNumberValue(data: any, controlName: string): number;

    private markDirty() {
        setTimeout(() => this.tableForm.markAsDirty(), 100);
    }
}
