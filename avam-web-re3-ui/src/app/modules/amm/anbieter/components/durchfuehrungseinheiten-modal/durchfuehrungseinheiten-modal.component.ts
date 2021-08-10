import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbrechnungenRestService } from '@app/core/http/abrechnungen-rest.service';
import { SpinnerService } from 'oblique-reactive';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { DurchfuehrungseinheitDTO } from '@app/shared/models/dtos-generated/durchfuehrungseinheitDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { TranslateService } from '@ngx-translate/core';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { StandortDTO } from '@app/shared/models/dtos-generated/standortDTO';

@Component({
    selector: 'avam-durchfuehrungseinheiten-modal',
    templateUrl: './durchfuehrungseinheiten-modal.component.html'
})
export class DurchfuehrungseinheitenModalComponent implements OnInit, AfterViewInit {
    @Input() abrechnungswert: AbrechnungswertDTO;

    datasource = [];
    formNr = '0320027';
    modalToolboxId = 'abrechnungen-dfe-uebersicht';
    searchChannel: 'durchfuehrungseinheiten-modal';
    durchfuehrungseinheiten: DurchfuehrungseinheitDTO[];
    alertChannel = AlertChannelEnum;
    public modalToolboxConfiguration: ToolboxConfiguration[] = [
        new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
        new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
    ];
    private observeClickActionSub: Subscription;

    constructor(
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private abrechnungenRestService: AbrechnungenRestService,
        private spinnerService: SpinnerService,
        private dbTranslateService: DbTranslateService,
        private translateService: TranslateService,
        private ammHelper: AmmHelper
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
        this.getData();
    }

    getData() {
        this.spinnerService.activate(this.searchChannel);
        this.abrechnungenRestService.getDurchfuehrungseinheiten(this.abrechnungswert, AlertChannelEnum.MODAL).subscribe(
            response => {
                if (response.data) {
                    this.durchfuehrungseinheiten = response.data;
                    this.datasource = this.durchfuehrungseinheiten.map((row: DurchfuehrungseinheitDTO, index) => this.createTableRow(row, index));
                } else {
                    this.datasource = [];
                }

                this.spinnerService.deactivate(this.searchChannel);
            },
            () => {
                this.spinnerService.deactivate(this.searchChannel);
            }
        );
    }

    close() {
        this.modalService.dismissAll();
    }

    private createTableRow(responseDTO: SessionDTO | StandortDTO, index: number) {
        const anbieter = this.ammHelper.concatenateUnternehmensnamen(
            responseDTO.massnahmeObject.ammAnbieterObject.unternehmen.name1,
            responseDTO.massnahmeObject.ammAnbieterObject.unternehmen.name2,
            responseDTO.massnahmeObject.ammAnbieterObject.unternehmen.name3
        );
        let typ = '';
        let status = '';
        if (responseDTO.hasOwnProperty('statusObject')) {
            const session = responseDTO as SessionDTO;
            typ = this.translateService.instant('amm.massnahmen.label.kurs');
            status = this.dbTranslateService.translate(session.statusObject, 'text');
        } else {
            const standort = responseDTO as StandortDTO;
            typ = this.translateService.instant('amm.massnahmen.label.standort');
            if (standort.beschaeftigungseinheiten && standort.beschaeftigungseinheiten.length > 0 && standort.beschaeftigungseinheiten[0].statusObject) {
                status = this.dbTranslateService.translate(standort.beschaeftigungseinheiten[0].statusObject, 'text');
            }
        }
        return {
            id: index,
            nummer: responseDTO.durchfuehrungsId,
            titel: this.dbTranslateService.translateWithOrder(responseDTO, 'titel'),
            typ,
            von: responseDTO.gueltigVon ? new Date(responseDTO.gueltigVon) : '',
            bis: responseDTO.gueltigBis ? new Date(responseDTO.gueltigBis) : '',
            status,
            zulassungsTyp: this.dbTranslateService.translate(responseDTO.massnahmeObject.zulassungstypObject, 'text'),
            anbieter
        };
    }
}
