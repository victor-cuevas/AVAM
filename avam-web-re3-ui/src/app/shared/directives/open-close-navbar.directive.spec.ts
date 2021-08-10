import { TestBed, async, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { Component, ViewChild, DebugElement, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { By } from '@angular/platform-browser';
import { OpenCloseNavbarDirective } from './open-close-navbar.directive';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
    template: `
        <li></li>
    `
})
class TestComponent {
    targetElement: any;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

    @HostListener('click', ['$event.target']) onClick(targetEl) {
        if (event.isTrusted === true) {
            this.renderer.addClass(this.elementRef.nativeElement, 'show');
            this.targetElement = targetEl;
        }
    }
}

describe('Directive: OpenCloseNavbarDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent, OpenCloseNavbarDirective],
            imports: []
        });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });
});
