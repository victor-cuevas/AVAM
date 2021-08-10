import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { InfotagDurchfuehrungseinheitSuchenParamDTO } from '@app/shared/models/dtos-generated/infotagDurchfuehrungseinheitSuchenParamDTO';
import { TranslateService } from '@ngx-translate/core';
import { InfotagBewirtschaftungSuchenReactiveFormsService } from './infotag-bewirtschaftung-suchen-reactive-form.service';

@Injectable()
export class InfotagBewirtschaftungSuchenHandlerService {
    constructor(public reactiveForm: InfotagBewirtschaftungSuchenReactiveFormsService, private translate: TranslateService, private formUtils: FormUtilsService) {}

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
            durchfuehrungVon: new Date(currentYear, 0, 1),
            durchfuehrungBis: new Date(currentYear, 11, 31),
            strukturCategories: dropdownOption && dropdownOption.value ? dropdownOption.value : null
        };
    }

    mapToDto(): InfotagDurchfuehrungseinheitSuchenParamDTO {
        const controls = this.reactiveForm.infotagSuchenForm.controls;
        const currentLang = this.translate.currentLang;
        const unternehmenObject = controls.anbieter['unternehmenAutosuggestObject'];
        const plzObject = controls.plz['plzWohnAdresseObject'];

        if (controls.durchfuehrungsNr.value) {
            return {
                durchfuehrungseinheitId: controls.durchfuehrungsNr.value,
                language: currentLang
            };
        }

        return {
            elementkategorieId: controls.strukturCategories.value,
            durchfuehrungseinheitId: controls.durchfuehrungsNr.value,
            titel: controls.titel.value,
            anbieterParam:
                unternehmenObject && unternehmenObject.unternehmenId !== -1
                    ? {
                          id: unternehmenObject.unternehmenId,
                          bezeichnung: unternehmenObject.name1
                      }
                    : null,
            zeitraumVon: this.formUtils.parseDate(controls.durchfuehrungVon.value),
            zeitraumBis: this.formUtils.parseDate(controls.durchfuehrungBis.value),
            plzObject: plzObject
                ? {
                      plzId: plzObject.plzId,
                      postleitzahl: plzObject.postleitzahl,
                      ortDe: plzObject.ortDe
                  }
                : null,
            language: currentLang
        };
    }

    mapStorageDataToDto(stateData): InfotagDurchfuehrungseinheitSuchenParamDTO {
        const currentLang = this.translate.currentLang;

        if (stateData.durchfuehrungsNr) {
            return {
                durchfuehrungseinheitId: stateData.durchfuehrungsNr,
                language: currentLang
            };
        }

        return {
            elementkategorieId: stateData.elementkategorieId,
            durchfuehrungseinheitId: stateData.durchfuehrungseinheitId,
            titel: stateData.titel,
            anbieterParam: stateData.anbieterParam
                ? {
                      id: stateData.anbieterParam.unternehmenId,
                      bezeichnung: stateData.anbieterParam.name1
                  }
                : null,
            zeitraumVon: stateData.zeitraumVon,
            zeitraumBis: stateData.zeitraumBis,
            plzObject: stateData.plzObject
                ? {
                      plzId: stateData.plzObject.plzId,
                      postleitzahl: stateData.plzObject.postleitzahl,
                      ortDe: stateData.plzObject.ortDe
                  }
                : null,
            language: currentLang
        };
    }

    mapDataToStorage(): InfotagDurchfuehrungseinheitSuchenParamDTO {
        const controls = this.reactiveForm.infotagSuchenForm.controls;
        return {
            elementkategorieId: controls.strukturCategories.value,
            durchfuehrungseinheitId: controls.durchfuehrungsNr.value,
            titel: controls.titel.value,
            anbieterParam: controls.anbieter.value ? controls.anbieter['unternehmenAutosuggestObject'] : null,
            zeitraumVon: controls.durchfuehrungVon.value,
            zeitraumBis: controls.durchfuehrungBis.value,
            plzObject: controls.plz['plzWohnAdresseObject'] || undefined
        };
    }

    mapStoreDataToForm(data: InfotagDurchfuehrungseinheitSuchenParamDTO) {
        return {
            strukturCategories: data.elementkategorieId,
            durchfuehrungsNr: data.durchfuehrungseinheitId,
            titel: data.titel,
            anbieter: data.anbieterParam,
            durchfuehrungVon: data.zeitraumVon ? new Date(data.zeitraumVon) : null,
            durchfuehrungBis: data.zeitraumBis ? new Date(data.zeitraumBis) : null,
            plz: {
                postleitzahl: data.plzObject ? data.plzObject.postleitzahl : null,
                ort: data.plzObject ? data.plzObject.ortDe : null
            }
        };
    }
}
