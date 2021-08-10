import { Component, ViewChild, AfterViewInit, ElementRef, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription, forkJoin } from 'rxjs';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { ActivatedRoute } from '@angular/router';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { ReservationDTO } from '@app/shared/models/dtos-generated/reservationDTO';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { BewMassnahmeReserviertePlaetzeTableComponent } from '../../components';
import { PlnwerteTableData, PlnwerteTableDataRow } from '../../components/bew-massnahme-reservierte-plaetze-table/bew-massnahme-reservierte-plaetze-handler.service';
import * as uuid from 'uuid';
import { FormGroup } from '@angular/forms';
import { FacadeService } from '@app/shared/services/facade.service';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Component({
    selector: 'avam-bew-massnahme-reservierte-plaetze',
    templateUrl: './bew-massnahme-reservierte-plaetze.component.html'
})
export class BewMassnahmeReserviertePlaetzeComponent extends Unsubscribable implements AfterViewInit, OnDestroy, OnInit, DeactivationGuarded {
    @ViewChild('reserviertePlaetzeTable') reserviertePlaetzeTable: BewMassnahmeReserviertePlaetzeTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'massnahme-dfe-reservationen';

    dfeId: number;
    massnahmeId: number;
    massnahme: MassnahmeDTO;
    unternehmen: UnternehmenDTO;
    reservations: any;
    kuerzelMassnahmentyp: string;
    zulassungstyp: string;
    unternehmensname: string;
    tableData: PlnwerteTableData;
    institutionOptions: any[] = [];
    kantonOptions: any[] = [];
    reservrationenArray: Array<ReservationDTO> = [];
    toolboxSubscription: Subscription;
    permissions: typeof Permissions = Permissions;
    langSubscription: Subscription;
    zurKursplanungAktiviert: boolean;
    unternehmenStatus: string;
    burNr: string | number;

    lastUpdate: Array<ReservationDTO>;

    constructor(
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private route: ActivatedRoute,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private dataService: StesDataRestService,
        private resetDialogService: ResetDialogService,
        private ammHelper: AmmHelper
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteParams();
    }

    ngAfterViewInit(): void {
        this.infopanelService.appendToInforbar(this.infobarTemplate);
        this.configureToolbox();
        this.setSubscriptions();
        this.getData();
    }

    ngOnDestroy(): void {
        this.toolboxSubscription.unsubscribe();
        super.ngOnDestroy();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.sendLastUpdate({}, true);
        this.langSubscription.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
    }

