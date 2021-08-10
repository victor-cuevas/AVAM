import { Component, OnInit, Input } from '@angular/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';

@Component({
    selector: 'avam-unternehmen-info-popover',
    templateUrl: './unternehmen-info-popover.component.html',
    styleUrls: ['./unternehmen-info-popover.component.scss']
})
export class UnternehmenInfoPopoverComponent implements OnInit {
    @Input() data: UnternehmenDTO = {};
    plzOrt: string;
    postfachPlzOrt: string;
    land: string;
    unternehmenStatus: string;

    constructor(private dbTranslateService: DbTranslateService) {}

    ngOnInit() {}

    showData() {
        this.formatData();
    }

    formatData() {
        this.setPlzOrt();
        this.setPostfachPlzOrt();
        this.setLand();
        this.setStatus();
    }

    private setPlzOrt() {
        if (this.data.plz) {
            this.plzOrt = `${this.data.plz.postleitzahl}  ${this.dbTranslateService.translate(this.data.plz, 'ort')}`;
        } else if (this.data.plzAusland && this.data.ortAusland) {
            this.plzOrt = `${this.data.ortAusland} ${this.data.plzAusland}`;
        }
    }

    private setPostfachPlzOrt() {
        if (this.data.postfachPlzObject) {
            this.plzOrt = `${this.data.postfachPlzObject.postleitzahl}  ${this.dbTranslateService.translate(this.data.postfachPlzObject, 'ort')}`;
        } else if (this.data.postfachPlzAusland && this.data.postfachPlzOrtAusland) {
            this.plzOrt = `${this.data.postfachPlzAusland} ${this.data.postfachPlzOrtAusland}`;
        }
    }

    private setLand() {
        if (this.data.staat) {
            this.land = this.dbTranslateService.translate(this.data.staat, 'name');
        }
    }

    private setStatus() {
        if (this.data.statusObject) {
            this.unternehmenStatus = this.dbTranslateService.translate(this.data.statusObject, 'text');
        }
    }
}
