import { Injectable } from '@angular/core';
import { SuitableEnum } from '@app/shared/enums/table-icon-enums';
import { BerufQualifikationParamDTO } from '@app/shared/models/dtos-generated/berufQualifikationParamDTO';
import { ProfilvergleichDTO } from '@app/shared/models/dtos-generated/profilvergleichDTO';
import { SprachQualifikationParamDTO } from '@app/shared/models/dtos-generated/sprachQualifikationParamDTO';
import { TranslateService } from '@ngx-translate/core';
import { FehlermeldungenService } from '../fehlermeldungen.service';
import { ProfileCompareAdapterState, ProfileCompareRow } from './profile-compare-models';

@Injectable()
export class ProfileCompareAdapter {
    state: ProfileCompareAdapterState = {
        //BERUF
        stesHatBerufNichtErfuellt: false,
        berufeStimmemUeberein: false,
        stesHatAusbildungsniveauNichtErfuellt: false,
        meldungStesHatNichtErfuelltAnzeigen: false,
        attributeVonBerufNichtVergleiche: false,
        stesHatQualifikationNichtErfuellt: false,
        stesHatErfahrungNichtErfuellt: false,
        //SPRACHE
        stesHatSpracheNichtErfuellt: false,
        stesHatMuendlicheKenntnisseNichtErfuellt: false,
        stesHatSchriftlicheKenntnisseNichtErfuellt: false
    };

    constructor(private translateService: TranslateService, private fehlermeldungenService: FehlermeldungenService) {}

    adapt(dto: ProfilvergleichDTO = {}, modal = false): ProfileCompareRow[] {
        let attributeRows: ProfileCompareRow[] = [];
        if (dto) {
            this.initState(dto);

            //Add Beschäftigungsgrad% row
            attributeRows.push(
                this.constructRow(
                    'stes.label.vermittlung.beschaeftigungsgradProzent',
                    dto.osteVermittlungsgrad,
                    dto.stesVermittlungsgrad,
                    true,
                    dto.stesHatbeschaeftigungsgradNichtErfuellt
                )
            );
            //Concat Berufe Lists
            attributeRows = attributeRows.concat(this.mergeBerufeLists(dto.osteBerufeList, dto.stesBerufeList));

            //Concat Sprachen Lists
            attributeRows = attributeRows.concat(this.mergeSprachenLists(dto.osteSprachenList, dto.stesSprachenList));

            //Add rest of the rows
            attributeRows.push(this.constructRow('stes.label.arbeitsort', dto.osteArbeitsortText, dto.stesArbeitsortText, true, dto.stesHatArbeitsortNichtErfuellt));
            attributeRows.push(
                this.constructRow('stes.label.besonderearbeitsformen', dto.osteArbeitsformText, dto.stesArbeitsformText, true, dto.stesHatBesondereArbeitsformNichtErfuellt)
            );
            attributeRows.push(this.constructRow('stes.label.vermittlung.alter', dto.osteAlter, dto.stesAlter, true, dto.stesHatAlterNichtErfuellt));
            attributeRows.push(this.constructRow('common.label.geschlecht', dto.osteGeschlechtText, dto.stesGeschlechtText, true, dto.stesHatGeschlechtNichtErfuellt));
            attributeRows.push(this.constructRow('stes.label.privatesfahrzeug', dto.osteFahrzeugText, dto.stesFahrzeugText, true, dto.stesHatPrivatesFahrzeugNichtErfuellt));
            attributeRows.push(this.constructRow('stes.label.fuehrerausweisKategorie', dto.osteFakatText, dto.stesFakatText, true, dto.stesHatFuehrerausweisKatNichtErfuellt));
        }
        // BSP15 not expected when NA(modal)
        if (!modal) {
            this.validate(dto);
        }
        return attributeRows;
    }

    private validate(dto: ProfilvergleichDTO = {}) {
        if (
            dto.stesHatArbeitsortNichtErfuellt ||
            dto.stesHatBesondereArbeitsformNichtErfuellt ||
            dto.stesHatbeschaeftigungsgradNichtErfuellt ||
            dto.stesHatAlterNichtErfuellt ||
            dto.stesHatGeschlechtNichtErfuellt ||
            dto.stesHatPrivatesFahrzeugNichtErfuellt ||
            dto.stesHatFuehrerausweisKatNichtErfuellt ||
            dto.stesHatStellenbeschreibungNichtErfuellt ||
            // this has to be checked from state because it depends on the beruf/sprache checks below
            // the facade will always return false and because of this the message cannot come from BE
            this.state.meldungStesHatNichtErfuelltAnzeigen
        ) {
            this.fehlermeldungenService.showMessage('stes.feedback.vermittlung.profilstimmtnichtueberein', 'warning');
        }
    }

