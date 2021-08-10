import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { UnternehmenRestService } from '@app/core/http/unternehmen-rest.service';
import { BurOertlicheEinheitDTO } from '@app/shared/models/dtos-generated/burOertlicheEinheitDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { CheckboxValidator } from '@app/shared/validators/checkbox-validator';
import { DateValidator } from '@app/shared/validators/date-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { TwoFieldsAutosuggestValidator } from '@app/shared/validators/two-fields-autosuggest-validator';
import { SpinnerService } from 'oblique-reactive';
import { distinctUntilChanged } from 'rxjs/operators';
import { DropdownOption } from '@shared/services/forms/form-utils.service';

@Injectable()
export class SchnellzuweisungFormHandler {
    constructor(
        private formBuilder: FormBuilder,
        private dataService: StesDataRestService,
        private unternehmenRestService: UnternehmenRestService,
        private spinnerService: SpinnerService
    ) {}

    createForm(editMode: boolean): FormGroup {
        const schnellzuweisungForm = this.formBuilder.group(
            {
                schnellzuweisungVom: [new Date(), [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.isDateInFutureNgx]],
                bewerbungBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                vermittlung: [null, Validators.required],
                arbeitgeberName1: [null, Validators.required],
                unternehmenId: null,
                arbeitgeberName2: null,
                arbeitgeberName3: null,
                arbeitgeberStrasse: null,
                arbeitgeberStrasseNr: null,
                plz: this.formBuilder.group({
                    postleitzahl: null,
                    ort: null
                }),
                unternehmenPostfach: [null, NumberValidator.isPositiveInteger],
                postfach: this.formBuilder.group({
                    postleitzahl: null,
                    ort: null
                }),
                land: [null, Validators.required],
                kontaktperson: null,
                kontaktpersonForm: this.formBuilder.group({
                    kontaktpersonName: null,
                    kontaktpersonVorname: null,
                    anrede: null,
                    kontaktpersonTelefon: [null, PhoneValidator.isValidFormatWarning],
                    kontaktpersonEmail: [null, EmailValidator.isValidFormat]
                }),
                stellenbezeichnung: [null, Validators.required],
                berufTaetigkeit: null,
                vermittlungsGrad: 100,
                checkboxForm: this.buildCheckboxForm(),
                email: [null, EmailValidator.isValidFormat],
                onlineFormular: null,
                telefon: [null, PhoneValidator.isValidFormatWarning],
                ojbVersion: null
            },
            {
                validators: [
                    DateValidator.rangeBetweenDatesWarning('schnellzuweisungVom', 'bewerbungBis', 'val206'),
                    TwoFieldsAutosuggestValidator.plzCrossValidator('plz', 'postfach', 'postleitzahl', 'ort', 'postleitzahl', 'ort')
                ]
            }
        );
        if (editMode) {
            schnellzuweisungForm.addControl('vermittlungsNr', new FormControl(null));
            schnellzuweisungForm.addControl('status', new FormControl(null, Validators.required));
            schnellzuweisungForm.addControl('vermittlungsergebnis', new FormControl(null));
            schnellzuweisungForm.addControl('ergaenzendeAngaben', new FormControl(null));
            schnellzuweisungForm.addControl('rueckmeldungStes', new FormControl(null));
            schnellzuweisungForm.addControl('rueckmeldungArbeitgeber', new FormControl(null));
        }

        return schnellzuweisungForm;
    }

    buildCheckboxForm(): FormGroup {
        return this.formBuilder.group(
            {
                schriftlich: true,
                persoenlich: false,
                elektronisch: false,
                telefonisch: false
            },
            { validator: CheckboxValidator.required(1) }
        );
    }

    defineFormGroups(schnellzuweisungForm: FormGroup): FormGroup {
        const checkboxForm = schnellzuweisungForm.get('checkboxForm') as FormGroup;

        return checkboxForm;
    }

    setAdditionalValidators(checkboxForm: FormGroup, schnellzuweisungForm: FormGroup) {
        this.setCheckboxValidators(checkboxForm, schnellzuweisungForm);
        this.setKontaktpersonValidators(schnellzuweisungForm);
        this.checkVermittlungsGrad(schnellzuweisungForm);
    }

    setCheckboxValidators(checkboxForm: FormGroup, schnellzuweisungForm: FormGroup) {
        this.setOnlineBewerbungValidators(checkboxForm, schnellzuweisungForm);
        this.setTelefonValidator(checkboxForm, schnellzuweisungForm);
    }

