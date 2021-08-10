import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ErrorMessagesComponent, ErrorMessagesService, FormControlStateDirective } from 'oblique-reactive';
import { CustomErrorMessages } from './custom-error-messages.component';
import { MockTranslatePipe } from '../../../../tests/helpers';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

@Component({
    template: `
		<form name="testForm">
			<input name="name" type="text" ngModel #name="ngModel" required>
			<custom-error-messages [control]="name"></custom-error-messages>
			<input id="submit" type="submit" value="Click Me">
		</form>
	`
})
class TestComponent {
    @ViewChild(NgForm) form: NgForm;
    @ViewChild(CustomErrorMessages) errorMessages: CustomErrorMessages;
}

describe('ErrorMessagesComponent', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let formControlStateDirectiveMock;
    let errorMessagesServiceMock: ErrorMessagesService;;
    let submitButton;

    //TODO: change this to a cleaner solution
    beforeAll(() => {
        formControlStateDirectiveMock = {
            pristineValidation: false
        };
    });

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [
                CustomErrorMessages,
                TestComponent,

            ],
            imports: [FormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })],
            providers: [
                ErrorMessagesService,
                { provide: FormControlStateDirective, useValue: formControlStateDirectiveMock }
            ]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(TestComponent);
        errorMessagesServiceMock = TestBed.get(ErrorMessagesService);

        component = fixture.componentInstance;
        fixture.detectChanges();
        submitButton = fixture.debugElement.query(By.css('#submit')).nativeElement;
    }));

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should render messages on submit', () => {
        spyOn(errorMessagesServiceMock, 'createMessages').and.returnValue([{ key: `i18n.validation.bar`, params: undefined }]);
        submitButton.click();

        expect(component.errorMessages.errors.length).not.toBe(0);
        expect(errorMessagesServiceMock.createMessages).toHaveBeenCalled();
    });

});
