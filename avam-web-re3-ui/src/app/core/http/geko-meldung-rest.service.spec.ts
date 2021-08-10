import { TestBed } from '@angular/core/testing';

import { GekoMeldungRestService } from './geko-meldung-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

describe('GekoMeldungRestService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GekoMeldungRestService, HttpClient]
        })
    );

    it('should be created', () => {
        const service: GekoMeldungRestService = TestBed.get(GekoMeldungRestService);
        expect(service).toBeTruthy();
    });
});
