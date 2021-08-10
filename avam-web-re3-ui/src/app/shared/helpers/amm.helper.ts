import { KontaktDTO } from '@dtos/kontaktDTO';
import { BenutzerDetailDTO } from './../models/dtos-generated/benutzerDetailDTO';
import { AmmMassnahmenCode, AmmMassnahmenStrukturElCode } from '../enums/domain-code/amm-massnahmen-code.enum';
import { AMMLabels } from '../enums/stes-routing-labels.enum';
import { AmmBuchungParamDTO } from '../models/dtos-generated/ammBuchungParamDTO';
import { AmmBuchungSessionDTO } from '../models/dtos-generated/ammBuchungSessionDTO';
import { AmmBuchungPraktikumsstelleDTO } from '../models/dtos-generated/ammBuchungPraktikumsstelleDTO';
import { AmmBuchungArbeitsplatzkategorieDTO } from '../models/dtos-generated/ammBuchungArbeitsplatzkategorieDTO';
import { AmmDurchfuehrungsortDTO } from '../models/dtos-generated/ammDurchfuehrungsortDTO';
import { UnternehmenDTO } from '../models/dtos-generated/unternehmenDTO';
import { StaatDTO } from '../models/dtos-generated/staatDTO';
import { AmmStesGeschaeftsfallDTO } from '../models/dtos-generated/ammStesGeschaeftsfallDTO';
import { Injectable } from '@angular/core';
import { FehlermeldungenService } from '../services/fehlermeldungen.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { KontakteViewDTO } from '../models/dtos-generated/kontakteViewDTO';
import { AmmKontaktpersonDTO } from '../models/dtos-generated/ammKontaktpersonDTO';
import { AmmConstants } from '../enums/amm-constants';
import { DbTranslateService } from '../services/db-translate.service';
import { ElementKategorieDTO } from '../models/dtos-generated/elementKategorieDTO';
import { StrukturElementDTO } from '../models/dtos-generated/strukturElementDTO';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ElementPrefixEnum } from '../enums/domain-code/element-prefix.enum';
import { SearchSessionStorageService } from '../services/search-session-storage.service';

@Injectable({
    providedIn: 'root'
})
export class AmmHelper {
    static ammMassnahmenToLabel = [
        { code: AmmMassnahmenCode.INDIVIDUELL_AP, label: AMMLabels.INDIVIDUELL_AP },
        { code: AmmMassnahmenCode.INDIVIDUELL_BP, label: AMMLabels.INDIVIDUELL_BP },
        { code: AmmMassnahmenCode.INDIVIDUELL_KURS, label: AMMLabels.INDIVIDUELL_KURS },
        { code: AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT, label: AMMLabels.INDIVIDUELL_KURS_IN_ANGEBOT },
        { code: AmmMassnahmenCode.KURS, label: AMMLabels.KOLLEKTIV_KURS },
        { code: AmmMassnahmenCode.BP, label: AMMLabels.KOLLEKTIV_BP },
        { code: AmmMassnahmenCode.AP, label: AMMLabels.KOLLEKTIV_AP },
        { code: AmmMassnahmenCode.SEMO, label: AMMLabels.SEMO },
        { code: AmmMassnahmenCode.PVB, label: AMMLabels.PVB },
        { code: AmmMassnahmenCode.UEF, label: AMMLabels.UEF }
    ];

    static AmmStrukturElToLabel = [
        { code: AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_KURS_CODE, label: 'amm.massnahmen.subnavmenuitem.kurse' },
        { code: AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_BP_CODE, label: 'amm.massnahmen.label.bp' },
        { code: AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_AP_CODE, label: 'amm.massnahmen.label.ap' },
        { code: AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_SEMO_CODE, label: 'amm.nutzung.title.semo' },
        { code: AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_PVB_CODE, label: 'amm.nutzung.title.pvb' },
        { code: AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_UF_CODE, label: 'amm.nutzung.title.uef' }
    ];

    static readonly MONATSKUERZEL_KEYS = [
        'amm.planung.label.monatskuerzelWithParameter.jan',
        'amm.planung.label.monatskuerzelWithParameter.feb',
        'amm.planung.label.monatskuerzelWithParameter.mar',
        'amm.planung.label.monatskuerzelWithParameter.apr',
        'amm.planung.label.monatskuerzelWithParameter.mai',
        'amm.planung.label.monatskuerzelWithParameter.jun',
        'amm.planung.label.monatskuerzelWithParameter.jul',
        'amm.planung.label.monatskuerzelWithParameter.aug',
        'amm.planung.label.monatskuerzelWithParameter.sep',
        'amm.planung.label.monatskuerzelWithParameter.oct',
        'amm.planung.label.monatskuerzelWithParameter.nov',
        'amm.planung.label.monatskuerzelWithParameter.dec'
    ];

