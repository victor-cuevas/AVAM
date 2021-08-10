import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbrechnungswertGrunddatenFormComponent } from '@app/modules/amm/anbieter/components/abrechnungswert-grunddaten-form/abrechnungswert-grunddaten-form.component';
import { FacadeService } from '@app/shared/services/facade.service';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { PlzDTO } from '@app/shared/models/dtos-generated/plzDTO';
import { AbrechnungswertErfassenWizardService } from '@app/shared/components/new/avam-wizard/abrechnungswert-erfassen-wizard.service';
import { Router } from '@angular/router';

@Component({
    selector: 'avam-abrechnungswert-grunddaten-erfassen',
    templateUrl: './abrechnungswert-grunddaten-erfassen.component.html'
})
export class AbrechnungswertGrunddatenErfassenComponent implements OnInit, OnDestroy {
    @ViewChild('abrechnungswertForm') abrechnungswertForm: AbrechnungswertGrunddatenFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    channel = 'abrechnungswert-grunddaten-erfassen';
    formData = null;
    abrechnungswert: AbrechnungswertDTO;
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    vertragswertTypEnum = VertragswertTypCodeEnum;
    toolboxSubscription: Subscription;
    unternehmen = null;

    constructor(
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private anbieterRestService: AnbieterRestService,
        private infopanelService: AmmInfopanelService,
        private wizardService: AbrechnungswertErfassenWizardService,
        private router: Router
    ) {
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
        this.setupWizard();
    }

    ngOnInit() {
        this.getData();
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();
        this.wizardService.grunddatenForm = this.abrechnungswertForm.formGroup;
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        const endpoint = this.wizardService.abrechnungswertId
            ? this.anbieterRestService.getAbrechnungswertParam(this.wizardService.abrechnungswertId)
            : this.anbieterRestService.initAbrechnungswertParam(this.wizardService.vertragswertId);
        forkJoin(this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS), endpoint).subscribe(
            ([yesNoOptions, abrechnungswertResp]) => {
                if (abrechnungswertResp.data) {
                    this.formData = { abrechnungswertParam: abrechnungswertResp.data, yesNoOptions };
                    this.abrechnungswert = abrechnungswertResp.data.abrechnungswert;
                    this.buttons.next(abrechnungswertResp.data.enabledActions);
                    const unternehmenDto = abrechnungswertResp.data.ammAnbieter.unternehmen;
                    this.updateInfopanel(unternehmenDto);
                    this.unternehmen = {
                        strasse: this.getStrasseInfo(unternehmenDto),
                        postfach: this.getPostfachInfo(unternehmenDto),
                        burNr: this.getBurnummerInfo(unternehmenDto),
                        status: this.facade.dbTranslateService.translate(unternehmenDto.statusObject, 'text')
                    };
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => this.deactivateSpinnerAndScrollToTop()
        );
    }

    updateInfopanel(unternehmen: UnternehmenDTO) {
        this.infopanelService.updateInformation({
            title: this.getName(unternehmen),
            subtitle: 'amm.abrechnungen.subnavmenuitem.abrechnungswerterfassengrunddaten',
            hideInfobar: false
        });
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.channel);

        if (!this.abrechnungswertForm.formGroup.value.pruefungDurch) {
            this.abrechnungswertForm.appendCurrentUser();
        }

        if (!this.abrechnungswertForm.formGroup.valid) {
            this.abrechnungswertForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.deactivateSpinnerAndScrollToTop();
        }

        const endpoint = this.wizardService.abrechnungswertId
            ? this.anbieterRestService.updateAbrechnungswert(this.abrechnungswertForm.mapToDTO())
            : this.anbieterRestService.saveAbrechnungswert(this.abrechnungswertForm.mapToDTO());
        endpoint.subscribe(
            response => {
                if (response.data && response.data.abrechnungswert.abrechnungswertId > 0) {
                    this.abrechnungswertForm.formGroup.markAsPristine();
                    this.wizardService.abrechnungswertParam = response.data;
                    this.wizardService.abrechnungswertId = response.data.abrechnungswert.abrechnungswertId;
                    this.wizardService.moveNext();
                }
                this.deactivateSpinnerAndScrollToTop();
            },
            error => this.deactivateSpinnerAndScrollToTop()
        );
    }

    cancel() {
        this.router.navigate([`amm/anbieter/${this.wizardService.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/detail`], {
            queryParams: { vertragswertId: this.wizardService.vertragswertId, lvId: this.wizardService.leistungsvereinbarungId }
        });
    }

    reset() {
        this.abrechnungswertForm.reset();
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.toolboxSubscription.unsubscribe();
    }

    private deactivateSpinnerAndScrollToTop(): void {
        this.facade.spinnerService.deactivate(this.channel);
        OrColumnLayoutUtils.scrollTop();
    }

    private getName(unternehmen: UnternehmenDTO): string {
        return [unternehmen.name1, unternehmen.name2, unternehmen.name3].filter((n: string) => n !== null && n !== undefined && n.length > 0).join(' ');
    }

    private getStrasseInfo(unternehmen: UnternehmenDTO): string {
        let strasseInfo = unternehmen.strasse || '';
        strasseInfo += unternehmen.strasseNr ? ` ${unternehmen.strasseNr}` : '';
        return this.addPlzInfo(unternehmen.plz, strasseInfo);
    }

    private getPostfachInfo(unternehmen: UnternehmenDTO): string {
        const postfachInfo = unternehmen.postfach ? `${unternehmen.postfach}` : '';
        return this.addPlzInfo(unternehmen.postfachPlzObject, postfachInfo);
    }

    private getBurnummerInfo(unternehmen: UnternehmenDTO): string | number {
        if (unternehmen.provBurNr && !unternehmen.burOrtEinheitId) {
            return `${unternehmen.provBurNr} (${this.facade.dbTranslateService.instant('unternehmen.label.provisorisch')})`;
        } else {
            return unternehmen.burNummer;
        }
    }

    private addPlzInfo(plzDTO: PlzDTO, info: string): string {
        const plzOrt = this.getPlzUndOrt(plzDTO);
        if (plzOrt) {
            info = info ? `${info}, ${plzOrt}` : plzOrt;
        }
        return info;
    }

    private getPlzUndOrt(plzDTO: PlzDTO): string | undefined {
        return plzDTO ? `${plzDTO.postleitzahl} ${this.facade.dbTranslateService.translate(plzDTO, 'ort')}` : undefined;
    }

    private setupWizard() {
        const step = new Observable<boolean>(subscriber => {
            subscriber.next(true);
        });
        this.wizardService.setOnNextStep(step);
        this.wizardService.isWizardNext = false;
        this.wizardService.panelTemplate = this.panelTemplate;
    }
}
