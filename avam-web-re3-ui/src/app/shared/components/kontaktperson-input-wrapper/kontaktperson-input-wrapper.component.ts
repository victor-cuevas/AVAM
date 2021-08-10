import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { StringHelper } from '@app/shared/helpers/string.helper';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';

@Component({
    selector: 'avam-kontaktperson-input-wrapper',
    templateUrl: './kontaktperson-input-wrapper.component.html',
    styleUrls: ['./kontaktperson-input-wrapper.component.scss']
})
export class KontaktpersonInputWrapperComponent implements OnInit {
    @ViewChild('kontaktpersonModal') kontaktpersonModal: ElementRef;
    @ViewChild('kontaktpersonBtn') kontaktpersonBtn;
    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('emailUrl') emailUrl: any;
    @ViewChild('coreInput') coreInput: CoreInputComponent;

    @Input() controlName: string;
    @Input() parentForm: FormGroup;
    @Input() componentLabel: string;
    @Input() unternehmenId: number;
    @Input() readonly: boolean;
    @Input() disabled: boolean;
    @Input() placeholder: string;
    @Input() showEmail: boolean;

    @Output() kontaktpersonSelected: EventEmitter<KontakteViewDTO> = new EventEmitter();
    @Output() onClear: EventEmitter<any> = new EventEmitter();

    /**
     * Formatted representation of the selected item.
     *
     * @memberof KontaktpersonInputWrapperComponent
     */
    selectedValue = '';

    /**
     * Selected KontakteViewDTO
     *
     * @memberof KontaktpersonInputWrapperComponent
     */
    selectedKontaktperson: KontakteViewDTO;

    constructor(private modalService: NgbModal, public obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
    }

    openKontaktperson() {
        this.kontaktpersonBtn.nativeElement.blur();
        this.modalService
            .open(this.kontaktpersonModal, { ariaLabelledBy: 'infotags-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' })
            .result.then(result => {}, reason => {});
    }

    onKontaktpersonSelected(kontaktperson: KontakteViewDTO) {
        this.selectedKontaktperson = kontaktperson;
        this.kontaktpersonSelected.emit(kontaktperson);
        this.modalService.dismissAll('item selected.');

        if (!isNaN(kontaktperson.kontaktpersonId)) {
            this.formatValue(kontaktperson);
        } else {
            this.selectedValue = ' ';
        }

        this.parentForm.controls[this.controlName]['kontaktpersonObject'] = kontaktperson;
        this.parentForm.controls[this.controlName].patchValue(this.selectedValue, { onlySelf: false, emitEvent: true });
    }

    change(value: string) {
        if (value === '') {
            this.onClear.emit();
            this.selectedKontaktperson = null;
            this.parentForm.controls[this.controlName]['kontaktpersonObject'] = null;
        }
    }

    input(value: KontakteViewDTO | string) {
        if (value && (value as KontakteViewDTO).kontaktpersonId) {
            this.selectedKontaktperson = value as KontakteViewDTO;
            this.formatValue(value);

            setTimeout(() => (this.coreInput.inputElement.nativeElement.value = this.selectedValue), 0);

            this.parentForm.controls[this.controlName]['kontaktpersonObject'] = value;
        } else {
            this.selectedValue = value as string;
        }
    }

    updateEmailUrl() {
        if (this.selectedKontaktperson && !StringHelper.isBlank(this.selectedKontaktperson.email)) {
            this.emailUrl.nativeElement.href = 'mailto:' + this.selectedKontaktperson.email;
        }
    }

    formatValue(value) {
        const name = value.name ? value.name : '';
        const vorname = value.vorname ? value.vorname : '';

        this.selectedValue = `${name}${name && vorname ? ', ' : ''}${vorname}`;
    }
}
