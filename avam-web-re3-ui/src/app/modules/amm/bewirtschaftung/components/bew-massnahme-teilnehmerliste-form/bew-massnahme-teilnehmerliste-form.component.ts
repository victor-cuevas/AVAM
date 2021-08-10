import { Component, OnInit, Input, ViewChild, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroupDirective, FormGroup } from '@angular/forms';
import { BewMassnahmeTeilnehmerlisteReactiveFormsService } from './bew-massnahme-teilnehmerliste-reactive-forms.service';
import { MassnahmeTeilnehmerlisteHandlerService } from './bew-massnahme-teilnehmerliste-handler.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { AmmTeilnehmerlisteBuchungenParamDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteBuchungenParamDTO';
import { FormUtilsService } from '@app/shared';
import { DropdownOption } from '@app/shared/services/forms/form-utils.service';
import { ZeitraumfilterCode } from '@app/shared/enums/domain-code/zeitraumfilter.enum';
import { FacadeService } from '@shared/services/facade.service';

export interface FiltersData {
    massnahmeId?: number;
    dfeId?: number;
    beschaeftigungseinheitId?: number;
    zeitraumfilterOptions?: CodeDTO[];
}

@Component({
    selector: 'avam-bew-massnahme-teilnehmerliste-form',
    templateUrl: './bew-massnahme-teilnehmerliste-form.component.html',
    providers: [BewMassnahmeTeilnehmerlisteReactiveFormsService, MassnahmeTeilnehmerlisteHandlerService]
})
export class BewMassnahmeTeilnehmerlisteFormComponent implements OnInit, OnChanges {
    @Input('data') data: FiltersData;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Output() onDataRefresh: EventEmitter<any> = new EventEmitter();

    public formGroup: FormGroup;
    zeitraumfilterOptions: DropdownOption[];
    teilnehmerlisteBuchungenDto: AmmTeilnehmerlisteBuchungenParamDTO;

    hideVonBis = false;

    constructor(public handler: MassnahmeTeilnehmerlisteHandlerService, private obliqueHelper: ObliqueHelperService, private facade: FacadeService) {
        this.formGroup = handler.reactiveForms.searchForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue) {
            this.mapData();
        }
    }

    refresh() {
        this.onDataRefresh.emit();
    }

    mapToDto(data: FiltersData): AmmTeilnehmerlisteBuchungenParamDTO {
        return this.handler.mapToDTO(this.teilnehmerlisteBuchungenDto, data);
    }

    mapToForm() {
        this.formGroup.reset(this.handler.mapToForm(this.teilnehmerlisteBuchungenDto, this.zeitraumfilterOptions));
        if (this.data && this.data.zeitraumfilterOptions) {
            this.handler.reactiveForms.setDynamicValidations(this.data.zeitraumfilterOptions);
        }
    }

    onZeitraumfilterChange(zeitraumfilterCodeId: string) {
        if (this.data && this.data.zeitraumfilterOptions) {
            this.handler.reactiveForms.setDynamicValidations(this.data.zeitraumfilterOptions);
        }

        this.hideVonBis = zeitraumfilterCodeId === this.facade.formUtilsService.getCodeIdByCode(this.zeitraumfilterOptions, ZeitraumfilterCode.TEILNAHME_OHNE_ZEITRAUM);

        if (this.hideVonBis) {
            this.handler.reactiveForms.setCurrentDate();
        }
    }

    private mapData() {
        this.zeitraumfilterOptions = this.facade.formUtilsService.mapDropdown(this.data.zeitraumfilterOptions);
    }
}
