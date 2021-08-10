import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesZasKeinAbgleichenComponent } from './stes-zas-kein-abgleichen.component';
import { MockTranslatePipe } from '../../../../../../../../../tests/helpers';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { StesFormNumberEnum } from '../../../../../../../shared/enums/stes-form-number.enum';

describe('StesZasKeinAbgleichenComponent', () => {
    let component: StesZasKeinAbgleichenComponent;
    let fixture: ComponentFixture<StesZasKeinAbgleichenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesZasKeinAbgleichenComponent, MockTranslatePipe],
            imports: [
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateFakeLoader
                    }
                })
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesZasKeinAbgleichenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.getFormNr()).toBe(StesFormNumberEnum.ZAS_ABGLEICH);
    });
});
