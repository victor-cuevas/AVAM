import { ElementPrefixEnum } from './../../../../../shared/enums/domain-code/element-prefix.enum';
import { ElementKategorieDTO } from '@dtos/elementKategorieDTO';
import { FacadeService } from '@shared/services/facade.service';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { RegionSuchenParamDTO } from '@dtos/regionSuchenParamDTO';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { PlanungSuchenHandlerService } from './planung-suchen-handler.service';
import { PlanungSuchenReactiveFormService } from './planung-suchen-reactive-forms.service';
import { PlanungstypEnum } from '@shared/enums/domain-code/planungstyp-code.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { PlanungSuchenParameterDTO } from '@app/shared/models/dtos-generated/planungSuchenParameterDTO';

export interface PlanungSuchenFormData {
    planungstypOptions: CodeDTO[];
    massnahmeartStrukturElements: ElementKategorieDTO[];
    massnahmenTypes: StrukturElementDTO[];
    planungSuchenParameterDto?: PlanungSuchenParameterDTO;
}
@Component({
    selector: 'avam-planung-suchen-form',
    templateUrl: './planung-suchen-form.component.html',
    styleUrls: ['./planung-suchen-form.component.scss'],
    providers: [PlanungSuchenHandlerService, PlanungSuchenReactiveFormService, ObliqueHelperService]
})
export class PlanungSuchenFormComponent implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input('planungData') planungData: any;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    planungSuchenForm: FormGroup;
    massnahmeartStrukturOptions = [];
    massnahmentypOptions = [];
    planungstypOptions = [];
    benutzerSuchenTokens = {};
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    durchfuehrungsregionParams: RegionSuchenParamDTO = {
        gueltigkeit: StatusEnum.ALL
    };

    constructor(public handler: PlanungSuchenHandlerService, private obliqueHelperService: ObliqueHelperService, private facade: FacadeService) {
        this.planungSuchenForm = this.handler.reactiveForm.planungSuchenForm;
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.planungData.currentValue) {
            this.prepareMask();

            if (this.planungData.planungSuchenParameterDto) {
                this.planungSuchenForm.reset(this.handler.mapToForm(this.planungData.planungSuchenParameterDto));
            } else {
                // the user has navigated from top navigation
                this.setDefaultValuesTopNavi();
            }
        }
    }

    handleDurchfuehrungsRegionClear(event) {
        if (event && event.target && event.target.value === '') {
            this.planungSuchenForm.controls.durchfuehrungsRegion.reset();
        }
    }

    reset() {
        this.facade.fehlermeldungenService.closeMessage();
        this.planungSuchenForm.reset();
        this.setDefaultValuesTopNavi();
    }

    private prepareMask() {
        this.planungstypOptions = this.facade.formUtilsService.mapDropdown(this.planungData.planungstypOptions);
        this.massnahmeartStrukturOptions = this.planungData.massnahmeartStrukturElements.map(element => this.handler.dropdownStrukturMapper(element));
        this.massnahmentypOptions = this.planungData.massnahmenTypes.map(element => this.handler.dropdownMassnahmentypMapper(element));
    }

    private setDefaultValuesTopNavi() {
        // set Planung ab to January, current year
        this.planungSuchenForm.controls.planungAb.setValue(new Date(new Date().getFullYear(), 0, 1));
        const currentStruktur: ElementKategorieDTO = this.planungData.massnahmeartStrukturElements.find(element => element.aktuell);
        this.planungSuchenForm.controls.massnahmeartStruktur.setValue(currentStruktur.elementkategorieId);
        this.planungSuchenForm.controls.planungstyp.setValue(PlanungstypEnum.PRODUKT);
    }
}
