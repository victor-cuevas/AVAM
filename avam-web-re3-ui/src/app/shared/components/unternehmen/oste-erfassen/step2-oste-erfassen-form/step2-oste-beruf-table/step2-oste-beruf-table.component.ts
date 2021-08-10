import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FacadeService } from '@shared/services/facade.service';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { OsteBerufsbildungEntryParamDTO } from '@dtos/osteBerufsbildungEntryParamDTO';
import { forkJoin } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { BerufMeldepflichtViewDTO } from '@dtos/berufMeldepflichtViewDTO';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
// prettier-ignore
import {
    BaseAnforderungenTableComponent
} from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/base-anforderungen-table/base-anforderungen-table.component';
import { BaseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages } from '@dtos/baseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages';

export enum Refs {
    FLAG = 'flag',
    BERUF = 'beruf',
    AEHNLICHE_BERUFE = 'aehnlicheBerufe',
    QUALIFIKATION = 'qualifikation',
    ERFAHRUNG = 'erfahrung',
    AUSBILDUNG = 'ausbildungsNiveau',
    ABSCHLUSS_INLAENDISCH = 'abschlussInlaendisch',
    ABSCHLUSS_AUSLAENDISCH = 'abschlussAuslaendisch',
    ABSCHLUSS = 'abschlussAnerkannt',
    ANMERKUNGEN = 'anmerkungen',
    ACTION_BUTTON = 'actionButton'
}

