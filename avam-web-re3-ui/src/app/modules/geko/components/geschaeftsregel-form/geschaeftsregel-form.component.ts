import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { forkJoin } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { FormUtilsService } from '@app/shared';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { map } from 'rxjs/operators';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';
import { GekoRegelRestService } from '@core/http/geko-regel-rest.service';
import { RegelGeKoDTO } from '@dtos/regelGeKoDTO';
import { KaeSweConstant } from '@modules/arbeitgeber/shared/enums/kaeswe.enums';
import { FacadeService } from '@shared/services/facade.service';
import { Router } from '@angular/router';
import { AvamLabelDropdownComponent } from '@app/library/wrappers/form/avam-label-dropdown/avam-label-dropdown.component';
import { GeschaeftsregelReactiveFormsService } from '@modules/geko/components/geschaeftsregel-form/geschaeftsregel-reactive-forms.service';
import { GeschaeftsregelHandlerService } from '@modules/geko/components/geschaeftsregel-form/geschaeftsregel-handler.service';

@Component({
    selector: 'avam-geschaeftsregel-erfassen-form',
    templateUrl: './geschaeftsregel-form.component.html',
    providers: [GeschaeftsregelReactiveFormsService, GeschaeftsregelHandlerService]
})
export class GeschaeftsregelFormComponent implements OnInit {
    private static GESCHAEFT_PENDENT = '10';
    private static GESCHAEFT_ERLEDIGT = 'E1';
    private static GESCHAEFT_PENDENT_FREIGABEBEREIT = '20';
    private static GESCHAEFT_ART_STELLENVERMITTLUNGEN = ['G6', 'S19'];

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    @ViewChild('sachstandBeginn')
    sachstandBeginnDropDwon: AvamLabelDropdownComponent;

    @ViewChild('sachstandEnde')
    sachstandEndeDropDwon: AvamLabelDropdownComponent;

    @Input()
    editMode = false;

    @Output()
    initForm = new EventEmitter<void>();

    form: FormGroup;

    geschaeftsbereichOptions: DropdownOption[] = [];
    geschaeftsartOptions: DropdownOption[] = [];
    sachstandOptions: DropdownOption[] = [];
    isGeschaeftArtDropdownReadOnly = true;

    private cachedGeschaeftArtOptions: { [geschaeftsbereichId: string]: DropdownOption[] } = {
        '': []
    };

    constructor(
        private obliqueHelperService: ObliqueHelperService,
        private stesDataRestService: StesDataRestService,
        private restService: GekoRegelRestService,
        private facadeService: FacadeService,
        private router: Router,
        private handlerService: GeschaeftsregelHandlerService,
        formService: GeschaeftsregelReactiveFormsService
    ) {
        this.form = formService.form;
    }

    ngOnInit(): void {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.fillDropdowns();
    }

    private fillDropdowns() {
        forkJoin([this.stesDataRestService.getCode(DomainEnum.GEKO_GESCHAEFT_BEREICH), this.stesDataRestService.getCode(DomainEnum.GEKO_SACHSTAND)])
            .pipe(
                map(([geschaeftBereich, sachstand]) => [
                    this.facadeService.formUtilsService.mapDropdown(geschaeftBereich),
                    this.facadeService.formUtilsService.mapDropdown(sachstand)
                ])
            )
            .subscribe(([geschaeftBereich, sachstand]) => {
                this.geschaeftsbereichOptions = this.filterUneededValues(geschaeftBereich)
                    .filter(option => option.code)
                    .sort(this.sortByText);
                this.sachstandOptions = sachstand;
                this.selectSachstandBeginn(GeschaeftsregelFormComponent.GESCHAEFT_PENDENT);
                this.selectSachstandEnde(GeschaeftsregelFormComponent.GESCHAEFT_ERLEDIGT);
                this.initForm.emit();
            });
    }

