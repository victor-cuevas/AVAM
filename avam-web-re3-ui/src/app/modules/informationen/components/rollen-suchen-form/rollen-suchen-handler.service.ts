import { Injectable } from '@angular/core';
import { RolleSuchenParamDTO } from '@dtos/rolleSuchenParamDTO';
import { RollenSuchenReactiveFormsService } from '@modules/informationen/components/rollen-suchen-form/rollen-suchen-reactive-forms.service';
import { CodeDTO } from '@dtos/codeDTO';
import { FacadeService } from '@shared/services/facade.service';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { RollenSuchenFormData } from '@modules/informationen/components/rollen-suchen-form/rollen-suchen-form.data';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Injectable()
export class RollenSuchenHandlerService {
    private vollzugsregionen: DropdownOption[] = [];
    private benutzerstellen: DropdownOption[] = [];

    constructor(public reactive: RollenSuchenReactiveFormsService, public storageService: SearchSessionStorageService, private facade: FacadeService) {}

    mapToDTO(): RolleSuchenParamDTO {
        return {
            rolleName: this.reactive.searchForm.controls.bezeichnung.value,
            code: this.reactive.searchForm.controls.rollenId.value,
            vollTypeId: this.reactive.searchForm.controls.vollzugsregionenTyp.value,
            benutzerstellentypId: this.reactive.searchForm.controls.benutzerstellenTyp.value
        } as RolleSuchenParamDTO;
    }

    mapToFormData(): RollenSuchenFormData {
        return {
            bezeichnung: this.reactive.searchForm.controls.bezeichnung.value,
            rollenId: this.reactive.searchForm.controls.rollenId.value,
            vollzugsregionenTyp: this.reactive.searchForm.controls.vollzugsregionenTyp.value,
            benutzerstellenTyp: this.reactive.searchForm.controls.benutzerstellenTyp.value
        };
    }

    mapDropdown(vollzugsregionen: CodeDTO[], benutzerstellen: CodeDTO[]): void {
        this.vollzugsregionen = this.facade.formUtilsService.mapDropdownKurztext(vollzugsregionen);
        this.benutzerstellen = this.facade.formUtilsService.mapDropdownKurztext(benutzerstellen);
    }

    handle(formData: RollenSuchenFormData, stateKey: string, emitFct: Function): void {
        this.mapDropdown(formData.vollzugsregionen, formData.benutzerstellen);
        const state = this.storageService.restoreStateByKey(stateKey);
        if (state) {
            this.reactive.patch(state.fields);
            emitFct();
        } else {
            this.reactive.reset();
        }
    }

    get vollzugsregionenOptions() {
        return this.vollzugsregionen;
    }

    get benutzerstellenOptions() {
        return this.benutzerstellen;
    }
}
