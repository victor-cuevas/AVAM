import { ElementRef, Injectable } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { StandortDTO } from '@app/shared/models/dtos-generated/standortDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';

export interface VertragswerteUebersichtInfobarData {
    kuerzelMassnahmentyp: string;
    zulassungsTyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
}

@Injectable()
export class BewVertragswerteUebersichtHelperService {
    constructor(
        private ammHelper: AmmHelper,
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private modalService: NgbModal,
        private router: Router,
        private vertraegeRestService: VertraegeRestService
    ) {}

    configureToolbox(channel: string, dokVorlage: DokumentVorlageToolboxData) {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, channel, dokVorlage, true);
    }

    subscribeToToolbox(channel: string, modalPrint: ElementRef): Subscription {
        return this.facade.toolboxService.observeClickAction(channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.modalService.open(modalPrint, { ariaLabelledBy: 'zahlstelle-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
            }
        });
    }

    updateSecondLabel(dto: MassnahmeDTO | StandortDTO | SessionDTO) {
        if (dto) {
            this.infopanelService.updateInformation({
                secondTitle: this.facade.dbTranslateService.translateWithOrder(dto, 'titel')
            });
        }
    }

    getKuerzelMassnahmentyp(massnahmeDto: MassnahmeDTO): string {
        const kuerzel = massnahmeDto && massnahmeDto.produktObject.elementkategorieAmtObject ? massnahmeDto.produktObject.elementkategorieAmtObject.organisation : '';
        const massnahmentyp =
            massnahmeDto && massnahmeDto.produktObject.strukturelementGesetzObject
                ? this.facade.dbTranslateService.translate(massnahmeDto.produktObject.strukturelementGesetzObject, 'elementName')
                : '';

        return kuerzel && massnahmentyp ? `${kuerzel} - ${massnahmentyp}` : kuerzel ? kuerzel : massnahmentyp ? massnahmentyp : '';
    }

    addToInforbar(massnahmeDto: MassnahmeDTO): VertragswerteUebersichtInfobarData {
        const infobarData: VertragswerteUebersichtInfobarData = {} as VertragswerteUebersichtInfobarData;

        if (massnahmeDto) {
            infobarData.kuerzelMassnahmentyp = this.getKuerzelMassnahmentyp(massnahmeDto);
            infobarData.zulassungsTyp = this.facade.dbTranslateService.translateWithOrder(massnahmeDto.zulassungstypObject, 'kurzText');
            infobarData.provBurNr = massnahmeDto.ammAnbieterObject.unternehmen.provBurNr;
            infobarData.burNrToDisplay = infobarData.provBurNr ? infobarData.provBurNr : massnahmeDto.ammAnbieterObject.unternehmen.burNummer;
            infobarData.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
                massnahmeDto.ammAnbieterObject.unternehmen.name1,
                massnahmeDto.ammAnbieterObject.unternehmen.name2,
                massnahmeDto.ammAnbieterObject.unternehmen.name3
            );
            infobarData.unternehmenStatus = this.facade.dbTranslateService.translate(massnahmeDto.ammAnbieterObject.unternehmen.statusObject, 'text');
        }

        return infobarData;
    }

    onVwRowSelected(event: any, anbieterId: number, channel: string) {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(channel);
        if (event.leistungsvereinbarungId) {
            this.navigateToVw(anbieterId, event.vertragswertId, event.leistungsvereinbarungId);
        } else {
            this.vertraegeRestService.getVertragswertDetailByIdWithoutRef(event.vertragswertId).subscribe(
                res => {
                    const vw = res.data;
                    if (vw) {
                        this.facade.spinnerService.deactivate(channel);
                        this.navigateToVw(anbieterId, event.vertragswertId, vw.leistungsvereinbarungObject.leistungsvereinbarungId);
                    }
                },
                () => {
                    this.facade.spinnerService.activate(channel);
                }
            );
        }
    }

    private navigateToVw(anbieterId: number, vertragswertId: number, lvId: number) {
        this.router.navigate([`/amm/anbieter/${anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/detail`], {
            queryParams: { vertragswertId, lvId }
        });
    }
}
