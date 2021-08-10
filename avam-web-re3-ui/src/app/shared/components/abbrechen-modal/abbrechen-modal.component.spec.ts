import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbbrechenModalComponent } from './abbrechen-modal.component';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { MockTranslatePipe } from '../../../../../tests/helpers';
import { AbbrechenModalActionCallback } from '@app/shared/classes/abbrechen-modal-action-dismiss-only-current';
import { AbbrechenModalTexte, AbbrechenText } from '@app/shared/classes/abbrechen-modal-texts';

class RouterMock {
    navigate() {
        return true;
    }
}

describe('AbbrechenModalComponent', () => {
    let component: AbbrechenModalComponent;
    let fixture: ComponentFixture<AbbrechenModalComponent>;
    let modalService: NgbModal;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AbbrechenModalComponent, MockTranslatePipe],
            imports: [RouterTestingModule],
            providers: [
                {
                    provide: Router,
                    useClass: RouterMock
                },
                NgbActiveModal
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AbbrechenModalComponent);
        component = fixture.componentInstance;
        modalService = TestBed.get(NgbModal);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('close', () => {
        const modalControl = { dismiss: () => {}, close: () => {} } as NgbModalRef;
        spyOn(modalControl, 'dismiss');
        component.setModalAction(new AbbrechenModalActionCallback(modalControl));
        component.onCancel();
        expect(modalControl.dismiss).toHaveBeenCalled();
    });

    it('navigateAway', () => {
        const modalControl = { dismiss: () => {}, close: () => {} } as NgbModalRef;
        spyOn(modalControl, 'close');
        component.setModalAction(new AbbrechenModalActionCallback(modalControl));
        component.onOk();
        expect(modalControl.close).toHaveBeenCalled();
    });
});
