import { CodeDTO } from '@dtos/codeDTO';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { FacadeService } from '@shared/services/facade.service';
import { Injectable } from '@angular/core';
import { RollenGrunddatenReactiveFormService } from '@modules/informationen/components/rollen-grunddaten-form/rollen-grunddaten-reactive-form.service';
import { RolleDTO } from '@dtos/rolleDTO';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';

@Injectable()
export class RollenGrunddatenHandler {
    constructor(private facade: FacadeService, public reactiveForm: RollenGrunddatenReactiveFormService) {}

    mapToForm(dto: RolleDTO, benutzerstellentypOptions: CoreMultiselectInterface[]): object {
        return {
            rollede: dto.textDe,
            rollefr: dto.textFr,
            rolleit: dto.textIt,
            vollzugsregiontyp: dto.vollTypeId,
            gueltigab: this.asNullableDate(dto.gueltigAb),
            gueltigbis: this.asNullableDate(dto.gueltigBis),
            rollecode: dto.code,
            dmsrolle: dto.dmsRolle,
            benutzerstellentyp: this.mapToMultiselect(dto.benutzerstelleTypList, benutzerstellentypOptions),
            rolleId: dto.rolleId
        };
    }

    private mapToMultiselect(benutzerstelleTypList: CodeDTO[], benutzerstellentypOptions: CoreMultiselectInterface[]): CoreMultiselectInterface[] {
        const seletedBenutzerstellTypIdList = benutzerstelleTypList.map(b => b.codeId.toString());
        benutzerstellentypOptions.forEach(o => {
            o.value = seletedBenutzerstellTypIdList.indexOf(o.id) !== -1;
        });
        return benutzerstellentypOptions;
    }

    mapMultiselect(benutzerstellentyp: CodeDTO[]): CoreMultiselectInterface[] {
        return benutzerstellentyp.map(o => ({
            id: o.codeId.toString(),
            value: false,
            textDe: o.textDe,
            textFr: o.textFr,
            textIt: o.textIt
        }));
    }

    mapToDto(originalDto: RolleDTO): RolleDTO {
        const controls = this.reactiveForm.form.controls;
        return {
            ...originalDto,
            gueltigAb: controls.gueltigab.value,
            gueltigBis: controls.gueltigbis.value,
            rolleId: controls.rolleId.value,
            vollTypeId: controls.vollzugsregiontyp.value,
            textDe: controls.rollede.value,
            textFr: controls.rollefr.value,
            textIt: controls.rolleit.value,
            code: controls.rollecode.value,
            benutzerstelleTypList: this.mapMultiselectToDto(controls.benutzerstellentyp.value),
            dmsRolle: controls.dmsrolle.value
        };
    }

    private mapMultiselectToDto(values: CoreMultiselectInterface[]): CodeDTO[] {
        return values
            .filter(value => value.value)
            .map(value => ({
                codeId: parseInt(value.id)
            }));
    }

    private asNullableDate(date: Date) {
        if (!date) {
            return null;
        }

        return new Date(date);
    }
}
