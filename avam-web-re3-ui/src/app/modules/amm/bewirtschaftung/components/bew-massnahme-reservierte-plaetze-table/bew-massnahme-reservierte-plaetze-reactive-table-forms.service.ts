import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms/src/model';

export enum COLUMN {
    institution = 'institution',
    kanton = 'kanton',
    verfall = 'verfall',
    teilnehmer = 'teilnehmer',
    status = 'status'
}

@Injectable()
export class BewMassnahmeReserviertePlaetzeTableReactiveFormsService {
    form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.form = this.formBuilder.group({
            rows: this.formBuilder.array([])
        });
    }

    createNewRow(row: any): FormGroup {
        const rowGroup = this.formBuilder.group({
            tableId: row.tableId,
            id: row.id,
            institution: [row.institution.codeId ? row.institution.codeId : row.institution, Validators.required],
            kanton: [row.kanton ? row.kanton.kantonsKuerzel : null, Validators.required],
            verfall: [row.verfall, Validators.required],
            teilnehmer: [row.teilnehmer, Validators.required],
            status: [row.status],
            statusValue: row.statusValue,
            newEntry: row.newEntry,
            editable: row.statusValue
        });

        return rowGroup;
    }
}
