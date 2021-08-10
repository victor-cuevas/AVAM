import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OsteDTO } from '@app/shared/models/dtos-generated/osteDTO';
import { SpinnerService } from 'oblique-reactive';
import { OSTE_DETAILS_MODAL_SPINNER_CHANNEL } from '../../oste-details-modal.component';
import { forkJoin } from 'rxjs';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { SprachkenntnisDTO } from '@app/shared/models/dtos-generated/sprachkenntnisDTO';
import { OsteBerufsqualifikationViewDTO } from '@app/shared/models/dtos-generated/osteBerufsqualifikationViewDTO';
import { OsteStellenbeschreibungModalComponent } from '../../oste-stellenbeschreibung-modal/oste-stellenbeschreibung-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { AbschlussAnerkanntCode } from '@app/shared/enums/domain-code/abschluss-anerkannt-code.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { KantonEnum } from '@app/shared/enums/kanton.enum';
import { MeldepflichtEnum } from '@app/shared/enums/table-icon-enums';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-oste-details-modal-anforderungen',
    templateUrl: './oste-details-modal-anforderungen.component.html',
    styleUrls: ['./oste-details-modal-anforderungen.component.scss']
})
export class OsteDetailsModalAnforderungenComponent implements OnInit {
    @Input() osteId: string;

    anforderungenForm: FormGroup;

    fuehrerausweisOptions = [];
    geschlechtOptions = [];
    dataSource: any[];
    dataSourceSpr: any[];
    yesLabel: string = this.dbTranslateService.instant('i18n.common.yes');
    noLabel: string = this.dbTranslateService.instant('i18n.common.no');

    constructor(
        private formBuilder: FormBuilder,
        private spinnerService: SpinnerService,
        private stesDataService: StesDataRestService,
        private osteDataService: OsteDataRestService,
        private dbTranslateService: DbTranslateService,
        private modalService: NgbModal,
        private facade: FacadeService
    ) {}

