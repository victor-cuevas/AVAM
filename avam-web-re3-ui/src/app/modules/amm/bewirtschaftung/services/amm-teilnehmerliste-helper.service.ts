import { Injectable, OnDestroy, TemplateRef } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BeschaeftigungseinheitDTO } from '@app/shared/models/dtos-generated/beschaeftigungseinheitDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { StandortDTO } from '@app/shared/models/dtos-generated/standortDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { TeilnehmerlisteExportParamDto } from '@app/shared/models/dtos-generated/teilnehmerlisteExportParamDto';
import { HttpResponseHelper } from '@app/shared/helpers/http-response.helper';
import { HttpResponse } from '@angular/common/http';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FiltersData } from '../components/bew-massnahme-teilnehmerliste-form/bew-massnahme-teilnehmerliste-form.component';
import { FormGroup } from '@angular/forms';

export interface TeilnehmerInfobarData {
    kuerzelMassnahmentyp: string;
    zulassungsTyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
}

@Injectable()
export class AmmTeilnehmerlisteHelperService implements OnDestroy {
    constructor(
        private ammHelper: AmmHelper,
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private bewirtschaftungRestService: BewirtschaftungRestService
    ) {}
    ngOnDestroy() {}

    configureToolbox(channel: string, dokVorlage: DokumentVorlageToolboxData) {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EXCEL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, channel, dokVorlage, true);
    }

    updateSecondLabel(dto: BeschaeftigungseinheitDTO | MassnahmeDTO | StandortDTO | SessionDTO) {
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

    onExcelExport(teilnehmerlisteExportParamDto: TeilnehmerlisteExportParamDto, formGroup: FormGroup, data: FiltersData, channel: string) {
        this.facade.spinnerService.activate(channel);
        const controls = formGroup.controls;

        teilnehmerlisteExportParamDto.zeitraumFilterCode = this.facade.formUtilsService.getCodeByCodeId(data.zeitraumfilterOptions, controls.initialerZeitraumfilterCode.value);
        teilnehmerlisteExportParamDto.zeitraumBis = controls.initialerZeitraumBis.value;
        teilnehmerlisteExportParamDto.zeitraumVon = controls.initialerZeitraumVon.value;

        this.bewirtschaftungRestService.getTeilnehmerExport(teilnehmerlisteExportParamDto).subscribe(
            (res: HttpResponse<any>) => {
                HttpResponseHelper.openBlob(res);

                this.facade.spinnerService.deactivate(channel);
            },
            () => {
                this.facade.spinnerService.deactivate(channel);
            }
        );
    }

    addToInforbar(massnahmeDto: MassnahmeDTO): TeilnehmerInfobarData {
        const infobarData: TeilnehmerInfobarData = {} as TeilnehmerInfobarData;

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
}
