import { Injectable } from '@angular/core';
// prettier-ignore
import { BenutzerstelleErweiterteDatenReactiveFormsService } from
        '@modules/informationen/components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten-reactive-forms.service';
import { CodeDTO } from '@dtos/codeDTO';
import { FacadeService } from '@shared/services/facade.service';
import { AbstractControl } from '@angular/forms';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { BenutzerstelleObjectDTO } from '@dtos/benutzerstelleObjectDTO';

@Injectable()
export class BenutzerstelleErweiterteDatenHandlerService {
    constructor(public reactiveForms: BenutzerstelleErweiterteDatenReactiveFormsService, private facade: FacadeService) {}

    mapToForm(dto: BenutzerstelleObjectDTO): any {
        return {
            arbeitssprache: dto.arbeitsspracheId,
            kanton: dto.plzObject.kantonsKuerzel,
            leiter: dto.leiter,
            ravAdresseStatistik: dto.ravAdresseStatistik,
            kundenIdPost: dto.kundenIdPost,
            vsaa: dto.vsaamitglied,
            scanStation: dto.scanstation,
            jobRoom: dto.jobroom,
            gueltigAb: this.facade.formUtilsService.parseDate(dto.gueltigAb),
            gueltigBis: this.facade.formUtilsService.parseDate(dto.gueltigBis)
        };
    }

    mapToDto(dto: BenutzerstelleObjectDTO): BenutzerstelleObjectDTO {
        const controls: { [key: string]: AbstractControl } = this.reactiveForms.form.controls;
        return {
            ...dto,
            arbeitsspracheId: controls.arbeitssprache.value,
            leiter: controls.leiter.value,
            ravAdresseStatistik: controls.ravAdresseStatistik.value,
            kundenIdPost: isNaN(+controls.kundenIdPost.value) ? null : controls.kundenIdPost.value,
            vsaamitglied: controls.vsaa.value,
            scanstation: controls.scanStation.value,
            jobroom: controls.jobRoom.value,
            gueltigAb: this.facade.formUtilsService.parseDate(controls.gueltigAb.value),
            gueltigBis: this.facade.formUtilsService.parseDate(controls.gueltigBis.value)
        };
    }
}
