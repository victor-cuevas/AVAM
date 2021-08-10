import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesWiedereingliederungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { WidereingliederungLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';

import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperStesWdgZielDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesWdgZielDTOWarningMessages';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { Observable, Subscription } from 'rxjs';
import { WdgZielAbstract } from '../wdgziel-abstract';
import { WdgZielFormHandler } from '../wdgziel-form-handler';

@Component({
    selector: 'avam-wiedereingliederungsziel-bearbeiten',
    templateUrl: '../wdgziel.component.html',
    styleUrls: ['./wdgziel-bearbeiten.component.scss'],
    providers: [WdgZielFormHandler, ObliqueHelperService]
})
export class WdgZielBearbeitenComponent extends WdgZielAbstract implements OnInit, OnDestroy {
    zielId: string;
    langChangeSubscription: Subscription;
    permissions: typeof Permissions = Permissions;

    constructor(
        wdgZielFormHandler: WdgZielFormHandler,
        route: ActivatedRoute,
        router: Router,
        dataService: StesDataRestService,
        modalService: NgbModal,
        toolboxService: ToolboxService,
        spinnerService: SpinnerService,
        translateService: TranslateService,
        fehlermeldungenService: FehlermeldungenService,
        resetDialogService: ResetDialogService,
        navigationService: NavigationService,
        notificationService: NotificationService,
        authService: AuthenticationService,
        obliqueHelper: ObliqueHelperService,
        messageBus: MessageBus,
        private dbTranslateService: DbTranslateService,
        private formBuilder: FormBuilder,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super(
            wdgZielFormHandler,
            route,
            router,
            dataService,
            modalService,
            toolboxService,
            spinnerService,
            translateService,
            fehlermeldungenService,
            resetDialogService,
            navigationService,
            notificationService,
            authService,
            obliqueHelper,
            messageBus
        );
        SpinnerService.CHANNEL = this.wdgZielChannel;
    }

    ngOnInit() {
        super.ngOnInit();
        this.wdgZielForm = this.wdgZielFormHandler.createForm();
        this.loadData();
        this.setSideNavigation();
        this.subscribeToLangChange();
        this.toolboxActionSub = this.subscribeToToolbox();
    }

    closeComponent(message) {
        if (message.data.label === this.translateService.instant(WidereingliederungLabels.ZIEL_BEARBEITEN)) {
            this.cancel();
        }
    }

    getAdditionalRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.zielId = params.get('stesWdgZielId');
        });
    }

    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.ZIELE_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.ZIEL_BEARBEITEN, {
            stesWdgZielId: this.zielId
        });
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN);
    }

    cancel() {
        if (this.router.url.includes(StesWiedereingliederungPaths.ZIEL_BEARBEITEN)) {
            this.router.navigate([`./${StesWiedereingliederungPaths.ZIELE_ANZEIGEN}`], { relativeTo: this.route.parent });
            this.navigationService.hideNavigationTreeRoute(StesWiedereingliederungPaths.ZIEL_BEARBEITEN, {
                stesWdgZielId: this.zielId
            });
        }
    }

    setUeberschrift() {
        this.stesInfobarService.sendDataToInfobar({ title: `${this.dbTranslateService.instant(WidereingliederungLabels.ZIEL_BEARBEITEN)} - ${this.getZielText()}` });
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.setUeberschrift();
        });
    }

    getZielText(): string {
        return this.zielDetails.ziel;
    }

    getZielDetails(): Observable<BaseResponseWrapperStesWdgZielDTOWarningMessages> {
        return this.dataService.getWdgZielById(this.zielId);
    }

    populateBeurteilungsKriterien(zielAusgDatumObjects: Array<number>): void {
        const formarr = this.wdgZielForm.get('beurteilungsKriterium') as FormArray;

        while (formarr.controls.length > 0) {
            formarr.removeAt(0);
        }

        if (zielAusgDatumObjects && zielAusgDatumObjects.length > 0) {
            zielAusgDatumObjects.forEach(crit => {
                formarr.push(this.formBuilder.control(crit));
            });
        } else {
            formarr.push(this.formBuilder.control(''));
        }
    }

    populateForm() {
        this.wdgZielForm.reset(this.wdgZielFormHandler.mapToForm(this.zielDetails));
        this.populateBeurteilungsKriterien(this.zielDetails.stesBeurteilungselementIds);
        this.setUeberschrift();
        this.setInfoIconData();
    }

    save() {
        this.fehlermeldungenService.closeMessage();
        if (!this.wdgZielForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }
        this.spinnerService.activate(this.wdgZielChannel);

        this.dataService.updateWdgZiel(this.wdgZielFormHandler.mapToDTO(this.wdgZielForm, this.stesId, this.zielId)).subscribe(
            response => {
                if (response.data) {
                    this.zielDetails = response.data;
                    this.wdgZielForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.populateForm();
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    setInfoIconData() {
        this.stesInfobarService.sendLastUpdate(this.zielDetails);
    }

    openDeleteDialog() {
        const modalRef = this.openModal(GenericConfirmComponent, 'modal-basic-title');
        modalRef.result.then(
            result => {
                if (result) {
                    this.delete();
                }
            },
            reason => {
                ToolboxService.CHANNEL = this.wdgZielToolboxId;
            }
        );
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    reset() {
        if (this.wdgZielForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.wdgZielForm.reset(this.wdgZielFormHandler.mapToForm(this.zielDetails));
                this.populateBeurteilungsKriterien(this.zielDetails.stesBeurteilungselementIds);
            });
        }
    }

    delete() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.wdgZielChannel);
        this.dataService.deleteWdgZielById(this.zielId).subscribe(
            response => {
                if (!response) {
                    this.wdgZielForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                    this.router.navigate([`stes/details/${this.stesId}/wiedereingliederung/ziele`]);
                    this.navigationService.hideNavigationTreeRoute(StesWiedereingliederungPaths.ZIEL_BEARBEITEN, {
                        stesWdgZielId: this.zielId
                    });
                }

                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgeloescht'));
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        this.stesInfobarService.sendLastUpdate({}, true);
    }

    configureToolbox() {
        const toolboxData: DokumentVorlageToolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.WDGZIEL,
            vorlagenKategorien: [VorlagenKategorie.Wdg],
            entityIDsMapping: { STES_ID: +this.stesId, WDG_ZIEL_ID: +this.zielId }
        };

        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];
        this.toolboxService.sendConfiguration(toolboxConfig, this.wdgZielToolboxId, toolboxData);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.zielId, AvamCommonValueObjectsEnum.T_WDGZIEL);
            }
        });
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }
}
