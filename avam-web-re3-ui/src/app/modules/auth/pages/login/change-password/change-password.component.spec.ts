import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CloseTabDirective, DbTranslatePipe, FormUtilsService, ToolboxService, TextOverflowTooltipDirective, TextOverflowTooltipInputFieldDirective } from 'src/app/shared';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbButtonsModule, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangePasswordComponent } from './change-password.component';
import { NgbModalStub } from 'src/app/modules/stes/pages/abmeldung/stes-abmeldung.component.spec';
import { DbTranslateService } from 'src/app/shared/services/db-translate.service';
import { MockTextControlClearDirective, MockTranslatePipe } from '../../../../../../../tests/helpers';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';

describe('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent;
    let fixture: ComponentFixture<ChangePasswordComponent>;
    let ngbModalStub: NgbModalStub;
    let notificationServiceStub: NotificationServiceStub;
    let translateServiceStub: TranslateServiceStub;
    let dbTranslateServiceStub: DbTranslateServiceStub;
    let formBuilder: FormBuilder;

    const validPwdMock = { currentPassword: '12345678', newPassword: '01234567', confirmNewPassword: '01234567' };
    const invalidPwdMock1 = { currentPassword: '', newPassword: '01234567', confirmNewPassword: '01234567' };
    const invalidPwdMock2 = { currentPassword: '12345678', newPassword: '0123456', confirmNewPassword: '01234567' };
    const invalidPwdMock3 = { currentPassword: '12345678', newPassword: '01234567', confirmNewPassword: '0123456' };
    const invalidPwdMock4 = { currentPassword: null, newPassword: null, confirmNewPassword: null };

    const pwdDoesntMatchMock = { currentPassword: '00000000', newPassword: '00000001', confirmNewPassword: '00000002' };
    const pwdMatchMock = { currentPassword: '00000000', newPassword: '00000001', confirmNewPassword: '00000001' };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, NgbButtonsModule],
            declarations: [
                ChangePasswordComponent,
                MockTextControlClearDirective,
                CloseTabDirective,
                MockTranslatePipe,
                DbTranslatePipe,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                ToolboxService,
                FormBuilder,
                FormUtilsService,
                SpinnerService,
                { provide: NotificationService, useClass: NotificationServiceStub },
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                {
                    provide: NG_VALUE_ACCESSOR,
                    multi: true,
                    useExisting: forwardRef(() => ChangePasswordComponent)
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        const error = TestBed.compileComponents();
        ngbModalStub = TestBed.get(NgbModal);
        notificationServiceStub = TestBed.get(NotificationService);
        translateServiceStub = TestBed.get(TranslateService);
        dbTranslateServiceStub = TestBed.get(DbTranslateService);
        formBuilder = TestBed.get(FormBuilder);
    });

    it('should verify validation', () => {
        fixture = TestBed.createComponent(ChangePasswordComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        component.changePasswordForm.setValue(validPwdMock);
        expect(component.changePasswordForm.status).toBe('VALID');

        component.changePasswordForm.setValue(invalidPwdMock1);
        expect(component.changePasswordForm.status).toBe('INVALID');

        component.changePasswordForm.setValue(invalidPwdMock2);
        expect(component.changePasswordForm.status).toBe('INVALID');

        component.changePasswordForm.setValue(invalidPwdMock3);
        expect(component.changePasswordForm.status).toBe('INVALID');

        component.changePasswordForm.setValue(invalidPwdMock4);
        expect(component.changePasswordForm.status).toBe('INVALID');
    });
    it('should show error if new passwords do not match', () => {
        fixture = TestBed.createComponent(ChangePasswordComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        component.changePasswordForm.setValue(pwdDoesntMatchMock);
        component.matchNewPassword();
        expect(component.error).not.toBe(null);

        component.error = null;
        component.changePasswordForm.setValue(pwdMatchMock);
        component.matchNewPassword();
        expect(component.error).toBe(null);

        component.error = null;
        component.changePasswordForm.setValue(invalidPwdMock4);
        component.matchNewPassword();
        expect(component.error).toBe(null);
    });
    it('tests to be defined', () => {
        fixture = TestBed.createComponent(ChangePasswordComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        component.changePasswordForm.setValue(validPwdMock);
        component.close();
        component.changePassword();
        component.getFormNr();
    });
});

class TranslateServiceStub {
    public currentLang = 'de';

    public instant(key: any): any {
        return key;
    }
}

class NotificationServiceStub {
    // used to send message to specific channel
    broadcast() {
        /**/
    }

    send() {
        /**/
    }

    error() {
        /**/
    }

    warning() {
        /**/
    }

    success() {
        /**/
    }
}