    setSubscriptions() {
        this.toolboxSubscription = this.subscribeToToolbox();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.updateInfopanel();
        });
    }

    getRouteParams() {
        const routeparamMap = this.route.snapshot.queryParamMap;
        this.massnahmeId = Number(routeparamMap.get('massnahmeId'));
        this.dfeId = Number(routeparamMap.get('dfeId'));
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin(
            this.bewirtschaftungRestService.getReservationen(this.dfeId, this.massnahmeId),
            this.bewirtschaftungRestService.getMassnahme(this.massnahmeId),
            this.bewirtschaftungRestService.getDfeSession(this.dfeId),
            this.dataService.getCode(DomainEnum.INSTITUTION),
            this.bewirtschaftungRestService.getAllKantoneForBudgetierung()
        ).subscribe(
            ([reservationenResponse, massnahme, dfe, institutionOptionsResponse, kantonOptionsResponse]) => {
                this.institutionOptions = institutionOptionsResponse;
                this.kantonOptions = kantonOptionsResponse.data;

                if (reservationenResponse) {
                    this.reservations = reservationenResponse.data;
                    this.lastUpdate = reservationenResponse.data;
                    this.populateTableData(this.reservations);
                }

                if (massnahme) {
                    this.massnahme = massnahme.data;
                    this.updateInfopanel();
                }
                if (dfe && dfe.data) {
                    this.zurKursplanungAktiviert = dfe.data.inPlanungAkquisitionSichtbar;
                }

                this.deactivateSpinnerAndScrollToTop();
            },
            () => {
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    populateTableData(response: Array<ReservationDTO>) {
        const beData = response;
        if (beData) {
            this.tableData = {
                plnwerte: this.createTableDate(beData),
                kantoneOptions: this.kantonOptions,
                institutionOptions: this.institutionOptions
            };
        }
    }

    createTableDate(data: ReservationDTO[]): PlnwerteTableDataRow[] {
        const rows: PlnwerteTableDataRow[] = [];
        if (data.length > 0) {
            data.forEach(element => {
                rows.push({
                    tableId: uuid.v4(),
                    id: element.reservationId,
                    institution: element.institutionObject,
                    kanton: element.kantonObject,
                    verfall: element.verfallXTageVorBeginn,
                    teilnehmer: element.anzahlTeilnehmer,
                    status: element.aktiv ? 'common.label.aktiv' : 'common.label.inaktiv',
                    statusValue: element.aktiv,
                    newEntry: false
                });
            });
        } else {
            rows.push(this.reserviertePlaetzeTable.handler.getRowDefaultValues());
        }
        return rows;
    }

    deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    reset() {
        if (this.canDeactivate()) {
            this.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.populateTableData(this.lastUpdate);
                this.reserviertePlaetzeTable.isNewLineAdded = false;
            });
        }
    }

    zurKursplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.dfeId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.reserviertePlaetzeTable.formGroup.invalid) {
            this.reserviertePlaetzeTable.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.facade.spinnerService.activate(this.channel);
        this.reservrationenArray = this.mapDataToSave();
        this.bewirtschaftungRestService.saveReservationen(this.reservrationenArray, this.dfeId, this.massnahmeId).subscribe(
            res => {
                if (res.data) {
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.reserviertePlaetzeTable.isNewLineAdded = false;
                    this.lastUpdate = res.data;
                    this.populateTableData(res.data);

                    this.infopanelService.sendLastUpdate(this.lastUpdate[0]);
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            () => {
                this.facade.notificationService.error(this.facade.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.deactivateSpinnerAndScrollToTop();
            }
        );
    }

    mapDataToSave() {
        const rowsFormGroups = this.reserviertePlaetzeTable.formArray.controls;
        const reservationenToSave: Array<ReservationDTO> = [];
        let reservationDTO: ReservationDTO;
        rowsFormGroups.forEach((row: FormGroup) => {
            reservationDTO = {
                institutionObject: this.institutionOptions.find(element => element.codeId === +row.controls.institution.value),
                kantonObject: this.kantonOptions.find(element => element.kantonsKuerzel === row.controls.kanton.value),
                verfallXTageVorBeginn: row.controls.verfall.value,
                anzahlTeilnehmer: row.controls.teilnehmer.value,
                aktiv: row.controls.statusValue.value
            };
            reservationenToSave.push(reservationDTO);
        });
        return reservationenToSave;
    }

    canDeactivate() {
        return this.reserviertePlaetzeTable.formGroup.dirty || this.reserviertePlaetzeTable.isNewLineAdded;
    }

    private updateInfopanel() {
        if (this.massnahme) {
            this.kuerzelMassnahmentyp = this.getKuerzelMassnahmentyp(this.massnahme);
            const reserviertePlaetzeLabel = this.facade.translateService.instant('amm.massnahmen.label.kurs');
            const titelLabel = this.facade.dbTranslateService.translateWithOrder(this.massnahme, 'titel');
            this.zulassungstyp = this.facade.dbTranslateService.translate(this.massnahme.zulassungstypObject, 'text');
            this.unternehmenStatus = this.facade.dbTranslateService.translate(this.massnahme.durchfuehrungsortObject.unternehmenObject.statusObject, 'text');
            this.unternehmensname = this.setUnternehmensname(this.massnahme);
            this.burNr = this.getBurnummerInfo(this.massnahme.durchfuehrungsortObject.unternehmenObject);
            this.unternehmen = this.massnahme.durchfuehrungsortObject.unternehmenObject;
            this.infopanelService.dispatchInformation({
                title: `${reserviertePlaetzeLabel} ${titelLabel}`,
                subtitle: this.facade.translateService.instant('amm.massnahmen.label.reservierteplaetze')
            });
        }
        if (this.reservations) {
            this.infopanelService.sendLastUpdate(this.reservations[0]);
        }
    }

    private setUnternehmensname(massnahme: MassnahmeDTO): string {
        return `${massnahme.ammAnbieterObject.unternehmen.name1}${massnahme.ammAnbieterObject.unternehmen.name2 ? ' ' + massnahme.ammAnbieterObject.unternehmen.name2 : ''}${
            massnahme.ammAnbieterObject.unternehmen.name3 ? ' ' + massnahme.ammAnbieterObject.unternehmen.name3 : ''
        }`;
    }

    private getKuerzelMassnahmentyp(massnahmeDto: MassnahmeDTO): string {
        const kuerzel = massnahmeDto && massnahmeDto.produktObject.elementkategorieAmtObject ? massnahmeDto.produktObject.elementkategorieAmtObject.organisation : '';
        const massnahmentyp =
            massnahmeDto && massnahmeDto.produktObject.strukturelementGesetzObject
                ? this.facade.dbTranslateService.translate(massnahmeDto.produktObject.strukturelementGesetzObject, 'elementName')
                : '';

        return kuerzel && massnahmentyp ? `${kuerzel} - ${massnahmentyp}` : kuerzel ? kuerzel : massnahmentyp ? massnahmentyp : '';
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmDfe(this.dfeId), true);
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    private getBurnummerInfo(unternehmen: UnternehmenDTO): string | number {
        if (unternehmen.provBurNr) {
            return `${unternehmen.provBurNr} (${this.facade.translateService.instant('unternehmen.label.provisorisch')})`;
        } else {
            return unternehmen.burNummer;
        }
    }
}
