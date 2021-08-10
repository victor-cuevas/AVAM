import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class RahmenfristKaeSweReactiveFormsService {
    form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    private createForm(): void {
        this.form = this.formBuilder.group({
            branche: null,
            betriebsabteilung: null,
            betriebsabteilungnr: null,
            anspruch: null,
            rahmenfristnr: null,
            rfbeginn: null,
            rfende: null,
            alk: null,
            hoechstanspruchKS: null,
            hoechstanspruchKAE85: null,
            hoechstanspruchSWE: null,
            anzahlBezApKS: null,
            anzahlBezApKAE85: null,
            anzahlBezApSWE: null,
            restanspruch: null,
            sachbearbalkname: null,
            sachbearbalkvorname: null,
            sachbearbalktelefon: null,
            sachbearbalkemail: null
        });
    }
}
