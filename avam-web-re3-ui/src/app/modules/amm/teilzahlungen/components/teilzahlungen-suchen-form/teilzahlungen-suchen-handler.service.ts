import { Injectable } from '@angular/core';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { TeilzahlungenSuchenReactiveFormService } from './teilzahlungen-suchen-reactive-forms.service';
import { TeilzahlungsListeViewDTO } from '@app/shared/models/dtos-generated/teilzahlungsListeViewDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Injectable()
export class TeilzahlungenSuchenHandlerService {
    constructor(private dbTranslateService: DbTranslateService, public reactiveForms: TeilzahlungenSuchenReactiveFormService) {}

    mapDropdown(items: CodeDTO[]) {
        return items.map(item => {
            return {
                codeId: item.codeId,
                value: item.codeId,
                code: item.code,
                labelFr: item.textFr,
                labelIt: item.textIt,
                labelDe: item.textDe
            };
        });
    }

    toggleEnabledInputs(teilzahlungNr: any): boolean {
        let disableInputs = false;
        const controls = this.reactiveForms.teilzahlungenSuchenForm.controls;

        if (teilzahlungNr) {
            disableInputs = true;
            controls.titel.disable();
            controls.anbieter.disable();
            controls.statusTeilzahlung.disable();
            controls.gueltigVon.disable();
            controls.gueltigBis.disable();
        } else {
            disableInputs = false;
            controls.titel.enable();
            controls.anbieter.enable();
            controls.statusTeilzahlung.enable();
            controls.gueltigVon.enable();
            controls.gueltigBis.enable();
        }

        return disableInputs;
    }

    createRow(responseDTO: TeilzahlungsListeViewDTO, index: number) {
        return {
            id: index,
            teilzahlungId: responseDTO.teilzahlungId,
            teilzahlungsnr: responseDTO.teilzahlungNr,
            titel: responseDTO.titel,
            ausfuehrungsdatum: responseDTO.ausfuehrungsdatum ? new Date(responseDTO.ausfuehrungsdatum) : '',
            status: this.dbTranslateService.translate(responseDTO.statusObject, 'text'),
            anbieterId: responseDTO.ammAnbieterId,
            anbieter: responseDTO.anbieterName,
            vorgaenger: responseDTO.vorgaengerObject ? responseDTO.vorgaengerObject.teilzahlungNr : '',
            nachfolger: responseDTO.nachfolgerObject ? responseDTO.nachfolgerObject.teilzahlungNr : ''
        };
    }
}
