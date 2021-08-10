import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AvamCommonValueObjectsEnum } from '../enums/avam-common-value-objects.enum';

export interface InfoleistePanelConfig {
    // field definitions from StesHeaderDTO (datum value: from current BO)
    stesBenutzerLogin?: string;
    stesBenutzerVorname?: string;
    stesBenutzerName?: string;
    datumLetzteAktualisierung?: number;
    showInfoIcon?: boolean;
}

@Injectable()
export class InfoleistePanelService {
    private static subject = new Subject<InfoleistePanelConfig>();

    constructor() {}

    /**
     * @param data the info about current BO (DTO definition see above)
     */
    sendData(data: InfoleistePanelConfig) {
        InfoleistePanelService.subject.next(data);
    }

    getData(): Observable<InfoleistePanelConfig> {
        return InfoleistePanelService.subject.asObservable();
    }
}
