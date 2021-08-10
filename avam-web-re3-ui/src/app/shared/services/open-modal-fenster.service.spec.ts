import { TestBed } from '@angular/core/testing';

import { OpenModalFensterService } from './open-modal-fenster.service';

describe('OpenModalFensterService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: OpenModalFensterService = TestBed.get(OpenModalFensterService);
        expect(service).toBeTruthy();
    });

    it('should open modal Fenster', () => {
        const service: OpenModalFensterService = TestBed.get(OpenModalFensterService);

        service.getModalFensterToOpen().subscribe(action => {
            expect(action).toEqual('');
        });

        service.openModalFenster();
    });

});
