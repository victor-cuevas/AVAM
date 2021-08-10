import { FormGroup } from '@angular/forms';
import { StaatDTO } from '@dtos/staatDTO';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';

export interface ZasAbgleichResponse {
    personenNr: string;
    personenstammdaten: FormGroup;
    stesId: number;
    nationalitaetId: number;
    nationalitaet: StaatDTO;
    letzterZASAbgleich: number;
    versichertenNrList: PersonVersichertenNrDTO[];
    ahvAk: string;
}
