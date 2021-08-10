import { Component, OnInit, Input, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { BewMassnahmeKostenHandler } from './bew-massnahme-kosten-handler';
import { BewMassnahmeKostenReactiveForms } from './bew-massnahme-kosten-reactive-forms';
import { SessionKostenDTO } from '@app/shared/models/dtos-generated/sessionKostenDTO';
import { KurskostenZahlungCode } from '@app/shared/enums/domain-code/kurskosten-zahlung-code.enum';
import { FormUtilsService } from '@app/shared';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';

@Component({
    selector: 'avam-bew-massnahme-kosten-form',
    templateUrl: './bew-massnahme-kosten-form.component.html',
    styleUrls: ['./bew-massnahme-kosten-form.component.scss'],
    providers: [BewMassnahmeKostenReactiveForms, BewMassnahmeKostenHandler]
})
export class BewMassnahmeKostenFormComponent implements OnInit, OnChanges {
    @Input('kostenData') kostenData = null;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public formGroup: FormGroup;
    kursAndMaterialkostenAnOptions;
    pruefungskostenAnOptions;
    showPruefungsinstitution = false;

    constructor(public handler: BewMassnahmeKostenHandler, private formUtils: FormUtilsService, private obliqueHelper: ObliqueHelperService) {
        this.formGroup = handler.reactiveForms.searchForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.kostenData.currentValue) {
            this.mapData();

            this.resetFormWithLastUpdate();
            this.recalculateAllValues();
        }
    }

    checkPruefungsinstitution(event) {
        if (event) {
            const selectedOptionCode = this.formUtils.getCodeByCodeId(this.pruefungskostenAnOptions, event);
            if (selectedOptionCode === KurskostenZahlungCode.PRUEFUNGSINSTITUTION) {
                this.showPruefungsinstitution = true;
                return;
            }
        }
        this.showPruefungsinstitution = false;
        this.formGroup.patchValue({ pruefungsinstitution: null });
    }

    recalculateAllValues() {
        let totalKosten =
            Number(this.formGroup.controls.kurskosten.value) + Number(this.formGroup.controls.materialkosten.value) + Number(this.formGroup.controls.pruefungskosten.value);
        totalKosten = totalKosten ? totalKosten : 0;
        const kostenProTag = this.formGroup.controls.anzahlKurstage.value ? totalKosten / Number(this.formGroup.controls.anzahlKurstage.value) : 0;
        const kostenProLektion = this.formGroup.controls.anzahlLektionen.value ? totalKosten / Number(this.formGroup.controls.anzahlLektionen.value) : 0;

        this.formGroup.patchValue({ kurskostenTotal: totalKosten, kostenProTag, kostenProLektion });
    }

    resetFormWithLastUpdate() {
        if (this.kostenData && this.kostenData.kostenDto && this.kostenData.massnahmeDto) {
            this.formGroup.reset(this.mapToForm(this.kostenData.kostenDto, this.kostenData.massnahmeDto));
        }
    }

    mapToDto(kostenDto: SessionKostenDTO): SessionKostenDTO {
        const kostenDataToSave = { ...kostenDto };

        kostenDataToSave.kurskosten = this.formGroup.controls.kurskosten.value;
        kostenDataToSave.kurskostenAnObject = this.kursAndMaterialkostenAnOptions.find(option => option.codeId === +this.formGroup.controls.kurskostenAn.value) as CodeDTO;
        kostenDataToSave.materialkosten = this.formGroup.controls.materialkosten.value;
        kostenDataToSave.materialkostenAnObject = this.kursAndMaterialkostenAnOptions.find(option => option.codeId === +this.formGroup.controls.materialkostenAn.value) as CodeDTO;
        kostenDataToSave.pruefungskosten = this.formGroup.controls.pruefungskosten.value;
        kostenDataToSave.pruefungskostenAnObject = this.pruefungskostenAnOptions.find(option => option.codeId === +this.formGroup.controls.pruefungskostenAn.value) as CodeDTO;
        if (this.formGroup.controls.pruefungsinstitution.value) {
            if (this.formGroup.controls.pruefungsinstitution['unternehmenAutosuggestObject']) {
                kostenDataToSave.pruefungsinstitutionObject = {
                    unternehmenId: this.formGroup.controls.pruefungsinstitution['unternehmenAutosuggestObject'].unternehmenId,
                    name1: this.formGroup.controls.pruefungsinstitution['unternehmenAutosuggestObject'].name1
                };
            }
        }
        kostenDataToSave.anzahlKurstage = this.formGroup.controls.anzahlKurstage.value;
        kostenDataToSave.anzahlLektionen = this.formGroup.controls.anzahlLektionen.value;
        kostenDataToSave.anzahlTeilnehmerMax = this.formGroup.controls.anzahlTeilnehmerMax.value;

        return kostenDataToSave;
    }

    mapToForm(kostenDto: SessionKostenDTO, massnahmeDto: MassnahmeDTO): any {
        return {
            kurskosten: kostenDto.kurskosten,
            materialkosten: kostenDto.materialkosten,
            pruefungskosten: kostenDto.pruefungskosten,
            kurskostenAn: kostenDto.kurskostenAnObject ? kostenDto.kurskostenAnObject.codeId : null,
            materialkostenAn: kostenDto.materialkostenAnObject ? kostenDto.materialkostenAnObject.codeId : null,
            pruefungskostenAn: kostenDto.pruefungskostenAnObject ? kostenDto.pruefungskostenAnObject.codeId : null,
            pruefungsinstitution: kostenDto.pruefungsinstitutionObject
                ? kostenDto.pruefungsinstitutionObject.unternehmenId !== 0
                    ? kostenDto.pruefungsinstitutionObject
                    : null
                : null,
            anzahlTeilnehmerMax: kostenDto.anzahlTeilnehmerMax,
            anzahlKurstage: kostenDto.anzahlKurstage,
            anzahlLektionen: kostenDto.anzahlLektionen,
            kurskostenTotal: kostenDto.kurskostenTotal,
            kostenProTag: kostenDto.kostenProTag,
            kostenProLektion: kostenDto.kostenProLektion,
            gueltigVon: massnahmeDto.gueltigVon,
            gueltigBis: massnahmeDto.gueltigBis
        };
    }

    mapData() {
        this.pruefungskostenAnOptions = this.handler.mapDropdown(this.kostenData.kurskostenZahlung);
        this.kursAndMaterialkostenAnOptions = this.pruefungskostenAnOptions.filter(item => {
            return item.code !== KurskostenZahlungCode.PRUEFUNGSINSTITUTION;
        });
    }

    isFormInvalid(): boolean {
        return this.formGroup.invalid;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }
}
