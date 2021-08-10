import { ThrottleClickDirective } from './throttle.click.directive';
import { Component, ViewChild, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

@Component({
    template: `
        <button throttleClick (throttleClick)="onSave()" class="btn btn-primary ml-1" type="submit" >
	`
})
class TestComponent {
    @ViewChild(ThrottleClickDirective) throttleClickDirective: ThrottleClickDirective;

    onSave(): void {
    }
}

describe('throttleClickDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [
                ThrottleClickDirective,
                TestComponent,

            ],
            imports: [
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })],

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

    it('should click call onSave method', () => {
        spyOn(component, 'onSave').and.callThrough();
    
        const doubleClickEl: DebugElement = fixture.debugElement.query(By.css("button"));
        doubleClickEl.triggerEventHandler("click", new MouseEvent("click"));
        expect(component.onSave).toHaveBeenCalled();
      });

      it('should doubleclick call onSave method only 1 time', () => {
        spyOn(component, 'onSave').and.callThrough();
    
        const doubleClickEl: DebugElement = fixture.debugElement.query(By.css("button"));
        doubleClickEl.triggerEventHandler("click", new MouseEvent("click"));
        doubleClickEl.triggerEventHandler("click", new MouseEvent("click"));
        expect(component.onSave).toBeCalledTimes(1);
      });

      it('should unsubscribe on destroy', () => {
        component.throttleClickDirective['subscription'] = of(true).subscribe();

        component.throttleClickDirective.ngOnDestroy();

        expect(component.throttleClickDirective['subscription'].closed).toBeTruthy();
    });

    it('should do nothing when subscription is undefined on destroy', () => {
        component.throttleClickDirective['subscription'] = undefined;

        component.throttleClickDirective.ngOnDestroy();

    });

    
});
