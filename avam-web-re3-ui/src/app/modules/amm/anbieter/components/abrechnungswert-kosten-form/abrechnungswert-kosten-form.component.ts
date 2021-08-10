import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AbrechnungswertBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungswertBearbeitenParameterDTO';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { AbrechnungswertKostenHandlerService } from './abrechnungswert-kosten-handler.service';
import { AbrechnungswertKostenReactiveFormsService } from './abrechnungswert-kosten-reactive-forms.service';

@Component({
    selector: 'avam-abrechnungswert-kosten-form',
    templateUrl: './abrechnungswert-kosten-form.component.html',
    styleUrls: ['./abrechnungswert-kosten-form.component.scss'],
    providers: [AbrechnungswertKostenHandlerService, AbrechnungswertKostenReactiveFormsService]
})
export class AbrechnungswertKostenFormComponent implements OnInit, OnChanges {
    @Input() formData = null;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('tweModal') tweModal: ElementRef;

    public formGroup: FormGroup;
    initialParam;

    fields: Subject<any[]> = new Subject();
    fieldsEnum = AbrechnungswertBearbeitenParameterDTO.EnabledFieldsEnum;

    constructor(
        private handler: AbrechnungswertKostenHandlerService,
        private reactiveForms: AbrechnungswertKostenReactiveFormsService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService,
        private readonly modalService: NgbModal
    ) {
        this.formGroup = this.reactiveForms.kostenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.formData.currentValue) {
            if (!this.initialParam) {
                this.initialParam = this.formData;
            }
            this.formGroup.reset(this.handler.mapToForm(this.formData.abrechnungswert));
            if (this.formData.isCalculated) {
                this.formGroup.markAsDirty();
            }
            this.fields.next(this.formData.enabledFields);
        }
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.handler.mapToForm(this.initialParam.abrechnungswert));
                this.formData.abrechnungswert = { ...this.initialParam.abrechnungswert };
            });
        }
    }

    openModal() {
        this.modalService.open(this.tweModal, { ariaLabelledBy: 'zahlstelle-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    mapToDTO(): AbrechnungswertDTO {
        return this.handler.mapToDTO(this.formData.abrechnungswert);
    }
}
