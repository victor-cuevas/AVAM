import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextareaComponent } from './textarea.component';
import { MockTranslatePipe } from '../../../../../tests/helpers';
import { ControlContainer, FormsModule } from '@angular/forms';

describe('TextareaComponent', () => {
    let component: TextareaComponent;
    let fixture: ComponentFixture<TextareaComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TextareaComponent, MockTranslatePipe],
            imports: [NgbModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [ControlContainer]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextareaComponent);
        component = fixture.componentInstance;
        component.id = 'testId';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