    private initState(dto: ProfilvergleichDTO = {}) {
        if (dto) {
            this.state = {
                //BERUF
                stesHatBerufNichtErfuellt: dto.stesHatBerufNichtErfuellt,
                berufeStimmemUeberein: dto.berufeStimmemUeberein,
                stesHatAusbildungsniveauNichtErfuellt: dto.stesHatAusbildungsniveauNichtErfuellt,
                meldungStesHatNichtErfuelltAnzeigen: dto.meldungStesHatNichtErfuelltAnzeigen,
                attributeVonBerufNichtVergleiche: dto.attributeVonBerufNichtVergleiche,
                stesHatQualifikationNichtErfuellt: dto.stesHatQualifikationNichtErfuellt,
                stesHatErfahrungNichtErfuellt: dto.stesHatErfahrungNichtErfuellt,
                //SPRACHE
                stesHatSpracheNichtErfuellt: dto.stesHatSpracheNichtErfuellt,
                stesHatMuendlicheKenntnisseNichtErfuellt: dto.stesHatMuendlicheKenntnisseNichtErfuellt,
                stesHatSchriftlicheKenntnisseNichtErfuellt: dto.stesHatSchriftlicheKenntnisseNichtErfuellt
            };
        }
    }

    private constructRow(attribute: string, osteValue: string, stesValue: string, isParent: boolean, isMismatch: boolean): ProfileCompareRow {
        return {
            isMismatch: isMismatch ? SuitableEnum.NICHT_GEEIGNET : SuitableEnum.GEEIGNET,
            attribute: attribute ? this.translateService.instant(attribute) : '-',
            osteValue: osteValue ? osteValue : '-',
            stesValue: stesValue ? stesValue : '-',
            isParent
        };
    }

    private mergeBerufeLists(osteBerufeList: BerufQualifikationParamDTO[], stesBerufeList: BerufQualifikationParamDTO[]): ProfileCompareRow[] {
        let berufeRows: ProfileCompareRow[] = [];
        const stesBerufe = Array.from(stesBerufeList);
        let osteBerufe = Array.from(osteBerufeList);
        let osteBerufIdToRemove: number[] = [];
        osteBerufe
            .map(osteBeruf => {
                const stesIndex = stesBerufe.findIndex(beruf => osteBeruf.berufId === beruf.berufId);
                if (stesIndex >= 0) {
                    osteBerufIdToRemove.push(osteBeruf.berufId);
                    const stesBeruf = stesBerufe.splice(stesIndex, 1)[0];
                    return { osteBeruf, stesBeruf };
                }
                return null;
            })
            .filter(Boolean)
            .forEach(berufPair => {
                berufeRows = berufeRows.concat(this.addProfession(berufPair.osteBeruf, berufPair.stesBeruf));
            });
        osteBerufe = osteBerufe.filter(beruf => !osteBerufIdToRemove.some(berufId => beruf.berufId === berufId));
        osteBerufIdToRemove = [];
        osteBerufe
            .map(osteBeruf => {
                const stesIndex = stesBerufe.findIndex(beruf => osteBeruf.osteBerufMoeglichVerwandteBerufe && beruf.chIscoCode === osteBeruf.chIscoCode);
                if (stesIndex >= 0) {
                    osteBerufIdToRemove.push(osteBeruf.berufId);
                    const stesBeruf = stesBerufe.splice(stesIndex, 1)[0];
                    return { osteBeruf, stesBeruf };
                }
                return null;
            })
            .filter(Boolean)
            .forEach(berufPair => {
                berufeRows = berufeRows.concat(this.addProfession(berufPair.osteBeruf, berufPair.stesBeruf));
            });
        osteBerufe = osteBerufe.filter(beruf => !osteBerufIdToRemove.some(berufId => beruf.berufId === berufId));
        osteBerufIdToRemove = [];
        osteBerufe
            .map(osteBeruf => {
                const stesIndex = stesBerufe.findIndex(beruf => beruf.chIscoCode === osteBeruf.chIscoCode);
                if (stesIndex >= 0) {
                    osteBerufIdToRemove.push(osteBeruf.berufId);
                    const stesBeruf = stesBerufe.splice(stesIndex, 1)[0];
                    return { osteBeruf, stesBeruf };
                }
                return null;
            })
            .filter(Boolean)
            .forEach(berufPair => {
                berufeRows = berufeRows.concat(this.addProfession(berufPair.osteBeruf, berufPair.stesBeruf));
            });
        osteBerufe = osteBerufe.filter(beruf => !osteBerufIdToRemove.some(berufId => beruf.berufId === berufId));
        const largerLength = osteBerufe.length > stesBerufe.length ? osteBerufe.length : stesBerufe.length;
        for (let i = 0; i < largerLength; i++) {
            berufeRows = berufeRows.concat(this.addProfession(osteBerufe[i], stesBerufe[i]));
        }
        return berufeRows;
    }

