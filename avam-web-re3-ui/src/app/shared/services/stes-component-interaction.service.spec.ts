import { TestBed } from '@angular/core/testing';

import { StesComponentInteractionService } from './stes-component-interaction.service';

describe('StesComponentInteraction', () => {
    let service: StesComponentInteractionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [StesComponentInteractionService]
        });
        service = TestBed.get(StesComponentInteractionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update DetailsHeader ', done => {
        service.detailsHeaderSubject.subscribe(stesId => {
            expect(stesId).toEqual('test');
            done();
        });
        service.updateDetailsHeader('test');
    });

    it('should update DataLengthHeader ', done => {
        service.dataLengthHeaderSubject.subscribe(length => {
            expect(length).toEqual(10);
            done();
        });
        service.updateDataLengthHeaderSubject(10);
    });
});
