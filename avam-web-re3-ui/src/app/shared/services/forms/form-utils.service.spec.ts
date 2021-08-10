import { TestBed } from '@angular/core/testing';
import { FormUtilsService } from './form-utils.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

describe('FormUtilsService', () => {
    let service: FormUtilsService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.get(FormUtilsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return date', () => {
        const testValue = Date.parse('04 Dec 1995 00:12:00 GMT');
        expect(service.checkDateIfNull(testValue)).toEqual(new NgbDate(1995, 12, 4));
    });

    it('should return null', () => {
        expect(service.checkDateIfNull(null)).toBeNull();
    });

    it('should string transformDateToTimestamps', () => {
        expect(service.transformDateToTimestamps('20.12.2018')).toEqual(new Date(2018, 11, 20).getTime());
    });

    it('should ngbDate transformDateToTimestamps', () => {
        const ngbDate = new NgbDate(2018, 12, 20);
        expect(service.transformDateToTimestamps(ngbDate)).toEqual(new Date(2018, 11, 20).getTime());
    });

    it('transformToStringIfNgbDate should return string when ngbDate is passed', () => {
        const ngbDate = new NgbDate(2018, 11, 19);
        expect(service.transformToStringIfNgbDate(ngbDate)).toEqual('19.11.2018');
    });

    it('transformToStringIfNgbDate should return string when string is passed', () => {
        const testData = '09.01.2018';
        expect(service.transformToStringIfNgbDate(testData)).toEqual(testData);
    });

    it('addColonToTimeString', () => {
        expect(service.addColonToTimeString('1234')).toEqual('12:34');
        expect(service.addColonToTimeString(null)).toEqual(null);
        expect(service.addColonToTimeString('12:34')).toEqual('12:34');
    });
});