    private addProfession(osteBeruf: BerufQualifikationParamDTO = {}, stesBeruf: BerufQualifikationParamDTO = {}) {
        const berufRows: ProfileCompareRow[] = [];
        let stimmtBerufUeberein = true;
        let osteLanguage = osteBeruf.berufTaetigkeitText;
        if (osteBeruf.osteBerufMoeglichVerwandteBerufe) {
            osteLanguage += ', ' + this.translateService.instant('stes.label.vermittlung.moeglichVerwandteBerufe');
        } else if (osteBeruf.matchVerwandteBerufe) {
            osteLanguage += ', ' + this.translateService.instant('stes.label.vermittlung.ergaenzenVerwandteBerufe');
        }
        let stesLanguage = stesBeruf.berufTaetigkeitText;
        if (stesBeruf.matchVerwandteBerufe && stesBeruf.aufrufAusgehendStes) {
            stesLanguage += ', ' + this.translateService.instant('stes.label.vermittlung.ergaenzenVerwandteBerufe');
        }
        stimmtBerufUeberein = this.berufTaetigkeitChecks(osteBeruf, stesBeruf, stimmtBerufUeberein);
        berufRows.push(this.constructRow('stes.label.vermittlung.berufTaetigkeit', osteLanguage, stesLanguage, true, this.state.stesHatBerufNichtErfuellt));
        this.berufQualifikationChecks(osteBeruf, stesBeruf, stimmtBerufUeberein);
        berufRows.push(
            this.constructRow(
                'stes.label.vermittlung.qualifikation',
                osteBeruf.qualifikationText,
                stesBeruf.qualifikationText,
                false,
                stimmtBerufUeberein && this.state.stesHatQualifikationNichtErfuellt
            )
        );
        this.berufErfahrungChecks(osteBeruf, stesBeruf, stimmtBerufUeberein);
        berufRows.push(
            this.constructRow(
                'stes.label.vermittlung.erfahrung',
                osteBeruf.erfahrungText,
                stesBeruf.erfahrungText,
                false,
                stimmtBerufUeberein && this.state.stesHatErfahrungNichtErfuellt
            )
        );
        this.berufAusbildungsniveauChecks(osteBeruf, stesBeruf, stimmtBerufUeberein);
        berufRows.push(
            this.constructRow(
                'stes.label.vermittlung.ausbildungsniveau',
                osteBeruf.ausbildungsniveauText,
                stesBeruf.ausbildungsniveauText,
                false,
                stimmtBerufUeberein && this.state.stesHatAusbildungsniveauNichtErfuellt
            )
        );
        if (this.state.attributeVonBerufNichtVergleiche && !stimmtBerufUeberein) {
            this.state.stesHatAusbildungsniveauNichtErfuellt = true;
            this.state.meldungStesHatNichtErfuelltAnzeigen = true;
        }
        return berufRows;
    }

    private berufTaetigkeitChecks(osteBeruf: BerufQualifikationParamDTO, stesBeruf: BerufQualifikationParamDTO, stimmtBerufUeberein: boolean): boolean {
        if (!osteBeruf.berufId) {
            this.state.stesHatBerufNichtErfuellt = false;
            return stimmtBerufUeberein;
        }

        if (osteBeruf.berufId !== stesBeruf.berufId) {
            if (osteBeruf.osteBerufMoeglichVerwandteBerufe && osteBeruf.chIscoCode === stesBeruf.chIscoCode && stesBeruf.berufId) {
                this.state.stesHatBerufNichtErfuellt = false;
                this.state.berufeStimmemUeberein = true;
                return stimmtBerufUeberein;
            }

            if (!this.state.berufeStimmemUeberein) {
                this.state.stesHatBerufNichtErfuellt = true;
                this.state.stesHatAusbildungsniveauNichtErfuellt = true;
                this.state.meldungStesHatNichtErfuelltAnzeigen = true;
                return false;
            }

            this.state.attributeVonBerufNichtVergleiche = true;

            return stimmtBerufUeberein;
        }

        this.state.stesHatBerufNichtErfuellt = false;
        this.state.berufeStimmemUeberein = true;

        return stimmtBerufUeberein;
    }

