import { BenutzerstelleResultDTO } from '@app/shared/models/dtos-generated/benutzerstelleResultDTO';

export interface BenutzerstelleAuswaehlenTabelleInterface {
    benutzerstelle?: string;
    benutzerstelleObj?: BenutzerstelleResultDTO;
    id?: string;
    ort?: string;
    strassenr?: string;
    telefon?: string;
    typ?: string;
    checked?: boolean;
}
