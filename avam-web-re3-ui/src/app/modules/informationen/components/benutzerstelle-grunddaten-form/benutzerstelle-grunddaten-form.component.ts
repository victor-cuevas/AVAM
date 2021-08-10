import { Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { BenutzerstelleGrunddatenHandlerService } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten-handler.service';
import { BenutzerstelleGrunddatenReactiveFormsService } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten-reactive-forms.service';
import { BenutzerstelleObjectDTO } from '@dtos/benutzerstelleObjectDTO';
import { AbstractControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { BenutzerstelleGrunddaten } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { BenutzerstelleGrunddatenModeService } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten-mode.service';
import { Subscription } from 'rxjs';
import { PlzDTO } from '@dtos/plzDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-benutzerstelle-grunddaten-form',
    templateUrl: './benutzerstelle-grunddaten-form.component.html',
    styleUrls: ['./benutzerstelle-grunddaten-form.component.scss'],
    providers: [BenutzerstelleGrunddatenHandlerService, BenutzerstelleGrunddatenReactiveFormsService, BenutzerstelleGrunddatenModeService]
})
export class BenutzerstelleGrunddatenFormComponent implements OnInit, OnDestroy {
    @Input('data') data: BenutzerstelleGrunddaten;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input('benutzerstelleIdReadOnly') benutzerstelleIdReadOnly = false;
    @Input('benutzerTypReadOnly') benutzerTypReadOnly = false;
    formGroup: FormGroup;
    currentFormMode: FormModeEnum;
    benutzerstelleTypOptions: any[];

