import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoMessageComponent } from './info-message.component';
import { SpinnerService } from 'oblique-reactive';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { DbTranslatePipe } from '@app/shared';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoMessageService } from '@shared/services/info-message.service';
import { InfoMessageRestService } from '@core/http/info-message-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { InfoMessageDTO } from '@shared/models/dtos-generated/infoMessageDTO';

describe('InfoMessageComponent', () => {
    let component: InfoMessageComponent;
    let fixture: ComponentFixture<InfoMessageComponent>;
    let restService: InfoMessageRestService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InfoMessageComponent, MockTranslatePipe, DbTranslatePipe],
            providers: [SpinnerService, InfoMessageService, InfoMessageRestService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [HttpClientTestingModule, NgbTooltipModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InfoMessageComponent);
        restService = TestBed.get(InfoMessageRestService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('getInfoMessages messages', () => {
        const spy = spyOn(restService, 'getInfoMessages').and.returnValues(
            of([
                {
                    infomessageId: 1,
                    gueltigAb: new Date(),
                    gueltigBis: new Date(),
                    messageDe: 'de',
                    messageFr: 'fr',
                    messageIt: 'it'
                } as InfoMessageDTO,
                {
                    infomessageId: 2,
                    gueltigAb: new Date(),
                    gueltigBis: new Date(),
                    messageDe: 'de',
                    messageFr: 'fr',
                    messageIt: 'it'
                } as InfoMessageDTO
            ])
        );
        component.ngAfterViewInit();
        expect(component).toBeTruthy();
        expect(component.showInfo).toBeTruthy();
        expect(spy).toHaveBeenCalled();
    });

    it('getInfoMessages empty', () => {
        const spy = spyOn(restService, 'getInfoMessages').and.returnValues(of([]));
        component.ngAfterViewInit();
        expect(component).toBeTruthy();
        expect(component.showInfo).toBeFalsy();
        expect(spy).toHaveBeenCalled();
    });
});
