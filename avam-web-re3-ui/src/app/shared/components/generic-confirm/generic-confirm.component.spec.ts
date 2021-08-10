import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GenericConfirmComponent } from './generic-confirm.component';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { MockTranslatePipe } from '../../../../../tests/helpers';

describe('GenericConfirmComponent', () => {
    let component: GenericConfirmComponent;
    let fixture: ComponentFixture<GenericConfirmComponent>;
    let modalService: NgbModal;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GenericConfirmComponent, MockTranslatePipe],
            imports: [RouterTestingModule],
            providers: [
                {
                    provide: Router
                },
                NgbModal,
                NgbActiveModal
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GenericConfirmComponent);
        component = fixture.componentInstance;
        component.modalElement = {
            close: () => {}
        };
        modalService = TestBed.get(NgbModal);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    xit('primary', () => {
        spyOn(modalService, 'dismissAll');
        component.primaryAction();
        expect(modalService.dismissAll).toHaveBeenCalled();
    });

    xit('secondary', () => {
        spyOn(modalService, 'dismissAll');
        component.secondaryAction();
        expect(modalService.dismissAll).toHaveBeenCalled();
    });
});
