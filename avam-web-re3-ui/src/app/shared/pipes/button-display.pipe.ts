import { PipeTransform, Pipe } from '@angular/core';

/**
 * This custom pipe returns true if the button is contained in the buttons-Array.
 * The Pipe uses Subject<any> for the buttons and number for the button (btnCode)
 */

@Pipe({ name: 'buttonDisplayPipe' })
export class ButtonDisplayPipe implements PipeTransform {
    constructor() {}

    transform(buttons: any, btnCodes: number[]): boolean {
        if (buttons) {
            return buttons.find(button => btnCodes.some(btnCode => btnCode === button));
        }

        return false;
    }
}
