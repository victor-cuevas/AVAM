import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { PlzDTO } from '@dtos/plzDTO';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { Component, OnDestroy, AfterViewInit, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { Subscription, Observable, forkJoin, iif } from 'rxjs';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FacadeService } from '@shared/services/facade.service';
import { VertragswertDetailFormComponent, VertragswertDetailData } from '@app/modules/amm/anbieter/components/vertragswert-detail-form/vertragswert-detail-form.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { VertragswertErfassenWizardService } from '@shared/components/new/avam-wizard/vertragswert-erfassen-wizard.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { Router } from '@angular/router';
import { VertragswertDTO } from '@dtos/vertragswertDTO';

@Component({
    selector: 'avam-vertragswert-detail',
    templateUrl: './vertragswert-detail.component.html'
})
export class VertragswertDetailErfassenComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('detailFormComponent') detailFormComponent: VertragswertDetailFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    vertragswertDetailData: VertragswertDetailData;
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
    hasDetailState: boolean;

    constructor(
        public wizardService: VertragswertErfassenWizardService,
        private infopanelService: AmmInfopanelService,
        private facade: FacadeService,
        private vertraegeRestService: VertraegeRestService,
        private stesDataRestService: StesDataRestService,
        private router: Router
    ) {}

    ngOnInit() {
        const step = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            this.wizardService.detailDtoState = this.detailFormComponent.mapToDTO();
            this.wizardService.detailUsedTreeTableItem = this.wizardService.selectedTreeTableItem;
            this.wizardService.detailUsedPlanwert = this.wizardService.selectedPlanwert;
            subscriber.next(true);
        });

        this.wizardService.setOnPreviousStep(step);
    }

    ngAfterViewInit() {
        this.getData();
        this.configureToolbox();
        this.initInfopanel();
        this.appendToInforbar();
        this.wizardService.isWizardNext = false;

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.initInfopanel();
            this.appendToInforbar();
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        const getWithPlanwert = this.vertraegeRestService.getVertragswertDetail(
            this.wizardService.leistungsvereinbarungId,
            this.wizardService.selectedTreeTableItem.voClass,
            this.wizardService.selectedTreeTableItem.voId,
            this.wizardService.selectedPlanwert
        );
        const getNoPlanwert = this.vertraegeRestService.getVertragswertDetailNoPlanwert(
            this.wizardService.leistungsvereinbarungId,
            this.wizardService.selectedTreeTableItem.voClass,
            this.wizardService.selectedTreeTableItem.voId
        );

        forkJoin([
            //NOSONAR
            iif(() => (this.wizardService.selectedPlanwert ? true : false), getWithPlanwert, getNoPlanwert),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.PREISMODELLTYP),
            this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS)
        ]).subscribe(
            ([detailResponse, preismodellTypOptionsResponse, yesNoOptionsResponse]) => {
                this.vertragswertDetailData = {
                    vertragswertDto: this.setVertragswertDtoState(detailResponse.data),
                    preismodellTypOptions: preismodellTypOptionsResponse,
                    yesNoOptions: yesNoOptionsResponse,
                    planwertUebernommen: !!this.wizardService.selectedPlanwert,
                    selectedTreeTableItem: this.wizardService.selectedTreeTableItem,
                    hasDetailState: this.hasDetailState
                };

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            }
        );
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.detailFormComponent.formGroup.invalid) {
            this.detailFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.finish();
    }

    finish() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        this.vertraegeRestService.saveVertragswert(this.detailFormComponent.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.wizardService.displayLeaveConfirmation = false;
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));

                    this.router.navigate([`amm/anbieter/${this.wizardService.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/detail`], {
                        queryParams: { vertragswertId: response.data.vertragswertId, lvId: response.data.leistungsvereinbarungObject.leistungsvereinbarungId }
                    });
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
            }
        );
    }

    calculate() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.detailFormComponent.formGroup.invalid) {
            this.detailFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.facade.spinnerService.activate(this.wizardService.channel);

        this.vertraegeRestService.berechnenVertragswertDetail(this.detailFormComponent.mapToDTO()).subscribe(
            berechnenResponse => {
                if (berechnenResponse.data) {
                    this.vertragswertDetailData = { ...this.vertragswertDetailData, vertragswertDto: berechnenResponse.data, onBerechnen: true };
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('amm.planundakqui.message.berechnet'));
                    this.detailFormComponent.formGroup.markAsPristine();
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            }
        );
    }

    back() {
        if (this.wizardService.selectedPlanwert) {
            this.wizardService.movePrev();
        } else {
            this.wizardService.movePosition(0);
        }
    }

    cancel() {
        this.facade.fehlermeldungenService.closeMessage();

        this.router.navigate([`/amm/anbieter/${this.wizardService.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
            queryParams: { lvId: this.wizardService.leistungsvereinbarungId }
        });
    }

    ngOnDestroy(): void {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.observeClickActionSub.unsubscribe();

        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.wizardService.channel);

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    private initInfopanel() {
        const erfassenLabel = this.facade.translateService.instant('amm.akquisition.button.vertragswerterfassen');
        const stepTitel = this.facade.translateService.instant('amm.akquisition.subnavmenuitem.detail');

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

    private setVertragswertDtoState(vertragswertDto: VertragswertDTO) {
        if (
            this.wizardService.detailDtoState &&
            this.wizardService.detailUsedTreeTableItem.voId === this.wizardService.selectedTreeTableItem.voId &&
            !this.wizardService.selectedPlanwert &&
            !this.wizardService.detailUsedPlanwert
        ) {
            this.hasDetailState = true;
            return this.wizardService.detailDtoState;
        }

        if (
            this.wizardService.detailDtoState &&
            this.wizardService.selectedPlanwert &&
            this.wizardService.detailUsedPlanwert &&
            this.wizardService.detailUsedPlanwert.planwertId === this.wizardService.selectedPlanwert.planwertId
        ) {
            this.hasDetailState = true;
            return this.wizardService.detailDtoState;
        }

        this.hasDetailState = false;
        return vertragswertDto;
    }
}
