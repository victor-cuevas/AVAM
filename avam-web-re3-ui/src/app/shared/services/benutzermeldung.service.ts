import { Injectable } from '@angular/core';
import { FacadeService } from '@shared/services/facade.service';
import { BenutzermeldungRestService } from '@core/http/benutzermeldung-rest.service';

@Injectable({
    providedIn: 'root'
})
export class BenutzermeldungService {
    constructor(public rest: BenutzermeldungRestService, public facade: FacadeService) {}
}
