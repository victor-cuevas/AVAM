import { Injectable } from '@angular/core';
import { SchlagwortSuchenReactiveFormService } from './schlagwort-suchen-reactive-form.service';

@Injectable()
export class SchlagwortSuchenHandlerService {
    constructor(private reactiveForms: SchlagwortSuchenReactiveFormService) {}
}
