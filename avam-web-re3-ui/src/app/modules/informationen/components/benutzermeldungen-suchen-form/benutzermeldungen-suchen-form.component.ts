import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { BenutzermeldungenSuchenHandlerService } from '@modules/informationen/components/benutzermeldungen-suchen-form/benutzermeldungen-suchen-handler.service';
import { BenutzermeldungenSuchenReactiveFormsService } from '@modules/informationen/components/benutzermeldungen-suchen-form/benutzermeldungen-suchen-reactive-forms.service';
import { FacadeService } from '@shared/services/facade.service';
import { CodeDTO } from '@dtos/codeDTO';
import { KantonDTO } from '@dtos/kantonDTO';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { AvamMultiselectComponent } from '@app/library/wrappers/form/avam-multiselect/avam-multiselect.component';
import { BenutzerMeldungSuchenParamDTO } from '@dtos/benutzerMeldungSuchenParamDTO';

export interface BenutzermeldungenFormData {
    meldungstyp: CodeDTO[];
    stati: CodeDTO[];
    kantone: KantonDTO[];
}

@Component({
    selector: 'avam-benutzermeldungen-suchen-form',
    templateUrl: './benutzermeldungen-suchen-form.component.html',
    styleUrls: ['./benutzermeldungen-suchen-form.component.scss'],
    providers: [BenutzermeldungenSuchenHandlerService, BenutzermeldungenSuchenReactiveFormsService]
})
export class BenutzermeldungenSuchenFormComponent implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('statusMultiselect') statusMultiselect: AvamMultiselectComponent;

    @Input() formData: any;
    @Input() stateKey: string;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    searchForm: FormGroup;
    meldungstypOptions: any[];
    meldungstatusOptions: any[];
    kantoneOptions: any[];
    benutzerstelleSuchenTokens: any = {};
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.DEFAULT;
    private statusPendentCodeId: number;
    private readonly STATUS_PENDENT_CODE = 'MeldStat1';

    constructor(private handler: BenutzermeldungenSuchenHandlerService, private obliqueHelper: ObliqueHelperService, private facadeService: FacadeService) {
        this.searchForm = handler.reactiveForm.searchForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.formData.currentValue) {
            this.mapData(changes.formData.currentValue);
        }
    }

    mapToDto(): BenutzerMeldungSuchenParamDTO {
        return this.handler.mapToDto();
    }

    private mapData(currentValue: any): void {
        this.meldungstypOptions = currentValue.meldungstyp.map(this.facadeService.formUtilsService.mapMultiselectOption);
        this.meldungstatusOptions = currentValue.stati.map(this.facadeService.formUtilsService.mapMultiselectOption);
        this.statusPendentCodeId = currentValue.stati.filter(s => s.code === this.STATUS_PENDENT_CODE)[0].codeId;
        this.kantoneOptions = currentValue.kantone.map(this.handler.kantoneMapper);
        this.setDefaultStatus();
    }

    private setDefaultStatus(): void {
        this.meldungstatusOptions.forEach(option => {
            option.value = option.id === this.statusPendentCodeId;
        });
    }
}
