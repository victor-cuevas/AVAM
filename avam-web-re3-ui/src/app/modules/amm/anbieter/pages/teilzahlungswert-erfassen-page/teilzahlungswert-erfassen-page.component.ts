import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { FacadeService } from '@app/shared/services/facade.service';
import { TeilzahlungswertService } from '@app/shared/services/teilzahlungswert.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TeilzahlungswertData, TeilzahlungswertFormComponent } from '../../components/teilzahlungswert-form/teilzahlungswert-form.component';

@Component({
    selector: 'avam-teilzahlungswert-erfassen-page',
    templateUrl: './teilzahlungswert-erfassen-page.component.html',
    styleUrls: ['./teilzahlungswert-erfassen-page.component.scss']
})
export class TeilzahlungswertErfassenPageComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('teilzahlungswertForm') teilzahlungswertForm: TeilzahlungswertFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    unternehmenId: number;
    lvId: number;
    vertragswertId: number;
    channel = 'teilzahlungswert-erfassen-channel';
    teilzahlungswertData: TeilzahlungswertData;
    vertragswertTypEnum = VertragswertTypCodeEnum;
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;

    constructor(
        private router: Router,
        private facade: FacadeService,
        private route: ActivatedRoute,
        private vertraegeRestService: VertraegeRestService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private teilzahlungswertService: TeilzahlungswertService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteData();
        this.getData();
        this.facade.navigationService.showNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/erfassen', {
            lvId: this.lvId,
            vertragswertId: this.vertragswertId
        });
        this.subscribeToToolbox();
        this.configureToolbox();
    }

    getRouteData() {
        this.route.parent.parent.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(res => {
            this.unternehmenId = +res.unternehmenId;
        });

        this.route.parent.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(res => {
            this.vertragswertId = +res.vertragswertId;
            this.lvId = +res.lvId;
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin(this.vertraegeRestService.getNewTeilzahlungswert(this.vertragswertId), this.stesDataRestService.getFixedCode(DomainEnum.YES_NO_OPTIONS)).subscribe(
            ([teilzahlungswertDto, yesNoOptions]) => {
                this.teilzahlungswertData = { teilzahlungswertParam: teilzahlungswertDto.data, dropdownOptions: yesNoOptions };
                this.buttons.next(teilzahlungswertDto.data.enabledActions);
                this.updateInfopanel();

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    updateInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.button.teilzahlungswerterfassen',
            hideInfobar: false
        });
        this.infopanelService.appendToInforbar(this.panelTemplate);
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
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

    cancel() {
        this.router.navigate([`amm/anbieter/${this.unternehmenId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte`], {
            queryParams: { lvId: this.lvId, vertragswertId: this.vertragswertId }
        });
    }

    reset() {
        this.teilzahlungswertForm.reset();
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.teilzahlungswertForm.formGroup.invalid) {
            this.teilzahlungswertForm.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.facade.spinnerService.activate(this.channel);

        this.vertraegeRestService.saveTeilzahlungswert(this.teilzahlungswertForm.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.teilzahlungswertForm.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.teilzahlungswertService.setNavigateToUebersicht(true);

                    if (response.data.teilzahlungswert) {
                        this.router.navigate(
                            [`/amm/anbieter/${this.unternehmenId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/teilzahlungswert`],
                            {
                                queryParams: {
                                    lvId: this.lvId,
                                    vertragswertId: response.data.teilzahlungswert.vertragswertObject.vertragswertId,
                                    teilzahlungswertId: response.data.teilzahlungswert.teilzahlungswertId
                                }
                            }
                        );
                    }
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/erfassen');
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.panelTemplate);
    }
}
