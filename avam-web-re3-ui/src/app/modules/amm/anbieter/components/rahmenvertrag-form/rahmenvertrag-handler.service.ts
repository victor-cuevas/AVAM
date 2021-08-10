import { Injectable } from '@angular/core';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { JaNeinCodeEnum } from '@app/shared/enums/domain-code/amm-ja-nein-code.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { RahmenvertragDTO } from '@app/shared/models/dtos-generated/rahmenvertragDTO';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { RahmenvertragData } from './rahmenvertrag-form.component';
import { RahmenvertragReactiveFormsService } from './rahmenvertrag-reactive-forms.service';

@Injectable()
export class RahmenvertragFormHandlerService {
    constructor(private reactiveForms: RahmenvertragReactiveFormsService, private facade: FacadeService) {}

    mapMultiselect(items: StrukturElementDTO[]) {
        return items.map(item => {
            return {
                id: item.strukturelementId,
                textDe: item.beschreibungDe,
                textIt: item.beschreibungIt,
                textFr: item.beschreibungFr,
                value: false
            };
        });
    }

    mapDefaultData(pendentOption: number) {
        return {
            gueltigDropdown: JaNeinCodeEnum.JA,
            status: pendentOption
        };
    }

    mapToForm(data: RahmenvertragDTO, massnhamentypMultiselectOptions: CoreMultiselectInterface[]) {
        return {
            titel: data.titel,
            bemerkung: data.beschreibung,
            gueltigDropdown: data.gueltigB ? 1 : 0,
            gueltigVon: this.facade.formUtilsService.parseDate(data.gueltigVon),
            gueltigBis: this.facade.formUtilsService.parseDate(data.gueltigBis),
            massnahmentyp: this.setFunktionMultiselectOptions(massnhamentypMultiselectOptions, data.strukturelementList).slice(),
            bearbeitungDurch: data.bearbeitungDurch,
            rahmenvertragNr: data.rahmenvertragNr,
            status: data.statusObject ? data.statusObject.codeId : null,
            freigabeDurch: data.freigabeDurch,
            freigabedatum: this.facade.formUtilsService.parseDate(data.freigabeDatum)
        };
    }

    setFunktionMultiselectOptions(massnahmentypList: CoreMultiselectInterface[], massnahmentypenFromDB: any[]): CoreMultiselectInterface[] {
        massnahmentypList.forEach(element => {
            element.value = massnahmentypenFromDB.some(el => el.strukturelementId === element.id || el.codeId === element.id);
        });

        return massnahmentypList;
    }

    mapToDTO(unternehmenId: number, rahmenvertragData: RahmenvertragData): RahmenvertragDTO {
        const controls = this.reactiveForms.rahmenvertragForm.controls;
        const gueltigNumber = +controls.gueltigDropdown.value;

        return {
            ...rahmenvertragData.rahmenvertragDto,
            anbieterObject: {
                unternehmenId: +unternehmenId,
                schlagworte: []
            },
            titel: controls.titel.value ? controls.titel.value : '',
            beschreibung: controls.bemerkung.value ? controls.bemerkung.value : '',
            gueltigB: !!gueltigNumber,
            gueltigVon: this.facade.formUtilsService.parseDate(controls.gueltigVon.value),
            gueltigBis: this.facade.formUtilsService.parseDate(controls.gueltigBis.value),
            strukturelementList: this.setMassnahmentypList(rahmenvertragData.massnahmeOptions, controls.massnahmentyp.value),
            bearbeitungDurch: controls.bearbeitungDurch.value ? controls.bearbeitungDurch['benutzerObject'] : null,
            rahmenvertragNr: controls.rahmenvertragNr.value,
            statusObject: rahmenvertragData.statusOptions.find(option => option.codeId === +controls.status.value) as CodeDTO,
            freigabeDurch: controls.freigabeDurch.value ? controls.freigabeDurch['benutzerObject'] : null
        };
    }

    setMassnahmentypList(massnahmentypInitialCodeList: StrukturElementDTO[], selectedMassnahmentyp: CoreMultiselectInterface[]) {
        return massnahmentypInitialCodeList.filter(initEl => selectedMassnahmentyp.some(selEl => selEl.value && Number(selEl.id) === initEl.strukturelementId));
    }
}
