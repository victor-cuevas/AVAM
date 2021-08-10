import { PipeTransform, Pipe } from '@angular/core';
import { AbrechnungBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungBearbeitenParameterDTO';

@Pipe({ name: 'fieldEnablePipe' })
export class FieldEnablePipe implements PipeTransform {
    constructor() {}

    transform(fields: AbrechnungBearbeitenParameterDTO.EnabledFieldsEnum[], field: AbrechnungBearbeitenParameterDTO.EnabledFieldsEnum): boolean {
        if (fields) {
            return fields.some(fld => fld === field);
        }

        return false;
    }
}
