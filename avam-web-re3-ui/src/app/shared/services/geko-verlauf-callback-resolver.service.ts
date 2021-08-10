import { Injectable } from '@angular/core';
import { CallbackDTO } from '@dtos/callbackDTO';
import { buildAnbieterPath, buildArbeitgeberPath, buildStesPath } from '@shared/services/build-route-path.function';
import { ArbeitgeberPaths, StesTerminePaths, StesVermittlungsfaehigkeits } from '@shared/enums/stes-navigation-paths.enum';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { AmmMassnahmenCode } from '@shared/enums/domain-code/amm-massnahmen-code.enum';
import { SanktionenSachverhaltCodeEnum } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';

@Injectable({
    providedIn: 'root'
})
export class GekoVerlaufCallbackResolverService {
    private urlResolveMapper: Map<string, any>;
    private readonly pendentPruefbereitGeprueftSachstandCodes = ['10', '13', '14'];
    private readonly pendentGeprueftSachstandCodes = ['10', '14'];
    private readonly freigabebereitUeberarabeitungErledigtSachstandCodes = ['11', '12', 'E1'];

    constructor() {
        this.urlResolveMapper = new Map();
        this.addAusbildungspraktikumEinarbeitungszuschussIndividuell();
        this.addS7_S14_S16_S18_S23UrlResolver();
        this.addBeratungsterminResolver();
        this.addAusbildungszuschussResolver();
        this.addEinarbeitungszuschlussResolver();
        this.addKursIndividuellResolver();
        this.addFoerderungSelbstaendigkeitResolver();
        this.addKursKollektivResolver();
        this.addPendlerkostenWochenaufenthalterResolver();
        this.addSanktionResolver();
        this.addStellenvermittlungResolver();
        this.addVermittlungsfaehigkeitResolver();
        this.addKursIndividuellAbMassnahmeResolver();
        this.addArbeitgeberKurzarbeitResolver();
        this.addArbeitgeberSchlechtwetterResolver();
        this.addArbeitgeberStellenvermittlungResolver();
        this.addArbeitgeberMeldepflichtigeStelleResolver();
        this.addAnbieterAbrechnungResolver();
        this.addAnbieterLeistungsvereinbarungResolver();
        this.addAnbieterRahmenvertragResolver();
        this.addAnbieterTeilzahlungResolver();
    }

    public resolve(dto: CallbackDTO): NavigationDto {
        const resolve: any = this.urlResolveMapper.get(dto.geschaeftsartCode);
        return resolve ? resolve(dto) : null;
    }

    private contains(list: string[], element: string): boolean {
        const el = list.find(s => s === element);
        return el !== null && el !== undefined;
    }

    private getParamValue(callback: CallbackDTO, key: string): string {
        if (key && callback && callback.parameters) {
            const value = callback.parameters[key];
            return value ? value : '';
        }
        return '';
    }

    private hasFreigabebereitUeberarabeitungErledigtSachstand(dto: CallbackDTO): boolean {
        return this.contains(this.freigabebereitUeberarabeitungErledigtSachstandCodes, dto.sachstandCode);
    }

    private hasPendentGeprueftSachstand(dto: CallbackDTO): boolean {
        return this.contains(this.pendentGeprueftSachstandCodes, dto.sachstandCode);
    }

    private hasPendentPruefbereitGeprueftSachstand(dto: CallbackDTO): boolean {
        return this.contains(this.pendentPruefbereitGeprueftSachstandCodes, dto.sachstandCode);
    }