    constructor(
        private fehlermeldungenService: FehlermeldungenService,
        private router: Router,
        private dbTranslateService: DbTranslateService,
        private authenticationService: AuthenticationService,
        private searchSessionService: SearchSessionStorageService
    ) {}

    getCurrentUserForAutosuggestDto(): BenutzerDetailDTO {
        const currentUser = this.authenticationService.getLoggedUser();

        const currentUserForAutosuggestDto = {
            benutzerId: currentUser.benutzerId,
            benutzerDetailId: +currentUser.benutzerDetailId,
            benutzerLogin: currentUser.benutzerLogin,
            nachname: currentUser.name,
            vorname: currentUser.vorname,
            benuStelleCode: currentUser.benutzerstelleCode,
            benutzerstelleId: currentUser.benutzerstelleId
        };

        return currentUserForAutosuggestDto;
    }

    getAmmBuchung(buchungParam: AmmBuchungParamDTO): AmmBuchungSessionDTO | AmmBuchungPraktikumsstelleDTO | AmmBuchungArbeitsplatzkategorieDTO {
        return buchungParam.ammBuchungSession || buchungParam.ammBuchungPraktikumsstelle || buchungParam.ammBuchungArbeitsplatzkategorie;
    }

    isAddressDifferentFromAnbieter(data, switzerland: StaatDTO): boolean {
        const anbieter: UnternehmenDTO = this.getAnbieter(data);
        const landId = this.getLandId(data);

        if (anbieter) {
            let isPlzChanged = false;
            if (data.landObject && data.landObject.iso2Code === switzerland.iso2Code && anbieter.plz) {
                isPlzChanged = this.isPlzChanged(data, anbieter);
            } else {
                isPlzChanged = this.getAuslPlz(data) !== this.getAnbieterPlzAusland(anbieter) || this.getAuslOrt(data) !== this.getAnbieterOrtAusland(anbieter);
            }

            return this.areStrasseOrHausNummerChanged(data, anbieter) || landId !== anbieter.staat.staatId || isPlzChanged || this.isNameChanged(data, anbieter);
        } else {
            return false;
        }
    }

    getEntscheidId(gfObject: AmmStesGeschaeftsfallDTO): number {
        let entscheidId;

        if (gfObject && gfObject.allAmmEntscheid && gfObject.allAmmEntscheid[0]) {
            entscheidId = gfObject.allAmmEntscheid[0].ammEntscheidId;
        }

        return entscheidId;
    }

    getEntscheidNr(buchungObject, entscheidId: number): number {
        let entscheidNr: number;

        if (buchungObject && buchungObject.ammGeschaeftsfallObject && buchungObject.ammGeschaeftsfallObject.allAmmEntscheid) {
            buchungObject.ammGeschaeftsfallObject.allAmmEntscheid.forEach(entscheid => {
                if (entscheid.ammEntscheidId === entscheidId) {
                    entscheidNr = entscheid.entscheidNr;
                }
            });
        }

        return entscheidNr;
    }

    navigateAmmUebersicht(stesId: number | string) {
        this.fehlermeldungenService.closeMessage();
        this.router.navigate([`stes/details/${stesId}/amm/uebersicht`]);
    }

    initializeKperson(formGroup: FormGroup, data: any, kontaktPersonObject: KontakteViewDTO, isKpersonCleared: boolean): AmmKontaktpersonDTO {
        const ammKontaktpersonObject = !this.isKpersonFreetext(formGroup, data) ? this.getBaseKpersonObj(formGroup) : null;

        if (kontaktPersonObject) {
            ammKontaktpersonObject.kontaktId = kontaktPersonObject.kontaktId;
        } else if (data.ammKontaktpersonObject && !isKpersonCleared) {
            ammKontaktpersonObject.kontaktId = data.ammKontaktpersonObject.kontaktId;
        }

        if ((data.ammKontaktpersonId || (data.ammKontaktpersonObject && data.ammKontaktpersonObject.id)) && !isKpersonCleared) {
            ammKontaktpersonObject.id = data.ammKontaktpersonId || data.ammKontaktpersonObject.id;
            ammKontaktpersonObject.ojbVersion = data.ammKontaktpersonObject.ojbVersion;
        }

        return ammKontaktpersonObject;
    }

    setAdditionalAmmKostenErrors(kosten: any) {
        if (kosten && kosten.infoText != null && kosten.infoText.length > 0) {
            this.fehlermeldungenService.showMessage(kosten.infoText, 'danger');
        }
    }

