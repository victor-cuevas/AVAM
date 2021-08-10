import { StesSucheResultDTO } from '@dtos/stesSucheResultDTO';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { StesSearchRestService } from '../../../core/http/stes-search-rest.service';
import { StesSucheQueryDTO } from '@dtos/stesSucheQueryDTO';
import { BaseResponseWrapperListStesSucheResultDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesSucheResultDTOWarningMessages';
import { FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class StesDataService {
    public subject: Subject<StesSucheResultDTO[]> = new Subject();
    private _responseDTOs: StesSucheResultDTO[];

    constructor(private stesRestService: StesSearchRestService) {}

    callRestService(searchDTOParam: StesSucheQueryDTO, form: FormGroup, selectedGemeindeParam: any, statusOptionsLabelsParam: any[]) {
        this.stesRestService.searchStes(searchDTOParam).subscribe((response: BaseResponseWrapperListStesSucheResultDTOWarningMessages) => {
            this.responseDTOs = response.data as StesSucheResultDTO[];
        });
    }

    get responseDTOs(): StesSucheResultDTO[] {
        return this._responseDTOs;
    }

    set responseDTOs(value: StesSucheResultDTO[]) {
        this._responseDTOs = value;
        this.subject.next(value);
    }

    clearResponseDTOs() {
        this.responseDTOs = [];
    }
}
