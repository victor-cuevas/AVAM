import { StaatDTO } from '@dtos/staatDTO';
import { FormGroup } from '@angular/forms';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';

export interface ZasAbgleichRequest {
    personenNr: string;
    personenstammdaten: FormGroup;
    stesId: number;
    nationalitaetId: number;
    nationalitaet: StaatDTO;
    geschlechtDropdownLables: any[];
    letzterZASAbgleich: string;
    bisherigeVersichertenNr: PersonVersichertenNrDTO[];
}
