import { Component, OnInit, OnDestroy } from '@angular/core';
import { ZasAbgleichRequest } from '@shared/models/dtos/stes-zas-abgleich-request';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';

@Component({
    selector: 'app-stes-zas-abgleichen',
    templateUrl: './stes-zas-abgleichen.component.html',
    styleUrls: ['./stes-zas-abgleichen.component.scss']
})
export class StesZasAbgleichenComponent implements OnInit, OnDestroy {
    zasAbgleichRequest: ZasAbgleichRequest;
    zasResponse: BaseResponseWrapperListStesZasDTOWarningMessages;
    hasSvNr: boolean;
    hasManyPersons: boolean;

    constructor(private fehlermeldungenService: FehlermeldungenService) {
        /**/
    }

    ngOnInit(): void {
        if (!this.zasAbgleichRequest) {
            return;
        }
        const controls: any = this.zasAbgleichRequest.personenstammdaten.controls;
        this.hasSvNr = controls && controls.svNr && controls.svNr.value;
        if (!this.hasSvNr) {
            return;
        }
        this.hasManyPersons = this.zasResponse.data && this.zasResponse.data.length > 1;
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
    }
}
