import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { KontakteViewDTO } from '@dtos/kontakteViewDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { Unsubscribable } from 'oblique-reactive';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CheckboxValidator } from '@shared/validators/checkbox-validator';
import { PhoneValidator } from '@shared/validators/phone-validator';
import { EmailValidator } from '@shared/validators/email-validator';
import { NumberValidator } from '@shared/validators/number-validator';
import { OsteDTO } from '@dtos/osteDTO';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { TextValidator } from '@shared/validators/text-validator';
import { CommonInfoFieldsComponent } from '@shared/components/unternehmen/common/common-info-fields/common-info-fields.component';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-step3-oste-erfassen-form',
    templateUrl: './step3-oste-erfassen-form.component.html',
    styleUrls: ['./step3-oste-erfassen-form.component.scss']
})
export class Step3OsteErfassenFormComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('adresseFormComponent') adresseFormComponent: CommonInfoFieldsComponent;
    @Input() activeFields = true;
    @Input() unternehmenDTO: UnternehmenResponseDTO;
    bewerbungCompleteForm: FormGroup;
    adresseForm: FormGroup;
    kontakpersonForm: FormGroup;
    fragenZuStelleForm: FormGroup;
    checkboxForm: FormGroup;
    unternehmenId = +this.activatedRoute.snapshot.parent.params.unternehmenId || +this.activatedRoute.snapshot.parent.parent.params.unternehmenId;
    anredeOptions: CodeDTO[] = [];
    dataLoaded = new Subject<void>();

    constructor(private fb: FormBuilder, private dataService: StesDataRestService, private activatedRoute: ActivatedRoute, private facade: FacadeService) {
        super();
    }

    ngOnInit() {
        this.generateForm();
        this.setAdditionalValidation();
    }

    ngAfterViewInit(): void {
        this.getInitialData();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public isAnyFormDirty() {
        return this.bewerbungCompleteForm.dirty || this.adresseForm.dirty || this.kontakpersonForm.dirty || this.fragenZuStelleForm.dirty || this.checkboxForm.dirty;
    }

    public makeAllFormPristine() {
        this.bewerbungCompleteForm.markAsPristine();
        this.checkboxForm.markAsPristine();
        this.adresseForm.markAsPristine();
        this.fragenZuStelleForm.markAsPristine();
        this.kontakpersonForm.markAsPristine();
    }

    onKontaktpersonClear() {
        this.kontakpersonForm.patchValue({
            kontaktperson: null,
            anrede: null,
            name: null,
            vorname: null,
            telefon: null,
            email: null
        });
    }

    onFrageZuStelleClear() {
        this.fragenZuStelleForm.patchValue({
            kontaktperson: null,
            anrede: null,
            name: null,
            vorname: null,
            telefon: null,
            email: null
        });
    }

    kontaktpersonSelected(kontaktperson: KontakteViewDTO) {
        this.kontakpersonForm.markAsDirty();
        this.kontakpersonForm.patchValue({
            kontaktperson: this.setKontaktPerson(kontaktperson),
            anrede: kontaktperson.anredeId,
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            telefon: kontaktperson.telefonNr,
            email: kontaktperson.email
        });
        this.kontakpersonForm.updateValueAndValidity();
    }

    frageZuStelleSelected(kontaktperson: KontakteViewDTO) {
        this.fragenZuStelleForm.markAsDirty();
        this.fragenZuStelleForm.patchValue({
            kontaktperson: this.setKontaktPerson(kontaktperson),
            anrede: kontaktperson.anredeId,
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            telefon: kontaktperson.telefonNr,
            email: kontaktperson.email
        });
        this.fragenZuStelleForm.updateValueAndValidity();
    }

    public copyEmailKontaktperson() {
        this.bewerbungCompleteForm.controls.elektronischEmail.setValue(this.kontakpersonForm.controls.email.value);
    }

    public copyTelefonKontaktperson() {
        this.bewerbungCompleteForm.controls.telefon.setValue(this.kontakpersonForm.controls.telefon.value);
    }

    mapToForm(osteDTO: OsteDTO) {
        this.bewerbungCompleteForm.patchValue(
            {
                telefon: osteDTO.unternehmenTelefon,
                onlineFormular: osteDTO.unternehmenUrl,
                elektronischEmail: osteDTO.unternehmenEmail,
                ergaenzendeAngaben: osteDTO.bewerAngaben
            },
            { emitEvent: false, onlySelf: true }
        );
        this.mapToCheckboxForm(osteDTO);
        this.mapToAdressForm(osteDTO);
        this.mapToKontaktPerson(osteDTO);
        this.mapTofragenZuStelle(osteDTO);
    }

    resetAdresseForm() {
        const schriftlich = !this.checkboxForm.controls.schriftlich.value;
        const persoenlich = !this.checkboxForm.controls.persoenlich.value;
        if (schriftlich && persoenlich) {
            this.adresseForm.reset();
        }
    }

    private generateForm() {
        this.bewerbungCompleteForm = this.fb.group(
            {
                ergaenzendeAngaben: null,
                elektronischEmail: [null, EmailValidator.isValidFormat],
                onlineFormular: null,
                telefon: [null, PhoneValidator.isValidFormatWarning]
            },
            { validators: TextValidator.twoFieldCrossValidator('elektronischEmail', 'onlineFormular') }
        );

        this.checkboxForm = this.generateBewerbungsForm();
        this.kontakpersonForm = this.fb.group(this.generateKontaktPersonForm());
        this.fragenZuStelleForm = this.fb.group(this.generateKontaktPersonForm());
        this.adresseForm = this.generateAdressForm();
        this.setElektronishValidators(this.bewerbungCompleteForm);
        this.setTelefonishValidators(this.bewerbungCompleteForm);
        const schriftlich = this.checkboxForm.get('schriftlich') as FormControl;
        const persoenlich = this.checkboxForm.get('persoenlich') as FormControl;
        schriftlich.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => this.setAdressValidators(value, persoenlich));
        persoenlich.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => this.setAdressValidators(value, schriftlich));
        this.setKontaktpersonValidators(this.kontakpersonForm);
        this.setKontaktpersonValidators(this.fragenZuStelleForm);
    }

    private generateKontaktPersonForm() {
        return {
            kontaktperson: null,
            anrede: null,
            name: null,
            vorname: null,
            telefon: [null, PhoneValidator.isValidFormatWarning],
            email: [null, EmailValidator.isValidFormat]
        };
    }

    private generateBewerbungsForm() {
        return this.fb.group(
            {
                schriftlich: false,
                persoenlich: false,
                elektronisch: false,
                telefonisch: false
            },
            { validators: [CheckboxValidator.required(1)] }
        );
    }

    private generateAdressForm() {
        return this.fb.group(
            {
                name: null,
                name2: null,
                name3: null,
                strasse: null,
                strasseNr: null,
                plz: this.fb.group({
                    postleitzahl: null,
                    ort: null
                }),
                plzPostfach: this.fb.group({
                    postleitzahl: null,
                    ort: null
                }),
                land: null,
                postfach: [null, [NumberValidator.isPositiveInteger, Validators.maxLength(6)]]
            },
            {
                validator: [
                    TextValidator.twoFieldCrossValidator('postfach', 'strasse'),
                    TwoFieldsAutosuggestValidator.plzPlzAuslandCrossValidator(
                        'plz',
                        'plzPostfach',
                        'postleitzahl',
                        'ort',
                        'postleitzahl',
                        'ort',
                        this.adresseFormComponent.plzAutosuggestComponent
                    )
                ]
            }
        );
    }

    private setElektronishValidators(bewerbungsForm: FormGroup) {
        const elektronish = this.checkboxForm.get('elektronisch') as FormControl;
        const elektronischEmail = bewerbungsForm.controls.elektronischEmail as FormControl;
        const onlineFormular = bewerbungsForm.controls.onlineFormular as FormControl;
        elektronish.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            onlineFormular.markAsPristine();
            elektronischEmail.markAsPristine();
            if (elektronish.value) {
                this.bewerbungCompleteForm.setValidators([TextValidator.twoFieldCrossValidator('elektronischEmail', 'onlineFormular')]);
            } else {
                this.bewerbungCompleteForm.clearValidators();
                onlineFormular.setValue(null, { emitEvent: false, onlySelf: true });
                elektronischEmail.setValue(null, { emitEvent: false, onlySelf: true });
                elektronischEmail.setErrors(null);
                onlineFormular.setErrors(null);
            }
            elektronischEmail.updateValueAndValidity();
            onlineFormular.updateValueAndValidity();
        });
    }

    private setTelefonishValidators(bewerbungsForm: FormGroup) {
        const telefonisch = this.checkboxForm.get('telefonisch') as FormControl;
        const telefon = bewerbungsForm.controls.telefon as FormControl;
        telefonisch.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            telefon.markAsPristine();
            if (telefonisch.value) {
                telefon.setValidators([Validators.required, PhoneValidator.isValidFormatWarning]);
            } else {
                telefon.clearValidators();
                telefon.setValue(null);
            }
            telefon.updateValueAndValidity();
        });
    }

    private setKontaktpersonValidators(kontakpersonForm: FormGroup) {
        const anrede = kontakpersonForm.controls.anrede as FormControl;
        const name = kontakpersonForm.controls.name as FormControl;
        anrede.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (anrede.value) {
                name.setValidators(Validators.required);
            } else {
                name.setValidators(null);
                name.patchValue(name.value, { emitEvent: false, onlySelf: true });
            }
            name.updateValueAndValidity();
        });

        name.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
            if (name.value) {
                anrede.setValidators(Validators.required);
            } else {
                anrede.setValidators(null);
                anrede.patchValue(anrede.value, { emitEvent: false, onlySelf: true });
            }
            anrede.updateValueAndValidity();
        });
    }

    private setAdressValidators = (value, formControl) => {
        const name1 = this.adresseForm.controls.name as FormControl;
        if (value || formControl.value) {
            this.checkDynamicValidatorBoolean(name1, value, formControl);
            this.adresseForm.setValidators([
                TwoFieldsAutosuggestValidator.plzPlzAuslandCrossValidator(
                    'plz',
                    'plzPostfach',
                    'postleitzahl',
                    'ort',
                    'postleitzahl',
                    'ort',
                    this.adresseFormComponent.plzAutosuggestComponent
                ),
                TextValidator.twoFieldCrossValidator('postfach', 'strasse')
            ]);
        } else {
            this.adresseForm.controls.name.clearValidators();
            this.adresseForm.clearValidators();
        }
        this.adresseForm.updateValueAndValidity();
    };

    private checkDynamicValidatorBoolean(formControl: FormControl, value, formControl1: FormControl) {
        formControl.markAsPristine();
        formControl1.markAsPristine();
        if ((typeof value === 'string' && value === '') || (typeof value !== 'string' && value) || (value || formControl1.value)) {
            formControl.setValidators(Validators.required);
        } else {
            formControl.clearValidators();
        }
        formControl.updateValueAndValidity();
    }

    private getInitialData() {
        this.dataService
            .getCode(DomainEnum.ANREDE)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(anredeOptions => {
                this.anredeOptions = this.facade.formUtilsService.mapDropdownKurztext(anredeOptions);
                this.dataLoaded.next();
                this.dataLoaded.complete();
            });
    }

    private setKontaktPerson(kontaktperson): string {
        const name = kontaktperson.name ? kontaktperson.name : '';
        const vorname = kontaktperson.vorname ? kontaktperson.vorname : '';

        if (name || vorname) {
            return `${name}${name && vorname ? ', ' : ''}${vorname}`;
        }

        return null;
    }

    private mapToCheckboxForm(osteDTO: OsteDTO) {
        const plz = {
            postleitzahl: osteDTO.plzDto ? osteDTO.plzDto : osteDTO.unternehmenPlzAusland,
            ort: osteDTO.plzDto ? osteDTO.plzDto : osteDTO.unternehmenPostleitortAusland
        };
        const plzPostfach = {
            postleitzahl: osteDTO.postfachPlzDto ? osteDTO.postfachPlzDto : osteDTO.unternehmenPostfachPlzAusland,
            ort: osteDTO.postfachPlzDto ? osteDTO.postfachPlzDto : osteDTO.unternehmenPostfachPostleitortAusland
        };
        this.adresseForm.controls.land.patchValue(osteDTO.staatDto);
        this.adresseForm.get('plz').patchValue({ plz });
        this.adresseForm.patchValue({ plzPostfach });
        this.checkboxForm.patchValue({
            schriftlich: osteDTO.bewerSchriftlich,
            persoenlich: osteDTO.bewerPersoenlich,
            elektronisch: osteDTO.bewerElektronisch,
            telefonisch: osteDTO.bewerTelefonisch
        });
    }

    private mapToAdressForm(osteDTO: OsteDTO) {
        const plz = {
            postleitzahl: osteDTO.plzDto ? osteDTO.plzDto : osteDTO.unternehmenPlzAusland,
            ort: osteDTO.plzDto ? osteDTO.plzDto : osteDTO.unternehmenPostleitortAusland
        };
        const plzPostfach = {
            postleitzahl: osteDTO.postfachPlzDto ? osteDTO.postfachPlzDto : osteDTO.unternehmenPostfachPlzAusland,
            ort: osteDTO.postfachPlzDto ? osteDTO.postfachPlzDto : osteDTO.unternehmenPostfachPostleitortAusland
        };
        this.adresseForm.controls.land.patchValue(osteDTO.staatDto);
        this.adresseForm.controls.plz.patchValue(plz);
        this.adresseForm.controls.plzPostfach.patchValue(plzPostfach);
        this.adresseForm.patchValue({
            name: osteDTO.unternehmenName1,
            name2: osteDTO.unternehmenName2,
            name3: osteDTO.unternehmenName3,
            strasse: osteDTO.unternehmenStrasse,
            strasseNr: osteDTO.unternehmenStrasseNr,
            postfach: osteDTO.unternehmenPostfach || '',
            plz,
            land: osteDTO.staatDto,
            plzPostfach
        });
    }

    private mapToKontaktPerson(osteDTO: OsteDTO) {
        const kontakt = osteDTO.kontaktObject;
        if (kontakt) {
            const kontaktperson = {
                ...kontakt.kontaktpersonObject,
                kontaktId: kontakt.kontaktId
            };
            this.kontakpersonForm.patchValue({
                kontaktperson: kontakt.kontaktId ? kontaktperson : null,
                anrede: kontaktperson.anredeId,
                name: kontaktperson.name,
                vorname: kontaktperson.vorname,
                telefon: kontakt.telefonNr,
                email: kontakt.email
            });
        } else {
            this.kontakpersonForm.patchValue({
                kontaktperson: null,
                anrede: osteDTO.bewerAnredeId,
                name: osteDTO.bewerName,
                vorname: osteDTO.bewerVorname,
                telefon: osteDTO.bewerTelefonNr,
                email: osteDTO.bewerEmail
            });
        }
    }

    private mapTofragenZuStelle(osteDTO: OsteDTO) {
        const kontaktFragen = osteDTO.kontaktFragenObject;
        if (kontaktFragen) {
            const kontaktFragenperson = {
                ...kontaktFragen.kontaktpersonObject,
                kontaktId: kontaktFragen.kontaktId
            };
            this.fragenZuStelleForm.patchValue({
                kontaktperson: kontaktFragen.kontaktId ? kontaktFragenperson : null,
                anrede: kontaktFragenperson.anredeId,
                name: kontaktFragenperson.name,
                vorname: kontaktFragenperson.vorname,
                telefon: kontaktFragen.telefonNr,
                email: kontaktFragen.email
            });
        } else {
            this.fragenZuStelleForm.patchValue({
                kontaktperson: null,
                anrede: osteDTO.fragenAnredeId,
                name: osteDTO.fragenName,
                vorname: osteDTO.fragenVorname,
                telefon: osteDTO.fragenTelefonNr,
                email: osteDTO.fragenEmail
            });
        }
    }

    private setStandortadresse() {
        const unternehmenDto = this.unternehmenDTO;
        const plz = {
            postleitzahl: unternehmenDto.plzOrt ? unternehmenDto.plzOrt : unternehmenDto.plzAusland,
            ort: unternehmenDto.plzOrt ? unternehmenDto.plzOrt : unternehmenDto.ortAusland
        };
        const plzPostfach = {
            postleitzahl: unternehmenDto.plzOrtPostfach ? unternehmenDto.plzOrtPostfach : unternehmenDto.postfachPlzAusland,
            ort: unternehmenDto.plzOrt ? unternehmenDto.plzOrtPostfach : unternehmenDto.postfachOrtAusland
        };
        this.adresseForm.controls.land.patchValue(unternehmenDto.land);
        this.adresseForm.controls.plz.patchValue(plz);
        this.adresseForm.controls.plzPostfach.patchValue(plzPostfach);
        this.adresseForm.patchValue({
            name: unternehmenDto.name1,
            name2: unternehmenDto.name2,
            name3: unternehmenDto.name3,
            strasse: unternehmenDto.strasse,
            strasseNr: unternehmenDto.strasseNr,
            plz,
            plzPostfach,
            land: unternehmenDto.land,
            postfach: unternehmenDto.postfach
        });
        this.adresseForm.markAsPristine();
    }

    private setAdditionalValidation() {
        setTimeout(() => {
            this.adresseForm.controls.plz.get('postleitzahl').setValidators(TwoFieldsAutosuggestValidator.inputMaxLength(6, 'postleitzahl'));
            this.adresseForm.controls.plzPostfach.get('postleitzahl').setValidators(TwoFieldsAutosuggestValidator.inputMaxLength(6, 'postleitzahl'));
        }, 1000);
    }
}
