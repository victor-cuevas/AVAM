import { FormUtilsService } from '@shared/services/forms/form-utils.service';

export class ErwBerechnetBuilder {
    private erwBerechnet: ErwBerechnet;

    constructor() {
        this.erwBerechnet = {
            erwkurztext: null,
            arbkurztext: null,
            gueltigAb: null
        };
    }

    setErwkurztext(erwkurztext: string): void {
        this.erwBerechnet.erwkurztext = erwkurztext;
    }

    setArbkurztext(arbkurztext: string): void {
        this.erwBerechnet.arbkurztext = arbkurztext;
    }

    setGueltigAb(gueltigAb: Date): void {
        this.erwBerechnet.gueltigAb = gueltigAb || '';
    }

    build(): ErwBerechnet {
        return this.erwBerechnet;
    }
}

export class ErwAktuellBuilder {
    private erwAktuell: ErwAktuell;

    constructor(private formUtils: FormUtilsService) {
        this.erwAktuell = {
            erwkurztext: null,
            gueltigAb: null,
            gueltigAbDisplay: null,
            stesErwerbssituationId: null,
            stesId: null,
            ojbVersion: null,
            erwerbssituationAktuellId: null
        };
    }

    setErwkurztext(erwkurztext: string): void {
        this.erwAktuell.erwkurztext = erwkurztext;
    }

    setGueltigAb(gueltigAb: string): void {
        this.erwAktuell.gueltigAb = new Date(gueltigAb);
    }

    setGueltigAbDisplay(gueltigAbDisplay: string): void {
        this.erwAktuell.gueltigAbDisplay = this.formUtils.formatDateNgx(gueltigAbDisplay, `DD.MM.YYYY`);
    }

    setStesErwerbssituationId(stesErwerbssituationId: string): void {
        this.erwAktuell.stesErwerbssituationId = stesErwerbssituationId;
    }

    setStesId(stesId: string): void {
        this.erwAktuell.stesId = stesId;
    }

    setOjbVersion(ojbVersion: string): void {
        this.erwAktuell.ojbVersion = ojbVersion;
    }

    setErwerbssituationAktuellId(erwerbssituationAktuellId: string): void {
        this.erwAktuell.erwerbssituationAktuellId = erwerbssituationAktuellId;
    }

    build(): ErwAktuell {
        return this.erwAktuell;
    }
}

export interface ErwBerechnet {
    erwkurztext: string;
    arbkurztext: string;
    gueltigAb: Date | string;
}

export interface ErwAktuell {
    stesErwerbssituationId: string;
    stesId: string;
    ojbVersion: string;
    erwerbssituationAktuellId: string;
    erwkurztext: string;
    gueltigAb: Date | string;
    gueltigAbDisplay: string;
}
