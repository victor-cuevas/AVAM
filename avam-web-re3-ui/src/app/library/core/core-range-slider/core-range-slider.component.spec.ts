import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreRangeSliderComponent } from './core-range-slider.component';

describe('RangeSliderComponent', () => {
    let component: CoreRangeSliderComponent;
    let fixture: ComponentFixture<CoreRangeSliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoreRangeSliderComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoreRangeSliderComponent);
        component = fixture.componentInstance;
        component.rangeValues = [2, 34];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
