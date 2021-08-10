import { Injectable } from '@angular/core';
import { RegelGeKoDTO } from '@dtos/regelGeKoDTO';
import { GeschaeftsregelReactiveFormsService } from '@modules/geko/components/geschaeftsregel-form/geschaeftsregel-reactive-forms.service';

@Injectable()
export class GeschaeftsregelHandlerService {
    constructor(public reactiveForms: GeschaeftsregelReactiveFormsService) {}

    mapToForm(dto: RegelGeKoDTO) {
        return {
            regelId: dto.regelId,
            ojbVersion: dto.ojbVersion,
            geschaeftsbereich: dto.geschaeftsbereichId,
            geschaeftsart: dto.geschaeftsartId,
            sachstandBeginn: dto.sachstandId,
            sachstandEnde: dto.folgeschrittId,
            durchlaufzeit: dto.erinnerungstage,
            ergaenzendeangaben: dto.zusatzangabe
        };
    }

    mapToDTO(): RegelGeKoDTO {
        const formContent = this.reactiveForms.form.value;
        return {
            regelId: formContent.regelId,
            ojbVersion: formContent.ojbVersion,
            geschaeftsbereichId: formContent.geschaeftsbereich,
            geschaeftsartId: formContent.geschaeftsart,
            sachstandId: formContent.sachstandBeginn,
            folgeschrittId: formContent.sachstandEnde,
            erinnerungstage: formContent.durchlaufzeit,
            zusatzangabe: formContent.ergaenzendeangaben
        };
    }
}
