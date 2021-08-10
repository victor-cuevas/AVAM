import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DmsService, FormUtilsService } from '@app/shared';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DmsContextSensitiveDossierDTO } from '@app/shared/models/dtos-generated/dmsContextSensitiveDossierDTO';
import { ZeitplanDTO } from '@app/shared/models/dtos-generated/zeitplanDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AngebotsdatenPageData } from '../../angebotsdaten-sichten.component';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-angebotsdaten-grunddaten',
    templateUrl: './angebotsdaten-grunddaten.component.html',
    styleUrls: ['./angebotsdaten-grunddaten.component.scss']
})
export class AngebotsdatenGrunddatenComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() stesId: number;
    @Input() massnahmenType: string;
    @Input() ammBuchung: AmmBuchungParamDTO;
    @Input() pageData: AngebotsdatenPageData;

    ammBuchungForm: FormGroup;
    massnahmenTypes: typeof AmmMassnahmenCode = AmmMassnahmenCode;
    isKursKolektiv = false;
    isKursIndivImAngebot = false;
    buchungNrLabel = 'amm.massnahmen.label.durchfuehrungsnr';
    anbieterLabel = 'amm.massnahmen.label.anbieter';
    durchfuehrungskriteriumOptions = [];
    verfuegbarkeitOptions = [];
    clearCheckboxes = true;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(
        private formBuilder: FormBuilder,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private dmsService: DmsService,
        private facade: FacadeService
    ) {}

    ngOnInit() {
        this.setupFlags();
        this.ammBuchungForm = this.createFormGroup();
        this.setupDropdowns();
        this.setupAnbieter();
    }

    ngAfterViewInit() {
        this.ammBuchungForm.reset(this.mapToForm());
        this.setupDurchfuehrungsNr();
    }

    setupFlags() {
        this.isKursKolektiv = this.massnahmenType === this.massnahmenTypes.KURS;
        this.isKursIndivImAngebot = this.massnahmenType === this.massnahmenTypes.INDIVIDUELL_KURS_IM_ANGEBOT;
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
            ergaenzendeAngaben: null,
            berufTaetigkeit: null,
            durchfuehrungVon: null,
            durchfuehrungBis: null,
            gueltigVon: null,
            gueltigBis: null,
            stichtagAm: null,
            eintrittsfristBis: null,
            anzahlKurstage: null,
            anzahlLektionen: null,
            verfuegbarkeit: null,
            vormittags: new FormArray([
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false)
            ]),
            nachmittags: new FormArray([
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false)
            ]),
            kurszeiten: null,
            arbeitszeiten: null,
            durchfuehrungskriterium: null,
            sozialeabfederung: null,
            vorstellungsgespraech: null,
            zustimmungLam: null,
            buchungNr: null,
            anbieter: null,
            verantwortung: null,
            teilnehmer: null,
            teilnehmerMax: null,
            ueberbuchung: null,
            ueberbuchungMax: null,
            wartelisteplaetze: null,
            wartelisteplaetzeMax: null,
            beschaeftigungsgradMax: null
        });
    }

    setupDropdowns() {
        if (this.isKursKolektiv) {
            this.durchfuehrungskriteriumOptions = this.facade.formUtilsService.mapDropdownKurztext([this.ammBuchung.durchfuehrungskriteriumObject]);
        }

        if (!this.isKursIndivImAngebot) {
            this.verfuegbarkeitOptions = this.facade.formUtilsService.mapDropdownKurztext([this.ammBuchung.zeitplanObject.verfuegbarkeitObject]);
        }
    }

    setupAnbieter() {
        if (this.massnahmenType === this.massnahmenTypes.AP || this.massnahmenType === this.massnahmenTypes.BP) {
            this.anbieterLabel = 'amm.massnahmen.label.arbeitgeber';
        }
    }

    mapToForm() {
        this.clearCheckboxes = false;
        const zeitplanObject = this.ammBuchung.zeitplanObject;

        return {
            ergaenzendeAngaben: this.ammBuchung.ergaenzendeAngaben ? this.dbTranslateService.translateWithOrder(this.ammBuchung.ergaenzendeAngaben, 'name') : null,
            berufTaetigkeit: this.ammBuchung.taetigkeit ? this.ammBuchung.taetigkeit : null,
            durchfuehrungVon: this.facade.formUtilsService.parseDate(this.ammBuchung.durchfuehrungVon),
            durchfuehrungBis: this.facade.formUtilsService.parseDate(this.ammBuchung.durchfuehrungBis),
            gueltigVon: this.facade.formUtilsService.parseDate(this.ammBuchung.gueltigVon),
            gueltigBis: this.facade.formUtilsService.parseDate(this.ammBuchung.gueltigBis),
            stichtagAm: this.facade.formUtilsService.parseDate(this.ammBuchung.stichtag),
            eintrittsfristBis: this.facade.formUtilsService.parseDate(this.ammBuchung.eintrittsfrist),
            anzahlKurstage: this.ammBuchung.anzahlKurstage,
            anzahlLektionen: this.ammBuchung.anzahlLektionen,
            verfuegbarkeit: zeitplanObject.verfuegbarkeitObject ? this.ammBuchung.zeitplanObject.verfuegbarkeitObject.codeId.toString() : null,
            vormittags: this.setVormittags(zeitplanObject),
            nachmittags: this.setNachmittags(zeitplanObject),
            kurszeiten: this.dbTranslateService.translateWithOrder(zeitplanObject, 'arbeitszeit'),
            arbeitszeiten: this.dbTranslateService.translateWithOrder(zeitplanObject, 'arbeitszeit'),
            durchfuehrungskriterium: this.ammBuchung.durchfuehrungskriteriumObject ? this.ammBuchung.durchfuehrungskriteriumObject.codeId : null,
            sozialeabfederung: this.setSozialeabfederung(),
            vorstellungsgespraech: this.ammBuchung.vorstellungsgespraechTest,
            zustimmungLam: this.ammBuchung.pruefenDurchLam,
            anbieter: this.ammBuchung.unternehmenObject,
            verantwortung: this.ammBuchung.benutzerDetailDTO,
            teilnehmer: this.ammBuchung.anzahlTeilnehmer,
            teilnehmerMax: this.ammBuchung.maxTeilnehmerApplicable ? this.ammBuchung.maxTeilnehmer : null,
            ueberbuchung: this.ammBuchung.anzahlUeberbuchungen,
            ueberbuchungMax: this.ammBuchung.maxUeberbuchungen ? this.ammBuchung.maxUeberbuchungen : 0,
            wartelisteplaetze: this.ammBuchung.wartelisteplaetze,
            wartelisteplaetzeMax: this.ammBuchung.maxWartelisteplaetze ? this.ammBuchung.maxWartelisteplaetze : 0,
            beschaeftigungsgradMax: this.ammBuchung.beschaeftigungsgradMax
        };
    }
    setVormittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moV, zeitplanObject.diV, zeitplanObject.miV, zeitplanObject.doV, zeitplanObject.frV, zeitplanObject.saV, zeitplanObject.soV];
    }

    setNachmittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moN, zeitplanObject.diN, zeitplanObject.miN, zeitplanObject.doN, zeitplanObject.frN, zeitplanObject.saN, zeitplanObject.soN];
    }

    setSozialeabfederung() {
        return this.ammBuchung.sozialeAbfederung ? this.dbTranslateService.instant('i18n.common.yes') : this.dbTranslateService.instant('i18n.common.no');
    }

    setupDurchfuehrungsNr() {
        this.ammBuchungForm.controls.buchungNr.setValue(this.ammBuchung.durchfuehrungsId);

        if (this.isKursIndivImAngebot) {
            this.buchungNrLabel = 'amm.massnahmen.label.massnahmennr';
            this.ammBuchungForm.controls.buchungNr.setValue(this.ammBuchung.massnahmeId);
        }

        if (this.ammBuchung.apkPraktikumsstelleVerwalten) {
            this.ammBuchungForm.controls.buchungNr.setValue(this.ammBuchung.beschaeftigungseinheitId);
            this.buchungNrLabel = this.ammBuchung.ammBuchungArbeitsplatzkategorie
                ? 'amm.massnahmen.label.arbeitsplatzkategorie.nummer'
                : 'amm.massnahmen.label.praktikumsstelle.nummer';
        }
    }

    onDMSClick() {
        this.fehlermeldungenService.closeMessage();

        const reqDto: DmsContextSensitiveDossierDTO = {
            stesId: this.stesId,
            uiNumber: StesFormNumberEnum.AMM_SICHTEN,
            language: this.dbTranslateService.getCurrentLang(),
            documentId: this.ammBuchung.massnahmeId
        };

        this.dmsService.openDMSWindowWithParams(reqDto);
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
    }
}