    private berufQualifikationChecks(osteBeruf: BerufQualifikationParamDTO, stesBeruf: BerufQualifikationParamDTO, stimmtBerufUeberein: boolean) {
        if (this.state.attributeVonBerufNichtVergleiche) {
            this.state.stesHatQualifikationNichtErfuellt = false;
            return;
        }

        if (!osteBeruf.qualifikationId) {
            if (!stimmtBerufUeberein) {
                this.state.stesHatAusbildungsniveauNichtErfuellt = true;
                this.state.meldungStesHatNichtErfuelltAnzeigen = true;
            }
            this.state.stesHatQualifikationNichtErfuellt = !stimmtBerufUeberein;
            return;
        }

        if (!stesBeruf.qualifikationId || osteBeruf.qualifikationId < stesBeruf.qualifikationId) {
            this.state.stesHatQualifikationNichtErfuellt = true;
            this.state.stesHatAusbildungsniveauNichtErfuellt = true;
            this.state.meldungStesHatNichtErfuelltAnzeigen = true;
            return;
        }

        if (!stimmtBerufUeberein) {
            this.state.stesHatAusbildungsniveauNichtErfuellt = true;
            this.state.meldungStesHatNichtErfuelltAnzeigen = true;
        }
        this.state.stesHatQualifikationNichtErfuellt = !stimmtBerufUeberein;
    }

    private berufErfahrungChecks(osteBeruf: BerufQualifikationParamDTO, stesBeruf: BerufQualifikationParamDTO, stimmtBerufUeberein: boolean) {
        if (this.state.attributeVonBerufNichtVergleiche) {
            this.state.stesHatErfahrungNichtErfuellt = false;
            return;
        }

        if (!osteBeruf.erfahrungId) {
            if (!stimmtBerufUeberein) {
                this.state.stesHatAusbildungsniveauNichtErfuellt = true;
                this.state.meldungStesHatNichtErfuelltAnzeigen = true;
            }
            this.state.stesHatErfahrungNichtErfuellt = !stimmtBerufUeberein;
            return;
        }

        if (osteBeruf.erfahrungId > stesBeruf.erfahrungId || !stimmtBerufUeberein) {
            this.state.stesHatErfahrungNichtErfuellt = true;
            this.state.stesHatAusbildungsniveauNichtErfuellt = true;
            this.state.meldungStesHatNichtErfuelltAnzeigen = true;
            return;
        }

        this.state.stesHatErfahrungNichtErfuellt = false;
    }

    private berufAusbildungsniveauChecks(osteBeruf: BerufQualifikationParamDTO, stesBeruf: BerufQualifikationParamDTO, stimmtBerufUeberein: boolean) {
        if (this.state.attributeVonBerufNichtVergleiche) {
            this.state.stesHatAusbildungsniveauNichtErfuellt = false;
            return;
        }
        //change hardcoded values
        if (!osteBeruf.ausbildungsniveauId || osteBeruf.ausbildungsniveauId === 99 || osteBeruf.ausbildungsniveauId === 98) {
            if (!stimmtBerufUeberein) {
                this.state.meldungStesHatNichtErfuelltAnzeigen = true;
            }
            this.state.stesHatAusbildungsniveauNichtErfuellt = !stimmtBerufUeberein;
            return;
        }

        if (osteBeruf.ausbildungsniveauId > stesBeruf.ausbildungsniveauId || !stimmtBerufUeberein) {
            this.state.stesHatAusbildungsniveauNichtErfuellt = true;
            this.state.meldungStesHatNichtErfuelltAnzeigen = true;
            return;
        }

        this.state.stesHatAusbildungsniveauNichtErfuellt = false;
    }

