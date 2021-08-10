import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { ArbeitgeberSearchHandlerService } from '@modules/geko/components/arbeitgeber-search-form/arbeitgeber-search-handler.service';
import { ArbeitgeberSearchReactiveFormsService } from '@modules/geko/components/arbeitgeber-search-form/arbeitgeber-search-reactive-forms.service';
import { FacadeService } from '@shared/services/facade.service';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { GeschaeftArbeitgeberSuchenAction, GeschaeftArbeitgeberSuchenData } from '@modules/geko/components/arbeitgeber-search-form/geschaeft-arbeitgeber-suchen.data';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-geko-arbeitgeber-search-form',
    templateUrl: './arbeitgeber-search-form.component.html',
    providers: [ArbeitgeberSearchHandlerService, ArbeitgeberSearchReactiveFormsService]
})
export class ArbeitgeberSearchFormComponent extends Unsubscribable implements OnInit, OnChanges, AfterViewInit {
    @Input('data') data: GeschaeftArbeitgeberSuchenData;
    @Input('isAmm') isAmm: boolean;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('fallbearbeiter') fallbearbeiter: AvamPersonalberaterAutosuggestComponent;
    @Output() geschaeftsartChangedEvent: EventEmitter<number> = new EventEmitter<number>();
    searchFormGroup: FormGroup;
    geschaeftsartOptions: DropdownOption[];
    sachstandOptions: DropdownOption[];
    private readonly actionsMap = {};

    constructor(
        public handler: ArbeitgeberSearchHandlerService,
        public reactiveForms: ArbeitgeberSearchReactiveFormsService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService
    ) {
        super();
        this.searchFormGroup = reactiveForms.searchForm;
        this.actionsMap[GeschaeftArbeitgeberSuchenAction.INIT] = () => this.setDefaultValues();
        this.actionsMap[GeschaeftArbeitgeberSuchenAction.CACHE] = () => this.mapDataFromCache();
    }

    ngOnInit(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.geschaeftsartOptions.sort(this.geschaeftsartSort());
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data.currentValue) {
            this.mapData();
        }
    }

    ngAfterViewInit(): void {
        if (this.data && !this.data.dto) {
            this.setDefaultValues();
        }
    }

    mapData(): void {
        if (this.data) {
            this.mapDropdowns();
            if (this.actionsMap.hasOwnProperty(this.data.action)) {
                this.actionsMap[this.data.action]();
            }
        }
    }

    onChangeGeschaeftsartId(geschaeftsartId: any): void {
        this.geschaeftsartChangedEvent.emit(geschaeftsartId);
    }

    onSelectFallbearbeiter(value: any): void {
        if (value === '') {
            this.resetFallbearbeiterId();
            return;
        }
        if (!!value) {
            this.checkboxChecking(true);
            this.setBenutzerstellenIdValue(value);
        }
    }

    onChangeFallbearbeiterInput(event: any): void {
        const value = event && event.target ? event.target.value : event;
        if (value === '') {
            this.resetFallbearbeiterId();
            return;
        }
        if (!value || event === -1) {
            this.checkboxChecking(false);
            this.setBenutzerstellenIdValue(null);
            if (this.fallbearbeiter) {
                this.fallbearbeiter.benutzerDetail = null;
            }
        } else if (value.benuStelleCode) {
            this.checkboxChecking(true);
            this.setBenutzerstellenIdValue(value);
        }
    }

    openBenutzerstelleSuche(benutzerstellenSuche: any): void {
        this.facade.openModalFensterService.openXLModal(benutzerstellenSuche);
    }

    reset(): void {
        if (this.reactiveForms.searchForm.dirty) {
            this.facade.fehlermeldungenService.closeMessage();
            this.reactiveForms.searchForm.reset();
            this.reactiveForms.setDefaultValues(() => this.fallbearbeiter.appendCurrentUser());
        }
    }

    updateBenutzerstelle(event: any): void {
        if (!event) {
            return;
        }
        this.reactiveForms.searchForm.get('benutzerstellenId').setValue({
            code: event.id,
            benutzerstelleId: event.benutzerstelleObj ? event.benutzerstelleObj.benutzerstelleId : -1
        });
    }

    private mapDropdowns(): void {
        this.geschaeftsartOptions = this.facade.formUtilsService.mapDropdown(this.data.geschaeftsartOptions).sort(this.geschaeftsartSort());
        this.sachstandOptions = this.facade.formUtilsService.mapDropdown(this.data.sachstandOptions);
    }

    private mapDataFromCache(): void {
        const cachedDto = this.data.cache.fields.dto;
        const form = this.handler.mapToForm(cachedDto);
        this.searchFormGroup.patchValue(form);
        const patchDate = (control: string, date: Date) => {
            if (date) {
                this.searchFormGroup.get(control).setValue(new Date(date));
            }
        };
        patchDate('geschaeftsterminVon', cachedDto.dateFrom);
        patchDate('geschaeftsterminBis', cachedDto.dateUntil);
        patchDate('erstelltAmVon', cachedDto.dateErfasstFrom);
        patchDate('erstelltAmBis', cachedDto.dateErfasstUntil);
        this.searchFormGroup.patchValue({ fallbearbeiterId: this.data.cache.fields.fallbearbeiterId });
        this.searchFormGroup.patchValue({ benutzerstellenId: this.data.cache.fields.benutzerstellenId });
    }

    private setDefaultValues(): void {
        this.reactiveForms.setDefaultValues(() => this.fallbearbeiter.appendCurrentUser());
    }

    private resetFallbearbeiterId(): void {
        this.reactiveForms.searchForm.get('fallbearbeiterId').reset();
    }

    private setBenutzerstellenIdValue(value: any): void {
        const val = value
            ? {
                  code: value.benuStelleCode,
                  benutzerstelleId: value.benutzerstelleId ? value.benutzerstelleId : null
              }
            : null;
        this.reactiveForms.searchForm.get('benutzerstellenId').setValue(val);
    }

    private geschaeftsartSort(): any {
        return (g: DropdownOption, h: DropdownOption) => {
            switch (this.facade.translateService.currentLang) {
                case 'fr':
                    return g.labelFr.localeCompare(h.labelFr);
                case 'it':
                    return g.labelIt.localeCompare(h.labelIt);
                default:
                    return g.labelDe.localeCompare(h.labelDe);
            }
        };
    }

    private checkboxChecking(check: boolean): void {
        if (this.data && !this.data.cache) {
            this.reactiveForms.searchForm.get('isBearbeiter').setValue(check);
            this.reactiveForms.searchForm.get('isFreigeber').setValue(check);
        }
    }
}
