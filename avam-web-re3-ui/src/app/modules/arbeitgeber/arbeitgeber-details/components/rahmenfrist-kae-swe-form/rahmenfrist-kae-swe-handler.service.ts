import { Injectable } from '@angular/core';
import { RahmenfristKaeSweReactiveFormsService } from '@modules/arbeitgeber/arbeitgeber-details/components/rahmenfrist-kae-swe-form/rahmenfrist-kae-swe-reactive-forms.service';
import { RahmenfristKaeSweDetailDTO } from '@dtos/rahmenfristKaeSweDetailDTO';
import { FacadeService } from '@shared/services/facade.service';

@Injectable()
export class RahmenfristKaeSweHandlerService {
    constructor(public reactiveFormsService: RahmenfristKaeSweReactiveFormsService, private facadeService: FacadeService) {}

    mapToForm(dto: RahmenfristKaeSweDetailDTO): any {
        return {
            branche: `${dto.noga.nogaCodeUp} ${this.facadeService.dbTranslateService.translate(dto.noga, 'textlang')}`,
            betriebsabteilung: this.getBetriebsabteilung(dto),
            betriebsabteilungnr: this.getBetriebsabteilungnr(dto),
            anspruch: this.facadeService.dbTranslateService.translate(dto, 'anspruchBezeichnung'),
            rahmenfristnr: dto.rahmenfristNr,
            rfbeginn: this.facadeService.formUtilsService.parseDate(dto.rahmenfristBeginn),
            rfende: this.facadeService.formUtilsService.parseDate(dto.rahmenfristEnde),
            alk: this.getAlk(dto),
            hoechstanspruchKS: dto.hoechstanspruchKS,
            hoechstanspruchKAE85: dto.hoechstanspruchKAE85,
            hoechstanspruchSWE: dto.hoechstanspruchSWE,
            anzahlBezApKS: dto.anzahlBezApKS,
            anzahlBezApKAE85: dto.anzahlBezApKAE85,
            anzahlBezApSWE: dto.anzahlBezApSWE,
            restanspruch: dto.restanspruch,
            sachbearbalkname: dto.ausloeserName,
            sachbearbalkvorname: dto.ausloeserVorname,
            sachbearbalktelefon: this.getTelefon(dto),
            sachbearbalkemail: dto.ausloeserEmail
        };
    }

    private getAlk(dto: RahmenfristKaeSweDetailDTO): { id: number; inputElementOneValue: string; inputElementTwoValue: string } {
        return {
            id: dto.alkId,
            inputElementOneValue: dto.alkNr,
            inputElementTwoValue: this.facadeService.dbTranslateService.translate(dto, 'alkName')
        };
    }

    private getBetriebsabteilungnr(dto: RahmenfristKaeSweDetailDTO): number {
        if (!dto.betriebsabteilungObject || !dto.betriebsabteilungObject.abteilungNr || dto.betriebsabteilungObject.abteilungNr < 1) {
            return null;
        }
        return dto.betriebsabteilungObject.abteilungNr;
    }

    private getBetriebsabteilung(dto: RahmenfristKaeSweDetailDTO): string {
        return dto.betriebsabteilungObject ? dto.betriebsabteilungObject.abteilungName : null;
    }

    private getTelefon(dto: RahmenfristKaeSweDetailDTO): string {
        let tel: string;
        if (dto.ausloeserTelVorwahl) {
            tel = `${dto.ausloeserTelVorwahl} ${dto.ausloeserTelefon}`;
        } else {
            tel = dto.ausloeserTelefon;
        }
        return tel;
    }
}
