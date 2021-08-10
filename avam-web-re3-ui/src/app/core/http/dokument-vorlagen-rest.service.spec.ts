import { TestBed } from '@angular/core/testing';

import { DokumentVorlagenRestService } from './dokument-vorlagen-rest.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DokumentVorlagenRequestDTO } from '@shared/models/dtos-generated/dokumentVorlagenRequestDTO';
import { VorlagenKategorie } from '@shared/enums/vorlagen-kategorie.enum';
import { DokumentVorlageActionDTO } from '@shared/models/dtos-generated/dokumentVorlageActionDTO';

describe('DokumentVorlagenRestService', () => {
    let restService: DokumentVorlagenRestService;
    let httpClient: HttpClient;
    beforeEach(() => TestBed.configureTestingModule({}));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpClient = TestBed.get(HttpClient);
        restService = new DokumentVorlagenRestService(httpClient);
    });

    it('getDokumentVorlagen', () => {
        const spy = spyOn(restService, 'getDokumentVorlagen').and.callThrough();
        restService.getDokumentVorlagen({
            categories: [VorlagenKategorie.PersonalienBearbeiten]
        } as DokumentVorlagenRequestDTO);
        expect(spy).toHaveBeenCalled();
    });

    it('openDocument', () => {
        const spy = spyOn(restService, 'openDocument').and.callThrough();
        restService.openDocument({} as DokumentVorlageActionDTO);
        expect(spy).toHaveBeenCalled();
    });

    it('saveDocument', () => {
        const spy = spyOn(restService, 'saveDocument').and.callThrough();
        restService.saveDocument({} as DokumentVorlageActionDTO);
        expect(spy).toHaveBeenCalled();
    });
});