@Component({
    selector: 'avam-step2-oste-beruf-table',
    templateUrl: './step2-oste-beruf-table.component.html',
    styleUrls: ['./step2-oste-beruf-table.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class Step2OsteBerufTableComponent extends BaseAnforderungenTableComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('angabenModal') angabenModal: ElementRef;
    modalForm: FormGroup;

    berufList: OsteBerufsbildungEntryParamDTO[] = [];

    qualifikationOptions: any[] = [];
    erfahrungOptions: any[] = [];
    ausbildungsNiveauOptions: any[] = [];
    berufAbschlussStatusOptions: any[] = [];

    columns = [
        { columnDef: Refs.FLAG, cell: (element: any) => `${element.flag}`, width: '3', fixWidth: true },
        { columnDef: Refs.BERUF, header: 'arbeitgeber.oste.label.beruftaetigkeit', cell: (element: any) => `${element.beruf}`, width: '13' },
        { columnDef: Refs.AEHNLICHE_BERUFE, header: 'stes.label.aehnlicheBerufe', cell: (element: any) => `${element.aehnlicheBerufe}`, width: '10' },
        { columnDef: Refs.QUALIFIKATION, header: 'arbeitgeber.oste.label.qualifikation', cell: (element: any) => `${element.qualifikation}`, width: '10' },
        { columnDef: Refs.ERFAHRUNG, header: 'arbeitgeber.oste.label.erfahrung', cell: (element: any) => `${element.erfahrung}`, width: '10' },
        { columnDef: Refs.AUSBILDUNG, header: 'arbeitgeber.oste.label.ausbildungsniveau', cell: (element: any) => `${element.ausbildungsNiveau}`, width: '12' },
        {
            columnDef: Refs.ABSCHLUSS_INLAENDISCH,
            header: 'arbeitgeber.oste.label.anforderungen.abschlussInlaendisch',
            cell: (element: any) => `${element.abschlussInlaendisch}`,
            width: '9'
        },
        {
            columnDef: Refs.ABSCHLUSS_AUSLAENDISCH,
            header: 'arbeitgeber.oste.label.anforderungen.abschlussAuslaendisch',
            cell: (element: any) => `${element.abschlussAuslaendisch}`,
            width: '9'
        },
        {
            columnDef: Refs.ABSCHLUSS,
            header: 'arbeitgeber.oste.label.anforderungen.abschlussAnerkannt',
            cell: (element: any) => `${element.abschlussAnerkannt}`,
            width: '9'
        },
        { columnDef: Refs.ANMERKUNGEN, header: 'arbeitgeber.oste.label.anmerkungen', cell: (element: any) => `${element.anmerkungen}`, width: '10' },
        { columnDef: Refs.ACTION_BUTTON, header: null, cell: null, width: '5', fixWidth: true }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    currentAngabenForm: FormGroup;

    readonly spinnerChannel = 'osteSpracheTableSpinnerChannel';
    readonly refs: typeof Refs = Refs;
    readonly optionsMap = new Map<Refs, any[]>();

    constructor(protected facade: FacadeService, private fb: FormBuilder, private stesDataRestService: StesDataRestService, private osteDataRestService: OsteDataRestService) {
        super(facade);
    }

    ngOnInit() {
        this.initForms();
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.tableForm.get('array')['controls'].forEach((fg: FormGroup) => {
                const analogBerufeControl = fg.get('analogBerufe');
                analogBerufeControl.setValue(analogBerufeControl.value.map(this.mapBerufMeldepflicht).sort(this.sortBerufMeldepflicht));
            });
            this.reset();
        });
    }

    ngAfterViewInit() {
        this.facade.spinnerService.activate(this.spinnerChannel);
        forkJoin<CodeDTO[], CodeDTO[], CodeDTO[], CodeDTO[]>([
            this.stesDataRestService.getCode(DomainEnum.BERUFSERFAHRUNG),
            this.stesDataRestService.getCode(DomainEnum.QUALIFIKATION),
            this.stesDataRestService.getCode(DomainEnum.AUSBILDUNGSNIVEAU),
            this.stesDataRestService.getCode(DomainEnum.BERUFSABSCHLUSSSTATUS)
        ])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facade.spinnerService.deactivate(this.spinnerChannel))
            )
            .subscribe(([berufErfahrung, qualifikation, ausbildungNiveau, abschlussStatus]) => {
                this.erfahrungOptions = this.facade.formUtilsService.mapDropdownKurztext(berufErfahrung.filter(this.filterIsValid));
                this.qualifikationOptions = this.facade.formUtilsService.mapDropdownKurztext(qualifikation.filter(this.filterIsValid));
                this.ausbildungsNiveauOptions = this.facade.formUtilsService.mapDropdownKurztext(ausbildungNiveau.filter(this.filterIsValid));
                this.berufAbschlussStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(abschlussStatus.filter(this.filterIsValid));
                this.initOptionsMap();
            });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    openModal(rowIndex: number) {
        this.currentAngabenForm = this.getFormGroupAt(rowIndex);
        this.modalForm.get('angaben').setValue(this.currentAngabenForm.get('angaben').value);
        this.facade.openModalFensterService.openModal(this.angabenModal);
    }

    closeModal() {
        this.facade.openModalFensterService.dismissAll();
    }

    updateAngaben() {
        this.currentAngabenForm.get('angaben').patchValue(this.modalForm.get('angaben').value);
        this.closeModal();
    }

    getKantoneTooltip(kantone: string): string {
        return kantone === 'CH'
            ? this.facade.translateService.instant('verzeichnisse.beruf.tooltip.meldepflichtigCH')
            : `${this.facade.translateService.instant('verzeichnisse.beruf.tooltip.meldepflichtigIn')} ${kantone}`;
    }

    mapBerufTableDataToBerufList(): OsteBerufsbildungEntryParamDTO[] {
        const rowsFormGroups = (this.tableForm.controls.array as FormArray).controls;
        this.berufList = rowsFormGroups.map((fg: FormGroup) => {
            return {
                berufId: fg.get('beruf')['berufAutosuggestObject'] ? fg.get('beruf')['berufAutosuggestObject'].berufId : null,
                berufDTO: fg.get('beruf')['berufAutosuggestObject'],
                verwandteBerufe: this.getBooleanValue(fg, 'aehnlicheBerufe'),
                qualifikationId: fg.get('qualifikation').value,
                erfahrungId: fg.get('erfahrung').value,
                ausbildungsniveauId: fg.get('ausbildungsNiveau').value,
                abschlussInland: this.getBooleanValue(fg, 'abschlussInlaendisch'),
                abschlussAusland: this.getBooleanValue(fg, 'abschlussAuslaendisch'),
                abschlussId: fg.get('abschlussAnerkannt').value,
                angaben: fg.get('angaben').value
            };
        });

        return this.berufList;
    }

    protected parseFormData() {
        this.dataSource = this.tableForm.controls.array.value.map((formGroupValue: any) => {
            const aehnlicheBerufeOption = this.jaNeinOptions.find((option: any) => option.value === +formGroupValue.aehnlicheBerufe);
            const qualifikationOption = this.qualifikationOptions.find((option: any) => option.value === +formGroupValue.qualifikation);
            const erfahrungOption = this.erfahrungOptions.find((option: any) => option.value === +formGroupValue.erfahrung);
            const ausbildungsNiveauOption = this.ausbildungsNiveauOptions.find((option: any) => option.value === +formGroupValue.ausbildungsNiveau);
            const abschlussInlaendisch = this.jaNeinOptions.find((option: any) => option.value === +formGroupValue.abschlussInlaendisch);
            const abschlussAuslaendisch = this.jaNeinOptions.find((option: any) => option.value === +formGroupValue.abschlussAuslaendisch);
            const abschlussAnerkannt = this.jaNeinOptions.find((option: any) => option.value === +formGroupValue.abschlussAnerkannt);

            return {
                index: formGroupValue.index,
                flag: formGroupValue.meldepflichtKantone,
                beruf: this.facade.dbTranslateService.translate(formGroupValue.beruf, 'bezeichnungMa'),
                aehnlicheBerufe: this.facade.dbTranslateService.translate(aehnlicheBerufeOption, 'label'),
                qualifikation: this.facade.dbTranslateService.translate(qualifikationOption, 'label'),
                erfahrung: this.facade.dbTranslateService.translate(erfahrungOption, 'label'),
                ausbildungsNiveau: this.facade.dbTranslateService.translate(ausbildungsNiveauOption, 'label'),
                abschlussInlaendisch: this.facade.dbTranslateService.translate(abschlussInlaendisch, 'label'),
                abschlussAuslaendisch: this.facade.dbTranslateService.translate(abschlussAuslaendisch, 'label'),
                abschlussAnerkannt: this.facade.dbTranslateService.translate(abschlussAnerkannt, 'label'),
                anmerkungen: formGroupValue.angaben
            };
        });
    }

    protected instantiateFormGroup(data?: OsteBerufsbildungEntryParamDTO): FormGroup {
        const formGroup = this.fb.group({
            index: this.currentRows,
            beruf: [data ? data.berufDTO : null, [Validators.required]],
            meldepflichtKantone: '', // displays flag
            analogBerufe: [], // display analog berufe on info icon's hover
            aehnlicheBerufe: this.getNumberValue(data, 'verwandteBerufe'),
            qualifikation: data ? data.qualifikationId : null,
            erfahrung: data ? data.erfahrungId : null,
            ausbildungsNiveau: data ? data.ausbildungsniveauId : null,
            abschlussInlaendisch: this.getNumberValue(data, 'abschlussInland'),
            abschlussAuslaendisch: this.getNumberValue(data, 'abschlussAusland'),
            abschlussAnerkannt: data ? data.abschlussId : null,
            angaben: data ? data.angaben : null
        });

        formGroup.get('beruf')['berufAutosuggestObject'] = data ? data.berufDTO : null;
        this.setFormGroupSubscription(formGroup);
        return formGroup;
    }

    protected reset() {
        this.facade.spinnerService.activate(this.spinnerChannel);
        this.visible = false;
        setTimeout(() => {
            if (this.tableForm.controls.array['controls']) {
                this.tableForm.controls.array['controls'].forEach((c: FormGroup) => {
                    c.get('beruf').setValue(c.get('beruf').value ? c.get('beruf')['berufAutosuggestObject'] : null);
                });
            }
            this.visible = true;
            this.facade.spinnerService.deactivate(this.spinnerChannel);
        });
    }

    protected getNumberValue(data: any, controlName: string): number {
        return !data || !data[controlName] ? 0 : 1;
    }

    private initForms() {
        this.tableForm = this.fb.group({
            array: this.fb.array([])
        });

        this.modalForm = this.fb.group({
            angaben: null
        });
    }

    private initOptionsMap() {
        this.optionsMap.set(Refs.ERFAHRUNG, this.erfahrungOptions);
        this.optionsMap.set(Refs.QUALIFIKATION, this.qualifikationOptions);
        this.optionsMap.set(Refs.AUSBILDUNG, this.ausbildungsNiveauOptions);
        this.optionsMap.set(Refs.ABSCHLUSS, this.berufAbschlussStatusOptions);
    }

    private setFormGroupSubscription(formGroup: FormGroup) {
        formGroup
            .get('beruf')
            .valueChanges.pipe(
                takeUntil(this.unsubscribe),
                debounceTime(500)
            )
            .subscribe(berufValue => {
                if (berufValue) {
                    this.osteDataRestService.getAnalogMeldepflichtBerufe(berufValue).subscribe((response: BaseResponseWrapperOsteBerufAnforderungenInfoDTOWarningMessages) => {
                        formGroup.get('analogBerufe').setValue(response.data.berufMeldepflichtViewDTOList.map(this.mapBerufMeldepflicht).sort(this.sortBerufMeldepflicht));
                        formGroup.get('meldepflichtKantone').setValue(this.flatKantoneList(response.data.meldepflichtKantone));
                        formGroup.get('qualifikation').setValidators(response.data.qualifikationRequired ? [Validators.required] : []);
                        formGroup.get('qualifikation').patchValue(formGroup.get('qualifikation').value);
                    });
                } else {
                    formGroup.get('analogBerufe').setValue(null);
                    formGroup.get('meldepflichtKantone').setValue(null);
                    formGroup.get('qualifikation').clearValidators();
                    formGroup.get('qualifikation').patchValue(formGroup.get('qualifikation').value);
                }
            });
    }

    private flatKantoneList(kantoneList: string[]): string {
        return kantoneList && kantoneList.length ? kantoneList.reduce((s1, s2) => `${s1}, ${s2}`) : '';
    }

    private mapBerufMeldepflicht = (dto: BerufMeldepflichtViewDTO): string => {
        return this.facade.dbTranslateService.translate(dto, 'bezeichnungMa');
    };

    private sortBerufMeldepflicht = (v1: string, v2: string): number => {
        return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
    };

    private getBooleanValue(fg: FormGroup, controlName: string): boolean {
        return fg.value[controlName] !== null && fg.value[controlName] !== undefined ? !!+fg.value[controlName] : null;
    }
}
