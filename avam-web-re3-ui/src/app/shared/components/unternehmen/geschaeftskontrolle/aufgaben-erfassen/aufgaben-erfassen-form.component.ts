import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { GeKoAufgabeDetailsDTO } from '@dtos/geKoAufgabeDetailsDTO';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { AufgabenErfassenHandlerService } from '@shared/components/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-handler.service';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { AufgabenErfassenReactiveFormsService } from '@shared/components/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-reactive-forms.service';
import { AufgabenErfassenData } from './aufgaben-erfassen.data';

@Component({
    selector: 'avam-aufgaben-erfassen-form',
    templateUrl: './aufgaben-erfassen-form.component.html',
    providers: [AufgabenErfassenHandlerService, AufgabenErfassenReactiveFormsService, ObliqueHelperService]
})
export class AufgabenErfassenFormComponent extends Unsubscribable implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('initialisiertDurch') initialisiertDurch: AvamPersonalberaterAutosuggestComponent;
    @Input('data') data: AufgabenErfassenData;
    formGroup: FormGroup;

    constructor(private obliqueHelperService: ObliqueHelperService, public service: GekoAufgabenService, public handler: AufgabenErfassenHandlerService) {
        super();
        this.formGroup = handler.reactiveForms.form;
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.setSubscriptions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data.currentValue && this.data) {
            this.handle();
        }
    }

    mapToDto(): GeKoAufgabeDetailsDTO {
        const dto = { ...this.data.dto };
        if (this.isErfassen()) {
            dto.unternehmenId = this.data.unternehmenId;
            dto.geschaeftsbereichCode = this.data.bereich;
        }
        return this.handler.mapToDto(dto);
    }

    reset(): void {
        if (this.formGroup.dirty) {
            this.service.facade.resetDialogService.reset(() => {
                this.service.facade.fehlermeldungenService.closeMessage();
                if (this.isBearbeiten()) {
                    this.mapToForm();
                } else {
                    this.formGroup.reset();
                    this.handleCreate();
                }
            });
        }
    }

    mapToForm(): void {
        this.formGroup.reset(this.handler.mapToForm(this.data.dto));
    }

    isBearbeiten(): boolean {
        return this.data && this.data.formMode === FormModeEnum.EDIT;
    }

    private isErfassen(): boolean {
        return this.data && this.data.formMode === FormModeEnum.CREATE;
    }

    private handle(): void {
        this.handler.initCodes(this.data.codes, this.data.bereich);
        if (this.isBearbeiten()) {
            this.handleEdit();
        } else if (this.isErfassen()) {
            this.handleCreate();
        }
    }

    private handleEdit(): void {
        this.handler.setDefaultValues(this.data.formMode, this.data.dto.status.codeId);
        this.initialisiertDurch.appendCurrentUser();
        this.mapToForm();
    }

    private handleCreate(): void {
        this.handler.setDefaultValues(this.data.formMode);
        this.initialisiertDurch.appendCurrentUser();
    }

    private setSubscriptions(): void {
        this.service.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.handler.onLangChange());
    }
}
