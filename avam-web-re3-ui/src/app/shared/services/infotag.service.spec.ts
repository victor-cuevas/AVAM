import * as moment from 'moment';
import { Moment } from 'moment';

import { TestBed } from '@angular/core/testing';
import { InfotagService } from './infotag.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { InfotagRestService } from '../../core/http/infotag-rest.service';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InfotagMassnahmeDurchfuehrungseinheitRequestDTO } from '../models/dtos-generated/infotagMassnahmeDurchfuehrungseinheitRequestDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';

describe('InfotagService', () => {
    let infotagService: InfotagService;
    let infotagRestService: InfotagRestService;
    let translateService: TranslateService;
    let ammRestService: AmmRestService;
    let stesDataRestService: StesDataRestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [InfotagRestService, HttpClient, HttpHandler, AmmRestService, StesDataRestService],
            imports: [
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                HttpClientTestingModule
            ]
        });
        infotagRestService = TestBed.get(InfotagRestService);
        translateService = TestBed.get(TranslateService);
        translateService.currentLang = 'de';
        ammRestService = TestBed.get(AmmRestService);
        stesDataRestService = TestBed.get(StesDataRestService);
        infotagService = new InfotagService(infotagRestService, translateService, ammRestService, stesDataRestService);
    });

    it('initRequest', () => {
        const now: Moment = moment().startOf('day');
        const von: Date = now.add(1, 'days').toDate();
        const bis: Date = now
            .add(2, 'months')
            .subtract(1, 'days')
            .toDate();
        const request: InfotagMassnahmeDurchfuehrungseinheitRequestDTO = infotagService.initRequest(1, this.kategories);
        expect(request).not.toBeNull();
        expect(request.language).toBe('de');

        expect(request.zeitraumVon.getTime()).toBe(von.getTime());
        expect(request.zeitraumBis.getTime()).toBe(bis.getTime());
    });

    it('getDurchfuehrungseinheiten', () => {
        let infotagRestServicespy = spyOn(infotagRestService, 'getDurchfuehrungseinheiten').and.callThrough();
        infotagService.getDurchfuehrungseinheiten(null);
        expect(infotagRestServicespy).toHaveBeenCalled();
    });
});