    private modeSubscription: Subscription;

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private handler: BenutzerstelleGrunddatenHandlerService,
        private mode: BenutzerstelleGrunddatenModeService,
        private facade: FacadeService
    ) {
        this.formGroup = handler.reactiveForms.form;
        this.modeSubscription = this.mode.mode$.subscribe(currentMode => {
            this.currentFormMode = currentMode;
        });
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data.currentValue) {
            this.benutzerstelleTypOptions = this.facade.formUtilsService.mapDropdownKurztext(this.data.benutzerstelleTypeOptions);
            this.handle();
        }
    }

    onBlurPost(event: any) {
        const controls: { [key: string]: AbstractControl } = this.formGroup.controls;
        this.setValue(controls.benutzerstellePostD, event.target.value);
        this.setValue(controls.benutzerstellePostF, event.target.value);
        this.setValue(controls.benutzerstellePostI, event.target.value);
        if (this.areAllDirectValuesEmpty(controls, 'benutzerstelleStandort')) {
            this.setValue(controls.benutzerstelleStandortD, event.target.value);
            this.setValue(controls.benutzerstelleStandortF, event.target.value);
            this.setValue(controls.benutzerstelleStandortI, event.target.value);
        }
    }

    onBlurStandort(event: any) {
        const controls: { [key: string]: AbstractControl } = this.formGroup.controls;
        this.setValue(controls.benutzerstelleStandortD, event.target.value);
        this.setValue(controls.benutzerstelleStandortF, event.target.value);
        this.setValue(controls.benutzerstelleStandortI, event.target.value);
    }

    onStrasseChange(event: any, isPost: boolean) {
        const controls: { [key: string]: AbstractControl } = this.formGroup.controls;
        if (isPost) {
            this.setValue((controls.postadresseD as FormGroup).controls.strasse, event.target.value);
            this.setValue((controls.postadresseF as FormGroup).controls.strasse, event.target.value);
            this.setValue((controls.postadresseI as FormGroup).controls.strasse, event.target.value);
            if (this.areAllSubvaluesEmpty(controls, 'standortadresse', 'strasse')) {
                this.setValue((controls.standortadresseD as FormGroup).controls.strasse, event.target.value, false);
                this.setValue((controls.standortadresseF as FormGroup).controls.strasse, event.target.value, false);
                this.setValue((controls.standortadresseI as FormGroup).controls.strasse, event.target.value, false);
            }
        } else {
            this.setValue((controls.standortadresseD as FormGroup).controls.strasse, event.target.value);
            this.setValue((controls.standortadresseF as FormGroup).controls.strasse, event.target.value);
            this.setValue((controls.standortadresseI as FormGroup).controls.strasse, event.target.value);
        }
    }

    onStrasseNrChange(event: any, isPost: boolean) {
        const controls: { [key: string]: AbstractControl } = this.formGroup.controls;
        if (isPost) {
            this.setValue((controls.postadresseD as FormGroup).controls.strasseNr, event.target.value, false);
            this.setValue((controls.postadresseF as FormGroup).controls.strasseNr, event.target.value, false);
            this.setValue((controls.postadresseI as FormGroup).controls.strasseNr, event.target.value, false);
        }
        this.setValue((controls.standortadresseD as FormGroup).controls.strasseNr, event.target.value, isPost);
        this.setValue((controls.standortadresseF as FormGroup).controls.strasseNr, event.target.value, isPost);
        this.setValue((controls.standortadresseI as FormGroup).controls.strasseNr, event.target.value, isPost);
    }

    onPostfachChange(event: any) {
        const controls: { [key: string]: AbstractControl } = this.formGroup.controls;
        this.setValue((controls.postadresseD as FormGroup).controls.postfach, event.target.value, false);
        this.setValue((controls.postadresseF as FormGroup).controls.postfach, event.target.value, false);
        this.setValue((controls.postadresseI as FormGroup).controls.postfach, event.target.value, false);
    }

    onPlzOrtSelect(event: PlzDTO, isPost: boolean, language: string) {
        if (isPost) {
            this.resetPlzGroup(event, 'postadresse', language);
            if (this.areAllStandortPlzEmpty()) {
                this.resetPlzGroup(event, 'standortadresse');
            }
        } else {
            this.resetPlzGroup(event, 'standortadresse', language);
        }
    }

    mapToDto(dto: BenutzerstelleObjectDTO): BenutzerstelleObjectDTO {
        return this.handler.mapToDto(dto);
    }

    private handle(): void {
        switch (this.currentFormMode) {
            case FormModeEnum.CREATE:
                // TODO Implement me
                this.handleEdit(this.data.dto);
                break;
            case FormModeEnum.EDIT:
                this.handleEdit(this.data.dto);
                break;
            default:
                break;
        }
    }

    private handleEdit(dto: BenutzerstelleObjectDTO): void {
        if (dto) {
            this.formGroup.reset(this.handler.mapToForm(dto));
        }
    }

    private resetPlzGroup(dto: PlzDTO, group: string, exceptLanguage = ''): void {
        const controls: { [key: string]: AbstractControl } = this.formGroup.controls;
        if (exceptLanguage !== 'D') {
            this.resetPlz(controls[`${group}D`] as FormGroup, dto);
        }
        if (exceptLanguage !== 'F') {
            this.resetPlz(controls[`${group}F`] as FormGroup, dto);
        }
        if (exceptLanguage !== 'I') {
            this.resetPlz(controls[`${group}I`] as FormGroup, dto);
        }
    }

    private resetPlz(group: FormGroup, plz: PlzDTO): void {
        const plzGroup = group.controls.plz as FormGroup;
        // a workaround for a wrong behavior of the avam-plz-autosuggest component:
        // the component does not actualize the internal plzWohnAdresseObject object on reset(someDto) if the component has been touched before
        // therefore we need to call reset() to clean the previous object's value
        plzGroup.reset();
        plzGroup.reset(this.handler.mapPlzToForm(plz));
    }

    private isPlzWohnadresseObjectEmpty(plz: AbstractControl): boolean {
        const obj = plz['plzWohnAdresseObject'];
        return !obj.plzId || +obj.plzId === -1;
    }

    private areAllStandortPlzEmpty(): boolean {
        const controls: { [key: string]: AbstractControl } = this.formGroup.controls;
        return (
            this.isPlzWohnadresseObjectEmpty((controls.standortadresseD as FormGroup).controls.plz) &&
            this.isPlzWohnadresseObjectEmpty((controls.standortadresseF as FormGroup).controls.plz) &&
            this.isPlzWohnadresseObjectEmpty((controls.standortadresseI as FormGroup).controls.plz)
        );
    }

    private areAllDirectValuesEmpty(controls: { [key: string]: AbstractControl }, name: string): boolean {
        return !controls[`${name}D`].value && !controls[`${name}F`].value && !controls[`${name}I`].value;
    }

    private areAllSubvaluesEmpty(controls: { [key: string]: AbstractControl }, group: string, name: string): boolean {
        return (
            !(controls[`${group}D`] as FormGroup).controls[name].value &&
            !(controls[`${group}F`] as FormGroup).controls[name].value &&
            !(controls[`${group}I`] as FormGroup).controls[name].value
        );
    }

    private setValue(control: AbstractControl, value: string, onlyEmpty = true): void {
        if (!onlyEmpty || !control.value) {
            control.setValue(value);
        }
    }
}
