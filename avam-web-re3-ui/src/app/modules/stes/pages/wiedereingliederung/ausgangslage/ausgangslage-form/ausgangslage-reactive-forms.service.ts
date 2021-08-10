import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { StesBeurteilungselementDTO } from '@app/shared/models/dtos-generated/stesBeurteilungselementDTO';
import { SituationsbeurteilungColumns } from './ausgangslage-form.model';

@Injectable()
export class AusgangslageReactiveFormsService {
    ausgangslageForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.ausgangslageForm = this.formBuilder.group({
            gueltigAb: ['', Validators.required],
            vermittelbarkeit: ['', Validators.required],
            qualifizierungsbedarf: '',
            bearbeitung: ['', Validators.required],
            situationsbeurteilungRows: this.formBuilder.array([])
        });
    }

    createNewRow(): FormGroup {
        return this.formBuilder.group(
            {
                beurteilungskriterium: null,
                handlungsbedarf: null,
                priority: null,
                stesBeurteilungselementID: null
            },
            {
                validators: this.sharedRequiredState()
            }
        );
    }

    createSystemRow(beurteilungselement: StesBeurteilungselementDTO): FormGroup {
        return this.formBuilder.group({
            beurteilungskriterium: [beurteilungselement.handlungsfeldObject, Validators.required],
            handlungsbedarf: [beurteilungselement.handlungsbedarfID ? beurteilungselement.handlungsbedarfID : null, Validators.required],
            priority: [beurteilungselement.prioritaetID ? beurteilungselement.prioritaetID : null, Validators.required],
            stesBeurteilungselementID: beurteilungselement.stesBeurteilungselementID
        });
    }

    sharedRequiredState(): ValidatorFn {
        return (formGroup: FormGroup): { [key: string]: boolean } | null => {
            const ctrls = formGroup.controls;

            if (ctrls.beurteilungskriterium.value && !ctrls.priority.value) {
                ctrls.priority.setErrors({ required: true });
            } else {
                ctrls.priority.setErrors(null);
            }

            if (ctrls.beurteilungskriterium.value && !ctrls.handlungsbedarf.value) {
                ctrls.handlungsbedarf.setErrors({ required: true });
            } else {
                ctrls.handlungsbedarf.setErrors(null);
            }

            if ((ctrls.priority.value || ctrls.handlungsbedarf.value) && !ctrls.beurteilungskriterium.value) {
                ctrls.beurteilungskriterium.setErrors({ required: true });
            } else {
                ctrls.beurteilungskriterium.setErrors(null);
            }

            return null;
        };
    }

    resetTableValidators(formArray: FormArray) {
        formArray.controls.forEach(ctrl => {
            const group = ctrl as FormGroup;
            if (group.value.stesBeurteilungselementID) {
                group.setValidators(null);
                group.updateValueAndValidity();
                Object.keys(group.controls).forEach(key => {
                    if (
                        key === SituationsbeurteilungColumns.BEURTEILUNGSKRITERIUM ||
                        key === SituationsbeurteilungColumns.PRIORITY ||
                        key === SituationsbeurteilungColumns.HANDLUNGSBEDARF
                    ) {
                        group.controls[key].setValidators(Validators.required);
                        group.controls[key].updateValueAndValidity();
                    }
                });
            } else {
                Object.keys(group.controls).forEach(key => {
                    group.controls[key].setValidators(null);
                    group.controls[key].updateValueAndValidity();
                });
                group.setValidators(this.sharedRequiredState());
                group.updateValueAndValidity();
            }
        });
    }
}
