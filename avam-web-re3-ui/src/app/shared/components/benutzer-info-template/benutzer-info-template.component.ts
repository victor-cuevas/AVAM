import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BenutzerDetailInfoDTO } from '@app/shared/models/dtos-generated/benutzerDetailInfoDTO';

@Component({
    selector: 'avam-benutzer-info-template',
    templateUrl: './benutzer-info-template.component.html',
    styleUrls: ['./benutzer-info-template.component.scss']
})
export class BenutzerInfoTemplateComponent implements OnInit {
    @Input() userInfoData: BenutzerDetailInfoDTO;
    @Input() benutzerDetails = true;
    @Output() emailClick: EventEmitter<any> = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    onClickEmail() {
        this.emailClick.emit(true);
    }
}
