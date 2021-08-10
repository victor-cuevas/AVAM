import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { FacadeService } from '@app/shared/services/facade.service';
import { Subject, forkJoin } from 'rxjs';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { AbrechnungswertSuchenParamDTO } from '@app/shared/models/dtos-generated/abrechnungswertSuchenParamDTO';
import { formatNumber } from '@angular/common';
import { AbrechnungswertListeViewDTO } from '@app/shared/models/dtos-generated/abrechnungswertListeViewDTO';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { TableType } from '@app/modules/amm/anbieter/components/anbieter-abrechnungswert-table/anbieter-abrechnungswert-table.component';
import { AbrechnungswertSuchenFormComponent } from '../../components/abrechnungswert-suchen-form/abrechnungswert-suchen-form.component';
import { Router } from '@angular/router';
import { AbrechnungswertService, NAVIGATION } from '../../services/abrechnungswert.service';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { AmmAlleKeinerCodeEnum } from '@app/shared/enums/domain-code/amm-alle-keiner-code.enum';
import { ReloadHelper } from '@app/shared/helpers/reload.helper';

@Component({
    selector: 'avam-abrechnungswert-suchen',
    templateUrl: './abrechnungswert-suchen.component.html',
    styleUrls: ['./abrechnungswert-suchen.component.scss']
})
export class AbrechnungswertSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    static CHANNEL = 'abrechnungswert-search-channel';
    static TABLE_CHANNEL = 'abrechnungswertSearch';

    @ViewChild('searchForm') searchForm: AbrechnungswertSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    dataSource = [];
    selectedRows = [];
    selectedAnbieters = {};
    lastUpdate: AbrechnungswertListeViewDTO[] = [];
    abrechnungswertData;
    checkboxForm: FormGroup;
    rowCheckboxes: FormArray;

    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    tableType = TableType;
    disableErfassen = true;
    manualDeselect = false;

    get channel() {
        return AbrechnungswertSuchenComponent.CHANNEL;
    }

    get tableChannel() {
        return AbrechnungswertSuchenComponent.TABLE_CHANNEL;
    }

    constructor(
        private facade: FacadeService,
        private anbieterRestService: AnbieterRestService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private fehlermeldungenService: FehlermeldungenService,
        private formBuilder: FormBuilder,
        private searchSession: SearchSessionStorageService,
        private abrechnungswertService: AbrechnungswertService,
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
                if (!this.manualDeselect && !this.dataSource[index].abrechnungsNr && control.value !== value) {
                    control.setValue(value);
                }
            });
            this.manualDeselect = false;
        });
        this.getData();
        this.infopanelService.dispatchInformation({
            title: 'amm.abrechnungen.label.abrechnungswerte',
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
            this.anbieterRestService.getAbrechnungswertSuchenParam(),
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS),
            this.stesDataRestService.getFixedCode(DomainEnum.AMM_ABRECHNUNGSWERTE)
        ).subscribe(
            ([abrechnungswertResp, nurAktuelleOptions, abrechnungswerteOptions]) => {
                const state = this.searchSession.restoreStateByKey(this.channel);

                if (abrechnungswertResp.data) {
                    this.abrechnungswertData = {
                        nurAktuelleOptions,
                        abrechnungswerteOptions,
                        abrechnungswertParam: abrechnungswertResp.data
                    };
                    this.buttons.next(abrechnungswertResp.data.enabledActions);
                }

                if (state) {
                    this.abrechnungswertData.state = state.fields;
                    this.searchRestCall(state.fields);
                } else {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            },
            error => {
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
            this.dataSource = [...this.lastUpdate].map(el => this.createAbrechnungswertRow(el));
        });
    }

    reset() {
        this.searchForm.reset();
        this.facade.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.removeCheckboxControls();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(this.channel);
        this.searchSession.restoreDefaultValues(this.tableChannel);
    }

    searchCriteriaExists(): boolean {
        const controls = this.searchForm.formGroup.controls;
        for (const field in controls) {
            if (field === 'sucheAlleAbrechnungswerte' && controls[field].value !== AmmAlleKeinerCodeEnum.ALLE) {
                return true;
            } else if (field !== 'sucheAlleAbrechnungswerte' && field !== 'sucheNurAktuelleAbrechnungswerte' && controls[field].value) {
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
            this.searchSession.resetSelectedTableRow(this.tableChannel);
            this.searchRestCall(this.searchForm.mapToDTO());
            this.searchSession.storeFieldsByKey(this.channel, this.searchForm.mapFields());
        }
    }

    searchRestCall(searchParam: AbrechnungswertSuchenParamDTO) {
        this.facade.spinnerService.activate(this.channel);
        this.anbieterRestService.searchAbrechnungswerte(searchParam).subscribe(
            response => {
                if (response.data && response.data.list) {
                    this.lastUpdate = response.data.list;
                    this.removeCheckboxControls();
                    this.dataSource = [...response.data.list].map(el => this.createAbrechnungswertRow(el));
                }

                this.infopanelService.updateInformation({ tableCount: this.dataSource ? this.dataSource.length : 0 });

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    createAbrechnung(abrechnungswertId?: number) {
        let abrechnungswerteIds;
        if (abrechnungswertId) {
            abrechnungswerteIds = [abrechnungswertId];
        } else if (this.checkboxForm.controls.headerCheckbox.value) {
            abrechnungswerteIds = this.dataSource.map(el => el.abrechnungswertId);
        } else {
            abrechnungswerteIds = this.rowCheckboxes.controls.reduce((arr, cb, i) => (cb.value && arr.push(this.dataSource[i].abrechnungswertId), arr), []);
        }

        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.validateAbrechnungswerte(abrechnungswerteIds).subscribe(
            response => {
                if (!response.warning) {
                    const anbieterId = this.getAnbieterByAbrechnungswertId(abrechnungswerteIds[0]);
                    this.abrechnungswertService.setAbrechnungswertIds(abrechnungswerteIds);
                    this.router.navigate([`amm/anbieter/${anbieterId}/abrechnungen/erfassen`]);
                }
                this.facade.spinnerService.deactivate(this.channel);
            },
            error => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    createAbrechnungswertRow(abrechnungswert: AbrechnungswertListeViewDTO) {
        this.rowCheckboxes.push(this.formBuilder.control(false));

        const sprachTitel = this.getSprachTitel(abrechnungswert);
        const status = {
            textDe: abrechnungswert.abrechnungStatusKurztextDe,
            textFr: abrechnungswert.abrechnungStatusKurztextFr,
            textIt: abrechnungswert.abrechnungStatusKurztextIt
        };

        return {
            abrechnungswertId: abrechnungswert.abrechnungswertId,
            abrechnungswertNr: abrechnungswert.abrechnungswertNr || '',
            saldochf: formatNumber(abrechnungswert.abrechnungswertSaldoALV, LocaleEnum.SWITZERLAND, '.2-2'),
            faelligAm: abrechnungswert.abrechnungswertFaelligkeitDatum,
            vorgaenger: abrechnungswert.vorgaengerAbrechnungswertNr || '',
            nachfolger: abrechnungswert.nachfolgerAbrechnungswertNr || '',
            titel: this.facade.dbTranslateService.translateWithOrder(sprachTitel, 'titel') || '',
            gueltigVon: abrechnungswert.vertragswertGueltigVon,
            gueltigBis: abrechnungswert.vertragswertGueltigBis,
            profilNr: abrechnungswert.vertragswertProfilNr || '',
            anbieter: abrechnungswert.massnahmeUnternehmenName1 || '',
            abrechnungsNr: abrechnungswert.abrechnungNr || '',
            status: this.facade.dbTranslateService.translate(status, 'text') || '',
            massnahmeAmmAnbieterId: abrechnungswert.massnahmeAmmAnbieterId
        };
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

    navigateToAbrechnungswert(item) {
        this.facade.spinnerService.activate(this.channel);
        this.anbieterRestService.getAbrechnungswertParam(item.abrechnungswertId).subscribe(
            responce => {
                if (responce.data) {
                    this.abrechnungswertService.navigatedFrom = NAVIGATION.SUCHEN;
                    this.router.navigate([`/amm/anbieter/${item.massnahmeAmmAnbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/grunddaten`], {
                        queryParams: {
                            lvId: responce.data.abrechnungswert.vertragswertObject.leistungsvereinbarungObject.leistungsvereinbarungId,
                            vertragswertId: responce.data.abrechnungswert.vertragswertObject.vertragswertId,
                            abrechnungswertId: responce.data.abrechnungswert.abrechnungswertId
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
        this.fehlermeldungenService.closeMessage();
        this.facade.toolboxService.sendConfiguration([]);
    }

    private getSprachTitel(abrechnungswert: AbrechnungswertListeViewDTO) {
        return {
            titelDe: abrechnungswert.durchfuehrungseinheitTitelDe || abrechnungswert.massnahmeTitelDe,
            titelFr: abrechnungswert.durchfuehrungseinheitTitelFr || abrechnungswert.massnahmeTitelFr,
            titelIt: abrechnungswert.durchfuehrungseinheitTitelIt || abrechnungswert.massnahmeTitelIt
        };
    }

    private getAnbieterByAbrechnungswertId(abrechnungswertId): number {
        const abrechnungswert = this.lastUpdate.find(el => el.abrechnungswertId === abrechnungswertId);

        return abrechnungswert ? abrechnungswert.massnahmeAmmAnbieterId : undefined;
    }

    private removeCheckboxControls() {
        this.checkboxForm.controls.rowCheckboxes = this.formBuilder.array([]);

        this.rowCheckboxes = this.checkboxForm.controls.rowCheckboxes as FormArray;
    }
}
