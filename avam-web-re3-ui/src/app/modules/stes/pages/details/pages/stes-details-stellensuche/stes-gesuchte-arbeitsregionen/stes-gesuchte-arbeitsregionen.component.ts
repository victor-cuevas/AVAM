import { RegionDTO } from '@dtos/regionDTO';
import { DbTranslateService } from './../../../../../../../shared/services/db-translate.service';
import { ArbeitsorteAutosuggestComponent } from './../../../../../../../shared/components/arbeitsorte-autosuggest/arbeitsorte-autosuggest.component';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FormGroup, Validators, FormBuilder, FormArray, FormGroupDirective } from '@angular/forms';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { MessageBus } from '@shared/services/message-bus';
import { SuchregionDTO } from '@shared/models/dtos-generated/suchregionDTO';
import { GrossregionDTO } from '@shared/models/dtos-generated/grossregionDTO';
import { OpenModalFensterService } from '@shared/services/open-modal-fenster.service';
import { Subscription } from 'rxjs';

enum Regions {
    Suchregion = 'Suchregion',
    Grossregion = 'Grossregion'
}
@Component({
    selector: 'app-stes-gesuchte-arbeitsregionen',
    templateUrl: './stes-gesuchte-arbeitsregionen.component.html',
    styleUrls: ['./stes-gesuchte-arbeitsregionen.component.scss']
})
export class StesGesuchteArbeitsregionenComponent implements OnInit, OnDestroy, OnChanges {
    @Input() parentForm: FormGroup;
    @Input() formGroupDirective: FormGroupDirective;
    @Input() data: any;
    @Input() validators: any[] = [];
    @Input() readonly = false;

    disabled: boolean;
    modalSubscription: Subscription;

    items: FormArray;
    index = 1;

    @ViewChildren('autosuggest') autosuggests: QueryList<ArbeitsorteAutosuggestComponent>;

    constructor(
        private readonly modalService: NgbModal,
        private formBuilder: FormBuilder,
        private dataService: StesDataRestService,
        private openModalFensterService: OpenModalFensterService,
        private dbTranslateSerivce: DbTranslateService,
        private readonly messageBus: MessageBus
    ) {}

    ngOnInit() {
        this.items = this.parentForm.controls.autosuggests as FormArray;
        if (this.items && this.items.validator) {
            this.validators.push(this.items.validator);
        }
        this.modalSubscription = this.openModalFensterService.getModalFensterClosed().subscribe(() => (this.disabled = false));
    }

    ngOnDestroy() {
        this.modalSubscription.unsubscribe();
    }

    get dynamicFormControls() {
        return this.parentForm.get('autosuggests') as FormArray;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue) {
            const arbeitsOrte = changes.data.currentValue;
            this.items = this.parentForm.controls.autosuggests as FormArray;
            if (arbeitsOrte.length === 0) {
                this.addItem(null);
            } else {
                this.determineRegions(arbeitsOrte);
            }
        }
    }

    open(content) {
        this.disabled = true;
        this.modalService.open(content, { ariaLabelledBy: 'regionen-basic-title', windowClass: 'modal-md', backdrop: 'static' });
    }

    determineRegions(lists) {
        lists.forEach(region => {
            this.addItem(region.suchregionObject || region.grossregionObject || region);
        });
        this.messageBus.buildAndSend('stes-details-stellensuche', 'got_arbeitsOrte');
    }

    addItem(item): void {
        this.items.push(this.createItem(item));
        this.handleArbeitsorteChange();
    }

    isGrossRegion(item: SuchregionDTO | GrossregionDTO | RegionDTO) {
        return !!(item as GrossregionDTO).grossregionId;
    }

    isSuchRegion(item: SuchregionDTO | GrossregionDTO | RegionDTO) {
        return !!(item as SuchregionDTO).suchregionId;
    }

    isRegion(item: RegionDTO) {
        return !!(item as RegionDTO).regionId;
    }

    createItem(item: SuchregionDTO | GrossregionDTO | RegionDTO): FormGroup {
        let autosuggest = null;
        if (item && this.isGrossRegion(item)) {
            autosuggest = {
                code: (item as GrossregionDTO).grossregionCode,
                kanton: '',
                merkmal: Regions.Grossregion,
                regionId: (item as GrossregionDTO).grossregionId,
                regionDe: (item as GrossregionDTO).textDe,
                regionFr: (item as GrossregionDTO).textFr,
                regionIt: (item as GrossregionDTO).textIt
            };
        } else if (item && this.isSuchRegion(item)) {
            autosuggest = {
                code: (item as SuchregionDTO).suchregionCode,
                kanton: (item as SuchregionDTO).kantonId,
                merkmal: Regions.Suchregion,
                regionId: (item as SuchregionDTO).suchregionId,
                regionDe: (item as SuchregionDTO).textDe,
                regionFr: (item as SuchregionDTO).textFr,
                regionIt: (item as SuchregionDTO).textIt
            };
        } else if (item && this.isRegion(item as RegionDTO)) {
            autosuggest = item;
        }

        return this.formBuilder.group({
            item: [autosuggest, this.validators]
        });
    }

    fillData(event) {
        this.items.get(event.id + '').setValue({ item: event.data });
        this.autosuggests.toArray()[event.id].writeValue(this.dbTranslateSerivce.translate(event.data, 'region'));
        this.parentForm.controls.autosuggests.markAsDirty();
        this.parentForm.controls.autosuggests.updateValueAndValidity({ emitEvent: true });
    }

    remove(indexToRemove: number) {
        this.items.removeAt(indexToRemove);
        this.handleArbeitsorteChange();
    }

    selectedItem(event: any) {
        this.handleArbeitsorteChange();
    }

    private handleArbeitsorteChange() {
        if (this.hasArbeistorteChanged()) {
            this.parentForm.controls.autosuggests.markAsDirty();
        } else {
            this.parentForm.controls.autosuggests.markAsPristine();
        }
        this.parentForm.controls.autosuggests.updateValueAndValidity({ emitEvent: true });
    }

    private hasArbeistorteChanged(): boolean {
        // Special case - DB returns 0 results, but in Stes Anmeldung we have one empty record, no confirmation should be shown on reset
        if (this.items.length === 1 && !this.isDataPresent()) {
            return false;
        }

        if (this.items.length !== this.data.length) {
            return true;
        }

        let orteChanged = false;

        this.items.value.forEach(currentOrt => {
            if (!this.data.some(dbOrt => this.compareOrt(currentOrt, dbOrt))) {
                orteChanged = true;
            }
        });

        return orteChanged;
    }

    private isDataPresent(): boolean {
        return Array.isArray(this.data) ? this.data.length > 0 : !!this.data;
    }

    // returns true if the orte are same
    private compareOrt(currentOrt, dbOrt) {
        if (!currentOrt.item) {
            return false;
        }

        return currentOrt.item.regionId === dbOrt.grossregionId || currentOrt.item.regionId === dbOrt.suchregionId || currentOrt.item.regionId === dbOrt.regionId;
    }
}
