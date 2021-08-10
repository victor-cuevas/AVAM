import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { StaatDTO } from '@dtos/staatDTO';
import { NumberValidator } from '@shared/validators/number-validator';

@Component({
    selector: 'avam-wizard-standortadresse',
    templateUrl: './wizard-standortadresse.component.html',
    styleUrls: ['./wizard-standortadresse.component.scss']
})
export class WizardStandortadresseComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') public ngForm: FormGroupDirective;
    public channel = 'unternehmen-wizard-stepone';
    public standOrtAdresseForm: FormGroup;
    public firstStepData;
    private schweizDTO: StaatDTO;

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private fb: FormBuilder,
        private fehlerMeldung: FehlermeldungenService,
        private dataService: StesDataRestService,
        private spinnerService: SpinnerService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.generateForm();
        this.getDefaultLand();
    }

    public ngAfterViewInit(): void {
        this.fehlerMeldung.closeMessage();
        this.standOrtAdresseForm.reset(this.firstStepData);
    }

    public ngOnDestroy(): void {
        this.fehlerMeldung.closeMessage();
    }

    public resetForm() {
        this.ngForm.resetForm();
        this.standOrtAdresseForm.reset();
        this.setSwitzerlandAsLand();
        this.standOrtAdresseForm.controls.plz.reset();
        this.standOrtAdresseForm.controls.plzPostfach.reset();
    }

    public canDeactivate() {
        return this.standOrtAdresseForm.dirty;
    }

    private setSwitzerlandAsLand() {
        this.standOrtAdresseForm.controls.land.setValue(this.schweizDTO);
        this.standOrtAdresseForm.controls.land['landAutosuggestObject'] = this.schweizDTO;
    }

    private getDefaultLand() {
        this.spinnerService.activate(this.channel);
        this.dataService
            .getStaatSwiss()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                schweizDTO => {
                    this.schweizDTO = schweizDTO;
                    this.spinnerService.deactivate(this.channel);
                    if (!this.firstStepData) {
                        this.setSwitzerlandAsLand();
                    }
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    private generateForm() {
        this.standOrtAdresseForm = this.fb.group(
            {
                name: null,
                name2: null,
                name3: null,
                strasse: null,
                strasseNr: null,
                plz: this.fb.group({
                    postleitzahl: null,
                    ort: null
                }),
                plzPostfach: this.fb.group({
                    postleitzahl: null,
                    ort: null
                }),
                land: null,
                postfach: [null, [NumberValidator.isPositiveInteger]],
                branche: ['', Validators.required],
                ergaenzendeAngaben: null
            },
            { validators: TwoFieldsAutosuggestValidator.plzCrossValidator('plz', 'plzPostfach', 'postleitzahl', 'ort', 'postleitzahl', 'ort') }
        );
    }
}
