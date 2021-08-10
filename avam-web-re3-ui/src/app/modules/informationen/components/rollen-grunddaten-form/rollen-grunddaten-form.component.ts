import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { RollenGrunddatenHandler } from '@modules/informationen/components/rollen-grunddaten-form/rollen-grunddaten-handler.service';
import { RollenGrunddatenReactiveFormService } from '@modules/informationen/components/rollen-grunddaten-form/rollen-grunddaten-reactive-form.service';
import { RolleDTO } from '@dtos/rolleDTO';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-rollen-grunddaten-form',
    templateUrl: './rollen-grunddaten-form.component.html',
    providers: [RollenGrunddatenHandler, RollenGrunddatenReactiveFormService]
})
export class RollenGrunddatenFormComponent {
    @Input() data: RollenGrunddatenFormData;
    @Input() codeReadOnly = true;

    vollzugsregiontyp: any;
    benutzerstellentyp: CoreMultiselectInterface[];

    form: FormGroup;

    @ViewChild('ngForm')
    ngForm: FormGroupDirective;

    constructor(private handler: RollenGrunddatenHandler, private facade: FacadeService) {
        this.form = this.handler.reactiveForm.form;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data.currentValue) {
            this.benutzerstellentyp = this.handler.mapMultiselect(this.data.benutzerstellentyp);
            this.vollzugsregiontyp = this.facade.formUtilsService.mapDropdownKurztext(this.data.vollzugsregiontyp);
            if (this.data.dto) {
                this.form.reset(this.handler.mapToForm(this.data.dto, this.benutzerstellentyp));
            }
        }
    }

    mapToDto(originalDto: RolleDTO): RolleDTO {
        return this.handler.mapToDto(originalDto);
    }
}

export interface RollenGrunddatenFormData {
    vollzugsregiontyp: CodeDTO[];
    benutzerstellentyp: CodeDTO[];
    dto: RolleDTO;
}
