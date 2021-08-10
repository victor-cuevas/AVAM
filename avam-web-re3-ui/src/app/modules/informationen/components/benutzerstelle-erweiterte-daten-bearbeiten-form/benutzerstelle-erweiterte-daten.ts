import { CodeDTO } from '@dtos/codeDTO';
import { BenutzerstelleObjectDTO } from '@dtos/benutzerstelleObjectDTO';

export interface BenutzerstelleErweiterteDaten {
    dto: BenutzerstelleObjectDTO;
    spracheOptions: CodeDTO[];
}