    private addEinarbeitungszuschlussResolver(): void {
        this.urlResolveMapper.set('S9', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const type = AmmMassnahmenCode.EAZ;
            const extras = this.buildGfEntscheidExtras(dto);
            if (this.hasPendentGeprueftSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/gesuch`)], extras };
            } else if (this.hasFreigabebereitUeberarabeitungErledigtSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/speziell-entscheid`)], extras };
            }
            return null;
        });
    }

    private addKursIndividuellResolver(): void {
        this.urlResolveMapper.set('S12', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const type = AmmMassnahmenCode.INDIVIDUELL_KURS;
            const extras = this.buildGfEntscheidExtras(dto);
            if (this.hasPendentPruefbereitGeprueftSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/buchung-individuell`)], extras };
            } else if (this.hasFreigabebereitUeberarabeitungErledigtSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/bim-bem-entscheid`)], extras };
            }
            return null;
        });
    }

    private addBeratungsterminResolver(): void {
        this.urlResolveMapper.set('S5', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            return { commands: [buildStesPath(stesId, StesTerminePaths.TERMINEANZEIGEN)] };
        });
    }

    private addAusbildungszuschussResolver(): void {
        this.urlResolveMapper.set('S4', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const type = AmmMassnahmenCode.AZ;
            const extras = this.buildGfEntscheidExtras(dto);
            if (this.hasPendentGeprueftSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/gesuch`)], extras };
            } else if (this.hasFreigabebereitUeberarabeitungErledigtSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/speziell-entscheid`)], extras };
            }
            return null;
        });
    }

    /*
        Url Resolver for:
            Berufspraktikum kollektiv
            Motivationssemester
            Programm vorübergehende Beschäftigung
            Übungsfirma
            Ausbildungspraktikum kollektiv
     */
    private addS7_S14_S16_S18_S23UrlResolver(): void {
        ['S7', 'S14', 'S16', 'S18', 'S23'].forEach(n => {
            this.urlResolveMapper.set(n, (dto: CallbackDTO) => {
                const stesId = this.getStesId(dto);
                let type;
                switch (dto.geschaeftsartCode) {
                    case 'S7':
                        type = AmmMassnahmenCode.BP;
                        break;
                    case 'S14':
                        type = AmmMassnahmenCode.SEMO;
                        break;
                    case 'S16':
                        type = AmmMassnahmenCode.PVB;
                        break;
                    case 'S18':
                        type = AmmMassnahmenCode.UEF;
                        break;
                    case 'S23':
                        type = AmmMassnahmenCode.AP;
                        break;
                }
                const extras = this.buildGfEntscheidExtras(dto);
                if (this.hasPendentGeprueftSachstand(dto)) {
                    return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/buchung-psak`)], extras };
                } else if (this.hasFreigabebereitUeberarabeitungErledigtSachstand(dto)) {
                    return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/bim-bem-entscheid`)], extras };
                }
                return null;
            });
        });
    }

    private addAusbildungspraktikumEinarbeitungszuschussIndividuell(): void {
        ['S3', 'S6'].forEach(n => {
            this.urlResolveMapper.set(n, (dto: CallbackDTO) => {
                const stesId = this.getStesId(dto);
                const type = dto.geschaeftsartCode === 'S3' ? AmmMassnahmenCode.INDIVIDUELL_AP : AmmMassnahmenCode.INDIVIDUELL_BP;
                const extras = this.buildGfEntscheidExtras(dto);
                if (this.hasPendentPruefbereitGeprueftSachstand(dto)) {
                    return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/buchung-individuell`)], extras };
                } else if (this.hasFreigabebereitUeberarabeitungErledigtSachstand(dto)) {
                    return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/bim-bem-entscheid`)], extras };
                }
                return null;
            });
        });
    }

    private addFoerderungSelbstaendigkeitResolver(): void {
        this.urlResolveMapper.set('S11', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const type = AmmMassnahmenCode.FSE;
            const extras = this.buildGfEntscheidExtras(dto);
            if (this.hasPendentGeprueftSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/gesuch`)], extras };
            } else if (this.hasFreigabebereitUeberarabeitungErledigtSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/speziell-entscheid`)], extras };
            }
            return null;
        });
    }

    private addKursKollektivResolver(): void {
        this.urlResolveMapper.set('S13', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const type = AmmMassnahmenCode.KURS;
            const extras = this.buildGfEntscheidExtras(dto);
            if (this.hasPendentGeprueftSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/buchung-kollektiv`)], extras };
            } else if (this.hasFreigabebereitUeberarabeitungErledigtSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/bim-bem-entscheid`)], extras };
            }
            return null;
        });
    }

    private addPendlerkostenWochenaufenthalterResolver(): void {
        this.urlResolveMapper.set('S15', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const type = AmmMassnahmenCode.PEWO;
            const extras = this.buildGfEntscheidExtras(dto);
            if (this.hasPendentGeprueftSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/gesuch`)], extras };
            } else if (this.hasFreigabebereitUeberarabeitungErledigtSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/speziell-entscheid`)], extras };
            }
            return null;
        });
    }

    private buildGfEntscheidExtras(dto: CallbackDTO): any {
        const gfId = this.getGfId(dto);
        const entscheidId = this.getEntscheidId(dto);
        return { queryParams: { gfId, entscheidId } };
    }

    private addSanktionResolver(): void {
        this.urlResolveMapper.set('S17', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const sachverhaltId = this.getSachverhaltId(dto);
            return { commands: [buildStesPath(stesId, `sanktionen/${this.getSanktionRouteName(dto.sachverhaltTyp.code)}-bearbeiten`)], extras: { queryParams: { sachverhaltId } } };
        });
    }

    private getSanktionRouteName(type: string): string {
        if (SanktionenSachverhaltCodeEnum.SACHVERHALT_ABM.valueOf() === type) {
            return 'arbeitsbemuehungen';
        } else if (SanktionenSachverhaltCodeEnum.SACHVERHALT_AMM.valueOf() === type) {
            return 'arbeitsmarktliche-massnahmen';
        } else if (SanktionenSachverhaltCodeEnum.SACHVERHALT_BRT.valueOf() === type) {
            return 'beratung';
        } else if (SanktionenSachverhaltCodeEnum.SACHVERHALT_KTM.valueOf() === type) {
            return 'kontrollvorschriften-weisungen';
        } else {
            return 'vermittlung';
        }
    }

    private addStellenvermittlungResolver(): void {
        this.urlResolveMapper.set('S19', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const zuweisungId = this.getZuweisungId(dto);
            return { commands: [buildStesPath(stesId, `arbeitsvermittlungen/vermittlung-bearbeiten`)], extras: { queryParams: { zuweisungId } } };
        });
    }

    private addVermittlungsfaehigkeitResolver(): void {
        this.urlResolveMapper.set('S21', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const sachverhaltId = this.getSachverhaltId(dto);
            return { commands: [buildStesPath(stesId, StesVermittlungsfaehigkeits.SACHVERHALT_BEARBEITEN)], extras: { queryParams: { sachverhaltId } } };
        });
    }

    private addKursIndividuellAbMassnahmeResolver(): void {
        this.urlResolveMapper.set('S24', (dto: CallbackDTO) => {
            const stesId = this.getStesId(dto);
            const type = AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT;
            const extras = this.buildGfEntscheidExtras(dto);
            if (this.hasPendentPruefbereitGeprueftSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/buchung-angebot`)], extras };
            } else if (this.hasFreigabebereitUeberarabeitungErledigtSachstand(dto)) {
                return { commands: [buildStesPath(stesId, `amm/uebersicht/${type}/bim-bem-entscheid`)], extras };
            }
            return null;
        });
    }

    private addArbeitgeberKurzarbeitResolver(): void {
        this.urlResolveMapper.set('G3', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const voranmeldungKaeId = this.getVoranmeldungKaeId(dto);
            return {
                commands: [buildArbeitgeberPath(unternehmenId, ArbeitgeberPaths.KURZARBEIT_VORANMELDUNGEN_BEARBEITEN)],
                extras: { queryParams: { voranmeldungKaeId } }
            };
        });
    }

    private addArbeitgeberSchlechtwetterResolver(): void {
        this.urlResolveMapper.set('G4', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const sweMeldungId = this.getSweMeldungId(dto);
            return {
                commands: [buildArbeitgeberPath(unternehmenId, ArbeitgeberPaths.SCHLECHTWETTER_MELDUNGEN_BEARBEITEN)],
                extras: { queryParams: { sweMeldungId } }
            };
        });
    }

    private addArbeitgeberStellenvermittlungResolver(): void {
        this.urlResolveMapper.set('G6', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const zuweisungId = this.getZuweisungId(dto);
            const osteId = this.getOsteId(dto);
            return {
                commands: [buildArbeitgeberPath(unternehmenId, 'stellenangebote/stellenangebot/vermittlungen/bearbeiten')],
                extras: { queryParams: { zuweisungId, osteId } }
            };
        });
    }

    private addArbeitgeberMeldepflichtigeStelleResolver(): void {
        this.urlResolveMapper.set('G7', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const osteId = this.getOsteId(dto);
            return {
                commands: [buildArbeitgeberPath(unternehmenId, 'stellenangebote/stellenangebot/bewirtschaftung')],
                extras: { queryParams: { osteId } }
            };
        });
    }

    private addAnbieterAbrechnungResolver(): void {
        this.urlResolveMapper.set('A2', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const abrechnungId = this.getAbrechnungId(dto);
            return {
                commands: [buildAnbieterPath(unternehmenId, 'abrechnungen/bearbeiten')],
                extras: { queryParams: { abrechnungId } }
            };
        });
    }

    private addAnbieterLeistungsvereinbarungResolver(): void {
        this.urlResolveMapper.set('A3', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const lvId = this.getLeistungsvereinbarungId(dto);
            return {
                commands: [buildAnbieterPath(unternehmenId, 'leistungsvereinbarungen/leistungsvereinbarung')],
                extras: { queryParams: { lvId } }
            };
        });
    }

    private addAnbieterRahmenvertragResolver(): void {
        this.urlResolveMapper.set('A4', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const rahmenvertragId = this.getRahmenvertragId(dto);
            return {
                commands: [buildAnbieterPath(unternehmenId, 'rahmenvertraege/bearbeiten')],
                extras: { queryParams: { rahmenvertragId } }
            };
        });
    }

    private addAnbieterTeilzahlungResolver(): void {
        this.urlResolveMapper.set('A5', (dto: CallbackDTO) => {
            const unternehmenId = this.getUnternehmenId(dto);
            const teilzahlungId = this.getTeilzahlungId(dto);
            return {
                commands: [buildAnbieterPath(unternehmenId, 'teilzahlungen/bearbeiten')],
                extras: { queryParams: { teilzahlungId } }
            };
        });
    }

    private getUnternehmenId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'unternehmenId');
    }

    private getVoranmeldungKaeId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'voranmeldungKaeId');
    }

    private getSweMeldungId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'sweMeldungId');
    }

    private getZuweisungId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'zuweisungId');
    }

    private getOsteId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'osteId');
    }

    private getStesId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'stesId');
    }

    private getGfId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'gfId');
    }

    private getSachverhaltId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'sachverhaltId');
    }

    private getEntscheidId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'entscheidId');
    }

    private getAbrechnungId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'abrechnungId');
    }

    private getLeistungsvereinbarungId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'lvId');
    }

    private getRahmenvertragId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'rahmenvertragId');
    }

    private getTeilzahlungId(dto: CallbackDTO): string {
        return this.getParamValue(dto, 'teilzahlungId');
    }
}
