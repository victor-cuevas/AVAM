import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { InfotagBewirtschaftungGrunddatenHandlerService } from './infotag-bewirtschaftung-grunddaten-handler.service';
import { InfotagBewirtschaftungGrunddatenModeService } from './infotag-bewirtschaftung-grunddaten-mode.service';
import { InfotagBewirtschaftungGrunddatenReactiveFormsService } from './infotag-bewirtschaftung-grunddaten-reactive-forms.service';
import { FacadeService } from '@shared/services/facade.service';
export interface InfotagBewGrunddatenData {
    spracheOptions?: CodeDTO[];
    verfuegbarkeitOptions?: CodeDTO[];
    grunddatenDto?: SessionDTO;
    hasBookings?: boolean;
}

@Component({
    selector: 'avam-infotag-bewirtschaftung-grunddaten-form',
    templateUrl: './infotag-bewirtschaftung-grunddaten-form.component.html',
    styleUrls: ['./infotag-bewirtschaftung-grunddaten-form.component.scss'],
    providers: [InfotagBewirtschaftungGrunddatenHandlerService, InfotagBewirtschaftungGrunddatenModeService, InfotagBewirtschaftungGrunddatenReactiveFormsService]
})
export class InfotagBewirtschaftungGrunddatenFormComponent implements OnInit, OnChanges {
    @Input('grunddatenData') grunddatenData: InfotagBewGrunddatenData;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    spracheEnum = SpracheEnum;
    nachmittagsControlName = [];
    verfuegbarkeitOptions = [];
    spracheOptions = [];
    clearCheckboxes = true;

    public formGroup: FormGroup;
    constructor(
        private handler: InfotagBewirtschaftungGrunddatenHandlerService,
        private obliqueHelper: ObliqueHelperService,
        private reactiveFormsService: InfotagBewirtschaftungGrunddatenReactiveFormsService,
        private fehlermeldungenService: FehlermeldungenService,
        private resetDialogService: ResetDialogService,
        private facade: FacadeService
    ) {
        this.formGroup = handler.reactiveForms.grunddatenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.grunddatenData.currentValue) {
            this.verfuegbarkeitOptions = this.facade.formUtilsService.mapDropdownKurztext(this.grunddatenData.verfuegbarkeitOptions);
            this.spracheOptions = this.grunddatenData.spracheOptions.map(this.handler.languagePropertyMapper);
            this.formGroup.patchValue(this.handler.mapToForm(this.grunddatenData.grunddatenDto));
            this.reactiveFormsService.setValidatorsOnDurchfuehrungVonBis(this.grunddatenData.grunddatenDto);
            this.reactiveFormsService.setRequiredWeekdays(this.grunddatenData.verfuegbarkeitOptions);
            this.clearCheckboxes = false;
        }
    }

    reset() {
        if (this.formGroup.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.formGroup.patchValue(this.handler.mapToForm(this.grunddatenData.grunddatenDto));
            });
        }
    }

    mapToDTO(): SessionDTO {
        return this.handler.mapToDTO(this.grunddatenData.grunddatenDto, this.grunddatenData.verfuegbarkeitOptions);
    }
}
