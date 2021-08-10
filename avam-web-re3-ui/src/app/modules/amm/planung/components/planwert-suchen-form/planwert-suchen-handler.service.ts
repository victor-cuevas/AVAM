import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { PlanwertSuchenParameterDTO } from '@app/shared/models/dtos-generated/planwertSuchenParameterDTO';
import { RegionDTO } from '@app/shared/models/dtos-generated/regionDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { PlanwertSuchenReactiveFormService } from './planwert-suchen-reactive-form.service';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';

@Injectable()
export class PlanwertSuchenHandlerService {
    selectedRegion: RegionDTO = { regionDe: ' ', regionFr: ' ', regionIt: ' ' };

    constructor(public reactiveForm: PlanwertSuchenReactiveFormService, private dbTranslateService: DbTranslateService, private formUtils: FormUtilsService) {}

    selectDurchfuehrungsregion(event) {
        this.reactiveForm.planwertSuchenForm.controls.durchfuehrungsRegion.setValue(event.data);
        this.reactiveForm.planwertSuchenForm.controls.durchfuehrungsRegionText.setValue(this.dbTranslateService.translate(event.data, 'region'));
        this.reactiveForm.planwertSuchenForm.markAsDirty();

        this.selectedRegion = event.data;
    }

    mapToDTO(): PlanwertSuchenParameterDTO {
        const formValue = this.reactiveForm.planwertSuchenForm.value;
        const anbieter = this.reactiveForm.planwertSuchenForm.controls.anbieter['unternehmenAutosuggestObject'];

        if (formValue.planwertId) {
            return {
                planwertId: formValue.planwertId
            };
        }

        return {
            planwertId: formValue.planwertId,
            gueltigVon: this.formUtils.parseDate(formValue.gueltigVon),
            gueltigBis: this.formUtils.parseDate(formValue.gueltigBis),
            massnahmentypCodeUp: formValue.massnahmentypCodeUp,
            durchfuehrungsRegion: formValue.durchfuehrungsRegion,
            anbieterId: anbieter ? anbieter.unternehmenId : null,
            anbieterName: anbieter ? anbieter.name1 : null
        };
    }

    mapToForm(dto: PlanwertSuchenParameterDTO, fromState = false): any {
        return {
            planwertId: dto.planwertId,
            gueltigVon: fromState && dto.gueltigVon ? new Date(dto.gueltigVon) : this.formUtils.parseDate(dto.gueltigVon),
            gueltigBis: fromState && dto.gueltigBis ? new Date(dto.gueltigBis) : this.formUtils.parseDate(dto.gueltigBis),
            massnahmentypCodeUp: dto.massnahmentypCodeUp,
            durchfuehrungsRegion: dto.durchfuehrungsRegion,
            durchfuehrungsRegionText: dto.durchfuehrungsRegion ? this.dbTranslateService.translate(dto.durchfuehrungsRegion, 'region') : null,
            anbieter: dto.anbieterId && dto.anbieterName ? { name1: dto.anbieterName, unternehmenId: dto.anbieterId } : null
        };
    }

    customPropertyMapper = (element: StrukturElementDTO) => {
        return {
            value: element.elementCodeUp,
            labelDe: element.beschreibungDe,
            labelFr: element.beschreibungFr,
            labelIt: element.beschreibungIt
        };
    };
}
