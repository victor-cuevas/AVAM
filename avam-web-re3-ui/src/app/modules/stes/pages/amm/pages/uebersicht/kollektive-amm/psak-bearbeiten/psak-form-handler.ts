import { Permissions } from '@shared/enums/permissions.enum';
import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { ZeitplanDTO } from '@app/shared/models/dtos-generated/zeitplanDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmBuchungArbeitsplatzkategorieDTO } from '@app/shared/models/dtos-generated/ammBuchungArbeitsplatzkategorieDTO';
import { AmmBuchungPraktikumsstelleDTO } from '@app/shared/models/dtos-generated/ammBuchungPraktikumsstelleDTO';
import { FormUtilsService } from '@app/shared';

@Injectable()
export class PsakFormHandler {
    constructor(private formBuilder: FormBuilder, private authenticationService: AuthenticationService, private ammHelper: AmmHelper, private formUtils: FormUtilsService) {}

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
            ergaenzendeAngaben: null,
            taetigkeit: null,
            verfuegbarkeit: null,
            vormittags: this.createFormArray(),
            nachmittags: this.createFormArray(),
            arbeitszeiten: null,
            abfederung: null,
            vorstellungsgespraech: null,
            durchfuehrungsnr: null,
            anbieter: null,
            massnahmenverantwortung: null,
            dateRangeGroup: new FormGroup(
                {
                    durchfuehrungVon: new FormControl(null),
                    durchfuehrungBis: new FormControl(null),
                    buchungVon: new FormControl(null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]),
                    buchungBis: new FormControl(null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx])
                },
                [
                    DateValidator.checkPeriodGreaterThan12('buchungVon', 'buchungBis'),
                    DateValidator.rangeBetweenDates('buchungVon', 'buchungBis', 'val201', true, true),
                    DateValidator.val282('durchfuehrungVon', 'durchfuehrungBis', 'buchungVon', 'buchungBis') //Same as val281
                ]
            ),
            anwesenheitGroup: new FormGroup({
                beschaeftigungsgradMax: new FormControl(null),
                beschaeftigungsgrad: new FormControl(null, [Validators.required, NumberValidator.isPositiveInteger, NumberValidator.isValidPercentage]),
                anwesenheit: new FormControl(null, [Validators.required]),
                anwesenheitVormittags: this.createFormArray(),
                anwesenheitNachmittags: this.createFormArray()
            }),
            arbeitszeitenBuchung: null,
            bearbeitung: [null, [Validators.required]],
            buchungsnr: null,
            status: [null, [Validators.required]]
        });
    }

    private createFormArray() {
        return new FormArray([
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false)
        ]);
    }

    mapToDTO(form: FormGroup, ammBuchungParam: AmmBuchungParamDTO, statusOptions: CodeDTO[], verfuegbarkeitOptions: CodeDTO[]): AmmBuchungParamDTO {
        const statObj = statusOptions.find(el => el.codeId === +form.controls.status.value);
        const verfuegbarkeitObj = verfuegbarkeitOptions.find(el => el.codeId === +form.controls.anwesenheitGroup.value.anwesenheit);

        const ammBuchungObject: AmmBuchungArbeitsplatzkategorieDTO | AmmBuchungPraktikumsstelleDTO = this.ammHelper.getAmmBuchung(ammBuchungParam);
        const buchungObjectToSave: AmmBuchungArbeitsplatzkategorieDTO | AmmBuchungPraktikumsstelleDTO = {
            ...ammBuchungObject,
            buchungVon: this.formUtils.parseDate(form.controls.dateRangeGroup.value.buchungVon),
            buchungBis: this.formUtils.parseDate(form.controls.dateRangeGroup.value.buchungBis),
            benutzerDetailDTO: form.controls.bearbeitung['benutzerObject'],
            zeitplanObject: this.getZeitplanObject(form, ammBuchungObject.zeitplanObject, verfuegbarkeitObj),
            beschaeftigungsgrad: form.controls.anwesenheitGroup.value.beschaeftigungsgrad,
            statusId: form.controls.status.value,
            statusObject: statObj
        };

        return ammBuchungParam.ammBuchungArbeitsplatzkategorie
            ? { ...ammBuchungParam, ammBuchungArbeitsplatzkategorie: buchungObjectToSave }
            : { ...ammBuchungParam, ammBuchungPraktikumsstelle: buchungObjectToSave };
    }

    getBearbeiterSuchenTokens(ownerId: number) {
        const currentUser = this.authenticationService.getLoggedUser();

        return currentUser
            ? {
                  berechtigung: Permissions.AMM_NUTZUNG_BUCHUNG_BEARBEITEN,
                  myBenutzerstelleId: ownerId ? ownerId : currentUser.benutzerstelleId,
                  stati: DomainEnum.BENUTZER_STATUS_AKTIV,
                  benutzerstelleId: ownerId ? ownerId : currentUser.benutzerstelleId
              }
            : {};
    }

    getZeitplanObject(form: FormGroup, zeitplan: ZeitplanDTO, verfuegbarkeitObject: CodeDTO): ZeitplanDTO {
        const anwesenheitGroup = form.controls.anwesenheitGroup as FormGroup;

        return {
            ...zeitplan,
            verfuegbarkeitObject,
            arbeitszeitDe: form.controls.arbeitszeitenBuchung.value,
            arbeitszeitFr: form.controls.arbeitszeitenBuchung.value,
            arbeitszeitIt: form.controls.arbeitszeitenBuchung.value,
            moV: anwesenheitGroup.controls.anwesenheitVormittags.value[0],
            diV: anwesenheitGroup.controls.anwesenheitVormittags.value[1],
            miV: anwesenheitGroup.controls.anwesenheitVormittags.value[2],
            doV: anwesenheitGroup.controls.anwesenheitVormittags.value[3],
            frV: anwesenheitGroup.controls.anwesenheitVormittags.value[4],
            saV: anwesenheitGroup.controls.anwesenheitVormittags.value[5],
            soV: anwesenheitGroup.controls.anwesenheitVormittags.value[6],
            moN: anwesenheitGroup.controls.anwesenheitNachmittags.value[0],
            diN: anwesenheitGroup.controls.anwesenheitNachmittags.value[1],
            miN: anwesenheitGroup.controls.anwesenheitNachmittags.value[2],
            doN: anwesenheitGroup.controls.anwesenheitNachmittags.value[3],
            frN: anwesenheitGroup.controls.anwesenheitNachmittags.value[4],
            saN: anwesenheitGroup.controls.anwesenheitNachmittags.value[5],
            soN: anwesenheitGroup.controls.anwesenheitNachmittags.value[6]
        };
    }

    getBuchungsNr(buchung) {
        return buchung ? buchung.buchungsNr : null;
    }

    getVerfugbarkeitId(zeitplanObject: ZeitplanDTO): string {
        return !zeitplanObject ? null : zeitplanObject.verfuegbarkeitObject ? `${zeitplanObject.verfuegbarkeitObject.codeId}` : null;
    }

    setVormittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moV, zeitplanObject.diV, zeitplanObject.miV, zeitplanObject.doV, zeitplanObject.frV, zeitplanObject.saV, zeitplanObject.soV];
    }

    setNachmittags(zeitplanObject: ZeitplanDTO) {
        return [zeitplanObject.moN, zeitplanObject.diN, zeitplanObject.miN, zeitplanObject.doN, zeitplanObject.frN, zeitplanObject.saN, zeitplanObject.soN];
    }
}
