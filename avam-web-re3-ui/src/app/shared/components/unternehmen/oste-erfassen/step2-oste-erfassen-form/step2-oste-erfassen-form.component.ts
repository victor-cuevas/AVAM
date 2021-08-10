import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { forkJoin, Subject } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { takeUntil } from 'rxjs/operators';
import { NumberValidator } from '@shared/validators/number-validator';
import { RangeSliderValidator } from '@shared/validators/range-slider-validator';
import { ActivatedRoute } from '@angular/router';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { OsteDTO } from '@dtos/osteDTO';
// prettier-ignore
import {
    Step2OsteSpracheTableComponent
} from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/step2-oste-sprache-table/step2-oste-sprache-table.component';
// prettier-ignore
import {
    Step2OsteBerufTableComponent
} from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/step2-oste-beruf-table/step2-oste-beruf-table.component';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-step2-oste-erfassen-form',
    templateUrl: './step2-oste-erfassen-form.component.html',
    styleUrls: ['./step2-oste-erfassen-form.component.scss']
})
export class Step2OsteErfassenFormComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('spracheTable') spracheTable: Step2OsteSpracheTableComponent;
    @ViewChild('berufTable') berufTable: Step2OsteBerufTableComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    dataLoaded = new Subject<void>();
    public dataSourceSprachen = null;
    public geschlechtOptions: CodeDTO[] = [];
    public fuehrerausweiskategorieOptions: CodeDTO[] = [];
    public anforderungenChannel = 'anforderungen';
    public anforderungenForm: FormGroup;
    @Input() activeFields = true;

    constructor(
        private route: ActivatedRoute,
        private osteDataService: OsteDataRestService,
        private dbTranslateService: DbTranslateService,
        private infopanelService: AmmInfopanelService,
        private spinnerService: SpinnerService,
        private stesDataRestService: StesDataRestService,
        private fb: FormBuilder,
        private facade: FacadeService
    ) {
        super();
    }

    public ngOnInit() {
        this.generateForm();
    }

    public ngAfterViewInit() {
        this.getData();
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    public mapToFormAnforderungen(oste: OsteDTO) {
        this.anforderungenForm.patchValue({
            ergaenzendeAngabenSprache: oste.sprachenBemerkungen,
            ergaenzendeAngabenAlterGeschlecht: oste.angabenAlter,
            idealesAlterSlider: { idealesAlter: '', alterVon: oste.alterVon || 18, alterBis: oste.alterBis || 65 },
            geschlecht: oste.geschlechtId,
            angabenAlter: oste.angabenAlter,
            fuehrerausweiskategorie: oste.kategorieId,
            privFahrzeug: oste.privFahrzeug,
            angabenAusweis: oste.angabenAusweis,
            ergaenzendeAngabenFuehrerausweiskategorie: oste.angabenAusweis
        });
    }

    public recheckValidations() {
        this.anforderungenForm.controls.fuehrerausweiskategorie.patchValue(this.anforderungenForm.controls.fuehrerausweiskategorie.value);
        this.anforderungenForm.controls.fuehrerausweiskategorie.markAsDirty();
        this.anforderungenForm.controls.fuehrerausweiskategorie.updateValueAndValidity();

        this.spracheTable.recheckValidations();
        this.berufTable.recheckValidations();
    }

    private generateForm() {
        this.anforderungenForm = this.fb.group(
            {
                ergaenzendeAngabenSprache: null,
                idealesAlterSlider: this.fb.group({
                    idealesAlter: [''],
                    alterVon: [null, [NumberValidator.isPositiveInteger, NumberValidator.isNumberInRange(15, 65, 'val252n', false)]],
                    alterBis: [null, [NumberValidator.isPositiveInteger, NumberValidator.isNumberInRange(15, 65, 'val252n', false)]]
                }),
                geschlecht: null,
                ergaenzendeAngabenAlterGeschlecht: null,
                fuehrerausweiskategorie: null,
                privFahrzeug: null,
                ergaenzendeAngabenFuehrerausweiskategorie: null
            },
            {
                validator: [RangeSliderValidator.areValuesInRangeBetween('idealesAlterSlider', 'alterVon', 'alterBis', 'idealesAlter', 'val254')]
            }
        );
        this.setDynamicaValidator();
    }

    private getData() {
        this.spinnerService.activate(this.anforderungenChannel);
        forkJoin<CodeDTO[], CodeDTO[]>([this.stesDataRestService.getCode(DomainEnum.GESCHLECHT), this.stesDataRestService.getCode(DomainEnum.FUEHRERAUSWEIS_KATEGORIE)])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([geschlecht, fuehrerausweisKategorie]) => {
                    this.geschlechtOptions = this.facade.formUtilsService.mapDropdownKurztext(geschlecht);
                    this.fuehrerausweiskategorieOptions = this.facade.formUtilsService.mapDropdownKurztext(fuehrerausweisKategorie);
                    this.dataLoaded.next();
                    this.dataLoaded.complete();
                    this.spinnerService.deactivate(this.anforderungenChannel);
                },
                () => {
                    this.spinnerService.deactivate(this.anforderungenChannel);
                }
            );
    }

    private setDynamicaValidator() {
        const fuehrerausweiskategorie = this.anforderungenForm.controls.fuehrerausweiskategorie as FormControl;
        const privFahrzeug = this.anforderungenForm.controls.privFahrzeug as FormControl;
        privFahrzeug.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            if (privFahrzeug.value) {
                fuehrerausweiskategorie.setValidators(Validators.required);
            } else {
                fuehrerausweiskategorie.setValidators(null);
            }
            fuehrerausweiskategorie.updateValueAndValidity();
        });
    }
}
