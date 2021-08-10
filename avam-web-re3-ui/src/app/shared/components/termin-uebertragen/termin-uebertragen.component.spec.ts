import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TerminUebertragenComponent } from './termin-uebertragen.component';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { NgbModalStub } from '@stes/pages/details/pages/stes-details-grunddaten/stes-details-grunddaten.component.spec';
import { DbTranslatePipe, ToolboxService } from '@app/shared';
import { SpinnerService } from 'oblique-reactive';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { FormBuilder, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { StesTerminRestService } from '@core/http/stes-termin-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { KontaktErfassenComponent } from '@shared/components/unternehmen/kontaktpflege/kontakte/kontakt-erfassen/kontakt-erfassen.component';
import { UnternehmenTerminRestService } from '@core/http/unternehmen-termin-rest.service';

export class MockNgbModalRef {
    result: Promise<any> = new Promise((resolve, reject) => resolve('x'));
}

xdescribe('TerminUebertragenComponent', () => {
    let component: TerminUebertragenComponent;
    let fixture: ComponentFixture<TerminUebertragenComponent>;
    let modalService: NgbModalStub;
    const mockModalRef: MockNgbModalRef = new MockNgbModalRef();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MockTranslatePipe, TerminUebertragenComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                StesDataRestService,
                StesTerminRestService,
                FormBuilder,
                DbTranslatePipe,
                SpinnerService,
                NgbModal,
                ToolboxService,
                KontaktErfassenComponent,
                UnternehmenTerminRestService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                {
                    provide: NG_VALUE_ACCESSOR,
                    multi: true,
                    useExisting: forwardRef(() => TerminUebertragenComponent)
                }
            ],
            imports: [HttpClientTestingModule, NgbModule, ReactiveFormsModule]
        }).compileComponents();
        fixture = TestBed.createComponent(TerminUebertragenComponent);
        component = fixture.componentInstance;
        modalService = TestBed.get(NgbModal);
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.getFormNr()).toBe(StesFormNumberEnum.TERMIN_UEBERTRAGEN);
    });

    it('close', () => {
        component = fixture.componentInstance;
        spyOn(modalService, 'open').and.returnValue(mockModalRef);
        component.close();
    });

    it('on reset', () => {
        component.initializeFromGroup();
        component.reset();
    });
    it('areEmailsValid', () => {
        component.initializeFromGroup();
        expect(TerminUebertragenComponent.areEmailsValid('hans@gmx.ch;dieter@gmx.ch;;')).toBeTruthy();
        expect(TerminUebertragenComponent.areEmailsValid('hans@gmx.chdieter@gmx.ch')).toBeFalsy();
    });
});
