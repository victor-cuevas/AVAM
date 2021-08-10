import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Unsubscribable } from 'oblique-reactive';
import { Step2OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/step2-oste-erfassen-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { FacadeService } from '@shared/services/facade.service';
import { OsteNavigationHelperService } from '@modules/arbeitgeber/arbeitgeber-details/services/oste-navigation-helper.service';
import { forkJoin } from 'rxjs';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { OsteBearbeitenDTO } from '@dtos/osteBearbeitenDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { finalize, flatMap, takeUntil } from 'rxjs/operators';
import { CodeDTO } from '@dtos/codeDTO';
import { OsteStatusCode } from '@shared/enums/domain-code/oste-status-code.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { OsteDTO } from '@dtos/osteDTO';
import { SprachkenntnisDTO } from '@dtos/sprachkenntnisDTO';
import { BerufsqualifikationDTO } from '@dtos/berufsqualifikationDTO';
import { OsteAnforderungenBearbeitenDTO } from '@dtos/osteAnforderungenBearbeitenDTO';
import { OsteBerufsbildungEntryParamDTO } from '@dtos/osteBerufsbildungEntryParamDTO';
import { BaseResponseWrapperOsteBearbeitenDTOWarningMessages } from '@dtos/baseResponseWrapperOsteBearbeitenDTOWarningMessages';
import { BaseResponseWrapperListSprachkenntnisDTOWarningMessages } from '@dtos/baseResponseWrapperListSprachkenntnisDTOWarningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { BaseResponseWrapperCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCodeDTOWarningMessages';

@Component({
    selector: 'avam-anforderungen',
    templateUrl: './anforderungen.component.html',
    styleUrls: ['./anforderungen.component.scss']
})
export class AnforderungenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('formComponent') anforderungenComponent: Step2OsteErfassenFormComponent;
    osteId: string;
    buttonActive: boolean;
    private currentStatus: CodeDTO;

    private osteDTO: OsteDTO;
    private sprachkenntnisseDTOList: SprachkenntnisDTO[];
    private berufsqualifikationDTOList: BerufsqualifikationDTO[];

    readonly permissions: typeof Permissions = Permissions;
    readonly channel = 'anforderungen';

    constructor(
        private infopanelService: AmmInfopanelService,
        private facadeService: FacadeService,
        private router: Router,
        private osteSideNavHelper: OsteNavigationHelperService,
        private route: ActivatedRoute,
        private dbTranslateService: DbTranslateService,
        private osteDataService: OsteDataRestService,
        private stesDataRestService: StesDataRestService
    ) {
        super();
    }

    ngOnInit() {
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.anforderungen' });
        this.getRouteParams();
        this.configureToolbox();
    }

    ngAfterViewInit(): void {
        this.initData();
    }

    ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    canDeactivate() {
        return (
            this.anforderungenComponent.berufTable.tableForm.dirty ||
            this.anforderungenComponent.spracheTable.tableForm.dirty ||
            this.anforderungenComponent.anforderungenForm.dirty
        );
    }

    cancel() {
        if (this.router.url.includes('stellenangebote/stellenangebot/anforderungen')) {
            this.router.navigate(['../../'], { queryParams: {}, relativeTo: this.route });
        }
        if (this.canDeactivate()) {
            this.osteSideNavHelper.checkConfirmationToCancel();
        } else {
            this.osteSideNavHelper.hideSideNav();
        }
    }

    reset() {
        if (
            this.anforderungenComponent.anforderungenForm.dirty ||
            this.anforderungenComponent.spracheTable.tableForm.dirty ||
            this.anforderungenComponent.berufTable.tableForm.dirty
        ) {
            this.facadeService.resetDialogService.reset(() => {
                this.facadeService.fehlermeldungenService.closeMessage();
                this.anforderungenComponent.mapToFormAnforderungen(this.osteDTO);
                this.anforderungenComponent.spracheTable.mapToTable(this.sprachkenntnisseDTOList);
                this.anforderungenComponent.berufTable.mapToTable(
                    this.berufsqualifikationDTOList.map(dto => {
                        // mapToTable is used to map OsteBerufsbildungEntryParamDTO and BerufsqualifikationDTO interfaces, therefore this additional mapping is required
                        return { ...dto, berufDTO: dto.berufDto, ausbildungsniveauId: dto.ausbildungId, abschlussId: dto.abschlussAuslandId };
                    })
                );
                this.anforderungenComponent.anforderungenForm.markAsPristine();
                this.anforderungenComponent.spracheTable.tableForm.markAsPristine();
                this.anforderungenComponent.berufTable.tableForm.markAsPristine();
            });
        }
    }

    save() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (
            this.anforderungenComponent.anforderungenForm.valid &&
            this.anforderungenComponent.berufTable.tableForm.valid &&
            this.anforderungenComponent.spracheTable.tableForm.valid
        ) {
            this.facadeService.spinnerService.activate(this.channel);
            this.osteDataService
                .osteAnforderungenSpeichern(this.mapToDTO())
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => this.facadeService.spinnerService.deactivate(this.channel)),
                    flatMap((response: BaseResponseWrapperOsteBearbeitenDTOWarningMessages) => {
                        if (!response.warning) {
                            this.osteDTO = response.data.osteDTO;
                            this.anforderungenComponent.anforderungenForm.markAsPristine();
                            this.anforderungenComponent.berufTable.tableForm.markAsPristine();
                            this.anforderungenComponent.spracheTable.tableForm.markAsPristine();
                            this.facadeService.notificationService.success('common.message.datengespeichert');
                        }
                        return this.osteDataService.getOsteSprachkenntnisse(this.osteId, this.dbTranslateService.getCurrentLang());
                    })
                )
                .subscribe((response: BaseResponseWrapperListSprachkenntnisDTOWarningMessages) => {
                    this.sprachkenntnisseDTOList = response.data;
                });
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.anforderungenComponent.recheckValidations();
        }
    }

    private mapToDTO(): OsteAnforderungenBearbeitenDTO {
        const anforderungen = this.anforderungenComponent.anforderungenForm.controls;
        return {
            osteAnforderungenParamDTO: {
                osteId: this.osteDTO.osteId,
                alterVon: anforderungen.idealesAlterSlider.value.alterVon,
                alterBis: anforderungen.idealesAlterSlider.value.alterBis,
                geschlechtId: anforderungen.geschlecht.value,
                angabenAlter: anforderungen.ergaenzendeAngabenAlterGeschlecht.value,
                fahrzeugErforderlich: anforderungen.privFahrzeug.value,
                fakatId: anforderungen.fuehrerausweiskategorie.value,
                angabenFahrzeug: anforderungen.ergaenzendeAngabenFuehrerausweiskategorie.value
            },
            osteSprachkenntnisseParamDTO: {
                osteId: this.osteDTO.osteId,
                sprachenList: this.anforderungenComponent.spracheTable.mapSpracheTableDataToSprachList(),
                bemerkungSprache: anforderungen.ergaenzendeAngabenSprache.value
            },
            osteBerufsbildungParamDTO: {
                osteId: this.osteDTO.osteId,
                unternehmenId: this.osteDTO.unternehmenId,
                list: this.getBerufListWithOjbVersion()
            }
        };
    }

    private getBerufListWithOjbVersion(): OsteBerufsbildungEntryParamDTO[] {
        const berufList = this.anforderungenComponent.berufTable.mapBerufTableDataToBerufList();
        berufList.forEach((beruf: OsteBerufsbildungEntryParamDTO) => {
            const match = this.osteDTO.berufsqualifikationList.find(item => item.avamBerufId === beruf.berufDTO.berufId);
            beruf.ojbVersion = match ? match.ojbVersion : 0;
        });
        return berufList;
    }

    private getRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.osteId = params.get('osteId');
            this.osteSideNavHelper.setFirstLevelNav();
        });
    }

    private initData() {
        this.facadeService.spinnerService.activate(this.channel);
        forkJoin<BaseResponseWrapperOsteBearbeitenDTOWarningMessages, BaseResponseWrapperListSprachkenntnisDTOWarningMessages>(
            this.osteDataService.getOsteAnforderungen(this.osteId),
            this.osteDataService.getOsteSprachkenntnisse(this.osteId, this.dbTranslateService.getCurrentLang())
        )
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([oste, sprachkenntnisse]) => {
                this.setStatus(oste.data);
                if (oste.data) {
                    this.osteDTO = oste.data.osteDTO;
                    this.showInitialMessages(oste.data);
                    this.anforderungenComponent.mapToFormAnforderungen(oste.data.osteDTO);

                    this.berufsqualifikationDTOList = oste.data.osteDTO.berufsqualifikationList;

                    this.anforderungenComponent.berufTable.mapToTable(
                        this.sortElements(oste.data.osteDTO.berufsqualifikationList, 'berufDto', 'bezeichnungMa').map(dto => {
                            // mapToTable is used to map OsteBerufsbildungEntryParamDTO and BerufsqualifikationDTO interfaces, therefore this additional mapping is required
                            return { ...dto, berufDTO: dto.berufDto, ausbildungsniveauId: dto.ausbildungId, abschlussId: dto.abschlussAuslandId };
                        })
                    );
                    this.anforderungenComponent.berufTable.sortFunction({
                        field: 'beruf',
                        order: 1
                    });
                }

                if (sprachkenntnisse.data) {
                    this.sprachkenntnisseDTOList = sprachkenntnisse.data;
                    this.anforderungenComponent.spracheTable.mapToTable(this.sortElements(sprachkenntnisse.data, 'spracheObject', 'kurzText'));
                    this.anforderungenComponent.spracheTable.sortFunction({
                        field: 'language',
                        order: 1
                    });
                }
            });
    }

    private sortElements(dataset, objectName, propertyName) {
        return dataset.sort((a, b) => {
            const aElement = this.facadeService.dbTranslateService.translate(a[objectName], propertyName);
            const bElement = this.facadeService.dbTranslateService.translate(b[objectName], propertyName);
            return aElement > bElement ? 1 : aElement < bElement ? -1 : 0;
        });
    }

    private showInitialMessages(osteBearbeitenDTO: OsteBearbeitenDTO) {
        //BSP85
        if (!!osteBearbeitenDTO.osteDTO.meldepflicht) {
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.stelleMeldepflicht', 'info');
        }
    }

    private setStatus(osteBearbeitenDTO: OsteBearbeitenDTO) {
        this.stesDataRestService
            .getCodeById(osteBearbeitenDTO.osteDTO.statusId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: BaseResponseWrapperCodeDTOWarningMessages) => {
                this.currentStatus = response.data ? response.data : {};
                this.buttonActive = this.currentStatus.code === OsteStatusCode.ACTIVE && osteBearbeitenDTO.anzahlUnbearbeiteteJobroomMeldungen === 0;
            });
    }

    configureToolbox() {
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
}
