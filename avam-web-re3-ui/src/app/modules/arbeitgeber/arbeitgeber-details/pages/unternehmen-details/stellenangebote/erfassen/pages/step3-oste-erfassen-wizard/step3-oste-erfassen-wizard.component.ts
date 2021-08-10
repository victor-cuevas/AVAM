import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WizardErfassenService } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/wizard/wizard-erfassen.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FormGroupDirective } from '@angular/forms';
import { Unsubscribable } from 'oblique-reactive';
import { Step3OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step3-oste-erfassen-form/step3-oste-erfassen-form.component';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { takeUntil } from 'rxjs/operators';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { WarningMessages } from '@dtos/warningMessages';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { OsteAnlegenParamDTO } from '@dtos/osteAnlegenParamDTO';
import { OsteDTO } from '@dtos/osteDTO';
import { BaseResponseWrapperOsteAnlegenParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteAnlegenParamDTOWarningMessages';
import KeyEnum = WarningMessages.KeyEnum;

@Component({
    selector: 'avam-step3-oste-erfassen-wizard',
    templateUrl: './step3-oste-erfassen-wizard.component.html',
    styleUrls: ['./step3-oste-erfassen-wizard.component.scss']
})
export class Step3OsteErfassenWizardComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('formComponent') formComponent: Step3OsteErfassenFormComponent;
    public permissions: typeof Permissions = Permissions;
    public channel = 'bewerbungChannel';
    constructor(
        public wizardService: WizardErfassenService,
        private infopanelService: AmmInfopanelService,
        private fehlermeldungService: FehlermeldungenService,
        private resetDialogService: ResetDialogService,
        private unternehmenRestService: UnternehmenRestService,
        private osteDataService: OsteDataRestService
    ) {
        super();
    }

    public ngOnInit() {
        if (!this.wizardService.osteErfassenParam.step2) {
            this.wizardService.navigateTo(1, this.wizardService.osteId || null);
        }

        this.wizardService.selectCurrentStep(2);
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.bewerbung' });
    }

    public ngAfterViewInit(): void {
        if (this.wizardService.osteErfassenParam.step3) {
            this.mapOsteAnlegenToOsteDTO(this.wizardService.osteAnlegeParamDTO);
        } else if (this.wizardService.osteId) {
            this.kopieren();
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.fehlermeldungService.closeMessage();
    }

    public canDeactivate() {
        return this.formComponent.isAnyFormDirty();
    }

    public cancel() {
        this.wizardService.navigateToOsteUebersicht();
    }

    public reset() {
        if (this.formComponent.isAnyFormDirty()) {
            this.fehlermeldungService.closeMessage();
            this.resetDialogService.reset(() => {
                if (this.wizardService.osteErfassenParam.step3) {
                    this.mapOsteAnlegenToOsteDTO(this.wizardService.osteAnlegeParamDTO);
                } else if (this.wizardService.osteId) {
                    this.formComponent.mapToForm(this.wizardService.osteDTO);
                } else {
                    this.formComponent.bewerbungCompleteForm.reset();
                    this.formComponent.kontakpersonForm.reset();
                    this.formComponent.checkboxForm.reset();
                    this.formComponent.fragenZuStelleForm.reset();
                    this.formComponent.adresseForm.reset();
                }
            });
        }
        this.formComponent.ngForm.resetForm();
    }

    public movePrevious() {
        this.wizardService.navigateTo(2, this.wizardService.osteId || null);
    }

    public moveNext() {
        this.fehlermeldungService.closeMessage();
        if (
            this.formComponent.bewerbungCompleteForm.valid &&
            this.formComponent.adresseForm.valid &&
            this.formComponent.kontakpersonForm.valid &&
            this.formComponent.fragenZuStelleForm.valid &&
            this.formComponent.checkboxForm.valid
        ) {
            this.wizardService.activateSpinner(this.channel);
            this.unternehmenRestService
                .checkOsteStep(this.mapToDTO(), this.wizardService.currentStep)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperOsteAnlegenParamDTOWarningMessages) => {
                        if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key !== KeyEnum.DANGER)) {
                            this.wizardService.osteErfassenParam.step3 = true;
                            this.wizardService.setOsteAnlegeParamDTO({ ...this.wizardService.osteAnlegeParamDTO, ...response.data });
                            this.formComponent.makeAllFormPristine();
                            this.wizardService.navigateTo(4, this.wizardService.osteId || null);
                        }
                        OrColumnLayoutUtils.scrollTop();
                        this.wizardService.deactivateSpinner(this.channel);
                    },
                    () => {
                        OrColumnLayoutUtils.scrollTop();
                        this.wizardService.deactivateSpinner(this.channel);
                    }
                );
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.formComponent.ngForm.onSubmit(undefined);
            this.fehlermeldungService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    private mapOnlineFormularToDTO(urlValue: string): string {
        let newUrl = urlValue;
        if (newUrl) {
            newUrl = newUrl.trim();
            if (newUrl !== '' && !newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                newUrl = `http://${newUrl}`;
            }
        }
        return newUrl;
    }

    private kopieren() {
        this.wizardService.activateSpinner(this.channel);
        this.osteDataService
            .getOsteBewerbung(this.wizardService.osteId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    if (response) {
                        this.wizardService.setUnternehmenDTO(this.mapUnternehmenDTOtoUnternehmenResponseDTO(response.data.unternehmenDto));
                        this.formComponent.mapToForm(response.data);
                    }
                    this.wizardService.deactivateSpinner(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.wizardService.deactivateSpinner(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
    }

    private mapUnternehmenDTOtoUnternehmenResponseDTO(unternehmen: UnternehmenDTO): UnternehmenResponseDTO {
        return {
            name1: unternehmen.name1,
            name2: unternehmen.name2,
            name3: unternehmen.name3,
            strasse: unternehmen.strasse,
            strasseNr: unternehmen.strasseNr,
            plzOrt: unternehmen.plz,
            plzOrtPostfach: unternehmen.postfachPlzObject,
            land: unternehmen.staat,
            postfach: unternehmen.postfach
        };
    }

    private mapToDTO(): OsteAnlegenParamDTO {
        const adressFormcontrols = this.formComponent.adresseForm.controls;
        const checkBoxControls = this.formComponent.checkboxForm.controls;
        const kontakpersonControls = this.formComponent.kontakpersonForm.controls;
        const fragenZuStelleControls = this.formComponent.fragenZuStelleForm.controls;
        const bewerbungCompleteControls = this.formComponent.bewerbungCompleteForm.controls;
        return {
            ...this.wizardService.osteAnlegeParamDTO,
            ugName1: adressFormcontrols.name.value,
            ugName2: adressFormcontrols.name2.value,
            ugName3: adressFormcontrols.name3.value,
            ugStrasse: adressFormcontrols.strasse.value,
            ugStrasseNr: adressFormcontrols.strasseNr.value,
            ugPlzDTO: adressFormcontrols.plz['plzWohnAdresseObject'],
            ugPlzId: +adressFormcontrols.plz['plzWohnAdresseObject'].plzId !== -1 ? adressFormcontrols.plz['plzWohnAdresseObject'].plzId : null,
            ugPostfachPlzDTO: adressFormcontrols.plzPostfach['plzWohnAdresseObject'],
            ugPostfachPlzId: +adressFormcontrols.plzPostfach['plzWohnAdresseObject'].plzId !== -1 ? adressFormcontrols.plzPostfach['plzWohnAdresseObject'].plzId : null,
            ugPostfach: adressFormcontrols.postfach.value,
            ugStaatDTO: adressFormcontrols.land['landAutosuggestObject'],

            bewerbSchriftl: checkBoxControls.schriftlich.value,
            bewerbPersoenl: checkBoxControls.persoenlich.value,
            bewerbElektr: checkBoxControls.elektronisch.value,
            bewerbTelefon: checkBoxControls.telefonisch.value,

            kontaktpersonAnredeId: kontakpersonControls.anrede.value,
            kontaktpersonName: kontakpersonControls.name.value,
            kontaktpersonVorname: kontakpersonControls.vorname.value,
            kontaktpersonEmail: kontakpersonControls.email.value,
            kontaktpersonTelefon: kontakpersonControls.telefon.value,
            kontaktpersonId: kontakpersonControls.kontaktperson.value ? kontakpersonControls.kontaktperson['kontaktpersonObject'].kontaktId : null,

            fragenPersonAnredeId: fragenZuStelleControls.anrede.value,
            fragenPersonName: fragenZuStelleControls.name.value,
            fragenPersonVorname: fragenZuStelleControls.vorname.value,
            fragenPersonEmail: fragenZuStelleControls.email.value,
            fragenPersonTelefon: fragenZuStelleControls.telefon.value,
            fragenPersonId: fragenZuStelleControls.kontaktperson.value ? fragenZuStelleControls.kontaktperson['kontaktpersonObject'].kontaktId : null,

            ugTelefon: bewerbungCompleteControls.telefon.value,
            ugEmail: bewerbungCompleteControls.elektronischEmail.value,
            ugWebadresse: this.mapOnlineFormularToDTO(bewerbungCompleteControls.onlineFormular.value),
            bewerbWeitereAngaben: bewerbungCompleteControls.ergaenzendeAngaben.value
        };
    }

    private mapOsteAnlegenToOsteDTO(osteAnlegenParam: OsteAnlegenParamDTO) {
        const osteDto: OsteDTO = {
            bewerSchriftlich: osteAnlegenParam.bewerbSchriftl,
            bewerElektronisch: osteAnlegenParam.bewerbElektr,
            bewerTelefonisch: osteAnlegenParam.bewerbTelefon,
            bewerPersoenlich: osteAnlegenParam.bewerbPersoenl,
            unternehmenName1: osteAnlegenParam.ugName1,
            unternehmenName2: osteAnlegenParam.ugName2,
            unternehmenName3: osteAnlegenParam.ugName3,
            unternehmenStrasse: osteAnlegenParam.ugStrasse,
            unternehmenStrasseNr: osteAnlegenParam.ugStrasseNr,
            plzDto: osteAnlegenParam.ugPlzDTO,
            postfachPlzDto: osteAnlegenParam.ugPostfachPlzDTO,
            unternehmenPostfach: osteAnlegenParam.ugPostfach,
            staatDto: osteAnlegenParam.ugStaatDTO,
            kontaktObject: {
                telefonNr: osteAnlegenParam.kontaktpersonTelefon,
                email: osteAnlegenParam.kontaktpersonEmail,
                kontaktId: osteAnlegenParam.kontaktpersonId,
                kontaktpersonObject: {
                    anredeId: osteAnlegenParam.kontaktpersonAnredeId,
                    name: osteAnlegenParam.kontaktpersonName,
                    vorname: osteAnlegenParam.kontaktpersonVorname,
                    kontaktpersonId: osteAnlegenParam.kontaktpersonId
                }
            },
            kontaktFragenObject: {
                telefonNr: osteAnlegenParam.fragenPersonTelefon,
                email: osteAnlegenParam.fragenPersonEmail,
                kontaktId: osteAnlegenParam.fragenPersonId,
                kontaktpersonObject: {
                    anredeId: osteAnlegenParam.fragenPersonAnredeId,
                    name: osteAnlegenParam.fragenPersonName,
                    vorname: osteAnlegenParam.fragenPersonVorname,
                    kontaktpersonId: osteAnlegenParam.fragenPersonId
                }
            },
            unternehmenTelefon: osteAnlegenParam.ugTelefon,
            unternehmenEmail: osteAnlegenParam.ugEmail,
            unternehmenUrl: osteAnlegenParam.ugWebadresse,
            bewerAngaben: osteAnlegenParam.bewerbWeitereAngaben
        };
        this.formComponent.mapToForm(osteDto);
    }
}
