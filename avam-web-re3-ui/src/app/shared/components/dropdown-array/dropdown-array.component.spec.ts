import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownArrayComponent } from './dropdown-array.component';
import { FormGroupDirective, ReactiveFormsModule, FormBuilder, NgControl, ControlContainer, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { MockTranslatePipe } from '@test_helpers/';
import { DbTranslatePipe } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { CoreDropdownComponent } from '@app/library/core/core-dropdown/core-dropdown.component';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}

describe('DropdownArrayComponent', () => {
    let component: DropdownArrayComponent;
    let fixture: ComponentFixture<DropdownArrayComponent>;
    const formBuilder: FormBuilder = new FormBuilder();
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DropdownArrayComponent, CoreDropdownComponent, MockTranslatePipe, DbTranslatePipe],
            imports: [FormsModule, ReactiveFormsModule],
            providers: [
                { provide: FormBuilder, useValue: formBuilder },
                NgControl,
                { provide: ControlContainer, useValue: controlContrainer },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DropdownArrayComponent);
        component = fixture.componentInstance;
        component.parentForm = formBuilder.group({
            array: formBuilder.array([])
        });
        controlContrainer.form = component.parentForm;
        component.formArray = 'array';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
