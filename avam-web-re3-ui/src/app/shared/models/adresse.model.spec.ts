import {Adresse} from "./adresse.model";

describe('Adresse', () => {
    let adresse: Adresse;

	it('should create', () => {
		adresse = {
			strasse: '',
			hausnummer: '',
			plz: '',
			ort: '',
		}

        expect(adresse).toEqual({ "hausnummer": "", "ort": "", "plz": "", "strasse": "" });
    });
});
