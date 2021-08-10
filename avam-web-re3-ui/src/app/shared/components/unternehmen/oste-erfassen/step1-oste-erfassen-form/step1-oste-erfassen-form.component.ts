import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subject } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { takeUntil } from 'rxjs/operators';
import { CodeDTO } from '@dtos/codeDTO';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormUtilsService } from '@app/shared';
import { CheckboxValidator } from '@shared/validators/checkbox-validator';
import { DateValidator } from '@shared/validators/date-validator';
import { NumberValidator } from '@shared/validators/number-validator';
import { RangeSliderValidator } from '@shared/validators/range-slider-validator';
import { OsteDTO } from '@dtos/osteDTO';
import { FacadeService } from '@shared/services/facade.service';
import { AlertChannelEnum } from '@shared/components/alert/alert-channel.enum';

@Component({
    selector: 'avam-step1-oste-erfassen-form',
    templateUrl: './step1-oste-erfassen-form.component.html',
    styleUrls: ['./step1-oste-erfassen-form.component.scss']
})
export class Step1OsteErfassenFormComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('stellenbezeichnungModal') stellenbezeichnungModal: ElementRef;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input() activeFields = true;
    dataLoaded = new Subject<void>();
    alertChannel = AlertChannelEnum;

    form: FormGroup;
    modalForm: FormGroup;
    fristTypMappedCodes: any[] = [];
    fristTypCodeDTOs: CodeDTO[];
    waehungMappedCodes: any[] = [];
    waehungCodeDTOs: CodeDTO[];
    lohnArtMappedCodes: any[] = [];
    lohnArtCodeDTOs: CodeDTO[];
    arbeitsFormMappedCodes: any[] = [];
    arbeitsFormCodeDTOs: CodeDTO[];
    unternehmenDTO: UnternehmenResponseDTO;

    private BEFRISTET_MEHR_ALS_14_TAGE = 'BEFR';

    constructor(private fb: FormBuilder, private modalService: NgbModal, private stesDataService: StesDataRestService, private facadeService: FacadeService) {
        super();
    }

    ngOnInit() {
        this.initForm();
    }

    ngAfterViewInit() {
        this.loadData();
        this.form.controls.stellenbezeichnung.updateValueAndValidity();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    openModal() {
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.NEST_MODAL);
        this.modalService.open(this.stellenbezeichnungModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-md', backdrop: 'static' });
        this.modalForm.reset({
            stellenbeschreibung: this.form.controls.stellenbeschreibung.value
        });
    }

    closeModal() {
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.NEST_MODAL);
        this.modalForm.reset();
        this.modalService.dismissAll();
    }

    updateStellenbeschreibung() {
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.NEST_MODAL);
        if (this.modalForm.valid) {
            this.form.controls.stellenbeschreibung.setValue(this.modalForm.controls.stellenbeschreibung.value);
            this.form.updateValueAndValidity();
            this.closeModal();
        } else {
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger', AlertChannelEnum.NEST_MODAL);
        }
    }

    displayFristDauer(): boolean {
        return (
            this.fristTypCodeDTOs &&
            this.form.controls.fristTyp.value &&
            +this.form.controls.fristTyp.value === +this.facadeService.formUtilsService.getCodeIdByCode(this.fristTypCodeDTOs, this.BEFRISTET_MEHR_ALS_14_TAGE)
        );
    }

    mapToForm(oste: OsteDTO) {
        this.unternehmenDTO = oste;
        const plz = {
            postleitzahl: oste.arbeitsortPlzDto ? oste.arbeitsortPlzDto : oste.arbeitsortAuslandPlz || '',
            ort: oste.arbeitsortPlzDto ? oste.arbeitsortPlzDto : oste.arbeitsortAuslandOrt || ''
        };
        this.form.patchValue({
            stellenbeschreibung: oste.beschreibung,
            stellenbezeichnung: oste.bezeichnung,
            fristTyp: oste.fristTypId,
            antritt: {
                abSofort: oste.abSofort,
                nachVereinbarung: oste.nachVereinbarung,
                ab: !!oste.stellenAntritt
            },
            stellenAntritt: this.facadeService.formUtilsService.parseDate(oste.stellenAntritt),
            fristDauer: this.facadeService.formUtilsService.parseDate(oste.vertragsDauer),
            arbeitsform: this.setMultiselectOptionsArbeitsForm(oste.arbeitsformList.map(e => e.arbeitsformId)),
            arbeitszeit: oste.arbeitszeitStd,
            ergaenzendeangaben: oste.detailangaben,
            lohnart: oste.lohnartId,
            waehrung: oste.waehrungId,
            lohnmin: oste.lohnMin,
            lohnmax: oste.lohnMax,
            zusatztext: oste.arbeitsortText,
            handicap: oste.behinderte,
            jobSharing: oste.jobSharing,
            land: oste.arbeitsortStaatDto,
            plz: {
                postleitzahl: oste.arbeitsortPlzDto ? oste.arbeitsortPlzDto : oste.arbeitsortAuslandPlz || '',
                ort: oste.arbeitsortPlzDto ? oste.arbeitsortPlzDto : oste.arbeitsortAuslandOrt || ''
            }
        });
        setTimeout(() => {
            this.form.controls.plz.patchValue(plz);
            this.form.controls.land.patchValue(oste.arbeitsortStaatDto);
            this.form.controls.beschaeftigungsgrad.patchValue({
                pensumVon: oste.pensumVon || 100,
                pensumBis: oste.pensumBis || 100
            });
        }, 500);
    }

    mapMultiselect(arbeitsform: CodeDTO) {
        return {
            id: arbeitsform.codeId,
            textDe: arbeitsform.kurzTextDe,
            textIt: arbeitsform.kurzTextIt,
            textFr: arbeitsform.kurzTextFr,
            value: false
        };
    }

    private initForm() {
        this.form = this.fb.group(
            {
                stellenbezeichnung: [null, Validators.required],
                stellenbeschreibung: null,
                antritt: this.fb.group(
                    {
                        abSofort: true,
                        nachVereinbarung: false,
                        ab: false
                    },
                    { validator: CheckboxValidator.required(1) }
                ),
                stellenAntritt: null,
                fristTyp: null,
                fristDauer: null,
                beschaeftigungsgrad: this.fb.group({
                    slider: [''],
                    pensumVon: [null, [Validators.required, NumberValidator.isPositiveInteger, NumberValidator.isValidPercentage]],
                    pensumBis: [null, [Validators.required, NumberValidator.isPositiveInteger, NumberValidator.isValidPercentage]]
                }),
                arbeitszeit: [42, [NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween1and99]],
                arbeitsform: null,
                ergaenzendeangaben: null,
                lohnart: null,
                waehrung: null,
                lohnmin: null,
                lohnmax: null,
                land: [null, Validators.required],
                plz: this.fb.group({
                    postleitzahl: [null, Validators.required],
                    ort: [null, Validators.required]
                }),
                zusatztext: null,
                handicap: false,
                jobSharing: false
            },
            {
                validator: [
                    DateValidator.rangeBetweenDates('stellenAntritt', 'fristDauer', 'val317', true, false),
                    RangeSliderValidator.areValuesInRangeBetween('beschaeftigungsgrad', 'pensumVon', 'pensumBis', 'slider', 'val239')
                ]
            }
        );

        this.modalForm = this.fb.group({
            stellenbeschreibung: [null, Validators.maxLength(10000)]
        });

        this.setDynamicValidations();
    }

    private setDynamicValidations() {
        this.form.controls.antritt.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            const stellenAntritt = this.form.controls.stellenAntritt;
            const defaultValidators = [DateValidator.dateFormatNgx, DateValidator.dateValidNgx];
            stellenAntritt.setValidators((this.form.controls.antritt as FormGroup).controls.ab.value ? [...defaultValidators, Validators.required] : defaultValidators);
            stellenAntritt.updateValueAndValidity();
        });

        this.form.controls.fristTyp.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            const fristDauer = this.form.controls.fristDauer;
            const defaultValidators = [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.val083];
            if (this.displayFristDauer()) {
                fristDauer.setValidators([...defaultValidators, Validators.required]);
            } else {
                fristDauer.setValidators(defaultValidators);
                fristDauer.setValue(null);
            }
            setTimeout(() => fristDauer.updateValueAndValidity(), 0);
        });
    }

    private loadData() {
        forkJoin(
            this.stesDataService.getCode(DomainEnum.OSTE_FRIST_TYP),
            this.stesDataService.getCode(DomainEnum.WAEHRUNG),
            this.stesDataService.getCode(DomainEnum.LOHNART),
            this.stesDataService.getCode(DomainEnum.ARBEITSFORM)
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([fristTypResponse, waehungResponse, lohnArtResponse, arbeitsFormResponse]) => {
                if (fristTypResponse.length) {
                    this.fristTypCodeDTOs = fristTypResponse;
                    this.fristTypMappedCodes = this.facadeService.formUtilsService.mapDropdownKurztext(this.fristTypCodeDTOs);
                }
                if (waehungResponse.length) {
                    this.waehungCodeDTOs = waehungResponse;
                    this.waehungMappedCodes = this.facadeService.formUtilsService.mapDropdownKurztext(this.waehungCodeDTOs);
                }
                if (lohnArtResponse.length) {
                    this.lohnArtCodeDTOs = lohnArtResponse;
                    this.lohnArtMappedCodes = this.facadeService.formUtilsService.mapDropdownKurztext(this.lohnArtCodeDTOs);
                }
                if (arbeitsFormResponse.length) {
                    this.arbeitsFormCodeDTOs = arbeitsFormResponse;
                    this.arbeitsFormMappedCodes = this.arbeitsFormCodeDTOs.map(this.mapMultiselect);
                }
                this.dataLoaded.next();
                this.dataLoaded.complete();
            });
    }

    private setMultiselectOptionsArbeitsForm(arbeitsformList: Array<number>) {
        this.arbeitsFormMappedCodes.forEach(element => {
            element.value = false;
            arbeitsformList.forEach(el => {
                if (el === element.id) {
                    element.value = true;
                }
            });
        });
        return this.arbeitsFormMappedCodes;
    }
}
