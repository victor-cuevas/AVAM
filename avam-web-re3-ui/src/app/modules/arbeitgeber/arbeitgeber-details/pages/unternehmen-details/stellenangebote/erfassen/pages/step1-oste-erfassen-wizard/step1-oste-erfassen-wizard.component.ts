import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { WizardErfassenService } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/wizard/wizard-erfassen.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { forkJoin } from 'rxjs';
import { Unsubscribable } from 'oblique-reactive';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { takeUntil } from 'rxjs/operators';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { FormUtilsService } from '@app/shared';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { WarningMessages } from '@dtos/warningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { BaseResponseWrapperOsteAnlegenParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteAnlegenParamDTOWarningMessages';
import { OsteAnlegenParamDTO } from '@dtos/osteAnlegenParamDTO';
import KeyEnum = WarningMessages.KeyEnum;
import { Step1OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step1-oste-erfassen-form/step1-oste-erfassen-form.component';

@Component({
    selector: 'avam-step1-oste-erfassen-wizard',
    templateUrl: './step1-oste-erfassen-wizard.component.html'
})
export class Step1OsteErfassenWizardComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: Step1OsteErfassenFormComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    permissions: typeof Permissions = Permissions;
    spinnerChannel = 'step1OsteErfassenBearbeiten';

    unternehmenDTO: UnternehmenResponseDTO;

    private OSTEFRISTTYP_UNBEFRISTET = 'UNBEFR';
    private LOHNART_MONATSLOHN = '1';
    private WAEHRUNG_CHF = '1';

    constructor(
        private formUtils: FormUtilsService,
        private wizardService: WizardErfassenService,
        private infopanelService: AmmInfopanelService,
        private resetDialogService: ResetDialogService,
        private unternehmenRestService: UnternehmenRestService,
        private fehlermeldungService: FehlermeldungenService,
        private osteDataService: OsteDataRestService
    ) {
        super();
    }

    ngOnInit() {
        this.wizardService.selectCurrentStep(0);
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.basisangaben' });
    }

    ngAfterViewInit() {
        if (this.wizardService.osteId || this.wizardService.osteAnlegeParamDTO) {
            this.loadChangedData();
        } else {
            this.loadData();
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    canDeactivate() {
        return this.formComponent.form.dirty || this.formComponent.modalForm.dirty;
    }

    cancel() {
        this.wizardService.navigateToOsteUebersicht();
    }

    reset() {
        if (this.formComponent.form.dirty || this.formComponent.modalForm.dirty) {
            this.fehlermeldungService.closeMessage();
            this.resetDialogService.reset(() => {
                if (this.wizardService.osteErfassenParam.step1) {
                    this.mapOsteAnlegenToOsteDTO(this.wizardService.osteAnlegeParamDTO);
                } else if (this.wizardService.osteId) {
                    this.formComponent.mapToForm(this.wizardService.osteDTO);
                    this.formComponent.modalForm.reset({ stellenbeschreibung: this.wizardService.osteDTO.beschreibung });
                } else {
                    this.formComponent.form.reset({
                        antritt: {
                            abSofort: true
                        },
                        fristTyp: this.formUtils.getCodeIdByCode(this.formComponent.fristTypCodeDTOs, this.OSTEFRISTTYP_UNBEFRISTET),
                        beschaeftigungsgrad: {
                            slider: '',
                            pensumVon: 100,
                            pensumBis: 100
                        },
                        arbeitszeit: 42,
                        arbeitsform: this.formComponent.arbeitsFormCodeDTOs.map(this.formComponent.mapMultiselect),
                        lohnart: this.formUtils.getCodeIdByCode(this.formComponent.lohnArtCodeDTOs, this.LOHNART_MONATSLOHN),
                        waehrung: this.formUtils.getCodeIdByCode(this.formComponent.waehungCodeDTOs, this.WAEHRUNG_CHF),
                        land: this.unternehmenDTO.land,
                        plz: {
                            postleitzahl: this.unternehmenDTO.plzOrt && this.unternehmenDTO.plzOrt.plzId ? this.unternehmenDTO.plzOrt : this.unternehmenDTO.plzAusland,
                            ort: this.unternehmenDTO.plzOrt && this.unternehmenDTO.plzOrt.plzId ? this.unternehmenDTO.plzOrt : this.unternehmenDTO.ortAusland
                        }
                    });
                    this.formComponent.modalForm.reset();
                }
                this.formComponent.form.markAsPristine();
                this.formComponent.form.markAsUntouched();
                this.formComponent.form.updateValueAndValidity();
                this.formComponent.modalForm.markAsPristine();
                this.formComponent.modalForm.markAsUntouched();
                this.formComponent.modalForm.updateValueAndValidity();
            });
        }
    }

    moveNext() {
        if (this.formComponent.form.valid) {
            this.wizardService.activateSpinner(this.spinnerChannel);
            this.unternehmenRestService
                .checkOsteStep(this.mapToDTO(), this.wizardService.currentStep)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperOsteAnlegenParamDTOWarningMessages) => {
                        if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key !== KeyEnum.DANGER)) {
                            this.wizardService.osteErfassenParam.step1 = true;
                            this.wizardService.setOsteAnlegeParamDTO({ ...this.wizardService.osteAnlegeParamDTO, ...response.data });
                            this.formComponent.form.markAsPristine();
                            this.formComponent.modalForm.markAsPristine();
                            this.wizardService.navigateTo(2, this.wizardService.osteId || null);
                        }
                        this.wizardService.deactivateSpinner(this.spinnerChannel);
                    },
                    () => {
                        OrColumnLayoutUtils.scrollTop();
                        this.wizardService.deactivateSpinner(this.spinnerChannel);
                    }
                );
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    private loadData() {
        this.wizardService.activateSpinner(this.spinnerChannel);
        forkJoin(this.unternehmenRestService.getUnternehmenDataById(this.wizardService.unternehmenId), this.formComponent.dataLoaded)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([unternehmenResponse, voidElem]) => {
                if (unternehmenResponse.data) {
                    this.unternehmenDTO = unternehmenResponse.data;
                    this.wizardService.setUnternehmenDTO(unternehmenResponse.data);
                    const plz = {
                        postleitzahl: this.unternehmenDTO.plzOrt && this.unternehmenDTO.plzOrt.plzId ? this.unternehmenDTO.plzOrt : this.unternehmenDTO.plzAusland,
                        ort: this.unternehmenDTO.plzOrt && this.unternehmenDTO.plzOrt.plzId ? this.unternehmenDTO.plzOrt : this.unternehmenDTO.ortAusland
                    };
                    this.formComponent.form.patchValue({ plz });
                    this.formComponent.form.patchValue({ land: this.unternehmenDTO.land, plz });
                }
                this.formComponent.form.controls.fristTyp.setValue(this.formUtils.getCodeIdByCode(this.formComponent.fristTypCodeDTOs, this.OSTEFRISTTYP_UNBEFRISTET));
                this.formComponent.form.controls.lohnart.setValue(this.formUtils.getCodeIdByCode(this.formComponent.lohnArtCodeDTOs, this.LOHNART_MONATSLOHN));
                this.formComponent.form.controls.waehrung.setValue(this.formUtils.getCodeIdByCode(this.formComponent.waehungCodeDTOs, this.WAEHRUNG_CHF));
                setTimeout(
                    () =>
                        this.formComponent.form.controls.beschaeftigungsgrad.setValue({
                            slider: '',
                            pensumVon: 100,
                            pensumBis: 100
                        }),
                    0
                );
                this.wizardService.deactivateSpinner(this.spinnerChannel);
            });
    }

    private loadChangedData() {
        this.formComponent.dataLoaded.subscribe(() => {
            if (this.wizardService.osteAnlegeParamDTO) {
                this.wizardService.deactivateSpinner(this.spinnerChannel);
                this.mapOsteAnlegenToOsteDTO(this.wizardService.osteAnlegeParamDTO);
            } else {
                this.wizardService.activateSpinner(this.spinnerChannel);
                this.osteDataService
                    .getOsteBasisangaben(this.wizardService.osteId)
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(
                        response => {
                            if (response) {
                                this.wizardService.setOsteDTO(response.data);
                                this.formComponent.mapToForm(response.data);
                                this.formComponent.modalForm.setValue({ stellenbeschreibung: response.data.beschreibung });
                            }
                            this.wizardService.deactivateSpinner(this.spinnerChannel);
                            OrColumnLayoutUtils.scrollTop();
                        },
                        () => {
                            this.wizardService.deactivateSpinner(this.spinnerChannel);
                            OrColumnLayoutUtils.scrollTop();
                        }
                    );
            }
        });
    }

    private mapToDTO(): OsteAnlegenParamDTO {
        const antritt = this.formComponent.form.controls.antritt as FormGroup;
        const beschaeftigungsgrad = this.formComponent.form.controls.beschaeftigungsgrad as FormGroup;
        return {
            ...this.wizardService.osteAnlegeParamDTO,
            unternehmenId: +this.wizardService.unternehmenId,
            bezeichnung: this.formComponent.form.controls.stellenbezeichnung.value,
            beschreibung: this.formComponent.form.controls.stellenbeschreibung.value,
            abSofort: antritt.controls.abSofort.value,
            nachVereinbarung: antritt.controls.nachVereinbarung.value,
            antritt: this.formComponent.form.controls.stellenAntritt.value,
            fristTypId: this.formComponent.form.controls.fristTyp.value,
            vertragsdauer: this.formComponent.form.controls.fristDauer.value,
            beschaeftigungMin: beschaeftigungsgrad.controls.pensumVon.value,
            beschaeftigungMax: beschaeftigungsgrad.controls.pensumBis.value,
            wochenarbeitszeit: this.formComponent.form.controls.arbeitszeit.value,
            arbeitsformen: !!this.formComponent.form.controls.arbeitsform.value
                ? this.formComponent.form.controls.arbeitsform.value.filter(arbeitsForm => arbeitsForm.value).map(el => el.id)
                : [],
            arbeitzeitDetail: this.formComponent.form.controls.ergaenzendeangaben.value,
            lohnartId: this.formComponent.form.controls.lohnart.value,
            waehrungId: this.formComponent.form.controls.waehrung.value,
            gehaltMin: this.formComponent.form.controls.lohnmin.value,
            gehaltMax: this.formComponent.form.controls.lohnmax.value,
            arbeitsortstaatDTO: !!this.formComponent.form.controls.land ? this.formComponent.form.controls.land['landAutosuggestObject'] : null,
            arbeitsortsplzDTO: !!this.formComponent.form.controls.plz ? this.formComponent.form.controls.plz['plzWohnAdresseObject'] : null,
            arbeitsortText: this.formComponent.form.controls.zusatztext.value,
            jobSharing: this.formComponent.form.controls.jobSharing.value,
            behinderte: this.formComponent.form.controls.handicap.value,
            anzahlStellen: this.wizardService.osteDTO && this.wizardService.osteDTO.gleicheOste ? this.wizardService.osteDTO.gleicheOste : 1
        };
    }

    private mapOsteAnlegenToOsteDTO(osteAnlegeParamDTO: OsteAnlegenParamDTO) {
        const osteDTO = {
            bezeichnung: osteAnlegeParamDTO.bezeichnung,
            beschreibung: osteAnlegeParamDTO.beschreibung,
            abSofort: osteAnlegeParamDTO.abSofort,
            nachVereinbarung: osteAnlegeParamDTO.nachVereinbarung,
            stellenAntritt: this.formUtils.parseDate(osteAnlegeParamDTO.antritt),
            fristTypId: osteAnlegeParamDTO.fristTypId,
            vertragsDauer: this.formUtils.parseDate(osteAnlegeParamDTO.vertragsdauer),
            pensumVon: osteAnlegeParamDTO.beschaeftigungMin,
            pensumBis: osteAnlegeParamDTO.beschaeftigungMax,
            arbeitszeitStd: osteAnlegeParamDTO.wochenarbeitszeit,
            arbeitzeitDetail: osteAnlegeParamDTO.arbeitzeitDetail,
            lohnartId: osteAnlegeParamDTO.lohnartId,
            waehrungId: osteAnlegeParamDTO.waehrungId,
            lohnMin: osteAnlegeParamDTO.gehaltMin,
            lohnMax: osteAnlegeParamDTO.gehaltMax,
            arbeitsortStaatDto: osteAnlegeParamDTO.arbeitsortstaatDTO,
            arbeitsortPlzDto: osteAnlegeParamDTO.arbeitsortsplzDTO,
            arbeitsortText: osteAnlegeParamDTO.arbeitsortText,
            jobSharing: osteAnlegeParamDTO.jobSharing,
            behinderte: osteAnlegeParamDTO.behinderte,
            arbeitsortAuslandPlz: osteAnlegeParamDTO.arbeitsortPlzAusland,
            arbeitsortAuslandOrt: osteAnlegeParamDTO.arbeitsortOrtAusland,
            detailangaben: osteAnlegeParamDTO.arbeitzeitDetail,
            arbeitsformList: osteAnlegeParamDTO.arbeitsformen.map(el => {
                return { arbeitsformId: el };
            })
        };

        setTimeout(() => {
            this.formComponent.mapToForm(osteDTO);
            this.formComponent.modalForm.setValue({ stellenbeschreibung: osteAnlegeParamDTO.beschreibung });
        }, 0);
    }
}
