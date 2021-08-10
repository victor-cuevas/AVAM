import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatenfreigabeBefragungResetComponent } from './datenfreigabe-befragung-reset.component';
import { MockTranslatePipe } from '../../../../../../../../../tests/helpers';

describe('DatenfreigabeBefragungResetComponent', () => {
    let component: DatenfreigabeBefragungResetComponent;
    let fixture: ComponentFixture<DatenfreigabeBefragungResetComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DatenfreigabeBefragungResetComponent, MockTranslatePipe]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DatenfreigabeBefragungResetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
