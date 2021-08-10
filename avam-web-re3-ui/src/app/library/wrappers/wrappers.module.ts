import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AvamLabelCalendarModule } from './form/avam-label-calendar/avam-label-calendar.module';
import { AvamLabelInputModule } from './form/avam-label-input/avam-label-input.module';
import { AvamLabelDropdownModule } from './form/avam-label-dropdown/avam-label-dropdown.module';
import { AvamSpracheAutosuggestModule } from './form/autosuggests/avam-sprache-autosuggest/avam-sprache-autosuggest.module';
import { AvamComponentsTableModule } from './form/avam-components-table/avam-components-table.module';
import { WrappersBaseComponent } from './wrappers-base';
import { AvamBerufAutosuggestModule } from './form/autosuggests/avam-beruf-autosuggest/avam-beruf-autosuggest.module';
import { AvamBrancheAutosuggestModule } from './form/autosuggests/avam-branche-autosuggest/avam-branche-autosuggest.module';
import { AvamBrancheDynamicAutosuggestModule } from './form/autosuggests/avam-branche-dynamic-autosuggest/avam-branche-dynamic-autosuggest.module';
import { AvamBerufsgruppeAutosuggestModule } from './form/autosuggests/avam-berufsgruppe-autosuggest/avam-berufsgruppe-autosuggest.module';
import { AvamArbeitsorteAutosuggestModule } from './form/autosuggests/avam-arbeitsorte-autosuggest/avam-arbeitsorte-autosuggest.module';
import { AvamBenutzerstelleAutosuggestModule } from './form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.module';
import { AvamMultiselectModule } from './form/avam-multiselect/avam-multiselect.module';
import { AvamMultiselectTreeModule } from './form/avam-multiselect-tree/avam-multiselect-tree.module';
import { AvamGemeindeAutosuggestModule } from './form/autosuggests/avam-gemeinde-autosuggest/avam-gemeinde-autosuggest.module';
import { AvamGemeindeTwoFieldsAutosuggestModule } from './form/autosuggests/avam-gemeinde-two-fields-autosuggest/avam-gemeinde-two-fields-autosuggest.module';
import { AvamPersonalberaterAutosuggestModule } from './form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.module';
import { AvamPlzAutosuggestModule } from './form/autosuggests/avam-plz-autosuggest/avam-plz-autosuggest.module';
import { AvamGenericTableModule } from './data/avam-generic-table/avam-generic-table.module';
import { AvamGenericTreeTableModule } from './data/avam-generic-tree-table/avam-generic-tree-table.module';
import { AvamLabelCheckboxModule } from './form/avam-label-checkbox/avam-label-checkbox.module';
import { AvamCurrencyInputModule } from './form/avam-currency-input/avam-currency-input.module';
import { AvamButtonGroupComponentModule } from './form/avam-button-group/avam-button-group.module';
import { AvamPrependCalendarModule } from './form/avam-prepend-calendar/avam-prepend-calendar.module';
import { AvamPrependDropdownModule } from './form/avam-prepend-dropdown/avam-prepend-dropdown.module';
import { AvamPrependNumericInputModule } from './form/avam-prepend-input/avam-prepend-numeric-input.module';
import { AvamDynamicInputModule } from './form/avam-dynamic-input/avam-dynamic-input.module';
import { DateRangePickerModule } from './form/date-range-picker/date-range-picker.module';
import { AvamRangeValuedWrapperInputModule } from './form/avam-range-valued-wrapper/avam-range-valued-wrapper.module';
import { AvamLandAutosuggestModule } from './form/autosuggests/avam-land-autosuggest/avam-land-autosuggest.module';
import { AvamGenericDynamicAutosuggestModule } from './form/autosuggests/avam-generic-dynamic-autosuggest/avam-generic-dynamic-autosuggest.module';
import { AvamInputSliderComponentModule } from './form/avam-input-slider/avam-input-slider.module';
import { BerufsgruppeDynamicAutosuggestComponentModule } from './form/autosuggests/berufsgruppe-dynamic-autosuggest/berufsgruppe-dynamic-autosuggest.module';
import { AvamUnternehmenAutosuggestComponentModule } from './form/autosuggests/avam-unternehmen-autosuggest/avam-unternehmen-autosuggest.module';
import { AvamLabelPercentageInputModule } from './form/avam-label-percentage-input/avam-label-percentage-input.module';
import { AvamRangeNumericInputModule } from './form/avam-range-numeric-input/avam-range-numeric-input.module';
import { PersonalberaterDynamicAutosuggestModule } from './form/autosuggests/personalberater-dynamic-autosuggest/personalberater-dynamic-autosuggest.module';
import { AvamUnternehmenDynamicAutosuggestModule } from './form/autosuggests/avam-unternehmen-dynamic-autosuggest/avam-unternehmen-dynamic-autosuggest.module';
import { AvamZertifikateDynamicArrayModule } from './form/avam-zertifikate-dynamic-array/avam-zertifikate-dynamic-array.module';
import { AvamDropdownDatepickerComponenttModule } from '@app/library/wrappers/form/avam-dropdown-datepicker/avam-dropdown-datepicker.module';
import { AvamBeurteilungscriteriumSelectModule } from './form/avam-beurteilungscriterium-select/avam-beurteilungscriterium-select.module';

