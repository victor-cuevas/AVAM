import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RangeSliderValidator } from '@app/shared/validators/range-slider-validator';
import { NumberValidator } from '@app/shared/validators/number-validator';

@Injectable()
export class BewBeschreibungReactiveFormsService {
    beschreibungForm: FormGroup;
    defaultMinAge = 16;
    defaultMaxAge = 65;

    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }

    createForm() {
        this.beschreibungForm = this.formBuilder.group(
            {
                erfassungssprache: null,
                inhaltDe: '',
                inhaltFr: '',
                inhaltIt: '',
                methodikDe: '',
                methodikFr: '',
                methodikIt: '',
                massnahmenzielDe: '',
                massnahmenzielFr: '',
                massnahmenzielIt: '',
                abschlussDe: '',
                abschlussFr: '',
                abschlussIt: '',
                sonstigesDe: '',
                sonstigesFr: '',
                sonstigesIt: '',
                sprache: null,
                muendlich: null,
                schriftlich: null,
                ausbildungsniveau: null,
                rangeSlider: this.formBuilder.group({
                    altersgruppeVon: [null, [NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween1and99]],
                    altersgruppeBis: [null, [NumberValidator.isPositiveInteger, NumberValidator.checkValueBetween1and99]],
                    slider: ['']
                }),
                berufsgruppen: this.formBuilder.array([]),
                funktionen: null,
                branchen: this.formBuilder.array([]),
                beurteilungskriterien: null
            },
            {
                validator: [RangeSliderValidator.areValuesInRangeBetween('rangeSlider', 'altersgruppeVon', 'altersgruppeBis', 'slider', 'val254')]
            }
        );
    }
}
