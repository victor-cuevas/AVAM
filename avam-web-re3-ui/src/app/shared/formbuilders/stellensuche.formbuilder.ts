import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FormUtilsService } from '@shared/services/forms/form-utils.service';
import { DateValidator } from '@shared/validators/date-validator';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';

export class StellensucheFormbuilder {
    stellensucheForm: FormGroup;
    arbeitsForm: FormGroup;
    arbeitsOrtForm: FormGroup;
    mobiliteatForm: FormGroup;
    arbeitgeberForm: FormGroup;
    anstellungFrom: FormGroup;
    besondereArbeitsform: FormGroup;
    letzteAktualisierung: any;
    translatedLabels: string[] = [];
    besondereArbeitsformenOptions: any[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private formUtils: FormUtilsService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService
    ) {}

    initForm(): FormGroup {
        this.stellensucheForm = this.formBuilder.group({
            arbeitsForm: this.buildArbeitsForm(),
            arbeitsOrtForm: this.buildArbeitsOrtForm(),
            mobiliteatForm: this.buildMobiliteatForm(),
            arbeitgeberForm: this.buildArbeitgeberForm(),
            anstellungFrom: this.buildAnstellungFrom(),
            besondereArbeitsform: this.buildBesondereArbeitsform()
        });
        this.definiereFormGroups();
        return this.stellensucheForm;
    }

    setCheckboxValues(list) {
        const checkboxList = [];
        list.forEach(element => {
            const result = this.letzteAktualisierung.arbeitsformenList.find(v => v.arbeitsformId === element.codeId);
            const label = this.dbTranslateService.translate(element, 'label');

            checkboxList.push(!!result);
            this.translatedLabels.push(label);
            this.besondereArbeitsformenOptions.push({
                codeId: element.codeId,
                labelDe: element.labelDe,
                labelFr: element.labelFr,
                labelIt: element.labelIt
            });
        });
        return checkboxList;
    }

    setFuehrerausweisKategorieList(list) {
        const katList = [];

        list.forEach(element => {
            const result = this.letzteAktualisierung.fuehrerAusweisKatList.find(v => v.code.codeId === element.codeId);
            element.value = !!result;
            katList.push(element);
        });

        return katList;
    }

    /**
     *
     * @param letzteAktualisierung
     * @param stellensucheForm
     * @param unternehmen the currentUnternehmen from parent
     * @param arbeitSelectOptions
     */
    mapToDTO(letzteAktualisierung, stellensucheForm, unternehmen, arbeitSelectOptions): any {
        this.stellensucheForm = stellensucheForm;
        const stellensucheToSave = { ...letzteAktualisierung };
        stellensucheToSave.vermittlungsGrad = this.arbeitsForm.controls.vermittlungsGrad.value;
        stellensucheToSave.arbeitszeitDetail = this.arbeitsForm.controls.arbeitszeitDetail.value;
        const arbeitszeit = arbeitSelectOptions.find(v => v.codeId === Number(this.arbeitsForm.controls.arbeitszeitId.value));
        stellensucheToSave.arbeitszeitId = arbeitszeit.codeId;
        stellensucheToSave.mobilitaetId = this.mobiliteatForm.controls.mobilitaetId.value;
        stellensucheToSave.fahrzeugVerfuegbar = this.mobiliteatForm.controls.fahrzeugVerfuegbar.value;
        const filteredKatList = this.mobiliteatForm.controls.fuehrerausweisKategorieList.value.filter(v => v.value);
        const newKatList = [];
        filteredKatList.forEach(item => {
            newKatList.push({
                code: { codeId: item.id, textDe: item.textDe, textFr: item.textFr, textIt: item.textIt },
                fuehrerAusweisKatId: item.id,
                stesFuehrerAusweisKatId: 0,
                stesId: stellensucheToSave.stesID
            });
        });
        stellensucheToSave.fuehrerAusweisKatList = newKatList;
        stellensucheToSave.letzterAGBekannt = this.arbeitgeberForm.controls.letzterAGBekannt.value;
        stellensucheToSave.letzterAgNoga = this.arbeitgeberForm.controls.teatigkeitBranche['branchAutosuggestObj'];
        stellensucheToSave.letzterAgNogaId = this.arbeitgeberForm.controls.teatigkeitBranche.value
            ? this.arbeitgeberForm.controls.teatigkeitBranche['branchAutosuggestObj'].nogaId
            : 0;
        stellensucheToSave.stellenAntrittAbDatum = this.formUtils.parseDate(this.anstellungFrom.controls.stellenAntrittAbDatum.value);
        stellensucheToSave.anstellungBisDatum = this.formUtils.parseDate(this.anstellungFrom.controls.anstellungBisDatum.value);
        stellensucheToSave.arbeitsformenList = this.getSelectedCheckboxes();
        stellensucheToSave.stesGrossregionList = [];
        stellensucheToSave.stesSuchregionList = [];
        stellensucheToSave.letzterArbeitgeberID = 0;
        stellensucheToSave.unternehmen = null;
        stellensucheToSave.letzterArbeitgeberBurID = 0;
        stellensucheToSave.letzterArbeitgeberBurObject = null;
        // specific preparation (unternehmen or burObject)
        if (unternehmen && stellensucheToSave.letzterAGBekannt) {
            if (unternehmen.unternehmenId) {
                stellensucheToSave.unternehmen = this.getUnternehmenForAvam(unternehmen);
                stellensucheToSave.letzterArbeitgeberID = unternehmen.unternehmenId;
            } else {
                stellensucheToSave.letzterArbeitgeberBurObject = unternehmen;
                stellensucheToSave.letzterArbeitgeberBurID = unternehmen.burOrtEinheitId;
            }
        }
        stellensucheToSave.arbeitsOrte = this.stellensucheForm.value.arbeitsOrtForm.autosuggests.map(value => {
            const region = value.item;
            return {
                code: region.code ? region.code : -1,
                kanton: region.kanton ? region.kanton : '',
                merkmal: region.merkmal ? region.merkmal : '',
                regionDe: region.regionDe ? region.regionDe : region,
                regionFr: region.regionFr ? region.regionFr : region,
                regionId: region.regionId ? region.regionId : -1,
                regionIt: region.regionIt ? region.regionIt : region
            };
        });
        return stellensucheToSave;
    }

