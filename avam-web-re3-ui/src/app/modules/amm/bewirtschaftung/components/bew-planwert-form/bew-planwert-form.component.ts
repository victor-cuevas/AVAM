import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { PlanwertPreismodellCodeEnum } from '@app/shared/enums/domain-code/planwert-preismodell-code.enum';
import { PlanwerttypEnum } from '@app/shared/enums/domain-code/planwerttyp.enum';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { PlanwertDTO } from '@app/shared/models/dtos-generated/planwertDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { DropdownOption } from '@app/shared/services/forms/form-utils.service';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { Subscription } from 'rxjs';
import { BewPlanwertFormModeService } from './bew-planwert-form-mode.service';
import { BewPlanwertHandlerService } from './bew-planwert-handler.service';
import { BewPlanwertReactiveFormsService } from './bew-planwert-reactive-forms.service';

@Component({
    selector: 'avam-bew-planwert-form',
    templateUrl: './bew-planwert-form.component.html',
    providers: [BewPlanwertReactiveFormsService, BewPlanwertHandlerService, BewPlanwertFormModeService, ObliqueHelperService]
})
export class BewPlanwertFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input('planwertData') planwertData;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    modeSubscription: Subscription;
    currentFormMode: FormModeEnum;
    planwertDTO: PlanwertDTO;
    preismodellTypDropdownOptions: DropdownOption[];
    presmodellOptions: DropdownOption[];
    planwertType: CodeDTO;
    restwertDataSource: any;
    planwerttypEnum = PlanwerttypEnum;
    preismodellSub: Subscription;

    constructor(
        public handler: BewPlanwertHandlerService,
        public formMode: BewPlanwertFormModeService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService
    ) {
        this.formGroup = handler.reactiveForms.planwertForm;

        this.modeSubscription = this.formMode.mode$.subscribe(currentMode => {
            this.currentFormMode = currentMode;
        });
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.planwertData.currentValue) {
            this.planwertDTO = this.planwertData;
            this.initCreate(this.planwertDTO);
            this.mapDropdowns();
            this.restwertDataSource = this.mapRestwertTable();
        }
    }

    addRequiredValidators() {
        const preismodellTypDropdown = this.formGroup.controls.preismodellTypDropdown;
        const preismodellDropdown = this.formGroup.controls.preismodellDropdown;
        const preismodellInput = this.formGroup.controls.preismodellInput;
        const de = this.formGroup.controls.dePreismodel;
        const lektionen = this.formGroup.controls.lektionenPreismodel;
        const typeMassnahme = this.planwertDTO.typ.code === this.planwerttypEnum.MASSNAHME;
        const typeProdukt = this.planwertDTO.typ.code === this.planwerttypEnum.PRODUKT;
        const initalStatusCode = this.planwertDTO.preismodell
            ? this.planwertDTO.preismodell.code
            : this.planwertDTO.preismodellListe[0]
            ? this.planwertDTO.preismodellListe[0].code
            : 0;

        if (!typeProdukt) {
            preismodellTypDropdown.setValidators(Validators.required);
            preismodellDropdown.setValidators(Validators.required);
            preismodellInput.setValidators([preismodellInput.validator, Validators.required]);
            preismodellTypDropdown.updateValueAndValidity();
            preismodellDropdown.updateValueAndValidity();
            preismodellInput.updateValueAndValidity();
            this.setDeAndLektionenValidators(initalStatusCode, de, lektionen, typeMassnahme);
        }

        this.preismodellSub = this.formGroup.controls.preismodellDropdown.valueChanges.subscribe(value => {
            const statusCode = this.facade.formUtilsService.getCodeByCodeId(this.presmodellOptions, value);

            this.setDeAndLektionenValidators(statusCode, de, lektionen, typeMassnahme);
        });
    }

    setDeAndLektionenValidators(statusCode, de, lektionen, typeMassnahme) {
        statusCode === PlanwertPreismodellCodeEnum.KURSPREISD || statusCode === PlanwertPreismodellCodeEnum.KURSPREISM
            ? de.setValidators([NumberValidator.isNumberInRange(1, 9999, 'val321', false), NumberValidator.isPositiveInteger, Validators.required])
            : de.setValidators([NumberValidator.isNumberInRange(1, 9999, 'val321', false), NumberValidator.isPositiveInteger]);
        (statusCode === PlanwertPreismodellCodeEnum.LEKTIONENPREISD && !typeMassnahme) || (statusCode === PlanwertPreismodellCodeEnum.LEKTIONENPREISM && typeMassnahme)
            ? lektionen.setValidators([NumberValidator.isNumberInRange(1, 9999, 'val321', false), NumberValidator.isPositiveInteger, Validators.required])
            : lektionen.setValidators([NumberValidator.isNumberInRange(1, 9999, 'val321', false), NumberValidator.isPositiveInteger]);
        de.updateValueAndValidity();
        lektionen.updateValueAndValidity();
    }

    initCreate(dto: PlanwertDTO) {
        if (!this.planwertType) {
            this.planwertType = dto.typ;
        }
        this.formGroup.reset(this.handler.mapToForm(dto));
        this.addRequiredValidators();
    }

    mapDropdowns() {
        this.preismodellTypDropdownOptions = this.facade.formUtilsService.mapDropdown(this.planwertDTO.preismodellTypListe);
        this.presmodellOptions = this.facade.formUtilsService.mapDropdown(this.planwertDTO.preismodellListe);
    }

    mapRestwertTable() {
        const tableData = this.planwertDTO.restwerte[0];
        return [
            {
                chfBudget: tableData.chfBudget ? tableData.chfBudget : '--',
                chfSaldo: tableData.chfSaldo ? tableData.chfSaldo : '--',
                chfWerte: tableData.chfWerte ? tableData.chfWerte : '--',
                jahr: tableData.jahr,
                prozentBudget: tableData.prozentBudget ? tableData.prozentBudget : '--',
                prozentSaldo: tableData.prozentSaldo ? tableData.prozentSaldo : '--',
                prozentWerte: tableData.prozentWerte ? tableData.prozentWerte : '--'
            }
        ];
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.initCreate(this.planwertDTO);
                this.restwertDataSource = this.mapRestwertTable();
            });
        }
    }

    mapToDTO(): PlanwertDTO {
        return this.handler.mapToDTO(this.planwertDTO);
    }

    ngOnDestroy(): void {
        if (this.modeSubscription) {
            this.modeSubscription.unsubscribe();
        }
        if (this.preismodellSub) {
            this.preismodellSub.unsubscribe();
        }
    }
}