@NgModule({
    declarations: [WrappersBaseComponent],
    exports: [
        AvamLabelCalendarModule,
        AvamLabelInputModule,
        AvamLabelDropdownModule,
        AvamSpracheAutosuggestModule,
        AvamComponentsTableModule,
        AvamBerufAutosuggestModule,
        AvamBrancheAutosuggestModule,
        AvamBrancheDynamicAutosuggestModule,
        AvamBerufsgruppeAutosuggestModule,
        AvamBenutzerstelleAutosuggestModule,
        AvamArbeitsorteAutosuggestModule,
        AvamGemeindeAutosuggestModule,
        AvamGemeindeTwoFieldsAutosuggestModule,
        AvamPersonalberaterAutosuggestModule,
        AvamPlzAutosuggestModule,
        AvamMultiselectModule,
        AvamMultiselectTreeModule,
        AvamGenericTableModule,
        AvamGenericTreeTableModule,
        AvamLabelCheckboxModule,
        AvamCurrencyInputModule,
        AvamButtonGroupComponentModule,
        AvamPrependCalendarModule,
        AvamPrependDropdownModule,
        AvamPrependNumericInputModule,
        AvamDynamicInputModule,
        DateRangePickerModule,
        AvamRangeValuedWrapperInputModule,
        AvamLandAutosuggestModule,
        AvamGenericDynamicAutosuggestModule,
        AvamInputSliderComponentModule,
        BerufsgruppeDynamicAutosuggestComponentModule,
        AvamUnternehmenAutosuggestComponentModule,
        AvamLabelPercentageInputModule,
        AvamRangeNumericInputModule,
        PersonalberaterDynamicAutosuggestModule,
        AvamUnternehmenDynamicAutosuggestModule,
        AvamZertifikateDynamicArrayModule,
        AvamDropdownDatepickerComponenttModule,
        AvamBeurteilungscriteriumSelectModule
    ],
    imports: [
        CommonModule,
        AvamLabelCalendarModule,
        AvamLabelInputModule,
        AvamLabelDropdownModule,
        AvamSpracheAutosuggestModule,
        AvamComponentsTableModule,
        AvamBerufAutosuggestModule,
        AvamBrancheAutosuggestModule,
        AvamBrancheDynamicAutosuggestModule,
        AvamBerufsgruppeAutosuggestModule,
        AvamBenutzerstelleAutosuggestModule,
        AvamGemeindeAutosuggestModule,
        AvamArbeitsorteAutosuggestModule,
        AvamGemeindeTwoFieldsAutosuggestModule,
        AvamPersonalberaterAutosuggestModule,
        AvamPlzAutosuggestModule,
        AvamMultiselectModule,
        AvamMultiselectTreeModule,
        AvamGenericTableModule,
        AvamGenericTreeTableModule,
        AvamLabelCheckboxModule,
        AvamCurrencyInputModule,
        AvamButtonGroupComponentModule,
        AvamPrependCalendarModule,
        AvamPrependDropdownModule,
        AvamPrependNumericInputModule,
        AvamDynamicInputModule,
        DateRangePickerModule,
        AvamRangeValuedWrapperInputModule,
        AvamLandAutosuggestModule,
        AvamGenericDynamicAutosuggestModule,
        AvamInputSliderComponentModule,
        BerufsgruppeDynamicAutosuggestComponentModule,
        AvamUnternehmenAutosuggestComponentModule,
        AvamLabelPercentageInputModule,
        AvamRangeNumericInputModule,
        PersonalberaterDynamicAutosuggestModule,
        AvamUnternehmenDynamicAutosuggestModule,
        AvamZertifikateDynamicArrayModule,
        AvamDropdownDatepickerComponenttModule,
        AvamBeurteilungscriteriumSelectModule
    ],
    providers: []
})
export class WrappersModule {
    constructor() {}
}