    getMassnahmenOrganisationTypKuerzel(elementkategorieAmtObject: ElementKategorieDTO, strukturelementGesetzObject: StrukturElementDTO): string {
        const kuerzel = elementkategorieAmtObject ? elementkategorieAmtObject.organisation : '';
        const massnahmentyp = strukturelementGesetzObject ? this.dbTranslateService.translate(strukturelementGesetzObject, 'elementName') : '';

        return kuerzel && massnahmentyp ? `${kuerzel} - ${massnahmentyp}` : kuerzel ? kuerzel : massnahmentyp ? massnahmentyp : '';
    }

    concatenateUnternehmensnamen(name1: string, name2: string, name3: string): string {
        return `${name1}${name2 ? ' ' + name2 : ''}${name3 ? ' ' + name3 : ''}`;
    }

    isKontaktpersonInfoDifferentFromAnbieterWizard(
        formKontaktperson: AmmKontaktpersonDTO,
        isKontaktPersonSelected: boolean,
        kontaktPersonenList: AmmKontaktpersonDTO[],
        wizardServiceKontaktpersonId: number
    ): boolean {
        let isDifferent = false;

        if (!isKontaktPersonSelected) {
            return isDifferent;
        }

        const anbieterKontaktperson: AmmKontaktpersonDTO = kontaktPersonenList.find(kontakt => kontakt.id === wizardServiceKontaktpersonId);

        if (this.hasKontaktpersonOriginal(anbieterKontaktperson) && formKontaktperson) {
            isDifferent =
                this.hasChanges(anbieterKontaktperson.name, formKontaktperson.name) ||
                this.hasChanges(anbieterKontaktperson.vorname, formKontaktperson.vorname) ||
                this.hasChanges(anbieterKontaktperson.telefon, formKontaktperson.telefon) ||
                this.hasChanges(anbieterKontaktperson.mobile, formKontaktperson.mobile) ||
                this.hasChanges(anbieterKontaktperson.fax, formKontaktperson.fax) ||
                this.hasChanges(anbieterKontaktperson.email, formKontaktperson.email);
        }

        return isDifferent;
    }

    isKontaktpersonInfoDifferentFromAnbieterBearbeiten(formKontaktperson: AmmKontaktpersonDTO, isKontaktPersonSelected: boolean, kontaktOriginalObj: KontaktDTO): boolean {
        let isDifferent = false;

        if (!isKontaktPersonSelected) {
            return isDifferent;
        }

        if (this.hasKontaktOriginal(kontaktOriginalObj) && formKontaktperson) {
            isDifferent =
                this.hasChanges(kontaktOriginalObj.kontaktpersonObject.name, formKontaktperson.name) ||
                this.hasChanges(kontaktOriginalObj.kontaktpersonObject.vorname, formKontaktperson.vorname) ||
                this.hasChanges(kontaktOriginalObj.telefonNr, formKontaktperson.telefon) ||
                this.hasChanges(kontaktOriginalObj.mobileNr, formKontaktperson.mobile) ||
                this.hasChanges(kontaktOriginalObj.telefaxNr, formKontaktperson.fax) ||
                this.hasChanges(kontaktOriginalObj.email, formKontaktperson.email);
        }

        return isDifferent;
    }

    getDtoTitel(dto: any): MultilanguageTitle {
        return {
            titelDe: dto.titelDe,
            titelFr: dto.titelFr,
            titelIt: dto.titelIt
        };
    }

    kontaktpersonMapper = (kontaktperson: KontakteViewDTO): AmmKontaktpersonDTO => {
        return {
            id: kontaktperson.kontaktpersonId,
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            email: kontaktperson.email,
            telefon: kontaktperson.telefonNr,
            mobile: kontaktperson.mobileNr,
            fax: kontaktperson.telefaxNr
        };
    };

    navigateToPlanungAnzeigen(id: number, maskPrefix: ElementPrefixEnum) {
        this.searchSessionService.clearStorageByKey('planung-anzeigen');
        this.router.navigate([`amm/planung/anzeigen`], {
            queryParams: { id, maskPrefix }
        });
    }

    private hasKontaktpersonOriginal(kontaktperson: AmmKontaktpersonDTO): boolean {
        return (
            !!kontaktperson &&
            (!!kontaktperson.name || !!kontaktperson.vorname || !!kontaktperson.email || !!kontaktperson.telefon || !!kontaktperson.mobile || !!kontaktperson.fax)
        );
    }

    private hasKontaktOriginal(kontaktperson: KontaktDTO): boolean {
        return (
            !!kontaktperson &&
            (!!kontaktperson.kontaktpersonObject.name ||
                !!kontaktperson.kontaktpersonObject.vorname ||
                !!kontaktperson.email ||
                !!kontaktperson.telefonNr ||
                !!kontaktperson.mobileNr ||
                !!kontaktperson.telefaxNr)
        );
    }

