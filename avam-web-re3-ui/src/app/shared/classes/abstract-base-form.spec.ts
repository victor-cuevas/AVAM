import { AbstractBaseForm } from '@shared/classes/abstract-base-form';

class Dummy extends AbstractBaseForm {
    constructor(modalMock, fehlermeldungenServiceMock) {
        super('dummy', modalMock, null, null, null, fehlermeldungenServiceMock);
    }

    getData(): void {}

    ngOnInit(): void {}

    reset(): void {}

    save(shouldFinish?: boolean): void {}
}

describe('AbstractBaseForm', () => {
    /**
     * return a NgbModalRef with a valid promise 'result'
     */
    const modalServiceMock = {
        open() {
            return {
                result: new Promise(function(resolve, reject) {
                    resolve('test');
                })
            };
        }
    };

    const fehlermeldungenServiceMock = {
        closeMessage() {}
    };

    let testee: Dummy;

    beforeEach(() => {
        testee = new Dummy(modalServiceMock, fehlermeldungenServiceMock);
    });

    it('getCodeIdByCode', () => {
        // arrange
        const testID = 2200;
        const options = [{ textDe: 'abgelaufen', code: '2', codeId: testID }];
        const lookupCode = 2;

        // act
        let result = AbstractBaseForm.getCodeIdByCode(options, lookupCode);

        // assert
        expect(result).toBe(testID);
    });

    it('hasDangerWarning', () => {
        expect(AbstractBaseForm.hasDangerWarning(null)).toBeFalsy();

        const warn = [{ key: 'DANGER' }];
        expect(AbstractBaseForm.hasDangerWarning(warn)).toBeTruthy();
    });

    it('openModalCloseFehler', () => {
        spyOn(fehlermeldungenServiceMock, 'closeMessage').and.callThrough();

        // act
        testee.openModalCloseFehler(null);

        // assert
        expect(fehlermeldungenServiceMock.closeMessage).toBeCalledTimes(1);
    });

    /**
     * if changing this test: please check screen abmeldung: 'abmelden confirm' AND arbeitgeber
     */
    it('openModal', () => {
        // arrange
        spyOn(modalServiceMock, 'open').and.callThrough();

        // act
        testee.openModal('contentXy');

        // assert
        expect(modalServiceMock.open).toBeCalledWith('contentXy', {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static'
        });
    });
});
