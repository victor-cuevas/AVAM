import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { Step1OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step1-oste-erfassen-form/step1-oste-erfassen-form.component';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Unsubscribable } from 'oblique-reactive';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { finalize, takeUntil } from 'rxjs/operators';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { OsteEgovParamDTO } from '@dtos/osteEgovParamDTO';
import { OsteAnlegenParamDTO } from '@dtos/osteAnlegenParamDTO';
import { FacadeService } from '@shared/services/facade.service';
import { BaseResponseWrapperOsteAnlegenParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteAnlegenParamDTOWarningMessages';
import { WarningMessages } from '@dtos/warningMessages';
import { FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import KeyEnum = WarningMessages.KeyEnum;

@Component({
    selector: 'avam-step1-jobroom-erfassen',
    templateUrl: './step1-jobroom-erfassen.component.html',
    styleUrls: ['./step1-jobroom-erfassen.component.scss']
})
export class Step1JobroomErfassenComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: Step1OsteErfassenFormComponent;
    permissions: typeof Permissions = Permissions;
    channel = 'step1OsteErfassenBearbeiten';

    constructor(
        private wizardService: MeldungenVerifizierenWizardService,
        private infopanelService: AmmInfopanelService,
        private osteDataService: OsteDataRestService,
        private unternehmenRestService: UnternehmenRestService,
        private facadeService: FacadeService
    ) {
        super();
    }

    ngAfterViewInit() {
        if (this.wizardService.osteEgovId && this.wizardService.unternehmenId) {
            if (this.wizardService.osteEgovAnlegenParamDTO) {
                this.wizardService.activateSpinner(this.channel);
                this.mapOsteAnlegenToOsteDTO(this.wizardService.osteEgovAnlegenParamDTO);
                this.wizardService.deactivateSpinner(this.channel);
            } else {
                this.getOsteEgovAnlegenParam();
            }
            this.wizardService.selectCurrentStep(3);
        }
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.basisangaben' });
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
        if (this.formComponent.form.valid) {
            this.wizardService.activateSpinner(this.channel);
            this.osteDataService
                .checkOsteStep(this.mapToDTO(), 1)
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        this.wizardService.deactivateSpinner(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                    })
                )
                .subscribe((response: BaseResponseWrapperOsteAnlegenParamDTOWarningMessages) => {
                    if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key !== KeyEnum.DANGER)) {
                        this.wizardService.setOsteEgovAnlegenParamDTO({ ...this.wizardService.osteEgovAnlegenParamDTO, ...response.data });
                        this.wizardService.list.toArray()[3].isDirty = false;
                        this.wizardService.movePosition(4);
                    }
                });
        } else {
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.formComponent.ngForm.onSubmit(undefined);
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private getOsteEgovAnlegenParam() {
        this.formComponent.dataLoaded.subscribe(() => {
            this.wizardService.activateSpinner(this.channel);
            forkJoin([
                this.osteDataService.getOsteEgovParamByOsteEgovId(this.wizardService.osteEgovId, this.wizardService.unternehmenId),
                this.unternehmenRestService.getUnternehmenDataById(this.wizardService.unternehmenId)
            ])
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        this.wizardService.deactivateSpinner(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                    })
                )
                .subscribe(([response, unternehmenResponse]) => {
                    if (response) {
                        this.wizardService.setOsteEgovAnlegenParamDTO(response.data);
                        this.mapOsteAnlegenToOsteDTO(response.data);
                        this.wizardService.setUnternehmenDTO(unternehmenResponse.data);
                    }
                });
        });
    }

    private mapOsteAnlegenToOsteDTO(osteAnlegeParamDTO: OsteAnlegenParamDTO) {
        const osteDTO = {
            bezeichnung: osteAnlegeParamDTO.bezeichnung,
            beschreibung: osteAnlegeParamDTO.beschreibung,
            abSofort: osteAnlegeParamDTO.abSofort,
            nachVereinbarung: osteAnlegeParamDTO.nachVereinbarung,
            stellenAntritt: this.facadeService.formUtilsService.parseDate(osteAnlegeParamDTO.antritt),
            fristTypId: osteAnlegeParamDTO.fristTypId,
            vertragsDauer: this.facadeService.formUtilsService.parseDate(osteAnlegeParamDTO.vertragsdauer),
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

    private mapToDTO(): OsteEgovParamDTO {
        const antritt = this.formComponent.form.controls.antritt as FormGroup;
        const beschaeftigungsgrad = this.formComponent.form.controls.beschaeftigungsgrad as FormGroup;
        return {
            ...this.wizardService.osteEgovAnlegenParamDTO,
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
            anzahlStellen:
                this.wizardService.osteEgovAnlegenParamDTO && this.wizardService.osteEgovAnlegenParamDTO.anzahlStellen
                    ? this.wizardService.osteEgovAnlegenParamDTO.anzahlStellen
                    : 1
        };
    }
}
