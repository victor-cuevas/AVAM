const NON_DIGITS_REG_EX: RegExp = /\D/g;
const WHITE_SPACE_REG_EX: RegExp = /\s/g;
const REPLACE_VALUE = '';

export function parseNumber(formNumber: number | string): number {
    let num: number = null;
    if (typeof formNumber === 'number') {
        num = Number(formNumber);
    } else if (typeof formNumber === 'string') {
        const digits = removeNonDigits(formNumber as string);
        if (digits && digits !== '') {
            num = Number(digits);
        }
    }
    return num;
}

export function removeNonDigits(formNumber: string) {
    return formNumber.replace(NON_DIGITS_REG_EX, REPLACE_VALUE).replace(WHITE_SPACE_REG_EX, REPLACE_VALUE);
}
