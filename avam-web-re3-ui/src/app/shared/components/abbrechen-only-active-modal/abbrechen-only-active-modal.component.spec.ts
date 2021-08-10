import { MockTranslatePipe } from './../../../../../tests/helpers/mock-translate.pipe';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService } from '@ngx-translate/core';
import { ErwerbssituationAktuellTableComponent, ObjectIteratorPipe, DbTranslatePipe, AbbrechenOnlyActiveModalComponent } from 'src/app/shared';
import { NgbModal, NgbActiveModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AbbrechenOnlyActiveModalComponent', () => {
    let component: AbbrechenOnlyActiveModalComponent;
    let fixture: ComponentFixture<AbbrechenOnlyActiveModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AbbrechenOnlyActiveModalComponent, MockTranslatePipe, ErwerbssituationAktuellTableComponent, ObjectIteratorPipe, DbTranslatePipe],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                NgbTooltipModule.forRoot()
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [NgbModal, TranslateService, NgbActiveModal]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AbbrechenOnlyActiveModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
