import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { MessageBus } from '@shared/services/message-bus';
import { ToolboxService } from '@app/shared';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { BaseResponseWrapperListSchlagwortDTOWarningMessages } from '@dtos/baseResponseWrapperListSchlagwortDTOWarningMessages';
import { SchlagwortDTO } from '@dtos/schlagwortDTO';
import { BaseResponseWrapperArbeitgeberDTOWarningMessages } from '@dtos/baseResponseWrapperArbeitgeberDTOWarningMessages';
import { ArbeitgeberDTO } from '@dtos/arbeitgeberDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { ArbeitgeberSchlagwortDTO } from '@dtos/arbeitgeberSchlagwortDTO';

@Component({
    selector: 'avam-arbeitgeber-akquisition',
    templateUrl: './arbeitgeber-akquisition.component.html',
    styleUrls: ['./arbeitgeber-akquisition.component.scss']
})
export class ArbeitgeberAkquisitionComponent extends AbstractBaseForm implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') public ngForm: FormGroupDirective;
    public channel = 'akquisition';
    public unternehmenId;
    public readonly toolboxChannel = 'arbeitgeber-akquisition-channel';
    public akquisitionForm: FormGroup;
    public optionsMultiselect = [];
    public permissions: typeof Permissions = Permissions;
    private lastUpdatedCurrentArbeitgeber: ArbeitgeberDTO;

    constructor(
        public activatedRoute: ActivatedRoute,
        private obliqueHelper: ObliqueHelperService,
        private fb: FormBuilder,
        public spinnerService: SpinnerService,
        public modalService: NgbModal,
        private fehlerMeldung: FehlermeldungenService,
        public messageBus: MessageBus,
        public toolboxService: ToolboxService,
        private dataRestService: StesDataRestService,
        private unternehmenRestService: UnternehmenRestService,
        private dbTranslateService: DbTranslateService,
        private infopanelService: AmmInfopanelService,
        private resetDialogService: ResetDialogService,
        private readonly notificationService: NotificationService
    ) {
        super('akquisition', modalService, spinnerService, messageBus, toolboxService, fehlerMeldung);
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit() {
        this.getSchlagwortListFromBE();
        this.obliqueHelper.ngForm = this.ngForm;
        this.getRouteData();
        this.generateForm();
        this.setSubscriptions();
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.label.akquisition' });
        this.initToolBox();
    }

    ngAfterViewInit(): void {
        this.getData();
    }

    getData(): void {
        this.spinnerService.activate(this.channel);
        this.unternehmenRestService
            .getArbeitgeberAkquisitionByUnternehmenId(this.unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperArbeitgeberDTOWarningMessages) => {
                    if (response.data) {
                        this.lastUpdatedCurrentArbeitgeber = response.data;
                        this.mapToForm(this.lastUpdatedCurrentArbeitgeber);
                        this.akquisitionForm.get('schlagworte').setValue(this.optionsMultiselect);
                    }
                    this.spinnerService.deactivate(this.channel);
                },
                () => this.spinnerService.deactivate(this.channel)
            );
    }

    reset(): void {
        if (this.akquisitionForm.dirty) {
            this.fehlermeldungenService.closeMessage();
            this.resetDialogService.reset(() => {
                this.akquisitionForm.reset();
                this.mapToForm(this.lastUpdatedCurrentArbeitgeber);
                this.akquisitionForm.get('schlagworte').setValue(this.optionsMultiselect);
                this.akquisitionForm.markAsPristine();
            });
        }
    }

    save(shouldFinish?: boolean): void {
        const currentArbeitgeber = this.mapToDTO();
        this.spinnerService.activate(this.channel);
        this.unternehmenRestService
            .saveArbeitgeber(currentArbeitgeber)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperArbeitgeberDTOWarningMessages) => {
                    if (!!response.data) {
                        this.notificationService.success('common.message.datengespeichert');
                        this.lastUpdatedCurrentArbeitgeber = response.data;
                        this.mapToForm(this.lastUpdatedCurrentArbeitgeber);
                        this.akquisitionForm.get('schlagworte').setValue(this.optionsMultiselect);
                        this.akquisitionForm.markAsPristine();
                    }
                    this.spinnerService.deactivate(this.channel);
                },
                () => this.spinnerService.deactivate(this.channel)
            );
    }

    private getRouteData() {
        this.activatedRoute.parent.params.subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
            }
        });
    }

    private generateForm() {
        this.akquisitionForm = this.fb.group({
            zusammenarbeit: true,
            vereinbarung: [],
            geschafstatigkeit: [],
            erreichbarkeit: [],
            erganendeAngaben: [],
            schlagworte: []
        });
    }

    private mapToForm(akquisition: ArbeitgeberDTO) {
        this.akquisitionForm.setValue({
            zusammenarbeit: akquisition ? akquisition.zusammenarbeit : true,
            vereinbarung: akquisition ? akquisition.vereinbarung : '',
            geschafstatigkeit: akquisition ? akquisition.taetigkeit : '',
            erreichbarkeit: akquisition ? akquisition.erreichbarkeit : '',
            erganendeAngaben: akquisition ? akquisition.bemerkungen : '',
            schlagworte: []
        });
        this.updateSchlagwortList(!!akquisition ? akquisition.schlagworteList : []);
    }

    private updateSchlagwortList(schlagworteList: Array<ArbeitgeberSchlagwortDTO>) {
        this.optionsMultiselect.forEach(item => {
            item.value = !!schlagworteList.find(schlagworte => schlagworte.schlagwortId === item.id);
        });
    }

    private setSubscriptions() {
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.unternehmenId, AvamCommonValueObjectsEnum.T_UNTERNEHMEN);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });
    }

    private openHistoryModal(objId: string, objType: string): void {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private openDmsCopyModal(): void {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;
        comp.context = DmsMetadatenContext.DMS_CONTEXT_UNTERNEHMENARBEITGEBER;
        comp.id = this.unternehmenId;
    }

    private initToolBox() {
        const toolboxConfig = ToolboxConfig.getArbeitgetberAkquisitionBearbeitenConfig();
        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForArbeitgeber(this.unternehmenId));
        this.messageBus.buildAndSend('toolbox.help.formNumber', this.activatedRoute.snapshot.data.formNumber);
        this.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: this.activatedRoute.snapshot.data.formNumber });
    }

    private setMultiselectOptions(schlagwortList: Array<SchlagwortDTO>) {
        const mappedOptions = schlagwortList.map(this.multiselectMapper);
        return mappedOptions;
    }
    private multiselectMapper = (schlagwort: any) => {
        const element = schlagwort;

        return {
            id: element.schlagwortId,
            textDe: element.schlagwortDe,
            textIt: element.schlagwortIt,
            textFr: element.schlagwortFr,
            value: false
        };
    };

    private mapToDTO(): ArbeitgeberDTO {
        return {
            arbeitgeberId: !!this.lastUpdatedCurrentArbeitgeber ? this.lastUpdatedCurrentArbeitgeber.arbeitgeberId : null,
            unternehmenId: this.unternehmenId,
            zusammenarbeit: this.akquisitionForm.controls.zusammenarbeit.value,
            vereinbarung: this.akquisitionForm.controls.vereinbarung.value,
            taetigkeit: this.akquisitionForm.controls.geschafstatigkeit.value,
            erreichbarkeit: this.akquisitionForm.controls.erreichbarkeit.value,
            bemerkungen: this.akquisitionForm.controls.erganendeAngaben.value,
            schlagworteList: this.getSchlagwortFromMultiselect()
        };
    }

    private getSchlagwortListFromBE() {
        this.unternehmenRestService
            .getSchlagworteFromArbeitgeber()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: BaseResponseWrapperListSchlagwortDTOWarningMessages) => {
                if (!!response.data) {
                    this.optionsMultiselect = this.setMultiselectOptions(response.data);
                }
            });
    }

    private getSchlagwortFromMultiselect(): Array<ArbeitgeberSchlagwortDTO> {
        return this.optionsMultiselect
            .filter(item => !!item.value)
            .map(item => {
                return {
                    arbeitgeberId: !!this.lastUpdatedCurrentArbeitgeber ? this.lastUpdatedCurrentArbeitgeber.arbeitgeberId : null,
                    schlagwortId: item.id
                };
            });
    }
}
