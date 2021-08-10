import { PlzDTO } from '@dtos/plzDTO';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { FacadeService } from '@shared/services/facade.service';
import { Component, AfterViewInit, OnDestroy, ViewChild, TemplateRef, OnInit, ElementRef } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { VertragswertErfassenWizardService } from '@app/shared/components/new/avam-wizard/vertragswert-erfassen-wizard.service';
import { PlanwertDTO } from '@app/shared/models/dtos-generated/planwertDTO';
import { Router } from '@angular/router';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';

@Component({
    selector: 'avam-planwert-auswaehlen',
    templateUrl: './planwert-auswaehlen.component.html'
})
export class PlanwertAuswaehlenErfassenComponent implements AfterViewInit, OnDestroy, OnInit {
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    langSubscription: Subscription;
    observeClickActionSub: Subscription;
    titel: string;
    voLabel: string;
    selectedTreeTableItemNr: number;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmenStatus: string;
    lvStatus: string;
    address: string;
    strasseInfo: string;
    postfachInfo: string | number;

    constructor(public wizardService: VertragswertErfassenWizardService, private infopanelService: AmmInfopanelService, private facade: FacadeService, private router: Router) {}

    ngOnInit() {
        const step = new Observable<boolean>(subscriber => {
            subscriber.next(true);
        });
        const previousStep = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            subscriber.next(true);
        });

        this.wizardService.setOnNextStep(step);
        this.wizardService.setOnPreviousStep(previousStep);
    }

    ngAfterViewInit() {
        this.initInfopanel();
        this.configureToolbox();
        this.appendToInforbar();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.initInfopanel();
            this.appendToInforbar();
        });
    }

    moveNext(planwert: PlanwertDTO) {
        this.facade.fehlermeldungenService.closeMessage();

        this.wizardService.selectedPlanwert = planwert;
        this.wizardService.moveNext();
    }

    cancel() {
        this.router.navigate([`/amm/anbieter/${this.wizardService.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
            queryParams: { lvId: this.wizardService.leistungsvereinbarungId }
        });
    }

    ngOnDestroy(): void {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.langSubscription.unsubscribe();
        this.observeClickActionSub.unsubscribe();
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.wizardService.channel);

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.wizardService.planwertTableData);
            }
        });
    }

    private initInfopanel() {
        const erfassenLabel = this.facade.translateService.instant('amm.akquisition.button.vertragswerterfassen');
        const stepTitel = this.facade.translateService.instant('amm.akquisition.subnavmenuitem.planwertauswaehlen');

        this.infopanelService.updateInformation({
            subtitle: `${erfassenLabel} - ${stepTitel}`
        });
    }

    private appendToInforbar() {
        const unternehmenDto = this.wizardService.leistungsvereinbarungDTO.anbieterObject.unternehmen;

        this.selectedTreeTableItemNr = this.wizardService.selectedTreeTableItem.voId;
        this.titel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.selectedTreeTableItem, 'titel');
        this.voLabel = this.wizardService.selectedTreeTableItem.voClass.endsWith('Massnahme') ? 'amm.massnahmen.label.massnahmennr' : 'amm.massnahmen.label.durchfuehrungsnr';
        this.provBurNr = unternehmenDto.provBurNr;
        this.burNrToDisplay = this.provBurNr ? this.provBurNr : unternehmenDto.burNummer;
        this.unternehmenStatus = this.facade.dbTranslateService.translate(unternehmenDto.statusObject, 'text');
        this.lvStatus = this.facade.dbTranslateService.translate(this.wizardService.leistungsvereinbarungDTO.statusObject, 'text');
        this.strasseInfo = this.getStrasseInfo(unternehmenDto);
        this.postfachInfo = this.getPostfachInfo(unternehmenDto);

        this.infopanelService.appendToInforbar(this.infobarTemplate);
    }

    private getStrasseInfo(unternehmen: UnternehmenDTO): string {
        let strasseInfo: string;
        if (unternehmen.strasse) {
            strasseInfo = unternehmen.strasse;
        }
        if (unternehmen.strasseNr) {
            strasseInfo += ` ${unternehmen.strasseNr}`;
        }
        const plzOrt = this.getPlzOrt(unternehmen.plz);
        if (plzOrt) {
            strasseInfo = strasseInfo ? `${strasseInfo}, ${plzOrt}` : plzOrt;
        }
        return strasseInfo;
    }

    private getPostfachInfo(unternehmen: UnternehmenDTO): string | number {
        let postfachInfo: string | number;
        if (unternehmen.postfach) {
            postfachInfo = unternehmen.postfach;
        }
        const plzOrt = this.getPlzOrt(unternehmen.plz);
        if (plzOrt) {
            postfachInfo = postfachInfo ? `${postfachInfo}, ${plzOrt}` : plzOrt;
        }
        return postfachInfo;
    }

    private getPlzOrt(plz: PlzDTO) {
        return plz ? `${plz.postleitzahl} ${this.facade.dbTranslateService.translate(plz, 'ort')}` : null;
    }
}
