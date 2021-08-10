import { Injectable } from '@angular/core';
import { CallbackDTO } from '@dtos/callbackDTO';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { AmmMassnahmenCode } from '@shared/enums/domain-code/amm-massnahmen-code.enum';
import { buildStesPath } from '@shared/services/build-route-path.function';
import { Router } from '@angular/router';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';

@Injectable({
    providedIn: 'root'
})
export class GekoMeldungCallbackResolverService {
    private urlResolveMapper: Map<string, any>;

    constructor(private router: Router) {
        this.urlResolveMapper = new Map();
        this.addAmmBimBemEntscheid();
        this.addIndividuellAmmBimBemEntscheid();
        this.addSpezialEntscheid();
        this.addArbeitsvermittlungBearbeiten();
        this.addFachberatungBearbeiten();
        this.addPersonalienBearbeiten();
        this.addVermittlungfaehigkeitEntscheidBearbeiten();
        this.addKontaktpersonBearbeitenResolver();
        this.addStellenangeboteResolver();
        this.addStellenvermittlungResolver();
        this.addAbrechnungResolver();
        this.addLeistungsvereinbarungResolver();
        this.addRahmenvertragResolver();
        this.addTeilzahlungResolver();
        this.addKurseResolver();
    }

    public resolve(dto: CallbackDTO, geschaeftsbereichCode?: GekobereichCodeEnum): NavigationDto {
        const resolve: any = this.urlResolveMapper.get(dto.geschaeftsartCode);
        return resolve ? (geschaeftsbereichCode ? resolve(dto, geschaeftsbereichCode) : resolve(dto)) : null;
    }

    private addAbrechnungResolver(): void {
        this.urlResolveMapper.set('A2', (dto: CallbackDTO) => {
            const anbieterId = this.getAnbieterId(dto);
            const abrechnungId = this.getAbrechnungId(dto);
            return {
                commands: [`amm/anbieter/${anbieterId}/abrechnungen/bearbeiten`],
                extras: { queryParams: { abrechnungId } }
            };
        });
    }

    private addLeistungsvereinbarungResolver(): void {
        this.urlResolveMapper.set('A3', (dto: CallbackDTO) => {
            const anbieterId = this.getAnbieterId(dto);
            const lvId = this.getLvId(dto);
            return {
                commands: [`amm/anbieter/${anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`],
                extras: { queryParams: { lvId } }
            };
        });
    }

    private addRahmenvertragResolver(): void {
        this.urlResolveMapper.set('A4', (dto: CallbackDTO) => {
            const anbieterId = this.getAnbieterId(dto);
            const rahmenvertragId = this.getRahmenvertragId(dto);
            return {
                commands: [`amm/anbieter/${anbieterId}/rahmenvertraege/bearbeiten`],
                extras: { queryParams: { rahmenvertragId } }
            };
        });
    }

    private addTeilzahlungResolver(): void {
        this.urlResolveMapper.set('A5', (dto: CallbackDTO) => {
            const anbieterId = this.getAnbieterId(dto);
            const teilzahlungId = this.getTeilzahlungId(dto);
            return {
                commands: [`amm/anbieter/${anbieterId}/teilzahlungen/bearbeiten`],
                extras: { queryParams: { teilzahlungId } }
            };
        });
    }

    private addKurseResolver(): void {
        this.urlResolveMapper.set('M2', (dto: CallbackDTO) => {
            const produktId = this.getProduktId(dto);
            const dfeId = this.getDfeId(dto);
            const massnahmeId = this.getMassnahmeId(dto);
            if (produktId && dfeId && massnahmeId) {
                return {
                    commands: [`amm/bewirtschaftung/produkt/${produktId}/massnahmen/massnahme/kurse/kurs/grunddaten`],
                    extras: { queryParams: { dfeId, massnahmeId } }
                };
            } else {
                return null;
            }
        });
    }

