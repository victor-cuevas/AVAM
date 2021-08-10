import { CodeDTO } from '@dtos/codeDTO';
import { BenutzerstelleObjectDTO } from '@dtos/benutzerstelleObjectDTO';

export interface BenutzerstelleGrunddaten {
    dto: BenutzerstelleObjectDTO;
    benutzerstelleTypeOptions: CodeDTO[];
}
