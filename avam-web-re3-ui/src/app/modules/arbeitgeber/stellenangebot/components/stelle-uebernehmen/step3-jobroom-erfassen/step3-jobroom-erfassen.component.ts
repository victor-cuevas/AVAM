import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Step3OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step3-oste-erfassen-form/step3-oste-erfassen-form.component';
import { OsteDTO } from '@dtos/osteDTO';
import { OsteEgovParamDTO } from '@dtos/osteEgovParamDTO';
import { FacadeService } from '@shared/services/facade.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { WarningMessages } from '@dtos/warningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Unsubscribable } from 'oblique-reactive';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { BaseResponseWrapperOsteEgovParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteEgovParamDTOWarningMessages';
import KeyEnum = WarningMessages.KeyEnum;
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';

@Component({
    selector: 'avam-step3-jobroom-erfassen',
    templateUrl: './step3-jobroom-erfassen.component.html',
    styleUrls: ['./step3-jobroom-erfassen.component.scss']
})
export class Step3JobroomErfassenComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: Step3OsteErfassenFormComponent;
    permissions: typeof Permissions = Permissions;
    channel = 'bewerbungChannel';

    constructor(
        public wizardService: MeldungenVerifizierenWizardService,
        private facadeService: FacadeService,
        private osteDataService: OsteDataRestService,
        private infopanelService: AmmInfopanelService
    ) {
        super();
    }

    ngAfterViewInit() {
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.bewerbung' });
        if (this.wizardService.osteEgovAnlegenParamDTO) {
            this.mapOsteAnlegenToOsteDTO(this.wizardService.osteEgovAnlegenParamDTO);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.facadeService.fehlermeldungenService.closeMessage();
    }

    reset() {
        this.facadeService.resetDialogService.reset(() => {
            this.mapOsteAnlegenToOsteDTO(this.wizardService.osteEgovAnlegenParamDTO);
        });
    }

    moveNext() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (
            this.formComponent.bewerbungCompleteForm.valid &&
            this.formComponent.adresseForm.valid &&
            this.formComponent.kontakpersonForm.valid &&
            this.formComponent.fragenZuStelleForm.valid &&
            this.formComponent.checkboxForm.valid
        ) {
            this.wizardService.activateSpinner(this.channel);
            this.osteDataService
                .checkOsteStep(this.mapToDTO(), 3)
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        OrColumnLayoutUtils.scrollTop();
                        this.wizardService.deactivateSpinner(this.channel);
                    })
                )
                .subscribe((response: BaseResponseWrapperOsteEgovParamDTOWarningMessages) => {
                    if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key !== KeyEnum.DANGER)) {
                        this.wizardService.setOsteEgovAnlegenParamDTO({ ...this.wizardService.osteEgovAnlegenParamDTO, ...response.data });
                        this.wizardService.list.toArray()[5].isDirty = false;
                        this.wizardService.movePosition(6);
                    }
                });
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.formComponent.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    private mapOsteAnlegenToOsteDTO(osteAnlegenParam: OsteEgovParamDTO) {
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

    private mapToDTO(): OsteEgovParamDTO {
        const adressFormcontrols = this.formComponent.adresseForm.controls;
        const checkBoxControls = this.formComponent.checkboxForm.controls;
        const kontakpersonControls = this.formComponent.kontakpersonForm.controls;
        const fragenZuStelleControls = this.formComponent.fragenZuStelleForm.controls;
        const bewerbungCompleteControls = this.formComponent.bewerbungCompleteForm.controls;
        return {
            ...this.wizardService.osteEgovAnlegenParamDTO,
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
}
