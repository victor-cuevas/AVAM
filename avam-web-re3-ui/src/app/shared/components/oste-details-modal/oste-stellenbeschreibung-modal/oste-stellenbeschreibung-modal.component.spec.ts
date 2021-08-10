import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsteStellenbeschreibungModalComponent } from './oste-stellenbeschreibung-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockTranslatePipe } from '@test_helpers/';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('OsteStellenbeschreibungModalComponent', () => {
    let component: OsteStellenbeschreibungModalComponent;
    let fixture: ComponentFixture<OsteStellenbeschreibungModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OsteStellenbeschreibungModalComponent, MockTranslatePipe],
            providers: [NgbActiveModal],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OsteStellenbeschreibungModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
