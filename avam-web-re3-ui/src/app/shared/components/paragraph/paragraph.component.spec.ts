import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ParagraphComponent } from './paragraph.component';
import { MockTranslatePipe } from '../../../../../tests/helpers';

describe('ParagraphComponent', () => {
    let component: ParagraphComponent;
    let fixture: ComponentFixture<ParagraphComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ParagraphComponent, MockTranslatePipe],
            imports: [NgbModule],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ParagraphComponent);
        component = fixture.componentInstance;
        component.id = 'testId';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should throw IdError', () => {
        component.id = undefined;
        fixture.detectChanges();
        expect(function () { component.ngOnInit() }).toThrow();
    });

    it('getvalue should return string when ngbDate is passed', () => {
        component.value = new NgbDate(2018, 11, 19);
        expect(component.getValue()).toEqual('19.11.2018');
    });

    it('getValue should return string when string is passed', () => {
        component.value = '09.01.2018';
        expect(component.getValue()).toEqual(component.value);
    });
});
