import { LeistungsvereinbarungDTO } from '@dtos/leistungsvereinbarungDTO';
import { PlanwerttypEnum } from '@shared/enums/domain-code/planwerttyp.enum';
import { VwPreismodellSessionsEnum } from '@shared/enums/domain-code/vw-preismodell-sessions-enum';
import { MassnahmeDTO } from '@dtos/massnahmeDTO';
import { ActivatedRoute } from '@angular/router';
import { AmmVierAugenStatusCode } from '@shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, SimpleChanges, OnChanges, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { VertragswertDetailHandlerService } from './vertragswert-detail-handler.service';
import { VertragswertDetailReactiveFormsService } from './vertragswert-detail-reactive-forms.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { CodeDTO } from '@dtos/codeDTO';
import { FacadeService } from '@shared/services/facade.service';
import { VertragswertDTO } from '@dtos/vertragswertDTO';
import { VertragswertTypCodeEnum } from '@shared/enums/domain-code/vertragswert-typ-code.enum';
//prettier-ignore
import { VwErfassenTableDataRow } 
from '../../pages/unternehmen-details/vertragswert-erfassen-wizard/components/vertragswert-erfassen-tree-table/vertragswert-erfassen-tree-table.component';
import { VertragswertDetailFormModeService } from './vertragswert-detail-form-mode.service';
import { VertragswertMDTO } from '@dtos/vertragswertMDTO';
import { VwPreismodellKurseEnum } from '@app/shared/enums/domain-code/vw-preismodell-kurse-enum copy';

export enum FreigegebeneAbrechnungEnum {
    JA = 'amm.abrechnungen.label.ja',
    NEIN = 'amm.abrechnungen.label.nein'
}

