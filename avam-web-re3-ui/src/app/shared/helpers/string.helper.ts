/**
 * StringUtils
 */
export class StringHelper {
    static replaceAll(str: string, search: string, replacement: string): string {
        if (!str) {
            return str;
        }

        while (str.indexOf(search) > -1) {
            str = str.replace(search, replacement);
        }

        return str;
    }

    static isNotEmpty(str: string): boolean {
        return str !== undefined && str !== null && str.length > 0;
    }

    static isBlank(str: string): boolean {
        return !str || str.trim().length === 0;
    }

    static stringFormatter(text: string, args: string[]) {
        return text.replace(/{(\d+)}/g, (match, number) => {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    }
}
