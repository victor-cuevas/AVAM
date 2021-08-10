import { Injectable } from '@angular/core';
import { OsteHeaderParamDTO } from '@dtos/osteHeaderParamDTO';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { takeUntil } from 'rxjs/operators';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { Unsubscribable } from 'oblique-reactive';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { PlzDTO } from '@dtos/plzDTO';
import { FacadeService } from '@shared/services/facade.service';

@Injectable({
    providedIn: 'root'
})
export class ContentService extends Unsubscribable {
    public unternehmen: UnternehmenDTO;
    private osteHeaderData: { stellenNr: string; jobRoomNr: string };
    private visibility = true;
    private alertVisibility = true;

    constructor(private restService: UnternehmenRestService, private infopanelService: AmmInfopanelService, private facadeService: FacadeService) {
        super();
    }

    public setOsteHeaderData(headerData: OsteHeaderParamDTO) {
        this.osteHeaderData = headerData ? { stellenNr: headerData.stellenNr, jobRoomNr: headerData.egovStellenNr } : null;
    }

    public getOsteHeaderData(): { stellenNr: string; jobRoomNr: string } {
        return this.osteHeaderData;
    }

    public getVisibility(): boolean {
        return this.visibility;
    }

    public setVisibility(value: boolean) {
        this.visibility = value;
    }

    public getAlertVisibility(): boolean {
        return this.alertVisibility;
    }

    public setAlertVisibility(value: boolean) {
        this.alertVisibility = value;
    }

    public getUnternehmen(unternehmenId: string) {
        this.restService
            .getUnternehmenById(unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((unternehmen: UnternehmenDTO) => {
                this.unternehmen = unternehmen;
                const existingValues = this.infopanelService.pullInformation().getValue();
                this.infopanelService.dispatchInformation({
                    ...existingValues,
                    title: this.getName(unternehmen)
                });
            });
    }

    public getStrasseInfo(unternehmen: UnternehmenDTO): string {
        let strasseInfo = '';
        if (unternehmen.strasse) {
            strasseInfo = unternehmen.strasse;
        }
        if (unternehmen.strasseNr) {
            strasseInfo += ` ${unternehmen.strasseNr}`;
        }
        if (unternehmen.plz) {
            return this.addPlzInfo(unternehmen.plz, strasseInfo);
        } else {
            return this.addPlzAuslandInfo(unternehmen, strasseInfo, true);
        }
    }

    public getPostfachInfo(unternehmen: UnternehmenDTO): string {
        let postfachInfo = '';
        if (unternehmen.postfach) {
            postfachInfo = String(unternehmen.postfach);
        }
        if (unternehmen.postfachPlzObject) {
            return this.addPlzInfo(unternehmen.postfachPlzObject, postfachInfo);
        } else {
            return this.addPlzAuslandInfo(unternehmen, postfachInfo, false);
        }
    }

    public getBurnummerInfo(unternehmen: UnternehmenDTO): string | number {
        if (unternehmen.provBurNr && !unternehmen.burOrtEinheitId) {
            return `${unternehmen.provBurNr} (${this.facadeService.dbTranslateService.instant('unternehmen.label.provisorisch')})`;
        } else {
            return unternehmen.burNummer;
        }
    }

    public isPlzAusland(unternehmen: UnternehmenDTO) {
        return !!unternehmen.postfachPostleitortAusland;
    }

    public isPostfachEmpty() {
        return this.unternehmen && this.unternehmen.postfach;
    }

    private addPlzInfo(plzDTO: PlzDTO, info: string): string {
        const plzOrt = this.getPlzUndOrt(plzDTO);
        if (plzOrt) {
            info = info ? `${info}, ${plzOrt}` : plzOrt;
        }
        return info;
    }

    private getPlzUndOrt(plzDTO: PlzDTO): string | undefined {
        return plzDTO ? `${plzDTO.postleitzahl} ${this.facadeService.dbTranslateService.translate(plzDTO, 'ort')}` : undefined;
    }

    private addPlzAuslandInfo(unternehmen: UnternehmenDTO, info: string, isPlz: boolean) {
        const plzOrt = this.getPlzUndOrtAusland(unternehmen, isPlz);
        return info ? `${info}, ${plzOrt}` : plzOrt;
    }

    private getPlzUndOrtAusland(unternehmen: UnternehmenDTO, isPlz: boolean) {
        let plzUndOrtAusland = '';
        if (!!isPlz) {
            plzUndOrtAusland = `${unternehmen.plzAusland} ${unternehmen.ortAusland}`;
        } else if (unternehmen.postfachPlzAusland !== '0' && unternehmen.postfachPostleitortAusland) {
            plzUndOrtAusland = `${unternehmen.postfachPlzAusland} ${unternehmen.postfachPostleitortAusland}`;
        }
        return plzUndOrtAusland;
    }

    private getName(unternehmen: UnternehmenDTO): string {
        return [unternehmen.name1, unternehmen.name2, unternehmen.name3].filter((n: string) => n !== null && n !== undefined && n.length > 0).join(' ');
    }
}
