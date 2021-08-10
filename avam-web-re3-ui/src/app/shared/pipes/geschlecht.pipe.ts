import { Pipe, PipeTransform } from '@angular/core';
import { GeschlechtPrefixEnum } from '../enums/geschlecht-prefix.enum';

@Pipe({ name: 'geschlecht' })
export class GeschlechtPipe implements PipeTransform {
    transform(propertyPrefix: string, geschlecht: string): string {
        return geschlecht === 'F' ? propertyPrefix + GeschlechtPrefixEnum.GESCHLECHT_FEMALE : propertyPrefix + GeschlechtPrefixEnum.GESCHLECHT_MALE;
    }
}