    getUnternehmenForAvam(unternehmen) {
        return {
            name: unternehmen.name,
            name1: unternehmen.name1,
            name2: unternehmen.name2,
            name3: unternehmen.name3,
            nogaText: unternehmen.nogaCode ? `${unternehmen.nogaCode} / ${this.dbTranslateService.translate(unternehmen, 'noga')}` : '',
            nogaId: unternehmen.nogaId ? unternehmen.nogaId : '',
            strasse: unternehmen.strasse && unternehmen.strasseNr ? `${unternehmen.strasse} ${unternehmen.strasseNr}` : '',
            plzOrt: this.getFormattedPlzOrt(unternehmen),
            land: this.dbTranslateService.translate(unternehmen, 'staat'),
            uidNummer: unternehmen.burNr ? unternehmen.burNr.toString() : '',
            unternehmenStatus: this.getUnternehmenStatus(unternehmen),
            avamSuche: this.translateService.instant('amm.abrechnungen.label.ja'),
            uidOrganisationId: unternehmen.uidOrganisationId ? unternehmen.uidOrganisationId.toString() : '',
            uidOrganisationFull: this.formatUID(unternehmen.uidOrganisationIdCategorie, unternehmen.uidOrganisationId),
            unternehmenId: unternehmen.unternehmenId ? unternehmen.unternehmenId : '',
            burOrtEinheitId: unternehmen.burOrtEinheitId,
            // AVB-6956 attach right DTO to the object with name 'dto'
            flatenedBadDto: unternehmen,
            displayExclamation: unternehmen.betriebsTypId === 'L00'
        };
    }

