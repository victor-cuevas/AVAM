import { PipeTransform, Pipe } from '@angular/core';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';

/**
 * This custom pipe returns true if the button is contained in the buttons-Array.
 */

@Pipe({ name: 'commonButtonDisplayPipe' })
export class CommonButtonDisplayPipe implements PipeTransform {
    constructor() {}

    transform(buttons: BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum[], button: BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum): boolean {
        if (buttons) {
            return buttons.some(btn => btn === button);
        }

        return false;
    }
}
