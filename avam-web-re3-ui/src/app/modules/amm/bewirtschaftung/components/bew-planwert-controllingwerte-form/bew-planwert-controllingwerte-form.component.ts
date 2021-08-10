import { Component, OnInit } from '@angular/core';
import { BewPlanwertControllingwerteFormModeService } from './bew-planwert-controllingwerte-form-mode.service';

@Component({
    selector: 'avam-bew-planwert-controllingwerte-form',
    templateUrl: './bew-planwert-controllingwerte-form.component.html',
    providers: [BewPlanwertControllingwerteFormModeService]
})
export class BewPlanwertControllingwerteFormComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
