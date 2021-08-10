import { Component, OnInit, Input } from '@angular/core';
import { StesBerufsdatenDTO } from '@app/shared/models/dtos-generated/stesBerufsdatenDTO';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AbschlusslandCode } from '@app/shared/enums/domain-code/abschlussland-code.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { GeschlechtPipe } from '@app/shared/pipes/geschlecht.pipe';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { BerufDTO } from '@app/shared/models/dtos-generated/berufDTO';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stes-details-modal-berufsdaten-detail',
    templateUrl: './stes-details-modal-berufsdaten-detail.component.html',
    styleUrls: ['./stes-details-modal-berufsdaten-detail.component.scss']
})
export class StesDetailsModalBerufsdatenDetailComponent implements OnInit {
    @Input() beruf: StesBerufsdatenDTO;

    berufForm: FormGroup;
    qualifikationOptions = [];
    berufsErfahrungOptions = [];
    berufsFunktionOptions = [];
    ausbildungsniveauOptions = [];
    berufsAbschluss = [];

    constructor(private formBuilder: FormBuilder, private dbTranslateService: DbTranslateService, private geschlechtPipe: GeschlechtPipe, private facade: FacadeService) {}

    ngOnInit() {
        this.buildForm();
        this.setDropdownOptions();
        this.mapToForm();
    }

    buildForm() {
        this.berufForm = this.formBuilder.group({
            berufsTaetigkeit: null,
            qualifikation: null,
            ausgeuebtB: null,
            zuletztB: null,
            gesuchtB: null,
            berufsErfahrung: null,
            berufsFunktion: null,
            ausbildungsniveau: null,
            berufsAbschluss: null,
            berufsAbschlussAnerkannt: null,
            ausuebungVon: null,
            ausuebungBis: null,
            dauerJahre: null,
            dauerMonate: null,
            fachkenntnisse: null,
            einschraenkungen: null
        });
    }

    mapToForm() {
        this.berufForm.patchValue({
            berufsTaetigkeit: this.getBerufTaetigkeit(this.beruf.berufsTaetigkeitObject, this.beruf.geschlecht),
            qualifikation: this.beruf.qualifikationID,
            ausgeuebtB: this.beruf.ausgeuebtB,
            zuletztB: this.beruf.zuletztB,
            gesuchtB: this.beruf.gesuchtB,
            berufsErfahrung: this.beruf.berufsErfahrungID,
            berufsFunktion: this.beruf.berufsFunktionID,
            ausbildungsniveau: this.beruf.ausbildungsNiveauID,
            berufsAbschluss: this.beruf.berufsAbschlussID,
            berufsAbschlussAnerkannt: this.getBerufsAbschlussAnerkannt(this.beruf.berufsAbschlussStatusObject),
            ausuebungVon: this.getFirstDay(this.beruf.datumVon),
            ausuebungBis: this.getFirstDay(this.beruf.datumBis),
            fachkenntnisse: this.beruf.bemerkungen,
            einschraenkungen: this.beruf.einschraenkungen
        });

        this.setDauerBerechnenToForm();
    }

    getBerufTaetigkeit(berufsTaetigkeitObject: BerufDTO, geschlecht: string): string {
        return berufsTaetigkeitObject ? this.dbTranslateService.translate(berufsTaetigkeitObject, this.geschlechtPipe.transform('bezeichnung', geschlecht)) : null;
    }

    getBerufsAbschlussAnerkannt(berufsAbschlussStatusObject: CodeDTO): boolean {
        return berufsAbschlussStatusObject && berufsAbschlussStatusObject.code === AbschlusslandCode.ANERKANNT ? true : false;
    }

    getFirstDay(berufDate: Date): Date {
        let firstDay = null;

        if (berufDate) {
            const date = this.facade.formUtilsService.parseDate(berufDate);
            firstDay = new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
        }

        return firstDay;
    }

    setDauerBerechnenToForm() {
        if (this.berufForm.controls.ausuebungVon.value && this.berufForm.controls.ausuebungBis.value) {
            const von = this.facade.formUtilsService.parseDate(this.berufForm.controls.ausuebungVon.value);
            const bis = this.facade.formUtilsService.parseDate(this.berufForm.controls.ausuebungBis.value);
            bis.setMonth(bis.getMonth() + 1);

            if (von < bis) {
                let year = bis.getFullYear() - von.getFullYear();
                let month = bis.getMonth() + 1 - (von.getMonth() + 1);

                if (bis.getMonth() + 1 - (von.getMonth() + 1) < 0) {
                    year = bis.getFullYear() - von.getFullYear() - 1;
                    month = 12 + (bis.getMonth() + 1 - (von.getMonth() + 1));
                }

                this.berufForm.controls.dauerJahre.setValue(year);
                this.berufForm.controls.dauerMonate.setValue(month);
            }
        }
    }

    setDropdownOptions() {
        this.qualifikationOptions = this.beruf.qualifikationObject ? this.facade.formUtilsService.mapDropdownKurztext([this.beruf.qualifikationObject]) : [];
        this.berufsErfahrungOptions = this.beruf.berufsErfahrungObject ? this.facade.formUtilsService.mapDropdownKurztext([this.beruf.berufsErfahrungObject]) : [];
        this.berufsFunktionOptions = this.beruf.berufsFunktionObject ? this.facade.formUtilsService.mapDropdownKurztext([this.beruf.berufsFunktionObject]) : [];
        this.ausbildungsniveauOptions = this.beruf.ausbildungsNiveauObject ? this.facade.formUtilsService.mapDropdownKurztext([this.beruf.ausbildungsNiveauObject]) : [];
        this.berufsAbschluss = this.beruf.berufsAbschlussObject ? this.facade.formUtilsService.mapDropdownKurztext([this.beruf.berufsAbschlussObject]) : [];
    }
}
