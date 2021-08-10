import { FormGroup, FormBuilder } from '@angular/forms';
import { BenutzerstelleSucheParamsModel } from '@app/modules/stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { BenutzerstellenQueryDTO } from '@dtos/benutzerstellenQueryDTO';
import { PlzDTO } from '@dtos/plzDTO';
import { AutosuggestValidator } from '@shared/validators/autosuggest-validator';

export class StesBenutzerstelleSucheFormbuilder {
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {}

    initForm(uebergebeneDaten: BenutzerstelleSucheParamsModel): FormGroup {
        this.searchForm = this.formBuilder.group({
            statusId: uebergebeneDaten ? uebergebeneDaten.status : '',
            benutzerstelle: '',
            strasse: '',
            strasseNr: '',
            postleitzahl: '',
            ort: '',
            kantonId: uebergebeneDaten ? uebergebeneDaten.kanton : '',
            benutzerstelleIdVon: '',
            benutzerstelleIdBis: '',
            benutzerstellenASVon: [null, AutosuggestValidator.val216],
            benutzerstellenASBis: [null, AutosuggestValidator.val216],
            benutzerstelleTypId: uebergebeneDaten ? uebergebeneDaten.benutzerstellentyp : '',
            vollzugsregion: null,
            vollzugsregionTypeId: uebergebeneDaten ? uebergebeneDaten.vollzugsregiontyp : ''
        });

        return this.searchForm;
    }

    mapToDTO(isMultiselect: boolean): BenutzerstellenQueryDTO {
        return {
            gueltigkeit: this.searchForm.controls.statusId.value,
            name: this.searchForm.controls.benutzerstelle.value,
            strasse: this.searchForm.controls.strasse.value,
            nummer: this.searchForm.controls.strasseNr.value,
            plzDTO: this.mapToPlzDTO(this.searchForm['plzWohnAdresseObject']),
            kanton: this.searchForm.controls.kantonId.value,
            benutzerstelleCodeVon: this.getBenutzerstelleCodeVon(isMultiselect),
            benutzerstelleCodeBis: this.getBenutzerstelleCodeBis(isMultiselect),
            benutzerstelleTypeId: this.searchForm.controls.benutzerstelleTypId.value,
            vollzugsregionId:
                this.searchForm.controls.vollzugsregion.value && this.searchForm.controls.vollzugsregion.value.id ? this.searchForm.controls.vollzugsregion.value.id : 0,
            vollzugsregionTypeId: this.searchForm.controls.vollzugsregionTypeId.value
        };
    }

    /**
     * Maps the data from the plz-autosuggest to a PlzDTO.
     *
     * @private
     * @param value
     * @returns PlzDTO
     * @memberof AvamUnternehmenSucheComponent
     */
    private mapToPlzDTO(value: any): PlzDTO {
        if (!value || (!value.ortWohnadresseAusland && !value.plzWohnadresseAusland)) {
            return null;
        }

        const plzDTO: PlzDTO = { plzId: -1, ortDe: value.ortWohnadresseAusland, postleitzahl: value.plzWohnadresseAusland };

        return !value.plzId || value.plzId === -1 ? plzDTO : { ...plzDTO, plzId: value.plzId, ortFr: value.ortFr, ortIt: value.ortIt };
    }

    private getBenutzerstelleCodeVon(isMultiselect: boolean): string {
        if (isMultiselect) {
            return this.mapBenutzerstellenASCode(this.searchForm.controls.benutzerstellenASVon.value);
        } else {
            return this.searchForm.controls.benutzerstelleIdVon.value;
        }
    }

    private getBenutzerstelleCodeBis(isMultiselect: boolean): string {
        if (isMultiselect) {
            return this.mapBenutzerstellenASCode(this.searchForm.controls.benutzerstellenASBis.value);
        } else {
            return this.searchForm.controls.benutzerstelleIdBis.value;
        }
    }

    private mapBenutzerstellenASCode(value: any): string {
        if (value && value.hasOwnProperty('code')) {
            return value.code;
        }
        return value;
    }
}
