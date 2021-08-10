import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Unsubscribable } from 'oblique-reactive';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxService } from '@app/shared';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { ColumnInterface } from '@app/library/wrappers/form/avam-components-table/avam-components-table.interface';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ActivatedRoute } from '@angular/router';
import { BetriebsabteilungService } from '@modules/arbeitgeber/services/betriebsabteilung.service';
import { forkJoin } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { BetriebsabteilungDTO } from '@dtos/betriebsabteilungDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BaseResponseWrapperListBetriebsabteilungDTOWarningMessages } from '@dtos/baseResponseWrapperListBetriebsabteilungDTOWarningMessages';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { BetriebsabteilungenTableComponent } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/betriebsabteilungen/betriebsabteilungen-table.component';

@Component({
    selector: 'avam-betriebsabteilungen',
    templateUrl: './betriebsabteilungen.component.html'
})
export class BetriebsabteilungenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('betriebsabteilungenTable') betriebsabteilungenTable: BetriebsabteilungenTableComponent;
    readonly betriebsabteilungenChannel = 'betriebsabteilungenChannel';
    columns: ColumnInterface[];
    betriebsabteilungenForm: FormGroup;
    printForm: FormGroup;
    data: BetriebsabteilungDTO[] = [];
    currentAbteilungen: BetriebsabteilungDTO[] = [];
    permissions: typeof Permissions = Permissions;
    alvAnerkanntOptions: DropdownOption[] = [];
    private static readonly UNTERNEHMEN_ID = 'unternehmenId';
    private static readonly YES_CODE = '1';
    private unternehmenId: number;

    constructor(
        private infopanelService: AmmInfopanelService,
        private facadeService: FacadeService,
        private route: ActivatedRoute,
        private betriebsAbteilungService: BetriebsabteilungService,
        private formBuilder: FormBuilder,
        private obliqueHelper: ObliqueHelperService
    ) {
        super();
    }

    public ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.infopanelService.updateInformation({ subtitle: 'kaeswe.label.betriebsabteilungen' });
        this.betriebsabteilungenForm = this.createGoup();
        this.printForm = this.createGoup();
        this.observeUnternehmenId();
        this.initToolbox();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.facadeService.fehlermeldungenService.closeMessage();
        this.resetHeader();
    }

    save() {
        this.facadeService.fehlermeldungenService.closeMessage();

        if (this.betriebsabteilungenForm.valid) {
            this.facadeService.spinnerService.activate(this.betriebsabteilungenChannel);
            this.betriebsAbteilungService.saveBetriebsabteilungen(this.unternehmenId, this.mapFormToDTO()).subscribe(
                response => {
                    if (response.data) {
                        this.facadeService.notificationService.success(this.facadeService.translateService.instant('common.message.datengespeichert'));
                        this.setData(response);
                        this.betriebsabteilungenForm.markAsPristine();
                    } else {
                        this.betriebsabteilungenTable.updateBetriebsabteilung(this.data);
                    }
                    this.facadeService.spinnerService.deactivate(this.betriebsabteilungenChannel);
                },
                () => {
                    this.facadeService.spinnerService.deactivate(this.betriebsabteilungenChannel);
                    this.betriebsabteilungenTable.updateBetriebsabteilung(this.data);
                }
            );
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.ngForm.onSubmit(undefined);
            this.betriebsabteilungenTable.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    /**
     * After saving the data, the state of the form is lost, therefore we have to get data from database to make a reset.
     */
    reset(): void {
        if (this.betriebsabteilungenForm.dirty) {
            this.facadeService.resetDialogService.reset(() => {
                this.reloadFormFromBackend();
            });
        } else {
            this.reloadFormFromBackend();
        }
    }

    private reloadFormFromBackend(): void {
        this.facadeService.spinnerService.activate(this.betriebsabteilungenChannel);
        this.facadeService.fehlermeldungenService.closeMessage();
        this.betriebsAbteilungService.getBetriebsAbteilungen(this.unternehmenId).subscribe((betriebsabteilungen: BaseResponseWrapperListBetriebsabteilungDTOWarningMessages) => {
            this.setData(betriebsabteilungen);
            this.betriebsabteilungenForm.markAsPristine();
            this.facadeService.spinnerService.deactivate(this.betriebsabteilungenChannel);
        }, this.errorCallback());
    }

    canDeactivate(): boolean {
        return this.betriebsabteilungenForm.dirty;
    }

    private errorCallback(): any {
        return () => {
            this.infopanelService.updateInformation({ tableCount: 0 });
            this.facadeService.spinnerService.deactivate(this.betriebsabteilungenChannel);
        };
    }

    private setData(betriebsabteilungen: BaseResponseWrapperListBetriebsabteilungDTOWarningMessages): void {
        if (betriebsabteilungen.data) {
            this.data = betriebsabteilungen.data;
            this.infopanelService.updateInformation({ tableCount: this.data.length });
        }
    }

    private mapFormToDTO(): BetriebsabteilungDTO[] {
        const betriebsabteilungen: BetriebsabteilungDTO[] = [];
        const rowsFormGroups = (this.betriebsabteilungenForm.controls.betriebsabteilungen as FormArray).controls;
        rowsFormGroups.forEach((row: FormGroup) => {
            const betriebsabteilung = this.getBetriebsabteilungById(row.controls.betriebsabteilungId.value);
            betriebsabteilung.unternehmenId = this.unternehmenId;
            betriebsabteilung.abteilungName = row.controls.abteilungName.value;
            betriebsabteilung.abteilungNr = row.controls.abteilungNr.value;
            betriebsabteilung.alvAnerkannt = row.controls.alvAnerkannt.value && row.controls.alvAnerkannt.value === BetriebsabteilungenComponent.YES_CODE;
            betriebsabteilungen.push(betriebsabteilung);
        });

        return betriebsabteilungen;
    }

    private getBetriebsabteilungById(id: number): BetriebsabteilungDTO {
        const betriebsabteilung = this.data.find((b: any) => b.betriebsabteilungId === id);
        return betriebsabteilung ? betriebsabteilung : ({} as BetriebsabteilungDTO);
    }

    private getData(): void {
        this.facadeService.spinnerService.activate(this.betriebsabteilungenChannel);
        forkJoin<CodeDTO[], BaseResponseWrapperListBetriebsabteilungDTOWarningMessages>(
            this.betriebsAbteilungService.dataService.getFixedCode(DomainEnum.YES_NO_OPTIONS),
            this.betriebsAbteilungService.getBetriebsAbteilungen(this.unternehmenId)
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([yesNoOptions, betriebsabteilungen]) => {
                this.alvAnerkanntOptions = this.facadeService.formUtilsService.mapDropdownKurztext(yesNoOptions);

                this.setData(betriebsabteilungen);
                this.facadeService.spinnerService.deactivate(this.betriebsabteilungenChannel);
            }, this.errorCallback());
    }

    private observeUnternehmenId(): void {
        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params[BetriebsabteilungenComponent.UNTERNEHMEN_ID];
            this.facadeService.toolboxService.sendConfiguration(
                ToolboxConfig.getBetriebsabteilungenConfig(),
                this.betriebsabteilungenChannel,
                ToolboxDataHelper.createByUnternehmenId(this.unternehmenId)
            );
            this.getData();
        });
    }

    private initToolbox() {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => {
                this.currentAbteilungen = this.betriebsabteilungenTable.getCurrentBetriebsabteilungen(this.betriebsabteilungenForm);
                this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.currentAbteilungen);
            });
    }

    private resetHeader(): void {
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.facadeService.toolboxService.resetConfiguration();
    }

    private createGoup(): FormGroup {
        return this.formBuilder.group({});
    }
}
