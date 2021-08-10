import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { TeilzahlungswertListeViewDTO } from '@app/shared/models/dtos-generated/teilzahlungswertListeViewDTO';
import { ZahlungenSuchenParameterDTO } from '@app/shared/models/dtos-generated/zahlungenSuchenParameterDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TeilzahlungswertSuchenFormComponent } from '../../components/teilzahlungswert-suchen-form/teilzahlungswert-suchen-form.component';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { formatNumber } from '@angular/common';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { TeilzahlungswerteTableType } from '../../components/teilzahlung-form/anbieter-teilzahlungswerte-table/anbieter-teilzahlungswerte-table.component';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';
import { Router } from '@angular/router';
import { TeilzahlungswertService } from '@app/shared/services/teilzahlungswert.service';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';

@Component({
    selector: 'avam-teilzahlungswert-suchen',
    templateUrl: './teilzahlungswert-suchen.component.html',
    styleUrls: ['./teilzahlungswert-suchen.component.scss']
})
export class TeilzahlungswertSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    static CHANNEL = 'teilzahlungswert-search-channel';

    @ViewChild('searchForm') searchForm: TeilzahlungswertSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    dataSource = [];
    selectedRows = [];
    selectedAnbieters = {};
    lastUpdate: TeilzahlungswertListeViewDTO[] = [];
    teilzahlungswertData;
    checkboxForm: FormGroup;
    rowCheckboxes: FormArray;

    tableType = TeilzahlungswerteTableType;
    disableErfassen = true;
    manualDeselect = false;
    tableStateKey = 'teilzahlungswertSuchen';

    get channel() {
        return TeilzahlungswertSuchenComponent.CHANNEL;
    }

    constructor(
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private anbieterRestService: AnbieterRestService,
        private searchSession: SearchSessionStorageService,
        private formBuilder: FormBuilder,
        private teilzahlungswertService: TeilzahlungswertService,
        private vertraegeRestService: VertraegeRestService,
        private router: Router
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.checkboxForm = this.formBuilder.group({
            headerCheckbox: false,
            rowCheckboxes: this.formBuilder.array([])
        });
        this.rowCheckboxes = this.checkboxForm.controls.rowCheckboxes as FormArray;
        this.checkboxForm.controls.headerCheckbox.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            this.rowCheckboxes.controls.forEach((control, index) => {
                if (!this.manualDeselect && !this.dataSource[index].teilzahlungsNr && control.value !== value) {
                    control.setValue(value);
                }
            });
            this.manualDeselect = false;
        });
        this.getData();
        this.infopanelService.dispatchInformation({
            title: 'amm.zahlungen.label.teilzahlungswerte',
            tableCount: undefined,
            hideInfobar: true
        });
        this.configureToolbox();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin(
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS),
            this.stesDataRestService.getFixedCode(DomainEnum.AMM_TEILZAHLUNGSWERTE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VIERAUGENSTATUS)
        ).subscribe(
            ([nurAktuelleOptions, teilzahlungswerteOptions, statusOptions]) => {
                const state = this.searchSession.restoreStateByKey(this.channel);

                this.teilzahlungswertData = {
                    nurAktuelleOptions,
                    teilzahlungswerteOptions,
                    statusOptions
                };

                if (state) {
                    this.teilzahlungswertData.state = state.fields;
                    this.searchRestCall(state.fields);
                } else {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
                }
            });
    }

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.facade.fehlermeldungenService.closeMessage();
            this.dataSource = [...this.lastUpdate].map(el => this.createTeilzahlungswertRow(el));
        });
    }

    searchCriteriaExists(): boolean {
        const controls = this.searchForm.formGroup.controls;
        for (const field in controls) {
            if (field !== 'sucheAlleTeilzahlungswerte' && field !== 'sucheNurAktuelleTeilzahlungswerte' && controls[field].value) {
                return true;
            }
        }
        return false;
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.searchForm.formGroup.valid) {
            this.searchForm.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }

        if (!this.searchCriteriaExists()) {
            this.facade.openModalFensterService.openInfoModal('common.message.suchkriteriumeingeben');
        } else {
            this.searchSession.storeFieldsByKey(this.channel, this.searchForm.mapFields());
            this.searchRestCall(this.searchForm.mapToDTO());
            this.searchSession.resetSelectedTableRow(this.tableStateKey);
        }
    }

    searchRestCall(searchParam: ZahlungenSuchenParameterDTO) {
        this.facade.spinnerService.activate(this.channel);
        this.anbieterRestService.searchTeilzahlungswerte(searchParam).subscribe(
            response => {
                if (response.data) {
                    this.lastUpdate = response.data;
                    this.removeCheckboxControls();
                    this.dataSource = [...response.data].map(el => this.createTeilzahlungswertRow(el));
                    this.searchForm.formGroup.markAsDirty();
                }

                this.infopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    createTeilzahlungswertRow(teilzahlungswert: TeilzahlungswertListeViewDTO) {
        this.rowCheckboxes.push(this.formBuilder.control(false));

        const sprachTitel = this.getSprachTitel(teilzahlungswert);
        const status = {
            textDe: teilzahlungswert.teilzahlungStatusKurztextDe,
            textFr: teilzahlungswert.teilzahlungStatusKurztextFr,
            textIt: teilzahlungswert.teilzahlungStatusKurztextIt
        };

        return {
            vertragswertId: teilzahlungswert.vertragswertId,
            unternehmenId: teilzahlungswert.massnahmeAmmAnbieterId,
            teilzahlungswertId: teilzahlungswert.teilzahlungswertId,
            teilzahlungswertNr: teilzahlungswert.teilzahlungswertNr || '',
            chf: formatNumber(teilzahlungswert.teilzahlungswertBetrag, LocaleEnum.SWITZERLAND, '.2-2'),
            faelligAm: teilzahlungswert.teilzahlungswertFaelligkeitDatum,
            vorgaenger: teilzahlungswert.vorgaengerTeilzahlungswertNr || '',
            nachfolger: teilzahlungswert.nachfolgerTeilzahlungswertNr || '',
            titel: this.facade.dbTranslateService.translateWithOrder(sprachTitel, 'titel') || '',
            gueltigVon: teilzahlungswert.vertragswertGueltigVon,
            gueltigBis: teilzahlungswert.vertragswertGueltigBis,
            profilNr: teilzahlungswert.vertragswertProfilNr || '',
            anbieter: teilzahlungswert.massnahmeUnternehmenName1 || '',
            teilzahlungNr: teilzahlungswert.teilzahlungNr || '',
            status: this.facade.dbTranslateService.translate(status, 'text') || '',
            massnahmeAmmAnbieterId: teilzahlungswert.massnahmeAmmAnbieterId
        };
    }

    reset() {
        this.searchForm.reset();
        this.facade.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.removeCheckboxControls();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(this.channel);
        this.searchSession.restoreDefaultValues(this.tableStateKey);
    }

    createTeilzahlung(teilzahlungswertId?: number) {
        let teilzahlungswerteIds;
        if (teilzahlungswertId) {
            teilzahlungswerteIds = [teilzahlungswertId];
        } else if (this.checkboxForm.controls.headerCheckbox.value) {
            teilzahlungswerteIds = this.dataSource.map(el => el.teilzahlungswertId);
        } else {
            teilzahlungswerteIds = this.rowCheckboxes.controls.reduce((arr, cb, i) => (cb.value && arr.push(this.dataSource[i].teilzahlungswertId), arr), []);
        }

        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.validateTeilzahlungswerte(teilzahlungswerteIds).subscribe(
            response => {
                if (!response.warning) {
                    const anbieterId = this.getAnbieterByTeilzahlungswertId(teilzahlungswerteIds[0]);
                    this.teilzahlungswertService.setTeilzahlungswertIds(teilzahlungswerteIds);
                    this.router.navigate([`amm/anbieter/${anbieterId}/teilzahlungen/erfassen`]);
                }
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    onCheckboxChange(index: number) {
        const id = this.dataSource[index].massnahmeAmmAnbieterId;
        if (this.checkboxForm.controls.headerCheckbox.value && !this.rowCheckboxes.controls[index].value) {
            this.manualDeselect = true;
            this.checkboxForm.controls.headerCheckbox.setValue(false);
        }

        if (this.rowCheckboxes.controls[index].value) {
            this.selectedAnbieters[id] = this.selectedAnbieters[id] ? this.selectedAnbieters[id] + 1 : 1;
            this.selectedRows.push(index);
        } else {
            this.selectedAnbieters[id] = this.selectedAnbieters[id] ? this.selectedAnbieters[id] - 1 : 0;
            if (this.selectedAnbieters[id] <= 0) {
                delete this.selectedAnbieters[id];
            }
            const indexToRemove = this.selectedRows.indexOf(index);
            this.selectedRows.splice(indexToRemove, 1);
        }
        this.disableErfassen = this.selectedRows.length < 1 || Object.keys(this.selectedAnbieters).length > 1;
    }

    onItemSelected(item) {
        this.facade.spinnerService.activate(this.channel);
        this.vertraegeRestService.getTeilzahlungswert(item.teilzahlungswertId).subscribe(
            responce => {
                if (responce.data) {
                    this.router.navigate([`/amm/anbieter/${item.unternehmenId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/teilzahlungswert`], {
                        queryParams: {
                            lvId: responce.data.teilzahlungswert.vertragswertObject.leistungsvereinbarungObject.leistungsvereinbarungId,
                            vertragswertId: responce.data.teilzahlungswert.vertragswertObject.vertragswertId,
                            teilzahlungswertId: responce.data.teilzahlungswert.teilzahlungswertId
                        }
                    });
                }
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: undefined });
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.toolboxService.sendConfiguration([]);
    }

    private getAnbieterByTeilzahlungswertId(teilzahlungswertId): number {
        const teilzahlungswert = this.lastUpdate.find(el => el.teilzahlungswertId === teilzahlungswertId);

        return teilzahlungswert ? teilzahlungswert.massnahmeAmmAnbieterId : undefined;
    }

    private getSprachTitel(teilzahlungswert: TeilzahlungswertListeViewDTO) {
        return {
            titelDe: teilzahlungswert.durchfuehrungsTitelDe || teilzahlungswert.massnahmeTitelDe,
            titelFr: teilzahlungswert.durchfuehrungsTitelFr || teilzahlungswert.massnahmeTitelFr,
            titelIt: teilzahlungswert.durchfuehrungsTitelIt || teilzahlungswert.massnahmeTitelIt
        };
    }

    private removeCheckboxControls() {
        this.checkboxForm.controls.rowCheckboxes = this.formBuilder.array([]);

        this.rowCheckboxes = this.checkboxForm.controls.rowCheckboxes as FormArray;
    }
}
