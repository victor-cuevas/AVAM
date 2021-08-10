import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Unsubscribable } from 'oblique-reactive';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { OsteNavigationHelperService } from '@modules/arbeitgeber/arbeitgeber-details/services/oste-navigation-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from '@shared/services/facade.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { ArbeitgeberPaths } from '@shared/enums/stes-navigation-paths.enum';
import { OsteDTO } from '@dtos/osteDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { BaseResponseWrapperOsteBearbeitenDTOWarningMessages } from '@dtos/baseResponseWrapperOsteBearbeitenDTOWarningMessages';
import { OsteStatusCode } from '@shared/enums/domain-code/oste-status-code.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { OsteBearbeitenDTO } from '@dtos/osteBearbeitenDTO';
import { OsteStellenangabenParamDTO } from '@dtos/osteStellenangabenParamDTO';
import { FormGroup } from '@angular/forms';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { Step1OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step1-oste-erfassen-form/step1-oste-erfassen-form.component';
import { BaseResponseWrapperCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCodeDTOWarningMessages';

@Component({
    selector: 'avam-basisangaben',
    templateUrl: './basisangaben.component.html'
})
export class BasisangabenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('formComponent') basisangabenForm: Step1OsteErfassenFormComponent;
    osteId: string;
    basisAngabenChannel = 'step1OsteErfassenBearbeiten';
    permissions: typeof Permissions = Permissions;
    buttonActive: boolean;
    private currentOste: OsteDTO;
    private currentStatus: CodeDTO;

    constructor(
        private facadeService: FacadeService,
        private infopanelService: AmmInfopanelService,
        private osteSideNavHelper: OsteNavigationHelperService,
        private route: ActivatedRoute,
        private router: Router,
        private formUtils: FormUtilsService,
        private osteRestService: OsteDataRestService,
        private stesDataRestService: StesDataRestService
    ) {
        super();
    }

    public ngOnInit() {
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.basisangaben' });
        this.getRouteParams();
        this.configureToolbox();
    }

    public ngAfterViewInit() {
        this.initData();
    }

    public ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    public canDeactivate() {
        return this.basisangabenForm.form.dirty;
    }

    public cancel() {
        if (this.router.url.includes(ArbeitgeberPaths.STELLENANGEBOTE_STELLENANGEBOT_BASISANGABEN)) {
            this.router.navigate(['../../'], { relativeTo: this.route });
        }
        if (this.canDeactivate()) {
            this.osteSideNavHelper.checkConfirmationToCancel();
        } else {
            this.osteSideNavHelper.hideSideNav();
        }
    }

    public reset() {
        if (this.basisangabenForm.form.dirty) {
            this.facadeService.fehlermeldungenService.closeMessage();
            this.facadeService.resetDialogService.reset(() => {
                this.basisangabenForm.mapToForm(this.currentOste);
                this.basisangabenForm.form.markAsPristine();
            });
        }
    }

    public save() {
        this.facadeService.notificationService.clear();
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.spinnerService.activate(this.basisAngabenChannel);
        this.osteRestService
            .osteBasisangabenSpeichern(this.mapToDTO())
            .pipe(takeUntil(this.unsubscribe))
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.basisAngabenChannel)))
            .subscribe((response: BaseResponseWrapperOsteBearbeitenDTOWarningMessages) => {
                if (!response.warning) {
                    this.setDataIntoForm(response.data);
                    this.facadeService.notificationService.success('common.message.datengespeichert');
                }
            });
    }

    private getRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.osteId = params.get('osteId');
            this.osteSideNavHelper.setFirstLevelNav();
        });
    }

    private initData() {
        this.facadeService.spinnerService.activate(this.basisAngabenChannel);
        this.osteRestService
            .getOsteBasisangabenOwner(this.osteId)
            .pipe(takeUntil(this.unsubscribe))
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.basisAngabenChannel)))
            .subscribe((response: BaseResponseWrapperOsteBearbeitenDTOWarningMessages) => {
                if (response.data) {
                    this.setDataIntoForm(response.data);
                }
            });
    }

    private setDataIntoForm(osteBearbeitenDTO: OsteBearbeitenDTO) {
        this.currentOste = osteBearbeitenDTO.osteDTO;
        this.stesDataRestService
            .getCodeById(osteBearbeitenDTO.osteDTO.statusId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: BaseResponseWrapperCodeDTOWarningMessages) => {
                this.currentStatus = response.data ? response.data : {};
                this.buttonActive = this.currentStatus.code === OsteStatusCode.ACTIVE && osteBearbeitenDTO.anzahlUnbearbeiteteJobroomMeldungen === 0;
                this.showInitialMessages(osteBearbeitenDTO);
            });
        this.basisangabenForm.mapToForm(osteBearbeitenDTO.osteDTO);
        this.basisangabenForm.form.markAsUntouched();
        this.basisangabenForm.form.markAsPristine();
    }

    private showInitialMessages(osteBearbeitenDTO: OsteBearbeitenDTO) {
        if (this.currentStatus.code === OsteStatusCode.ABGEMELDET) {
            // BSP36
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.stelleabgemeldet', 'info');
        }
        if (this.currentStatus.code !== OsteStatusCode.ABGEMELDET && osteBearbeitenDTO.anzahlUnbearbeiteteJobroomMeldungen > 0) {
            // BSP68
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.unbearbeitetejobroommeldungzustellennr', 'info');
        }
        if (!!osteBearbeitenDTO.osteDTO.meldepflicht) {
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.stelleMeldepflicht', 'info');
        }
    }

    private configureToolbox() {
        ToolboxService.CHANNEL = this.basisAngabenChannel;
        this.facadeService.toolboxService.sendConfiguration(
            ToolboxConfig.getOsteBearbeitenConfig(),
            this.basisAngabenChannel,
            ToolboxDataHelper.createForOsteBearbeiten(+this.osteId)
        );

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

    private mapToDTO(): OsteStellenangabenParamDTO {
        const antritt = this.basisangabenForm.form.controls.antritt as FormGroup;
        const beschaeftigungsgrad = this.basisangabenForm.form.controls.beschaeftigungsgrad as FormGroup;
        return {
            osteId: +this.osteId,
            ojbVersion: this.currentOste.ojbVersion,
            bezeichnung: this.basisangabenForm.form.controls.stellenbezeichnung.value,
            beschreibung: this.basisangabenForm.form.controls.stellenbeschreibung.value,
            abSofort: antritt.controls.abSofort.value,
            nachVereinbarung: antritt.controls.nachVereinbarung.value,
            antritt: this.formUtils.parseDate(this.basisangabenForm.form.controls.stellenAntritt.value),
            fristTypId: this.basisangabenForm.form.controls.fristTyp.value,
            vertragsdauer: this.basisangabenForm.form.controls.fristDauer.value,
            beschaeftigungMin: beschaeftigungsgrad.controls.pensumVon.value,
            beschaeftigungMax: beschaeftigungsgrad.controls.pensumBis.value,
            wochenarbeitszeit: this.basisangabenForm.form.controls.arbeitszeit.value,
            arbeitsformen: !!this.basisangabenForm.form.controls.arbeitsform.value
                ? this.basisangabenForm.form.controls.arbeitsform.value.filter(arbeitsForm => arbeitsForm.value).map(el => el.id)
                : [],
            arbeitzeitDetail: this.basisangabenForm.form.controls.ergaenzendeangaben.value,
            lohnartId: this.basisangabenForm.form.controls.lohnart.value,
            waehrungId: this.basisangabenForm.form.controls.waehrung.value,
            gehaltMin: this.basisangabenForm.form.controls.lohnmin.value,
            gehaltMax: this.basisangabenForm.form.controls.lohnmax.value,
            arbeitsortstaatObject: !!this.basisangabenForm.form.controls.land ? this.basisangabenForm.form.controls.land['landAutosuggestObject'] : null,
            arbeitsortplzObject: !!this.basisangabenForm.form.controls.plz ? this.basisangabenForm.form.controls.plz['plzWohnAdresseObject'] : null,
            arbeitsortText: this.basisangabenForm.form.controls.zusatztext.value,
            jobSharing: this.basisangabenForm.form.controls.jobSharing.value,
            behinderte: this.basisangabenForm.form.controls.handicap.value,
            anzahlStellen: this.currentOste.gleicheOste
        };
    }
}
