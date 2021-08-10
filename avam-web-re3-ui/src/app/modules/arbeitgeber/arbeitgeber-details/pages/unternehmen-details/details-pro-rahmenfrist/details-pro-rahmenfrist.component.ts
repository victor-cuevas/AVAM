import { Component, Input, OnInit } from '@angular/core';
import { FacadeService } from '@shared/services/facade.service';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { RahmenfristKaeSweService } from '@modules/arbeitgeber/services/rahmenfrist-kae-swe.service';
import { RahmenfristProUnternehmenDTO } from '@dtos/rahmenfristProUnternehmenDTO';
import { RahmenfristenModalenAbstract } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/rahmenfristen/rahmenfristen-modalen-abstract';

@Component({
    selector: 'avam-details-pro-rahmenfrist',
    templateUrl: './details-pro-rahmenfrist.component.html',
    styleUrls: ['./details-pro-rahmenfrist.component.scss']
})
export class DetailsProRahmenfristComponent extends RahmenfristenModalenAbstract implements OnInit {
    @Input() unternehmenId: number;
    readonly channel = 'detailsProRahmenfristChannel';
    readonly toolboxId = 'detailsProRahmenfristToolboxId';
    readonly uiNumber = StesFormNumberEnum.RAHMENFRISTEN_AG_MODAL;
    dataSource: RahmenfristProUnternehmenDTO[] = [];
    commonRahmenfristenData: RahmenfristProUnternehmenDTO = {};

    constructor(protected facadeService: FacadeService, private rahmenfristService: RahmenfristKaeSweService) {
        super(facadeService);
    }

    ngOnInit() {
        super.initModal(this.toolboxId);
        this.loadData();
    }

    private loadData() {
        this.facadeService.spinnerService.activate(this.channel);
        this.rahmenfristService.getRahmenfristen(this.unternehmenId).subscribe(
            response => {
                this.handleResponse(response);
            },
            () => {
                this.facadeService.spinnerService.deactivate(this.channel);
            }
        );
        this.facadeService.spinnerService.deactivate(this.channel);
    }

    private handleResponse(response: RahmenfristProUnternehmenDTO[]) {
        if (response && response.length > 0) {
            this.dataSource = response;
            this.commonRahmenfristenData = this.dataSource[0];
        }
    }
}