    private addStellenangeboteResolver(): void {
        this.urlResolveMapper.set('G5', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const osteId = this.getOsteId(dto);
            const zuweisungId = this.getZuweisungId(dto);
            if (zuweisungId) {
                // vermittlung bearbeiten
                return {
                    commands: [`/arbeitgeber/details/${unternehmenId}/stellenangebote/stellenangebot/vermittlungen/bearbeiten`],
                    extras: { queryParams: { osteId, zuweisungId } }
                };
            }
            if (osteId) {
                // bewirtschaffung bearbeiten
                return {
                    commands: [`/arbeitgeber/details/${unternehmenId}/stellenangebote/stellenangebot/bewirtschaftung`],
                    extras: { queryParams: { osteId } }
                };
            }
            // unternehmen bearbeiten
            return {
                commands: [`/arbeitgeber/details/${unternehmenId}/adressdaten`]
            };
        });
    }

    private addStellenvermittlungResolver(): void {
        this.urlResolveMapper.set('G6', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const osteId = this.getOsteId(dto);
            const zuweisungId = this.getZuweisungId(dto);
            return {
                commands: [`/arbeitgeber/details/${unternehmenId}/stellenangebote/stellenangebot/vermittlungen/bearbeiten`],
                extras: { queryParams: { osteId, zuweisungId } }
            };
        });
    }

    private addKontaktpersonBearbeitenResolver(): void {
        this.urlResolveMapper.set('AGF2', (dto: CallbackDTO, geschaeftsbereichCode?: GekobereichCodeEnum) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const kontaktpersonId = this.getKontaktpersonId(dto);
            if (geschaeftsbereichCode === GekobereichCodeEnum.GESCHAEFTSBEREICH_GEKO || geschaeftsbereichCode === GekobereichCodeEnum.GESCHAEFTSBEREICH_ARBEITGEBER) {
                // called from geko meldungen search or arbeitgeber meldungen -
                // navigate to or remain in the arbeitgeber context
                return {
                    commands: [`/arbeitgeber/details/${unternehmenId}/kontaktpersonen/bearbeiten`],
                    extras: { queryParams: { kontaktpersonId } }
                };
            } else if (geschaeftsbereichCode === GekobereichCodeEnum.GESCHAEFTSBEREICH_FACHBERATUNG) {
                // called from fachberatung meldungen - remain in the fachberatung context
                return {
                    commands: [`/stes/fachberatung/${unternehmenId}/kontaktpersonen/bearbeiten`],
                    extras: { queryParams: { kontaktpersonId } }
                };
            } else if (geschaeftsbereichCode === GekobereichCodeEnum.GESCHAEFTSBEREICH_ANBIETER) {
                // called from anbieter meldungen - remain in the anbieter context
                return {
                    commands: [`/amm/anbieter/${unternehmenId}/kontaktpersonen/bearbeiten`],
                    extras: { queryParams: { kontaktpersonId } }
                };
            }
            return null;
        });
    }

    private addVermittlungfaehigkeitEntscheidBearbeiten(): void {
        this.urlResolveMapper.set('S21', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const sachverhaltId = this.getSachverhaltId(dto);
            const entscheidId = this.getEntscheidId(dto);
            return {
                commands: [buildStesPath(stesId, `vermittlungsfaehigkeit/entscheid-bearbeiten`)],
                extras: { queryParams: { sachverhaltId, entscheidId } }
            };
        });
    }

    private addPersonalienBearbeiten(): void {
        ['S1', 'S25'].forEach(n => {
            this.urlResolveMapper.set(n, (dto: CallbackDTO) => {
                const stesId = this.getStesId(dto);
                return { commands: [buildStesPath(stesId, `personalien`)] };
            });
        });
    }

    private addFachberatungBearbeiten(): void {
        this.urlResolveMapper.set('S20', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const fachberatungId = this.getFachberatungId(dto);
            return {
                commands: [buildStesPath(stesId, `fachberatungen/bearbeiten`)],
                extras: { queryParams: { fachberatungId } }
            };
        });
    }

    private addArbeitsvermittlungBearbeiten(): void {
        this.urlResolveMapper.set('S19', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const zuweisungId = this.getZuweisungId(dto);
            return {
                commands: [buildStesPath(stesId, `arbeitsvermittlungen/vermittlung-bearbeiten`)],
                extras: { queryParams: { zuweisungId } }
            };
        });
    }

    private addSpezialEntscheid(): void {
        ['S4', 'S9', 'S11', 'S15'].forEach(n => {
            this.urlResolveMapper.set(n, (dto: CallbackDTO) => {
                const stesId = this.getStesId(dto);
                const type = this.getSpezialType(dto.geschaeftsartCode);
                const gfId = this.getGfId(dto);
                const entscheidId = this.getEntscheidId(dto);
                return {
                    commands: [buildStesPath(stesId, `amm/uebersicht/${type}/speziell-entscheid`)],
                    extras: { queryParams: { gfId, entscheidId } }
                };
            });
        });
    }

    private addAmmBimBemEntscheid(): void {
        ['S7', 'S13', 'S14', 'S16', 'S18', 'S23'].forEach(n => {
            this.urlResolveMapper.set(n, (dto: CallbackDTO) => this.createBimBemEntscheidNavigationDTO(dto, this.getType(dto.geschaeftsartCode)));
        });
    }

    private addIndividuellAmmBimBemEntscheid(): void {
        ['S3', 'S6', 'S12', 'S24'].forEach(n => {
            this.urlResolveMapper.set(n, (dto: CallbackDTO) => this.createBimBemEntscheidNavigationDTO(dto, this.getTypeIndividuell(dto.geschaeftsartCode)));
        });
    }

    private createBimBemEntscheidNavigationDTO(dto: CallbackDTO, type: string): NavigationDto {
        const stesId = this.getStesId(dto);
        const gfId = this.getGfId(dto);
        const entscheidId = this.getEntscheidId(dto);
        const navigationDTO: NavigationDto = {
            commands: [buildStesPath(stesId, `amm/uebersicht/${type}/bim-bem-entscheid`)],
            extras: { queryParams: { gfId } }
        };
        if (entscheidId) {
            navigationDTO.extras.queryParams['entscheidId'] = entscheidId;
        }
        return navigationDTO;
    }

    private getStesId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'stesId');
    }

    private getGfId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'gfId');
    }

    private getEntscheidId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'entscheidId');
    }

    private getZuweisungId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'zuweisungId');
    }

    private getFachberatungId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'fachberatungId');
    }

    private getSachverhaltId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'sachverhaltId');
    }

    private getKontaktpersonId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'kontaktpersonId');
    }

    private getUnternehmenId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'unternehmenId');
    }

    private getOsteId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'osteId');
    }

    private getAnbieterId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'anbieterId');
    }

    private getAbrechnungId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'abrechnungId');
    }

    private getLvId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'lvId');
    }

    private getRahmenvertragId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'rahmenvertragId');
    }

    private getTeilzahlungId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'teilzahlungId');
    }

    private getProduktId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'produktId');
    }

    private getDfeId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'dfeId');
    }

    private getMassnahmeId(dto: CallbackDTO) {
        return this.getParamValue(dto, 'massnahmeId');
    }

    private getParamValue(callback: CallbackDTO, key: string): string {
        if (key && callback && callback.parameters) {
            const value = callback.parameters[key];
            return value ? value : '';
        }
        return '';
    }

    private getSpezialType(geschaeftsartCode: string): string {
        switch (geschaeftsartCode) {
            case 'S4':
                return AmmMassnahmenCode.AZ;
            case 'S9':
                return AmmMassnahmenCode.EAZ;
            case 'S11':
                return AmmMassnahmenCode.FSE;
            case 'S15':
                return AmmMassnahmenCode.PEWO;
        }
        return null;
    }

    private getTypeIndividuell(geschaeftsartCode: string): string {
        switch (geschaeftsartCode) {
            case 'S3':
                return AmmMassnahmenCode.INDIVIDUELL_AP;
            case 'S6':
                return AmmMassnahmenCode.INDIVIDUELL_BP;
            case 'S12':
                return AmmMassnahmenCode.INDIVIDUELL_KURS;
            case 'S24':
                return AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT;
        }
        return null;
    }

    private getType(geschaeftsartCode: string): string {
        switch (geschaeftsartCode) {
            case 'S7':
                return AmmMassnahmenCode.BP;
            case 'S13':
                return AmmMassnahmenCode.KURS;
            case 'S14':
                return AmmMassnahmenCode.SEMO;
            case 'S16':
                return AmmMassnahmenCode.PVB;
            case 'S18':
                return AmmMassnahmenCode.UEF;
            case 'S23':
                return AmmMassnahmenCode.AP;
        }
        return null;
    }
}