    ngOnInit() {
        this.anforderungenForm = this.createFormGroup();
        this.getData();
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
            sprachenBemerkungen: null,
            idealesAlterSlider: this.formBuilder.group({
                idealesAlter: [''],
                alterVon: 15,
                alterBis: 65
            }),
            geschlecht: null,
            angabenAlter: null,
            kategorie: null,
            privFahrzeug: null,
            angabenAusweis: null
        });
    }

    getData() {
        this.spinnerService.activate(OSTE_DETAILS_MODAL_SPINNER_CHANNEL);

        forkJoin(
            this.stesDataService.getCode(DomainEnum.GESCHLECHT),
            this.stesDataService.getCode(DomainEnum.FUEHRERAUSWEIS_KATEGORIE),
            this.stesDataService.getCode(DomainEnum.BERUFSABSCHLUSSSTATUS),
            this.osteDataService.searchByOste(this.osteId),
            this.osteDataService.getOsteSprachkenntnisse(this.osteId, this.dbTranslateService.getCurrentLang()),
            this.osteDataService.getOsteBerufsbildung(this.osteId)
        ).subscribe(
            ([geschlechtCodes, fuehrerausweisKategorieCodes, berufsabschluss, oste, sprachkenntnisse, berufsbildung]) => {
                this.geschlechtOptions = this.facade.formUtilsService.mapDropdownKurztext(geschlechtCodes);

                this.fuehrerausweisOptions = fuehrerausweisKategorieCodes ? this.facade.formUtilsService.mapDropdownKurztext(fuehrerausweisKategorieCodes) : null;

                if (oste) {
                    this.anforderungenForm.reset(this.mapToForm(oste));
                }
                if (sprachkenntnisse.data) {
                    this.dataSourceSpr = sprachkenntnisse.data.map(element => this.mapSpracheTableRow(element));
                }
                if (berufsbildung.data && berufsabschluss) {
                    this.dataSource = berufsbildung.data.map(element => this.mapBerufTableRow(element, berufsabschluss));
                }
                this.spinnerService.deactivate(OSTE_DETAILS_MODAL_SPINNER_CHANNEL);
            },
            error => {
                this.spinnerService.deactivate(OSTE_DETAILS_MODAL_SPINNER_CHANNEL);
            }
        );
    }

    mapToForm(oste: OsteDTO) {
        return {
            sprachenBemerkungen: oste.sprachenBemerkungen,
            idealesAlterSlider: { idealesAlter: '', alterVon: oste.alterVon, alterBis: oste.alterBis },
            geschlecht: oste.geschlechtId,
            angabenAlter: oste.angabenAlter,
            kategorie: oste.kategorieId,
            privFahrzeug: oste.privFahrzeug,
            angabenAusweis: oste.angabenAusweis
        };
    }

    openInfo(item) {
        const modalRef = this.modalService.open(OsteStellenbeschreibungModalComponent, {
            ariaLabelledBy: 'modal-basic-title',
            windowClass: 'modal-xs',
            backdrop: 'static',
            centered: true
        });

        modalRef.componentInstance.text = item.anmerkungen;
        modalRef.componentInstance.headerKey = 'arbeitgeber.oste.label.anmerkungen';
    }

    mapBerufTableRow(element: OsteBerufsqualifikationViewDTO, berufsabschluss: CodeDTO[]) {
        const hasSign = !!element.meldepflichtKantone;
        const tooltipText =
            element.meldepflichtKantone === KantonEnum.SCHWEIZ
                ? this.dbTranslateService.instant('verzeichnisse.beruf.tooltip.meldepflichtigCH')
                : `${this.dbTranslateService.instant('verzeichnisse.beruf.tooltip.meldepflichtigIn')} ${element.meldepflichtKantone} `;

        const tp = hasSign ? tooltipText : '';
        return {
            anmerkungen: element.angaben,
            meldepflicht: { text: this.getMeldepflichtStatus(element), tooltip: tp },
            beruftaetigkeit: this.translate(element, 'avamBeruf'),
            aehnlicheBerufe: element.verwandteBerufe ? this.yesLabel : this.noLabel,
            aehnlicheBerufeList: element.verwandteBerufeList,
            qualifikation: this.translate(element, 'qualifikation'),
            erfahrung: this.translate(element, 'erfahrung'),
            ausbildungsniveau: this.translate(element, 'ausbildung'),
            abschlussInlaendisch: element.abschlussInland ? this.yesLabel : this.noLabel,
            abschlussAuslaendisch: element.abschlussAusland ? this.yesLabel : this.noLabel,
            abschlussAnerkannt:
                element.abschlussAuslandId && String(element.abschlussAuslandId) === this.facade.formUtilsService.getCodeIdByCode(berufsabschluss, AbschlussAnerkanntCode.ANERKANNT)
                    ? this.yesLabel
                    : this.noLabel
        };
    }

    getMeldepflichtStatus(data: OsteBerufsqualifikationViewDTO) {
        return data.meldepflichtKantone ? MeldepflichtEnum.UNTERLIEGT_LAUFEND : MeldepflichtEnum.KEIN_MELDEPFLICHT;
    }

    private mapSpracheTableRow(element: SprachkenntnisDTO) {
        return {
            sprache: this.translate(element.spracheObject, 'kurzText'),
            muendlichKenntnisse: this.translate(element.muendlichObject, 'kurzText'),
            schriftlichKenntnisse: this.translate(element.schriftlichObject, 'kurzText'),
            muttersprache: element.muttersprache ? this.yesLabel : this.noLabel,
            sprachAufenthalt: element.aufenthalt ? this.yesLabel : this.noLabel
        };
    }

    private translate(element, propertyPrefix: string): string {
        const translatedProperty = this.dbTranslateService.translate(element, propertyPrefix);

        return translatedProperty ? translatedProperty : '';
    }
}
