import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { BenutzerDetailDTO } from '@app/shared/models/dtos-generated/benutzerDetailDTO';
import { StesAusgangslageDetailsDTO } from '@app/shared/models/dtos-generated/stesAusgangslageDetailsDTO';
import { StesBeurteilungselementDTO } from '@app/shared/models/dtos-generated/stesBeurteilungselementDTO';
import { StesRahmenfristDTO } from '@app/shared/models/dtos-generated/stesRahmenfristDTO';
import { AusgangsLageFormData } from './ausgangslage-form.model';
import { AusgangslageReactiveFormsService } from './ausgangslage-reactive-forms.service';
import * as moment from 'moment';

@Injectable()
export class AusgangslageHandlerService {
    constructor(public reactiveForms: AusgangslageReactiveFormsService, private formUtils: FormUtilsService) {}

    mapToDTO(formData: AusgangsLageFormData): StesAusgangslageDetailsDTO {
        const controls = this.reactiveForms.ausgangslageForm.controls;

        return {
            ...formData.ausgangslageDetailsDTO,
            stesID: formData.stesId,
            ausgangslageGueltigAb: this.formUtils.parseDate(controls.gueltigAb.value),
            erfBenDetailObject: controls.bearbeitung['benutzerObject'] ? controls.bearbeitung['benutzerObject'] : controls.bearbeitung.value,
            vermittelbarkeitID: controls.vermittelbarkeit.value,
            qualifikationsbedarfID: controls.qualifizierungsbedarf.value,
            beurteilungselementObjects: this.mapBeurteilungselementeToDTO(formData, controls.situationsbeurteilungRows as FormArray)
        };
    }

    mapBeurteilungselementeToDTO(formData: AusgangsLageFormData, formArray: FormArray): StesBeurteilungselementDTO[] {
        return formArray.value
            .filter(row => row.beurteilungskriterium !== null && row.priority !== null)
            .map(row => {
                const original =
                    row.stesBeurteilungselementID !== null
                        ? formData.ausgangslageDetailsDTO.beurteilungselementObjects.find(el => el.stesBeurteilungselementID === row.stesBeurteilungselementID)
                        : null;
                return {
                    ...(original ? original : { ausgangslageID: formData.ausgangslageDetailsDTO ? formData.ausgangslageDetailsDTO.stesAusgangslageID : null }),
                    handlungsfeldObject: row.beurteilungskriterium,
                    handlungsbedarfID: +row.handlungsbedarf,
                    prioritaetID: +row.priority,
                    handlungsfeldID: row.beurteilungskriterium.codeId
                };
            });
    }

    mapDefaultValues(vermittelbarkeitDefault: string, benuDetail: BenutzerDetailDTO) {
        return {
            gueltigAb: new Date(),
            vermittelbarkeit: vermittelbarkeitDefault,
            bearbeitung: benuDetail
        };
    }

    mapToForm(formData: AusgangsLageFormData) {
        return {
            gueltigAb: this.formUtils.parseDate(formData.ausgangslageDetailsDTO.ausgangslageGueltigAb),
            vermittelbarkeit: formData.ausgangslageDetailsDTO.vermittelbarkeitID,
            qualifizierungsbedarf: formData.ausgangslageDetailsDTO.qualifikationsbedarfID,
            bearbeitung: formData.ausgangslageDetailsDTO.erfBenDetailObject
        };
    }

    calculateResttaggelder(rahmenfristDTO: StesRahmenfristDTO): number {
        const restTaggelder = rahmenfristDTO.raHoechstanspruch - rahmenfristDTO.raAbgerechneteTGGTotal;

        let restTageBisEndeRF = rahmenfristDTO.raHoechstanspruch;
        if (rahmenfristDTO.raDatumRahmenfristBis) {
            const dayDiff = moment(rahmenfristDTO.raDatumRahmenfristBis).diff(moment(), 'days') + 1;
            restTageBisEndeRF = Math.round(dayDiff * (5 / 7));
        }

        // Wenn Rahmenfrist abläuft, bevor die restlichen Taggelder aufgebraucht sind,
        // dürfen nur die restlichen Tage bis zum Ablauf der RF angezeigt werden.
        const result = restTageBisEndeRF < restTaggelder ? restTageBisEndeRF : restTaggelder;
        return result < 0 ? 0 : result;
    }
}
