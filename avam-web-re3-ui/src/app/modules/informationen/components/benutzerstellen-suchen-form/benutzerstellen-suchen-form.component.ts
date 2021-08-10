import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BenutzerstellenSuchenHandlerService } from '@modules/informationen/components/benutzerstellen-suchen-form/benutzerstellen-suchen-handler.service';
import { BenutzerstellenSuchenReactiveFormsService } from '@modules/informationen/components/benutzerstellen-suchen-form/benutzerstellen-suchen-reactive-forms.service';
import { FormGroup } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { KantonDTO } from '@dtos/kantonDTO';
import { BenutzerstellenQueryDTO } from '@dtos/benutzerstellenQueryDTO';
import { FacadeService } from '@shared/services/facade.service';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

export interface BenutzerstellenSuchenFormData {
    stati: CodeDTO[];
    kantone: KantonDTO[];
    benutzerstelleTyps: any;
    vollzugsregionen: any;
}

@Component({
    selector: 'avam-benutzerstellen-suchen-form',
    templateUrl: './benutzerstellen-suchen-form.component.html',
    styleUrls: ['./benutzerstellen-suchen-form.component.scss'],
    providers: [BenutzerstellenSuchenHandlerService, BenutzerstellenSuchenReactiveFormsService]
})
export class BenutzerstellenSuchenFormComponent implements OnInit, OnChanges {
    @Input() formData: BenutzerstellenSuchenFormData;
    @Input() searchFormStateKey: string;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();
    @Output() savedSearchData: EventEmitter<any> = new EventEmitter();
    searchForm: FormGroup;
    statusOptions: any[];
    kantoneOptions: any[];
    benutzerstelleTypOptions: any[];
    vollzugsregionOptions: any[];
    benutzerstelleSuchenTokens: any = {};
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.DEFAULT;

    constructor(public handler: BenutzerstellenSuchenHandlerService, private facade: FacadeService, private storageService: SearchSessionStorageService) {
        this.searchForm = handler.reactiveForm.searchForm;
    }

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.formData.currentValue) {
            this.mapData();
        }
    }

    private mapData(): void {
        this.statusOptions = this.formData.stati.map(this.handler.propertyMapperCode);
        this.kantoneOptions = this.formData.kantone.map(this.handler.kantoneMapper);
        this.benutzerstelleTypOptions = this.facade.formUtilsService.mapDropdownKurztext(this.formData.benutzerstelleTyps);
        this.vollzugsregionOptions = this.facade.formUtilsService.mapDropdownKurztext(this.formData.vollzugsregionen);

        this.setFormValue();
    }

    private setFormValue(): void {
        const state = this.storageService.restoreStateByKey(this.searchFormStateKey);
        if (state) {
            this.handler.reactiveForm.searchForm.patchValue(state.fields);
            this.savedSearchData.emit();
        } else {
            this.handler.reactiveForm.setDefaultValues();
        }
    }

    mapToDto(): BenutzerstellenQueryDTO {
        return this.handler.mapToDto();
    }
}