    setKontaktpersonValidators(schnellzuweisungForm: FormGroup) {
        const kontaktpersonForm = schnellzuweisungForm.controls.kontaktpersonForm as FormGroup;
        const anrede = kontaktpersonForm.controls.anrede as FormControl;
        const kontaktpersonName = kontaktpersonForm.controls.kontaktpersonName as FormControl;
        const kontaktperson = schnellzuweisungForm.controls.kontaktperson as FormControl;
        anrede.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (anrede.value) {
                kontaktpersonName.setValidators(Validators.required);
            } else {
                kontaktpersonName.setValidators(null);
            }
            kontaktpersonName.updateValueAndValidity();
        });
        kontaktpersonForm.valueChanges.subscribe(() => {
            if (kontaktperson.value) {
                kontaktperson.setValue(null);
            }
        });
    }

    setOnlineBewerbungValidators(checkboxForm: FormGroup, schnellzuweisungForm: FormGroup) {
        const elektronisch = checkboxForm.controls.elektronisch as FormControl;
        const email = schnellzuweisungForm.controls.email as FormControl;
        const onlineFormular = schnellzuweisungForm.controls.onlineFormular as FormControl;
        elektronisch.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (!elektronisch.value) {
                email.setValidators(EmailValidator.isValidFormat);
                email.setValue(null);
                onlineFormular.setValidators(null);
                onlineFormular.setValue(null);
            } else {
                if (!email.value) {
                    onlineFormular.setValidators(Validators.required);
                }
                if (!onlineFormular.value) {
                    email.setValidators([Validators.required, EmailValidator.isValidFormat]);
                }
            }
            email.updateValueAndValidity();
            onlineFormular.updateValueAndValidity();
        });

        email.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (!elektronisch.value) {
                onlineFormular.setValidators(null);
                return;
            }
            if (email.value) {
                onlineFormular.setValidators(null);
            } else {
                onlineFormular.setValidators(Validators.required);
            }
            onlineFormular.updateValueAndValidity();
        });

        onlineFormular.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (!elektronisch.value) {
                email.setValidators(EmailValidator.isValidFormat);
                return;
            }
            if (onlineFormular.value) {
                email.setValidators(EmailValidator.isValidFormat);
            } else {
                email.setValidators([Validators.required, EmailValidator.isValidFormat]);
            }
            email.updateValueAndValidity();
        });
    }

    setTelefonValidator(checkboxForm: FormGroup, schnellzuweisungForm: FormGroup) {
        const telefonisch = checkboxForm.controls.telefonisch as FormControl;
        const telefon = schnellzuweisungForm.controls.telefon as FormControl;
        telefonisch.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (telefonisch.value) {
                telefon.setValidators([Validators.required, PhoneValidator.isValidFormatWarning]);
            } else {
                telefon.setValidators(PhoneValidator.isValidFormatWarning);
                telefon.setValue(null);
            }
            telefon.updateValueAndValidity();
        });
    }

    checkVermittlungsGrad(schnellzuweisungForm: FormGroup) {
        const vermittlungsGrad = schnellzuweisungForm.controls.vermittlungsGrad as FormControl;
        vermittlungsGrad.valueChanges.subscribe(() => {
            const testedValue = vermittlungsGrad.value;
            if (!Number.isInteger(Number(testedValue))) {
                vermittlungsGrad.setErrors({ val009: true });
            }
            if (testedValue !== '' && (testedValue < 1 || testedValue > 100)) {
                vermittlungsGrad.setErrors({ val116: true });
            }
        });
    }

    mapOnlineFormularToDTO(urlValue: string): string {
        let newUrl = urlValue;
        if (newUrl !== null) {
            newUrl = newUrl.trim();
            if (newUrl !== '' && !newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                newUrl = `http://${newUrl}`;
            }
        }
        return newUrl;
    }

    mapSelectedUnternehmenToForm(data: any, schnellzuweisungForm: FormGroup, schnellzuweisungChannel: string) {
        this.spinnerService.activate(schnellzuweisungChannel);
        if (data.hasOwnProperty('unternehmenId')) {
            this.unternehmenRestService.getUnternehmenById(data.unternehmenId).subscribe(
                unternehmen => {
                    this.setUnternehmen(unternehmen, schnellzuweisungForm);
                    this.spinnerService.deactivate(schnellzuweisungChannel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(schnellzuweisungChannel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
        } else {
            this.dataService.getBurOrtEinheitById(data.burOrtEinheitId).subscribe(
                response => {
                    this.setBurOrtEinheit(response.data, schnellzuweisungForm);
                    this.spinnerService.deactivate(schnellzuweisungChannel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(schnellzuweisungChannel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
        }
    }

    setBurOrtEinheit(bur: BurOertlicheEinheitDTO, schnellzuweisungForm: FormGroup) {
        schnellzuweisungForm.controls.unternehmenId.setValue(null);
        schnellzuweisungForm.controls.arbeitgeberName1.setValue(bur.letzterAGName1);
        schnellzuweisungForm.controls.arbeitgeberName2.setValue(bur.letzterAGName2);
        schnellzuweisungForm.controls.arbeitgeberName3.setValue(bur.letzterAGName3);
        schnellzuweisungForm.controls.arbeitgeberStrasse.setValue(bur.street);
        schnellzuweisungForm.controls.arbeitgeberStrasseNr.setValue(bur.streetNr);
        if (bur.letzterAGPlzDTO) {
            schnellzuweisungForm.controls.plz.patchValue({ postleitzahl: bur.letzterAGPlzDTO, ort: bur.letzterAGPlzDTO });
        } else {
            schnellzuweisungForm.controls.plz.patchValue({ postleitzahl: null, ort: null });
        }
        schnellzuweisungForm.controls.unternehmenPostfach.setValue(bur.postfachNr && bur.postfachNr > 0 ? bur.postfachNr : null);

        if (bur.postfachPlzDTO) {
            schnellzuweisungForm.controls.postfach.patchValue({ postleitzahl: bur.postfachPlzDTO, ort: bur.postfachPlzDTO });
        } else {
            schnellzuweisungForm.controls.postfach.patchValue({ postleitzahl: null, ort: null });
        }
        schnellzuweisungForm.controls.land.setValue(bur.letzterAGLand);
    }

    setUnternehmen(unternehmen: UnternehmenDTO, schnellzuweisungForm: FormGroup) {
        schnellzuweisungForm.controls.unternehmenId.reset(unternehmen.unternehmenId);
        schnellzuweisungForm.controls.arbeitgeberName2.reset(unternehmen.name2);
        schnellzuweisungForm.controls.arbeitgeberName3.reset(unternehmen.name3);
        schnellzuweisungForm.controls.arbeitgeberStrasse.reset(unternehmen.strasse);
        schnellzuweisungForm.controls.arbeitgeberStrasseNr.reset(unternehmen.strasseNr);
        if (unternehmen.plz) {
            schnellzuweisungForm.controls.plz.reset({ postleitzahl: unternehmen.plz, ort: unternehmen.plz });
        } else {
            schnellzuweisungForm.controls.plz.reset({ postleitzahl: unternehmen.plzAusland, ort: unternehmen.ortAusland });
        }

        schnellzuweisungForm.controls.unternehmenPostfach.reset(unternehmen.postfach);

        if (unternehmen.postfachPlzObject) {
            schnellzuweisungForm.controls.postfach.reset({ postleitzahl: unternehmen.postfachPlzObject, ort: unternehmen.postfachPlzObject });
        } else {
            schnellzuweisungForm.controls.postfach.reset({ postleitzahl: unternehmen.postfachPlzAusland, ort: unternehmen.postfachPlzOrtAusland });
        }
        schnellzuweisungForm.controls.land.reset(unternehmen.staat);
    }

    onKontaktpersonSelected(kontaktperson: KontakteViewDTO, schnellzuweisungForm: FormGroup) {
        schnellzuweisungForm.markAsDirty();
        const kontaktpersonForm = schnellzuweisungForm.controls.kontaktpersonForm as FormGroup;
        kontaktpersonForm.patchValue({
            anrede: kontaktperson.anredeId,
            kontaktpersonName: kontaktperson.name,
            kontaktpersonVorname: kontaktperson.vorname,
            kontaktpersonTelefon: kontaktperson.telefonNr,
            kontaktpersonEmail: kontaktperson.email
        });
    }

    onKontaktpersonClear(schnellzuweisungForm: FormGroup) {
        const kontaktpersonForm = schnellzuweisungForm.controls.kontaktpersonForm as FormGroup;
        kontaktpersonForm.patchValue({
            anrede: null,
            kontaktpersonName: null,
            kontaktpersonVorname: null,
            kontaktpersonTelefon: null,
            kontaktpersonEmail: null
        });
    }

    isArbeitgeberDirty(schnellzuweisungForm: FormGroup, unternehmenId: number) {
        const controls = schnellzuweisungForm.controls;

        return (
            !unternehmenId ||
            controls.arbeitgeberName2.dirty ||
            controls.arbeitgeberName3.dirty ||
            controls.arbeitgeberStrasse.dirty ||
            controls.arbeitgeberStrasseNr.dirty ||
            controls.plz.dirty ||
            controls.unternehmenPostfach.dirty ||
            controls.postfach.dirty ||
            controls.land.dirty
        );
    }
}
