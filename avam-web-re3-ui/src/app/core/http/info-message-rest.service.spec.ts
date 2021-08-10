import { TestBed } from '@angular/core/testing';

import { InfoMessageRestService } from './info-message-rest.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BenutzerInfoMessageDTO } from '@shared/models/dtos-generated/benutzerInfoMessageDTO';

describe('InfoMessageRestService', () => {
    let restService: InfoMessageRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpClient = TestBed.get(HttpClient);
        restService = new InfoMessageRestService(httpClient);
    });

    it('getInfoMessages', () => {
        const spy = spyOn(restService, 'getInfoMessages').and.callThrough();
        restService.getInfoMessages();
        expect(spy).toHaveBeenCalled();
    });

    it('markInfoMessageAsRead', () => {
        const spy = spyOn(restService, 'markInfoMessageAsRead').and.callThrough();
        restService.markInfoMessageAsRead({
            benutzerId: 'T7018',
            benutzerInfomessageId: 0,
            infomessageId: 1050
        } as BenutzerInfoMessageDTO);
        expect(spy).toHaveBeenCalled();
    });
});
