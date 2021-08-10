export interface StesLetzteAktualisierungDTO {
	name: string;
	vorname: string;
	benutzerLogin: string;
	datumLetzeAktualisierung: string;
}

// Dieses Object bildet "ValueObjectAVAM" oder "getLetzteAktualisierung(Principal principal, ValueObjectAVAM vo)" von backend. 
//Es soll umbenant werden und auf backend DTO angepasst werden. Benutzerstelle fehlt in den backend.
