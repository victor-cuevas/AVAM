import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { InfotagMassnahmeSuchenHandlerService } from './infotag-massnahme-suchen-handler.service';
import { InfotagMassnahmeSuchenReactiveFormsService } from './infotag-massnahme-suchen-reactive-form.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { InfotagMassnahmeSuchenParamDTO } from '@app/shared/models/dtos-generated/infotagMassnahmeSuchenParamDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AuthenticationService } from '@app/core/services/authentication.service';

@Component({
    selector: 'avam-infotag-massnahme-suchen-form',
    templateUrl: './infotag-massnahme-suchen-form.component.html',
    styleUrls: ['./infotag-massnahme-suchen-form.component.scss'],
    providers: [InfotagMassnahmeSuchenHandlerService, InfotagMassnahmeSuchenReactiveFormsService]
})
export class InfotagMassnahmeSuchenFormComponent implements OnInit, OnChanges {
    @Input('infotagMassnahmeData') infotagMassnahmeData;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();
    @ViewChild('massnahmenverantwortung') massnahmenverantwortung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public categoriesOptions: any[];
    public massnahmeSuchenForm: FormGroup;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    verantwortungSuchenTokens = {};
    defaultDropdownOption: number;
    disableInputs = false;

    constructor(private handler: InfotagMassnahmeSuchenHandlerService, private obliqueHelper: ObliqueHelperService, private authenticationService: AuthenticationService) {
        this.massnahmeSuchenForm = handler.reactiveForm.massnahmeSuchenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        const currentUser = this.authenticationService.getLoggedUser();
        this.verantwortungSuchenTokens = {
            berechtigung: Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN,
            myBenutzerstelleId: currentUser.benutzerstelleId
        };
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.infotagMassnahmeData.currentValue) {
            this.categoriesOptions = this.infotagMassnahmeData.dropdownOptions.map(this.handler.customPropertyMapper);
            this.defaultDropdownOption = this.categoriesOptions.find(el => el.isSelected);
            this.massnahmeSuchenForm.patchValue(this.handler.getDefaultData(this.defaultDropdownOption));

            if (this.infotagMassnahmeData.state) {
                const form = this.handler.mapToForm(this.infotagMassnahmeData.state);
                this.massnahmeSuchenForm.reset(form);
                if (this.infotagMassnahmeData.state.filterValue) {
                    this.massnahmenverantwortung.filterDropdown.nativeElement.value = this.infotagMassnahmeData.state.filterValue;
                }
            }
        }
    }

    reset() {
        this.massnahmeSuchenForm.reset();
        this.massnahmeSuchenForm.patchValue(this.handler.getDefaultData(this.defaultDropdownOption));
        this.disableInputs = false;
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const massnahmeNrValue = event.target ? event.target.value : event;
        this.disableInputs = massnahmeNrValue ? true : false;
    }

    mapToDTO(): InfotagMassnahmeSuchenParamDTO {
        return this.handler.mapToDTO();
    }

    mapStoreData() {
        return this.handler.mapStoreData(this.massnahmenverantwortung.filterDropdown.nativeElement.value);
    }
}
