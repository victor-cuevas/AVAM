import { Injectable } from '@angular/core';
import { BeschaeftigungseinheitDTO } from '@app/shared/models/dtos-generated/beschaeftigungseinheitDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Injectable()
export class BewBeschaeftigungseinheitenTableHandlerService {
    constructor(private dbTranslateService: DbTranslateService) {}

    createRow(responseDTO: BeschaeftigungseinheitDTO, index: number) {
        let verfuegbarkeit = '';
        let taetigkeit = '';
        if (responseDTO.zeitplanObject && responseDTO.zeitplanObject.verfuegbarkeitObject) {
            verfuegbarkeit = this.dbTranslateService.translate(responseDTO.zeitplanObject.verfuegbarkeitObject, 'text');
        }
        if (responseDTO.taetigkeitObject) {
            taetigkeit = this.dbTranslateService.translate(responseDTO.taetigkeitObject, 'bezeichnungMa');
        }
        return {
            id: index,
            beschaeftigungseinheitId: responseDTO.beschaeftigungseinheitId,
            titel: this.dbTranslateService.translateWithOrder(responseDTO, 'titel'),
            taetigkeit,
            gueltigVon: responseDTO.gueltigVon ? new Date(responseDTO.gueltigVon) : '',
            gueltigBis: responseDTO.gueltigBis ? new Date(responseDTO.gueltigBis) : '',
            kapazitaetmax: responseDTO.kapazitaetMax,
            verfuegbarkeit,
            beschaeftigungmax: responseDTO.beschaeftigungsgradMax
        };
    }
}
