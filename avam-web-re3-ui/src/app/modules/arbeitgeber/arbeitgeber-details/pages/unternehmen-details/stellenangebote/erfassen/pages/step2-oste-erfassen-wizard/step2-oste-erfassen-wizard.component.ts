import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WizardErfassenService } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/wizard/wizard-erfassen.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Unsubscribable } from 'oblique-reactive';
import { Step2OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/step2-oste-erfassen-form.component';
import { takeUntil } from 'rxjs/operators';
import { WarningMessages } from '@dtos/warningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { FormArray, FormGroup } from '@angular/forms';
import { OsteAnlegenParamDTO } from '@dtos/osteAnlegenParamDTO';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { BaseResponseWrapperOsteAnlegenParamDTOWarningMessages } from '@dtos/baseResponseWrapperOsteAnlegenParamDTOWarningMessages';
import { OsteDTO } from '@dtos/osteDTO';
import { forkJoin } from 'rxjs';
import KeyEnum = WarningMessages.KeyEnum;

@Component({
    selector: 'avam-step2-oste-erfassen-wizard',
    templateUrl: './step2-oste-erfassen-wizard.component.html',
    styleUrls: ['./step2-oste-erfassen-wizard.component.scss']
})
export class Step2OsteErfassenWizardComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: Step2OsteErfassenFormComponent;
    permissions: typeof Permissions = Permissions;
    anforderungenChannel = 'anforderungen';

    constructor(
        private wizardService: WizardErfassenService,
        private infopanelService: AmmInfopanelService,
        private unternehmenRestService: UnternehmenRestService,
        private fehlermeldungService: FehlermeldungenService,
        private resetDialogService: ResetDialogService,
        private osteDataService: OsteDataRestService,
        private dbTranslateService: DbTranslateService
    ) {
        super();
    }

    ngOnInit() {
        if (!this.wizardService.osteErfassenParam.step1) {
            this.wizardService.navigateTo(1, this.wizardService.osteId || null);
        }

        this.wizardService.selectCurrentStep(1);
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.anforderungen' });
    }

    ngAfterViewInit() {
        this.loadData();
    }

    ngOnDestroy() {
        this.fehlermeldungService.closeMessage();
        super.ngOnDestroy();
    }

    canDeactivate() {
        return this.formComponent.berufTable.tableForm.dirty || this.formComponent.spracheTable.tableForm.dirty || this.formComponent.anforderungenForm.dirty;
    }

    cancel() {
        this.wizardService.navigateToOsteUebersicht();
    }

    reset() {
        if (this.formComponent.berufTable.tableForm.dirty || this.formComponent.spracheTable.tableForm.dirty || this.formComponent.anforderungenForm.dirty) {
            this.fehlermeldungService.closeMessage();
            this.resetDialogService.reset(() => {
                if (this.wizardService.osteErfassenParam.step2) {
                    this.mapOsteAnlegenToOsteDTO();
                } else if (this.wizardService.osteId) {
                    this.formComponent.mapToFormAnforderungen(this.wizardService.osteDTO);
                    this.formComponent.spracheTable.mapToTable(this.wizardService.sprachkenntnisDTO);
                    this.formComponent.berufTable.mapToTable(this.wizardService.berufeDTO);
                } else {
                    this.formComponent.dataSourceSprachen = [];
                    this.formComponent.anforderungenForm.reset({
                        idealesAlterSlider: {
                            alterVon: 18,
                            alterBis: 65
                        }
                    });
                }
            });
        }
    }

    movePrevious() {
        this.wizardService.navigateTo(1, this.wizardService.osteId || null);
    }

    moveNext() {
        this.fehlermeldungService.closeMessage();
        if (this.formComponent.anforderungenForm.valid && this.isTableDataValid('sprache') && this.isTableDataValid('beruf')) {
            this.wizardService.activateSpinner(this.anforderungenChannel);
            this.unternehmenRestService
                .checkOsteStep(this.mapToDTO(), this.wizardService.currentStep)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperOsteAnlegenParamDTOWarningMessages) => {
                        if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key !== KeyEnum.DANGER)) {
                            this.wizardService.osteErfassenParam.step2 = true;
                            this.wizardService.setOsteAnlegeParamDTO({ ...this.wizardService.osteAnlegeParamDTO, ...response.data });
                            this.wizardService.setSprachkenntnisDTO(this.formSprachentoSprachkenntnis());
                            this.wizardService.setOsteBerufsbildungEntryParamDTO(this.formComponent.berufTable.berufList);
                            this.formComponent.anforderungenForm.markAsPristine();
                            this.formComponent.spracheTable.tableForm.markAsPristine();
                            this.formComponent.berufTable.tableForm.markAsPristine();
                            this.wizardService.navigateTo(3, this.wizardService.osteId || null);
                        }
                        this.wizardService.deactivateSpinner(this.anforderungenChannel);
                    },
                    () => {
                        OrColumnLayoutUtils.scrollTop();
                        this.wizardService.deactivateSpinner(this.anforderungenChannel);
                    }
                );
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.fehlermeldungService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    isAnyFormInvalid() {
        return !this.formComponent.berufTable.tableForm.valid || !this.formComponent.anforderungenForm.valid || !this.formComponent.spracheTable.tableForm.valid;
    }

    formSprachentoSprachkenntnis() {
        const rowsFormGroups = (this.formComponent.spracheTable.tableForm.controls.array as FormArray).controls;
        let sprachkenntnisse = [];
        rowsFormGroups.forEach(ele => {
            if (ele.get('sprache')['autosuggestObject'] && ele.get('sprache')['autosuggestObject'].kurzTextDe) {
                sprachkenntnisse.push({
                    sprachkenntnisId: ele.get('sprache')['autosuggestObject'].codeId,
                    spracheId: ele.value.codeId,
                    osteId: this.wizardService.osteId || null,
                    muendlichId: ele.value.muendlich,
                    schriftlichId: ele.value.schriftlich,
                    muttersprache: ele.value.muttersprache !== null && ele.value.muttersprache !== undefined ? !!+ele.value.muttersprache : null,
                    aufenthalt: ele.value.sprachenaufenthalt !== null && ele.value.sprachenaufenthalt !== undefined ? !!+ele.value.sprachenaufenthalt : null,
                    spracheObject: ele.get('sprache')['autosuggestObject'],
                    muendlichObject: { codeId: ele.value.muendlich },
                    schriftlichObject: { codeId: ele.value.schriftlich }
                });
            }
        });
        return sprachkenntnisse;
    }

    mapToDTO(): OsteAnlegenParamDTO {
        const alter = this.formComponent.anforderungenForm.controls.idealesAlterSlider as FormGroup;
        return {
            ...this.wizardService.osteAnlegeParamDTO,
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

    private isTableDataValid(tableName: string): boolean {
        return !this[`${tableName}Repeated`] && !this[`${tableName}IdNotFound`];
    }

    private loadData() {
        this.formComponent.dataLoaded.subscribe(() => {
            if (this.wizardService.osteErfassenParam.step2) {
                this.wizardService.deactivateSpinner(this.anforderungenChannel);
                this.mapOsteAnlegenToOsteDTO();
            } else if (this.wizardService.osteId) {
                this.wizardService.activateSpinner(this.anforderungenChannel);
                forkJoin([
                    this.osteDataService.getOsteSprachkenntnisse(this.wizardService.osteId, this.dbTranslateService.getCurrentLang()),
                    this.osteDataService.getOsteBerufsqualifikation(this.wizardService.osteId)
                ])
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(
                        ([sprachkenntnisse, berufsqualifikation]) => {
                            if (this.wizardService.osteDTO) {
                                this.formComponent.mapToFormAnforderungen(this.wizardService.osteDTO);
                            }
                            this.formComponent.spracheTable.mapToTable(sprachkenntnisse.data);
                            this.formComponent.spracheTable.sortFunction({
                                field: 'language',
                                order: 1
                            });
                            this.formComponent.berufTable.mapToTable(
                                berufsqualifikation.data.map(dto => {
                                    // mapToTable is used to map OsteBerufsbildungEntryParamDTO and BerufsqualifikationDTO interfaces, therefore this additional mapping is required
                                    return { ...dto, berufDTO: dto.berufDto, ausbildungsniveauId: dto.ausbildungId, abschlussId: dto.abschlussAuslandId };
                                })
                            );
                            this.formComponent.berufTable.sortFunction({
                                field: 'beruf',
                                order: 1
                            });
                            this.wizardService.setSprachkenntnisDTO(sprachkenntnisse.data);
                            this.wizardService.deactivateSpinner(this.anforderungenChannel);
                        },
                        () => this.wizardService.deactivateSpinner(this.anforderungenChannel)
                    );
            } else {
                setTimeout(
                    () =>
                        this.formComponent.anforderungenForm.controls.idealesAlterSlider.setValue({
                            idealesAlter: '',
                            alterVon: 18,
                            alterBis: 65
                        }),
                    0
                );
                this.formComponent.spracheTable.onAddRowOnTop(true);
                this.formComponent.berufTable.onAddRowOnTop(true);
            }
        });
    }

    private mapOsteAnlegenToOsteDTO() {
        const osteAnlegenParamDTO = this.wizardService.osteAnlegeParamDTO;
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

        setTimeout(() => {
            this.formComponent.mapToFormAnforderungen(obj);
            this.formComponent.spracheTable.mapToTable(this.wizardService.sprachkenntnisDTO);
            this.formComponent.berufTable.mapToTable(this.wizardService.berufeDTO);
        });
    }
}
