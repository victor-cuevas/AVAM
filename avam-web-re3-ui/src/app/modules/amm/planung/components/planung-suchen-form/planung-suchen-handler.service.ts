import { PlanungSuchenParameterDTO } from '@dtos/planungSuchenParameterDTO';
import { StrukturElementDTO } from '@dtos/strukturElementDTO';
import { ElementKategorieDTO } from '@dtos/elementKategorieDTO';
import { RegionDTO } from '@dtos/regionDTO';
import { FacadeService } from '@shared/services/facade.service';
import { Injectable } from '@angular/core';
import { PlanungSuchenReactiveFormService } from './planung-suchen-reactive-forms.service';

@Injectable()
export class PlanungSuchenHandlerService {
    selectedRegion: RegionDTO = { regionDe: ' ', regionFr: ' ', regionIt: ' ' };

    constructor(public reactiveForm: PlanungSuchenReactiveFormService, private facade: FacadeService) {}

    mapToForm(dto: PlanungSuchenParameterDTO) {
        return {
            planungAb: dto.planungAb ? new Date(dto.planungAb) : '',
            massnahmeartStruktur: dto.elementKategorie.elementkategorieId,
            massnahmetyp: dto.massnahmentypStrukturelement ? dto.massnahmentypStrukturelement.elementCodeUp : null,
            produktmassnahmenverantwortung: dto.verantwortlicherDetailObject,
            planungstyp: dto.planungsModus,
            durchfuehrungsRegion: dto.durchfuehrungsRegion,
            durchfuehrungsRegionText: dto.durchfuehrungsRegion ? this.facade.dbTranslateService.translate(dto.durchfuehrungsRegion, 'region') : null,
            anbieter: dto.anbieterId && dto.anbieterName ? { name1: dto.anbieterName, unternehmenId: dto.anbieterId } : null
        };
    }

    mapToDTO(planungData: any): PlanungSuchenParameterDTO {
        const controls = this.reactiveForm.planungSuchenForm.controls;
        const anbieter = controls.anbieter['unternehmenAutosuggestObject'];
        const massnahmeartStrukturElement = planungData.massnahmeartStrukturElements.find(element => element.elementkategorieId === +controls.massnahmeartStruktur.value);
        const massnahmenTyp = planungData.massnahmenTypes.find(element => element.elementCode === controls.massnahmetyp.value);

        return {
            uebersichtAktiv: false, // change conditionally
            planungsModus: controls.planungstyp.value,
            planungAb: this.facade.formUtilsService.parseDate(controls.planungAb.value),
            massnahmentypStrukturelement: massnahmenTyp,
            verantwortlicherDetailObject: controls.produktmassnahmenverantwortung.value ? controls.produktmassnahmenverantwortung['benutzerObject'] : null,
            anbieterId: anbieter ? (anbieter.unternehmenId !== -1 ? anbieter.unternehmenId : null) : null,
            durchfuehrungsRegion: controls.durchfuehrungsRegion.value,
            elementKategorie: massnahmeartStrukturElement
        };
    }

    selectDurchfuehrungsregion(event) {
        this.reactiveForm.planungSuchenForm.controls.durchfuehrungsRegion.setValue(event.data);
        this.reactiveForm.planungSuchenForm.controls.durchfuehrungsRegionText.setValue(this.facade.dbTranslateService.translate(event.data, 'region'));
        this.reactiveForm.planungSuchenForm.markAsDirty();

        this.selectedRegion = event.data;
    }

    dropdownStrukturMapper(element: ElementKategorieDTO) {
        return {
            value: element.elementkategorieId,
            labelFr: element.beschreibungFr,
            labelIt: element.beschreibungIt,
            labelDe: element.beschreibungDe,
            fullData: element
        };
    }

    dropdownMassnahmentypMapper(element: StrukturElementDTO) {
        return {
            value: element.elementCodeUp,
            labelDe: element.beschreibungDe,
            labelFr: element.beschreibungFr,
            labelIt: element.beschreibungIt
        };
    }
}
