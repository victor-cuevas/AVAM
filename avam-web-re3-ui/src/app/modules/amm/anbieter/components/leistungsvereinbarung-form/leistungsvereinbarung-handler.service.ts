import { Injectable } from '@angular/core';
import { LeistungsvereinbarungReactiveFormsService } from './leistungsvereinbarung-reactive-forms.service';
import { LeistungsvereinbarungDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { LeistungsvereinbarungData } from './leistungsvereinbarung-form.component';

@Injectable()
export class LeistungsvereinbarungFormHandlerService {
    constructor(public reactiveForms: LeistungsvereinbarungReactiveFormsService, private facade: FacadeService) {}

    mapToForm(lvData: LeistungsvereinbarungData) {
        return lvData.lvDto
            ? {
                  titel: lvData.lvDto.titel,
                  beschreibung: lvData.lvDto.beschreibung,
                  gueltigVon: lvData.lvDto.gueltigVon ? this.facade.formUtilsService.parseDate(lvData.lvDto.gueltigVon) : '',
                  gueltigBis: lvData.lvDto.gueltigBis ? this.facade.formUtilsService.parseDate(lvData.lvDto.gueltigBis) : '',
                  bearbeitungDurch: lvData.lvDto.bearbeitungDurchObject,
                  rahmenvertrag: lvData.lvDto.rahmenvertragObject ? lvData.lvDto.rahmenvertragObject.rahmenvertragNr : null,
                  leistungsvereinbarungNr: lvData.lvDto.leistungsvereinbarungNr ? lvData.lvDto.leistungsvereinbarungNr : '',
                  status: lvData.lvDto.statusObject ? lvData.lvDto.statusObject.codeId : lvData.statusOptions.length > 0 ? lvData.statusOptions[0].codeId : -1,
                  freigabeDurch: lvData.lvDto.freigabeDurchObject,
                  freigabeDatum: lvData.lvDto.freigabeDatum ? this.facade.formUtilsService.parseDate(lvData.lvDto.freigabeDatum) : ''
              }
            : {};
    }

    mapToDTO(lvData: LeistungsvereinbarungData): LeistungsvereinbarungDTO {
        const lvDtoToSave: LeistungsvereinbarungDTO = { ...lvData.lvDto };

        const controls = this.reactiveForms.lvForm.controls;

        lvDtoToSave.titel = controls.titel.value;
        lvDtoToSave.beschreibung = controls.beschreibung.value;
        lvDtoToSave.gueltigVon = this.facade.formUtilsService.parseDate(controls.gueltigVon.value);
        lvDtoToSave.gueltigBis = this.facade.formUtilsService.parseDate(controls.gueltigBis.value);
        lvDtoToSave.bearbeitungDurchObject = controls.bearbeitungDurch['benutzerObject'];

        lvDtoToSave.leistungsvereinbarungNr = controls.leistungsvereinbarungNr.value;
        lvDtoToSave.statusObject = lvData.statusOptions.find(option => option.codeId === +controls.status.value);
        lvDtoToSave.freigabeDurchObject = controls.freigabeDurch['benutzerObject'].benutzerId !== -1 ? controls.freigabeDurch['benutzerObject'] : null;
        lvDtoToSave.freigabeDatum = this.facade.formUtilsService.parseDate(controls.freigabeDatum.value);

        if (controls.rahmenvertrag.value) {
            lvDtoToSave.rahmenvertragObject = { rahmenvertragId: lvData.rahmenvertragId };
        } else {
            lvDtoToSave.rahmenvertragObject = null;
            lvDtoToSave.anbieterObject = { unternehmenId: lvData.anbieterId };
        }

        return lvDtoToSave;
    }
}
