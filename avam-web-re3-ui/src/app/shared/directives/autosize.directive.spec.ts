import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AutosizeDirective } from './autosize.directive';

@Component({
    template: `
        <form>
            <div class="col-lg-8 col-md-8">
                <textarea autosize rows="6" class="form-control" id="textareaId"></textarea>
            </div>
        </form>
    `
})
class TestComponent {
    @ViewChild(NgForm) form: NgForm;
    @ViewChild(AutosizeDirective) autoSizeDirective: AutosizeDirective;
}

describe('autoSizeDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AutosizeDirective, TestComponent],
            imports: [
                FormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })
            ]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(TestComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should be hidden', () => {
        component.autoSizeDirective;
        expect(component.autoSizeDirective.textarea.style.overflow).toEqual('hidden');
    });
});
