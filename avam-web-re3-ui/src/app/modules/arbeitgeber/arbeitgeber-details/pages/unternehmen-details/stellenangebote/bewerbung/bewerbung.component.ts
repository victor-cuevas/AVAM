import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { OsteNavigationHelperService } from '@modules/arbeitgeber/arbeitgeber-details/services/oste-navigation-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Unsubscribable } from 'oblique-reactive';
import { Step3OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step3-oste-erfassen-form/step3-oste-erfassen-form.component';
import { FacadeService } from '@shared/services/facade.service';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { concatMap, finalize, takeUntil } from 'rxjs/operators';
import { BaseResponseWrapperOsteBearbeitenDTOWarningMessages } from '@dtos/baseResponseWrapperOsteBearbeitenDTOWarningMessages';
import { OsteBearbeitenDTO } from '@dtos/osteBearbeitenDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { OsteStatusCode } from '@shared/enums/domain-code/oste-status-code.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { WizardErfassenService } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/wizard/wizard-erfassen.service';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { ArbeitgeberPaths } from '@shared/enums/stes-navigation-paths.enum';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { OsteBewerbungParamDTO } from '@dtos/osteBewerbungParamDTO';
import { KontakteViewDTO } from '@dtos/kontakteViewDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BaseResponseWrapperCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCodeDTOWarningMessages';

@Component({
    selector: 'avam-bewerbung',
    templateUrl: './bewerbung.component.html',
    styleUrls: ['./bewerbung.component.scss']
})
export class BewerbungComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('formComponent') bewerbungForm: Step3OsteErfassenFormComponent;
    osteId: string;
    channel = 'bewerbungChannel';
    buttonActive = true;
    currentOste: OsteBearbeitenDTO;
    permissions: typeof Permissions = Permissions;
    private currentStatus: CodeDTO;

    constructor(
        public wizardService: WizardErfassenService,
        private infopanelService: AmmInfopanelService,
        private osteSideNavHelper: OsteNavigationHelperService,
        private route: ActivatedRoute,
        private facadeService: FacadeService,
        private osteRestService: OsteDataRestService,
        private stesDataRestService: StesDataRestService,
        private router: Router
    ) {
        super();
    }

    public ngOnInit() {
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.bewerbung' });
        this.getRouteParams();
        this.configureToolbox();
    }

    public ngAfterViewInit() {
        this.initData();
    }

    public ngOnDestroy() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    public canDeactivate() {
        return this.bewerbungForm.isAnyFormDirty();
    }

    public cancel() {
        if (this.router.url.includes(ArbeitgeberPaths.STELLENANGEBOTE_STELLENANGEBOT_BEWERBUNG)) {
            this.router.navigate(['../../'], { relativeTo: this.route });
        }
    }

    public reset() {
        if (this.bewerbungForm.isAnyFormDirty()) {
            this.facadeService.fehlermeldungenService.closeMessage();
            this.facadeService.resetDialogService.reset(() => {
                this.bewerbungForm.mapToForm(this.currentOste.osteDTO);
                this.bewerbungForm.makeAllFormPristine();
            });
        }
    }

    public save() {
        this.facadeService.notificationService.clear();
        this.facadeService.fehlermeldungenService.closeMessage();
        if (
            this.bewerbungForm.bewerbungCompleteForm.valid &&
            this.bewerbungForm.adresseForm.valid &&
            this.bewerbungForm.kontakpersonForm.valid &&
            this.bewerbungForm.fragenZuStelleForm.valid &&
            this.bewerbungForm.checkboxForm.valid
        ) {
            this.facadeService.spinnerService.activate(this.channel);
            this.osteRestService
                .osteBewerbungSpeichern(this.mapToDTO())
                .pipe(takeUntil(this.unsubscribe))
                .pipe(
                    finalize(() => {
                        this.facadeService.spinnerService.deactivate(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                    })
                )
                .subscribe((response: BaseResponseWrapperOsteBearbeitenDTOWarningMessages) => {
                    if (!response.warning) {
                        this.bewerbungForm.makeAllFormPristine();
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                            this.router.navigate([`arbeitgeber/details/${this.currentOste.osteDTO.unternehmenId}/${ArbeitgeberPaths.STELLENANGEBOTE_STELLENANGEBOT_BEWERBUNG}`], {
                                queryParams: { osteId: this.osteId }
                            });
                        });
                        this.facadeService.notificationService.success('common.message.datengespeichert');
                    }
                });
        } else {
            this.bewerbungForm.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private getRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.osteId = params.get('osteId');
            this.osteSideNavHelper.setFirstLevelNav();
        });
    }

    private configureToolbox() {
        ToolboxService.CHANNEL = this.channel;
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getOsteBearbeitenConfig(), this.channel, ToolboxDataHelper.createForOsteBearbeiten(+this.osteId));

        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.facadeService.openModalFensterService.openHistoryModal(this.osteId, AvamCommonValueObjectsEnum.T_OSTE);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.facadeService.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_OSTE_BEARBEITEN, this.osteId);
                }
            });
    }

    private initData() {
        this.facadeService.spinnerService.activate(this.channel);
        this.osteRestService
            .getOsteBewerbungOwner(this.osteId)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel)),
                concatMap((response: BaseResponseWrapperOsteBearbeitenDTOWarningMessages) => {
                    if (response.data) {
                        this.currentOste = response.data;
                        this.setUnternehmenAdressFormValue();
                        return this.stesDataRestService.getCodeById(response.data.osteDTO.statusId);
                    }
                })
            )
            .subscribe((response: BaseResponseWrapperCodeDTOWarningMessages) => {
                this.currentStatus = response.data ? response.data : {};
                this.buttonActive =
                    this.currentStatus.code === OsteStatusCode.ACTIVE &&
                    (this.currentOste.anzahlUnbearbeiteteJobroomMeldungen === null || this.currentOste.anzahlUnbearbeiteteJobroomMeldungen === 0);
                this.bewerbungForm.mapToForm(this.currentOste.osteDTO);
                this.bewerbungForm.makeAllFormPristine();
                this.showInitialMessages(this.currentOste);
            });
    }

    private showInitialMessages(osteBearbeitenDTO: OsteBearbeitenDTO) {
        if (this.currentStatus.code === OsteStatusCode.ABGEMELDET) {
            // BSP36
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.stelleabgemeldet', 'info');
        } else if (osteBearbeitenDTO.anzahlUnbearbeiteteJobroomMeldungen > 0) {
            // BSP68
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.unbearbeitetejobroommeldungzustellennr', 'info');
        }
        if (!!osteBearbeitenDTO.osteDTO.meldepflicht) {
            //BSP85
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.stelleMeldepflicht', 'info');
        }
        //BSP3
        if (
            (osteBearbeitenDTO.osteDTO.bewerPersoenlich || osteBearbeitenDTO.osteDTO.bewerSchriftlich) &&
            osteBearbeitenDTO &&
            this.isAddressDifferentFromArbeitgebers(osteBearbeitenDTO)
        ) {
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.standortadreesMessage', 'info');
        }
    }

    private isAddressDifferentFromArbeitgebers(osteBearbeitenDTO: OsteBearbeitenDTO): boolean {
        const osteDTO = osteBearbeitenDTO.osteDTO;
        const unternehmen: UnternehmenDTO = osteBearbeitenDTO.osteDTO.unternehmenDto;
        const unternehmenAdress = this.initUnternehmenAdressForComparation(unternehmen);
        const osteAdress = this.initOsteAdressForComparation(osteDTO);
        return JSON.stringify(unternehmenAdress) !== JSON.stringify(osteAdress);
    }

    private initUnternehmenAdressForComparation(unternehmen) {
        return {
            name: unternehmen.name1 || '',
            name2: unternehmen.name2 || '',
            name3: unternehmen.name3 || '',
            strasse: unternehmen.strasse || '',
            strasseNr: unternehmen.strasseNr || 0,
            plz: {
                postleitzahl: unternehmen.plz ? unternehmen.plz : unternehmen.plzAusland,
                ort: unternehmen.plz ? unternehmen.plz : unternehmen.ortAusland
            },
            plzPostfach: {
                postleitzahl: unternehmen.postfachPlzObject ? unternehmen.postfachPlzObject : unternehmen.postfachPlzAusland,
                ort: unternehmen.postfachPlzObject ? unternehmen.postfachPlzObject : unternehmen.postfachPlzOrtAusland
            },
            land: unternehmen.staat,
            postfach: unternehmen.postfach
        };
    }

    private initOsteAdressForComparation(osteDTO) {
        return {
            name: osteDTO.unternehmenName1 || '',
            name2: osteDTO.unternehmenName2 || '',
            name3: osteDTO.unternehmenName3 || '',
            strasse: osteDTO.unternehmenStrasse || '',
            strasseNr: osteDTO.unternehmenStrasseNr || 0,
            plz: {
                postleitzahl: osteDTO.plzDto ? osteDTO.plzDto : osteDTO.unternehmenPlzAusland,
                ort: osteDTO.arbeitsortPlzDto ? osteDTO.arbeitsortPlzDto : osteDTO.arbeitsortAuslandOrt
            },
            plzPostfach: {
                postleitzahl: osteDTO.postfachPlzDto ? osteDTO.postfachPlzDto : osteDTO.unternehmenPostfachPlzAusland,
                ort: osteDTO.postfachPlzDto ? osteDTO.postfachPlzDto : osteDTO.arbeitsortAuslandOrt
            },
            land: osteDTO.staatDto,
            postfach: osteDTO.unternehmenPostfach
        };
    }

    private setUnternehmenAdressFormValue() {
        const unternehmenDTOfromOste = this.currentOste.osteDTO.unternehmenDto;
        const unternehmenDto: UnternehmenResponseDTO = {
            ...unternehmenDTOfromOste,
            plzOrt: unternehmenDTOfromOste.plz,
            plzAusland: unternehmenDTOfromOste.plzAusland,
            ortAusland: unternehmenDTOfromOste.ortAusland,
            plzOrtPostfach: unternehmenDTOfromOste.postfachPlzObject,
            postfachPlzAusland: unternehmenDTOfromOste.postfachPlzAusland,
            postfachOrtAusland: unternehmenDTOfromOste.postfachPlzOrtAusland,
            land: unternehmenDTOfromOste.staat
        };

        this.wizardService.setUnternehmenDTO(unternehmenDto);
    }

    private mapToDTO(): OsteBewerbungParamDTO {
        const adressFormControls = this.bewerbungForm.adresseForm.controls;
        const checkboxFormControls = this.bewerbungForm.checkboxForm.controls;
        const bewerbungCompleteFormControls = this.bewerbungForm.bewerbungCompleteForm.controls;
        const kontaktpersonFormControls = this.bewerbungForm.kontakpersonForm.controls;
        const fragenZuStelleFormControls = this.bewerbungForm.fragenZuStelleForm.controls;
        return {
            osteId: +this.osteId,
            ojbVersion: this.currentOste.osteDTO.ojbVersion,

            bewerbSchriftl: checkboxFormControls.schriftlich.value,
            bewerbPersoenl: checkboxFormControls.persoenlich.value,
            bewerbElektr: checkboxFormControls.elektronisch.value,
            bewerbTelefon: checkboxFormControls.telefonisch.value,

            weitereAngaben: bewerbungCompleteFormControls.ergaenzendeAngaben.value,
            ugWebadresse: this.mapOnlineFormularToDTO(bewerbungCompleteFormControls.onlineFormular.value),
            ugTelefon: bewerbungCompleteFormControls.telefon.value,
            ugEmail: bewerbungCompleteFormControls.elektronischEmail.value,

            ugName1: adressFormControls.name.value || '',
            ugName2: adressFormControls.name2.value || '',
            ugName3: adressFormControls.name3.value || '',
            ugStrasse: adressFormControls.strasse.value,
            ugStrasseNr: adressFormControls.strasseNr.value,
            ugPlzDTO: adressFormControls.plz['plzWohnAdresseObject'],
            ugPostfachPlzDTO: adressFormControls.plzPostfach['plzWohnAdresseObject'],
            ugStaatDTO: adressFormControls.land['landAutosuggestObject'],
            ugPostfach: adressFormControls.postfach.value,

            kontaktPerson: this.mapKontaktperson(kontaktpersonFormControls),
            fragenPerson: this.mapKontaktperson(fragenZuStelleFormControls)
        };
    }

    private mapKontaktperson(kontakt: any): KontakteViewDTO {
        return {
            anredeId: kontakt.anrede.value,
            name: kontakt.name.value,
            vorname: kontakt.vorname.value,
            telefonNr: kontakt.telefon.value,
            email: kontakt.email.value
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
