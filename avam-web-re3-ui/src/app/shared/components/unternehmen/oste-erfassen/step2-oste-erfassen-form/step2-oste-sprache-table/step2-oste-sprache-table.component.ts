import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FacadeService } from '@shared/services/facade.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { SprachkenntnisDTO } from '@dtos/sprachkenntnisDTO';
// prettier-ignore
import {
    BaseAnforderungenTableComponent
} from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/base-anforderungen-table/base-anforderungen-table.component';
import { OsteSprachkenntnisseEntryParamDTO } from '@dtos/osteSprachkenntnisseEntryParamDTO';

export enum Refs {
    SPRACHE = 'language',
    MUENDLICH = 'muendlich',
    SCHRIFTLICH = 'schriftlich',
    MUTTERSPRACHE = 'muttersprache',
    SPRACHENAUFENTHALT = 'sprachenaufenthalt',
    ACTION_BUTTON = 'actionButton'
}

@Component({
    selector: 'avam-step2-oste-sprache-table',
    templateUrl: './step2-oste-sprache-table.component.html',
    styleUrls: ['./step2-oste-sprache-table.component.scss']
})
export class Step2OsteSpracheTableComponent extends BaseAnforderungenTableComponent implements OnInit, AfterViewInit, OnDestroy {
    spracheList: OsteSprachkenntnisseEntryParamDTO[] = [];
    sprachkenntnisseOptions: any[] = [];

    columns = [
        { columnDef: Refs.SPRACHE, header: 'i18n.labels.language', width: '19%', cell: (element: any) => `${element.sprache}` },
        { columnDef: Refs.MUENDLICH, header: 'stes.label.muendlich', width: '19%', cell: (element: any) => `${element.muendlich}` },
        { columnDef: Refs.SCHRIFTLICH, header: 'stes.label.schriftlich', width: '19%', cell: (element: any) => `${element.schriftlich}` },
        { columnDef: Refs.MUTTERSPRACHE, header: 'stes.label.Muttersprache', width: '19%', cell: (element: any) => `${element.muttersprache}` },
        { columnDef: Refs.SPRACHENAUFENTHALT, header: 'stes.label.sprachenaufenhalt', width: '19%', cell: (element: any) => `${element.sprachaufenhalt}` },
        { columnDef: Refs.ACTION_BUTTON, header: null, cell: null, width: '5%', fixWidth: true }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    readonly refs: typeof Refs = Refs;
    readonly spinnerChannel = 'osteSpracheTableSpinnerChannel';

    constructor(protected facade: FacadeService, private fb: FormBuilder, private stesDataRestService: StesDataRestService) {
        super(facade);
    }

    ngOnInit() {
        this.initForm();
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.reset());
    }

    ngAfterViewInit() {
        this.stesDataRestService
            .getCode(DomainEnum.SPRACHKENNTNISSE)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: CodeDTO[]) => {
                this.sprachkenntnisseOptions = this.facade.formUtilsService.mapDropdownKurztext(response);
            });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    mapSpracheTableDataToSprachList() {
        const rowsFormGroups = (this.tableForm.controls.array as FormArray).controls;
        this.spracheList = rowsFormGroups
            .filter((ele: FormGroup) => !!ele.controls.sprache.value)
            .map((ele: FormGroup) => {
                return {
                    sprache: ele.controls.sprache['autosuggestObject'],
                    muendlichId: ele.value.muendlich,
                    schriftlichId: ele.value.schriftlich,
                    muttersprache: ele.value.muttersprache !== null && ele.value.muttersprache !== undefined ? !!+ele.value.muttersprache : null,
                    sprachaufenthalt: ele.value.sprachenaufenthalt !== null && ele.value.sprachenaufenthalt !== undefined ? !!+ele.value.sprachenaufenthalt : null
                };
            });
        return this.spracheList;
    }

    protected parseFormData() {
        this.dataSource = this.tableForm.controls.array.value.map((formGroupValue: any) => {
            const muendlichOption = this.sprachkenntnisseOptions.find((option: any) => option.value === +formGroupValue.muendlich);
            const schriftlichOption = this.sprachkenntnisseOptions.find((option: any) => option.value === +formGroupValue.schriftlich);
            const mutterspracheOption = this.jaNeinOptions.find((option: any) => option.value === +formGroupValue.muttersprache);
            const sprachenaufenthaltOption = this.jaNeinOptions.find((option: any) => {
                return option.value === formGroupValue.sprachenaufenthalt;
            });

            return {
                index: formGroupValue.index,
                language: this.facade.dbTranslateService.translate(formGroupValue.sprache, 'text'),
                muendlich: this.facade.dbTranslateService.translate(muendlichOption, 'label'),
                schriftlich: this.facade.dbTranslateService.translate(schriftlichOption, 'label'),
                muttersprache: this.facade.dbTranslateService.translate(mutterspracheOption, 'label'),
                sprachenaufenthalt: this.facade.dbTranslateService.translate(sprachenaufenthaltOption, 'label')
            };
        });
    }

    protected instantiateFormGroup(data?: SprachkenntnisDTO): FormGroup {
        const formGroup = this.fb.group({
            index: this.currentRows,
            sprache: data ? data.spracheObject : null,
            muendlich: data ? data.muendlichId : null,
            schriftlich: data ? data.schriftlichId : null,
            muttersprache: this.getNumberValue(data, 'muttersprache'),
            sprachenaufenthalt: this.getNumberValue(data, 'aufenthalt')
        });
        this.setFormGroupSubscription(formGroup);
        return formGroup;
    }

    protected reset() {
        this.facade.spinnerService.activate(this.spinnerChannel);
        this.visible = false;
        setTimeout(() => {
            this.visible = true;
            this.facade.spinnerService.deactivate(this.spinnerChannel);
        });
    }

    protected getNumberValue(data: any, controlName: string): number {
        return !data || data[controlName] === null || data[controlName] === undefined ? null : data[controlName] ? 1 : 0;
    }

    private initForm() {
        this.tableForm = this.fb.group({
            array: this.fb.array([])
        });
    }

    private setFormGroupSubscription(formGroup: FormGroup) {
        formGroup.valueChanges
            .pipe(
                takeUntil(this.unsubscribe),
                distinctUntilChanged((prev, post) => prev.sprache === post.sprache && prev.muendlich === post.muendlich && prev.schriftlich === post.schriftlich)
            )
            .subscribe(formValue => {
                if ((!!formValue.sprache && !!formValue.sprache.kurzTextDe) || !!formValue.muendlich || !!formValue.schriftlich) {
                    formGroup.get('sprache').setValidators([Validators.required]);
                    formGroup.get('muendlich').setValidators([Validators.required]);
                    formGroup.get('schriftlich').setValidators([Validators.required]);
                } else {
                    formGroup.get('sprache').clearValidators();
                    formGroup.get('muendlich').clearValidators();
                    formGroup.get('schriftlich').clearValidators();
                }

                const spracheControlValue = !!formValue.sprache && typeof formValue.sprache === 'string' ? this.spracheMapper(formValue.sprache) : formValue.sprache;
                formGroup.get('sprache').patchValue(spracheControlValue);
                if (formValue.muendlich !== undefined) formGroup.get('muendlich').patchValue(formValue.muendlich);
                if (formValue.schriftlich !== undefined) formGroup.get('schriftlich').patchValue(formValue.schriftlich);
            });
    }

    private spracheMapper(sprache: string) {
        return {
            codeId: -1,
            kurzTextDe: sprache,
            kurzTextFr: sprache,
            kurzTextIt: sprache
        };
    }
}
