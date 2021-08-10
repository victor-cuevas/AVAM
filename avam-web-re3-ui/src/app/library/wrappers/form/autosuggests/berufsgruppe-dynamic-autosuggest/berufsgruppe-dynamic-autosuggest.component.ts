import { FormGroup, FormArray, ValidatorFn, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'avam-berufsgruppe-dynamic-autosuggest',
  templateUrl: './berufsgruppe-dynamic-autosuggest.component.html',
  styleUrls: ['./berufsgruppe-dynamic-autosuggest.component.scss']
})
export class BerufsgruppeDynamicAutosuggestComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() placeholder: string;
  @Input() label: string;
  @Input() set readOnly(isReadOnly: boolean) {
    this.isReadOnly = isReadOnly;
  }

  isReadOnly: boolean;

  private berufsgruppen: FormArray;

  private validators: ValidatorFn;

  constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.parentForm.statusChanges.subscribe(() => {
      this.berufsgruppen = this.parentForm.controls.berufsgruppen as FormArray;

      if (this.berufsgruppen.value.length) {
        const formGroup: FormGroup = this.berufsgruppen.controls[0] as FormGroup;
        this.validators = formGroup.controls.berufsgruppe.validator;
      }
    });
  }

  addItem(): void {
    this.berufsgruppen.push(this.formBuilder.group({ berufsgruppe: [null, this.validators] }));
    this.changeDetectorRef.detectChanges();
    this.parentForm.markAsDirty();
  }

  removeItem(indexToRemove: number): void {
    this.berufsgruppen.removeAt(indexToRemove);
    this.changeDetectorRef.detectChanges();
    this.parentForm.markAsDirty();
  }
}
