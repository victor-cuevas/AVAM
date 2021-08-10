import { Component, Input, OnInit } from '@angular/core';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ZahlungProRahmenfristDTO } from '@dtos/zahlungProRahmenfristDTO';
import { FacadeService } from '@shared/services/facade.service';
import { RahmenfristKaeSweService } from '@modules/arbeitgeber/services/rahmenfrist-kae-swe.service';
import { RahmenfristenModalenAbstract } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/rahmenfristen/rahmenfristen-modalen-abstract';

@Component({
    selector: 'avam-rahmenfrist-zahlungen',
    templateUrl: './rahmenfrist-zahlungen.component.html',
    styleUrls: ['./rahmenfrist-zahlungen.component.scss']
})
export class RahmenfristZahlungenComponent extends RahmenfristenModalenAbstract implements OnInit {
    @Input() rahmenfristId: number;
    readonly channel = 'rahmenfristZahlungenChannel';
    readonly toolboxId = 'rahmenfristZahlungenToolboxId';
    readonly uiNumber = StesFormNumberEnum.ZAHLUNGEN_RAHMENFRIST_AG_MODAL;
    dataSource: ZahlungProRahmenfristDTO[] = [];
    commonRahmenfristenData: ZahlungProRahmenfristDTO = {};

    constructor(protected facadeService: FacadeService, private rahmenfristService: RahmenfristKaeSweService) {
        super(facadeService);
    }

    ngOnInit() {
        super.initModal(this.toolboxId);
        this.loadData();
    }

    private loadData() {
        this.facadeService.spinnerService.activate(this.channel);
        this.rahmenfristService.getZahlungen(this.rahmenfristId).subscribe(
            response => {
                this.handleResponse(response);
            },
            () => {
                this.facadeService.spinnerService.deactivate(this.channel);
            }
        );
        this.facadeService.spinnerService.deactivate(this.channel);
    }

    private handleResponse(response: ZahlungProRahmenfristDTO[]) {
        if (response && response.length > 0) {
            this.dataSource = response;
            this.commonRahmenfristenData = this.dataSource[0];
        }
    }
}