    onGeschaeftsbereitChanged(geschaeftsbereichId: string) {
        this.loadGeschaeftArt(geschaeftsbereichId);
        this.selectSachstandBeginn(GeschaeftsregelFormComponent.GESCHAEFT_PENDENT);
        this.selectSachstandEnde(GeschaeftsregelFormComponent.GESCHAEFT_ERLEDIGT);
        this.isGeschaeftArtDropdownReadOnly = geschaeftsbereichId === '';
    }

    onGeschaeftArtChanged(geschaeftArtId: string) {
        const geschaeftArt = this.facadeService.formUtilsService.getCodeByCodeId(this.geschaeftsartOptions, geschaeftArtId);
        if (GeschaeftsregelFormComponent.GESCHAEFT_ART_STELLENVERMITTLUNGEN.indexOf(geschaeftArt) !== -1) {
            this.selectSachstandBeginn(GeschaeftsregelFormComponent.GESCHAEFT_PENDENT_FREIGABEBEREIT);
        } else {
            this.selectSachstandBeginn(GeschaeftsregelFormComponent.GESCHAEFT_PENDENT);
        }
    }

    private filterUneededValues(geschaeftBereich: DropdownOption[]): DropdownOption[] {
        const uneededValues = [GekobereichCodeEnum.GESCHAEFTSBEREICH_FACHBERATUNG.toString(), GekobereichCodeEnum.GESCHAEFTSBEREICH_AMM.toString()];
        return geschaeftBereich.filter(bereich => uneededValues.indexOf(bereich.code) === -1);
    }

    private loadGeschaeftArt(geschaeftsbereichId: string): void {
        if (this.cachedGeschaeftArtOptions[geschaeftsbereichId]) {
            this.geschaeftsartOptions = this.cachedGeschaeftArtOptions[geschaeftsbereichId];
            this.form.controls.geschaeftsart.setValue('');
            return;
        }

        this.restService.loadGeschaeftartenForBereich(geschaeftsbereichId).subscribe(geschaeftArten => {
            this.cachedGeschaeftArtOptions[geschaeftsbereichId] = this.facadeService.formUtilsService.mapDropdown(geschaeftArten).sort(this.sortByText);
            this.geschaeftsartOptions = this.cachedGeschaeftArtOptions[geschaeftsbereichId];
            this.form.controls.geschaeftsart.setValue('');
        });
    }

    showError() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.ngForm.onSubmit(undefined);
        this.facadeService.fehlermeldungenService.showMessage(KaeSweConstant.PFLICHTFELDER, 'danger');
    }

    private selectSachstandBeginn(sachstandArt: string): void {
        this.form.controls.sachstandBeginn.setValue(this.facadeService.formUtilsService.getCodeIdByCode(this.sachstandOptions, sachstandArt));
    }

    private selectSachstandEnde(sachstandArt: string) {
        this.form.controls.sachstandEnde.setValue(this.facadeService.formUtilsService.getCodeIdByCode(this.sachstandOptions, sachstandArt));
    }

    zuruecksetzen() {
        if (this.form.dirty) {
            this.facadeService.resetDialogService.reset(() => {
                this.setFormToInitalState();
            });
        } else {
            this.setFormToInitalState();
        }
    }

    private setFormToInitalState() {
        this.form.reset();
        this.initForm.emit();
    }

    abbrechen() {
        this.router.navigate(['/geko/geschaeftsregeln']);
    }

    isDirty(): boolean {
        return this.form.dirty;
    }

    private sortByText = (o1: DropdownOption, o2: DropdownOption): number => {
        switch (this.facadeService.translateService.currentLang) {
            case 'fr':
                return o1.labelFr.localeCompare(o2.labelFr);

            case 'it':
                return o1.labelIt.localeCompare(o2.labelIt);

            default:
                return o1.labelDe.localeCompare(o2.labelDe);
        }
    };

    mapFormToDTO(): RegelGeKoDTO {
        return this.handlerService.mapToDTO();
    }

    mapDtoToForm(dto: RegelGeKoDTO) {
        this.form.setValue(this.handlerService.mapToForm(dto));
    }
}
