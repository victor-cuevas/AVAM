import { Injectable } from '@angular/core';
import { BewDurchfuehrungsortReactiveFormsService } from './bew-durchfuehrungsort-reactive-forms.service';

@Injectable()
export class BewDurchfuehrungsortHandlerService {
    constructor(public reactiveForms: BewDurchfuehrungsortReactiveFormsService) {}

    mapDropdown(items) {}
}
