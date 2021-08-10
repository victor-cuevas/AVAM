import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { RahmenfristKaeSweDetailDTO } from '@dtos/rahmenfristKaeSweDetailDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { RahmenfristKaeSweHandlerService } from '@modules/arbeitgeber/arbeitgeber-details/components/rahmenfrist-kae-swe-form/rahmenfrist-kae-swe-handler.service';
import { RahmenfristKaeSweReactiveFormsService } from '@modules/arbeitgeber/arbeitgeber-details/components/rahmenfrist-kae-swe-form/rahmenfrist-kae-swe-reactive-forms.service';

@Component({
    selector: 'avam-rahmenfrist-kae-swe-form',
    templateUrl: './rahmenfrist-kae-swe-form.component.html',
    styleUrls: ['./rahmenfrist-kae-swe-form.component.scss'],
    providers: [RahmenfristKaeSweHandlerService, RahmenfristKaeSweReactiveFormsService, ObliqueHelperService]
})
export class RahmenfristKaeSweFormComponent implements OnInit, OnChanges {
    @Input('data') data: { dto: RahmenfristKaeSweDetailDTO } = null;
    @Output() onOpenRahmenfristDetails: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    formGroup: FormGroup;
    dto: RahmenfristKaeSweDetailDTO;

    constructor(private obliqueHelperService: ObliqueHelperService, private handlerService: RahmenfristKaeSweHandlerService) {
        this.formGroup = handlerService.reactiveFormsService.form;
    }

    ngOnInit(): void {
        this.obliqueHelperService.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data.currentValue) {
            if (this.data && this.data.dto) {
                this.dto = this.data.dto;
                this.mapToForm();
            }
        }
    }

    mapToForm(): void {
        this.formGroup.reset(this.handlerService.mapToForm(this.data.dto));
    }

    openRahmenfristDetailsModal(): void {
        this.onOpenRahmenfristDetails.emit();
    }
}
