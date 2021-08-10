import { Component, OnInit, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { STES_DETAILS_MODAL_SPINNER_CHANNEL } from '../../stes-details-modal.component';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { StesGrunddatenDTO } from '@app/shared/models/dtos-generated/stesGrunddatenDTO';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { forkJoin } from 'rxjs';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { BenutzerstellenRestService } from '@app/core/http/benutzerstellen-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { TransferanalkCodeEnum } from '@app/shared/enums/domain-code/transferanalk-code.enum';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DatePipe } from '@angular/common';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { BaseResponseWrapperBenutzerstelleResultDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperBenutzerstelleResultDTOWarningMessages';
import { BenutzerstelleResultDTO } from '@app/shared/models/dtos-generated/benutzerstelleResultDTO';

@Component({
    selector: 'avam-stes-details-modal-grunddaten',
    templateUrl: './stes-details-modal-grunddaten.component.html',
    styleUrls: ['./stes-details-modal-grunddaten.component.scss']
})
export class StesDetailsModalGrunddatenComponent implements OnInit, AfterViewInit {
    @Input() stesId: string;

    grunddatenForm: FormGroup;
    zentralerdruckformulareForm: FormGroup;

    benutzerstelleLabels: string[] = [];
    transferAnAlkTextDTO: CodeDTO[] = [];

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;

    constructor(
        private formBuilder: FormBuilder,
        private spinnerService: SpinnerService,
        private stesDataService: StesDataRestService,
        private formUtils: FormUtilsService,
        private dbTranslateService: DbTranslateService,
        private benutzerstellenRestService: BenutzerstellenRestService,
        private translateService: TranslateService,
        private changeDetectorRef: ChangeDetectorRef,
        private datePipe: DatePipe,
        private benutzerstellenService: BenutzerstellenRestService
    ) {}

    ngOnInit() {
        this.grunddatenForm = this.createFormGroup();
        this.zentralerdruckformulareForm = this.grunddatenForm.get('zentralerdruckformulare') as FormGroup;
        this.getData();
        this.setBenutzerstelleLabels();
    }

    ngAfterViewInit() {
        this.changeDetectorRef.detectChanges();
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
            anmeldung: this.formBuilder.group({
                anmeldedatumgemeinde: null,
                anmeldedatumrav: null,
                stellenantrittab: null,
                ravwechsel: null
            }),
            zustaendigkeit: this.formBuilder.group({
                personalberater: null,
                benutzerstelle: { value: null, disabled: true }
            }),
            erwerbssituationarbeitsmarktsituation: this.formBuilder.group({
                erwerbssituationbeianmeldung: null,
                erwerbssituationaktuell: null,
                erwerbssituationberechnet: null,
                arbeitsmarktsituationberechnet: null
            }),
            hoechsteausbildung: null,
            leistungsbezug: this.formBuilder.group({
                leistungsbezug: null,
                kantonalearbeitslosenhilfe: null,
                alk: { value: null, disabled: true },
                transferanalk: null
            }),
            sachbearbeitungalk: this.formBuilder.group({
                nameRa: null,
                vornameRa: null,
                telefonRa: null,
                emailRa: null
            }),
            zentralerdruckformulare: this.formBuilder.group({
                avpproduzieren: null,
                pabproduzieren: null
            }),
            vermittlungsstopp: null
        });
    }

    benutzerStelleDataFunction = (term: string) => {
        const query = { name: term, gueltigkeit: 'active' };
        return this.benutzerstellenRestService.getBenutzerstelleInfo(query, this.translateService.currentLang);
    };

    getData() {
        this.spinnerService.activate(STES_DETAILS_MODAL_SPINNER_CHANNEL);

        forkJoin(this.stesDataService.getGrunddatenBearbeiten(this.stesId), this.stesDataService.getCode(DomainEnum.TRANSFER_ALK)).subscribe(
            ([grunddaten, transferAnAlk]) => {
                this.benutzerstellenService
                    .getBenutzerstelleById(grunddaten.data.personalberater.benutzerstelleId)
                    .subscribe((benutzerstelle: BaseResponseWrapperBenutzerstelleResultDTOWarningMessages) => {
                        if (grunddaten.data) {
                            this.grunddatenForm.reset(this.mapToForm(grunddaten.data, transferAnAlk, benutzerstelle.data));
                        }

                        this.spinnerService.deactivate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
                    });
            },
            error => {
                this.spinnerService.deactivate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
            }
        );
    }

    mapToForm(grunddaten: StesGrunddatenDTO, transferAnAlk: CodeDTO[], benutzerstelleDto: BenutzerstelleResultDTO) {
        return {
            anmeldung: {
                anmeldedatumgemeinde: this.formUtils.parseDate(grunddaten.anmeldedatumGemeinde),
                anmeldedatumrav: this.formUtils.parseDate(grunddaten.anmeldedatumRav),
                stellenantrittab: this.formUtils.parseDate(grunddaten.stellenantrittAb),
                ravwechsel: this.formUtils.parseDate(grunddaten.ravWechsel)
            },
            zustaendigkeit: {
                personalberater: grunddaten.personalberater,
                benutzerstelle: benutzerstelleDto
            },
            erwerbssituationarbeitsmarktsituation: {
                erwerbssituationbeianmeldung: this.checkObjAndTranslate(grunddaten.erwerbssituationBeiAnmeldung),
                erwerbssituationaktuell: this.checkObjAndTranslate(grunddaten.erwerbssituationAktuell),

                erwerbssituationberechnet: this.checkObjAndTranslate(grunddaten.erwerbssituationBerechnet),
                arbeitsmarktsituationberechnet: this.checkObjAndTranslate(grunddaten.arbeitsmarktsituationBerechnet)
            },
            hoechsteausbildung: this.checkObjAndTranslate(grunddaten.hoechsteAbgeschlosseneAusbildung),
            leistungsbezug: {
                leistungsbezug: this.checkObjAndTranslate(grunddaten.leistungsbezug),
                kantonalearbeitslosenhilfe: this.checkObjAndTranslate(grunddaten.kantonaleArbeitslosenhilfe),
                alk: grunddaten.zahlstelle
                    ? {
                          id: grunddaten.zahlstelle.zahlstelleId,
                          inputElementOneValue: grunddaten.zahlstelle.alkZahlstellenNr,
                          inputElementTwoValue: this.dbTranslateService.translate(grunddaten.zahlstelle, 'kurzname')
                      }
                    : {
                          id: null,
                          inputElementOneValue: null,
                          inputElementTwoValue: null
                      },
                transferanalk: this.getTransferAnAlk(grunddaten, transferAnAlk)
            },
            sachbearbeitungalk: {
                nameRa: grunddaten.nameRa,
                vornameRa: grunddaten.vornameRa,
                telefonRa: grunddaten.telefonVorwahlRa ? `${grunddaten.telefonVorwahlRa} ${grunddaten.telefonRa}` : grunddaten.telefonRa,
                emailRa: grunddaten.emailRa
            },
            zentralerdruckformulare: {
                avpproduzieren: grunddaten.angabenVersichertePerson,
                pabproduzieren: grunddaten.nachweisPersoenlicheArbeitsbemuehungen
            },
            vermittlungsstopp: grunddaten.vermittlungsstopp
        };
    }

    private setBenutzerstelleLabels() {
        this.benutzerstelleLabels.push(
            'benutzerverwaltung.label.benutzerstellenid',
            'common.label.benutzerstelle',
            'benutzerverwaltung.label.standortadresse',
            'common.label.typ',
            'common.label.arbeitssprache',
            'common.label.telefon',
            'common.label.email'
        );
    }

    private getTransferAnAlk(grunddaten: StesGrunddatenDTO, transferAnAlk: CodeDTO[]) {
        return grunddaten.transferAnAlk
            ? `${this.dbTranslateService.translate(transferAnAlk.find(c => c.code === TransferanalkCodeEnum.DATEN_UEBERMITTELT_AM), 'text')} ${this.datePipe.transform(
                  this.formUtils.parseDate(grunddaten.transferAnAlk),
                  'dd.MM.yyyy'
              )}`
            : this.dbTranslateService.translate(transferAnAlk.find(c => c.code === TransferanalkCodeEnum.NOCH_KEINE_DATEN), 'text');
    }

    private checkObjAndTranslate(obj: any) {
        return obj ? this.dbTranslateService.translate(obj, 'text') : '';
    }
}
