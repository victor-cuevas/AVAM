import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replaceQuotes',
    pure: false
})
export class ReplaceQuotesPipe implements PipeTransform {
    private static readonly SINGLE_QUOTE = "'";
    private static readonly REG_EXP_I = new RegExp('&#039;', 'g');
    private static readonly REG_EXP_II = new RegExp('&quot;', 'g');
    transform(str: string): string {
        if (str) {
            return str.replace(ReplaceQuotesPipe.REG_EXP_I, ReplaceQuotesPipe.SINGLE_QUOTE).replace(ReplaceQuotesPipe.REG_EXP_II, ReplaceQuotesPipe.SINGLE_QUOTE);
        }
        return '';
    }
}
