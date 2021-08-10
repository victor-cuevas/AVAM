import { AutosuggestBase } from './autosuggest-base';

class Dummy extends AutosuggestBase {
    constructor() {
        super();
    }
}

describe('AutosuggestBase', () => {
    let component: Dummy;

    beforeEach(() => {
        component = new Dummy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should clear model', () => {
        spyOn(component, 'emmitWriteEvent');

        component.model = 'Test';
        component.onClear();

        expect(component.emmitWriteEvent).toBeCalledWith(null);
        expect(component.model).toEqual('');
    });

    it('should emit selected item', done => {
        const testData = { staatId: 1, code: 'Aaa', iso2Code: 'BBB', iso3Code: 'Cccc', nameDe: 'Aaaaa', nameFr: 'AAFr', nameIt: 'AAIt' };
        component.selectItem.subscribe(g => {
            expect(g).toEqual(testData);
            done();
        });
        component.emmitSelectItem(testData);
    });

    it('should test keyUp any key', () => {
        let testEvent = { key: 'TestKey', target: { value: 'Test' } };
        spyOn(component, 'emmitWriteEvent');
        component.onKeyup(testEvent);
        expect(component.emmitWriteEvent).toBeCalledWith('Test');
    });

    it('should test keyUp with enter', () => {
        let testEvent = { key: 'Enter', target: { value: 'Test' } };
        spyOn(component, 'emmitWriteEvent');
        component.onKeyup(testEvent);
        expect(component.emmitWriteEvent).not.toBeCalled();
    });

    it('should test keyUp with return null', () => {
        let testEvent = { key: 'TestKey', target: {} };
        spyOn(component, 'emmitWriteEvent');
        component.onKeyup(testEvent);
        expect(component.emmitWriteEvent).toBeCalledWith(null);
    });

    it('should test emmitSelectEvent', () => {
        let testEvent = { test: 'test' };
        spyOn(component.selectItem, 'emit');
        component.emmitSelectItem(testEvent);
        expect(component.selectItem.emit).toBeCalledWith(testEvent);
    });

    it('should test emmitWriteEvent', () => {
        let testEvent = { test: 'test' };
        spyOn(component.writeItem, 'emit');
        component.emmitWriteEvent(testEvent);
        expect(component.writeItem.emit).toBeCalledWith(testEvent);
    });
});
