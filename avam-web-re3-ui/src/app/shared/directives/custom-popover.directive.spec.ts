/* tslint:disable:no-unused-variable */

import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CustomPopoverDirective } from './custom-popover.directive';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    template: `
        <button
            id="toolbox-more-button"
            type="button"
            class="btn btn-secondary ml-2"
            placement="bottom"
            [autoClose]="false"
            [ngbPopover]="popContent1"
            triggers="manual"
            #p="ngbPopover"
            appCustomPopover
            [ngpPopoverRef]="p"
        >
            <ng-template #popContent1>
                <div class="row">
                    <div class="col-sm">
                        <a id="toolbox-email-hyperlink"> </a>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm">
                        <a id="toolbox-history-hyperlink"></a>
                    </div>
                </div>
            </ng-template>
        </button>
    `
})
class TestComponent {
    @ViewChild(CustomPopoverDirective) customPopOverDirective: CustomPopoverDirective;
}

describe('Directive: CustomPopover', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CustomPopoverDirective, TestComponent],
            imports: [NgbPopoverModule.forRoot()],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(TestComponent);

        component = fixture.componentInstance;
        component.customPopOverDirective.ngOnInit();
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should update state correctly', function() {
        expect(component.customPopOverDirective.canClosePopover()).toBeFalsy();
        component.customPopOverDirective.openPopover(null);
        expect(component.customPopOverDirective.canClosePopover()).toBeTruthy();
        component.customPopOverDirective.closePopover();
        expect(component.customPopOverDirective.canClosePopover()).toBeFalsy();
    });

    it('show/hide popup on mouseenter/mouseleave', fakeAsync(done => {
        component.customPopOverDirective.mouseenterEvent(new Event('mouseenter'));
        tick(component.customPopOverDirective.MOUSE_ENTER_TIMEOUT + 100);

        expect(component.customPopOverDirective.canClosePopover()).toBeTruthy();

        // leave
        component.customPopOverDirective.mouseleaveEvent(new Event('mouseleave'));
        tick(component.customPopOverDirective.MOUSE_LEAVE_TIMEOUT + 100);

        expect(component.customPopOverDirective.canClosePopover()).toBeFalsy();
    }));

    it('show/hide popover on each click', fakeAsync(done => {
        component.customPopOverDirective.clickEvent(new Event('click'));
        expect(component.customPopOverDirective.canClosePopover()).toBeTruthy();

        // leave
        component.customPopOverDirective.clickEvent(new Event('click'));
        expect(component.customPopOverDirective.canClosePopover()).toBeFalsy();
    }));

    it('during TEST the click does attach the flyOut (on the GUI it does not)', fakeAsync(done => {
        component.customPopOverDirective.mouseenterEvent(new Event('mouseenter'));
        tick(component.customPopOverDirective.MOUSE_ENTER_TIMEOUT + 100);

        expect(component.customPopOverDirective.canClosePopover()).toBeTruthy();

        // leave
        component.customPopOverDirective.clickEvent(new Event('click'));
        expect(component.customPopOverDirective.canClosePopover()).toBeTruthy();
    }));
});
