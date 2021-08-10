import { Injectable } from '@angular/core';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { InfotagMassnahmeSuchenParamDTO } from '@app/shared/models/dtos-generated/infotagMassnahmeSuchenParamDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { TranslateService } from '@ngx-translate/core';
import { InfotagMassnahmeSuchenReactiveFormsService } from './infotag-massnahme-suchen-reactive-form.service';

@Injectable()
export class InfotagMassnahmeSuchenHandlerService {
    constructor(public reactiveForm: InfotagMassnahmeSuchenReactiveFormsService, private translate: TranslateService, private facade: FacadeService) {}

    customPropertyMapper = (element: ElementKategorieDTO) => {
        return {
            value: element.elementkategorieId,
            labelDe: `${element.beschreibungDe}  (${element.organisation})`,
            labelFr: `${element.beschreibungFr}  (${element.organisation})`,
            labelIt: `${element.beschreibungIt}  (${element.organisation})`,
            isSelected: element.aktuell
        };
    };

    getDefaultData(dropdownOption) {
        const currentYear = new Date().getFullYear();
        return {
            gueltigVon: new Date(currentYear, 0, 1),
            gueltigBis: new Date(currentYear, 11, 31),
            strukturCategories: dropdownOption && dropdownOption.value ? dropdownOption.value : null
        };
    }

    mapToDTO() {
        if (this.reactiveForm.massnahmeSuchenForm.controls.massnahmenNr.value) {
            return {
                massnahmeId: this.reactiveForm.massnahmeSuchenForm.controls.massnahmenNr.value
            };
        }

        const controls = this.reactiveForm.massnahmeSuchenForm.controls;
        const unternehmenObject = this.reactiveForm.massnahmeSuchenForm.controls.anbieter['unternehmenAutosuggestObject'];
        const anbieterName = unternehmenObject ? unternehmenObject.name1 : null;
        const id = unternehmenObject ? unternehmenObject.unternehmenId : null;
        const currentLang = this.translate.currentLang;

        return {
            elementkategorieId: controls.strukturCategories.value,
            massnahmeId: controls.massnahmenNr.value,
            titel: controls.titel.value,
            anbieter: {
                name1: anbieterName,
                unternehmenId: id
            },
            benutzer: controls.massnahmenverantwortung['benutzerObject'],
            gueltigVon: this.facade.formUtilsService.parseDate(controls.gueltigVon.value),
            gueltigBis: this.facade.formUtilsService.parseDate(controls.gueltigBis.value),
            benutzersprache: currentLang
        };
    }

    mapStoreData(filterValue) {
        const controls = this.reactiveForm.massnahmeSuchenForm.controls;
        return {
            elementkategorieId: controls.strukturCategories.value,
            massnahmeId: controls.massnahmenNr.value,
            titel: controls.titel.value,
            anbieter: controls.anbieter.value ? controls.anbieter['unternehmenAutosuggestObject'] : null,
            gueltigVon: this.facade.formUtilsService.parseDate(controls.gueltigVon.value),
            gueltigBis: this.facade.formUtilsService.parseDate(controls.gueltigBis.value),
            benutzer: controls.massnahmenverantwortung['benutzerObject'],
            filterValue
        };
    }

    mapToForm(data) {
        return {
            strukturCategories: data.elementkategorieId,
            massnahmenNr: data.massnahmeId,
            titel: data.titel,
            anbieter: data.anbieter,
            gueltigVon: data.gueltigVon ? new Date(data.gueltigVon) : null,
            gueltigBis: data.gueltigBis ? new Date(data.gueltigBis) : null,
            massnahmenverantwortung:
                data.benutzer.benutzerDetailId !== -1
                    ? data.benutzer
                    : data.benutzer.benutzerLogin
                    ? { benutzerId: -1, benutzerDetailId: -1, benutzerLogin: data.benutzer.benutzerLogin, nachname: '', vorname: '' }
                    : null
        };
    }
}
