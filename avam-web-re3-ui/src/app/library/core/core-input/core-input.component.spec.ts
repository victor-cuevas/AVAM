import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreInputComponent } from './core-input.component';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { ReactiveFormsModule } from '@angular/forms';

describe('CoreInputComponent', () => {
    let component: CoreInputComponent;
    let fixture: ComponentFixture<CoreInputComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoreInputComponent, MockTextControlClearDirective],
            imports: [ReactiveFormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoreInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
