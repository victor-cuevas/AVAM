import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { TeilzahlungswertListeViewDTO } from '@app/shared/models/dtos-generated/teilzahlungswertListeViewDTO';
import { TeilzahlungswerteTableType } from '../teilzahlung-form/anbieter-teilzahlungswerte-table/anbieter-teilzahlungswerte-table.component';
import { FormatSwissFrancPipe } from '@app/shared';
import { Subscription } from 'rxjs';

@Component({
    selector: 'avam-teilzahlungswerte-zuordnen-modal',
    templateUrl: './teilzahlungswerte-zuordnen-modal.component.html'
})
export class TeilzahlungswerteZuordnenModalComponent implements OnInit, OnDestroy {
    @Input() teilzahlungId: number;
    @Input() anbieterId: number;
    @Input() teilzahlungswerteIds: number[];
    @Output() teilzahlungswertZuordnenEmitter: EventEmitter<TeilzahlungswertListeViewDTO[]> = new EventEmitter();

    channel = 'teilzahlungswerte-zuordnen';
    alertChannel = AlertChannelEnum;
    previousChannel: string;
    formNumber = AmmFormNumberEnum.AMM_ANBIETER_TEILZAHLUNGSWERT_ZUORDNEN;
    teilzahlungswerteList: TeilzahlungswertListeViewDTO[];
    tableDataSource = [];
    formGroup: FormGroup;
    rowCheckboxes: FormArray;
    disableButton = true;
    toolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
    teilzahlungswerteTableType = TeilzahlungswerteTableType;
    toolboxSub: Subscription;
    headerCheckboxSub: Subscription;
    rowCheckboxesSub: Subscription;

    constructor(
        private facade: FacadeService,
        private anbieterRestService: AnbieterRestService,
        private formBuilder: FormBuilder,
        private formatSwissFrancPipe: FormatSwissFrancPipe
    ) {
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
        this.headerCheckboxSub = this.formGroup.controls.headerCheckbox.valueChanges.subscribe(value => {
            this.rowCheckboxes.controls.forEach(control => control.setValue(value));
        });

        this.rowCheckboxesSub = this.formGroup.controls.rowCheckboxes.valueChanges.subscribe(values => {
            this.disableButton = values.every(v => v === false);
        });

        this.subscribeToolbox();
        this.getData();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.searchTeilzahlungswert(this.teilzahlungId, this.anbieterId, this.teilzahlungswerteIds).subscribe(
            response => {
                if (response.data) {
                    this.teilzahlungswerteList = response.data;
                    this.tableDataSource = this.teilzahlungswerteList.map(el => this.createTeilzahlungswertRow(el));
                }

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => this.facade.spinnerService.deactivate(this.channel)
        );
    }

    createTeilzahlungswertRow(teilzahlungswert: TeilzahlungswertListeViewDTO) {
        this.rowCheckboxes.push(this.formBuilder.control(false));

        const sprachTitel = {
            titelDe: teilzahlungswert.durchfuehrungsTitelDe || teilzahlungswert.massnahmeTitelDe,
            titelFr: teilzahlungswert.durchfuehrungsTitelFr || teilzahlungswert.massnahmeTitelFr,
            titelIt: teilzahlungswert.durchfuehrungsTitelIt || teilzahlungswert.massnahmeTitelIt
        };

        return {
            teilzahlungswertId: teilzahlungswert.teilzahlungswertId,
            teilzahlungswertNr: teilzahlungswert.teilzahlungswertNr || '',
            chf: this.formatSwissFrancPipe.transform(teilzahlungswert.teilzahlungswertBetrag),
            faelligAm: teilzahlungswert.teilzahlungswertFaelligkeitDatum,
            titel: this.facade.dbTranslateService.translateWithOrder(sprachTitel, 'titel') || '',
            gueltigVon: teilzahlungswert.vertragswertGueltigVon,
            gueltigBis: teilzahlungswert.vertragswertGueltigBis,
            profilNr: teilzahlungswert.vertragswertProfilNr || '',
            teilzahlungswertLoeschbar: teilzahlungswert.teilzahlungswertLoeschbar
        };
    }

    subscribeToolbox() {
        this.toolboxSub = this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    teilzahlungswertZuordnen(teilzahlungswertId?) {
        if (teilzahlungswertId) {
            const teilzahlungswert = this.teilzahlungswerteList.find(el => el.teilzahlungswertId === teilzahlungswertId);
            this.teilzahlungswertZuordnenEmitter.emit([teilzahlungswert]);
        } else if (this.formGroup.controls.headerCheckbox.value) {
            this.teilzahlungswertZuordnenEmitter.emit(this.teilzahlungswerteList);
        } else {
            const teilzahlungswerteZuordnen = this.rowCheckboxes.controls.reduce((arr, cb, i) => (cb.value && arr.push(this.teilzahlungswerteList[i]), arr), []);
            this.teilzahlungswertZuordnenEmitter.emit(teilzahlungswerteZuordnen);
        }

        this.close();
    }

    close() {
        this.facade.openModalFensterService.dismissAll();
    }

    ngOnDestroy() {
        this.toolboxSub.unsubscribe();
        this.headerCheckboxSub.unsubscribe();
        this.rowCheckboxesSub.unsubscribe();
        SpinnerService.CHANNEL = this.previousChannel;
        ToolboxService.CHANNEL = this.previousChannel;
    }
}
