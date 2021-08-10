import { Injectable } from '@angular/core';
import { RestClient } from '@core/http/rest-client';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseResponseWrapperListRolleDTOWarningMessages } from '@dtos/baseResponseWrapperListRolleDTOWarningMessages';
import { RolleSuchenParamDTO } from '@dtos/rolleSuchenParamDTO';
import { BaseResponseWrapperRolleDTOWarningMessages } from '@dtos/baseResponseWrapperRolleDTOWarningMessages';
import { BaseResponseWrapperListSysFunkRolleViewDTOWarningMessages } from '@dtos/baseResponseWrapperListSysFunkRolleViewDTOWarningMessages';
import { RolleDTO } from '@dtos/rolleDTO';
import { BaseResponseWrapperVoidWarningMessages } from '@dtos/baseResponseWrapperVoidWarningMessages';
import { BaseResponseWrapperBerechtigungDropdownsDTOWarningMessages } from '@dtos/baseResponseWrapperBerechtigungDropdownsDTOWarningMessages';

@Injectable()
export class RolleRestService {
    private readonly rest: RestClient;

    constructor(private http: HttpClient) {
        this.rest = new RestClient(http, '/rest/common/rolle');
    }

    search(dto: RolleSuchenParamDTO): Observable<BaseResponseWrapperListRolleDTOWarningMessages> {
        return this.rest.post('', dto);
    }

    update(dto: RolleSuchenParamDTO): Observable<BaseResponseWrapperRolleDTOWarningMessages> {
        return this.rest.put('', dto);
    }

    getByRolleId(rolleId: string): Observable<BaseResponseWrapperRolleDTOWarningMessages> {
        return this.rest.get(`/${rolleId}`);
    }

    getBerechtigungen(rolleId: string): Observable<BaseResponseWrapperListSysFunkRolleViewDTOWarningMessages> {
        return this.rest.get(`/berechtigungen/${rolleId}`);
    }

    validate(rolleDto: RolleDTO): Observable<BaseResponseWrapperVoidWarningMessages> {
        return this.rest.post('/validate', rolleDto);
    }

    getDropdowns(): Observable<BaseResponseWrapperBerechtigungDropdownsDTOWarningMessages> {
        return this.rest.get('/berechtigungdropdowns');
    }
}