    formatUID(uidOrganisationIdCategorie, uidOrganisationId) {
        return uidOrganisationIdCategorie && uidOrganisationId ? `${uidOrganisationIdCategorie}-${uidOrganisationId.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';
    }

    getUnternehmenStatus(unternehmen) {
        return unternehmen.statusId ? this.dbTranslateService.translate(unternehmen.statusId, 'status') : '';
    }

    getFormattedPlzOrt(unternehmen) {
        const plzDef = unternehmen.plz && unternehmen.ortDe;
        const plz = plzDef ? unternehmen.plz : unternehmen.plzAusland ? unternehmen.plzAusland : '';
        const ort = plzDef ? this.dbTranslateService.translate(unternehmen, 'ort') : unternehmen.ortAusland ? unternehmen.ortAusland : '';

        return `${plz} ${ort}`;
    }

    mapToForm(letzteAktualisierung, arbeitSelectOptions, arbeitFormCheckbox, fuehrerausweisKategorieList) {
        this.letzteAktualisierung = letzteAktualisierung;
        const arbeitszeitId = arbeitSelectOptions.find(v => v.codeId === this.letzteAktualisierung.arbeitszeitId);

        const selectedCheckboxes = this.setCheckboxValues(arbeitFormCheckbox);
        const katList = this.setFuehrerausweisKategorieList(fuehrerausweisKategorieList);
        let unternehmenInfo;
        let unternehmenBranche = '';
        let teatigkeitBranche = '';

        if (this.letzteAktualisierung.unternehmen) {
            unternehmenInfo = letzteAktualisierung.unternehmen.data ? letzteAktualisierung.unternehmen.data : letzteAktualisierung.unternehmen;
            unternehmenBranche = unternehmenInfo.nogaText ? unternehmenInfo.nogaText : this.getTeatigkeitBranche(unternehmenInfo.nogaDTO);
        } else if (this.letzteAktualisierung.letzterArbeitgeberBurObject) {
            unternehmenInfo = letzteAktualisierung.letzterArbeitgeberBurObject;
            unternehmenBranche = unternehmenInfo.nogaDTO ? this.getTeatigkeitBranche(unternehmenInfo.nogaDTO) : null;
        }

        if (this.letzteAktualisierung.letzterAgNoga) {
            teatigkeitBranche = this.letzteAktualisierung.letzterAgNoga;
        }

        const form = {
            arbeitsForm: {
                vermittlungsGrad: this.letzteAktualisierung.vermittlungsGrad,
                arbeitszeitId: arbeitszeitId ? arbeitszeitId.codeId : '',
                arbeitszeitDetail: this.letzteAktualisierung.arbeitszeitDetail
            },
            arbeitsOrtForm: {
                autosuggests: []
            },
            besondereArbeitsform: {
                checkboxes: selectedCheckboxes
            },
            mobiliteatForm: {
                mobilitaetId: this.letzteAktualisierung.mobilitaetId ? this.letzteAktualisierung.mobilitaetId : null,
                fahrzeugVerfuegbar: this.letzteAktualisierung.fahrzeugVerfuegbar,
                fuehrerausweisKategorieList: katList
            },
            anstellungFrom: {
                anstellungBisDatum: this.formUtils.parseDate(this.letzteAktualisierung.anstellungBisDatum),
                stellenAntrittAbDatum: this.formUtils.parseDate(this.letzteAktualisierung.stellenAntrittAbDatum)
            },
            arbeitgeberForm: this.setArbeitgeberForm(unternehmenInfo, unternehmenBranche, teatigkeitBranche)
        };

        this.stellensucheForm.setControl('arbeitsOrtForm', this.formBuilder.group({ autosuggests: this.formBuilder.array([]) }));
        this.stellensucheForm.setControl('besondereArbeitsform', this.formBuilder.group({ checkboxes: this.formBuilder.array(selectedCheckboxes) }));

        return form;
    }

    setArbeitgeberForm(unternehmenInfo, unternehmenBranche, teatigkeitBranche) {
        let arbeitgeberForm = {};
        if (unternehmenInfo) {
            if (unternehmenInfo.letzterAGName1) {
                arbeitgeberForm = this.setArbeitgeberFromDBBurExtrakt(unternehmenInfo, unternehmenBranche);
            } else {
                arbeitgeberForm = this.setArbeitgeberFromDBAVAMSearch(unternehmenInfo, unternehmenBranche);
            }
        }

        arbeitgeberForm['teatigkeitBranche'] = this.letzteAktualisierung.letzterAgNoga ? teatigkeitBranche : null;

        return arbeitgeberForm;
    }

    setArbeitgeberFromDBBurExtrakt(unternehmenInfo, unternehmenBranche) {
        return {
            letzterAGBekannt: this.letzteAktualisierung.letzterAGBekannt,
            name1: unternehmenInfo.letzterAGName1 ? unternehmenInfo.letzterAGName1 : '',
            name2: unternehmenInfo.letzterAGName2 ? unternehmenInfo.letzterAGName2 : '',
            name3: unternehmenInfo.letzterAGName3 ? unternehmenInfo.letzterAGName3 : '',
            plz: unternehmenInfo.letzterAGPlzDTO
                ? this.getPlzOrt(unternehmenInfo.letzterAGPlzDTO, unternehmenInfo.plzAusland, unternehmenInfo.ortAusland)
                : `${unternehmenInfo.letzterAGPlz} ${unternehmenInfo.letzterAGOrt}`,
            land: unternehmenInfo.letzterAGLand ? this.dbTranslateService.translate(unternehmenInfo.letzterAGLand, 'name') : '',
            bur: unternehmenInfo.letzterAGBurNummer && '' + unternehmenInfo.letzterAGBurNummer !== '0' ? unternehmenInfo.letzterAGBurNummer : '',
            branche: unternehmenBranche
        };
    }

    setArbeitgeberFromDBAVAMSearch(unternehmenInfo, unternehmenBranche) {
        return {
            letzterAGBekannt: this.letzteAktualisierung.letzterAGBekannt,
            name1: unternehmenInfo.name1 ? unternehmenInfo.name1 : '',
            name2: unternehmenInfo.name2 ? unternehmenInfo.name2 : '',
            name3: unternehmenInfo.name3 ? unternehmenInfo.name3 : '',
            plz: this.getPlzOrt(unternehmenInfo.plz, unternehmenInfo.plzAusland, unternehmenInfo.ortAusland),
            land: this.getStaat(unternehmenInfo.staat),
            bur: this.getBurNr(unternehmenInfo),
            branche: unternehmenBranche
        };
    }

    getTeatigkeitBranche(noga) {
        return noga.nogaId !== -1 ? `${noga.nogaCodeUp}` + ' / ' + `${this.dbTranslateService.translate(noga, 'textlang')}` : `${noga.value}`;
    }

    getStaat(staat) {
        return staat ? this.dbTranslateService.translate(staat, 'name') : '';
    }

    getPlzOrt(plz, plzAusland, ortAusland) {
        return plz && plz.plzId !== -1 ? `${plz.postleitzahl} ${this.dbTranslateService.translate(plz, 'ort')}` : this.getPlzOrtAusland(plzAusland, ortAusland);
    }

    getPlzOrtAusland(plzAusland, ortAusland) {
        let plzOrtAusland = '';
        if (plzAusland && ortAusland) {
            plzOrtAusland = `${plzAusland} ${ortAusland}`;
        } else if (plzAusland) {
            plzOrtAusland = `${plzAusland}`;
        } else if (ortAusland) {
            plzOrtAusland = `${ortAusland}`;
        }

        return plzOrtAusland;
    }

    getSelectedCheckboxes() {
        this.definiereFormGroups();
        const arbeitsformenList = [];

        this.besondereArbeitsform.value.checkboxes.forEach((item, index) => {
            if (item) {
                arbeitsformenList.push({
                    stesId: this.letzteAktualisierung.stesID,
                    arbeitsformId: this.besondereArbeitsformenOptions[index].codeId,
                    code: { codeId: this.besondereArbeitsformenOptions[index].codeId }
                });
            }
        });
        return arbeitsformenList;
    }

    definiereFormGroups() {
        this.arbeitsForm = this.stellensucheForm.get('arbeitsForm') as FormGroup;
        this.arbeitsOrtForm = this.stellensucheForm.get('arbeitsOrtForm') as FormGroup;
        this.mobiliteatForm = this.stellensucheForm.get('mobiliteatForm') as FormGroup;
        this.arbeitgeberForm = this.stellensucheForm.get('arbeitgeberForm') as FormGroup;
        this.anstellungFrom = this.stellensucheForm.get('anstellungFrom') as FormGroup;
        this.besondereArbeitsform = this.stellensucheForm.get('besondereArbeitsform') as FormGroup;
    }

    updateBesondereArbeitsformLabels() {
        this.definiereFormGroups();

        const currentLangLabels = [];
        this.besondereArbeitsformenOptions.forEach(item => {
            const currentLangLabel = this.dbTranslateService.translate(item, 'label');
            currentLangLabels.push(currentLangLabel);
        });

        this.translatedLabels = currentLangLabels;
        return this.translatedLabels;
    }

    private getBurNr(unternehmenInfo: UnternehmenDTO): string {
        if (unternehmenInfo.burOrtEinheitObject) {
            return unternehmenInfo.burOrtEinheitObject.letzterAGBurNummer;
        } else if (unternehmenInfo.burNummer) {
            return unternehmenInfo.burNummer.toString();
        }
        return '';
    }

    private buildArbeitsForm() {
        return this.formBuilder.group({
            vermittlungsGrad: [null, [Validators.min(0), Validators.max(100), Validators.required]],
            arbeitszeitId: [null, Validators.required],
            arbeitszeitDetail: ' '
        });
    }

    private buildBesondereArbeitsform() {
        return this.formBuilder.group({
            checkboxes: new FormArray([])
        });
    }

    private buildArbeitsOrtForm() {
        return this.formBuilder.group({
            autosuggests: this.formBuilder.array([], Validators.required)
        });
    }

    private buildMobiliteatForm() {
        return this.formBuilder.group({
            mobilitaetId: [null, Validators.required],
            fahrzeugVerfuegbar: null,
            fuehrerausweisKategorieList: [[]]
        });
    }

    private buildAnstellungFrom() {
        return this.formBuilder.group({
            anstellungBisDatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            stellenAntrittAbDatum: ''
        });
    }

    private buildArbeitgeberForm() {
        return this.formBuilder.group({
            letzterAGBekannt: null,
            name1: [null, Validators.required],
            name2: null,
            name3: null,
            plz: null,
            land: null,
            bur: null,
            branche: null,
            teatigkeitBranche: null
        });
    }
}
