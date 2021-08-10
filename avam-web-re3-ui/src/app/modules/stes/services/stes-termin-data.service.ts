import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { StesTerminDTO } from '@shared/models/dtos-generated/stesTerminDTO';
import { StesTerminRestService } from '@core/http/stes-termin-rest.service';
import { StesTerminDetailsDTO } from '@shared/models/dtos-generated/stesTerminDetailsDTO';

@Injectable()
export class StesTerminDataService {
    public terminSubject: Subject<StesTerminDetailsDTO> = new Subject();
    public termineSubject: Subject<StesTerminDTO[]> = new Subject();
    private _termin: StesTerminDetailsDTO;
    private _termine: StesTerminDTO[];

    constructor(private stesTerminRestService: StesTerminRestService) {}

    getStesTermine(id: string, language: string) {
        this.stesTerminRestService.getTermine(id, language).subscribe((response: any) => {
            this.termine = response.data;
        });
    }

    get termine(): StesTerminDTO[] {
        return this._termine;
    }

    set termine(value: StesTerminDTO[]) {
        this._termine = value;
        this.termineSubject.next(value);
    }

    get termin(): StesTerminDetailsDTO {
        return this._termin;
    }

    set termin(value: StesTerminDetailsDTO) {
        this._termin = value;
        this.terminSubject.next(value);
    }
}
