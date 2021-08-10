import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SortableHeader } from './table.sortable.header.directive';


@Component({
    template: `
    <span class='mouse-pointer' sortable="header.dataProperty" (sort)="onSort($event)"></span>
	`
})
class TestComponent {
    @ViewChild(SortableHeader) sortableHeader: SortableHeader;

    onSort() {
        return;
    }
}

describe('Directive: SortableHeader', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [
                SortableHeader,
                TestComponent,
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

    it('should rotate to desc', () => {
        const spanSortableElements: DebugElement[] = fixture.debugElement.queryAll(By.css("span"));
        spanSortableElements[0].nativeElement.dispatchEvent(new Event('click'));
        expect(component.sortableHeader.direction).toEqual('ASC');
        spanSortableElements[0].nativeElement.dispatchEvent(new Event('click'));
        expect(component.sortableHeader.direction).toEqual('DESC');
    });
});