export interface VertragswertDetailData {
    vertragswertDto: VertragswertDTO;
    preismodellTypOptions: CodeDTO[];
    yesNoOptions: CodeDTO[];
    planwertUebernommen?: boolean;
    selectedTreeTableItem?: VwErfassenTableDataRow;
    preserveFormDirty?: boolean;
    referencedLv?: LeistungsvereinbarungDTO;
    onBerechnen?: boolean;
    hasDetailState?: boolean;
}
@Component({
    selector: 'avam-vertragswert-detail-form',
    templateUrl: './vertragswert-detail-form.component.html',
    providers: [VertragswertDetailHandlerService, VertragswertDetailReactiveFormsService, VertragswertDetailFormModeService, ObliqueHelperService]
})
export class VertragswertDetailFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input() vertragswertDetailData: VertragswertDetailData;
    @Output() onGuelitgChange: EventEmitter<boolean> = new EventEmitter();
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    gueltigOptions: DropdownOption[] = [];
    preismodellTypOptions: DropdownOption[] = [];
    preismodellOptions: DropdownOption[] = [];
    planwertType: CodeDTO;
    restwertDataSource: any;
    vertragswertDto: VertragswertDTO;
    freigegebeneAbrechnung: string;
    isVertragswerttypKurs = false;
    isVertragswerttypStandort = false;
    langSubscription: Subscription;
    modeSubscription: Subscription;
    currentFormMode: FormModeEnum;
    // The variable below is used for multiple elements on the mask
    // since they share the same readonly condition
    isPreismodellTypReadonly = false;
    isGueltigReadonly = false;
    isPreismodellReadonly = false;
    isTnReadOnly: boolean;
    isChfReadOnly: boolean;
    currentGueltigOption: boolean;
    formModeEnum = FormModeEnum;

    constructor(
        private handler: VertragswertDetailHandlerService,
        private reactiveForms: VertragswertDetailReactiveFormsService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService,
        private formMode: VertragswertDetailFormModeService,
        private route: ActivatedRoute
    ) {
        this.formGroup = reactiveForms.vertragswertDetailForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.formGroup.patchValue(this.handler.mapToFormStatusBudgetposition(this.vertragswertDto));
        });

        this.route.data.subscribe(data => {
            this.formMode.changeMode(data.mode);
        });

        this.modeSubscription = this.formMode.mode$.subscribe(currentMode => {
            this.currentFormMode = currentMode;
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.vertragswertDetailData.currentValue) {
            this.vertragswertDto = this.vertragswertDetailData.vertragswertDto;
            this.prepareMask(this.vertragswertDetailData);
            this.formGroup.reset(this.handler.mapToForm(this.vertragswertDto));

            if (this.vertragswertDetailData.preserveFormDirty) {
                this.formGroup.markAsDirty();
            }

            if (this.currentFormMode === FormModeEnum.CREATE && !this.vertragswertDetailData.hasDetailState && !this.vertragswertDetailData.onBerechnen) {
                this.handler.setDefaultValues(this.vertragswertDetailData.planwertUebernommen, this.vertragswertDetailData.vertragswertDto);
            }
        }
    }

    prepareMask(vertragswertDetailData: VertragswertDetailData) {
        const dto = vertragswertDetailData.vertragswertDto;
        // Since we share a common table with Planwert
        // This property is hardcoded in order to bypass the check
        // which hides two of the columns
        this.planwertType = { code: PlanwerttypEnum.MASSNAHME };
        this.mapDropdowns(vertragswertDetailData);
        this.restwertDataSource = this.mapRestwertTable(dto);
        this.isVertragswerttypKurs = dto.typ.code === VertragswertTypCodeEnum.KURS;
        this.isVertragswerttypStandort = dto.typ.code === VertragswertTypCodeEnum.STANDORT;

        if (!this.isVertragswerttypKurs) {
            this.reactiveForms.setValidatorsOnDurchfuehrungVonBis(vertragswertDetailData, this.currentFormMode);
        }

        this.setReadonly(dto);
        this.freigegebeneAbrechnung = vertragswertDetailData.vertragswertDto.freigegebeneAbrechnung ? FreigegebeneAbrechnungEnum.JA : FreigegebeneAbrechnungEnum.NEIN;
        this.currentGueltigOption = dto.gueltigB;
    }

    onPreismodellChange(selectedOptionCodeId) {
        let selectedCode;

        if (selectedOptionCodeId) {
            selectedCode = this.facade.formUtilsService.getCodeByCodeId(this.vertragswertDto.preismodellList, selectedOptionCodeId);
        }

        // This check is needed to know which domain we are using.
        // The domain we are using decides whether field DE will be required.
        let checkPreismodellKurse;

        if (this.vertragswertDto) {
            checkPreismodellKurse = this.vertragswertDto.typ.code === VertragswertTypCodeEnum.KURS;
        }

        this.reactiveForms.toggleDePreismodellRequired(
            checkPreismodellKurse ? selectedCode === VwPreismodellSessionsEnum.KURSPREIS : selectedCode === VwPreismodellKurseEnum.KURSPREIS
        );
        this.reactiveForms.toggleLektionenPreismodellRequired(selectedCode === VwPreismodellKurseEnum.LEKTIONENPREIS || selectedCode === VwPreismodellSessionsEnum.LEKTIONENPREIS);
    }

    mapToDTO() {
        return this.handler.mapToDTO(this.vertragswertDetailData);
    }

    onChangeGueltig(selectedCode) {
        this.onGuelitgChange.emit(!!+selectedCode);

        if (selectedCode !== undefined && !!+selectedCode !== this.currentGueltigOption) {
            this.reactiveForms.toggletntagePreismodelRow1Required(!!+selectedCode);
            this.reactiveForms.toggletnPreismodelRow1Required(!!+selectedCode);
            this.reactiveForms.toggleChfRequired(!!+selectedCode);
            this.isTnReadOnly = !+selectedCode;
            this.isChfReadOnly = !+selectedCode;
            this.isPreismodellTypReadonly = !+selectedCode;
        }

        if (selectedCode !== undefined && !!+selectedCode === false && this.currentGueltigOption) {
            this.formGroup.patchValue(this.handler.mapToFormOnGueltigChange(this.vertragswertDetailData.vertragswertDto));
            this.isPreismodellTypReadonly = !+selectedCode;
        }

        this.currentGueltigOption = !!+selectedCode;
    }

    reset() {
        this.facade.resetDialogService.resetIfDirty(this.formGroup, () => {
            this.facade.fehlermeldungenService.closeMessage();
            this.formGroup.reset(this.handler.mapToForm(this.vertragswertDto));
        });
    }

    ngOnDestroy() {
        this.langSubscription.unsubscribe();
    }

    private setReadonly(dto: VertragswertDTO) {
        if (this.currentFormMode === FormModeEnum.EDIT) {
            const lvStatusCode = this.vertragswertDetailData.referencedLv.statusObject.code;
            const lvStatusReadonly = this.lvStatusCheckReadonly(lvStatusCode);
            this.isPreismodellTypReadonly = !dto.gueltigB || lvStatusReadonly;
            this.isTnReadOnly = this.isPreismodellTypReadonly;
            this.isChfReadOnly = this.isPreismodellTypReadonly;
            this.reactiveForms.toggletnPreismodelRow1Required(!this.isPreismodellTypReadonly);
            this.reactiveForms.toggletntagePreismodelRow1Required(!this.isPreismodellTypReadonly);
            this.reactiveForms.toggleChfRequired(!this.isPreismodellTypReadonly);
            this.isGueltigReadonly = lvStatusReadonly || (!dto.vorgaengerObject && dto.leistungsvereinbarungList.length === 1);
            this.isPreismodellReadonly = this.isVertragswertTypReadonly(dto);
        } else {
            this.isGueltigReadonly = true;
            this.reactiveForms.toggletnPreismodelRow1Required(!this.vertragswertDetailData.planwertUebernommen);
            this.reactiveForms.toggletntagePreismodelRow1Required(!this.vertragswertDetailData.planwertUebernommen);
            this.reactiveForms.toggleChfRequired(!this.vertragswertDetailData.planwertUebernommen);
        }
    }

    private isVertragswertTypReadonly(dto: VertragswertDTO): boolean {
        const vwTypCode = dto.typ.code;

        return (
            vwTypCode === VertragswertTypCodeEnum.STANDORT ||
            (vwTypCode === VertragswertTypCodeEnum.MASSNAHME &&
                (dto as VertragswertMDTO).massnahmeObject.durchfuehrungseinheitType !== MassnahmeDTO.DurchfuehrungseinheitTypeEnum.SESSION)
        );
    }

    private lvStatusCheckReadonly(lvStatusCode: string): boolean {
        return lvStatusCode === AmmVierAugenStatusCode.FREIGABEBEREIT || lvStatusCode === AmmVierAugenStatusCode.FREIGEGEBEN || lvStatusCode === AmmVierAugenStatusCode.ERSETZT;
    }

    private mapRestwertTable(vertragswertDto: VertragswertDTO) {
        const tableData = vertragswertDto.restwerteList[0];
        const emptyCellPlaceholder = '--';

        return [
            {
                chfBudget: tableData.chfBudget ? tableData.chfBudget : emptyCellPlaceholder,
                chfSaldo: tableData.chfSaldo ? tableData.chfSaldo : emptyCellPlaceholder,
                chfWerte: tableData.chfWerte ? tableData.chfWerte : emptyCellPlaceholder,
                jahr: tableData.jahr,
                prozentBudget: tableData.prozentBudget ? tableData.prozentBudget : emptyCellPlaceholder,
                prozentSaldo: tableData.prozentSaldo ? tableData.prozentSaldo : emptyCellPlaceholder,
                prozentWerte: tableData.prozentWerte ? tableData.prozentWerte : emptyCellPlaceholder
            }
        ];
    }

    private mapDropdowns(vertragswertDetailData: VertragswertDetailData) {
        this.preismodellTypOptions = this.facade.formUtilsService.mapDropdown(vertragswertDetailData.preismodellTypOptions);
        this.preismodellOptions = this.facade.formUtilsService.mapDropdown(vertragswertDetailData.vertragswertDto.preismodellList);
        this.gueltigOptions = this.facade.formUtilsService.mapDropdown(vertragswertDetailData.yesNoOptions);
    }
}
