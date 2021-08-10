import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Step2OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/step2-oste-erfassen-form.component';
import { OsteDTO } from '@dtos/osteDTO';
import { SprachkenntnisDTO } from '@dtos/sprachkenntnisDTO';
import { FacadeService } from '@shared/services/facade.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { BaseResponseWrapperOsteAnlegenParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteAnlegenParamDTOWarningMessages';
import { WarningMessages } from '@dtos/warningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { FormGroup } from '@angular/forms';
import { OsteEgovParamDTO } from '@dtos/osteEgovParamDTO';
import KeyEnum = WarningMessages.KeyEnum;
import { Unsubscribable } from 'oblique-reactive';
import { OsteAnlegenParamDTO } from '@dtos/osteAnlegenParamDTO';

@Component({
    selector: 'avam-step2-jobroom-erfassen',
    templateUrl: './step2-jobroom-erfassen.component.html',
    styleUrls: ['./step2-jobroom-erfassen.component.scss']
})
export class Step2JobroomErfassenComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: Step2OsteErfassenFormComponent;
    permissions: typeof Permissions = Permissions;
    anforderungenChannel = 'anforderungen';

    constructor(
        private wizardService: MeldungenVerifizierenWizardService,
        private infopanelService: AmmInfopanelService,
        private osteDataService: OsteDataRestService,
        private facadeService: FacadeService
    ) {
        super();
    }

    ngAfterViewInit() {
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.anforderungen' });
        this.loadData();
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

    isAnyFormInvalid() {
        return !this.formComponent.berufTable.tableForm.valid || !this.formComponent.anforderungenForm.valid || !this.formComponent.spracheTable.tableForm.valid;
    }

    loadData() {
        this.facadeService.spinnerService.activate(this.anforderungenChannel);
        this.formComponent.dataLoaded.subscribe(() => {
            this.mapOsteAnlegenToOsteDTO(this.wizardService.osteEgovAnlegenParamDTO);
            this.facadeService.spinnerService.deactivate(this.anforderungenChannel);
        });
    }

    moveNext() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (!this.isAnyFormInvalid()) {
            this.wizardService.activateSpinner(this.anforderungenChannel);
            this.osteDataService
                .checkOsteStep(this.mapToDTO(), 2)
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        OrColumnLayoutUtils.scrollTop();
                        this.wizardService.deactivateSpinner(this.anforderungenChannel);
                    })
                )
                .subscribe((response: BaseResponseWrapperOsteAnlegenParamDTOWarningMessages) => {
                    if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key !== KeyEnum.DANGER)) {
                        this.wizardService.setOsteEgovAnlegenParamDTO({ ...this.wizardService.osteEgovAnlegenParamDTO, ...response.data });
                        this.wizardService.list.toArray()[4].isDirty = false;
                        this.wizardService.movePosition(5);
                    }
                });
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    mapToDTO(): OsteEgovParamDTO {
        const alter = this.formComponent.anforderungenForm.controls.idealesAlterSlider as FormGroup;
        return {
            ...this.wizardService.osteEgovAnlegenParamDTO,
            berufeList: this.formComponent.berufTable.mapBerufTableDataToBerufList(),
            sprachenList: this.formComponent.spracheTable.mapSpracheTableDataToSprachList(),
            bemerkungSprache: this.formComponent.anforderungenForm.controls.ergaenzendeAngabenSprache.value,
            alterVon: alter.controls.alterVon.value,
            alterBis: alter.controls.alterBis.value,
            geschlechtId: this.formComponent.anforderungenForm.controls.geschlecht.value,
            angabenAlter: this.formComponent.anforderungenForm.controls.ergaenzendeAngabenAlterGeschlecht.value,
            fahrzeugErforderlich: !!this.formComponent.anforderungenForm.controls.privFahrzeug.value,
            fakatId: this.formComponent.anforderungenForm.controls.fuehrerausweiskategorie.value,
            angabenFahrzeug: this.formComponent.anforderungenForm.controls.ergaenzendeAngabenFuehrerausweiskategorie.value
        };
    }

    private mapOsteAnlegenToOsteDTO(osteAnlegenParamDTO: OsteAnlegenParamDTO) {
        const obj: OsteDTO = {
            alterVon: osteAnlegenParamDTO.alterVon,
            alterBis: osteAnlegenParamDTO.alterBis,
            geschlechtId: osteAnlegenParamDTO.geschlechtId,
            sprachenBemerkungen: osteAnlegenParamDTO.bemerkungSprache,
            angabenAlter: osteAnlegenParamDTO.angabenAlter,
            angabenAusweis: osteAnlegenParamDTO.angabenFahrzeug,
            privFahrzeug: osteAnlegenParamDTO.fahrzeugErforderlich,
            kategorieId: osteAnlegenParamDTO.fakatId
        };
        const mappedSprachen: SprachkenntnisDTO[] =
            this.wizardService.osteEgovAnlegenParamDTO.sprachenList && this.wizardService.osteEgovAnlegenParamDTO.sprachenList.length
                ? this.wizardService.osteEgovAnlegenParamDTO.sprachenList.map(item => {
                      return {
                          ...item,
                          aufenthalt: item.sprachaufenthalt,
                          spracheObject: item.sprache
                      };
                  })
                : [];

        setTimeout(() => {
            this.formComponent.mapToFormAnforderungen(obj);
            this.formComponent.spracheTable.mapToTable(mappedSprachen);
            this.formComponent.berufTable.mapToTable(this.wizardService.osteEgovAnlegenParamDTO.berufeList);
        });
    }
}