    private hasChanges(originalValue: string, formValue: string): boolean {
        if (originalValue && formValue) {
            return originalValue !== formValue;
        } else if (!originalValue && !formValue) {
            return false;
        } else {
            return true;
        }
    }

    private getBaseKpersonObj(formGroup: FormGroup): AmmKontaktpersonDTO {
        return {
            id: AmmConstants.UNDEFINED_LONG_ID as number,
            name: formGroup.controls.name.value ? formGroup.controls.name.value : '',
            vorname: formGroup.controls.vorname.value ? formGroup.controls.vorname.value : '',
            telefon: formGroup.controls.telefon.value ? formGroup.controls.telefon.value : '',
            mobile: formGroup.controls.mobile.value ? formGroup.controls.mobile.value : '',
            fax: formGroup.controls.fax.value ? formGroup.controls.fax.value : '',
            email: formGroup.controls.email.value ? formGroup.controls.email.value : '',
            kontaktId: AmmConstants.UNDEFINED_LONG_ID as number,
            ojbVersion: AmmConstants.UNDEFINED_LONG_ID as number
        };
    }

    private isKpersonFreetext(form: FormGroup, data: any): boolean {
        return (
            form.controls.name.value === null &&
            form.controls.vorname.value === null &&
            form.controls.telefon.value === null &&
            form.controls.mobile.value === null &&
            form.controls.fax.value === null &&
            form.controls.email.value === null &&
            data.ammKontaktpersonObject === null
        );
    }

    private isNameChanged(data: AmmDurchfuehrungsortDTO, anbieter: UnternehmenDTO): boolean {
        const isName1Changed = this.isNameLineChanged(data.ugname1, anbieter.name1);
        const isName2Changed = this.isNameLineChanged(data.ugname2, anbieter.name2);
        const isName3Changed = this.isNameLineChanged(data.ugname3, anbieter.name3);

        return isName1Changed || isName2Changed || isName3Changed;
    }

    private isNameLineChanged(ugName: string, anbieterName: string): boolean {
        const isOnlyOnePresent = !!ugName !== !!anbieterName;
        const areBothPresentAndDifferent = !!ugName && !!anbieterName && ugName.toLowerCase() !== anbieterName.toLowerCase();

        return isOnlyOnePresent || areBothPresentAndDifferent;
    }

    private areStrasseOrHausNummerChanged(data: AmmDurchfuehrungsortDTO, anbieter: UnternehmenDTO): boolean {
        const isOnlyOneStrassePresent = !!data.strasse !== !!anbieter.strasse;
        const isOnlyOneHausNrPresent = !!data.hausNummer !== !!anbieter.strasseNr;

        const isStrasseChanged = (data.strasse && anbieter.strasse && data.strasse.toLowerCase() !== anbieter.strasse.toLowerCase()) || isOnlyOneStrassePresent;
        const isHausNrChanged = (data.hausNummer && anbieter.strasseNr && data.hausNummer.toLowerCase() !== anbieter.strasseNr.toLowerCase()) || isOnlyOneHausNrPresent;

        return isStrasseChanged || isHausNrChanged;
    }

    private getAuslPlz(data: AmmDurchfuehrungsortDTO) {
        return data.auslPlz ? data.auslPlz.toLowerCase() : null;
    }

    private getAuslOrt(data: AmmDurchfuehrungsortDTO) {
        return data.auslOrt ? data.auslOrt.toLowerCase() : null;
    }

    private getAnbieterPlzAusland(anbieter: UnternehmenDTO) {
        return anbieter && anbieter.plzAusland ? anbieter.plzAusland.toLowerCase() : '';
    }

    private getAnbieterOrtAusland(anbieter: UnternehmenDTO) {
        return anbieter && anbieter.ortAusland ? anbieter.ortAusland.toLowerCase() : '';
    }

    private getAnbieter(data: AmmDurchfuehrungsortDTO) {
        return data.unternehmenId || (data.unternehmenObject && data.unternehmenObject.unternehmenId) ? data.unternehmenObject : null;
    }

    private isPlzChanged(data, anbieter: UnternehmenDTO) {
        return data.plzId ? data.plzId !== anbieter.plz.plzId : data.plzObject ? data.plzObject.plzId !== anbieter.plz.plzId : null;
    }

    private getLandId(data) {
        return data.landId ? data.landId : data.landObject ? data.landObject.staatId : null;
    }
}

export interface MultilanguageTitle {
    titelDe: string;
    titelFr: string;
    titelIt: string;
}
