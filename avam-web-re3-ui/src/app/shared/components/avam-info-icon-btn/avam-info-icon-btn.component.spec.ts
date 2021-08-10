import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamInfoIconBtnComponent } from './avam-info-icon-btn.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/compiler/src/core';

describe('AvamInfoIconBtnComponent', () => {
    let component: AvamInfoIconBtnComponent;
    let fixture: ComponentFixture<AvamInfoIconBtnComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamInfoIconBtnComponent, NgbPopover],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamInfoIconBtnComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
