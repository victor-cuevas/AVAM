import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { takeUntil } from 'rxjs/internal/operators';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { AbrechnungswertListeViewDTO } from '@app/shared/models/dtos-generated/abrechnungswertListeViewDTO';
import { formatNumber } from '@angular/common';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { TableType } from '@app/modules/amm/anbieter/components/anbieter-abrechnungswert-table/anbieter-abrechnungswert-table.component';

@Component({
    selector: 'avam-abrechnungswerte-zuordnen-modal',
    templateUrl: './abrechnungswerte-zuordnen-modal.component.html',
    styleUrls: ['./abrechnungswerte-zuordnen-modal.component.scss']
})
export class AbrechnungswerteZuordnenModalComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() abrechnungId: number;
    @Input() abrechnungswerte: AbrechnungswertListeViewDTO[];
    @Output() onAssignAbrechnungswerte: EventEmitter<AbrechnungswertListeViewDTO[]> = new EventEmitter();
    channel = 'abrechnungswerte-zuordnen';
    alertChannel = AlertChannelEnum;
    previousChannel: string;
    formNumber = AmmFormNumberEnum.AMM_ANBIETER_ABRECHNUNGSWERT_ZUORDNEN;
    abrechnungswertList: AbrechnungswertListeViewDTO[];
    dataSource = [];
    formGroup: FormGroup;
    rowCheckboxes: FormArray;
    disableButton = true;

    tableType = TableType;
    toolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];

    constructor(private facade: FacadeService, private anbieterRestService: AnbieterRestService, private formBuilder: FormBuilder) {
        super();
        this.previousChannel = ToolboxService.CHANNEL;
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            headerCheckbox: false,
            rowCheckboxes: this.formBuilder.array([])
        });
        this.rowCheckboxes = this.formGroup.controls.rowCheckboxes as FormArray;
        this.formGroup.controls.headerCheckbox.valueChanges.subscribe(value => {
            this.rowCheckboxes.controls.forEach(control => control.setValue(value));
        });
        this.formGroup.controls.rowCheckboxes.valueChanges.subscribe(values => {
            this.disableButton = values.every(v => v === false);
        });
        this.subscribeToolbox();
        this.getData();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.abrechnungswertSearch(this.abrechnungId, AlertChannelEnum.MODAL).subscribe(
            response => {
                if (response.data) {
                    this.abrechnungswertList = this.filterAbrechnungswerte(response.data);
                    this.dataSource = this.abrechnungswertList.map(el => this.createAbrechnungswertRow(el));
                }
                this.facade.spinnerService.deactivate(this.channel);
            },
            error => this.facade.spinnerService.deactivate(this.channel)
        );
    }

    filterAbrechnungswerte(fetchedAbrechnungswerte: AbrechnungswertListeViewDTO[]): AbrechnungswertListeViewDTO[] {
        const abrechnungswerteIds = this.abrechnungswerte.map(el => el.abrechnungswertId);
        const toDelete = new Set(abrechnungswerteIds);
        return fetchedAbrechnungswerte.filter(obj => !toDelete.has(obj.abrechnungswertId));
    }

    createAbrechnungswertRow(abrechnungswert: AbrechnungswertListeViewDTO) {
        this.rowCheckboxes.push(this.formBuilder.control(false));

        const sprachTitel = {
            titelDe: abrechnungswert.durchfuehrungseinheitTitelDe || abrechnungswert.massnahmeTitelDe,
            titelFr: abrechnungswert.durchfuehrungseinheitTitelFr || abrechnungswert.massnahmeTitelFr,
            titelIt: abrechnungswert.durchfuehrungseinheitTitelIt || abrechnungswert.massnahmeTitelIt
        };
        return {
            abrechnungswertId: abrechnungswert.abrechnungswertId,
            abrechnungswertNr: abrechnungswert.abrechnungswertNr || '',
            saldochf: formatNumber(abrechnungswert.abrechnungswertSaldoALV, LocaleEnum.SWITZERLAND, '.2-2'),
            faelligAm: abrechnungswert.abrechnungswertFaelligkeitDatum,
            titel: this.facade.dbTranslateService.translateWithOrder(sprachTitel, 'titel') || '',
            gueltigVon: abrechnungswert.vertragswertGueltigVon,
            gueltigBis: abrechnungswert.vertragswertGueltigBis,
            profilNr: abrechnungswert.vertragswertProfilNr || '',
            abrechnungswertLoeschbar: abrechnungswert.abrechnungswertLoeschbar
        };
    }

    subscribeToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
            });
    }

    close() {
        this.facade.openModalFensterService.dismissAll();
    }

    assignAbrechnungswerte(item?) {
        if (item) {
            const abrechnungswert = this.abrechnungswertList.find(el => el.abrechnungswertId === item.abrechnungswertId);
            this.onAssignAbrechnungswerte.emit([abrechnungswert]);
        } else if (this.formGroup.controls.headerCheckbox.value) {
            this.onAssignAbrechnungswerte.emit(this.abrechnungswertList);
        } else {
            const abrechnungswerteToAssign = this.rowCheckboxes.controls.reduce((arr, cb, i) => (cb.value && arr.push(this.abrechnungswertList[i]), arr), []);
            this.onAssignAbrechnungswerte.emit(abrechnungswerteToAssign);
        }

        this.close();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        SpinnerService.CHANNEL = this.previousChannel;
        ToolboxService.CHANNEL = this.previousChannel;
    }
}
