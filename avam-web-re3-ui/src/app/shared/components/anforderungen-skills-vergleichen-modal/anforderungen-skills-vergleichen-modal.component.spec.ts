import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnforderungenSkillsVergleichenModalComponent } from './anforderungen-skills-vergleichen-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MockTranslatePipe } from '@test_helpers/';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { ToolboxService } from '@app/shared';

describe('AnforderungenSkillsVergleichenModalComponent', () => {
    let component: AnforderungenSkillsVergleichenModalComponent;
    let fixture: ComponentFixture<AnforderungenSkillsVergleichenModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
            declarations: [AnforderungenSkillsVergleichenModalComponent, MockTranslatePipe, DbTranslatePipe],
            providers: [StesDataRestService, OsteDataRestService, ToolboxService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AnforderungenSkillsVergleichenModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
