import { CodeDTO } from '@dtos/codeDTO';
import { SessionDTO } from '@dtos/sessionDTO';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { FormUtilsService } from '@app/shared';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { BewirtschaftungKursGrunddatenData } from './bew-kurs-grunddaten-form.component';
import { DurchfuehrungskriteriumCodeEnum } from '@app/shared/enums/domain-code/durchfuehrungskriterium-code.enum';

@Injectable()
export class BewKursGrunddatenReactiveFormsService {
    grunddatenForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService) {
        this.createForm();
    }

    createForm() {
        this.grunddatenForm = this.formBuilder.group(
            {
                erfassungssprache: null,
                titelDe: '',
                titelFr: '',
                titelIt: '',
                ergaenzendeAngabenDe: '',
                ergaenzendeAngabenFr: '',
                ergaenzendeAngabenIt: '',
                durchfuehrungVon: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                durchfuehrungBis: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                stichtagAm: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                eintrittsfristBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                anzahlKurstage: [null, [Validators.required, NumberValidator.val131, NumberValidator.isPositiveInteger]],
                anzahlLektionen: [null, [NumberValidator.val131, NumberValidator.isPositiveInteger]],
                verfuegbarkeit: null,
                vormittags: this.createFormArray(),
                nachmittags: this.createFormArray(),
                kurszeitenDe: '',
                kurszeitenFr: '',
                kurszeitenIt: '',
                durchfuehrungskriterium: null,
                vorstellungsgespraechTest: null,
                status: null,
                inPlanungAkquisitionSichtbar: null,
                imAngebotSichtbar: null,
                lamErstelltEntscheide: null,
                teilnehmerMin: [null, [Validators.required, NumberValidator.isPositiveInteger, NumberValidator.val306]],
                teilnehmerMax: [null, [Validators.required, NumberValidator.val131, NumberValidator.isPositiveInteger]],
                ueberbuchungMax: [null, [NumberValidator.val131, NumberValidator.isPositiveInteger]],
                wartelisteplaetze: [null, [NumberValidator.val131, NumberValidator.isPositiveInteger]]
            },
            {
                validators: [
                    DateValidator.rangeBetweenDates('durchfuehrungVon', 'durchfuehrungBis', 'val201'),
                    DateValidator.val307('stichtagAm', 'durchfuehrungVon', 'val307'),
                    AmmValidators.atLeastOneRequired('titelDe', 'titelFr', 'titelIt'),
                    DateValidator.val186('durchfuehrungVon', 'durchfuehrungBis', 'anzahlKurstage'),
                    NumberValidator.checkDaysMoreThanLessons('anzahlKurstage', 'anzahlLektionen'),
                    NumberValidator.compareTwoNumbers('teilnehmerMax', 'teilnehmerMin', 'val305'),
                    DateValidator.checkDateWithinRange('eintrittsfristBis', 'durchfuehrungVon', 'durchfuehrungBis', 'val282')
                ]
            }
        );
    }

    setValidatorsOnDurchfuehrungVonBis(dto: SessionDTO) {
        const gueltigVonMassnahme = dto.massnahmeObject.gueltigVon;
        const gueltigBisMassnahme = dto.massnahmeObject.gueltigBis;

        this.grunddatenForm
            .get('durchfuehrungVon')
            .setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(gueltigVonMassnahme, gueltigBisMassnahme, 'val277')
            ]);

        this.grunddatenForm
            .get('durchfuehrungBis')
            .setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(gueltigVonMassnahme, gueltigBisMassnahme, 'val277')
            ]);
    }

    setRequiredWeekdays(verfuegbarkeitOptions: CodeDTO[]) {
        this.grunddatenForm.setValidators([
            this.grunddatenForm.validator,
            AmmValidators.requiredWeekDays(
                'vormittags',
                'nachmittags',
                'verfuegbarkeit',
                this.formUtils.getCodeIdByCode(verfuegbarkeitOptions, VerfuegbarkeitAMMCodeEnum.WOCHENPLAN)
            )
        ]);
    }

    setDefaultValues(data: BewirtschaftungKursGrunddatenData) {
        // Custom logic may be required when Ausloeser B and C are implemented, see SUC-0320-014_Kurs erfassen
        const defaultCodeIdDurchfkriterium = this.formUtils.getCodeIdByCode(data.durchfuehrungskriteriumOptions, DurchfuehrungskriteriumCodeEnum.AUFGRUND_BUCHUNGSZAHL);
        this.grunddatenForm.controls.durchfuehrungskriterium.setValue(+defaultCodeIdDurchfkriterium);
    }

    private createFormArray() {
        return new FormArray([
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false)
        ]);
    }
}
