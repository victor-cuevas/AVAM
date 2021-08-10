import { StringHelper } from '@shared/helpers/string.helper';

describe('StringHelper', () => {
    /**
     * string1.replace does just one replace
     */
    it('replaceAll', () => {
        expect(StringHelper.replaceAll('oho', 'o', 'a')).toEqual('aha');
        expect(StringHelper.replaceAll(null, 'o', 'a')).toBeNull();
    });

    it('isNotEmpty', () => {
        expect(StringHelper.isNotEmpty(' ')).toBeTruthy();
        expect(StringHelper.isNotEmpty(null)).toBeFalsy();
    });

    it('isBlank', () => {
        expect(StringHelper.isBlank(null)).toBeTruthy();
        expect(StringHelper.isBlank(' ')).toBeTruthy();

        expect(StringHelper.isBlank('a')).toBeFalsy();
    });
});
