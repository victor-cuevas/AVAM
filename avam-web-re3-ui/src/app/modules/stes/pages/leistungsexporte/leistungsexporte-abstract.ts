import { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { BaseResponseWrapperPruefResultatLEWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperPruefResultatLEWarningMessages';
import { BaseResponseWrapperStesLeistungsexportDetailsDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesLeistungsexportDetailsDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { StesLeistungsexportDetailsDTO } from '@app/shared/models/dtos-generated/stesLeistungsexportDetailsDTO';
import { ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { LeistungsexportFormHandler } from './leistungsexporte-form-handler';
import { FacadeService } from '@shared/services/facade.service';

const leistungsexportToolboxIdValue = 'leistungsexport';
const leistungsexportChannelValue = 'leistungsexport';

export abstract class LeistungsexporteAbstract extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    leistungsexportToolboxId = leistungsexportToolboxIdValue;
    leistungsexportChannel = leistungsexportChannelValue;
    countriesList: CodeDTO[];
    leistungsexportForm: FormGroup;
    lastUpdate: StesLeistungsexportDetailsDTO;

    valueOnFocusOut = this.setValueOnFocusOut.bind(this);

    protected constructor(
        protected formBuilder: FormBuilder,
        protected dataService: StesDataRestService,
        protected leFormHandler: LeistungsexportFormHandler,
        protected facade: FacadeService
    ) {
        super();
        ToolboxService.CHANNEL = this.leistungsexportToolboxId;
        SpinnerService.CHANNEL = this.leistungsexportChannel;
    }

    ngOnInit(): void {
        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });
    }

    abstract closeComponent(message): void;

    subscribeToToolbox(leistungsexportId?: string): Subscription {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.facade.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_LSTEXP_BEARBEITEN, leistungsexportId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.facade.openModalFensterService.openHistoryModal(leistungsexportId, AvamCommonValueObjectsEnum.T_LSTEXP);
            }
        });
    }

    ngAfterViewInit() {
        document.addEventListener('mouseup', this.valueOnFocusOut);
    }

    setValueOnFocusOut() {
        const dateFromCtrl = this.leistungsexportForm.controls.datumlstexpvon as FormControl;
        const classList = document.activeElement.classList;

        if (
            !classList.contains('text-control-clear') &&
            !classList.contains('has-overlay') &&
            !classList.contains('form-control') &&
            !classList.contains('btn-secondary') &&
            dateFromCtrl.value !== null &&
            dateFromCtrl.valid
        ) {
            this.leFormHandler.setToDate(dateFromCtrl.value, this.leistungsexportForm);
        }
    }

    onDateFromTabOut() {
        const dateFromCtrl = this.leistungsexportForm.controls.datumlstexpvon as FormControl;

        if (dateFromCtrl.value !== null && dateFromCtrl.valid) {
            this.leFormHandler.setToDate(dateFromCtrl.value, this.leistungsexportForm);
        }
    }

    loadData() {
        this.facade.spinnerService.activate(this.leistungsexportChannel);
        this.facade.fehlermeldungenService.closeMessage();

        forkJoin<CodeDTO[], BaseResponseWrapperStesLeistungsexportDetailsDTOWarningMessages, BaseResponseWrapperPruefResultatLEWarningMessages>([
            this.dataService.getCode(DomainEnum.LEISTUNGSEXPORT_STAATEN),
            this.loadLeistungsexport(),
            this.loadLeistungsexportPreufResult()
        ])
            .pipe(
                map(([dataStaaten, leistungsexport]) => {
                    this.countriesList = dataStaaten;
                    this.lastUpdate = leistungsexport ? leistungsexport.data : null;
                })
            )
            .subscribe(
                () => {
                    if (this.lastUpdate) {
                        this.facade.authenticationService.setOwnerPermissionContext(this.lastUpdate.stesID, this.lastUpdate.ownerId);
                        this.leistungsexportForm.reset(this.leFormHandler.mapToForm(this.lastUpdate));
                        this.setUeberschrift();
                        this.setInfoIconData();
                    }
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                }
            );
    }

    validateCountry(countries, form) {
        const result = countries.filter(value => value.codeId === form.value.zielstaatId);

        if (result.length === 0) {
            form.controls.zielstaatId.setValue(null);
        }
    }

    loadLeistungsexport(): Observable<any> {
        return of(null);
    }

    loadLeistungsexportPreufResult(): Observable<any> {
        return of(null);
    }

    setInfoIconData() {}

    setUeberschrift(): void {}

    deactivateSpinnerAndScrollTop() {
        this.facade.spinnerService.deactivate(this.leistungsexportChannel);
        OrColumnLayoutUtils.scrollTop();
    }

    ngOnDestroy() {
        document.removeEventListener('mouseup', this.valueOnFocusOut);
        this.facade.authenticationService.removeOwnerPermissionContext();
        super.ngOnDestroy();
    }
}