    private mergeSprachenLists(osteSprachenList: SprachQualifikationParamDTO[], stesSprachenList: SprachQualifikationParamDTO[]): ProfileCompareRow[] {
        let sprachenRows: ProfileCompareRow[] = [];

        let osteSprachen = Array.from(osteSprachenList);
        const stesSprachen = Array.from(stesSprachenList);

        const osteSprachIdToRemove = [];
        osteSprachen
            .map(osteSprache => {
                const stesIndex = stesSprachen.findIndex(sprache => sprache.sprachName === osteSprache.sprachName);
                if (stesIndex >= 0) {
                    osteSprachIdToRemove.push(osteSprache.sprachId);
                    const stesSprache = stesSprachen.splice(stesIndex, 1)[0];
                    return { osteSprache, stesSprache };
                }
                return null;
            })
            .filter(Boolean)
            .forEach(sprachenPair => {
                sprachenRows = sprachenRows.concat(this.addLanguage(sprachenPair.osteSprache, sprachenPair.stesSprache));
            });
        osteSprachen = osteSprachen.filter(sprache => !osteSprachIdToRemove.some(sprachId => sprache.sprachId === sprachId));

        const largerLength = stesSprachen.length > osteSprachen.length ? stesSprachen.length : osteSprachen.length;
        for (let i = 0; i < largerLength; i++) {
            sprachenRows = sprachenRows.concat(this.addLanguage(osteSprachen[i], stesSprachen[i]));
        }

        return sprachenRows;
    }

    private addLanguage(osteSprache: SprachQualifikationParamDTO = {}, stesSprache: SprachQualifikationParamDTO = {}): ProfileCompareRow[] {
        const spracheRows: ProfileCompareRow[] = [];

        let stimmtSpracheUeberein = true;

        stimmtSpracheUeberein = this.sprachenGesamtChecks(osteSprache, stesSprache, stimmtSpracheUeberein);

        spracheRows.push(this.constructRow('stes.label.vermittlung.sprache', osteSprache.sprachName, stesSprache.sprachName, true, this.state.stesHatSpracheNichtErfuellt));

        this.sprachenMuendlichChecks(osteSprache, stesSprache, stimmtSpracheUeberein);

        spracheRows.push(
            this.constructRow(
                'stes.label.vermittlung.muendlicheKenntnisse',
                osteSprache.muendlichKenntnisseText,
                stesSprache.muendlichKenntnisseText,
                false,
                stimmtSpracheUeberein && this.state.stesHatMuendlicheKenntnisseNichtErfuellt
            )
        );

        this.sprachenSchriftlichChecks(osteSprache, stesSprache, stimmtSpracheUeberein);

        spracheRows.push(
            this.constructRow(
                'stes.label.vermittlung.schriftlicheKenntnisse',
                osteSprache.schriftlichKenntnisseText,
                stesSprache.schriftlichKenntnisseText,
                false,
                stimmtSpracheUeberein && this.state.stesHatSchriftlicheKenntnisseNichtErfuellt
            )
        );

        return spracheRows;
    }

    private sprachenGesamtChecks(osteSprache: SprachQualifikationParamDTO, stesSprache: SprachQualifikationParamDTO, stimmtSpracheUeberein: boolean): boolean {
        if (osteSprache.sprachId && osteSprache.sprachId !== stesSprache.sprachId) {
            this.state.stesHatSpracheNichtErfuellt = true;
            this.state.meldungStesHatNichtErfuelltAnzeigen = true;
            return false;
        }
        this.state.stesHatSpracheNichtErfuellt = false;

        return stimmtSpracheUeberein;
    }

    private sprachenMuendlichChecks(osteSprache: SprachQualifikationParamDTO, stesSprache: SprachQualifikationParamDTO, stimmtSpracheUeberein: boolean) {
        if (!osteSprache.sprachId) {
            this.state.stesHatMuendlicheKenntnisseNichtErfuellt = false;
            return;
        }
        if (!stesSprache.sprachId || osteSprache.muendlicheKenntnisseId < stesSprache.muendlicheKenntnisseId || !stimmtSpracheUeberein) {
            this.state.stesHatMuendlicheKenntnisseNichtErfuellt = true;
            this.state.meldungStesHatNichtErfuelltAnzeigen = true;
            return;
        }
        this.state.stesHatMuendlicheKenntnisseNichtErfuellt = false;
    }

    private sprachenSchriftlichChecks(osteSprache: SprachQualifikationParamDTO, stesSprache: SprachQualifikationParamDTO, stimmtSpracheUeberein: boolean) {
        if (!osteSprache.sprachId) {
            this.state.stesHatSchriftlicheKenntnisseNichtErfuellt = false;
            return;
        }
        if (!stesSprache.sprachId || osteSprache.schritlicheKenntnisseId < stesSprache.schritlicheKenntnisseId || !stimmtSpracheUeberein) {
            this.state.stesHatSchriftlicheKenntnisseNichtErfuellt = true;
            this.state.meldungStesHatNichtErfuelltAnzeigen = true;
            return;
        }
        this.state.stesHatSchriftlicheKenntnisseNichtErfuellt = false;
    }
}
