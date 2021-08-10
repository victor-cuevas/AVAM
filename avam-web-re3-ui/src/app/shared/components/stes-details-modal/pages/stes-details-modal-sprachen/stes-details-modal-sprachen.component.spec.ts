import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesDetailsModalSprachenComponent } from './stes-details-modal-sprachen.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TextareaComponent } from '@app/shared/components/textarea/textarea.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { CustomErrorMessages } from '@app/shared/directives/custom-error-messages.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DbTranslatePipe, CustomFormControlStateDirective } from '@app/shared';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

describe('StesDetailsModalSprachenComponent', () => {
    let component: StesDetailsModalSprachenComponent;
    let fixture: ComponentFixture<StesDetailsModalSprachenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsModalSprachenComponent, TextareaComponent, CustomErrorMessages, CustomFormControlStateDirective],
            imports: [
                ReactiveFormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                FormsModule,
                HttpClientTestingModule,
                NgbTooltipModule.forRoot()
            ],
            providers: [StesDataRestService, DbTranslatePipe],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsModalSprachenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
