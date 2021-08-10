import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AvamZertifikateDynamicArrayComponent } from '@app/library/wrappers/form/avam-zertifikate-dynamic-array/avam-zertifikate-dynamic-array.component';
import { AmmAnbieterDTO } from '@app/shared/models/dtos-generated/ammAnbieterDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { AnbieterZertifikateHandlerService } from './anbieter-zertifikate-handler.service';
import { AnbieterZertifikateReactiveFormsService } from './anbieter-zertifikate-reactive-forms.service';
import { FacadeService } from '@shared/services/facade.service';

export interface AnbieterZertifikateFormData {
    anbieterDto: AmmAnbieterDTO;
    zertifikateOptions: CodeDTO[];
}

@Component({
    selector: 'avam-anbieter-zertifikate-form',
    templateUrl: './anbieter-zertifikate-form.component.html',
    styleUrls: ['./anbieter-zertifikate-form.component.scss'],
    providers: [AnbieterZertifikateHandlerService, AnbieterZertifikateReactiveFormsService]
})
export class AnbieterZertifikateFormComponent implements OnInit, OnChanges {
    @ViewChild('zertifikateDynamicArray') zertifikateDynamicArray: AvamZertifikateDynamicArrayComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input() zertifikateFormData: AnbieterZertifikateFormData;

    public formGroup: FormGroup;

    dto: AmmAnbieterDTO;
    zertifikate = [];
    zertifikateOptions = [];

    constructor(
        private handler: AnbieterZertifikateHandlerService,
        private reactiveForms: AnbieterZertifikateReactiveFormsService,
        private resetDialogService: ResetDialogService,
        private fehlermeldungenService: FehlermeldungenService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService
    ) {
        this.formGroup = reactiveForms.zertifikateForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.zertifikateFormData.currentValue) {
            this.dto = this.zertifikateFormData.anbieterDto;
            this.zertifikateOptions = this.facade.formUtilsService.mapDropdownKurztext(this.zertifikateFormData.zertifikateOptions);
            this.mapForm(this.dto);
        }
    }

    mapForm(dto: AmmAnbieterDTO) {
        this.formGroup.reset(this.handler.mapToForm(dto));
        this.zertifikate = this.handler.mapZertifikateToForm(dto);
    }

    mapToDto() {
        return this.handler.mapToDto(this.dto, this.zertifikateDynamicArray.form.value.zertifikate);
    }

    reset() {
        if (this.getDirtyState()) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.mapForm(this.dto);
            });
        }
    }

    onDuplication(event) {
        this.fehlermeldungenService.closeMessage();
        if (event) {
            this.fehlermeldungenService.showMessage('amm.anbieter.message.zertifikatdoppelt', 'danger');
            this.zertifikateDynamicArray.addItem();
        }
    }

    getDirtyState(): boolean {
        return this.formGroup.dirty || this.zertifikateDynamicArray.form.dirty;
    }

    getValidState(): boolean {
        return this.formGroup.valid && this.zertifikateDynamicArray.form.valid;
    }
}
