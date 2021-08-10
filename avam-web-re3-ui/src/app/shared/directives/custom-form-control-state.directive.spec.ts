import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormControlName, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormControlStateDirective } from 'oblique-reactive';
import { CustomFormControlStateDirective } from './custom-form-control-state.directive';

@Component({
    template: `
		<form name="testForm">
			<div customFormControlState [pristineValidation]="pristineValidation">
				<input name="name" type="text" [(ngModel)]="model" #name="ngModel" required minlength="3">
			</div>
			<input id="submit" type="submit" value="Click Me">
		</form>
	`
})
class TestWithPristineValidationComponent {
    pristineValidation = true;
    model;

    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild(CustomFormControlStateDirective) formControlState: CustomFormControlStateDirective;
}

@Component({
    template: `
		<form [formGroup]="model">
			<div customFormControlState>
				<input formControlName="name" type="text">
			</div>
			<input id="submit" type="submit" value="Click Me">
		</form>
	`
})
class ReactiveTestComponent implements OnInit {
    model;

    @ViewChild(NgModel)
    ngModel: FormControlName;

    @ViewChild(CustomFormControlStateDirective)
    formControlState: CustomFormControlStateDirective;

    constructor(private readonly formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.model = this.formBuilder.group({ name: ['', Validators.required] });
    }
}

@Component({
    template: `
		<form name="testForm">
			<div customFormControlState>
				<input name="name" type="text" [(ngModel)]="model" #name="ngModel" required minlength="4">
			</div>
			<input id="submit" type="submit" value="Click Me">
		</form>
	`
})
class TestComponent {
    model;

    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild(CustomFormControlStateDirective) formControlState: CustomFormControlStateDirective;
}

describe('CustomFormControlStateDirective', () => {
    let fixture: ComponentFixture<TestComponent>
        | ComponentFixture<TestWithPristineValidationComponent>
        | ComponentFixture<ReactiveTestComponent>;
    let component: TestComponent | TestWithPristineValidationComponent | ReactiveTestComponent;
    let submitButton;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CustomFormControlStateDirective,
                TestWithPristineValidationComponent,
                TestComponent,
                ReactiveTestComponent
            ],
            imports: [
                FormsModule,
                ReactiveFormsModule
            ]
        }).compileComponents();
    }));

    describe('with pristineValidation = false', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(TestComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            submitButton = fixture.debugElement.query(By.css('#submit')).nativeElement;
        }));

        it('should add has-error class on form submit', () => {
            submitButton.click();
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.has-error'))).toBeTruthy();
        });

        it('should add has-error on value change', fakeAsync(() => {
            component.model = 'A valid Value';
            component.ngModel.control.markAsDirty();

            fixture.detectChanges();
            component.model = '1';

            //Triggers statusChange
            fixture.detectChanges();
            //Executes the subscribes
            tick();
            //Ensures the binding
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.has-error'))).toBeTruthy();
        }));

    });

    describe('with pristineValidation = true', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(TestWithPristineValidationComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            submitButton = fixture.debugElement.query(By.css('#submit')).nativeElement;
        }));

        it('should add has-error class on load', () => {
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('.has-error'))).toBeTruthy();
        });

        it('should remove has-error on statusChange', fakeAsync(() => {
            component.model = 'A valid Value';

            //Triggers statusChange
            fixture.detectChanges();
            //Executes the subscribes
            tick();
            //Ensures the binding
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.has-error'))).toBeFalsy();
        }));
    });

    describe('with reactive form', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(ReactiveTestComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            submitButton = fixture.debugElement.query(By.css('#submit')).nativeElement;
        }));

        it('should add has-error class on form submit', () => {
            submitButton.click();
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.has-error'))).toBeTruthy();
        });

        it('should remove has-error on statusChange', fakeAsync(() => {
            component.model.value.name = 'A valid Value';

            //Triggers statusChange
            fixture.detectChanges();
            //Executes the subscribes
            tick();
            //Ensures the binding
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.has-error'))).toBeFalsy();
        }));
    });
});
